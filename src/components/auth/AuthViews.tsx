import React, { useState } from 'react';
import { useBank } from '../../context/BankContext';
import { X, Lock, Landmark, CheckCircle2, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { users, login, registerUser, recordAction } = useBank();
  const [tab, setTab] = useState<'LOGIN' | 'REGISTER' | 'FORGOT'>('LOGIN');

  // Login inputs
  const [loginUsername, setLoginUsername] = useState('rahul.sharma');
  const [loginPassword, setLoginPassword] = useState('demo123');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Register inputs
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regStreet, setRegStreet] = useState('');
  const [regCity, setRegCity] = useState('');
  const [regState, setRegState] = useState('');
  const [regZip, setRegZip] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPan, setRegPan] = useState('');
  const [regAadhaar, setRegAadhaar] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regInitialDeposit, setRegInitialDeposit] = useState('5000');
  const [regError, setRegError] = useState<string | null>(null);

  // Forgot password inputs
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    recordAction({
      type: 'click',
      target: 'Customer Login Button',
      testId: 'modal-login-submit-btn',
      value: loginUsername,
      description: `Attempted login as ${loginUsername}`,
    });

    const success = login(loginUsername);
    if (success) {
      onClose();
    } else {
      setLoginError('The User ID and password could not be verified.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!regUsername.trim() || !regPassword.trim()) {
      setRegError('User ID and password are required.');
      return;
    }

    // INTENTIONAL DEFECT 1: Case-insensitive comparison allows mismatched casing (e.g. 'Secret123' vs 'secret123')
    if (regPassword.toLowerCase() !== regConfirmPassword.toLowerCase()) {
      setRegError('Passwords do not match.');
      return;
    }

    if (users[regUsername]) {
      setRegError('This User ID already exists.');
      return;
    }

    // INTENTIONAL DEFECT 2: Negative deposit allowed without validation check
    const initDep = parseFloat(regInitialDeposit);

    recordAction({
      type: 'click',
      target: 'Customer Register Button',
      testId: 'register-submit-btn',
      value: regUsername,
      description: `Registered new test customer: ${regUsername}`,
    });

    registerUser({
      username: regUsername,
      fullName: `${regFirstName} ${regLastName}`.trim() || 'New Test Customer',
      email: `${regUsername}@lenadena.bank.in`,
      phone: regPhone || '+91 98000 11223',
      pan: regPan || 'ABCDE1234F',
      aadhaar: regAadhaar || '1234-5678-9012',
      street: regStreet || '12, MG Road',
      city: regCity || 'New Delhi',
      state: regState || 'Delhi',
      zip: regZip || '110001',
      initialDeposit: initDep,
    });

    onClose();
  };

  const handleForgotLookup = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotMessage(
      `Password recovery dispatch completed. Test credentials for ${forgotEmail || 'rahul.sharma'}: Username: rahul.sharma | Password: demo123`
    );
  };

  return (
    <div
      data-testid="auth-modal-overlay"
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto"
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden my-8">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-red-900 text-white">
          <div className="flex items-center gap-2">
            <Landmark className="w-5 h-5 text-amber-300" />
            <div>
              <h2 className="text-sm font-bold">
                {tab === 'LOGIN'
                  ? 'NetBanking Login'
                  : tab === 'REGISTER'
                  ? 'New Customer Registration'
                  : 'Account Recovery'}
              </h2>
              <div className="text-[10px] text-amber-200">LENA DENA BANK · Internet Banking</div>
            </div>
          </div>
          <button
            type="button"
            data-testid="auth-modal-close-btn"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 text-xs font-semibold bg-slate-50">
          <button
            type="button"
            data-testid="tab-login-btn"
            onClick={() => setTab('LOGIN')}
            className={`flex-1 py-3 text-center transition-colors ${
              tab === 'LOGIN' ? 'border-b-2 border-red-800 text-red-900 bg-white font-bold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            data-testid="tab-register-btn"
            onClick={() => setTab('REGISTER')}
            className={`flex-1 py-3 text-center transition-colors ${
              tab === 'REGISTER' ? 'border-b-2 border-red-800 text-red-900 bg-white font-bold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Register
          </button>
          <button
            type="button"
            data-testid="tab-forgot-btn"
            onClick={() => setTab('FORGOT')}
            className={`flex-1 py-3 text-center transition-colors ${
              tab === 'FORGOT' ? 'border-b-2 border-red-800 text-red-900 bg-white font-bold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Forgot Login
          </button>
        </div>

        <div className="p-6">
          {/* LOGIN TAB */}
          {tab === 'LOGIN' && (
            <form onSubmit={handleLogin} className="space-y-4">
              {loginError && (
                <div
                  data-testid="login-error-alert"
                  className="p-3 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-800 flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  User ID <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  data-testid="login-username-input"
                  name="username"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="e.g. rahul.sharma"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-md p-2.5 text-slate-900 font-mono focus:outline-none focus:border-red-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  data-testid="login-password-input"
                  name="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-md p-2.5 text-slate-900 font-mono focus:outline-none focus:border-red-800"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-900">
                <strong>Demo Test Credentials:</strong> <code className="font-mono font-bold text-red-900">rahul.sharma</code> / Password: <code className="font-mono font-bold text-red-900">demo123</code>
              </div>

              <button
                type="submit"
                data-testid="login-submit-btn"
                className="w-full py-2.5 px-4 text-xs font-bold text-white bg-red-800 hover:bg-red-900 rounded-md transition-colors shadow-xs"
              >
                Log In
              </button>
            </form>
          )}

          {/* REGISTER TAB */}
          {tab === 'REGISTER' && (
            <form onSubmit={handleRegister} className="space-y-3.5 max-h-[60vh] overflow-y-auto pr-1">
              {regError && (
                <div
                  data-testid="register-error-alert"
                  className="p-3 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-800 flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{regError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">First Name</label>
                  <input
                    type="text"
                    data-testid="register-firstname-input"
                    value={regFirstName}
                    onChange={(e) => setRegFirstName(e.target.value)}
                    placeholder="Vijay"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-md p-2 focus:border-red-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    data-testid="register-lastname-input"
                    value={regLastName}
                    onChange={(e) => setRegLastName(e.target.value)}
                    placeholder="Verma"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-md p-2 focus:border-red-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Street Address</label>
                <input
                  type="text"
                  data-testid="register-street-input"
                  value={regStreet}
                  onChange={(e) => setRegStreet(e.target.value)}
                  placeholder="24, Shanti Nagar"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-md p-2 focus:border-red-800"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    data-testid="register-city-input"
                    value={regCity}
                    onChange={(e) => setRegCity(e.target.value)}
                    placeholder="Jaipur"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-md p-2 focus:border-red-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    data-testid="register-state-input"
                    value={regState}
                    onChange={(e) => setRegState(e.target.value)}
                    placeholder="Rajasthan"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-md p-2 focus:border-red-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">PIN Code</label>
                  <input
                    type="text"
                    data-testid="register-zip-input"
                    value={regZip}
                    onChange={(e) => setRegZip(e.target.value)}
                    placeholder="302001"
                    maxLength={6}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-md p-2 font-mono focus:border-red-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">PAN Card Number</label>
                  <input
                    type="text"
                    data-testid="register-pan-input"
                    value={regPan}
                    onChange={(e) => setRegPan(e.target.value)}
                    placeholder="ABCDE1234F"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-md p-2 font-mono uppercase focus:border-red-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Mobile Number</label>
                  <input
                    type="text"
                    data-testid="register-phone-input"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-md p-2 font-mono focus:border-red-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    New User ID <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    data-testid="register-username-input"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="vijay.verma"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-md p-2 font-mono focus:border-red-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Opening Deposit (₹)
                  </label>
                  <input
                    type="number"
                    data-testid="register-deposit-input"
                    value={regInitialDeposit}
                    onChange={(e) => setRegInitialDeposit(e.target.value)}
                    placeholder="5000"
                    min="500"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-md p-2 font-mono focus:border-red-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    data-testid="register-password-input"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-md p-2 font-mono focus:border-red-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Confirm Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    data-testid="register-confirm-password-input"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-md p-2 font-mono focus:border-red-800"
                  />
                </div>
              </div>

              <button
                type="submit"
                data-testid="register-submit-btn"
                className="w-full py-2.5 px-4 text-xs font-bold text-white bg-red-800 hover:bg-red-900 rounded-md transition-colors mt-2 shadow-xs"
              >
                Register & Open Account
              </button>
            </form>
          )}

          {/* FORGOT PASSWORD TAB */}
          {tab === 'FORGOT' && (
            <form onSubmit={handleForgotLookup} className="space-y-4">
              {forgotMessage ? (
                <div
                  data-testid="forgot-message-alert"
                  className="p-4 bg-emerald-50 border border-emerald-300 rounded-lg text-xs text-emerald-950 space-y-1.5"
                >
                  <div className="flex items-center gap-2 font-bold text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>Credentials Recovered Successfully!</span>
                  </div>
                  <div>{forgotMessage}</div>
                  <button
                    type="button"
                    onClick={() => {
                      setTab('LOGIN');
                      setForgotMessage(null);
                    }}
                    className="mt-2 text-xs font-bold text-red-900 underline block"
                  >
                    Back to Login
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-xs text-slate-600">
                    Enter your registered User ID or Email. For manual testing, demo credentials will be provided immediately.
                  </p>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Registered User ID or Email
                    </label>
                    <input
                      type="text"
                      data-testid="forgot-email-input"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="rahul.sharma"
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-md p-2.5 font-mono focus:border-red-800"
                    />
                  </div>

                  <button
                    type="submit"
                    data-testid="forgot-submit-btn"
                    className="w-full py-2.5 px-4 text-xs font-bold text-white bg-red-800 hover:bg-red-900 rounded-md transition-colors shadow-xs"
                  >
                    Find Credentials
                  </button>
                </>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
