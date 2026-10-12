import React, { useState } from 'react';
import { useBank } from '../../context/BankContext';
import { Lock, ArrowRight, ShieldCheck, AlertCircle, Landmark, AlertTriangle } from 'lucide-react';

interface LoginPortalViewProps {
  onOpenRegister: () => void;
  onOpenForgot: () => void;
}

export const LoginPortalView: React.FC<LoginPortalViewProps> = ({
  onOpenRegister,
  onOpenForgot,
}) => {
  const { login, switchPersona, recordAction } = useBank();

  const [username, setUsername] = useState('rahul.sharma');
  const [password, setPassword] = useState('demo123');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    recordAction({
      type: 'click',
      target: 'NetBanking Login Submit Button',
      testId: 'login-submit-btn',
      value: username,
      description: `Attempted login: ${username}`,
    });

    // INTENTIONAL DEFECT 1: Untrimmed exact comparison fails if user enters leading or trailing spaces (e.g. ' rahul.sharma ')
    // INTENTIONAL DEFECT 2: Username Enumeration Defect: Reveals whether username exists in records vs invalid password
    const success = login(username);
    if (!success) {
      if (username.trim() === 'rahul.sharma' || username.trim() === 'priya.patel' || username.trim() === 'amit.kumar') {
        setErrorMessage(`Incorrect password entered for customer account '${username}'. Please verify password.`);
      } else {
        setErrorMessage(`User ID '${username}' does not exist in customer records. Please register first.`);
      }
    }
  };

  const handleQuickPersonaLogin = (personaUsername: string) => {
    setUsername(personaUsername);
    setPassword('demo123');
    switchPersona(personaUsername);
    recordAction({
      type: 'click',
      target: `Quick Login (${personaUsername})`,
      testId: `quick-login-${personaUsername.replace('.', '-')}`,
      description: `Logged in using customer: ${personaUsername}`,
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-2" data-testid="login-portal-view">
      {/* Bank Header Welcome Card */}
      <div className="bg-linear-to-r from-red-950 via-red-900 to-amber-950 text-white rounded-xl p-6 shadow-md border border-red-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-amber-400 text-red-950 rounded text-xs font-bold tracking-wide">
            SECURE NETBANKING · 256-BIT ENCRYPTION
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-amber-200" data-testid="portal-headline">
            LENA DENA BANK Internet Banking
          </h1>
          <p className="text-xs text-slate-200 max-w-lg">
            A Govt. of India Undertaking · 24x7 Digital Banking Services (IMPS, NEFT, RTGS, RuPay)
          </p>
        </div>
        <div className="w-16 h-16 rounded-full bg-amber-400/20 border-2 border-amber-300 flex items-center justify-center shrink-0">
          <Landmark className="w-8 h-8 text-amber-300" />
        </div>
      </div>

      {/* Main Grid: Login on Left, 1-Click Test Customer Profiles on Right */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Login Box */}
        <div className="md:col-span-5 bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Lock className="w-4 h-4 text-red-800" />
            <h2 className="text-sm font-bold text-slate-900">Retail NetBanking Login</h2>
          </div>

          {errorMessage && (
            <div
              data-testid="login-error-alert"
              className="p-3 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-800 flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div data-testid="login-error-message">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                User ID <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                data-testid="login-username-input"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. rahul.sharma"
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-md p-2.5 text-slate-900 focus:outline-none focus:border-red-800 font-mono"
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-md p-2.5 text-slate-900 focus:outline-none focus:border-red-800 font-mono"
              />
            </div>

            <button
              type="submit"
              data-testid="login-submit-btn"
              className="w-full py-2.5 px-4 text-xs font-bold text-white bg-red-800 hover:bg-red-900 rounded-md transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <span>Login</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Registration and Recovery Links */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <button
              type="button"
              data-testid="forgot-login-link"
              onClick={onOpenForgot}
              className="text-slate-600 hover:text-red-800 transition-colors"
            >
              Forgot Password?
            </button>
            <button
              type="button"
              data-testid="register-link"
              onClick={onOpenRegister}
              className="text-red-800 font-bold hover:underline"
            >
              Register New Account
            </button>
          </div>
        </div>

        {/* Right Column: 1-Click Profiles for Manual Testing */}
        <div className="md:col-span-7 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-red-900">
                Test Customer Accounts for Manual QA
              </h2>
              <span className="text-[10px] font-bold font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                1-Click Login
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Click any profile below to instantly log in for manual test scenarios:
            </p>

            <div className="space-y-2 pt-1">
              {[
                {
                  id: 'rahul.sharma',
                  name: 'Rahul Sharma (Regular Savings Account)',
                  desc: 'Savings: ₹48,250.50 | 1-Year FD: ₹1,50,000.00 | Car Loan: -₹2,80,000',
                  badge: 'Savings Account',
                },
                {
                  id: 'priya.patel',
                  name: 'Priya Patel (Current Account / High Balance)',
                  desc: 'Current Balance: ₹4,85,000.00 | Tax Saver FD: ₹12,00,000.00',
                  badge: 'Current Account',
                },
                {
                  id: 'amit.kumar',
                  name: 'Amit Kumar (Jan Dhan / Low Balance Edge Case)',
                  desc: 'Balance: ₹350.00 (Useful for testing insufficient funds & overdraft checks)',
                  badge: 'Low Balance',
                },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  data-testid={`quick-login-${p.id.replace('.', '-')}`}
                  onClick={() => handleQuickPersonaLogin(p.id)}
                  className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-red-400 hover:bg-red-50/40 transition-all flex items-start justify-between gap-3 group"
                >
                  <div>
                    <div className="font-bold text-xs text-slate-900 group-hover:text-red-950 flex items-center gap-2">
                      <span>{p.name}</span>
                      <span className="font-mono text-[10px] text-slate-400 font-normal">({p.id} / demo123)</span>
                    </div>
                    <div className="text-[11px] text-slate-600 mt-0.5">{p.desc}</div>
                  </div>
                  <span className="shrink-0 text-[10px] font-bold font-mono px-2 py-1 rounded bg-red-100 text-red-900 group-hover:bg-red-800 group-hover:text-white transition-colors">
                    Login Now
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* RBI Security Caution */}
          <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 text-xs space-y-1.5 text-amber-900">
            <div className="font-bold flex items-center gap-1.5 text-amber-950">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              <span>Security Advisory</span>
            </div>
            <div className="text-[11px] text-amber-800 leading-relaxed">
              Lena Dena Bank never asks for your password, OTP, or ATM PIN. Demo test password for all accounts is: <code className="font-mono font-bold text-red-900 bg-white px-1 py-0.5 rounded border border-amber-300">demo123</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
