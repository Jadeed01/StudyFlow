import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GraduationCap } from "lucide-react";
import { register } from "../api/auth";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(username, email, password);
      await login(username, password);
      navigate("/");
    } catch (err) {
      const data = err.response?.data;
      const firstError = data ? Object.values(data)[0]?.[0] : null;
      setError(firstError || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 justify-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-heading font-semibold text-xl text-slate-900 dark:text-white">
              StudyFlow
            </h1>
            <p className="text-xs text-slate-500 dark:text-dark-muted">Smart Assignment Tracker</p>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-2xl p-8">
          <h2 className="font-heading font-semibold text-2xl text-slate-900 dark:text-white mb-1">
            Create your account
          </h2>
          <p className="text-sm text-slate-500 dark:text-dark-muted mb-6">
            Start staying on top of your assignments
          </p>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-lg bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-2.5 rounded-lg bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-primary hover:bg-primary/90 disabled:opacity-60 text-white font-heading font-medium transition-colors"
            >
              {loading ? "Creating account..." : "Sign up"}
            </button>
          </form>

          <p className="text-sm text-center text-slate-500 dark:text-dark-muted mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}