import React, { useState } from 'react';
import { useBank } from '../../context/BankContext';
import { Transaction } from '../../types/bank';
import { ArrowLeft, ArrowRightLeft, Download, CheckCircle2, X } from 'lucide-react';

interface AccountDetailViewProps {
  accountId: string;
  onBack: () => void;
  onInitiateTransfer: (fromAccountId: string) => void;
}

export const AccountDetailView: React.FC<AccountDetailViewProps> = ({
  accountId,
  onBack,
  onInitiateTransfer,
}) => {
  const { accounts, transactions, recordAction } = useBank();
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
  const [dateFilter, setDateFilter] = useState<'30' | '90' | 'ALL'>('ALL');

  const account = accounts.find((a) => a.id === accountId);
  const accountTransactions = transactions.filter((t) => t.accountId === accountId);

  if (!account) {
    return (
      <div className="p-8 text-center space-y-3 bg-white border border-slate-200 rounded-xl" data-testid="account-not-found">
        <div className="text-sm font-semibold text-slate-700">Account #{accountId} could not be located.</div>
        <button
          onClick={onBack}
          className="px-4 py-2 text-xs font-semibold text-white bg-red-800 rounded-md hover:bg-red-900 transition-colors"
        >
          Back to Accounts Overview
        </button>
      </div>
    );
  }

  const isLoan = account.type === 'LOAN';
  const isNegative = account.balance < 0;

  const filteredTransactions = accountTransactions.filter((t) => {
    if (dateFilter === 'ALL') return true;
    const daysAgo = (Date.now() - new Date(t.timestamp).getTime()) / (1000 * 3600 * 24);
    return daysAgo <= parseInt(dateFilter);
  });

  const exportPassbookCsv = () => {
    recordAction({
      type: 'click',
      target: 'Download Account Passbook CSV',
      testId: 'download-passbook-csv-btn',
      description: `Downloaded passbook CSV for account #${account.id}`,
    });

    const headers = ['Txn_ID', 'Account_No', 'Date', 'Type', 'Description', 'Amount_INR', 'Balance_INR', 'UTR_Ref'];
    const rows = filteredTransactions.map((t) => [
      t.id,
      t.accountId,
      t.timestamp,
      t.type,
      `"${t.description.replace(/"/g, '""')}"`,
      t.amount.toFixed(2),
      t.balanceAfter.toFixed(2),
      t.referenceNumber,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `LenaDenaBank_${account.id}_Passbook_${Date.now()}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6" data-testid="account-detail-view">
      {/* Back button and breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          data-testid="back-to-portfolio-btn"
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-red-900 hover:text-red-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Accounts Overview</span>
        </button>
        <div className="flex items-center gap-2">
          {!isLoan && (
            <button
              type="button"
              data-testid="account-action-transfer-btn"
              onClick={() => onInitiateTransfer(account.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-red-800 rounded-md hover:bg-red-900 transition-colors shadow-xs"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Transfer from Account</span>
            </button>
          )}
          <button
            type="button"
            data-testid="download-passbook-btn"
            onClick={exportPassbookCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Download Statement (CSV)</span>
          </button>
        </div>
      </div>

      {/* Account Profile Header Card */}
      <div className="p-6 bg-white border border-slate-200 rounded-xl space-y-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold text-slate-900" data-testid="account-detail-name">
                {account.nickname}
              </h1>
              <span className="font-mono text-xs bg-red-50 text-red-900 border border-red-200 font-bold px-2 py-0.5 rounded">
                Account No: {account.id}
              </span>
              <span className="text-xs px-2 py-0.5 rounded font-semibold bg-slate-100 text-slate-700">
                {account.type === 'SAVINGS'
                  ? 'Savings Account'
                  : account.type === 'CURRENT'
                  ? 'Current Account'
                  : account.type === 'FIXED_DEPOSIT'
                  ? 'Term Deposit (FD)'
                  : account.type === 'RECURRING_DEPOSIT'
                  ? 'Recurring Deposit (RD)'
                  : 'Loan Account'}
              </span>
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-3 pt-1">
              <span>Branch: <strong className="text-slate-700">{account.branchName}</strong></span>
              <span>·</span>
              <span>IFSC Code: <strong className="font-mono text-red-900">{account.ifscCode}</strong></span>
            </div>
          </div>

          <div className="text-left md:text-right bg-slate-50 md:bg-transparent p-3 md:p-0 rounded-lg">
            <div className="text-xs font-medium text-slate-500">
              {isLoan ? 'Outstanding Principal Balance' : 'Available Funds Balance'}
            </div>
            <div
              className={`text-2xl font-bold font-mono tabular-nums ${
                isNegative ? 'text-rose-700' : 'text-emerald-800'
              }`}
              data-testid="account-detail-available"
            >
              {isLoan ? '' : '₹'}
              {Math.abs(account.balance).toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
              {isLoan && ' (Loan Outstanding)'}
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
              Currency: INR (Indian Rupee ₹)
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Account Status</span>
            <span className="font-semibold text-emerald-800" data-testid="detail-status">
              ● {account.status === 'ACTIVE' ? 'Active' : account.status}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Interest Rate</span>
            <span className="font-mono text-slate-800 font-bold">
              {account.interestRate ? `${account.interestRate}% p.a.` : '3.50% p.a.'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Account Opening Date</span>
            <span className="font-mono text-slate-800">
              {new Date(account.createdAt).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Nomination Status</span>
            <span className="text-slate-700 font-medium">Registered</span>
          </div>
        </div>
      </div>

      {/* Account Specific Transactions */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Passbook Ledger Statements</h2>
            <p className="text-xs text-slate-500">Click any transaction to inspect verification receipt & UTR reference</p>
          </div>

          <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-md text-xs">
            <button
              type="button"
              data-testid="filter-date-all"
              onClick={() => setDateFilter('ALL')}
              className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                dateFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Records
            </button>
            <button
              type="button"
              data-testid="filter-date-30"
              onClick={() => setDateFilter('30')}
              className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                dateFilter === '30' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Last 30 Days
            </button>
            <button
              type="button"
              data-testid="filter-date-90"
              onClick={() => setDateFilter('90')}
              className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                dateFilter === '90' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Last 90 Days
            </button>
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No transaction records found for this account.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left" data-testid="detail-transactions-table">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200 text-[11px]">
                <tr>
                  <th className="py-2.5 px-4">Txn ID</th>
                  <th className="py-2.5 px-4">Effective Date</th>
                  <th className="py-2.5 px-4">Description</th>
                  <th className="py-2.5 px-4 text-right">Amount (₹)</th>
                  <th className="py-2.5 px-4 text-right">Balance (₹)</th>
                  <th className="py-2.5 px-4">Reference / UTR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredTransactions.map((t) => {
                  const isCredit =
                    t.type === 'DEPOSIT' || t.type === 'TRANSFER_IN' || t.type === 'LOAN_DISBURSEMENT' || t.type === 'INTEREST_CREDIT';
                  return (
                    <tr
                      key={t.id}
                      data-testid={`detail-row-${t.id}`}
                      onClick={() => {
                        setSelectedTxn(t);
                        recordAction({
                          type: 'click',
                          target: `Transaction Row ${t.id}`,
                          testId: `detail-row-${t.id}`,
                          description: `Inspected transaction ${t.id} details receipt`,
                        });
                      }}
                      className="hover:bg-red-50/40 cursor-pointer transition-colors"
                    >
                      <td className="py-2.5 px-4 font-mono font-medium text-red-900">
                        {t.id}
                      </td>
                      <td className="py-2.5 px-4 font-mono text-slate-600 text-[11px] whitespace-nowrap">
                        {new Date(t.timestamp).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-2.5 px-4 font-medium text-slate-900">
                        {t.description}
                        {t.memo && <span className="block text-[11px] text-slate-400 font-normal">Memo: {t.memo}</span>}
                      </td>
                      <td
                        className={`py-2.5 px-4 text-right font-mono font-bold tabular-nums whitespace-nowrap ${
                          isCredit ? 'text-emerald-700' : 'text-slate-900'
                        }`}
                        data-testid={`detail-amount-${t.id}`}
                      >
                        {isCredit ? '+₹' : '-₹'}
                        {t.amount.toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-700 tabular-nums whitespace-nowrap">
                        ₹{t.balanceAfter.toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="py-2.5 px-4 font-mono text-slate-500 text-[11px]">
                        {t.referenceNumber}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transaction Details Receipt Modal */}
      {selectedTxn && (
        <div
          data-testid="transaction-modal"
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50"
        >
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Transaction Receipt</h3>
                  <div className="text-xs font-mono text-slate-500">ID: {selectedTxn.id}</div>
                </div>
              </div>
              <button
                type="button"
                data-testid="close-txn-modal-btn"
                onClick={() => setSelectedTxn(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Amount</span>
                <span className="font-mono font-bold text-red-900 text-sm">
                  ₹{selectedTxn.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Category</span>
                <span className="font-medium text-slate-800">{selectedTxn.category}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Execution Timestamp</span>
                <span className="font-mono text-slate-800">{selectedTxn.timestamp}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">UTR / Reference Number</span>
                <span className="font-mono font-semibold text-slate-800">{selectedTxn.referenceNumber}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Status</span>
                <span className="font-semibold text-emerald-700">Completed</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-600">
              <strong>Description:</strong> {selectedTxn.description}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                data-testid="modal-dismiss-btn"
                onClick={() => setSelectedTxn(null)}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-800 hover:bg-red-900 rounded-md transition-colors"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
