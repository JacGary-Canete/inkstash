import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ProfileSection from "../components/ProfileSection";

export default function ArtistDashboard() {
  const { user, logout, API_BASE } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [activeTab, setActiveTab] = useState("Manage Flash Catalog");
  const [rbacStatus, setRbacStatus] = useState("");

  const loadDashboard = useCallback(() => {
    fetch(`${API_BASE}/artist/dashboard`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setDashboardData(data));
  }, [API_BASE]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  async function testClientEndpoint() {
    const res = await fetch(`${API_BASE}/client/dashboard`, { credentials: "include" });
    setRbacStatus(`Backend RBAC Check (/api/client/dashboard): HTTP ${res.status} Forbidden`);
  }

  const navItems = dashboardData?.allowedModules || [
    "Manage Flash Catalog",
    "Client Bookings & Deposits",
    "Availability Calendar",
    "Studio Profile",
  ];

  return (
    <div style={styles.shell}>
      <aside style={styles.sidebar}>
        <h3>InkStash Studio</h3>
        <nav style={styles.nav}>
          {navItems.map((item) => (
            <button
              key={item}
              onClick={() => setActiveTab(item)}
              style={{ ...styles.navBtn, background: activeTab === item ? "#e11d48" : "transparent" }}
            >
              {item}
            </button>
          ))}
        </nav>
        <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
      </aside>

      <main style={styles.main}>
        <header style={styles.header}>
          <h1>Studio Portal: {user?.fullName}</h1>
          <span style={styles.badge}>ROLE: {user?.role}</span>
        </header>

        {activeTab === "Studio Profile" ? (
          <section style={styles.card}>
            <ProfileSection onProfileSaved={loadDashboard} />
          </section>
        ) : (
          <section style={styles.card}>
            <h2>{activeTab}</h2>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Studio Name:</strong> {dashboardData?.studioName || "Loading..."}</p>
            <p>
              <strong>Deposit Policy:</strong>{" "}
              {dashboardData?.depositPercent != null ? `${dashboardData.depositPercent}% required` : "Not configured"}
            </p>
            <button onClick={testClientEndpoint} style={styles.testBtn}>
              Verify Backend RBAC (Attempt Client Endpoint)
            </button>
            {rbacStatus && <p style={styles.rbacNote}>{rbacStatus}</p>}
          </section>
        )}
      </main>
    </div>
  );
}

const styles = {
  shell: { display: "flex", minHeight: "100vh", background: "#111", color: "#f5f5f5", fontFamily: "system-ui, sans-serif" },
  sidebar: { width: "250px", background: "#18181b", borderRight: "1px solid #2e2e32", padding: "1.5rem", display: "flex", flexDirection: "column", justifyContent: "space-between" },
  nav: { display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "1rem", flex: 1 },
  navBtn: { textAlign: "left", padding: "0.65rem 0.85rem", borderRadius: "6px", border: "none", color: "#fff", cursor: "pointer" },
  logoutBtn: { padding: "0.65rem", borderRadius: "6px", border: "1px solid #555", background: "transparent", color: "#fff", cursor: "pointer" },
  main: { flex: 1, padding: "2rem" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" },
  badge: { background: "#e11d48", padding: "0.35rem 0.75rem", borderRadius: "999px", fontSize: "0.8rem", fontWeight: "600" },
  card: { background: "#1c1c1e", padding: "1.5rem", borderRadius: "10px", border: "1px solid #333" },
  testBtn: { marginTop: "1rem", padding: "0.6rem 1rem", borderRadius: "6px", border: "1px solid #e11d48", background: "transparent", color: "#fda4af", cursor: "pointer" },
  rbacNote: { marginTop: "0.75rem", color: "#fbbf24", fontSize: "0.9rem" },
};