import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState(searchParams.get("token") || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!token.trim()) {
      setError("Reset token is required.");
      return;
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await resetPassword(token.trim(), newPassword);
      setSuccess(res.message);
      setTimeout(() => navigate("/login", { replace: true }), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h2>Reset Password</h2>

        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>{success}</div>}

        <label style={styles.label}>Reset Token</label>
        <input
          type="text"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Paste your reset token"
          style={styles.input}
          required
        />

        <label style={styles.label}>New Password</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="At least 8 characters"
          style={styles.input}
          required
        />

        <label style={styles.label}>Confirm New Password</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Re-enter new password"
          style={styles.input}
          required
        />

        <button type="submit" disabled={submitting} style={styles.button}>
          {submitting ? "Resetting..." : "Reset Password"}
        </button>

        <p style={styles.footerText}>
          <Link to="/login">Back to Login</Link>
        </p>
      </form>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#111", color: "#f5f5f5", fontFamily: "system-ui, sans-serif" },
  card: { width: "100%", maxWidth: "420px", background: "#1c1c1e", padding: "2rem", borderRadius: "10px", border: "1px solid #333", display: "flex", flexDirection: "column", gap: "0.75rem" },
  label: { fontSize: "0.9rem", color: "#ccc" },
  input: { padding: "0.65rem", borderRadius: "6px", border: "1px solid #444", background: "#2a2a2d", color: "#fff" },
  button: { marginTop: "0.5rem", padding: "0.75rem", borderRadius: "6px", border: "none", background: "#e11d48", color: "#fff", fontWeight: "600", cursor: "pointer" },
  error: { background: "#450a0a", border: "1px solid #dc2626", color: "#fecaca", padding: "0.65rem", borderRadius: "6px", fontSize: "0.9rem" },
  success: { background: "#052e16", border: "1px solid #16a34a", color: "#bbf7d0", padding: "0.65rem", borderRadius: "6px", fontSize: "0.9rem" },
  footerText: { fontSize: "0.9rem", textAlign: "center", marginTop: "0.5rem" },
};