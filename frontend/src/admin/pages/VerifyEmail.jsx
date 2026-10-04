import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { authApi } from "../api/authApi";
export function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState(location.state?.email || "");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [verified, setVerified] = useState(false);
  const [notice] = useState(location.state?.message || "");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const token = new URLSearchParams(location.hash.replace(/^#/, "")).get("token") ?? new URLSearchParams(location.search).get("token");
  useEffect(() => {
    if (!token) return;
    const cleanUrl = new URL(window.location.href);
    cleanUrl.searchParams.delete("token");
    cleanUrl.hash = "";
    window.history.replaceState({}, document.title, `${cleanUrl.pathname}${cleanUrl.search}`);
    setLoading(true);
    setError("");
    authApi.verifyEmail(token).then(() => {
      setSuccess("Email confirmed. You can now sign in.");
      setVerified(true);
    }).catch((err) => {
      setError(err instanceof Error ? err.message : "Email confirmation failed");
    }).finally(() => setLoading(false));
  }, [token, location.pathname, location.hash]);
  useEffect(() => {
    if (!verified) return;
    const timeout = window.setTimeout(() => navigate("/login"), 2500);
    return () => window.clearTimeout(timeout);
  }, [verified, navigate]);
  const handleResend = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setResending(true);
    try {
      setSuccess(await authApi.resendVerification(email));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not request a verification email");
    } finally {
      setResending(false);
    }
  };
  return <div className="admin-auth min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-500 to-pink-600 p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Confirm your email</h1>
        <p className="text-gray-600 mb-6">
          {email ? `Use the confirmation link for ${email}. If it has not arrived, request another below.` : "Open the confirmation link sent to your email."}
        </p>

        {notice && <p className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-4">{notice}</p>}
        {loading && <p role="status" className="text-blue-700 mb-4">Confirming your email…</p>}
        {error && <p role="alert" className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{error}</p>}
        {success && <p role="status" className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">{success}</p>}

        {!success && !loading && <form onSubmit={handleResend} className="space-y-4">
            <label className="block text-gray-700 font-medium" htmlFor="verification-email">Email address</label>
            <input
    id="verification-email"
    type="email"
    autoComplete="email"
    required
    value={email}
    onChange={(event) => setEmail(event.target.value)}
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
    placeholder="you@example.com"
  />
            <button
    type="submit"
    disabled={resending}
    className="w-full bg-purple-600 text-white font-bold py-3 rounded-lg hover:bg-purple-700 transition disabled:bg-gray-400"
  >
              {resending ? "Sending\u2026" : "Resend confirmation email"}
            </button>
          </form>}

        <p className="text-center text-gray-600 mt-6">
          <a href="/admin/login" className="text-purple-600 font-bold hover:underline">Back to sign in</a>
        </p>
      </div>
    </div>;
}
