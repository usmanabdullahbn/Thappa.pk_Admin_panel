import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminLogin, useBusinessLogin } from "../api/useAuthApi";
import { apiErrorMessage } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { Button, Input } from "../components/ui";

export function LoginPage() {
  const [mode, setMode] = useState<"BUSINESS" | "ADMIN">("BUSINESS");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();
  const adminLogin = useAdminLogin();
  const businessLogin = useBusinessLogin();

  const mutation = mode === "ADMIN" ? adminLogin : businessLogin;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const result = await mutation.mutateAsync({ email, password });
      login(result.user, result.accessToken, result.refreshToken);
      navigate(mode === "ADMIN" ? "/admin/businesses" : "/business/dashboard");
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="mb-1 text-2xl font-bold text-thappa-navy">Thappa Dashboard</h1>
        <p className="mb-6 text-sm text-gray-500">Sign in to manage your loyalty program.</p>

        <div className="mb-6 flex rounded-lg bg-gray-100 p-1 text-sm font-medium">
          <button
            type="button"
            onClick={() => setMode("BUSINESS")}
            className={`flex-1 rounded-md py-1.5 transition ${mode === "BUSINESS" ? "bg-white shadow text-thappa-navy" : "text-gray-500"}`}
          >
            Business
          </button>
          <button
            type="button"
            onClick={() => setMode("ADMIN")}
            className={`flex-1 rounded-md py-1.5 transition ${mode === "ADMIN" ? "bg-white shadow text-thappa-navy" : "text-gray-500"}`}
          >
            Admin
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Email</label>
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Password</label>
            <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button type="submit" disabled={mutation.isPending} className="mt-2">
            {mutation.isPending ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  );
}
