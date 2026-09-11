import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const Signup = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { signup } = useContext(AuthContext);

  const initialRole = searchParams.get('role')?.toUpperCase() === 'OWNER' ? 'OWNER' : 'CUSTOMER';
  const [role, setRole] = useState(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam) {
      setRole(roleParam.toUpperCase() === 'OWNER' ? 'OWNER' : 'CUSTOMER');
    }
  }, [searchParams]);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        name,
        email,
        password,
        role: role.toUpperCase(),
        ...(phone ? { phone } : {}),
        ...(dob ? { dob } : {}),
        ...(address ? { address } : {})
      };

      await signup(payload);
      toast.success(`Account created successfully! Please sign in.`);
      navigate(`/login?role=${role.toLowerCase()}`);
    } catch (err) {
      const errMsg = err.response?.data?.message || err.response?.data?.error?.message || err.message || 'Signup failed. Please try again.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-card border border-neutral-border relative overflow-hidden" data-animation-on-scroll="">
          {/* Top Header */}
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
              Create Account
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary mt-1">
              {role === 'OWNER'
                ? 'Join verified providers to scale your appointments & services'
                : 'Book verified businesses in seconds with real-time updates'}
            </p>
          </div>

          {/* Role Switcher */}
          <div className="bg-neutral-background p-1.5 rounded-2xl flex gap-1.5 mb-6 border border-neutral-border">
            <button
              type="button"
              className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 ${
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
              className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 ${
                role === 'OWNER'
                  ? 'bg-brand-primary text-brand-secondary shadow-sm'
                  : 'text-text-secondary hover:text-brand-primary'
              }`}
              onClick={() => setRole('OWNER')}
            >
              <i className="bi bi-briefcase-fill"></i>
              <span>Business Owner</span>
            </button>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-2.5">
              <i className="bi bi-exclamation-triangle-fill text-red-500 mt-0.5"></i>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            {/* Full Name */}
            <div>
              <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                placeholder={role === 'OWNER' ? 'Business Owner Name' : 'Jane Doe'}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                required
                className="w-full bg-neutral-background/60 border border-neutral-border focus:border-brand-primary focus:bg-white focus:ring-2 focus:ring-brand-primary/10 rounded-xl py-3 px-4 text-sm text-brand-primary transition-all outline-none"
              />
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                placeholder={role === 'OWNER' ? 'contact@yourbusiness.com' : 'you@example.com'}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
                className="w-full bg-neutral-background/60 border border-neutral-border focus:border-brand-primary focus:bg-white focus:ring-2 focus:ring-brand-primary/10 rounded-xl py-3 px-4 text-sm text-brand-primary transition-all outline-none"
              />
            </div>

            {/* Phone Field */}
            <div>
              <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                value={phone}
                placeholder="+91 9876543210"
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading}
                className="w-full bg-neutral-background/60 border border-neutral-border focus:border-brand-primary focus:bg-white focus:ring-2 focus:ring-brand-primary/10 rounded-xl py-3 px-4 text-sm text-brand-primary transition-all outline-none"
              />
            </div>

            {/* Date of Birth Field */}
            <div>
              <label htmlFor="dob" className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                Date of Birth
              </label>
              <input
                type="date"
                id="dob"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                disabled={loading}
                className="w-full bg-neutral-background/60 border border-neutral-border focus:border-brand-primary focus:bg-white focus:ring-2 focus:ring-brand-primary/10 rounded-xl py-3 px-4 text-sm text-brand-primary transition-all outline-none"
              />
            </div>

            {/* Address Field */}
            <div>
              <label htmlFor="address" className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                Address
              </label>
              <textarea
                id="address"
                rows={2}
                value={address}
                placeholder="Street address, city, state, postal code"
                onChange={(e) => setAddress(e.target.value)}
                disabled={loading}
                className="w-full bg-neutral-background/60 border border-neutral-border focus:border-brand-primary focus:bg-white focus:ring-2 focus:ring-brand-primary/10 rounded-xl py-3 px-4 text-sm text-brand-primary transition-all outline-none resize-none"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  placeholder="Minimum 6 characters"
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                  minLength="6"
                  className="w-full bg-neutral-background/60 border border-neutral-border focus:border-brand-primary focus:bg-white focus:ring-2 focus:ring-brand-primary/10 rounded-xl py-3 px-4 pr-11 text-sm text-brand-primary transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-secondary hover:text-brand-primary transition-colors text-base"
                >
                  <i className={`bi bi-${showPassword ? 'eye-slash' : 'eye'}`}></i>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || !name || !email || !password}
                className="w-full bg-brand-primary text-white hover:bg-brand-dark disabled:opacity-50 py-3.5 rounded-full font-bold text-sm shadow-card hover:shadow-card-hover transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create {role === 'OWNER' ? 'Business Owner' : 'Customer'} Account</span>
                    <i className="bi bi-arrow-right text-brand-secondary"></i>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Switch to Login */}
          <div className="text-center pt-6 mt-6 border-t border-neutral-border/60">
            <p className="text-xs text-text-secondary">
              Already have an account?{" "}
              <Link
                to={`/login?role=${role.toLowerCase()}`}
                className="text-brand-primary font-bold hover:underline underline-offset-4"
              >
                Sign In Instead →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;

