"use client";

import { useState, useTransition, useMemo } from "react";
import {
  UserPlus,
  Shield,
  Trash2,
  CheckCircle2,
  XCircle,
  Search,
  X,
  Sliders,
  Check,
  RotateCcw,
  Users,
  UserCheck,
  Key,
  Eye,
  EyeOff,
} from "lucide-react";
import { ROLE_LABELS, type Role } from "@/lib/roles";
import {
  FEATURE_GROUPS,
  DEFAULT_ROLE_CAPABILITIES,
  ALL_CAPABILITY_IDS,
} from "@/lib/permissions-config";
import {
  createUser,
  updateUser,
  deleteUser,
  toggleUserActive,
  updateUserPassword,
} from "./actions";

export type UserItem = {
  id: string;
  email: string;
  fullName: string;
  role: string;
  active: boolean;
  visiblePassword?: string | null;
  lastPasswordChange?: string | null;
  customPermissions: string[];
  createdAt: string;
};

export function UsersView({
  initialUsers,
  currentUserId,
  currentUserRole,
}: {
  initialUsers: UserItem[];
  currentUserId: string;
  currentUserRole: string;
}) {
  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isPending, startTransition] = useTransition();

  const isPrivileged =
    currentUserRole === "PDG" ||
    currentUserRole === "SG" ||
    currentUserRole === "DG" ||
    currentUserRole === "ADMIN";

  // Password Management State (DG / Admin)
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  const [pwdModalUser, setPwdModalUser] = useState<UserItem | null>(null);
  const [newPwdValue, setNewPwdValue] = useState("");
  const [showPwdValue, setShowPwdValue] = useState(false);
  const [pwdSuccess, setPwdSuccess] = useState<string | null>(null);
  const [pwdError, setPwdError] = useState<string | null>(null);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);

  // Add User Form State
  const [newFullName, setNewFullName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<Role>("COMMERCIAL");
  const [newPermissions, setNewPermissions] = useState<string[]>(
    DEFAULT_ROLE_CAPABILITIES["COMMERCIAL"] || []
  );

  // Edit User Form State
  const [editFullName, setEditFullName] = useState("");
  const [editRole, setEditRole] = useState<Role>("COMMERCIAL");
  const [editPermissions, setEditPermissions] = useState<string[]>([]);

  // When opening add modal, reset form
  const handleOpenAddModal = () => {
    setNewFullName("");
    setNewEmail("");
    setNewPassword("Carzone2026!");
    setNewRole("COMMERCIAL");
    setNewPermissions([...(DEFAULT_ROLE_CAPABILITIES["COMMERCIAL"] || [])]);
    setShowAddModal(true);
  };

  // When changing role in Add modal, auto-update permissions to that role's defaults
  const handleNewRoleChange = (role: Role) => {
    setNewRole(role);
    setNewPermissions([...(DEFAULT_ROLE_CAPABILITIES[role] || [])]);
  };

  // When opening edit modal for a user
  const handleOpenEditModal = (user: UserItem) => {
    setEditingUser(user);
    setEditFullName(user.fullName);
    const r = (user.role as Role) || "COMMERCIAL";
    setEditRole(r);
    // If user has custom permissions saved, use them; otherwise default to role's defaults
    if (user.customPermissions && user.customPermissions.length > 0) {
      setEditPermissions([...user.customPermissions]);
    } else {
      setEditPermissions([...(DEFAULT_ROLE_CAPABILITIES[r] || [])]);
    }
  };

  // When changing role in Edit modal
  const handleEditRoleChange = (newR: Role) => {
    setEditRole(newR);
    if (
      confirm(
        `Voulez-vous aussi réinitialiser les capacités avec les valeurs par défaut du rôle ${ROLE_LABELS[newR]} ?`
      )
    ) {
      setEditPermissions([...(DEFAULT_ROLE_CAPABILITIES[newR] || [])]);
    }
  };

  // Toggle single capability
  const togglePermission = (
    permId: string,
    currentList: string[],
    setList: (val: string[]) => void
  ) => {
    if (currentList.includes(permId)) {
      setList(currentList.filter((p) => p !== permId));
    } else {
      setList([...currentList, permId]);
    }
  };

  // Toggle all capabilities in a feature group
  const toggleFeatureGroup = (
    featureId: string,
    currentList: string[],
    setList: (val: string[]) => void
  ) => {
    const group = FEATURE_GROUPS.find((g) => g.id === featureId);
    if (!group) return;
    const groupPermIds = group.capabilities.map((c) => c.id);
    const allChecked = groupPermIds.every((id) => currentList.includes(id));

    if (allChecked) {
      // Uncheck all in group
      setList(currentList.filter((id) => !groupPermIds.includes(id)));
    } else {
      // Check all in group
      const next = Array.from(new Set([...currentList, ...groupPermIds]));
      setList(next);
    }
  };

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const match =
          u.fullName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (ROLE_LABELS[u.role as Role] || u.role).toLowerCase().includes(q);
        if (!match) return false;
      }
      if (roleFilter !== "ALL" && u.role !== roleFilter) return false;
      if (statusFilter === "ACTIVE" && !u.active) return false;
      if (statusFilter === "INACTIVE" && u.active) return false;
      return true;
    });
  }, [users, search, roleFilter, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.active).length;
    const customized = users.filter(
      (u) => u.customPermissions && u.customPermissions.length > 0
    ).length;
    const rolesCount = new Set(users.map((u) => u.role)).size;
    return { total, active, customized, rolesCount };
  }, [users]);

  // Submit Create User
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName.trim() || !newEmail.trim()) {
      alert("Veuillez renseigner le nom complet et l'adresse email.");
      return;
    }

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.set("fullName", newFullName.trim());
        formData.set("email", newEmail.trim());
        formData.set("role", newRole);
        formData.set("password", newPassword.trim() || "Carzone2026!");
        formData.set("permissions", JSON.stringify(newPermissions));

        await createUser(formData);
        setShowAddModal(false);
        window.location.reload();
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : "Erreur lors de la création.");
      }
    });
  };

  // Submit Edit User
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.set("id", editingUser.id);
        formData.set("fullName", editFullName.trim());
        formData.set("role", editRole);
        formData.set("permissions", JSON.stringify(editPermissions));

        await updateUser(formData);

        setUsers((prev) =>
          prev.map((u) =>
            u.id === editingUser.id
              ? {
                  ...u,
                  fullName: editFullName.trim(),
                  role: editRole,
                  customPermissions: editPermissions,
                }
              : u
          )
        );

        setEditingUser(null);
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : "Erreur lors de la modification.");
      }
    });
  };

  // Reset capabilities to role default
  const handleResetToRoleDefault = (
    role: Role,
    setList: (val: string[]) => void
  ) => {
    const defaults = DEFAULT_ROLE_CAPABILITIES[role] || [];
    setList([...defaults]);
  };

  // Toggle user active
  const handleToggle = (id: string, active: boolean) => {
    startTransition(async () => {
      try {
        await toggleUserActive(id, !active);
        setUsers((prev) =>
          prev.map((u) => (u.id === id ? { ...u, active: !active } : u))
        );
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : "Erreur statut");
      }
    });
  };

  // Delete user
  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Confirmer la suppression définitive de l'utilisateur ${name} ?`))
      return;
    startTransition(async () => {
      try {
        await deleteUser(id);
        setUsers((prev) => prev.filter((u) => u.id !== id));
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : "Erreur suppression");
      }
    });
  };

  // Open password modification modal (DG / Admin)
  const handleOpenPwdModal = (user: UserItem) => {
    setPwdModalUser(user);
    setNewPwdValue("");
    setShowPwdValue(false);
    setPwdSuccess(null);
    setPwdError(null);
  };

  // Submit password change
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwdModalUser || !newPwdValue.trim()) return;

    if (newPwdValue.trim().length < 4) {
      setPwdError("Le mot de passe doit comporter au moins 4 caractères.");
      return;
    }

    setPwdError(null);
    startTransition(async () => {
      try {
        const cleanPwd = newPwdValue.trim();
        await updateUserPassword(pwdModalUser.id, cleanPwd);

        setUsers((prev) =>
          prev.map((u) =>
            u.id === pwdModalUser.id
              ? {
                  ...u,
                  visiblePassword: cleanPwd,
                  lastPasswordChange: new Date().toISOString(),
                }
              : u
          )
        );

        setPwdSuccess(`Mot de passe de ${pwdModalUser.fullName} mis à jour avec succès ! Notification envoyée.`);
        setTimeout(() => {
          setPwdModalUser(null);
          setPwdSuccess(null);
        }, 1500);
      } catch (err: unknown) {
        setPwdError(err instanceof Error ? err.message : "Erreur mise à jour mot de passe");
      }
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Top Header Card */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
          background: "var(--ice-card-bg, rgba(255, 255, 255, 0.03))",
          border: "1px solid var(--ice-border, rgba(255, 255, 255, 0.1))",
          borderRadius: 16,
          padding: "22px 26px",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                display: "inline-flex",
                padding: "8px",
                borderRadius: "10px",
                background: "rgba(212, 175, 55, 0.15)",
                color: "var(--gold, #d4af37)",
              }}
            >
              <Users size={24} />
            </span>
            <h1
              style={{
                margin: 0,
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "var(--ice-text)",
              }}
            >
              Flotte des Utilisateurs & Rôles
            </h1>
            <span
              style={{
                fontSize: "0.75rem",
                padding: "2px 8px",
                borderRadius: 6,
                background: "rgba(212, 175, 55, 0.15)",
                color: "var(--gold, #d4af37)",
                fontWeight: 600,
              }}
            >
              {currentUserRole}
            </span>
          </div>
          <p
            style={{
              margin: "6px 0 0 0",
              opacity: 0.75,
              fontSize: "0.875rem",
              maxWidth: 720,
            }}
          >
            Contrôle en temps réel des accès de l&apos;entreprise : créez de
            nouveaux utilisateurs, assignez leurs rôles hiérarchiques et cochez
            précisément leurs capacités par fonctionnalité.
          </p>
        </div>

        {/* Primary Action Button */}
        <button
          onClick={handleOpenAddModal}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 18px",
            borderRadius: 10,
            border: "1px solid rgba(212, 175, 55, 0.5)",
            background:
              "linear-gradient(135deg, rgba(212, 175, 55, 0.25), rgba(180, 140, 30, 0.35))",
            color: "var(--gold, #d4af37)",
            fontWeight: 700,
            fontSize: "0.9rem",
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(212, 175, 55, 0.18)",
            transition: "all 0.2s ease",
          }}
        >
          <UserPlus size={18} />
          Nouvel Utilisateur
        </button>
      </div>

      {/* KPI Stats Bar */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 14,
        }}
      >
        <div
          style={{
            background: "var(--ice-card-bg, rgba(255, 255, 255, 0.03))",
            border: "1px solid var(--ice-border, rgba(255, 255, 255, 0.1))",
            borderRadius: 12,
            padding: "16px 18px",
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              padding: 10,
              borderRadius: 10,
              background: "rgba(59, 130, 246, 0.15)",
              color: "#60a5fa",
            }}
          >
            <Users size={22} />
          </div>
          <div>
            <div style={{ fontSize: "1.4rem", fontWeight: 750, color: "var(--ice-text)" }}>
              {stats.total}
            </div>
            <div style={{ fontSize: "0.8rem", opacity: 0.7 }}>Total Utilisateurs</div>
          </div>
        </div>

        <div
          style={{
            background: "var(--ice-card-bg, rgba(255, 255, 255, 0.03))",
            border: "1px solid var(--ice-border, rgba(255, 255, 255, 0.1))",
            borderRadius: 12,
            padding: "16px 18px",
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              padding: 10,
              borderRadius: 10,
              background: "rgba(34, 197, 94, 0.15)",
              color: "#4ade80",
            }}
          >
            <UserCheck size={22} />
          </div>
          <div>
            <div style={{ fontSize: "1.4rem", fontWeight: 750, color: "var(--ice-text)" }}>
              {stats.active}
            </div>
            <div style={{ fontSize: "0.8rem", opacity: 0.7 }}>Comptes Actifs</div>
          </div>
        </div>

        <div
          style={{
            background: "var(--ice-card-bg, rgba(255, 255, 255, 0.03))",
            border: "1px solid var(--ice-border, rgba(255, 255, 255, 0.1))",
            borderRadius: 12,
            padding: "16px 18px",
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              padding: 10,
              borderRadius: 10,
              background: "rgba(168, 85, 247, 0.15)",
              color: "#c084fc",
            }}
          >
            <Shield size={22} />
          </div>
          <div>
            <div style={{ fontSize: "1.4rem", fontWeight: 750, color: "var(--ice-text)" }}>
              {stats.rolesCount}
            </div>
            <div style={{ fontSize: "0.8rem", opacity: 0.7 }}>Rôles Distincts</div>
          </div>
        </div>

        <div
          style={{
            background: "var(--ice-card-bg, rgba(255, 255, 255, 0.03))",
            border: "1px solid var(--ice-border, rgba(255, 255, 255, 0.1))",
            borderRadius: 12,
            padding: "16px 18px",
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              padding: 10,
              borderRadius: 10,
              background: "rgba(212, 175, 55, 0.15)",
              color: "var(--gold, #d4af37)",
            }}
          >
            <Sliders size={22} />
          </div>
          <div>
            <div style={{ fontSize: "1.4rem", fontWeight: 750, color: "var(--ice-text)" }}>
              {stats.customized}
            </div>
            <div style={{ fontSize: "0.8rem", opacity: 0.7 }}>Profils Personnalisés</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "center",
          background: "var(--ice-card-bg, rgba(255, 255, 255, 0.03))",
          border: "1px solid var(--ice-border, rgba(255, 255, 255, 0.1))",
          borderRadius: 12,
          padding: "12px 16px",
        }}
      >
        {/* Search */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flex: "1 1 240px",
            background: "rgba(0, 0, 0, 0.15)",
            border: "1px solid var(--ice-border, rgba(255, 255, 255, 0.15))",
            borderRadius: 8,
            padding: "8px 12px",
          }}
        >
          <Search size={16} opacity={0.6} />
          <input
            type="text"
            placeholder="Rechercher par nom, email, rôle..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--ice-text)",
              outline: "none",
              fontSize: "0.875rem",
              width: "100%",
            }}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              style={{
                background: "none",
                border: "none",
                color: "inherit",
                cursor: "pointer",
                opacity: 0.6,
                padding: 0,
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Role Filter */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <label style={{ fontSize: "0.8rem", opacity: 0.7 }}>Rôle :</label>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{
              padding: "7px 12px",
              borderRadius: 8,
              border: "1px solid var(--ice-border, rgba(255, 255, 255, 0.15))",
              background: "var(--ice-card-bg, #1a1e24)",
              color: "var(--ice-text)",
              fontSize: "0.85rem",
              cursor: "pointer",
            }}
          >
            <option value="ALL">Tous les rôles</option>
            {Object.entries(ROLE_LABELS).map(([k, label]) => (
              <option key={k} value={k}>
                {label} ({k})
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <label style={{ fontSize: "0.8rem", opacity: 0.7 }}>Statut :</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: "7px 12px",
              borderRadius: 8,
              border: "1px solid var(--ice-border, rgba(255, 255, 255, 0.15))",
              background: "var(--ice-card-bg, #1a1e24)",
              color: "var(--ice-text)",
              fontSize: "0.85rem",
              cursor: "pointer",
            }}
          >
            <option value="ALL">Tous les statuts</option>
            <option value="ACTIVE">Comptes Actifs</option>
            <option value="INACTIVE">Comptes Inactifs</option>
          </select>
        </div>

        <div style={{ marginLeft: "auto", fontSize: "0.8rem", opacity: 0.65 }}>
          {filteredUsers.length} résultat{filteredUsers.length > 1 ? "s" : ""}
        </div>
      </div>

      {/* Users Fleet Table */}
      <div
        style={{
          background: "var(--ice-card-bg, rgba(255, 255, 255, 0.03))",
          border: "1px solid var(--ice-border, rgba(255, 255, 255, 0.1))",
          borderRadius: 14,
          overflow: "hidden",
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "left",
              fontSize: "0.875rem",
            }}
          >
            <thead>
              <tr
                style={{
                  background: "rgba(255, 255, 255, 0.04)",
                  borderBottom: "1px solid var(--ice-border, rgba(255, 255, 255, 0.12))",
                  color: "var(--ice-text)",
                  fontSize: "0.78rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                <th style={{ padding: "14px 18px" }}>Utilisateur & Email</th>
                <th style={{ padding: "14px 18px" }}>Rôle Attribué</th>
                <th style={{ padding: "14px 18px" }}>Capacités & Permissions</th>
                {isPrivileged && (
                  <th style={{ padding: "14px 18px" }}>🔑 Mot de Passe (Accès DG/Admin)</th>
                )}
                <th style={{ padding: "14px 18px", textAlign: "center" }}>Statut</th>
                <th style={{ padding: "14px 18px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => {
                const isSelf = u.id === currentUserId;
                const roleLabel = ROLE_LABELS[u.role as Role] || u.role;
                const hasCustom =
                  u.customPermissions && u.customPermissions.length > 0;
                const countPerms = hasCustom
                  ? u.customPermissions.length
                  : (DEFAULT_ROLE_CAPABILITIES[u.role as Role] || []).length;

                return (
                  <tr
                    key={u.id}
                    style={{
                      borderBottom: "1px solid var(--ice-border, rgba(255, 255, 255, 0.06))",
                      transition: "background 0.15s ease",
                    }}
                  >
                    {/* User & Email */}
                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(180, 140, 30, 0.3))",
                            color: "var(--gold, #d4af37)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                            fontSize: "0.95rem",
                            border: "1px solid rgba(212, 175, 55, 0.3)",
                          }}
                        >
                          {u.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 650, color: "var(--ice-text)" }}>
                            {u.fullName} {isSelf && <span style={{ opacity: 0.6, fontSize: "0.75rem" }}>(Vous)</span>}
                          </div>
                          <div style={{ fontSize: "0.8rem", opacity: 0.65 }}>
                            {u.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td style={{ padding: "14px 18px" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "4px 10px",
                          borderRadius: 6,
                          background:
                            u.role === "PDG" || u.role === "SG" || u.role === "DG"
                              ? "rgba(212, 175, 55, 0.18)"
                              : "rgba(59, 130, 246, 0.12)",
                          color:
                            u.role === "PDG" || u.role === "SG" || u.role === "DG"
                              ? "var(--gold, #d4af37)"
                              : "#60a5fa",
                          border:
                            u.role === "PDG" || u.role === "SG" || u.role === "DG"
                              ? "1px solid rgba(212, 175, 55, 0.35)"
                              : "1px solid rgba(59, 130, 246, 0.25)",
                          fontSize: "0.8rem",
                          fontWeight: 650,
                        }}
                      >
                        <Shield size={13} />
                        {roleLabel} ({u.role})
                      </span>
                    </td>

                    {/* Capabilities summary */}
                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            padding: "3px 8px",
                            borderRadius: 6,
                            background: hasCustom
                              ? "rgba(168, 85, 247, 0.15)"
                              : "rgba(255, 255, 255, 0.06)",
                            color: hasCustom ? "#c084fc" : "var(--ice-text)",
                            border: hasCustom
                              ? "1px solid rgba(168, 85, 247, 0.3)"
                              : "1px solid rgba(255, 255, 255, 0.1)",
                            fontSize: "0.78rem",
                            fontWeight: 600,
                          }}
                        >
                          <Sliders size={12} />
                          {countPerms} / {ALL_CAPABILITY_IDS.length} capacités
                        </span>
                        {hasCustom ? (
                          <span
                            style={{
                              fontSize: "0.72rem",
                              padding: "2px 6px",
                              borderRadius: 4,
                              background: "rgba(234, 179, 8, 0.15)",
                              color: "#eab308",
                            }}
                          >
                            Personnalisé
                          </span>
                        ) : (
                          <span
                            style={{
                              fontSize: "0.72rem",
                              opacity: 0.55,
                            }}
                          >
                            Par défaut du rôle
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Password Visibility & Edit (DG / Admin) */}
                    {isPrivileged && (
                      <td style={{ padding: "14px 18px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <code
                            style={{
                              fontSize: "0.85rem",
                              padding: "4px 8px",
                              borderRadius: 6,
                              background: "rgba(0, 0, 0, 0.3)",
                              border: "1px solid var(--ice-border, rgba(255, 255, 255, 0.12))",
                              color: revealedPasswords[u.id] ? "var(--gold, #d4af37)" : "var(--ice-text-muted)",
                              letterSpacing: revealedPasswords[u.id] ? "normal" : "0.2em",
                              minWidth: 88,
                              display: "inline-block",
                            }}
                          >
                            {revealedPasswords[u.id]
                              ? (u.visiblePassword || "Carzone2026!")
                              : "••••••••"}
                          </code>

                          <button
                            type="button"
                            onClick={() =>
                              setRevealedPasswords((prev) => ({
                                ...prev,
                                [u.id]: !prev[u.id],
                              }))
                            }
                            title={
                              revealedPasswords[u.id]
                                ? "Masquer le mot de passe"
                                : "Afficher le mot de passe en clair (Visible par DG/Admin)"
                            }
                            style={{
                              padding: "5px",
                              background: "none",
                              border: "none",
                              color: "var(--ice-text)",
                              opacity: 0.75,
                              cursor: "pointer",
                            }}
                          >
                            {revealedPasswords[u.id] ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenPwdModal(u)}
                            title="Modifier le mot de passe de cet utilisateur"
                            style={{
                              padding: "4px 8px",
                              borderRadius: 6,
                              border: "1px solid rgba(212, 175, 55, 0.35)",
                              background: "rgba(212, 175, 55, 0.1)",
                              color: "var(--gold, #d4af37)",
                              fontSize: "0.75rem",
                              fontWeight: 650,
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <Key size={12} />
                            Changer
                          </button>
                        </div>
                        {u.lastPasswordChange && (
                          <div style={{ fontSize: "0.68rem", opacity: 0.5, marginTop: 4 }}>
                            Modifié le {new Date(u.lastPasswordChange).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                          </div>
                        )}
                      </td>
                    )}

                    {/* Status */}
                    <td style={{ padding: "14px 18px", textAlign: "center" }}>
                      <button
                        onClick={() => handleToggle(u.id, u.active)}
                        disabled={isPending || isSelf}
                        title={
                          isSelf
                            ? "Vous ne pouvez pas désactiver votre propre compte"
                            : u.active
                            ? "Cliquer pour désactiver"
                            : "Cliquer pour activer"
                        }
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "4px 10px",
                          borderRadius: 20,
                          border: "none",
                          background: u.active
                            ? "rgba(34, 197, 94, 0.15)"
                            : "rgba(239, 68, 68, 0.15)",
                          color: u.active ? "#4ade80" : "#f87171",
                          fontSize: "0.78rem",
                          fontWeight: 650,
                          cursor: isSelf ? "not-allowed" : "pointer",
                          opacity: isSelf ? 0.6 : 1,
                        }}
                      >
                        {u.active ? (
                          <>
                            <CheckCircle2 size={13} />
                            Actif
                          </>
                        ) : (
                          <>
                            <XCircle size={13} />
                            Inactif
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: "14px 18px", textAlign: "right" }}>
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        {/* Manage Capabilities & Role */}
                        <button
                          onClick={() => handleOpenEditModal(u)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "6px 12px",
                            borderRadius: 8,
                            border: "1px solid rgba(212, 175, 55, 0.35)",
                            background: "rgba(212, 175, 55, 0.1)",
                            color: "var(--gold, #d4af37)",
                            fontSize: "0.8rem",
                            fontWeight: 650,
                            cursor: "pointer",
                          }}
                        >
                          <Sliders size={14} />
                          Capacités & Rôle
                        </button>

                        {/* Delete Button */}
                        {!isSelf && (
                          <button
                            onClick={() => handleDelete(u.id, u.fullName)}
                            disabled={isPending}
                            title="Supprimer définitivement l'utilisateur"
                            style={{
                              padding: "6px 9px",
                              borderRadius: 8,
                              border: "1px solid rgba(239, 68, 68, 0.3)",
                              background: "rgba(239, 68, 68, 0.08)",
                              color: "#f87171",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredUsers.length === 0 && (
                <tr>
                  <td
                    colSpan={isPrivileged ? 6 : 5}
                    style={{
                      textAlign: "center",
                      padding: 40,
                      opacity: 0.6,
                    }}
                  >
                    Aucun utilisateur trouvé pour cette recherche ou ce filtre.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MODAL 1: CRÉATION D'UTILISATEUR AVEC TABLE DES CAPACITÉS     */}
      {/* ============================================================ */}
      {showAddModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: 16,
          }}
        >
          <div
            style={{
              background: "var(--ice-card-bg, #161a20)",
              border: "1px solid var(--ice-border, rgba(255, 255, 255, 0.15))",
              borderRadius: 16,
              width: "100%",
              maxWidth: 920,
              maxHeight: "92vh",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5)",
              overflow: "hidden",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "18px 24px",
                borderBottom: "1px solid var(--ice-border, rgba(255, 255, 255, 0.1))",
                background: "rgba(255, 255, 255, 0.02)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  style={{
                    display: "inline-flex",
                    padding: "7px",
                    borderRadius: "8px",
                    background: "rgba(212, 175, 55, 0.15)",
                    color: "var(--gold, #d4af37)",
                  }}
                >
                  <UserPlus size={20} />
                </span>
                <div>
                  <h2 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, color: "var(--ice-text)" }}>
                    Créer un Utilisateur & Configurer ses Droits
                  </h2>
                  <p style={{ margin: "2px 0 0 0", fontSize: "0.78rem", opacity: 0.7 }}>
                    Renseignez les identifiants puis cochez ou décochez les fonctionnalités autorisées.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "inherit",
                  cursor: "pointer",
                  opacity: 0.7,
                  padding: 4,
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <form
              onSubmit={handleCreateSubmit}
              style={{
                display: "flex",
                flexDirection: "column",
                overflowY: "auto",
                flex: 1,
                padding: "20px 24px",
                gap: 20,
              }}
            >
              {/* Identity & Role Inputs */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: 16,
                  padding: "16px",
                  borderRadius: 12,
                  background: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid var(--ice-border, rgba(255, 255, 255, 0.08))",
                }}
              >
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 650, marginBottom: 6, color: "var(--ice-text)" }}>
                    Nom & Prénom *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Jean Dupont"
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      borderRadius: 8,
                      border: "1px solid var(--ice-border, rgba(255, 255, 255, 0.15))",
                      background: "rgba(0, 0, 0, 0.2)",
                      color: "var(--ice-text)",
                      fontSize: "0.875rem",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 650, marginBottom: 6, color: "var(--ice-text)" }}>
                    Adresse Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="jean.dupont@entreprise.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      borderRadius: 8,
                      border: "1px solid var(--ice-border, rgba(255, 255, 255, 0.15))",
                      background: "rgba(0, 0, 0, 0.2)",
                      color: "var(--ice-text)",
                      fontSize: "0.875rem",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 650, marginBottom: 6, color: "var(--ice-text)" }}>
                    Rôle de Base *
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => handleNewRoleChange(e.target.value as Role)}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      borderRadius: 8,
                      border: "1px solid rgba(212, 175, 55, 0.4)",
                      background: "var(--ice-card-bg, #1a1e24)",
                      color: "var(--ice-text)",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      boxSizing: "border-box",
                      cursor: "pointer",
                    }}
                  >
                    {Object.entries(ROLE_LABELS).map(([k, label]) => (
                      <option key={k} value={k}>
                        {label} ({k})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 650, marginBottom: 6, color: "var(--ice-text)" }}>
                    Mot de passe initial
                  </label>
                  <input
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      borderRadius: 8,
                      border: "1px solid var(--ice-border, rgba(255, 255, 255, 0.15))",
                      background: "rgba(0, 0, 0, 0.2)",
                      color: "var(--ice-text)",
                      fontSize: "0.875rem",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              {/* Exact Capabilities Table from the Screenshot */}
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 10,
                    marginBottom: 10,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "var(--ice-text)" }}>
                      Grille des Capacités & Permissions
                    </h3>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        padding: "2px 8px",
                        borderRadius: 6,
                        background: "rgba(212, 175, 55, 0.15)",
                        color: "var(--gold, #d4af37)",
                        fontWeight: 650,
                      }}
                    >
                      {newPermissions.length} / {ALL_CAPABILITY_IDS.length} cochées
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleResetToRoleDefault(newRole, setNewPermissions)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid var(--ice-border, rgba(255, 255, 255, 0.15))",
                      color: "var(--ice-text)",
                      padding: "5px 10px",
                      borderRadius: 6,
                      fontSize: "0.75rem",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    <RotateCcw size={12} />
                    Rétablir par défaut du rôle ({ROLE_LABELS[newRole]})
                  </button>
                </div>

                {/* The Checklist Table */}
                <CapabilitiesTable
                  currentPermissions={newPermissions}
                  onTogglePermission={(id) =>
                    togglePermission(id, newPermissions, setNewPermissions)
                  }
                  onToggleGroup={(groupId) =>
                    toggleFeatureGroup(groupId, newPermissions, setNewPermissions)
                  }
                />
              </div>

              {/* Modal Footer */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  gap: 12,
                  paddingTop: 14,
                  borderTop: "1px solid var(--ice-border, rgba(255, 255, 255, 0.1))",
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    padding: "9px 16px",
                    borderRadius: 8,
                    border: "1px solid var(--ice-border, rgba(255, 255, 255, 0.15))",
                    background: "transparent",
                    color: "var(--ice-text)",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                  }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "9px 20px",
                    borderRadius: 8,
                    border: "none",
                    background: "linear-gradient(135deg, #d4af37, #b48c1e)",
                    color: "#000",
                    fontWeight: 750,
                    fontSize: "0.875rem",
                    cursor: "pointer",
                    boxShadow: "0 2px 10px rgba(212, 175, 55, 0.3)",
                  }}
                >
                  <Check size={16} />
                  {isPending ? "Création en cours..." : "Créer l'Utilisateur"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 2: ÉDITION DES CAPACITÉS & RÔLE D'UN UTILISATEUR        */}
      {/* ============================================================ */}
      {editingUser && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: 16,
          }}
        >
          <div
            style={{
              background: "var(--ice-card-bg, #161a20)",
              border: "1px solid var(--ice-border, rgba(255, 255, 255, 0.15))",
              borderRadius: 16,
              width: "100%",
              maxWidth: 920,
              maxHeight: "92vh",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5)",
              overflow: "hidden",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "18px 24px",
                borderBottom: "1px solid var(--ice-border, rgba(255, 255, 255, 0.1))",
                background: "rgba(255, 255, 255, 0.02)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  style={{
                    display: "inline-flex",
                    padding: "7px",
                    borderRadius: "8px",
                    background: "rgba(212, 175, 55, 0.15)",
                    color: "var(--gold, #d4af37)",
                  }}
                >
                  <Sliders size={20} />
                </span>
                <div>
                  <h2 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, color: "var(--ice-text)" }}>
                    Modifier les Capacités & le Rôle de {editingUser.fullName}
                  </h2>
                  <p style={{ margin: "2px 0 0 0", fontSize: "0.78rem", opacity: 0.7 }}>
                    Contrôlez en temps réel ce que cet utilisateur peut faire sur chaque fonctionnalité.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                style={{
                  background: "none",
                  border: "none",
                  color: "inherit",
                  cursor: "pointer",
                  opacity: 0.7,
                  padding: 4,
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form
              onSubmit={handleEditSubmit}
              style={{
                display: "flex",
                flexDirection: "column",
                overflowY: "auto",
                flex: 1,
                padding: "20px 24px",
                gap: 20,
              }}
            >
              {/* User Identity Banner */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: 14,
                  padding: "16px",
                  borderRadius: 12,
                  background: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid var(--ice-border, rgba(255, 255, 255, 0.08))",
                }}
              >
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 650, marginBottom: 5, opacity: 0.7 }}>
                    Nom Complet
                  </label>
                  <input
                    type="text"
                    required
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: "1px solid var(--ice-border, rgba(255, 255, 255, 0.15))",
                      background: "rgba(0, 0, 0, 0.2)",
                      color: "var(--ice-text)",
                      fontSize: "0.875rem",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 650, marginBottom: 5, opacity: 0.7 }}>
                    Adresse Email (Identifiant)
                  </label>
                  <input
                    type="text"
                    disabled
                    value={editingUser.email}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: "1px solid var(--ice-border, rgba(255, 255, 255, 0.1))",
                      background: "rgba(255, 255, 255, 0.04)",
                      color: "var(--ice-text)",
                      fontSize: "0.875rem",
                      boxSizing: "border-box",
                      opacity: 0.7,
                      cursor: "not-allowed",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 650, marginBottom: 5, opacity: 0.7 }}>
                    Rôle de Référence
                  </label>
                  <select
                    value={editRole}
                    onChange={(e) => handleEditRoleChange(e.target.value as Role)}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: "1px solid rgba(212, 175, 55, 0.4)",
                      background: "var(--ice-card-bg, #1a1e24)",
                      color: "var(--ice-text)",
                      fontSize: "0.875rem",
                      fontWeight: 650,
                      boxSizing: "border-box",
                      cursor: "pointer",
                    }}
                  >
                    {Object.entries(ROLE_LABELS).map(([k, label]) => (
                      <option key={k} value={k}>
                        {label} ({k})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* The Checklist Table */}
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 10,
                    marginBottom: 10,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "var(--ice-text)" }}>
                      Tableau des Droits & Capacités (Cocher ce que cet utilisateur peut faire)
                    </h3>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        padding: "2px 8px",
                        borderRadius: 6,
                        background: "rgba(212, 175, 55, 0.15)",
                        color: "var(--gold, #d4af37)",
                        fontWeight: 650,
                      }}
                    >
                      {editPermissions.length} / {ALL_CAPABILITY_IDS.length} capacités autorisées
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleResetToRoleDefault(editRole, setEditPermissions)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid var(--ice-border, rgba(255, 255, 255, 0.15))",
                      color: "var(--ice-text)",
                      padding: "5px 10px",
                      borderRadius: 6,
                      fontSize: "0.75rem",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    <RotateCcw size={12} />
                    Rétablir par défaut du rôle {ROLE_LABELS[editRole]}
                  </button>
                </div>

                <CapabilitiesTable
                  currentPermissions={editPermissions}
                  onTogglePermission={(id) =>
                    togglePermission(id, editPermissions, setEditPermissions)
                  }
                  onToggleGroup={(groupId) =>
                    toggleFeatureGroup(groupId, editPermissions, setEditPermissions)
                  }
                />
              </div>

              {/* Modal Footer */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                  paddingTop: 14,
                  borderTop: "1px solid var(--ice-border, rgba(255, 255, 255, 0.1))",
                }}
              >
                <div style={{ fontSize: "0.78rem", opacity: 0.65 }}>
                  Les modifications sont appliquées immédiatement dès enregistrement.
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    style={{
                      padding: "9px 16px",
                      borderRadius: 8,
                      border: "1px solid var(--ice-border, rgba(255, 255, 255, 0.15))",
                      background: "transparent",
                      color: "var(--ice-text)",
                      fontSize: "0.85rem",
                      cursor: "pointer",
                    }}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "9px 20px",
                      borderRadius: 8,
                      border: "none",
                      background: "linear-gradient(135deg, #d4af37, #b48c1e)",
                      color: "#000",
                      fontWeight: 750,
                      fontSize: "0.875rem",
                      cursor: "pointer",
                      boxShadow: "0 2px 10px rgba(212, 175, 55, 0.3)",
                    }}
                  >
                    <Check size={16} />
                    {isPending ? "Enregistrement..." : "Enregistrer les Capacités"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ============================================================ */}
      {/* MODAL 3: MODIFICATION DE MOT DE PASSE (DG / ADMIN)           */}
      {/* ============================================================ */}
      {pwdModalUser && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
            padding: 16,
          }}
        >
          <div
            style={{
              background: "var(--ice-card-bg, #161a20)",
              border: "1px solid var(--ice-border, rgba(255, 255, 255, 0.15))",
              borderRadius: 16,
              width: "100%",
              maxWidth: 460,
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5)",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "18px 22px",
                borderBottom: "1px solid var(--ice-border, rgba(255, 255, 255, 0.1))",
                background: "rgba(255, 255, 255, 0.02)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  style={{
                    display: "inline-flex",
                    padding: "7px",
                    borderRadius: 8,
                    background: "rgba(212, 175, 55, 0.15)",
                    color: "var(--gold, #d4af37)",
                  }}
                >
                  <Key size={18} />
                </span>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "var(--ice-text)" }}>
                    Modifier le Mot de Passe
                  </h3>
                  <div style={{ fontSize: "0.78rem", opacity: 0.65 }}>
                    Pour {pwdModalUser.fullName} ({pwdModalUser.email})
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPwdModalUser(null)}
                style={{
                  background: "none",
                  border: "none",
                  color: "inherit",
                  cursor: "pointer",
                  opacity: 0.6,
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handlePasswordSubmit} style={{ padding: "22px", display: "flex", flexDirection: "column", gap: 16 }}>
              {pwdError && (
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: 8,
                    background: "rgba(239, 68, 68, 0.15)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    color: "#f87171",
                    fontSize: "0.82rem",
                  }}
                >
                  {pwdError}
                </div>
              )}

              {pwdSuccess && (
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: 8,
                    background: "rgba(34, 197, 94, 0.15)",
                    border: "1px solid rgba(34, 197, 94, 0.3)",
                    color: "#4ade80",
                    fontSize: "0.82rem",
                  }}
                >
                  {pwdSuccess}
                </div>
              )}

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 650, marginBottom: 6, color: "var(--ice-text)" }}>
                  Nouveau mot de passe
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPwdValue ? "text" : "password"}
                    required
                    minLength={4}
                    placeholder="Tapez le nouveau mot de passe..."
                    value={newPwdValue}
                    onChange={(e) => setNewPwdValue(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 38px 10px 12px",
                      borderRadius: 8,
                      border: "1px solid var(--ice-border, rgba(255, 255, 255, 0.15))",
                      background: "rgba(0, 0, 0, 0.2)",
                      color: "var(--ice-text)",
                      fontSize: "0.875rem",
                      boxSizing: "border-box",
                      outline: "none",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwdValue(!showPwdValue)}
                    style={{
                      position: "absolute",
                      right: 10,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      color: "var(--ice-text)",
                      opacity: 0.65,
                      cursor: "pointer",
                      padding: 2,
                    }}
                  >
                    {showPwdValue ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div style={{ fontSize: "0.72rem", opacity: 0.55, marginTop: 4 }}>
                  Le nouveau mot de passe sera immédiatement enregistré, visible en clair par la Direction et une notification sera émise.
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 6 }}>
                <button
                  type="button"
                  onClick={() => setPwdModalUser(null)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 8,
                    border: "1px solid var(--ice-border, rgba(255, 255, 255, 0.15))",
                    background: "transparent",
                    color: "var(--ice-text)",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                  }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isPending || !newPwdValue.trim()}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 18px",
                    borderRadius: 8,
                    border: "none",
                    background: "linear-gradient(135deg, #d4af37, #b48c1e)",
                    color: "#000",
                    fontWeight: 750,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    boxShadow: "0 2px 10px rgba(212, 175, 55, 0.3)",
                  }}
                >
                  <Check size={15} />
                  {isPending ? "Mise à jour..." : "Valider le mot de passe"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Composant de tableau exactement identique à la capture d'écran de l'utilisateur
 * Deux colonnes : Fonctionnalité | Capacités (cases à cocher)
 */
function CapabilitiesTable({
  currentPermissions,
  onTogglePermission,
  onToggleGroup,
}: {
  currentPermissions: string[];
  onTogglePermission: (id: string) => void;
  onToggleGroup: (groupId: string) => void;
}) {
  return (
    <div
      style={{
        border: "1px solid var(--ice-border, rgba(255, 255, 255, 0.12))",
        borderRadius: 10,
        overflow: "hidden",
        background: "var(--ice-card-bg, rgba(255, 255, 255, 0.02))",
      }}
    >
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "0.85rem",
          textAlign: "left",
        }}
      >
        <thead>
          <tr
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              borderBottom: "1px solid var(--ice-border, rgba(255, 255, 255, 0.15))",
            }}
          >
            <th
              style={{
                width: "28%",
                padding: "12px 16px",
                fontWeight: 750,
                color: "var(--ice-text)",
                fontSize: "0.85rem",
              }}
            >
              Fonctionnalité
            </th>
            <th
              style={{
                padding: "12px 16px",
                fontWeight: 750,
                color: "var(--ice-text)",
                fontSize: "0.85rem",
              }}
            >
              Capacités
            </th>
          </tr>
        </thead>
        <tbody>
          {FEATURE_GROUPS.map((group, idx) => {
            const groupPermIds = group.capabilities.map((c) => c.id);
            const allChecked = groupPermIds.every((id) =>
              currentPermissions.includes(id)
            );

            return (
              <tr
                key={group.id}
                style={{
                  borderBottom:
                    idx < FEATURE_GROUPS.length - 1
                      ? "1px solid var(--ice-border, rgba(255, 255, 255, 0.08))"
                      : "none",
                  verticalAlign: "top",
                }}
              >
                {/* Column 1: Feature Name & description */}
                <td
                  style={{
                    padding: "16px 16px",
                    borderRight: "1px solid var(--ice-border, rgba(255, 255, 255, 0.08))",
                    background: "rgba(0, 0, 0, 0.04)",
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--ice-text)" }}>
                    {group.name}
                  </div>
                  <div style={{ fontSize: "0.75rem", opacity: 0.65, marginTop: 2 }}>
                    {group.nameFr}
                  </div>

                  <button
                    type="button"
                    onClick={() => onToggleGroup(group.id)}
                    style={{
                      marginTop: 8,
                      fontSize: "0.72rem",
                      padding: "2px 8px",
                      borderRadius: 4,
                      border: "1px solid var(--ice-border, rgba(255, 255, 255, 0.15))",
                      background: allChecked
                        ? "rgba(239, 68, 68, 0.1)"
                        : "rgba(34, 197, 94, 0.1)",
                      color: allChecked ? "#f87171" : "#4ade80",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    {allChecked ? "Tout décocher" : "Tout cocher"}
                  </button>
                </td>

                {/* Column 2: Checkboxes */}
                <td style={{ padding: "14px 18px" }}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 9,
                    }}
                  >
                    {group.capabilities.map((cap) => {
                      const isChecked = currentPermissions.includes(cap.id);
                      return (
                        <label
                          key={cap.id}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 10,
                            cursor: "pointer",
                            userSelect: "none",
                            fontSize: "0.85rem",
                            color: isChecked ? "var(--ice-text)" : "rgba(255, 255, 255, 0.55)",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => onTogglePermission(cap.id)}
                            style={{
                              width: 17,
                              height: 17,
                              cursor: "pointer",
                              accentColor: "#d4af37",
                              borderRadius: 4,
                            }}
                          />
                          <span style={{ fontWeight: isChecked ? 650 : 400 }}>
                            {cap.label}
                          </span>
                          {cap.description && (
                            <span
                              style={{
                                fontSize: "0.75rem",
                                opacity: 0.5,
                                fontStyle: "italic",
                              }}
                            >
                              — {cap.description}
                            </span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
