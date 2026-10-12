import React, { useState } from 'react';
import { useBank } from '../../context/BankContext';
import { Payee } from '../../types/bank';
import { CheckCircle2, AlertCircle, Loader2, Bookmark } from 'lucide-react';

export const BillPayView: React.FC = () => {
  const { currentUser, accounts, payees, payBill, recordAction } = useBank();

  const userAccounts = accounts.filter(
    (a) => a.userId === currentUser?.id && a.type !== 'LOAN'
  );

  const [fromAccountId, setFromAccountId] = useState(userAccounts[0]?.id || '');
  const [payeeName, setPayeeName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [verifyAccountNumber, setVerifyAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successReceipt, setSuccessReceipt] = useState<{
    referenceNumber: string;
    payeeName: string;
    amount: number;
    fromAccountId: string;
  } | null>(null);

  const handleSelectQuickPayee = (payee: Payee) => {
    setPayeeName(payee.name);
    setAccountNumber(payee.accountNumber);
    setVerifyAccountNumber(payee.accountNumber);
    recordAction({
      type: 'click',
      target: `Quick Biller ${payee.name}`,
      testId: `quick-payee-${payee.id}`,
      description: `Autofilled biller: ${payee.name}`,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // INTENTIONAL DEFECT: Uses unstripped parseFloat without replacing commas, so '1,500' parses as '1'
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage('Please enter a valid bill payment amount greater than ₹0.00.');
      return;
    }

    // INTENTIONAL DEFECT: Strict untrimmed comparison fails if whitespace is present in one field
    if (accountNumber !== verifyAccountNumber) {
      setErrorMessage('Consumer number and confirmation number do not match.');
      return;
    }

    recordAction({
      type: 'click',
      target: 'Submit Bill Payment',
      testId: 'billpay-submit-btn',
      value: `Biller: ${payeeName}, ₹${parsedAmount}`,
      description: `Bill payment ₹${parsedAmount} to ${payeeName}`,
    });

    setIsLoading(true);

    try {
      const result = await payBill({
        payeeName,
        accountNumber,
        verifyAccountNumber,
        amount: parsedAmount,
        fromAccountId,
      });

      setSuccessReceipt({
        referenceNumber: result.referenceNumber,
        payeeName,
        amount: parsedAmount,
        fromAccountId,
      });

      setAmount('');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Bill payment transaction failed.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6" data-testid="billpay-view">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900" data-testid="billpay-title">
          Bharat BillPay (BBPS - Utility & Bill Payments)
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Pay electricity, water, gas, broadband, and mobile recharge bills instantly
        </p>
      </div>

      {/* Quick Biller presets */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <Bookmark className="w-3.5 h-3.5 text-red-800" />
          <h2 className="text-xs font-bold text-slate-900">Select Common Biller:</h2>
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          {payees.map((p) => (
            <button
              key={p.id}
              type="button"
              data-testid={`quick-payee-${p.id}`}
              onClick={() => handleSelectQuickPayee(p)}
              className="px-2.5 py-1 rounded bg-slate-100 hover:bg-red-50 hover:text-red-900 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Success Notification */}
      {successReceipt && (
        <div
          data-testid="billpay-success-banner"
          className="p-5 bg-emerald-50 border border-emerald-300 rounded-lg space-y-3 shadow-xs"
        >
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-bold text-emerald-950">Bill Paid Successfully</div>
              <div className="text-xs text-emerald-800 mt-0.5">
                Payment of ₹{successReceipt.amount.toFixed(2)} to {successReceipt.payeeName} has been processed. BBPS Reference: <span className="font-mono font-bold">{successReceipt.referenceNumber}</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            data-testid="billpay-another-btn"
            onClick={() => setSuccessReceipt(null)}
            className="px-3 py-1.5 text-xs font-bold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 rounded transition-colors"
          >
            Pay Another Bill
          </button>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div
          data-testid="billpay-error-alert"
          className="p-4 bg-rose-50 border border-rose-300 rounded-lg flex items-start gap-3 text-rose-900"
        >
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <div className="font-bold">Payment Error</div>
            <div className="mt-0.5" data-testid="billpay-error-message">
              {errorMessage}
            </div>
          </div>
        </div>
      )}

      {/* Bill Pay Form */}
      <div className="p-6 bg-white border border-slate-200 rounded-lg shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Biller / Service Provider Name <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              data-testid="payee-name-input"
              placeholder="e.g. Tata Power Delhi Distribution Ltd"
              value={payeeName}
              onChange={(e) => setPayeeName(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-md p-2.5 text-slate-900 focus:outline-none focus:border-red-800"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Consumer Account No. / Mobile <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                data-testid="payee-account-input"
                placeholder="e.g. CA-1002938491"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-md p-2.5 text-slate-900 focus:outline-none focus:border-red-800 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Confirm Consumer Account No. <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                data-testid="payee-verify-account-input"
                placeholder="Re-enter to confirm"
                value={verifyAccountNumber}
                onChange={(e) => setVerifyAccountNumber(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-md p-2.5 text-slate-900 focus:outline-none focus:border-red-800 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Debit From Account <span className="text-rose-600">*</span>
            </label>
            <select
              data-testid="billpay-from-account-select"
              value={fromAccountId}
              onChange={(e) => setFromAccountId(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-md p-2.5 text-slate-900 focus:outline-none focus:border-red-800 font-mono"
            >
              {userAccounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nickname} - #{a.id} (Available: ₹{a.availableBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Bill Amount in ₹ (INR) <span className="text-rose-600">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-500 text-sm">
                ₹
              </span>
              <input
                type="number"
                data-testid="billpay-amount-input"
                placeholder="0.00"
                step="0.01"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full text-sm bg-slate-50 border border-slate-300 rounded-md pl-8 pr-3 py-2.5 text-slate-900 focus:outline-none focus:border-red-800 font-mono font-bold"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            data-testid="billpay-submit-btn"
            className="w-full py-2.5 px-4 text-xs font-bold text-white bg-red-800 hover:bg-red-900 rounded-md transition-colors flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing Payment...</span>
              </>
            ) : (
              <span>Authorize & Pay Bill</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
