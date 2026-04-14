import { useState } from 'react';
import { useNavigate } from 'react-router';
import { authService, LoginRequest } from '../services/authService';
import { AlertCircle, CheckCircle, Eye, EyeOff, Lock, User } from 'lucide-react';

export function Login() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<{ field: string; message: string } | null>(null);
  const navigate = useNavigate();

  const validateForm = (): boolean => {
    if (!username.trim()) {
      setValidationError({ field: 'username', message: 'Username is required' });
      return false;
    }
    if (!password) {
      setValidationError({ field: 'password', message: 'Password is required' });
      return false;
    }
    if (password.length < 6) {
      setValidationError({ field: 'password', message: 'Password must be at least 6 characters' });
      return false;
    }
    setValidationError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const credentials: LoginRequest = { username, password };
      const response = await authService.login(credentials);

      if (response.token && response.id) {
        authService.setAuth(response.token, {
          id: response.id,
          username: response.username,
          fullName: response.fullName || response.username,
          email: response.email,
          roles: response.roles,
        });
        
        setSuccess('Login successful! Redirecting...');
        setTimeout(() => {
          if ((response.roles || []).includes('ROLE_ADMIN')) {
            navigate('/');
            return;
          }

          const target = new URL('http://localhost:8081/trangchu.html');
          target.searchParams.set('authToken', response.token);
          target.searchParams.set('authUsername', response.username);
          target.searchParams.set('authFullName', response.fullName || response.username);
          target.searchParams.set('authEmail', response.email || '');
          target.searchParams.set('authRoles', JSON.stringify(response.roles || []));
          window.location.href = target.toString();
        }, 1000);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setUsername('admin');
    setPassword('admin123');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-600 mt-2">Sign in to your account to continue</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-md flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-md flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <p className="text-green-700 text-sm">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setValidationError(null);
                }}
                disabled={loading}
                className={`w-full pl-10 pr-4 py-2 border-2 rounded-lg focus:outline-none transition-colors ${
                  validationError?.field === 'username'
                    ? 'border-red-500 focus:ring-2 focus:ring-red-200'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                } ${loading ? 'bg-gray-100' : 'bg-white'}`}
                placeholder="Enter your username"
              />
            </div>
            {validationError?.field === 'username' && (
              <p className="text-red-500 text-xs mt-1">{validationError.message}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setValidationError(null);
                }}
                disabled={loading}
                className={`w-full pl-10 pr-12 py-2 border-2 rounded-lg focus:outline-none transition-colors ${
                  validationError?.field === 'password'
                    ? 'border-red-500 focus:ring-2 focus:ring-red-200'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                } ${loading ? 'bg-gray-100' : 'bg-white'}`}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {validationError?.field === 'password' && (
              <p className="text-red-500 text-xs mt-1">{validationError.message}</p>
            )}
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-2.5 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:from-gray-400 disabled:to-gray-400 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>

          {/* Demo Credentials */}
          <div className="pt-2 text-center">
            <p className="text-xs text-gray-500 mb-2">Demo credentials available:</p>
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium disabled:text-gray-400"
            >
              Use demo credentials (admin / admin123)
            </button>
          </div>
        </form>

        {/* Sign Up Link */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <a href="/register" className="text-blue-600 font-bold hover:text-blue-800 transition-colors">
            Sign up now
          </a>
        </div>
      </div>
    </div>
  );
}
