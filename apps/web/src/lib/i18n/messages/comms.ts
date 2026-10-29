import type { Locale } from "@/lib/prefs";

/**
 * Copy trilingue des modules Boîte mail et Discussion / Appels.
 *
 * Utilisation côté client :
 *   import { commsCopy } from "@/lib/i18n/messages/comms";
 *   const { locale } = usePrefs();
 *   const copy = commsCopy[locale];
 *
 * Règle de rédaction : le français sert de référence, l'anglais reste
 * international et le chinois est du chinois simplifié. Aucune donnée
 * métier (adresses e-mail, noms, identifiants de salon) n'est traduite.
 */

/** Dossiers de la boîte mail (clés techniques inchangées). */
export type CommsMailFolderKey = "INBOX" | "SENT" | "DRAFT" | "STARRED" | "TRASH";

/** Intitulé d'un salon de conférence, traduit par identifiant technique. */
export type CommsRoomCopy = {
  name: string;
  description: string;
};

export type CommsCopy = {
  /** Locale de formatage des dates et heures (fr-FR, en-GB, zh-CN). */
  dateLocale: string;
  timeLocale: string;
  common: {
    cancel: string;
    close: string;
  };
  mail: {
    folders: Record<CommsMailFolderKey, string>;
    composeOpen: string;
    accountsTitle: string;
    searchPlaceholder: string;
    sync: string;
    syncTitle: string;
    backToList: string;
    reply: string;
    delete: string;
    from: string;
    to: string;
    /** Préfixe compact de la colonne destinataire dans la liste. */
    toPrefix: string;
    emptyFolder: string;
    replyTitle: (name: string) => string;
    composeTitle: string;
    composeSubtitle: string;
    recipient: string;
    customerPlaceholder: string;
    recipientPlaceholder: string;
    subject: string;
    subjectPlaceholder: string;
    messageLabel: string;
    /** Corps prérempli du formulaire de rédaction. */
    draftBody: string;
    /** En-tête de citation inséré en tête d'une réponse. */
    quoteHeader: (name: string) => string;
    send: string;
    attachments: {
      title: string;
      empty: string;
      add: string;
      tooBig: string;
    };
    errors: {
      sendFailed: string;
      emptyRecipient: string;
    };
  };
  chat: {
    title: string;
    searchColleague: string;
    channelsTitle: string;
    channels: {
      general: string;
      workshop: string;
      sales: string;
      broadcast: string;
    };
    callsSectionTitle: string;
    callHistory: string;
    directsTitle: (count: number) => string;
    presence: {
      online: string;
      away: string;
      offline: string;
    };
    subtitle: {
      channel: string;
      broadcast: string;
      direct: string;
    };
    empty: string;
    backToList: string;
    mic: string;
    micTitle: string;
    call: {
      call: string;
      offline: string;
      offlineTitle: (name: string) => string;
      callTitle: (name: string) => string;
    };
    stickers: {
      title: string;
      /** Libellés des stickers, indexés par leur code emoji. */
      labels: Record<string, string>;
    };
    placeholder: {
      channel: (channel: string) => string;
      broadcast: string;
      direct: (name: string) => string;
    };
    broadcast: {
      button: string;
      buttonTitle: string;
      badge: string;
      title: string;
      modalTitle: string;
      recipientsLabel: string;
      optionAll: string;
      optionCustom: string;
      groups: {
        workshop: string;
        sales: string;
        finance: string;
        direction: string;
      };
      selectedCount: (count: number) => string;
      selectAll: string;
      deselectAll: string;
      messageLabel: string;
      messagePlaceholder: string;
      submit: string;
      sending: string;
      allCompany: string;
      someCount: (count: number) => string;
      success: (target: string) => string;
      groupTarget: (count: number) => string;
      allTarget: string;
    };
    offlineModal: {
      title: string;
      status: string;
      body: string;
      callAnyway: string;
    };
    errors: {
      sendMessage: string;
      sendBroadcast: string;
      noRecipient: string;
      audioInit: string;
    };
  };
  calls: {
    title: string;
    subtitle: string;
    scopeMine: string;
    scopeCompany: string;
    scopeCompanyTitle: string;
    kpi: {
      missed: string;
      missedPending: string;
      missedNone: string;
      direct: string;
      directDetail: string;
      conference: string;
      conferenceDetail: string;
      total: string;
      totalDetail: string;
    };
    filters: {
      all: (count: number) => string;
      missed: (count: number) => string;
      direct: (count: number) => string;
      conference: (count: number) => string;
    };
    searchPlaceholder: string;
    loading: string;
    empty: string;
    toName: (name: string) => string;
    fromName: (name: string) => string;
    missedBadge: string;
    notAnswered: string;
    duration: (value: string) => string;
    missedDuration: string;
    hourUnit: string;
    minuteUnit: string;
    secondUnit: string;
    todayAt: (time: string) => string;
    yesterdayAt: (time: string) => string;
    dateAt: (date: string, time: string) => string;
    joinRoom: string;
    callBack: string;
    call: string;
  };
  conference: {
    fallbackName: string;
    fallbackDescription: string;
    rooms: Record<string, CommsRoomCopy | undefined>;
    categories: Record<string, string | undefined>;
    live: string;
    open: string;
    participantsInRoom: (count: number) => string;
    emptyRoom: string;
    lobbyText: string;
    join: string;
    me: (name: string) => string;
    micOff: string;
    micOn: string;
    listening: string;
    mute: string;
    unmute: string;
    invite: string;
    inviteTitle: string;
    inviteText: (room: string) => string;
    invited: string;
    inviteOne: string;
    leave: string;
    closeForAll: string;
    closeForAllTitle: string;
    closeConfirm: string;
    errors: {
      joinFailed: string;
    };
  };
  notifications: {
    unreadMessages: (count: number) => string;
    missedCalls: (count: number) => string;
    unreadAnnouncements: (count: number) => string;
  };
};

const fr: CommsCopy = {
  dateLocale: "fr-FR",
  timeLocale: "fr-FR",
  common: {
    cancel: "Annuler",
    close: "Fermer",
  },
  mail: {
    folders: {
      INBOX: "Boîte de réception",
      SENT: "Envoyés",
      STARRED: "Favoris",
      DRAFT: "Brouillons",
      TRASH: "Corbeille",
    },
    composeOpen: "Composer",
    accountsTitle: "Comptes connectés",
    searchPlaceholder: "Chercher un message, un expéditeur...",
    sync: "Synchroniser",
    syncTitle: "Récupérer les nouveaux messages",
    backToList: "Retour aux messages",
    reply: "Répondre",
    delete: "Supprimer",
    from: "De :",
    to: "À :",
    toPrefix: "À : ",
    emptyFolder: "Ce dossier est vide.",
    replyTitle: (name) => `Répondre à ${name}`,
    composeTitle: "Nouveau message",
    composeSubtitle: "Le mail part de chez CARZONE SARL.",
    recipient: "Destinataire",
    customerPlaceholder: "Prendre un client dans la liste...",
    recipientPlaceholder: "client@domaine.bj",
    subject: "Objet",
    subjectPlaceholder: "Ex : Devis CARZONE SARL, confirmation de commande",
    messageLabel: "Message",
    draftBody:
      "Bonjour,\n\nMerci de votre confiance.\n\nBien à vous,\nL'équipe CARZONE SARL",
    quoteHeader: (name) => `\n\n--- Message d'origine de ${name} ---\n`,
    send: "Envoyer le mail",
    attachments: {
      title: "Pièces jointes",
      empty: "Aucune pièce jointe pour le moment.",
      add: "Joindre un fichier",
      tooBig: "Trop lourd. 10 Mo par fichier, pas plus.",
    },
    errors: {
      sendFailed: "Le mail n'est pas parti. Réessayez.",
      emptyRecipient: "Il manque le destinataire.",
    },
  },
  chat: {
    title: "Messagerie de l'équipe",
    searchColleague: "Chercher un collègue...",
    channelsTitle: "Canaux de l'équipe",
    channels: {
      general: "# général (tout le monde)",
      workshop: "# atelier-sav",
      sales: "# ventes-showroom",
      broadcast: "📢 Annonces de la direction",
    },
    callsSectionTitle: "Appels et conférences",
    callHistory: "📞 Journal des appels",
    directsTitle: (count) => `Messages privés et appels (${count})`,
    presence: {
      online: "En ligne",
      away: "Absent",
      offline: "Déconnecté",
    },
    subtitle: {
      channel: "Canal ouvert à toute l'équipe",
      broadcast: "Les annonces officielles de la direction",
      direct: "Discussion privée, appel audio",
    },
    empty: "Pas encore de message. Lancez la conversation, ou écrivez le premier.",
    backToList: "Retour à la liste",
    mic: "Micro",
    micTitle: "Tester ou autoriser le micro",
    call: {
      call: "Appeler",
      offline: "Déconnecté",
      offlineTitle: (name) => `${name} n'est pas connecté à l'application en ce moment`,
      callTitle: (name) => `Lancer un appel audio avec ${name}`,
    },
    stickers: {
      title: "Envoyer un sticker ou une réaction",
      labels: {
        "🚗": "Voiture prête",
        "✅": "C'est validé",
        "🔧": "En réparation",
        "⚡": "Urgent",
        "🤝": "Le client est d'accord",
        "💰": "Paiement reçu",
        "🎯": "Objectif atteint",
        "📞": "Rappelez-moi SVP",
        "👏": "Bravo à l'équipe",
        "🚀": "Livraison en cours",
      },
    },
    placeholder: {
      channel: (channel) => `Écrire dans #${channel}... (Entrée pour envoyer)`,
      broadcast: "Écrire une annonce générale...",
      direct: (name) => `Message pour ${name}...`,
    },
    broadcast: {
      button: "Diffuser",
      buttonTitle: "Envoyer une annonce à toute l'équipe",
      badge: "DIFFUSION DE LA DIRECTION",
      title: "Annonces de la direction",
      modalTitle: "Annonce de la direction générale",
      recipientsLabel: "Qui doit recevoir ?",
      optionAll: "📢 Tout le monde d'un coup (entreprise entière)",
      optionCustom: "👥 Un groupe précis",
      groups: {
        workshop: "🔧 Équipe atelier SAV",
        sales: "🚗 Ventes et showroom",
        finance: "💳 Finance et compta",
        direction: "👑 Direction et administration",
      },
      selectedCount: (count) => `${count} collègue(s) coché(s) :`,
      selectAll: "Tout cocher",
      deselectAll: "Tout décocher",
      messageLabel: "Message officiel",
      messagePlaceholder: "Le communiqué, la consigne, l'info à faire passer...",
      submit: "Envoyer l'annonce",
      sending: "Envoi...",
      allCompany: "toute l'entreprise",
      someCount: (count) => `${count} collègue(s)`,
      success: (target) => `Annonce envoyée à ${target}.`,
      groupTarget: (count) => `Groupe ciblé (${count} pers.)`,
      allTarget: "Tous les collaborateurs",
    },
    offlineModal: {
      title: "Ce collègue n'est pas en ligne",
      status: "Hors ligne pour le moment",
      body:
        "n'est pas connecté à l'application. L'appel risque de ne pas sonner tout de suite sur son appareil.",
      callAnyway: "📞 Appeler quand même",
    },
    errors: {
      sendMessage: "Le message n'est pas parti. Réessayez.",
      sendBroadcast: "L'annonce n'est pas partie. Réessayez.",
      noRecipient: "Cochez au moins un collègue, ou passez en mode tout le monde.",
      audioInit: "Le module d'appel se prépare. Réessayez dans un instant.",
    },
  },
  calls: {
    title: "Journal des appels et traçabilité",
    subtitle:
      "Les appels directs, les appels manqués et la durée des conférences en ligne.",
    scopeMine: "Mes appels",
    scopeCompany: "Traçabilité entreprise",
    scopeCompanyTitle: "Voir les appels de tous les collègues (réservé à la direction)",
    kpi: {
      missed: "Appels manqués",
      missedPending: "À rappeler",
      missedNone: "Rien à rattraper",
      direct: "Appels directs",
      directDetail: "Entrants et sortants",
      conference: "Conférences",
      conferenceDetail: "Salons tenus",
      total: "Durée cumulée",
      totalDetail: "Temps passé au téléphone",
    },
    filters: {
      all: (count) => `Tous (${count})`,
      missed: (count) => `🔴 Manqués (${count})`,
      direct: (count) => `📞 Appels directs (${count})`,
      conference: (count) => `🎙️ Conférences (${count})`,
    },
    searchPlaceholder: "Chercher un nom...",
    loading: "On sort l'historique...",
    empty: "Aucun appel dans cette catégorie.",
    toName: (name) => `Vers ${name}`,
    fromName: (name) => `De ${name}`,
    missedBadge: "APPEL MANQUÉ",
    notAnswered: "Pas décroché (0 s)",
    duration: (value) => `Durée : ${value}`,
    missedDuration: "00:00 (manqué)",
    hourUnit: "h",
    minuteUnit: "m",
    secondUnit: "s",
    todayAt: (time) => `Aujourd'hui à ${time}`,
    yesterdayAt: (time) => `Hier à ${time}`,
    dateAt: (date, time) => `${date} à ${time}`,
    joinRoom: "Rejoindre le salon",
    callBack: "Rappeler",
    call: "Appeler",
  },
  conference: {
    fallbackName: "Conférence en ligne",
    fallbackDescription: "Salle audio en direct",
    rooms: {
      CONF_DIRECTION: {
        name: "Salle direction générale et stratégie",
        description: "Comité de direction, arbitrages, décisions de fond",
      },
      CONF_ATELIER: {
        name: "Conférence technique atelier et SAV",
        description: "Réparations, diagnostics et pièces, on cale ça ensemble",
      },
      CONF_COMMERCIAL: {
        name: "Conférence commercial et showroom",
        description: "Point ventes, devis en cours, livraisons clients",
      },
      CONF_GENERAL: {
        name: "Conférence générale d'entreprise",
        description: "Le point d'équipe ouvert à tout le monde",
      },
    },
    categories: {
      DIRECTION: "Direction",
      ATELIER: "Atelier",
      COMMERCIAL: "Commercial",
      GENERAL: "Général",
    },
    live: "🟢 EN DIRECT",
    open: "SALON OUVERT",
    participantsInRoom: (count) => `Présents dans le salon (${count})`,
    emptyRoom: "Personne pour l'instant. Entrez le premier.",
    lobbyText: "Entrez pour parler en direct avec la direction et les équipes.",
    join: "Entrer dans la salle",
    me: (name) => `${name} (moi)`,
    micOff: "Micro coupé",
    micOn: "Micro ouvert",
    listening: "À l'écoute",
    mute: "Couper mon micro",
    unmute: "Réactiver mon micro",
    invite: "Inviter un collègue",
    inviteTitle: "Inviter un collègue",
    inviteText: (room) =>
      `Choisissez un collègue. Il reçoit une alerte pour venir dans « ${room} ».`,
    invited: "Invité ✓",
    inviteOne: "Inviter",
    leave: "Quitter la salle",
    closeForAll: "Clore pour tout le monde (DG)",
    closeForAllTitle:
      "Ferme la salle pour les participants et enregistre la durée",
    closeConfirm:
      "Clore cette conférence pour tout le monde et enregistrer la durée dans le journal ?",
    errors: {
      joinFailed: "Impossible d'entrer dans la salle.",
    },
  },
  notifications: {
    unreadMessages: (count) => `${count} message(s) non lu(s)`,
    missedCalls: (count) => `${count} appel(s) manqué(s)`,
    unreadAnnouncements: (count) => `${count} annonce(s) non lue(s)`,
  },
};

const en: CommsCopy = {
  dateLocale: "en-GB",
  timeLocale: "en-GB",
  common: {
    cancel: "Cancel",
    close: "Close",
  },
  mail: {
    folders: {
      INBOX: "Inbox",
      SENT: "Sent",
      STARRED: "Starred",
      DRAFT: "Drafts",
      TRASH: "Trash",
    },
    composeOpen: "Write a message",
    accountsTitle: "Connected accounts",
    searchPlaceholder: "Search a message or a sender...",
    sync: "Sync",
    syncTitle: "Pull in new messages",
    backToList: "Back to messages",
    reply: "Reply",
    delete: "Delete",
    from: "From:",
    to: "To:",
    toPrefix: "To: ",
    emptyFolder: "This folder is empty.",
    replyTitle: (name) => `Reply to ${name}`,
    composeTitle: "New message",
    composeSubtitle: "This mail goes out from CARZONE SARL.",
    recipient: "Recipient",
    customerPlaceholder: "Pick a customer from the list...",
    recipientPlaceholder: "client@domaine.bj",
    subject: "Subject",
    subjectPlaceholder: "e.g. CARZONE SARL quote, order confirmation",
    messageLabel: "Message",
    draftBody:
      "Hello,\n\nThanks for your trust.\n\nBest regards,\nThe CARZONE SARL team",
    quoteHeader: (name) => `\n\n--- Original message from ${name} ---\n`,
    send: "Send the mail",
    attachments: {
      title: "Attachments",
      empty: "No attachment yet.",
      add: "Attach a file",
      tooBig: "Too heavy. 10 MB per file, no more.",
    },
    errors: {
      sendFailed: "The mail didn't go out. Try again.",
      emptyRecipient: "The recipient is missing.",
    },
  },
  chat: {
    title: "Team messaging",
    searchColleague: "Search a colleague...",
    channelsTitle: "Team channels",
    channels: {
      general: "# general (everyone)",
      workshop: "# workshop-service",
      sales: "# showroom-sales",
      broadcast: "📢 Company announcements",
    },
    callsSectionTitle: "Calls and conferences",
    callHistory: "📞 Call log",
    directsTitle: (count) => `Direct messages and calls (${count})`,
    presence: {
      online: "Online",
      away: "Away",
      offline: "Offline",
    },
    subtitle: {
      channel: "A channel open to the whole team",
      broadcast: "Official announcements from the management",
      direct: "Private chat, voice call",
    },
    empty: "No message yet. Start the conversation, or send the first one.",
    backToList: "Back to the list",
    mic: "Mic",
    micTitle: "Test or allow the microphone",
    call: {
      call: "Call",
      offline: "Offline",
      offlineTitle: (name) => `${name} isn't online in the app right now`,
      callTitle: (name) => `Start a voice call with ${name}`,
    },
    stickers: {
      title: "Send a sticker or a reaction",
      labels: {
        "🚗": "Car ready",
        "✅": "Approved",
        "🔧": "Under repair",
        "⚡": "Urgent",
        "🤝": "Customer agreed",
        "💰": "Payment received",
        "🎯": "Target hit",
        "📞": "Call me back please",
        "👏": "Well done team",
        "🚀": "Out for delivery",
      },
    },
    placeholder: {
      channel: (channel) => `Write in #${channel}... (Enter to send)`,
      broadcast: "Write a company-wide announcement...",
      direct: (name) => `Message for ${name}...`,
    },
    broadcast: {
      button: "Broadcast",
      buttonTitle: "Send an announcement to the whole team",
      badge: "MANAGEMENT BROADCAST",
      title: "Management announcements",
      modalTitle: "Announcement from management",
      recipientsLabel: "Who should get it?",
      optionAll: "📢 Everyone at once (whole company)",
      optionCustom: "👥 A specific group",
      groups: {
        workshop: "🔧 Workshop and service team",
        sales: "🚗 Sales and showroom",
        finance: "💳 Finance and accounting",
        direction: "👑 Management and admin",
      },
      selectedCount: (count) => `${count} colleague(s) ticked:`,
      selectAll: "Select all",
      deselectAll: "Clear all",
      messageLabel: "Official message",
      messagePlaceholder: "The notice, the instruction, the info to pass on...",
      submit: "Send the announcement",
      sending: "Sending...",
      allCompany: "the whole company",
      someCount: (count) => `${count} colleague(s)`,
      success: (target) => `Announcement sent to ${target}.`,
      groupTarget: (count) => `Target group (${count} people)`,
      allTarget: "All colleagues",
    },
    offlineModal: {
      title: "This colleague is offline",
      status: "Currently offline",
      body:
        "isn't online in the app. The call may not ring on their device straight away.",
      callAnyway: "📞 Call anyway",
    },
    errors: {
      sendMessage: "The message didn't go out. Try again.",
      sendBroadcast: "The announcement didn't go out. Try again.",
      noRecipient: "Tick at least one colleague, or switch to everyone.",
      audioInit: "The call module is still warming up. Try again in a moment.",
    },
  },
  calls: {
    title: "Call log and traceability",
    subtitle:
      "Direct calls, missed calls and how long the online conferences ran.",
    scopeMine: "My calls",
    scopeCompany: "Company traceability",
    scopeCompanyTitle: "See every colleague's calls (management only)",
    kpi: {
      missed: "Missed calls",
      missedPending: "To call back",
      missedNone: "Nothing to catch up",
      direct: "Direct calls",
      directDetail: "Incoming and outgoing",
      conference: "Conferences",
      conferenceDetail: "Rooms held",
      total: "Total time",
      totalDetail: "Time spent on the phone",
    },
    filters: {
      all: (count) => `All (${count})`,
      missed: (count) => `🔴 Missed (${count})`,
      direct: (count) => `📞 Direct calls (${count})`,
      conference: (count) => `🎙️ Conferences (${count})`,
    },
    searchPlaceholder: "Search a name...",
    loading: "Loading the call history...",
    empty: "No call in this category.",
    toName: (name) => `To ${name}`,
    fromName: (name) => `From ${name}`,
    missedBadge: "MISSED CALL",
    notAnswered: "Not answered (0 s)",
    duration: (value) => `Duration: ${value}`,
    missedDuration: "00:00 (missed)",
    hourUnit: "h",
    minuteUnit: "m",
    secondUnit: "s",
    todayAt: (time) => `Today at ${time}`,
    yesterdayAt: (time) => `Yesterday at ${time}`,
    dateAt: (date, time) => `${date} at ${time}`,
    joinRoom: "Join the room",
    callBack: "Call back",
    call: "Call",
  },
  conference: {
    fallbackName: "Online conference",
    fallbackDescription: "Live audio room",
    rooms: {
      CONF_DIRECTION: {
        name: "Management and strategy room",
        description: "Board meeting, trade-offs, big decisions",
      },
      CONF_ATELIER: {
        name: "Workshop and service technical conference",
        description: "Repairs, diagnostics and parts, we sort it together",
      },
      CONF_COMMERCIAL: {
        name: "Sales and showroom conference",
        description: "Sales check-in, open quotes, customer deliveries",
      },
      CONF_GENERAL: {
        name: "Company-wide conference",
        description: "The team check-in, open to everyone",
      },
    },
    categories: {
      DIRECTION: "Management",
      ATELIER: "Workshop",
      COMMERCIAL: "Sales",
      GENERAL: "General",
    },
    live: "🟢 LIVE",
    open: "ROOM OPEN",
    participantsInRoom: (count) => `People in this room (${count})`,
    emptyRoom: "Nobody here yet. Be the first one in.",
    lobbyText: "Join in and talk live with management and the teams.",
    join: "Enter the room",
    me: (name) => `${name} (me)`,
    micOff: "Mic off",
    micOn: "Mic on",
    listening: "Listening",
    mute: "Mute my mic",
    unmute: "Unmute my mic",
    invite: "Invite a colleague",
    inviteTitle: "Invite a colleague",
    inviteText: (room) =>
      `Pick a colleague. They get an alert to join "${room}".`,
    invited: "Invited ✓",
    inviteOne: "Invite",
    leave: "Leave the room",
    closeForAll: "Close for everyone (DG)",
    closeForAllTitle: "Ends the room for every participant and saves the duration",
    closeConfirm:
      "Close this conference for everyone and save the duration in the log?",
    errors: {
      joinFailed: "Couldn't get into the room.",
    },
  },
  notifications: {
    unreadMessages: (count) => `${count} unread message(s)`,
    missedCalls: (count) => `${count} missed call(s)`,
    unreadAnnouncements: (count) => `${count} unread announcement(s)`,
  },
};

const zh: CommsCopy = {
  dateLocale: "zh-CN",
  timeLocale: "zh-CN",
  common: {
    cancel: "取消",
    close: "关闭",
  },
  mail: {
    folders: {
      INBOX: "收件箱",
      SENT: "已发送",
      STARRED: "星标",
      DRAFT: "草稿",
      TRASH: "垃圾箱",
    },
    composeOpen: "写邮件",
    accountsTitle: "已连接账户",
    searchPlaceholder: "搜索邮件或发件人...",
    sync: "同步",
    syncTitle: "拉取新邮件",
    backToList: "返回邮件列表",
    reply: "回复",
    delete: "删除",
    from: "发件人：",
    to: "收件人：",
    toPrefix: "收件人：",
    emptyFolder: "这个文件夹是空的。",
    replyTitle: (name) => `回复 ${name}`,
    composeTitle: "新邮件",
    composeSubtitle: "邮件由 CARZONE SARL 发出。",
    recipient: "收件人",
    customerPlaceholder: "从列表里选一位客户...",
    recipientPlaceholder: "client@domaine.bj",
    subject: "主题",
    subjectPlaceholder: "例：CARZONE SARL 报价单、订单确认",
    messageLabel: "正文",
    draftBody:
      "您好，\n\n感谢您对我们的信任。\n\n顺祝商祺，\nCARZONE SARL 团队",
    quoteHeader: (name) => `\n\n--- 以下是 ${name} 的原始邮件 ---\n`,
    send: "发送邮件",
    attachments: {
      title: "附件",
      empty: "暂时没有附件。",
      add: "添加附件",
      tooBig: "文件太大。单个文件不超过 10 MB。",
    },
    errors: {
      sendFailed: "邮件没发出去，请重试。",
      emptyRecipient: "还没有填收件人。",
    },
  },
  chat: {
    title: "团队消息",
    searchColleague: "搜索同事...",
    channelsTitle: "团队频道",
    channels: {
      general: "# 综合（全体）",
      workshop: "# 售后车间",
      sales: "# 展厅销售",
      broadcast: "📢 管理层公告",
    },
    callsSectionTitle: "通话与会议",
    callHistory: "📞 通话记录",
    directsTitle: (count) => `私聊与通话（${count}）`,
    presence: {
      online: "在线",
      away: "暂离",
      offline: "离线",
    },
    subtitle: {
      channel: "面向全体同事的频道",
      broadcast: "管理层发布的正式公告",
      direct: "私聊与语音通话",
    },
    empty: "还没有消息。开个头，发第一条吧。",
    backToList: "返回列表",
    mic: "麦克风",
    micTitle: "测试或授权麦克风",
    call: {
      call: "通话",
      offline: "离线",
      offlineTitle: (name) => `${name} 现在不在应用里`,
      callTitle: (name) => `给 ${name} 发起语音通话`,
    },
    stickers: {
      title: "发送表情贴纸或回应",
      labels: {
        "🚗": "车辆已备好",
        "✅": "已确认",
        "🔧": "维修中",
        "⚡": "紧急",
        "🤝": "客户同意了",
        "💰": "款已到账",
        "🎯": "目标达成",
        "📞": "请回电",
        "👏": "团队干得好",
        "🚀": "正在交付",
      },
    },
    placeholder: {
      channel: (channel) => `在 #${channel} 里说点什么...（回车发送）`,
      broadcast: "写一条全员公告...",
      direct: (name) => `给 ${name} 发消息...`,
    },
    broadcast: {
      button: "发布公告",
      buttonTitle: "向全体同事发送公告",
      badge: "管理层公告",
      title: "管理层公告",
      modalTitle: "管理层公告",
      recipientsLabel: "发给谁？",
      optionAll: "📢 一次性发给所有人（全公司）",
      optionCustom: "👥 只发给某个小组",
      groups: {
        workshop: "🔧 售后车间组",
        sales: "🚗 销售与展厅",
        finance: "💳 财务与会计",
        direction: "👑 管理层与行政",
      },
      selectedCount: (count) => `已选 ${count} 位同事：`,
      selectAll: "全选",
      deselectAll: "全不选",
      messageLabel: "正式内容",
      messagePlaceholder: "通知、要求或要传达的信息...",
      submit: "发送公告",
      sending: "正在发送...",
      allCompany: "全公司",
      someCount: (count) => `${count} 位同事`,
      success: (target) => `公告已发送：${target}。`,
      groupTarget: (count) => `指定小组（${count} 人）`,
      allTarget: "全体同事",
    },
    offlineModal: {
      title: "这位同事不在线",
      status: "目前离线",
      body: "现在不在应用里。电话可能不会马上响在他的设备上。",
      callAnyway: "📞 仍然拨打",
    },
    errors: {
      sendMessage: "消息没发出去，请重试。",
      sendBroadcast: "公告没发出去，请重试。",
      noRecipient: "至少勾选一位同事，或者改成发给所有人。",
      audioInit: "通话模块还在准备，请稍后再试。",
    },
  },
  calls: {
    title: "通话记录与可追溯",
    subtitle: "直拨、未接来电，以及线上会议开了多久。",
    scopeMine: "我的通话",
    scopeCompany: "全公司可追溯",
    scopeCompanyTitle: "查看所有同事的通话（仅限管理层）",
    kpi: {
      missed: "未接来电",
      missedPending: "需要回电",
      missedNone: "没有要补的",
      direct: "直拨通话",
      directDetail: "呼入与呼出",
      conference: "会议",
      conferenceDetail: "开过的会议室",
      total: "累计时长",
      totalDetail: "通话总时间",
    },
    filters: {
      all: (count) => `全部（${count}）`,
      missed: (count) => `🔴 未接（${count}）`,
      direct: (count) => `📞 直拨（${count}）`,
      conference: (count) => `🎙️ 会议（${count}）`,
    },
    searchPlaceholder: "按姓名搜索...",
    loading: "正在加载通话记录...",
    empty: "这个分类里还没有通话。",
    toName: (name) => `拨给 ${name}`,
    fromName: (name) => `来自 ${name}`,
    missedBadge: "未接来电",
    notAnswered: "未接通（0 秒）",
    duration: (value) => `时长：${value}`,
    missedDuration: "00:00（未接）",
    hourUnit: "小时",
    minuteUnit: "分",
    secondUnit: "秒",
    todayAt: (time) => `今天 ${time}`,
    yesterdayAt: (time) => `昨天 ${time}`,
    dateAt: (date, time) => `${date} ${time}`,
    joinRoom: "进入会议室",
    callBack: "回电",
    call: "拨打",
  },
  conference: {
    fallbackName: "线上会议",
    fallbackDescription: "实时语音会议室",
    rooms: {
      CONF_DIRECTION: {
        name: "管理层与战略会议室",
        description: "管理层碰头，权衡取舍，定方向",
      },
      CONF_ATELIER: {
        name: "售后车间技术会议",
        description: "维修、诊断和配件，一起理清楚",
      },
      CONF_COMMERCIAL: {
        name: "销售与展厅会议",
        description: "过一遍销售、在谈报价和客户交付",
      },
      CONF_GENERAL: {
        name: "公司全员会议",
        description: "全员碰头，谁都能参加",
      },
    },
    categories: {
      DIRECTION: "管理层",
      ATELIER: "车间",
      COMMERCIAL: "销售",
      GENERAL: "综合",
    },
    live: "🟢 进行中",
    open: "会议室开放",
    participantsInRoom: (count) => `会议室内（${count} 人）`,
    emptyRoom: "还没有人进来。您可以先进。",
    lobbyText: "进去就能和管理层、同事直接说话。",
    join: "进入会议室",
    me: (name) => `${name}（我）`,
    micOff: "麦克风已关",
    micOn: "麦克风已开",
    listening: "正在听",
    mute: "关闭我的麦克风",
    unmute: "打开我的麦克风",
    invite: "邀请同事",
    inviteTitle: "邀请同事",
    inviteText: (room) => `选一位同事，他会收到进入「${room}」的提醒。`,
    invited: "已邀请 ✓",
    inviteOne: "邀请",
    leave: "离开会议室",
    closeForAll: "为所有人结束（总经理）",
    closeForAllTitle: "为所有参与者结束会议，并记录时长",
    closeConfirm: "要为所有人结束这场会议，并把时长记进通话记录吗？",
    errors: {
      joinFailed: "进不了这个会议室。",
    },
  },
  notifications: {
    unreadMessages: (count) => `${count} 条未读消息`,
    missedCalls: (count) => `${count} 个未接来电`,
    unreadAnnouncements: (count) => `${count} 条未读公告`,
  },
};

export const commsCopy: Record<Locale, CommsCopy> = { fr, en, zh };
