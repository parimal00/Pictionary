import { useState, type SubmitEvent } from "react";
import { type User } from "../types/user";
import { useGuestLogin } from "../hooks/useGuestLogin";

interface GuestLoginProps {
  onLogin: (user: User) => void;
}

export function GuestLogin({ onLogin }: GuestLoginProps) {
  const [username, setUsername] = useState("");
  
  const { mutate: login, isPending, error } = useGuestLogin(onLogin);
  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!username.trim() || isPending) return;
    const newUser: User = {
      id: `guest_${Math.random().toString(36).substring(2, 9)}`,
      username: username.trim(),
    };

    login(""+newUser.username);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Game Logo Header */}
        <div style={styles.header}>
          <div style={styles.iconBadge}>🎨</div>
          <h1 style={styles.title}>
            PICTIONARY<span style={styles.accent}>.IO</span>
          </h1>
          <p style={styles.subtitle}>Draw, guess, and compete in real-time!</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label htmlFor="username" style={styles.label}>
              Choose Your Display Name
            </label>
            <input
              id="username"
              type="text"
              placeholder="e.g. MasterSketcher"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
              maxLength={16}
              autoFocus
            />
          </div>

          {error && <p style={styles.errorText}>{error.message}</p>}
          <button
            type="submit"
            disabled={!username.trim()}
            style={{
              ...styles.button,
              opacity: username.trim() ? 1 : 0.6,
              cursor: username.trim() ? "pointer" : "not-allowed",
            }}
          >
           {isPending ? "Entering..." : "Enter Game Lobby"}
          </button>
        </form>

        <div style={styles.footer}>
          <span>⚡ Quick Join • No registration required</span>
        </div>
      </div>
    </div>
  );
}

// Modern Inline Styling Object
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0f172a",
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    padding: "1rem",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    backgroundColor: "#1e293b",
    borderRadius: "16px",
    padding: "2.5rem 2rem",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)",
    border: "1px solid #334155",
  },
  header: {
    textAlign: "center",
    marginBottom: "2rem",
  },
  iconBadge: {
    fontSize: "2.5rem",
    marginBottom: "0.5rem",
  },
  title: {
    margin: 0,
    fontSize: "2rem",
    fontWeight: "800",
    letterSpacing: "1px",
    color: "#ffffff",
  },
  accent: {
    color: "#6366f1",
  },
  subtitle: {
    margin: "0.5rem 0 0",
    color: "#94a3b8",
    fontSize: "0.9rem",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    textAlign: "left",
  },
  label: {
    fontSize: "0.85rem",
    fontWeight: "600",
    color: "#cbd5e1",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  input: {
    padding: "0.85rem 1rem",
    borderRadius: "8px",
    border: "1px solid #475569",
    backgroundColor: "#0f172a",
    color: "#ffffff",
    fontSize: "1rem",
    outline: "none",
  },
  button: {
    padding: "0.9rem",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#6366f1",
    color: "#ffffff",
    fontSize: "1rem",
    fontWeight: "700",
    transition: "all 0.2s ease-in-out",
  },
  footer: {
    marginTop: "1.75rem",
    textAlign: "center",
    fontSize: "0.8rem",
    color: "#64748b",
  },
};