import { useState, useEffect, useMemo } from "react";
import { apiClient } from "../AxiosSetup";
import { useAuth } from "../AuthProvider";

const PAGE_SIZE = 30;

const AttendanceHistoryPage = ({
  initialMonthlyLogs = null,
  initialMonthlyMetrics = null,
}) => {
  const { uid } = useAuth();
  const [view, setView] = useState("monthly"); // 'monthly' or 'all'
  const [logs, setLogs] = useState([]);
  const [cache, setCache] = useState({
    monthly: initialMonthlyLogs,
    all: null,
  });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [metrics, setMetrics] = useState({
    totalDays: 0,
    currentStreak: 0,
    longestStreak: 0,
  });

  const totalPages = Math.ceil(logs.length / PAGE_SIZE);
  const paginatedLogs = logs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      if (cache[view]) {
        setLogs(cache[view].logs);
        setMetrics(cache[view].metrics);
        setPage(1);
        setLoading(false);
        return;
      }

      const endpoint =
        view === "monthly"
          ? `/attendance/user/month/${uid}`
          : `/attendance/user/${uid}`;
      const res = await apiClient.get(
        `${import.meta.env.VITE_BACKEND_URL}${endpoint}`,
      );

      const fetchedLogs =
        view === "monthly" ? res.data.monthly_attendance : res.data.logs;
      const fetchedMetrics =
        view === "monthly"
          ? initialMonthlyMetrics || {}
          : res.data.metrics || {};

      setLogs(fetchedLogs);
      setMetrics(fetchedMetrics);
      setCache((prev) => ({
        ...prev,
        [view]: { logs: fetchedLogs, metrics: fetchedMetrics },
      }));
      setPage(1);
    } catch (err) {
      console.error("Error fetching attendance logs:", err);
      setLogs([]);
      setMetrics({ totalDays: 0, currentStreak: 0, longestStreak: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if ((view === "monthly" && !initialMonthlyLogs) || view === "all") {
      fetchLogs();
    } else {
      setLogs(initialMonthlyLogs);
      setMetrics(initialMonthlyMetrics);
      setPage(1);
      setLoading(false);
    }
  }, [view]);

  const handlePrev = () => setPage((p) => Math.max(p - 1, 1));
  const handleNext = () => setPage((p) => Math.min(p + 1, totalPages));

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Attendance History</h1>

      <div style={{ marginBottom: "1rem" }}>
        <button
          onClick={() => setView("monthly")}
          style={{
            background: view === "monthly" ? "#007bff" : "#ccc",
            color: "#fff",
            padding: "0.5rem 1rem",
            marginRight: "1rem",
            border: "none",
            cursor: "pointer",
          }}
        >
          Monthly
        </button>
        <button
          onClick={() => setView("all")}
          style={{
            background: view === "all" ? "#007bff" : "#ccc",
            color: "#fff",
            padding: "0.5rem 1rem",
            border: "none",
            cursor: "pointer",
          }}
        >
          All Time
        </button>
      </div>

      <div
        style={{
          background: "#f5f5f5",
          padding: "1rem",
          borderRadius: "10px",
          marginBottom: "1rem",
        }}
      >
        <h3>📊 Your Stats</h3>
        <p>
          Total Days Attended: <strong>{metrics.totalDays}</strong>
        </p>
        {view === "monthly" && (
          <p>
            Current Streak: <strong>{metrics.streak}</strong> 🔥
          </p>
        )}
        {view === "all" && (
          <p>
            Longest Streak: <strong>{metrics.longestStreak}</strong> 🔥
          </p>
        )}
      </div>

      {loading ? (
        <p>Loading attendance logs...</p>
      ) : paginatedLogs.length === 0 ? (
        <p>No attendance logs found.</p>
      ) : (
        <>
          <div style={{ display: "grid", gap: "1rem" }}>
            {paginatedLogs.map((log) => (
              <div
                key={log.id}
                style={{
                  padding: "1rem",
                  borderRadius: "10px",
                  backgroundColor:
                    log.status === "Missed" ? "#ffe6e6" : "#e6ffea",
                  border:
                    log.status === "Missed"
                      ? "1px solid #ff4d4f"
                      : "1px solid #52c41a",
                }}
              >
                <strong>{log.date}</strong>
                <p
                  style={{
                    color: log.status === "Missed" ? "#ff4d4f" : "#52c41a",
                    margin: 0,
                  }}
                >
                  {log.status || "Attended"}
                </p>
              </div>
            ))}
          </div>

          <div style={{ marginTop: "1rem" }}>
            <button
              onClick={handlePrev}
              disabled={page === 1}
              style={{ marginRight: "1rem" }}
            >
              ⬅️ Prev
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={handleNext}
              disabled={page === totalPages}
              style={{ marginLeft: "1rem" }}
            >
              Next ➡️
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AttendanceHistoryPage;
