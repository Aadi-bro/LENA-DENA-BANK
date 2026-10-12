import React, { useState } from 'react';
import { useBank } from '../../context/BankContext';
import { Download, Plus, Search, ArrowRight, Landmark } from 'lucide-react';

interface AccountsOverviewViewProps {
  onSelectAccount: (accountId: string) => void;
  onNavigate: (view: string) => void;
}

export const AccountsOverviewView: React.FC<AccountsOverviewViewProps> = ({
  onSelectAccount,
  onNavigate,
}) => {
  const { currentUser, accounts, transactions, recordAction } = useBank();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('ALL');

  const userAccounts = accounts.filter((a) => a.userId === currentUser?.id);
  const userAccountIds = new Set(userAccounts.map((a) => a.id));
  const userTransactions = transactions.filter((t) => userAccountIds.has(t.accountId));

  // INTENTIONAL DEFECT: Uses availableBalance instead of ledger balance, completely omitting Fixed Deposits from Total Deposits KPI
  const totalAssets = userAccounts
    .filter((a) => a.type !== 'LOAN')
    .reduce((sum, a) => sum + Math.max(0, a.availableBalance), 0);

  const totalLiabilities = userAccounts
    .filter((a) => a.type === 'LOAN')
    .reduce((sum, a) => sum + Math.abs(a.balance), 0);

  const filteredTransactions = userTransactions.filter((t) => {
    const matchesSearch =
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType =
      selectedTypeFilter === 'ALL' ||
      (selectedTypeFilter === 'CREDIT' && (t.type === 'DEPOSIT' || t.type === 'TRANSFER_IN' || t.type === 'LOAN_DISBURSEMENT' || t.type === 'INTEREST_CREDIT')) ||
      (selectedTypeFilter === 'DEBIT' && (t.type === 'WITHDRAWAL' || t.type === 'TRANSFER_OUT' || t.type === 'BILL_PAY' || t.type === 'FEE'));
    return matchesSearch && matchesType;
  });

  const exportCsv = () => {
    recordAction({
      type: 'click',
      target: 'Download Passbook CSV',
      testId: 'export-statement-csv-btn',
      description: 'Downloaded Passbook Statement CSV',
    });

    const headers = ['TransactionID', 'AccountNo', 'Date', 'Type', 'Description', 'Amount_INR', 'BalanceAfter_INR', 'UTR_Ref'];
    // INTENTIONAL DEFECT: Amount and BalanceAfter values swapped in CSV row export
    const rows = filteredTransactions.map((t) => [
      t.id,
      t.accountId,
      t.timestamp,
      t.type,
      `"${t.description.replace(/"/g, '""')}"`,
      t.balanceAfter.toFixed(2), // Swapped bug!
      t.amount.toFixed(2),       // Swapped bug!
      t.referenceNumber,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `LenaDenaBank_Passbook_${currentUser?.username}_${Date.now()}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6" data-testid="accounts-overview-view">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900" data-testid="overview-title">
            Accounts Overview & Passbook
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Customer ID: <span className="font-mono font-bold text-slate-700">{currentUser?.id}</span> · PAN: {currentUser?.panMasked} · Aadhaar: {currentUser?.aadhaarMasked}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            data-testid="open-account-cta"
            onClick={() => onNavigate('open-account')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-red-800 hover:bg-red-900 rounded-lg transition-colors whitespace-nowrap shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Open FD / Deposit</span>
          </button>
          <button
            type="button"
            data-testid="export-statement-csv-btn"
            onClick={exportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 text-red-800" />
            <span>Download Passbook (CSV)</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Total Deposits</div>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-mono tabular-nums" data-testid="total-assets-balance">
            ₹{totalAssets.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Savings Account & Term Deposit (FD) Reserves</div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Outstanding Loan Principal</div>
          <div className="text-2xl font-bold text-red-700 mt-1 font-mono tabular-nums" data-testid="total-liabilities-balance">
            ₹{totalLiabilities.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Active Car / Home Loan Balance</div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Customer Category</div>
          <div className="text-base font-bold text-red-900 mt-1" data-testid="customer-tier-label">
            {currentUser?.customerTier} Customer (KYC Active)
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Home Branch: <span className="font-semibold text-slate-700">Connaught Place Main Branch, New Delhi</span>
          </div>
        </div>
      </div>

      {/* Accounts List Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <h2 className="text-sm font-bold text-slate-900">Registered Accounts</h2>
          <span className="text-xs font-mono font-semibold text-slate-600">{userAccounts.length} Active Accounts</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left" data-testid="accounts-table">
            <thead className="bg-slate-100 text-slate-600 uppercase font-bold border-b border-slate-200 text-[11px]">
              <tr>
                <th className="py-2.5 px-4">Account No.</th>
                <th className="py-2.5 px-4">Account Type & Branch</th>
                <th className="py-2.5 px-4">IFSC Code</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-right">Available Balance</th>
                <th className="py-2.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {userAccounts.map((acc) => {
                const isLoan = acc.type === 'LOAN';
                const isNegative = acc.balance < 0;
                return (
                  <tr
                    key={acc.id}
                    data-testid={`account-row-${acc.id}`}
                    className="hover:bg-red-50/30 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-slate-900" data-testid={`account-id-${acc.id}`}>
                      {acc.id}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{acc.nickname}</div>
                      <div className="text-slate-500 text-[11px]">{acc.branchName}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-red-900">
                      {acc.ifscCode}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        data-testid={`account-status-${acc.id}`}
                        className={`font-semibold ${
                          acc.status === 'ACTIVE'
                            ? 'text-emerald-700'
                            : 'text-rose-700'
                        }`}
                      >
                        {acc.status}
                      </span>
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-mono font-bold tabular-nums text-sm ${
                        isNegative ? 'text-rose-700' : 'text-slate-900'
                      }`}
                      data-testid={`account-balance-${acc.id}`}
                    >
                      {isNegative ? '-' : ''}₹
                      {Math.abs(acc.balance).toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        data-testid={`view-account-btn-${acc.id}`}
                        onClick={() => onSelectAccount(acc.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-red-800 hover:text-red-950 hover:bg-red-50 rounded transition-colors"
                      >
                        <span>View Passbook</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Passbook Transactions */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Recent Passbook Activity</h2>
            <p className="text-xs text-slate-500">Consolidated ledger across all registered accounts</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                data-testid="search-transactions-input"
                placeholder="Search description / UTR..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:border-red-800 w-48"
              />
            </div>

            <div className="flex items-center p-0.5 bg-slate-200/80 rounded-md text-xs">
              <button
                type="button"
                data-testid="filter-all-btn"
                onClick={() => setSelectedTypeFilter('ALL')}
                className={`px-2 py-0.5 rounded text-xs font-semibold transition-colors ${
                  selectedTypeFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                All
              </button>
              <button
                type="button"
                data-testid="filter-credit-btn"
                onClick={() => setSelectedTypeFilter('CREDIT')}
                className={`px-2 py-0.5 rounded text-xs font-semibold transition-colors ${
                  selectedTypeFilter === 'CREDIT' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
                }`}
              >
                Credits (+)
              </button>
              <button
                type="button"
                data-testid="filter-debit-btn"
                onClick={() => setSelectedTypeFilter('DEBIT')}
                className={`px-2 py-0.5 rounded text-xs font-semibold transition-colors ${
                  selectedTypeFilter === 'DEBIT' ? 'bg-white text-rose-800 shadow-xs' : 'text-slate-600'
                }`}
              >
                Debits (-)
              </button>
            </div>
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500" data-testid="no-transactions-found">
            No matching passbook transactions found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left" data-testid="recent-transactions-table">
              <thead className="bg-slate-100 text-slate-600 uppercase font-semibold border-b border-slate-200 text-[11px]">
                <tr>
                  <th className="py-2.5 px-4">Txn ID</th>
                  <th className="py-2.5 px-4">Account No.</th>
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4">Description</th>
                  <th className="py-2.5 px-4 text-right">Amount (₹)</th>
                  <th className="py-2.5 px-4 text-right">Running Balance</th>
                  <th className="py-2.5 px-4">Reference / UTR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredTransactions.slice(0, 8).map((txn) => {
                  const isCredit =
                    txn.type === 'DEPOSIT' ||
                    txn.type === 'TRANSFER_IN' ||
                    txn.type === 'LOAN_DISBURSEMENT' ||
                    txn.type === 'INTEREST_CREDIT';
                  return (
                    <tr
                      key={txn.id}
                      data-testid={`transaction-row-${txn.id}`}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="py-2.5 px-4 font-mono font-medium text-red-900">
                        {txn.id}
                      </td>
                      <td className="py-2.5 px-4 font-mono text-slate-600">
                        {txn.accountId}
                      </td>
                      <td className="py-2.5 px-4 font-mono text-slate-500 whitespace-nowrap">
                        {new Date(txn.timestamp).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-2.5 px-4 font-medium text-slate-900">
                        {txn.description}
                      </td>
                      <td
                        className={`py-2.5 px-4 text-right font-mono font-bold tabular-nums whitespace-nowrap ${
                          isCredit ? 'text-emerald-700' : 'text-slate-900'
                        }`}
                        data-testid={`txn-amount-${txn.id}`}
                      >
                        {isCredit ? '+₹' : '-₹'}
                        {txn.amount.toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-700 tabular-nums whitespace-nowrap">
                        ₹{txn.balanceAfter.toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="py-2.5 px-4 font-mono text-slate-500 text-[11px]">
                        {txn.referenceNumber}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
