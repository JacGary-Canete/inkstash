import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("Email and password are required.");
      return;
    }

    setSubmitting(true);
    try {
      const loggedIn = await login(email, password);
      navigate(loggedIn.role === "ARTIST" ? "/artist/dashboard" : "/client/dashboard", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h2>InkStash Login</h2>
        {error && <div style={styles.error}>{error}</div>}

        <label style={styles.label}>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          style={styles.input}
          required
        />

        <label style={styles.label}>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          style={styles.input}
          required
        />

        <button type="submit" disabled={submitting} style={styles.button}>
          {submitting ? "Signing in..." : "Sign In"}
        </button>

        <p style={styles.footerText}>
          Don&apos;t have an account? <Link to="/register">Create one</Link>
        </p>
      </form>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#111", color: "#f5f5f5", fontFamily: "system-ui, sans-serif" },
  card: { width: "100%", maxWidth: "400px", background: "#1c1c1e", padding: "2rem", borderRadius: "10px", border: "1px solid #333", display: "flex", flexDirection: "column", gap: "0.75rem" },
  label: { fontSize: "0.9rem", color: "#ccc" },
  input: { padding: "0.65rem", borderRadius: "6px", border: "1px solid #444", background: "#2a2a2d", color: "#fff" },
  button: { marginTop: "0.5rem", padding: "0.75rem", borderRadius: "6px", border: "none", background: "#e11d48", color: "#fff", fontWeight: "600", cursor: "pointer" },
  error: { background: "#450a0a", border: "1px solid #dc2626", color: "#fecaca", padding: "0.65rem", borderRadius: "6px", fontSize: "0.9rem" },
  footerText: { fontSize: "0.9rem", textAlign: "center", marginTop: "0.5rem" },
};