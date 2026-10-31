import { PrefsControls } from "@/components/PrefsControls";
import { CarzoneLogo } from "@/components/CarzoneLogo";
import { getServerMessages } from "@/lib/i18n/server";
import { LoginFeedback } from "./LoginFeedback";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    sec?: string;
    stage?: string;
    label?: string;
    remaining?: string;
    email?: string;
  }>;
}) {
  const params = await searchParams;
  const { messages } = await getServerMessages();

  return (
    <div className="ox-login-page">
      <div className="ox-login-prefs">
        <PrefsControls />
      </div>
      <form
        action="/api/auth/login"
        method="post"
        className="ox-glass"
        style={{
          width: "100%",
          maxWidth: 420,
          padding: "2rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.9rem",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, textAlign: "center" }}>
          <CarzoneLogo size="lg" priority />
          <p style={{ margin: 0, opacity: 0.75, fontSize: "0.92rem" }}>{messages.brand.subtitle}</p>
        </div>

        <LoginFeedback
          error={params.error}
          sec={params.sec}
          stage={params.stage}
          label={params.label}
          remaining={params.remaining}
          defaultErrorMessage={messages.login.error}
        />

        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {messages.login.email}
          <input
            name="email"
            type="email"
            required
            autoComplete="username"
            defaultValue={params.email || ""}
            placeholder="contact@topcarzone.com"
            className="ox-input"
            title={messages.login.emailTitle}
          />
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {messages.login.password}
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            className="ox-input"
            title={messages.login.passwordTitle}
          />
        </label>
        <button
          type="submit"
          className="ox-btn"
          style={{ marginTop: 8, padding: "0.75rem", width: "100%" }}
          title={messages.login.submitTitle}
        >
          {messages.login.submit}
        </button>
      </form>
    </div>
  );
}
