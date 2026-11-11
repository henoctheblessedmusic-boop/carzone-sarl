"use client";

import { useFormStatus } from "react-dom";

export function DeleteImportButton({
  label,
  title,
  confirmText,
}: {
  label: string;
  title: string;
  confirmText: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      title={title}
      disabled={pending}
      onClick={(event) => {
        if (!window.confirm(confirmText)) {
          event.preventDefault();
        }
      }}
      className="ox-btn"
      style={{
        padding: "0.35rem 0.6rem",
        fontSize: "0.8rem",
        background: "var(--accent-soft)",
        border: "1px solid var(--accent)",
        color: "var(--danger-fg)",
      }}
    >
      {pending ? "..." : label}
    </button>
  );
}
