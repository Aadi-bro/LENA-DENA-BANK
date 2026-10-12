import React, { useState } from 'react';
import { useBank } from '../../context/BankContext';
import { CheckCircle2, AlertCircle, Loader2, ArrowRightLeft } from 'lucide-react';

interface TransferFundsViewProps {
  initialFromAccount?: string;
  onNavigateToAccount: (accountId: string) => void;
}

export const TransferFundsView: React.FC<TransferFundsViewProps> = ({
  initialFromAccount,
  onNavigateToAccount,
}) => {
  const { currentUser, accounts, transferFunds, recordAction } = useBank();

  const userAccounts = accounts.filter(
    (a) => a.userId === currentUser?.id && a.type !== 'LOAN'
  );

  const [fromAccountId, setFromAccountId] = useState(
    initialFromAccount || userAccounts[0]?.id || ''
  );
  const [transferType, setTransferType] = useState<'IMPS' | 'NEFT' | 'RTGS' | 'SELF'>('IMPS');
  const [beneficiaryName, setBeneficiaryName] = useState('');
  const [toAccountNumber, setToAccountNumber] = useState('');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('LDBN0001001');
  const [amount, setAmount] = useState('');
  const [remarks, setRemarks] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successReceipt, setSuccessReceipt] = useState<{
    utrNumber: string;
    timestamp: string;
    amount: number;
    fromId: string;
    toId: string;
    beneficiary: string;
    mode: string;
  } | null>(null);

  const selectedFromAccount = userAccounts.find((a) => a.id === fromAccountId);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // INTENTIONAL DEFECT 1: Decimal truncation bug (Math.floor causes fractional paisa e.g. .75 to be silently lost)
    const rawAmount = parseFloat(amount);
    const parsedAmount = amount.includes('.') ? Math.floor(rawAmount) : rawAmount;

    if (isNaN(rawAmount) || rawAmount <= 0) {
      setErrorMessage('Please enter a valid amount greater than ₹0.00.');
      return;
    }

    if (transferType === 'RTGS' && parsedAmount < 200000) {
      setErrorMessage('Minimum amount for RTGS transfers is ₹2,00,000. Please select IMPS or NEFT for smaller amounts.');
      return;
    }

    if (transferType !== 'SELF') {
      if (!toAccountNumber.trim()) {
        setErrorMessage('Beneficiary account number is required.');
        return;
      }
      if (toAccountNumber !== confirmAccountNumber) {
        setErrorMessage('Beneficiary account number and confirm account number do not match.');
        return;
      }
      if (!ifscCode.trim() || ifscCode.trim().length < 11) {
        setErrorMessage('Please enter a valid 11-character IFSC code.');
        return;
      }
      // INTENTIONAL DEFECT 2: Omitted check for toAccountNumber === fromAccountId in external modes!
    }

    const destination = transferType === 'SELF' ? toAccountNumber : toAccountNumber;

    recordAction({
      type: 'click',
      target: 'Execute Fund Transfer',
      testId: 'transfer-submit-btn',
      value: `A/c: ${fromAccountId} -> ${destination}, ₹${parsedAmount}`,
      description: `Fund transfer ₹${parsedAmount} via ${transferType}`,
    });

    setIsLoading(true);

    try {
      const result = await transferFunds({
        fromAccountId,
        toAccountId: destination,
        amount: parsedAmount,
        transferType: transferType === 'SELF' ? 'IMPS' : transferType,
        beneficiaryName: transferType === 'SELF' ? 'Self Account' : beneficiaryName || 'Beneficiary',
        ifscCode,
        remarks,
      });

      setSuccessReceipt({
        utrNumber: result.utrNumber,
        timestamp: result.timestamp,
        amount: parsedAmount,
        fromId: fromAccountId,
        toId: destination,
        beneficiary: transferType === 'SELF' ? 'Self Transfer' : beneficiaryName || 'Beneficiary',
        mode: transferType,
      });

      setAmount('');
      setRemarks('');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Fund transfer failed.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6" data-testid="transfer-funds-view">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900" data-testid="transfer-page-title">
          Fund Transfer (IMPS / NEFT / RTGS)
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Transfer money securely to any bank account in India
        </p>
      </div>

      {/* Success Notification */}
      {successReceipt && (
        <div
          data-testid="transfer-success-banner"
          className="p-5 bg-emerald-50 border border-emerald-300 rounded-lg space-y-3 shadow-xs"
        >
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-bold text-emerald-950">Payment Successful</div>
              <div className="text-xs text-emerald-800 mt-0.5">
                Funds have been successfully transferred. RBI UTR reference generated.
              </div>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded border border-emerald-200 text-xs space-y-1.5 font-mono">
            <div className="flex justify-between text-slate-700">
              <span>RBI UTR Reference:</span>
              <span className="font-bold text-red-900" data-testid="receipt-ref-num">
                {successReceipt.utrNumber}
              </span>
            </div>
            <div className="flex justify-between text-slate-700">
              <span>Amount Transferred:</span>
              <span className="font-bold text-emerald-700 text-sm" data-testid="receipt-amount">
                ₹{successReceipt.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Debited From Account:</span>
              <span className="text-slate-900">{successReceipt.fromId}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Beneficiary Account:</span>
              <span className="text-slate-900">{successReceipt.toId} ({successReceipt.beneficiary})</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Transfer Mode:</span>
              <span className="text-slate-900 font-bold">{successReceipt.mode}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              data-testid="transfer-again-btn"
              onClick={() => setSuccessReceipt(null)}
              className="px-3 py-1.5 text-xs font-bold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 rounded transition-colors"
            >
              Make Another Transfer
            </button>
            <button
              type="button"
              data-testid="view-updated-account-btn"
              onClick={() => onNavigateToAccount(successReceipt.fromId)}
              className="px-3 py-1.5 text-xs font-bold text-white bg-red-800 hover:bg-red-900 rounded transition-colors"
            >
              View Updated Passbook
            </button>
          </div>
        </div>
      )}

      {/* Error Callout */}
      {errorMessage && (
        <div
          data-testid="transfer-error-alert"
          className="p-4 bg-rose-50 border border-rose-300 rounded-lg flex items-start gap-3 text-rose-900"
        >
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <div className="font-bold">Transaction Failed</div>
            <div className="mt-0.5" data-testid="transfer-error-message">
              {errorMessage}
            </div>
          </div>
        </div>
      )}

      {/* Main Transfer Form Card */}
      <div className="p-6 bg-white border border-slate-200 rounded-xl space-y-5 shadow-xs">
        {/* Mode Selector Tabs */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2">
            Select Transfer Mode <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'IMPS', label: 'IMPS', desc: 'Instant 24x7 (Up to ₹5 Lakh)' },
              { id: 'NEFT', label: 'NEFT', desc: 'RBI Batches (No Limit)' },
              { id: 'RTGS', label: 'RTGS', desc: 'High Value (Min ₹2 Lakh)' },
              { id: 'SELF', label: 'Self A/c', desc: 'Between Own Accounts' },
            ].map((mode) => (
              <button
                key={mode.id}
                type="button"
                data-testid={`mode-tab-${mode.id}`}
                onClick={() => setTransferType(mode.id as any)}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  transferType === mode.id
                    ? 'border-red-800 bg-red-50/70 ring-1 ring-red-800 text-red-950 font-bold'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                }`}
              >
                <div className="text-xs font-bold">{mode.label}</div>
                <div className="text-[10px] text-slate-500 font-normal leading-tight mt-0.5">
                  {mode.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleTransfer} className="space-y-4">
          {/* From Account */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Debit From Account <span className="text-rose-500">*</span>
              </label>
              {selectedFromAccount && (
                <span className="text-[11px] font-mono text-emerald-800 font-bold" data-testid="from-account-balance-hint">
                  Available: ₹{selectedFromAccount.availableBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              )}
            </div>
            <select
              data-testid="from-account-select"
              value={fromAccountId}
              onChange={(e) => setFromAccountId(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-md p-2.5 text-slate-900 focus:outline-none focus:border-red-800 font-mono"
            >
              {userAccounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.nickname} - #{acc.id} (₹{acc.availableBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })})
                </option>
              ))}
            </select>
          </div>

          {/* Destination Form Fields */}
          {transferType === 'SELF' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Destination Own Account <span className="text-rose-500">*</span>
              </label>
              <select
                data-testid="to-account-select"
                value={toAccountNumber}
                onChange={(e) => setToAccountNumber(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-md p-2.5 text-slate-900 focus:outline-none focus:border-red-800 font-mono"
              >
                <option value="">Select target account...</option>
                {userAccounts
                  .filter((a) => a.id !== fromAccountId)
                  .map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.nickname} - #{acc.id} (Balance: ₹{acc.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })})
                    </option>
                  ))}
              </select>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Beneficiary Account Holder Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  data-testid="beneficiary-name-input"
                  placeholder="e.g. Suresh Chandra"
                  value={beneficiaryName}
                  onChange={(e) => setBeneficiaryName(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-md p-2.5 text-slate-900 focus:outline-none focus:border-red-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Beneficiary Account Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    data-testid="to-account-input"
                    placeholder="Enter Account Number"
                    value={toAccountNumber}
                    onChange={(e) => setToAccountNumber(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-md p-2.5 text-slate-900 focus:outline-none focus:border-red-800 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Re-enter Account Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    data-testid="confirm-account-input"
                    placeholder="Re-enter for confirmation"
                    value={confirmAccountNumber}
                    onChange={(e) => setConfirmAccountNumber(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-md p-2.5 text-slate-900 focus:outline-none focus:border-red-800 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bank IFSC Code (11 alphanumeric characters) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  data-testid="ifsc-code-input"
                  placeholder="e.g. LDBN0001001 or SBIN0000691"
                  value={ifscCode}
                  onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-md p-2.5 text-slate-900 focus:outline-none focus:border-red-800 font-mono uppercase"
                />
              </div>
            </>
          )}

          {/* Amount in Rupees */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Transfer Amount in ₹ (INR) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-500 text-sm">
                ₹
              </span>
              <input
                type="number"
                data-testid="amount-input"
                placeholder="0.00"
                step="0.01"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full text-sm bg-slate-50 border border-slate-300 rounded-md pl-8 pr-3 py-2.5 text-slate-900 focus:outline-none focus:border-red-800 font-mono font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Remarks / Purpose (Optional)
            </label>
            <input
              type="text"
              data-testid="remarks-input"
              placeholder="e.g. Rent, Vendor Payment, Personal Expense"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-md p-2.5 text-slate-900 focus:outline-none focus:border-red-800"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            data-testid="transfer-submit-btn"
            className="w-full py-2.5 px-4 text-xs font-bold text-white bg-red-800 hover:bg-red-900 rounded-md transition-colors flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing Transfer...</span>
              </>
            ) : (
              <>
                <ArrowRightLeft className="w-4 h-4" />
                <span>Confirm & Transfer Funds</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
