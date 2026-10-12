import React, { useState } from 'react';
import { useBank } from '../../context/BankContext';
import { Transaction } from '../../types/bank';
import { Search, Calendar, Hash, DollarSign, Filter, ArrowRight } from 'lucide-react';

export const FindTransactionsView: React.FC = () => {
  const { currentUser, accounts, transactions, recordAction } = useBank();

  const userAccountIds = new Set(
    accounts.filter((a) => a.userId === currentUser?.id).map((a) => a.id)
  );
  const userTransactions = transactions.filter((t) => userAccountIds.has(t.accountId));

  // Search criteria states
  const [searchTxnId, setSearchTxnId] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [searchFromDate, setSearchFromDate] = useState('');
  const [searchToDate, setSearchToDate] = useState('');
  const [searchAmount, setSearchAmount] = useState('');

  const [activeSearchType, setActiveSearchType] = useState<'ID' | 'DATE' | 'RANGE' | 'AMOUNT' | null>(null);
  const [searchResults, setSearchResults] = useState<Transaction[] | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Intentional Defect 1: Find by Transaction ID is strictly case-sensitive (fails if user types lowercase)
  const handleFindByTxnId = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTxnId.trim()) return;

    recordAction({
      type: 'click',
      target: 'Find by Transaction ID',
      testId: 'find-by-id-btn',
      value: searchTxnId,
      description: `Searched transaction by ID: ${searchTxnId}`,
    });

    setActiveSearchType('ID');
    setHasSearched(true);

    // INTENTIONAL DEFECT: Strict case sensitivity without .toUpperCase() or .trim()
    const results = userTransactions.filter((t) => t.id === searchTxnId);
    setSearchResults(results);
  };

  // Intentional Defect 2: Find by Date matches exact date string but has UTC timezone offset bug
  const handleFindByDate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchDate) return;

    recordAction({
      type: 'click',
      target: 'Find by Date',
      testId: 'find-by-date-btn',
      value: searchDate,
      description: `Searched transactions by date: ${searchDate}`,
    });

    setActiveSearchType('DATE');
    setHasSearched(true);

    const results = userTransactions.filter((t) => {
      const txnDateStr = t.timestamp.split('T')[0];
      return txnDateStr === searchDate;
    });
    setSearchResults(results);
  };

  // Intentional Defect 3: Find by Date Range has OFF-BY-ONE bug:
  // "To Date" is evaluated as strictly `< toDate` instead of `<= toDate + 'T23:59:59'`,
  // causing transactions that occurred ON the To Date to be omitted!
  const handleFindByDateRange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchFromDate || !searchToDate) return;

    recordAction({
      type: 'click',
      target: 'Find by Date Range',
      testId: 'find-by-range-btn',
      value: `${searchFromDate} to ${searchToDate}`,
      description: `Searched transactions by range: ${searchFromDate} to ${searchToDate}`,
    });

    setActiveSearchType('RANGE');
    setHasSearched(true);

    // INTENTIONAL DEFECT: Strict inequality on toDate drops all transactions on the end date
    const results = userTransactions.filter((t) => {
      const txnDateStr = t.timestamp.split('T')[0];
      return txnDateStr >= searchFromDate && txnDateStr < searchToDate;
    });
    setSearchResults(results);
  };

  // Intentional Defect 4: Find by Amount ignores decimal values (Math.floor bug):
  // Searching for 2450.50 fails because it truncates to integer comparison
  const handleFindByAmount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchAmount) return;

    const queryAmt = parseFloat(searchAmount);

    recordAction({
      type: 'click',
      target: 'Find by Amount',
      testId: 'find-by-amount-btn',
      value: searchAmount,
      description: `Searched transactions by amount: ₹${searchAmount}`,
    });

    setActiveSearchType('AMOUNT');
    setHasSearched(true);

    // INTENTIONAL DEFECT: Truncates decimal values with Math.floor, causing decimal searches like 2450.50 to fail!
    const results = userTransactions.filter((t) => {
      return Math.floor(t.amount) === Math.floor(queryAmt) && (searchAmount.includes('.') ? false : true);
    });
    setSearchResults(results);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6" data-testid="find-transactions-view">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900" data-testid="find-transactions-title">
          Find Transactions
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Search your historical transaction records by Transaction ID, Date, Date Range, or Amount
        </p>
      </div>

      {/* Grid of Search Methods */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. Find by Transaction ID */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-red-800" />
            <h2 className="text-xs font-bold text-slate-900">Find by Transaction ID</h2>
          </div>
          <form onSubmit={handleFindByTxnId} className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Transaction ID
              </label>
              <input
                type="text"
                data-testid="find-by-id-input"
                placeholder="e.g. TXN-IND-901842"
                value={searchTxnId}
                onChange={(e) => setSearchTxnId(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-md p-2 font-mono focus:outline-none focus:border-red-800"
              />
            </div>
            <button
              type="submit"
              data-testid="find-by-id-submit-btn"
              className="w-full py-2 px-3 text-xs font-bold text-white bg-red-800 hover:bg-red-900 rounded-md transition-colors"
            >
              Find by ID
            </button>
          </form>
        </div>

        {/* 2. Find by Specific Date */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-red-800" />
            <h2 className="text-xs font-bold text-slate-900">Find by Date</h2>
          </div>
          <form onSubmit={handleFindByDate} className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Transaction Date
              </label>
              <input
                type="date"
                data-testid="find-by-date-input"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-md p-2 font-mono focus:outline-none focus:border-red-800"
              />
            </div>
            <button
              type="submit"
              data-testid="find-by-date-submit-btn"
              className="w-full py-2 px-3 text-xs font-bold text-white bg-red-800 hover:bg-red-900 rounded-md transition-colors"
            >
              Find by Date
            </button>
          </form>
        </div>

        {/* 3. Find by Date Range */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-red-800" />
            <h2 className="text-xs font-bold text-slate-900">Find by Date Range</h2>
          </div>
          <form onSubmit={handleFindByDateRange} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  From Date
                </label>
                <input
                  type="date"
                  data-testid="find-range-from-input"
                  value={searchFromDate}
                  onChange={(e) => setSearchFromDate(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-md p-2 font-mono focus:outline-none focus:border-red-800"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  To Date
                </label>
                <input
                  type="date"
                  data-testid="find-range-to-input"
                  value={searchToDate}
                  onChange={(e) => setSearchToDate(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-md p-2 font-mono focus:outline-none focus:border-red-800"
                />
              </div>
            </div>
            <button
              type="submit"
              data-testid="find-range-submit-btn"
              className="w-full py-2 px-3 text-xs font-bold text-white bg-red-800 hover:bg-red-900 rounded-md transition-colors"
            >
              Find by Date Range
            </button>
          </form>
        </div>

        {/* 4. Find by Amount */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-red-800" />
            <h2 className="text-xs font-bold text-slate-900">Find by Amount (₹)</h2>
          </div>
          <form onSubmit={handleFindByAmount} className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Transaction Amount in ₹
              </label>
              <input
                type="number"
                step="any"
                data-testid="find-by-amount-input"
                placeholder="e.g. 2450.00"
                value={searchAmount}
                onChange={(e) => setSearchAmount(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-md p-2 font-mono focus:outline-none focus:border-red-800"
              />
            </div>
            <button
              type="submit"
              data-testid="find-by-amount-submit-btn"
              className="w-full py-2 px-3 text-xs font-bold text-white bg-red-800 hover:bg-red-900 rounded-md transition-colors"
            >
              Find by Amount
            </button>
          </form>
        </div>
      </div>

      {/* Search Results Table */}
      {hasSearched && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs" data-testid="find-results-container">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <h2 className="text-sm font-bold text-slate-900">
              Transaction Search Results
            </h2>
            <span className="text-xs font-mono font-semibold text-slate-600" data-testid="results-count">
              {searchResults ? searchResults.length : 0} matching records
            </span>
          </div>

          {!searchResults || searchResults.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500" data-testid="no-results-found">
              No transactions found matching your specified search criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left" data-testid="find-results-table">
                <thead className="bg-slate-100 text-slate-600 uppercase font-semibold border-b border-slate-200 text-[11px]">
                  <tr>
                    <th className="py-2.5 px-4">Transaction ID</th>
                    <th className="py-2.5 px-4">Date</th>
                    <th className="py-2.5 px-4">Account No.</th>
                    <th className="py-2.5 px-4">Description</th>
                    <th className="py-2.5 px-4 text-right">Amount (₹)</th>
                    <th className="py-2.5 px-4 text-right">Running Balance</th>
                    <th className="py-2.5 px-4">Reference Number</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {searchResults.map((t) => (
                    <tr key={t.id} data-testid={`find-result-row-${t.id}`} className="hover:bg-slate-50">
                      <td className="py-2.5 px-4 font-mono font-bold text-red-900">{t.id}</td>
                      <td className="py-2.5 px-4 font-mono text-slate-600">
                        {new Date(t.timestamp).toLocaleDateString('en-IN')}
                      </td>
                      <td className="py-2.5 px-4 font-mono text-slate-600">{t.accountId}</td>
                      <td className="py-2.5 px-4 font-medium text-slate-900">{t.description}</td>
                      <td className="py-2.5 px-4 font-mono font-bold text-right tabular-nums text-slate-900">
                        ₹{t.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-4 font-mono text-right tabular-nums text-slate-600">
                        ₹{t.balanceAfter.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-4 font-mono text-slate-500 text-[11px]">{t.referenceNumber}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
