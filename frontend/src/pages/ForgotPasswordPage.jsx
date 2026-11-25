import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setResult(null);

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    setSubmitting(true);
    try {
      const data = await forgotPassword(email);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h2>Forgot Password</h2>
        <p style={styles.subtext}>Enter your registered email to generate a password reset link.</p>

        {error && <div style={styles.error}>{error}</div>}
        {result && (
          <div style={styles.success}>
            <p style={{ margin: 0 }}>{result.message}</p>
            {result.resetToken && (
              <p style={{ marginTop: "0.6rem", wordBreak: "break-all" }}>
                <strong>Reset Link:</strong>{" "}
                <Link
                  to={`/reset-password?token=${encodeURIComponent(result.resetToken)}`}
                  style={{ color: "#fda4af" }}
                >
                  Reset Password Now
                </Link>
              </p>
            )}
          </div>
        )}

        <label style={styles.label}>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          style={styles.input}
          required
        />

        <button type="submit" disabled={submitting} style={styles.button}>
          {submitting ? "Sending..." : "Request Reset Link"}
        </button>

        <p style={styles.footerText}>
          Remembered your password? <Link to="/login">Back to Login</Link>
        </p>
      </form>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#111", color: "#f5f5f5", fontFamily: "system-ui, sans-serif" },
  card: { width: "100%", maxWidth: "420px", background: "#1c1c1e", padding: "2rem", borderRadius: "10px", border: "1px solid #333", display: "flex", flexDirection: "column", gap: "0.75rem" },
  subtext: { fontSize: "0.9rem", color: "#a1a1aa", margin: 0 },
  label: { fontSize: "0.9rem", color: "#ccc" },
  input: { padding: "0.65rem", borderRadius: "6px", border: "1px solid #444", background: "#2a2a2d", color: "#fff" },
  button: { marginTop: "0.5rem", padding: "0.75rem", borderRadius: "6px", border: "none", background: "#e11d48", color: "#fff", fontWeight: "600", cursor: "pointer" },
  error: { background: "#450a0a", border: "1px solid #dc2626", color: "#fecaca", padding: "0.65rem", borderRadius: "6px", fontSize: "0.9rem" },
  success: { background: "#052e16", border: "1px solid #16a34a", color: "#bbf7d0", padding: "0.75rem", borderRadius: "6px", fontSize: "0.9rem" },
  footerText: { fontSize: "0.9rem", textAlign: "center", marginTop: "0.5rem" },
};