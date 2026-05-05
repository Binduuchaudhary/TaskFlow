import { AlertTriangle, CheckCircle2, Clock3, FolderKanban, ListTodo, UserCheck } from "lucide-react";
import { api } from "../api/client.js";
import ErrorMessage from "../components/ErrorMessage.jsx";
import PageHeader from "../components/PageHeader.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useAsync } from "../hooks/useAsync.js";

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, error, loading } = useAsync(() => api.dashboard(), []);
  const dashboard = data || {};
  const byStatus = dashboard.byStatus || {};

  return (
    <>
      <PageHeader title="Dashboard" subtitle={`Welcome, ${user.name}.`} />
      <ErrorMessage error={error} />

      {loading ? (
        <div className="loader" />
      ) : (
        <>
          <section className="metric-grid">
            <Metric icon={FolderKanban} label="Projects" value={dashboard.totalProjects} />
            <Metric icon={ListTodo} label="Total tasks" value={dashboard.totalTasks} />
            <Metric icon={UserCheck} label="My tasks" value={dashboard.myTasks} />
            <Metric icon={AlertTriangle} label="Overdue" value={dashboard.overdueTasks} tone="danger" />
          </section>

          <section className="content-band">
            <div className="section-title">
              <h2>Task status</h2>
            </div>
            <div className="status-grid">
              <StatusSummary icon={Clock3} label="Todo" value={byStatus.todo || 0} />
              <StatusSummary icon={ListTodo} label="In progress" value={byStatus["in-progress"] || 0} />
              <StatusSummary icon={CheckCircle2} label="Done" value={byStatus.done || 0} />
            </div>
          </section>
        </>
      )}
    </>
  );
}

function Metric({ icon: Icon, label, value, tone = "default" }) {
  return (
    <article className={`metric-card metric-${tone}`}>
      <Icon size={22} />
      <span>{label}</span>
      <strong>{value ?? 0}</strong>
    </article>
  );
}

function StatusSummary({ icon: Icon, label, value }) {
  return (
    <article className="status-summary">
      <Icon size={20} />
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}
