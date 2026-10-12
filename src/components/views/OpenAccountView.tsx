import React, { useState } from 'react';
import { useBank } from '../../context/BankContext';
import { AccountType, Account } from '../../types/bank';
import { PlusCircle, CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';

interface OpenAccountViewProps {
  onAccountCreated: (accountId: string) => void;
}

export const OpenAccountView: React.FC<OpenAccountViewProps> = ({ onAccountCreated }) => {
  const { currentUser, accounts, openNewAccount, recordAction } = useBank();

  const userAccounts = accounts.filter(
    (a) => a.userId === currentUser?.id && a.type !== 'LOAN'
  );

  const [accountType, setAccountType] = useState<AccountType>('FIXED_DEPOSIT');
  const [fundingAccountId, setFundingAccountId] = useState(userAccounts[0]?.id || '');
  const [initialDeposit, setInitialDeposit] = useState('10000');
  const [nickname, setNickname] = useState('1-Year Term Deposit / FD');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdAccount, setCreatedAccount] = useState<Account | null>(null);

  const handleOpenAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const deposit = parseFloat(initialDeposit);
    if (isNaN(deposit) || deposit < 500) {
      setErrorMessage('Minimum opening deposit of ₹500.00 is required.');
      return;
    }

    recordAction({
      type: 'click',
      target: 'Open Account/FD Button',
      testId: 'open-account-submit-btn',
      value: `Type: ${accountType}, ₹${deposit}`,
      description: `Opened ${accountType} deposit of ₹${deposit}`,
    });

    setIsLoading(true);

    try {
      const result = await openNewAccount({
        type: accountType,
        initialDeposit: deposit,
        fundingAccountId,
        nickname: nickname.trim() || `${accountType.replace('_', ' ')} Deposit`,
      });

      setCreatedAccount(result.account);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to open deposit account.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6" data-testid="open-account-view">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900" data-testid="open-account-title">
          Open Fixed Deposit / Recurring Deposit (FD / RD)
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Grow your wealth with competitive interest rates and government-backed safety
        </p>
      </div>

      {createdAccount && (
        <div
          data-testid="open-account-success"
          className="p-5 bg-emerald-50 border border-emerald-300 rounded-lg space-y-3 shadow-xs"
        >
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-bold text-emerald-950">
                Deposit Account Opened Successfully!
              </div>
              <div className="text-xs text-emerald-800 mt-0.5">
                Your Fixed Deposit certificate and account have been booked.
              </div>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded border border-emerald-200 text-xs font-mono space-y-1">
            <div className="flex justify-between text-slate-600">
              <span>New Deposit Account No:</span>
              <span className="font-bold text-red-900 text-sm" data-testid="new-account-id">
                {createdAccount.id}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Scheme Name:</span>
              <span className="font-bold text-slate-900">{createdAccount.nickname}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Principal Deposit Amount:</span>
              <span className="font-bold text-emerald-700">
                ₹{createdAccount.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Interest Rate:</span>
              <span className="font-bold text-slate-900">{createdAccount.interestRate}% p.a.</span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              data-testid="view-new-account-btn"
              onClick={() => onAccountCreated(createdAccount.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-red-800 hover:bg-red-900 rounded transition-colors"
            >
              <span>View Account Passbook</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              data-testid="open-another-account-btn"
              onClick={() => {
                setCreatedAccount(null);
                setNickname('1-Year Term Deposit / FD');
              }}
              className="px-3 py-1.5 text-xs font-bold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 rounded transition-colors"
            >
              Book Another Deposit
            </button>
          </div>
        </div>
      )}

      {errorMessage && (
        <div
          data-testid="open-account-error"
          className="p-4 bg-rose-50 border border-rose-300 rounded-lg flex items-start gap-3 text-rose-900"
        >
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <div className="font-bold">Unable to Open Deposit</div>
            <div className="mt-0.5" data-testid="open-account-error-msg">
              {errorMessage}
            </div>
          </div>
        </div>
      )}

      <div className="p-6 bg-white border border-slate-200 rounded-lg shadow-xs">
        <form onSubmit={handleOpenAccount} className="space-y-4">
          {/* Select Scheme */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Select Deposit Scheme <span className="text-rose-600">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                {
                  type: 'FIXED_DEPOSIT' as AccountType,
                  title: '1-Year Term FD',
                  desc: '7.10% Annual Interest Rate',
                  defaultName: '1-Year Term Deposit / FD',
                },
                {
                  type: 'FIXED_DEPOSIT' as AccountType,
                  title: '5-Year Tax Saver FD',
                  desc: '7.25% p.a. + Sec 80C Exemption',
                  defaultName: '5-Year Tax Saver FD',
                },
                {
                  type: 'SAVINGS' as AccountType,
                  title: 'Secondary Savings A/c',
                  desc: '3.50% p.a. on Daily Balance',
                  defaultName: 'Secondary Savings Bank Account',
                },
              ].map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  data-testid={`select-type-${idx}`}
                  onClick={() => {
                    setAccountType(item.type);
                    setNickname(item.defaultName);
                  }}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    nickname === item.defaultName
                      ? 'border-red-800 bg-red-50/60 ring-1 ring-red-800'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="font-bold text-slate-900 text-xs">{item.title}</div>
                  <div className="text-[11px] text-red-800 font-semibold mt-0.5">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Account Label / Nickname <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              data-testid="account-nickname-input"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-md p-2.5 text-slate-900 focus:outline-none focus:border-red-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Debit Funding Account <span className="text-rose-600">*</span>
            </label>
            <select
              data-testid="funding-account-select"
              value={fundingAccountId}
              onChange={(e) => setFundingAccountId(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-md p-2.5 text-slate-900 focus:outline-none focus:border-red-800 font-mono"
            >
              {userAccounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nickname} - #{a.id} (Balance: ₹{a.availableBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Deposit Amount in ₹ (INR) <span className="text-rose-600">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-500 text-sm">
                ₹
              </span>
              <input
                type="number"
                data-testid="deposit-amount-input"
                min="500"
                step="500"
                placeholder="10000"
                value={initialDeposit}
                onChange={(e) => setInitialDeposit(e.target.value)}
                className="w-full text-sm bg-slate-50 border border-slate-300 rounded-md pl-8 pr-3 py-2.5 text-slate-900 focus:outline-none focus:border-red-800 font-mono font-bold"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Minimum deposit threshold: ₹500.00</p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            data-testid="open-account-submit-btn"
            className="w-full py-2.5 px-4 text-xs font-bold text-white bg-red-800 hover:bg-red-900 rounded-md transition-colors flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Opening Account...</span>
              </>
            ) : (
              <span>Confirm & Open Account</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
