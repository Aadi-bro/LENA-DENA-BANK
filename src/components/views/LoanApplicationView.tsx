import React, { useState } from 'react';
import { useBank } from '../../context/BankContext';
import { LoanApplication } from '../../types/bank';
import { CheckCircle2, AlertTriangle, Loader2, ArrowRight } from 'lucide-react';

interface LoanApplicationViewProps {
  onNavigateToAccount: (accountId: string) => void;
}

export const LoanApplicationView: React.FC<LoanApplicationViewProps> = ({
  onNavigateToAccount,
}) => {
  const { currentUser, accounts, loanApplications, applyLoan, recordAction } = useBank();

  const userSavings = accounts.filter(
    (a) => a.userId === currentUser?.id && a.type === 'SAVINGS'
  );

  const [loanAmount, setLoanAmount] = useState('200000');
  const [downPayment, setDownPayment] = useState('40000');
  const [purpose, setPurpose] = useState<'GOLD_LOAN' | 'CAR_LOAN' | 'HOME_LOAN' | 'PERSONAL'>('CAR_LOAN');
  const [termMonths, setTermMonths] = useState(36);
  const [annualIncome, setAnnualIncome] = useState('600000');
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [lastDecision, setLastDecision] = useState<LoanApplication | null>(null);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const amt = parseFloat(loanAmount);
    const down = parseFloat(downPayment);
    const income = parseFloat(annualIncome);

    if (isNaN(amt) || amt <= 0) {
      setValidationError('Please enter a valid requested loan amount.');
      return;
    }

    if (isNaN(down) || down < 0) {
      setValidationError('Please enter a valid down payment amount.');
      return;
    }

    if (isNaN(income) || income <= 0) {
      setValidationError('Please enter a valid annual income.');
      return;
    }

    recordAction({
      type: 'click',
      target: 'Loan Application Submit',
      testId: 'apply-loan-btn',
      value: `Type: ${purpose}, ₹${amt}`,
      description: `Applied for loan ₹${amt} (${purpose})`,
    });

    setIsLoading(true);

    try {
      const decision = await applyLoan({
        requestedAmount: amt,
        downPayment: down,
        purpose,
        termMonths,
        annualIncome: income,
      });

      setLastDecision(decision);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setValidationError(err.message);
      } else {
        setValidationError('Loan underwriting process encountered an error.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6" data-testid="loan-application-view">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900" data-testid="loans-title">
          Loan Products & Online Application
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Low interest rates, minimal documentation, and instant automated underwriting decision
        </p>
      </div>

      {validationError && (
        <div
          data-testid="loan-validation-error"
          className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2"
        >
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Decision Result Banner */}
      {lastDecision && (
        <div
          data-testid="loan-decision-card"
          className={`p-6 rounded-xl border space-y-4 shadow-xs ${
            lastDecision.status === 'APPROVED'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
              : 'bg-rose-50 border-rose-300 text-rose-950'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {lastDecision.status === 'APPROVED' ? (
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6" />
                </div>
              )}
              <div>
                <h3 className="text-base font-bold" data-testid="loan-decision-status">
                  {lastDecision.status === 'APPROVED' ? 'Loan Application Approved!' : 'Loan Application Denied'}
                </h3>
                <div className="text-xs opacity-80">
                  Application Reference: <span className="font-mono font-bold">{lastDecision.id}</span>
                </div>
              </div>
            </div>
            <span
              className={`text-xs font-mono font-bold px-2.5 py-1 rounded ${
                lastDecision.status === 'APPROVED' ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'
              }`}
            >
              {lastDecision.status}
            </span>
          </div>

          <div className="text-xs leading-relaxed bg-white/70 p-3 rounded-lg border border-black/5" data-testid="loan-decision-reason">
            <strong>Underwriting Decision Reason:</strong> {lastDecision.decisionReason}
          </div>

          {lastDecision.status === 'APPROVED' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-white/80 p-3 rounded-lg border border-emerald-200">
              <div>
                <span className="text-slate-500 block text-[11px]">Approved Amount</span>
                <span className="font-mono font-bold text-slate-900">
                  ₹{lastDecision.requestedAmount.toLocaleString('en-IN')}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Interest Rate</span>
                <span className="font-mono font-bold text-slate-900">{lastDecision.approvedRate}% p.a.</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Monthly EMI</span>
                <span className="font-mono font-bold text-emerald-800">
                  ₹{lastDecision.monthlyPayment?.toLocaleString('en-IN') || '0'}/month
                </span>
              </div>
            </div>
          )}

          {lastDecision.createdAccountId && (
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                data-testid="view-new-loan-account-btn"
                onClick={() => onNavigateToAccount(lastDecision.createdAccountId!)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-red-800 hover:bg-red-900 rounded-md transition-colors shadow-xs"
              >
                <span>View Loan Account</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Loan Form */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5 shadow-xs">
        <form onSubmit={handleApply} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Loan Purpose <span className="text-rose-500">*</span>
              </label>
              <select
                data-testid="loan-purpose-select"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value as any)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-md p-2.5 text-slate-900 focus:outline-none focus:border-red-800"
              >
                <option value="CAR_LOAN">Car Loan (@ 8.65% p.a.)</option>
                <option value="HOME_LOAN">Home Loan (@ 8.40% p.a.)</option>
                <option value="GOLD_LOAN">Gold Loan (@ 7.90% p.a.)</option>
                <option value="PERSONAL">Personal Loan (@ 10.50% p.a.)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Requested Loan Amount in ₹ (INR) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                data-testid="loan-amount-input"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
                placeholder="200000"
                min="10000"
                step="5000"
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-md p-2.5 text-slate-900 font-mono focus:outline-none focus:border-red-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Down Payment in ₹ (INR)
              </label>
              <input
                type="number"
                data-testid="loan-downpayment-input"
                value={downPayment}
                onChange={(e) => setDownPayment(e.target.value)}
                placeholder="40000"
                min="0"
                step="5000"
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-md p-2.5 text-slate-900 font-mono focus:outline-none focus:border-red-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Annual Income in ₹ (INR) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                data-testid="loan-income-input"
                value={annualIncome}
                onChange={(e) => setAnnualIncome(e.target.value)}
                placeholder="600000"
                min="50000"
                step="25000"
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-md p-2.5 text-slate-900 font-mono focus:outline-none focus:border-red-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Loan Tenor
              </label>
              <select
                data-testid="loan-term-select"
                value={termMonths}
                onChange={(e) => setTermMonths(Number(e.target.value))}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-md p-2.5 text-slate-900 focus:outline-none focus:border-red-800"
              >
                <option value={12}>12 Months (1 Year)</option>
                <option value={24}>24 Months (2 Years)</option>
                <option value={36}>36 Months (3 Years)</option>
                <option value={60}>60 Months (5 Years)</option>
                <option value={84}>84 Months (7 Years)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Disbursement Savings Account
              </label>
              <select
                data-testid="loan-disburse-account-select"
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-md p-2.5 text-slate-900 font-mono focus:outline-none focus:border-red-800"
              >
                {userSavings.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nickname} - #{a.id}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              data-testid="apply-loan-btn"
              className="py-2.5 px-6 text-xs font-bold text-white bg-red-800 hover:bg-red-900 rounded-md transition-colors flex items-center gap-2 shadow-xs disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Evaluating Application...</span>
                </>
              ) : (
                <span>Submit Loan Application</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
