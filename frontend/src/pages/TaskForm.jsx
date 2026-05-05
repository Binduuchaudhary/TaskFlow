import { useState } from "react";
import { api } from "../api/client.js";
import ErrorMessage from "../components/ErrorMessage.jsx";

export default function TaskForm({ project, onCreated }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    assignedTo: project.members?.[0]?._id || "",
    priority: "medium",
    dueDate: ""
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
      await api.createTask({
        ...form,
        project: project._id
      });
      setForm({
        title: "",
        description: "",
        assignedTo: project.members?.[0]?._id || "",
        priority: "medium",
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
          <span>Task title</span>
          <input name="title" value={form.title} onChange={updateField} required minLength={2} />
        </label>
        <label className="field">
          <span>Assignee</span>
          <select name="assignedTo" value={form.assignedTo} onChange={updateField} required>
            {project.members?.map((member) => (
              <option key={member._id} value={member._id}>
                {member.name} ({member.role})
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Priority</span>
          <select name="priority" value={form.priority} onChange={updateField}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>
        <label className="field">
          <span>Due date</span>
          <input name="dueDate" type="date" value={form.dueDate} onChange={updateField} required />
        </label>
      </div>
      <label className="field">
        <span>Description</span>
        <textarea name="description" value={form.description} onChange={updateField} rows={3} />
      </label>
      <button className="primary-button compact" type="submit" disabled={submitting}>
        Create task
      </button>
    </form>
  );
}
