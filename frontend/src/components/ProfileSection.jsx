import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function ProfileSection({ onProfileSaved }) {
  const { fetchProfile, updateProfile, changePassword } = useAuth();
  const [profile, setProfile] = useState(null);
  const [fullName, setFullName] = useState("");
  const [studioName, setStudioName] = useState("");
  const [depositPercent, setDepositPercent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPass, setChangingPass] = useState(false);
  const [passError, setPassError] = useState("");
  const [passSuccess, setPassSuccess] = useState("");

  useEffect(() => {
    let active = true;
    fetchProfile()
      .then((data) => {
        if (!active) return;
        setProfile(data);
        setFullName(data.fullName || "");
        setStudioName(data.studioName || "");
        setDepositPercent(data.depositPercent ?? "");
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [fetchProfile]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!fullName.trim() || fullName.trim().length < 2) {
      setError("Full name must be at least 2 characters.");
      return;
    }

    const parsedDeposit =
      profile?.role === "ARTIST" && depositPercent !== ""
        ? Number(depositPercent)
        : null;

    if (
      parsedDeposit !== null &&
      (Number.isNaN(parsedDeposit) || parsedDeposit < 0 || parsedDeposit > 100)
    ) {
      setError("Deposit percent must be between 0 and 100.");
      return;
    }

    const payload = {
      fullName: fullName.trim(),
      studioName: profile?.role === "ARTIST" ? studioName.trim() : null,
      depositPercent: parsedDeposit,
    };

    setSaving(true);
    try {
      const updated = await updateProfile(payload);
      setProfile(updated);
      setFullName(updated.fullName || "");
      setStudioName(updated.studioName || "");
      setDepositPercent(updated.depositPercent ?? "");
      setSuccess("Profile updated successfully.");
      onProfileSaved?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setPassError("");
    setPassSuccess("");

    if (!currentPassword) {
      setPassError("Current password is required.");
      return;
    }
    if (newPassword.length < 8) {
      setPassError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassError("New password and confirmation do not match.");
      return;
    }

    setChangingPass(true);
    try {
      const res = await changePassword(currentPassword, newPassword);
      setPassSuccess(res.message || "Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPassError(err.message);
    } finally {
      setChangingPass(false);
    }
  }

  if (loading) return <p>Loading profile...</p>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <section>
        <h2>User Profile</h2>
        <p><strong>Email:</strong> {profile?.email}</p>
        <p><strong>Role:</strong> {profile?.role}</p>

        {error && <p role="alert" style={{ color: "#fca5a5" }}>{error}</p>}
        {success && <p style={{ color: "#86efac" }}>{success}</p>}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxWidth: "420px" }}>
          <div>
            <label htmlFor="profile-fullname">Full Name</label>
            <input
              id="profile-fullname"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              style={{ width: "100%", padding: "0.55rem", marginTop: "0.25rem", borderRadius: "6px", border: "1px solid #444", background: "#2a2a2d", color: "#fff" }}
            />
          </div>

          {profile?.role === "ARTIST" && (
            <>
              <div>
                <label htmlFor="profile-studio">Studio Name</label>
                <input
                  id="profile-studio"
                  type="text"
                  value={studioName}
                  onChange={(e) => setStudioName(e.target.value)}
                  style={{ width: "100%", padding: "0.55rem", marginTop: "0.25rem", borderRadius: "6px", border: "1px solid #444", background: "#2a2a2d", color: "#fff" }}
                />
              </div>
              <div>
                <label htmlFor="profile-deposit">Deposit Percent (%)</label>
                <input
                  id="profile-deposit"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={depositPercent}
                  onChange={(e) => setDepositPercent(e.target.value)}
                  style={{ width: "100%", padding: "0.55rem", marginTop: "0.25rem", borderRadius: "6px", border: "1px solid #444", background: "#2a2a2d", color: "#fff" }}
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={saving}
            style={{ alignSelf: "flex-start", padding: "0.6rem 1.1rem", borderRadius: "6px", border: "none", background: "#e11d48", color: "#fff", fontWeight: "600", cursor: "pointer" }}
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </section>

      <hr style={{ borderColor: "#333", width: "100%" }} />

      <section>
        <h3>Change Password</h3>
        {passError && <p role="alert" style={{ color: "#fca5a5" }}>{passError}</p>}
        {passSuccess && <p style={{ color: "#86efac" }}>{passSuccess}</p>}

        <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxWidth: "420px" }}>
          <div>
            <label htmlFor="current-password">Current Password</label>
            <input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              style={{ width: "100%", padding: "0.55rem", marginTop: "0.25rem", borderRadius: "6px", border: "1px solid #444", background: "#2a2a2d", color: "#fff" }}
            />
          </div>

          <div>
            <label htmlFor="new-password">New Password</label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
              style={{ width: "100%", padding: "0.55rem", marginTop: "0.25rem", borderRadius: "6px", border: "1px solid #444", background: "#2a2a2d", color: "#fff" }}
            />
          </div>

          <div>
            <label htmlFor="confirm-new-password">Confirm New Password</label>
            <input
              id="confirm-new-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              required
              style={{ width: "100%", padding: "0.55rem", marginTop: "0.25rem", borderRadius: "6px", border: "1px solid #444", background: "#2a2a2d", color: "#fff" }}
            />
          </div>

          <button
            type="submit"
            disabled={changingPass}
            style={{ alignSelf: "flex-start", padding: "0.6rem 1.1rem", borderRadius: "6px", border: "none", background: "#e11d48", color: "#fff", fontWeight: "600", cursor: "pointer" }}
          >
            {changingPass ? "Updating..." : "Update Password"}
          </button>
        </form>
      </section>
    </div>
  );
}