import {
  BarChart3,
  FolderKanban,
  KeyRound,
  ListTodo,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import ErrorMessage from "./ErrorMessage.jsx";

export default function AppLayout() {
  const { logout, user } = useAuth();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);

  const updatePasswordField = (event) => {
    setPasswordForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));

    setPasswordError("");
    setPasswordSuccess("");
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);

    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });

    setPasswordError("");
    setPasswordSuccess("");
  };

  const submitPasswordChange = async (event) => {
    event.preventDefault();

    setPasswordError("");
    setPasswordSuccess("");

    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      setPasswordError("All password fields are required");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New password and confirm password do not match");
      return;
    }

    setPasswordSubmitting(true);

    try {
      await api.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });

      setPasswordSuccess("Password changed successfully");

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    } catch (err) {
      setPasswordError(err.message || "Password change failed");
    } finally {
      setPasswordSubmitting(false);
    }
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutConfirm(false);
  };

  return (
    <div className="app-shell">
      <header className="mobile-header">
        <div className="brand">
          <span className="brand-mark">T</span>

          <div>
            <strong>Task Manager</strong>
            <small>Team workspace</small>
          </div>
        </div>

        <button
          className="mobile-menu-button"
          type="button"
          onClick={() => setIsMobileMenuOpen((value) => !value)}
          title={isMobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      <aside className={`sidebar ${isMobileMenuOpen ? "is-open" : ""}`}>
        <div className="brand">
          <span className="brand-mark">T</span>

          <div>
            <strong>Task Manager</strong>
            <small>Team workspace</small>
          </div>
        </div>

        <nav className="nav-list" aria-label="Primary navigation">
          <NavLink to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
            <BarChart3 size={18} />
            Dashboard
          </NavLink>

          <NavLink to="/projects" onClick={() => setIsMobileMenuOpen(false)}>
            <FolderKanban size={18} />
            Projects
          </NavLink>

          <NavLink to="/tasks" onClick={() => setIsMobileMenuOpen(false)}>
            <ListTodo size={18} />
            Tasks
          </NavLink>
        </nav>

        <div className="profile-box">
          <div>
            <strong>{user.name}</strong>
            <span>{user.role}</span>
          </div>

          <div className="profile-actions">
            <button
              className="icon-button"
              type="button"
              onClick={() => setShowPasswordModal(true)}
              title="Change password"
            >
              <KeyRound size={18} />
            </button>

            <button
              className="icon-button"
              type="button"
              onClick={() => setShowLogoutConfirm(true)}
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      <main className="main-panel">
        <Outlet />
      </main>

      {showPasswordModal ? (
        <div className="modal-backdrop">
          <form className="confirm-modal" onSubmit={submitPasswordChange}>
            <h2>Change password</h2>
            <p>Enter your current password and choose a new one.</p>

            <ErrorMessage error={passwordError} />

            {passwordSuccess ? (
              <div className="success-message">{passwordSuccess}</div>
            ) : null}

            <label className="field">
              <span>Current password</span>
              <input
                name="currentPassword"
                type="password"
                value={passwordForm.currentPassword}
                onChange={updatePasswordField}
                autoComplete="current-password"
              />
            </label>

            <label className="field">
              <span>New password</span>
              <input
                name="newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={updatePasswordField}
                autoComplete="new-password"
              />
            </label>

            <label className="field">
              <span>Confirm new password</span>
              <input
                name="confirmPassword"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={updatePasswordField}
                autoComplete="new-password"
              />
            </label>

            <div className="confirm-actions">
              <button
                className="secondary-button compact"
                type="button"
                onClick={closePasswordModal}
              >
                Cancel
              </button>

              <button
                className="primary-button compact"
                type="submit"
                disabled={passwordSubmitting}
              >
                {passwordSubmitting ? "Changing..." : "Change password"}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {showLogoutConfirm ? (
        <div className="modal-backdrop">
          <div className="confirm-modal">
            <h2>Confirm logout</h2>
            <p>Are you sure you want to logout?</p>

            <div className="confirm-actions">
              <button
                className="secondary-button compact"
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </button>

              <button
                className="primary-button compact"
                type="button"
                onClick={confirmLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
