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
        background: "rgba(225, 29, 72, 0.14)",
        border: "1px solid rgba(225, 29, 72, 0.45)",
        color: "#fda4af",
      }}
    >
      {pending ? "..." : label}
    </button>
  );
}
