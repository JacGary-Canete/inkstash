import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "CLIENT",
    studioName: "",
    depositPercent: "20",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.fullName.trim() || !form.email.trim() || !form.password) {
      setError("Full name, email, and password are required.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    const payload = {
      fullName: form.fullName,
      email: form.email,
      password: form.password,
      role: form.role,
      studioName: form.role === "ARTIST" ? form.studioName : null,
      depositPercent: form.role === "ARTIST" && form.depositPercent !== "" ? Number(form.depositPercent) : null,
    };

    setSubmitting(true);
    try {
      const created = await register(payload);
      navigate(created.role === "ARTIST" ? "/artist/dashboard" : "/client/dashboard", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h2>Create InkStash Account</h2>
        {error && <div style={styles.error}>{error}</div>}

        <label style={styles.label}>Full Name *</label>
        <input
          type="text"
          value={form.fullName}
          onChange={(e) => updateField("fullName", e.target.value)}
          placeholder="Jane Doe"
          style={styles.input}
          required
        />

        <label style={styles.label}>Email *</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => updateField("email", e.target.value)}
          placeholder="jane@example.com"
          style={styles.input}
          required
        />

        <label style={styles.label}>Password (min 8 chars) *</label>
        <input
          type="password"
          value={form.password}
          onChange={(e) => updateField("password", e.target.value)}
          placeholder="••••••••"
          style={styles.input}
          required
        />

        <label style={styles.label}>Account Role *</label>
        <select
          value={form.role}
          onChange={(e) => updateField("role", e.target.value)}
          style={styles.input}
        >
          <option value="CLIENT">Client (Book Flash Tattoos)</option>
          <option value="ARTIST">Tattoo Artist (Publish Flash & Manage Deposits)</option>
        </select>

        {form.role === "ARTIST" && (
          <>
            <label style={styles.label}>Studio Name</label>
            <input
              type="text"
              value={form.studioName}
              onChange={(e) => updateField("studioName", e.target.value)}
              placeholder="Blackwork Studio"
              style={styles.input}
            />

            <label style={styles.label}>Required Deposit (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={form.depositPercent}
              onChange={(e) => updateField("depositPercent", e.target.value)}
              style={styles.input}
            />
          </>
        )}

        <button type="submit" disabled={submitting} style={styles.button}>
          {submitting ? "Creating account..." : "Register"}
        </button>

        <p style={styles.footerText}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#111", color: "#f5f5f5", fontFamily: "system-ui, sans-serif", padding: "1rem" },
  card: { width: "100%", maxWidth: "420px", background: "#1c1c1e", padding: "2rem", borderRadius: "10px", border: "1px solid #333", display: "flex", flexDirection: "column", gap: "0.65rem" },
  label: { fontSize: "0.9rem", color: "#ccc" },
  input: { padding: "0.65rem", borderRadius: "6px", border: "1px solid #444", background: "#2a2a2d", color: "#fff" },
  button: { marginTop: "0.5rem", padding: "0.75rem", borderRadius: "6px", border: "none", background: "#e11d48", color: "#fff", fontWeight: "600", cursor: "pointer" },
  error: { background: "#450a0a", border: "1px solid #dc2626", color: "#fecaca", padding: "0.65rem", borderRadius: "6px", fontSize: "0.9rem" },
  footerText: { fontSize: "0.9rem", textAlign: "center", marginTop: "0.5rem" },
};