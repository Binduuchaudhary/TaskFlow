import { ArrowLeft, Plus } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client.js";
import EmptyState from "../components/EmptyState.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";
import PageHeader from "../components/PageHeader.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useAsync } from "../hooks/useAsync.js";
import { formatDate } from "../utils/date.js";
import TaskForm from "./TaskForm.jsx";

export default function ProjectDetailsPage() {
  const { projectId } = useParams();
  const { isAdmin } = useAuth();
  const { data, error, loading, reload } = useAsync(() => api.project(projectId), [projectId]);
  const [formOpen, setFormOpen] = useState(false);

  const project = data?.project;
  const tasks = data?.tasks || [];

  return (
    <>
      <PageHeader
        title={project?.name || "Project"}
        subtitle={project?.description || "Project details and task list."}
        actions={
          <>
            <Link className="secondary-button compact" to="/projects">
              <ArrowLeft size={17} />
              Back
            </Link>
            {isAdmin && project ? (
              <button className="primary-button compact" type="button" onClick={() => setFormOpen((value) => !value)}>
                <Plus size={17} />
                Add task
              </button>
            ) : null}
          </>
        }
      />

      <ErrorMessage error={error} />

      {loading ? (
        <div className="loader" />
      ) : project ? (
        <>
          <section className="content-band">
            <div className="detail-grid">
              <Detail label="Owner" value={project.owner?.name || "Unknown"} />
              <Detail label="Due date" value={formatDate(project.dueDate)} />
              <Detail label="Members" value={`${project.members?.length || 0}`} />
            </div>
          </section>

          {formOpen ? <TaskForm project={project} onCreated={reload} /> : null}

          <section className="content-band">
            <div className="section-title">
              <h2>Tasks</h2>
            </div>
            {tasks.length === 0 ? (
              <EmptyState title="No tasks yet" message="Tasks created for this project will appear here." />
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Task</th>
                      <th>Assignee</th>
                      <th>Status</th>
                      <th>Priority</th>
                      <th>Due</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((task) => (
                      <tr key={task._id}>
                        <td>
                          <strong>{task.title}</strong>
                          <span>{task.description}</span>
                        </td>
                        <td>{task.assignedTo?.name || "Unknown"}</td>
                        <td>
                          <StatusBadge status={task.status} />
                        </td>
                        <td>{task.priority}</td>
                        <td>{formatDate(task.dueDate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      ) : null}
    </>
  );
}

function Detail({ label, value }) {
  return (
    <div className="detail-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
