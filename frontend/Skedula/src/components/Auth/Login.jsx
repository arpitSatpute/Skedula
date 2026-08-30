import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';
import { AuthContext } from './AuthContext';

const Login = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  // Default role from query param or location state or CUSTOMER
  const roleFromParam = searchParams.get('role')?.toUpperCase();
  const initialRole = roleFromParam === 'ADMIN' ? 'ADMIN' : roleFromParam === 'OWNER' ? 'OWNER' : 'CUSTOMER';
  const [role, setRole] = useState(initialRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const roleParam = searchParams.get('role')?.toUpperCase();
    if (roleParam === 'ADMIN' || roleParam === 'OWNER' || roleParam === 'CUSTOMER') {
      setRole(roleParam);
    }
  }, [searchParams]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await login(email, password, role);
      if (result.success) {
        const fromPath = location.state?.from?.pathname;
        if (fromPath && fromPath !== '/login' && fromPath !== '/signup') {
          navigate(fromPath, { replace: true });
        } else if (role === 'ADMIN') {
          navigate('/admin');
        } else if (role === 'OWNER') {
          navigate('/profile');
        } else {
          navigate('/profile');
        }
      } else {
        setError(result.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-card border border-neutral-border relative overflow-hidden" data-animation-on-scroll="">
          {/* Top Decorative Sparkle */}
          <div className="text-center mb-6">
            <Link to="/" className="inline-flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-xl bg-brand-primary text-brand-secondary flex items-center justify-center font-bold text-lg">
                S
              </div>
              <span className="font-secondary text-2xl font-bold tracking-tight text-brand-primary">
                Skedula<span className="text-brand-secondary">•</span>
              </span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold font-primary text-brand-primary">
              Welcome Back
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary mt-1">
              {role === 'ADMIN'
                ? 'Sign in to access platform controls and business approvals'
                : role === 'OWNER'
                  ? 'Sign in to access your business operations & live calendar'
                  : 'Sign in to book and manage your verified appointments'}
            </p>
          </div>

          {/* Role Switcher Pills */}
          <div className="bg-neutral-background p-1.5 rounded-2xl flex gap-1 mb-6 border border-neutral-border">
            <button
              type="button"
              className={`flex-1 py-2 px-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                role === 'CUSTOMER'
                  ? 'bg-brand-primary text-white shadow-sm'
                  : 'text-text-secondary hover:text-brand-primary'
              }`}
              onClick={() => setRole('CUSTOMER')}
            >
              <i className="bi bi-person-fill"></i>
              <span>Customer</span>
            </button>
            <button
              type="button"
              className={`flex-1 py-2 px-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                role === 'OWNER'
                  ? 'bg-brand-primary text-white shadow-sm'
                  : 'text-text-secondary hover:text-brand-primary'
              }`}
              onClick={() => setRole('OWNER')}
            >
              <i className="bi bi-briefcase-fill"></i>
              <span>Owner</span>
            </button>
            <button
              type="button"
              className={`flex-1 py-2 px-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                role === 'ADMIN'
                  ? 'bg-brand-primary text-brand-secondary shadow-sm'
                  : 'text-text-secondary hover:text-brand-primary'
              }`}
              onClick={() => setRole('ADMIN')}
            >
              <i className="bi bi-shield-lock-fill"></i>
              <span>Admin</span>
            </button>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-2.5">
              <i className="bi bi-exclamation-triangle-fill text-red-500 mt-0.5"></i>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  className="w-full bg-neutral-background/60 border border-neutral-border focus:border-brand-primary focus:bg-white rounded-2xl py-3 pl-11 pr-4 text-sm text-brand-primary outline-none transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
                <i className="bi bi-envelope absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary text-base"></i>
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  className="w-full bg-neutral-background/60 border border-neutral-border focus:border-brand-primary focus:bg-white rounded-2xl py-3 pl-11 pr-11 text-sm text-brand-primary outline-none transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                <i className="bi bi-lock absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary text-base"></i>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-brand-primary cursor-pointer text-base"
                >
                  <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-primary text-white hover:bg-brand-dark py-3.5 rounded-full font-bold text-sm shadow-card hover:shadow-card-hover transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In as {role === 'ADMIN' ? 'Administrator' : role === 'OWNER' ? 'Business Owner' : 'Customer'}</span>
                  <i className="bi bi-arrow-right text-brand-secondary"></i>
                </>
              )}
            </button>
          </form>

          {/* Bottom helper */}
          <div className="text-center mt-6 pt-6 border-t border-neutral-border">
            <p className="text-xs text-text-secondary">
              Don't have an account yet?{' '}
              <Link to="/signup" className="text-brand-primary font-bold hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;