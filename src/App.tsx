import React, { useState } from 'react';
import { BankProvider, useBank } from './context/BankContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { AccountsOverviewView } from './components/views/AccountsOverviewView';
import { AccountDetailView } from './components/views/AccountDetailView';
import { TransferFundsView } from './components/views/TransferFundsView';
import { BillPayView } from './components/views/BillPayView';
import { OpenAccountView } from './components/views/OpenAccountView';
import { LoanApplicationView } from './components/views/LoanApplicationView';
import { CardManagementView } from './components/views/CardManagementView';
import { ProfileView } from './components/views/ProfileView';
import { FindTransactionsView } from './components/views/FindTransactionsView';
import { AuthModal } from './components/auth/AuthViews';
import { LoginPortalView } from './components/views/LoginPortalView';

function BankAppContent() {
  const { currentUser } = useBank();
  const [currentView, setCurrentView] = useState<string>('accounts');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('30198420112');
  const [transferInitialFromAccount, setTransferInitialFromAccount] = useState<string | undefined>(undefined);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleSelectAccount = (accountId: string) => {
    setSelectedAccountId(accountId);
    setCurrentView('account-detail');
  };

  const handleInitiateTransfer = (fromAccountId: string) => {
    setTransferInitialFromAccount(fromAccountId);
    setCurrentView('transfer');
  };

  const handleAccountCreated = (accountId: string) => {
    setSelectedAccountId(accountId);
    setCurrentView('account-detail');
  };

  const handleNavigate = (view: string) => {
    setCurrentView(view);
    setTransferInitialFromAccount(undefined);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Top Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main Layout: Sidebar + Main Content Viewport */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        <Sidebar currentView={currentView} onNavigate={handleNavigate} />

        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {!currentUser ? (
            <LoginPortalView
              onOpenRegister={() => setIsAuthModalOpen(true)}
              onOpenForgot={() => setIsAuthModalOpen(true)}
            />
          ) : (
            <>
              {currentView === 'accounts' && (
                <AccountsOverviewView
                  onSelectAccount={handleSelectAccount}
                  onNavigate={handleNavigate}
                />
              )}

              {currentView === 'account-detail' && (
                <AccountDetailView
                  accountId={selectedAccountId}
                  onBack={() => setCurrentView('accounts')}
                  onInitiateTransfer={handleInitiateTransfer}
                />
              )}

              {currentView === 'transfer' && (
                <TransferFundsView
                  initialFromAccount={transferInitialFromAccount}
                  onNavigateToAccount={handleSelectAccount}
                />
              )}

              {currentView === 'billpay' && <BillPayView />}

              {currentView === 'find-transactions' && <FindTransactionsView />}

              {currentView === 'open-account' && (
                <OpenAccountView onAccountCreated={handleAccountCreated} />
              )}

              {currentView === 'loan' && (
                <LoanApplicationView onNavigateToAccount={handleSelectAccount} />
              )}

              {currentView === 'cards' && <CardManagementView />}

              {currentView === 'profile' && <ProfileView />}
            </>
          )}
        </main>
      </div>

      {/* Authentication Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <BankProvider>
      <BankAppContent />
    </BankProvider>
  );
}
