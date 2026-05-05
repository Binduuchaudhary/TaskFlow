import { Lock, Mail, UserRound } from "lucide-react";
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import ErrorMessage from "../components/ErrorMessage.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function AuthPage({ mode }) {
  const navigate = useNavigate();
  const { login, signup, user } = useAuth();
  const isSignup = mode === "signup";

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "member"
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const updateField = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value
    }));

    setFieldErrors((current) => ({
      ...current,
      [name]: ""
    }));
  };

  const validateForm = () => {
    const errors = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (isSignup && !form.name.trim()) {
      errors.name = "This field is required";
    } else if (isSignup && form.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
    }

    if (!form.email.trim()) {
      errors.email = "This field is required";
    } else if (!emailPattern.test(form.email.trim())) {
      errors.email = "Enter a valid email address";
    }

    if (!form.password.trim()) {
      errors.password = "This field is required";
    } else if (form.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      if (isSignup) {
        await signup({
          ...form,
          name: form.name.trim(),
          email: form.email.trim()
        });
      } else {
        await login({
          email: form.email.trim(),
          password: form.password
        });
      }

      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Authentication failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-screen">
      <section className="auth-visual">
        <div>
          <span className="eyebrow">Team Task Manager</span>
          <h1>Plan projects, assign work, and track delivery.</h1>
          <p>
            Admin and member access with project teams, task ownership, status
            tracking, and overdue visibility.
          </p>
        </div>
      </section>

      <section className="auth-panel">
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div>
            <h2>{isSignup ? "Create account" : "Welcome back"}</h2>
            <p>
              {isSignup
                ? "Start a new workspace profile."
                : "Sign in to your workspace."}
            </p>
          </div>

          <ErrorMessage error={error} />

          {isSignup ? (
            <label className="field">
              <span>Name</span>
              <div className="input-with-icon">
                <UserRound size={18} />
                <input
                  className={fieldErrors.name ? "is-invalid" : ""}
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={updateField}
                  placeholder="Your name"
                  aria-invalid={Boolean(fieldErrors.name)}
                  autoComplete="name"
                />
              </div>
              {fieldErrors.name ? (
                <small className="field-error">{fieldErrors.name}</small>
              ) : null}
            </label>
          ) : null}

          <label className="field">
            <span>Email</span>
            <div className="input-with-icon">
              <Mail size={18} />
              <input
                className={fieldErrors.email ? "is-invalid" : ""}
                name="email"
                type="email"
                value={form.email}
                onChange={updateField}
                placeholder="you@example.com"
                aria-invalid={Boolean(fieldErrors.email)}
                autoComplete="email"
              />
            </div>
            {fieldErrors.email ? (
              <small className="field-error">{fieldErrors.email}</small>
            ) : null}
          </label>

          <label className="field">
            <span>Password</span>
            <div className="input-with-icon">
              <Lock size={18} />
              <input
                className={fieldErrors.password ? "is-invalid" : ""}
                name="password"
                type="password"
                value={form.password}
                onChange={updateField}
                placeholder="Minimum 6 characters"
                aria-invalid={Boolean(fieldErrors.password)}
                autoComplete={isSignup ? "new-password" : "current-password"}
              />
            </div>
            {fieldErrors.password ? (
              <small className="field-error">{fieldErrors.password}</small>
            ) : null}
          </label>

          {isSignup ? (
            <label className="field">
              <span>Role</span>
              <select name="role" value={form.role} onChange={updateField}>
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </label>
          ) : null}

          <button className="primary-button" type="submit" disabled={submitting}>
            {submitting ? "Please wait..." : isSignup ? "Sign up" : "Login"}
          </button>

          <p className="auth-switch">
            {isSignup ? "Already have an account?" : "Need an account?"}{" "}
            <Link to={isSignup ? "/login" : "/signup"}>
              {isSignup ? "Login" : "Sign up"}
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}
