import { CalendarDays, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import EmptyState from "../components/EmptyState.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";
import PageHeader from "../components/PageHeader.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useAsync } from "../hooks/useAsync.js";
import { formatDate } from "../utils/date.js";

export default function ProjectsPage() {
  const { isAdmin } = useAuth();
  const { data, error, loading, reload } = useAsync(() => api.projects(), []);
  const [formOpen, setFormOpen] = useState(false);

  const projects = data?.projects || [];

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this project and all related tasks?")) return;

    await api.deleteProject(id);
    reload();
  };

  return (
    <>
      <PageHeader
        title="Projects"
        subtitle="Manage project teams and timelines."
        actions={
          isAdmin ? (
            <button
              className="primary-button compact"
              type="button"
              onClick={() => setFormOpen((value) => !value)}
            >
              <Plus size={18} />
              New project
            </button>
          ) : null
        }
      />

      <ErrorMessage error={error} />

     {formOpen ? (
  <ProjectForm
    onCreated={() => {
      reload();
      setFormOpen(false);
    }}
  />
) : null}

      {loading ? (
        <div className="loader" />
      ) : projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          message="Projects assigned to you will appear here."
        />
      ) : (
        <section className="project-grid">
          {projects.map((project) => (
            <article className="project-card" key={project._id}>
              <div>
                <Link to={`/projects/${project._id}`} className="card-title">
                  {project.name}
                </Link>

                <p>{project.description || "No description added."}</p>
              </div>

              <div className="meta-row">
                <span>
                  <CalendarDays size={15} />
                  {formatDate(project.dueDate)}
                </span>

                <span>
                  Assigned to:{" "}
                  {project.members?.length
                    ? project.members.map((member) => member.name).join(", ")
                    : "No member"}
                </span>
              </div>

              <div className="card-footer">
                <span>Owner: {project.owner?.name || "Unknown"}</span>

                {isAdmin ? (
                  <button
                    className="icon-button danger"
                    type="button"
                    onClick={() => handleDelete(project._id)}
                    title="Delete project"
                  >
                    <Trash2 size={17} />
                  </button>
                ) : null}
              </div>
            </article>
          ))}
        </section>
      )}
    </>
  );
}

function ProjectForm({ onCreated }) {
  const { data: usersData } = useAsync(() => api.users(), []);

  const [form, setForm] = useState({
    name: "",
    description: "",
    assignedMemberId: "",
    dueDate: ""
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const members = (usersData?.users || []).filter(
    (user) => user.role === "member"
  );

  const updateField = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await api.createProject({
        name: form.name,
        description: form.description,
        dueDate: form.dueDate || undefined,
        memberIds: form.assignedMemberId ? [form.assignedMemberId] : []
      });

      setForm({
        name: "",
        description: "",
        assignedMemberId: "",
        dueDate: ""
      });

      onCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="form-panel" onSubmit={submit}>
      <ErrorMessage error={error} />

      <div className="form-grid">
        <label className="field">
          <span>Project name</span>
          <input
            name="name"
            value={form.name}
            onChange={updateField}
            required
            minLength={2}
          />
        </label>

        <label className="field">
          <span>Due date</span>
          <input
            name="dueDate"
            type="date"
            value={form.dueDate}
            onChange={updateField}
          />
        </label>
      </div>

      <label className="field">
        <span>Description</span>
        <textarea
          name="description"
          value={form.description}
          onChange={updateField}
          rows={3}
        />
      </label>

      <label className="field">
        <span>Assign to member</span>
        <select
          name="assignedMemberId"
          value={form.assignedMemberId}
          onChange={updateField}
          required
        >
          <option value="">Select member</option>

          {members.map((member) => (
            <option key={member._id} value={member._id}>
              {member.name} - {member.email}
            </option>
          ))}
        </select>
      </label>

      <button
        className="primary-button compact"
        type="submit"
        disabled={submitting}
      >
        {submitting ? "Creating..." : "Create project"}
      </button>
    </form>
  );
}
