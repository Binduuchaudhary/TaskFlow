import { RefreshCcw, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { api } from "../api/client.js";
import EmptyState from "../components/EmptyState.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";
import PageHeader from "../components/PageHeader.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useAsync } from "../hooks/useAsync.js";
import { formatDate, isOverdue } from "../utils/date.js";

export default function TasksPage() {
  const { isAdmin, user } = useAuth();
  const [filters, setFilters] = useState({ status: "", overdue: "" });
  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.status) params.set("status", filters.status);
    if (filters.overdue) params.set("overdue", filters.overdue);
    return params.toString() ? `?${params.toString()}` : "";
  }, [filters]);

  const { data, error, loading, reload } = useAsync(() => api.tasks(query), [query]);
  const tasks = data?.tasks || [];

  const updateFilter = (event) => {
    setFilters((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  };

  const updateStatus = async (taskId, status) => {
    await api.updateTask(taskId, { status });
    reload();
  };

  const deleteTask = async (taskId) => {
    if (!window.confirm("Delete this task?")) return;
    await api.deleteTask(taskId);
    reload();
  };

  return (
    <>
      <PageHeader
        title="Tasks"
        subtitle="Track assigned work, progress, and overdue tasks."
        actions={
          <button className="secondary-button compact" type="button" onClick={reload}>
            <RefreshCcw size={17} />
            Refresh
          </button>
        }
      />

      <section className="toolbar">
        <label className="field compact-field">
          <span>Status</span>
          <select name="status" value={filters.status} onChange={updateFilter}>
            <option value="">All</option>
            <option value="todo">Todo</option>
            <option value="in-progress">In progress</option>
            <option value="done">Done</option>
          </select>
        </label>
        <label className="field compact-field">
          <span>Overdue</span>
          <select name="overdue" value={filters.overdue} onChange={updateFilter}>
            <option value="">All</option>
            <option value="true">Overdue only</option>
          </select>
        </label>
      </section>

      <ErrorMessage error={error} />

      {loading ? (
        <div className="loader" />
      ) : tasks.length === 0 ? (
        <EmptyState title="No tasks found" message="Change filters or create tasks from a project page." />
      ) : (
        <section className="task-list">
          {tasks.map((task) => {
            const canUpdate = isAdmin || task.assignedTo?._id === user.id;
            return (
              <article className="task-row" key={task._id}>
                <div>
                  <div className="task-title-line">
                    <strong>{task.title}</strong>
                    {isOverdue(task.dueDate, task.status) ? <span className="overdue-pill">Overdue</span> : null}
                  </div>
                  <p>{task.description || "No description added."}</p>
                  <div className="meta-row">
                    <span>{task.project?.name || "No project"}</span>
                    <span>{task.assignedTo?.name || "Unknown"}</span>
                    <span>{formatDate(task.dueDate)}</span>
                  </div>
                </div>
                <div className="task-actions">
                  <StatusBadge status={task.status} />
                  {canUpdate ? (
                    <select value={task.status} onChange={(event) => updateStatus(task._id, event.target.value)}>
                      <option value="todo">Todo</option>
                      <option value="in-progress">In progress</option>
                      <option value="done">Done</option>
                    </select>
                  ) : null}
                  {isAdmin ? (
                    <button className="icon-button danger" type="button" onClick={() => deleteTask(task._id)} title="Delete task">
                      <Trash2 size={17} />
                    </button>
                  ) : null}
                </div>
              </article>
            );
          })}
        </section>
      )}
    </>
  );
}
