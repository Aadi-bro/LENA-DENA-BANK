import React, { useState } from 'react';
import { useBank } from '../../context/BankContext';
import { LogOut, RotateCcw, Landmark, Check } from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenAuthModal,
}) => {
  const { currentUser, logout, switchPersona, users, resetDatabase, recordAction } = useBank();
  const [resetNotice, setResetNotice] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* National Tricolor Top Accent Line */}
      <div className="h-1 w-full bg-linear-to-r from-orange-500 via-amber-100 to-emerald-600" />

      {/* Top Utility Strip */}
      <div className="bg-slate-900 text-slate-200 px-4 py-1.5 text-xs flex flex-wrap items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-amber-400 tracking-wide">
            LENA DENA BANK
          </span>
          <span className="text-slate-500 hidden sm:inline">·</span>
          <span className="text-slate-400 hidden sm:inline">A Govt. of India Undertaking · Always at your Service</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Persona Switcher for Manual Testing */}
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="text-slate-400 text-[11px]">Test User:</span>
            <select
              data-testid="persona-select"
              value={currentUser?.username || ''}
              onChange={(e) => {
                if (e.target.value === '') {
                  logout();
                } else {
                  switchPersona(e.target.value);
                }
              }}
              className="bg-slate-800 text-slate-100 border border-slate-700 rounded px-2 py-0.5 text-xs font-mono cursor-pointer"
            >
              {!currentUser && <option value="">[Logged Out / Guest]</option>}
              {Object.values(users).map((u) => (
                <option key={u.username} value={u.username}>
                  {u.fullName} ({u.username})
                </option>
              ))}
            </select>
          </div>

          {/* Reset Demo Data button for manual testers */}
          <button
            type="button"
            data-testid="quick-reset-db-btn"
            onClick={() => {
              resetDatabase();
              setResetNotice(true);
              setTimeout(() => setResetNotice(false), 2500);
            }}
            className="flex items-center gap-1 px-2.5 py-0.5 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded border border-slate-700 transition-colors"
            title="Reset data for fresh manual testing"
          >
            {resetNotice ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-300">Data Reset Done!</span>
              </>
            ) : (
              <>
                <RotateCcw className="w-3 h-3 text-amber-400" />
                <span>Reset Test Data</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Bank Navigation Bar */}
      <div className="flex items-center justify-between gap-6 px-6 py-3">
        {/* Brand Zone */}
        <button
          onClick={() => onNavigate('accounts')}
          data-testid="brand-logo"
          className="flex items-center gap-3 text-left hover:opacity-90 transition-opacity whitespace-nowrap shrink-0"
        >
          <div className="w-9 h-9 rounded-lg bg-red-800 text-amber-400 border border-amber-500/40 flex items-center justify-center font-bold shadow-xs">
            <Landmark className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="text-base font-bold text-red-900 leading-tight tracking-tight">
              LENA DENA BANK
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              Internet Banking Portal · Retail NetBanking
            </div>
          </div>
        </button>

        {/* Core Banking Tabs */}
        <nav
          data-testid="main-desktop-nav"
          className="hidden lg:flex items-center gap-5 text-xs font-semibold text-slate-700"
        >
          <button
            data-testid="nav-accounts"
            onClick={() => onNavigate('accounts')}
            className={`py-1 hover:text-red-900 transition-colors whitespace-nowrap shrink-0 ${
              currentView === 'accounts' || currentView === 'account-detail'
                ? 'text-red-800 border-b-2 border-red-800 font-bold'
                : ''
            }`}
          >
            Accounts Overview
          </button>
          <button
            data-testid="nav-transfer"
            onClick={() => onNavigate('transfer')}
            className={`py-1 hover:text-red-900 transition-colors whitespace-nowrap shrink-0 ${
              currentView === 'transfer' ? 'text-red-800 border-b-2 border-red-800 font-bold' : ''
            }`}
          >
            Fund Transfer
          </button>
          <button
            data-testid="nav-billpay"
            onClick={() => onNavigate('billpay')}
            className={`py-1 hover:text-red-900 transition-colors whitespace-nowrap shrink-0 ${
              currentView === 'billpay' ? 'text-red-800 border-b-2 border-red-800 font-bold' : ''
            }`}
          >
            Bill Pay
          </button>
          <button
            data-testid="nav-find"
            onClick={() => onNavigate('find-transactions')}
            className={`py-1 hover:text-red-900 transition-colors whitespace-nowrap shrink-0 ${
              currentView === 'find-transactions' ? 'text-red-800 border-b-2 border-red-800 font-bold' : ''
            }`}
          >
            Find Transactions
          </button>
          <button
            data-testid="nav-open-account"
            onClick={() => onNavigate('open-account')}
            className={`py-1 hover:text-red-900 transition-colors whitespace-nowrap shrink-0 ${
              currentView === 'open-account' ? 'text-red-800 border-b-2 border-red-800 font-bold' : ''
            }`}
          >
            Open FD / Deposit
          </button>
          <button
            data-testid="nav-loan"
            onClick={() => onNavigate('loan')}
            className={`py-1 hover:text-red-900 transition-colors whitespace-nowrap shrink-0 ${
              currentView === 'loan' ? 'text-red-800 border-b-2 border-red-800 font-bold' : ''
            }`}
          >
            Loan Applications
          </button>
          <button
            data-testid="nav-cards"
            onClick={() => onNavigate('cards')}
            className={`py-1 hover:text-red-900 transition-colors whitespace-nowrap shrink-0 ${
              currentView === 'cards' ? 'text-red-800 border-b-2 border-red-800 font-bold' : ''
            }`}
          >
            RuPay Debit Card
          </button>
        </nav>

        {/* User Status & Logout */}
        <div className="flex items-center gap-3 shrink-0">
          {currentUser ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigate('profile')}
                data-testid="user-profile-button"
                className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 transition-colors text-left"
              >
                <div className="w-7 h-7 rounded-full bg-red-100 text-red-900 flex items-center justify-center font-bold text-xs">
                  {currentUser.fullName[0]}
                </div>
                <div className="hidden sm:block text-xs">
                  <div className="font-semibold text-slate-900 leading-tight">{currentUser.fullName}</div>
                  <div className="text-slate-500 text-[10px] font-mono">{currentUser.id}</div>
                </div>
              </button>

              <button
                type="button"
                data-testid="logout-btn"
                onClick={() => {
                  const uname = currentUser.username;
                  logout();
                  recordAction({
                    type: 'click',
                    target: 'Log Out Button',
                    testId: 'logout-btn',
                    description: `Customer logged out: ${uname}`,
                  });
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-red-800 hover:bg-red-900 rounded-md transition-colors whitespace-nowrap shadow-xs"
                title="Log out of Lena Dena NetBanking"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              data-testid="login-register-button"
              className="px-4 py-2 text-xs font-semibold text-white bg-red-800 hover:bg-red-900 rounded-md transition-colors whitespace-nowrap shadow-xs"
            >
              NetBanking Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
