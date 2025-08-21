import { useContext, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthContext } from './AuthContext';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState("OWNER");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { signup } = useContext(AuthContext);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      await signup({ name, email, password, phone, role });
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        .signup-container {
          background: #f8fafc;
          min-height: 100vh;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .signup-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          transition: all 0.3s ease;
        }

        .signup-card:hover {
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }

        .signup-form-control {
          background: #ffffff;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          padding: 12px 16px;
          font-size: 14px;
          transition: all 0.2s ease;
          color: #1a202c;
        }

        .signup-form-control:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          outline: none;
        }

        .signup-form-control::placeholder {
          color: #9ca3af;
        }

        .signup-btn {
          background: #1f2937;
          border: none;
          border-radius: 8px;
          padding: 12px 24px;
          font-weight: 500;
          font-size: 14px;
          transition: all 0.2s ease;
          color: white;
        }

        .signup-btn:hover {
          background: #111827;
          transform: translateY(-1px);
        }

        .signup-btn:active {
          transform: translateY(0);
        }

        .signup-btn:disabled {
          background: #9ca3af;
          transform: none;
          cursor: not-allowed;
        }

        .brand-logo {
          color: #1f2937;
          font-weight: 700;
          font-size: 28px;
          letter-spacing: -0.025em;
        }

        .form-label {
          font-weight: 500;
          color: #374151;
          margin-bottom: 6px;
          font-size: 14px;
        }

        .password-toggle {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          font-size: 16px;
          padding: 4px;
          border-radius: 4px;
          transition: color 0.2s ease;
        }

        .password-toggle:hover {
          color: #374151;
        }

        .input-group-custom {
          position: relative;
        }

        .alert-modern {
          border: none;
          border-radius: 8px;
          padding: 12px 16px;
          font-weight: 500;
          font-size: 14px;
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
        }

        .divider {
          position: relative;
          text-align: center;
          margin: 24px 0;
        }

        .divider::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: #e5e7eb;
        }

        .divider-text {
          background: #ffffff;
          color: #6b7280;
          padding: 0 16px;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 500;
        }

        .google-btn {
          background: #ffffff;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          padding: 12px 24px;
          font-weight: 500;
          font-size: 14px;
          color: #374151;
          transition: all 0.2s ease;
        }

        .google-btn:hover {
          border-color: #d1d5db;
          background: #f9fafb;
          color: #374151;
        }

        .link-primary {
          color: #3b82f6;
          text-decoration: none;
          font-weight: 500;
        }

        .link-primary:hover {
          color: #2563eb;
          text-decoration: underline;
        }

        .floating-element {
          position: absolute;
          width: 200px;
          height: 200px;
          border-radius: 50%;
          opacity: 0.02;
          pointer-events: none;
        }

        .floating-1 {
          background: #3b82f6;
          top: 10%;
          left: -5%;
          animation: float-slow 8s ease-in-out infinite;
        }

        .floating-2 {
          background: #1f2937;
          bottom: 10%;
          right: -5%;
          animation: float-slow 8s ease-in-out infinite reverse;
        }

        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        .text-muted-custom {
          color: #6b7280;
        }

        .text-dark-custom {
          color: #1f2937;
        }

        .password-strength {
          font-size: 12px;
          margin-top: 4px;
        }

        .strength-weak { color: #dc2626; }
        .strength-medium { color: #f59e0b; }
        .strength-strong { color: #10b981; }
      `}</style>

      <div className="signup-container d-flex align-items-center justify-content-center position-relative">
        {/* Subtle floating elements */}
        <div className="floating-element floating-1"></div>
        <div className="floating-element floating-2"></div>

        <div className="container">
          <div className="row justify-content-center">
            <div className="col-sm-10 col-md-8 col-lg-6 col-xl-5">
              <div className="signup-card p-4 p-md-5">
                {/* Brand Logo */}
                <div className="text-center mb-4">
                  <h1 className="brand-logo mb-2">Skedula</h1>
                  <p className="text-muted-custom mb-0 small">Business Dashboard</p>
                </div>

                {/* Welcome Message */}
                <div className="text-center mb-4">
                  <h2 className="h5 text-dark-custom mb-2 fw-semibold">Create your account</h2>
                  <p className="text-muted-custom small mb-0">Start managing your business today</p>
                </div>
                
                <form onSubmit={handleSignup}>
                  {error && (
                    <div className="alert-modern d-flex align-items-center mb-4" role="alert">
                      <i className="bi bi-exclamation-circle me-2"></i>
                      <span>{error}</span>
                    </div>
                  )}
                  
                  {/* Name Field */}
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">
                      Full name
                    </label>
                    <input 
                      type="text" 
                      className="form-control signup-form-control w-100" 
                      id="name" 
                      value={name}
                      placeholder="Enter your full name"
                      onChange={(e) => setName(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>

                  {/* Email Field */}
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      Email address
                    </label>
                    <input 
                      type="email" 
                      className="form-control signup-form-control w-100" 
                      id="email" 
                      value={email}
                      placeholder="you@company.com"
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>

                  {/* Password Field */}
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                      Password
                    </label>
                    <div className="input-group-custom">
                      <input 
                        type={showPassword ? "text" : "password"}
                        className="form-control signup-form-control w-100" 
                        id="password" 
                        value={password}
                        placeholder="Create a strong password"
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                        required
                        minLength="8"
                        style={{ paddingRight: '45px' }}
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={loading}
                      >
                        <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                      </button>
                    </div>
                    <div className="password-strength">
                      <small className="text-muted-custom">
                        Minimum 8 characters with letters, numbers, and symbols
                      </small>
                    </div>
                  </div>

                  {/* Phone Field */}
                  <div className="mb-4">
                    <label htmlFor="phone" className="form-label">
                      Phone number
                    </label>
                    <input 
                      type="tel" 
                      className="form-control signup-form-control w-100" 
                      id="phone" 
                      value={phone}
                      placeholder="Enter your phone number"
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>

                  {/* Terms & Conditions */}
                  <div className="mb-4">
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" id="terms" required />
                      <label className="form-check-label text-muted-custom small" htmlFor="terms">
                        I agree to the{' '}
                        <a href="/terms" className="link-primary">Terms of Service</a>{' '}
                        and{' '}
                        <a href="/privacy" className="link-primary">Privacy Policy</a>
                      </label>
                    </div>
                  </div>

                  {/* Signup Button */}
                  <div className="d-grid mb-4">
                    <button 
                      type="submit" 
                      className="btn signup-btn"
                      disabled={loading || !name || !email || !password || !phone}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Creating account...
                        </>
                      ) : (
                        'Create account'
                      )}
                    </button>
                  </div>
                </form>

                {/* Divider */}
                <div className="divider">
                  <span className="divider-text">or</span>
                </div>

                {/* Google Signup */}
                <div className="d-grid mb-4">
                  <button className="btn google-btn">
                    <i className="bi bi-google me-2"></i>
                    Continue with Google
                  </button>
                </div>

                {/* Login Link */}
                <div className="text-center">
                  <p className="text-muted-custom small mb-0">
                    Already have an account? 
                    <a href="/login" className="link-primary ms-1">
                      Login
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Signup;
