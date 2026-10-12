import React from 'react';
import { useBank } from '../../context/BankContext';
import {
  Wallet,
  ArrowLeftRight,
  ReceiptText,
  Search,
  PlusCircle,
  Landmark,
  CreditCard,
  User,
  LogOut,
  LogIn,
  PhoneCall,
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate }) => {
  const { currentUser, accounts, logout, recordAction } = useBank();

  const userAccounts = accounts.filter((a) => a.userId === currentUser?.id);
  const primaryAccount = userAccounts.find((a) => a.type === 'SAVINGS') || userAccounts[0];

  const bankingNavItems = [
    { id: 'accounts', label: 'Accounts Overview', icon: Wallet, testId: 'side-accounts-link' },
    { id: 'transfer', label: 'Fund Transfer', icon: ArrowLeftRight, testId: 'side-transfer-link' },
    { id: 'billpay', label: 'Bill Pay (BBPS)', icon: ReceiptText, testId: 'side-billpay-link' },
    { id: 'find-transactions', label: 'Find Transactions', icon: Search, testId: 'side-find-link' },
    { id: 'open-account', label: 'Open FD / Deposit', icon: PlusCircle, testId: 'side-open-account-link' },
    { id: 'loan', label: 'Apply for Loan', icon: Landmark, testId: 'side-loan-link' },
    { id: 'cards', label: 'RuPay Debit Card', icon: CreditCard, testId: 'side-cards-link' },
    { id: 'profile', label: 'Customer Profile', icon: User, testId: 'side-profile-link' },
  ];

  const handleLogout = () => {
    if (currentUser) {
      const uname = currentUser.username;
      logout();
      recordAction({
        type: 'click',
        target: 'Sidebar Log Out Link',
        testId: 'side-logout-link',
        description: `Customer logged out: ${uname}`,
      });
    }
  };

  return (
    <aside
      data-testid="main-sidebar"
      className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 min-h-[calc(100vh-80px)] shadow-xs"
    >
      <div className="p-4 space-y-5 flex-1">
        {/* Customer Welcome & Quick Account Card */}
        {currentUser ? (
          <div
            data-testid="sidebar-welcome-user"
            className="p-3.5 bg-red-50/70 border border-red-200/80 rounded-lg text-xs space-y-1.5"
          >
            <div className="text-[10px] text-red-800 uppercase tracking-wider font-bold">
              Welcome
            </div>
            <div className="font-bold text-slate-900 truncate" data-testid="welcome-customer-name">
              {currentUser.fullName}
            </div>
            <div className="text-[11px] text-slate-600 font-mono">CIF ID: {currentUser.id}</div>

            {primaryAccount && (
              <div className="pt-2 border-t border-red-200/60 text-[11px]">
                <div className="text-slate-500">Available Balance:</div>
                <div className="text-base font-bold text-emerald-800 font-mono">
                  ₹{primaryAccount.availableBalance.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                  IFSC: {primaryAccount.ifscCode}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div
            data-testid="sidebar-logged-out-box"
            className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs space-y-2"
          >
            <div className="font-bold text-amber-900">Lena Dena NetBanking</div>
            <p className="text-[11px] text-slate-600">Please sign in to access your bank accounts.</p>
            <button
              type="button"
              data-testid="side-login-link"
              onClick={() => onNavigate('accounts')}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 bg-red-800 hover:bg-red-900 text-white rounded text-xs font-semibold transition-colors shadow-xs"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          </div>
        )}

        {/* Banking Services Navigation */}
        <div>
          <div className="text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-2 px-3">
            Banking Services
          </div>
          <nav className="space-y-0.5">
            {bankingNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  data-testid={item.testId}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors text-left ${
                    isActive
                      ? 'bg-red-50 text-red-900 font-bold border-l-4 border-red-800'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-red-800' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}

            {/* Logout button */}
            {currentUser && (
              <button
                type="button"
                data-testid="side-logout-link"
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 mt-2 rounded-md text-xs font-semibold text-rose-700 hover:bg-rose-50 hover:text-rose-900 transition-colors text-left"
              >
                <LogOut className="w-4 h-4 shrink-0 text-rose-600" />
                <span className="truncate">Log Out</span>
              </button>
            )}
          </nav>
        </div>
      </div>

      {/* Customer Helpline Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50 text-[11px] text-slate-600 space-y-1.5">
        <div className="flex items-center gap-1.5 font-bold text-slate-800">
          <PhoneCall className="w-3.5 h-3.5 text-red-800" />
          <span>Toll-Free Helpline: 1800 22 2026</span>
        </div>
        <div className="text-[10px] text-slate-500">
          Regulated by RBI · Deposits insured up to ₹5 Lakh by DICGC
        </div>
      </div>
    </aside>
  );
};
