import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function ProfileSection() {
  const { fetchProfile, updateProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [fullName, setFullName] = useState("");
  const [studioName, setStudioName] = useState("");
  const [depositPercent, setDepositPercent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!fullName.trim() || fullName.trim().length < 2) {
      setError("Full name must be at least 2 characters.");
      return;
    }

    const payload = {
      fullName: fullName.trim(),
      studioName: profile?.role === "ARTIST" ? studioName.trim() : null,
      depositPercent:
        profile?.role === "ARTIST" && depositPercent !== ""
          ? Number(depositPercent)
          : null,
    };

    setSaving(true);
    try {
      const updated = await updateProfile(payload);
      setProfile(updated);
      setFullName(updated.fullName || "");
      setStudioName(updated.studioName || "");
      setDepositPercent(updated.depositPercent ?? "");
      setSuccess("Profile updated successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p>Loading profile...</p>;

  return (
    <section>
      <h2>User Profile</h2>
      <p><strong>Email:</strong> {profile?.email}</p>
      <p><strong>Role:</strong> {profile?.role}</p>

      {error && <p role="alert">{error}</p>}
      {success && <p>{success}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="profile-fullname">Full Name</label>
          <input
            id="profile-fullname"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
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
              />
            </div>
          </>
        )}

        <button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </form>
    </section>
  );
}