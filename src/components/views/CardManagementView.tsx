import React, { useState } from 'react';
import { useBank } from '../../context/BankContext';
import { CreditCard, Lock, Unlock, Eye, EyeOff, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const CardManagementView: React.FC = () => {
  const { currentUser, accounts, cards, toggleCardFreeze, updateCardLimit, recordAction } = useBank();

  const userAccountIds = new Set(
    accounts.filter((a) => a.userId === currentUser?.id).map((a) => a.id)
  );
  const userCards = cards.filter((c) => userAccountIds.has(c.accountId));

  const [selectedCardId, setSelectedCardId] = useState(userCards[0]?.id || '');
  const [showSensitiveDetails, setShowSensitiveDetails] = useState(false);
  const [newLimit, setNewLimit] = useState<number>(25000);
  const [limitSuccessMessage, setLimitSuccessMessage] = useState<string | null>(null);

  const activeCard = userCards.find((c) => c.id === selectedCardId) || userCards[0];

  const handleToggleFreeze = () => {
    if (!activeCard) return;
    recordAction({
      type: 'click',
      target: 'Toggle Card Lock/Freeze',
      testId: 'toggle-freeze-card-btn',
      value: `Card: ${activeCard.id}, Freeze: ${!activeCard.isFrozen}`,
      description: `${activeCard.isFrozen ? 'Unlocked' : 'Locked'} card #${activeCard.id}`,
    });
    toggleCardFreeze(activeCard.id);
  };

  const handleUpdateLimit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCard) return;
    recordAction({
      type: 'click',
      target: 'Save Card Daily Limit',
      testId: 'save-card-limit-btn',
      value: `Limit: ₹${newLimit}`,
      description: `Updated card #${activeCard.id} daily spending limit to ₹${newLimit}`,
    });
    updateCardLimit(activeCard.id, newLimit);
    setLimitSuccessMessage(`Debit card daily limit successfully updated to ₹${newLimit.toLocaleString('en-IN')}.`);
    setTimeout(() => setLimitSuccessMessage(null), 4000);
  };

  if (!activeCard) {
    return (
      <div className="p-8 text-center text-xs text-slate-500 bg-white border border-slate-200 rounded-xl" data-testid="no-cards-notice">
        No active debit cards registered for current user profile.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6" data-testid="card-management-view">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900" data-testid="cards-title">
          RuPay Debit Card Services & Security
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time card lock/unlock, spending limits, and security configuration
        </p>
      </div>

      {limitSuccessMessage && (
        <div
          data-testid="card-limit-success-alert"
          className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-xs text-emerald-900 flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{limitSuccessMessage}</span>
        </div>
      )}

      {/* RuPay Card Selector if multiple */}
      {userCards.length > 1 && (
        <div className="flex gap-2">
          {userCards.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCardId(c.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeCard.id === c.id
                  ? 'bg-red-800 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
              }`}
            >
              RuPay •••• {c.cardNumberMasked.slice(-4)}
            </button>
          ))}
        </div>
      )}

      {/* Visual Debit Card Component */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-tr from-red-950 via-red-900 to-amber-900 p-6 text-white shadow-xl max-w-md mx-auto aspect-[1.586/1] flex flex-col justify-between border border-amber-500/30">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-sm font-bold tracking-wider text-amber-300 uppercase">
              LENA DENA BANK
            </div>
            <div className="text-[10px] text-amber-100/80 tracking-widest uppercase">
              PLATINUM DEBIT CARD
            </div>
          </div>
          <div className="text-right">
            <span className="font-bold text-xs px-2 py-0.5 rounded bg-amber-400 text-red-950">
              RuPay
            </span>
          </div>
        </div>

        {/* EMV Chip & Contactless */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-7 rounded bg-amber-300 border border-amber-400/80 shadow-xs flex items-center justify-center">
            <div className="w-6 h-4 border border-amber-600/40 rounded-xs grid grid-cols-2 gap-0.5">
              <div className="border-r border-amber-600/40" />
              <div />
            </div>
          </div>
          <div className="text-[11px] font-mono tracking-wider text-amber-200/90">
            Wi-Fi Contactless )))
          </div>
        </div>

        {/* Card Number */}
        <div>
          <div
            data-testid="card-number-display"
            className="font-mono text-lg sm:text-xl tracking-widest font-semibold text-white drop-shadow-xs"
          >
            {showSensitiveDetails ? activeCard.cardNumberFull : activeCard.cardNumberMasked}
          </div>
        </div>

        {/* Card Holder & Expiry & Freeze Status */}
        <div className="flex items-end justify-between text-xs">
          <div>
            <div className="text-[9px] text-amber-200/80 uppercase tracking-wider">Cardholder</div>
            <div className="font-semibold tracking-wide uppercase text-white">
              {activeCard.cardholderName}
            </div>
          </div>
          <div>
            <div className="text-[9px] text-amber-200/80 uppercase tracking-wider">Valid Thru</div>
            <div className="font-mono font-semibold text-white">{activeCard.expDate}</div>
          </div>
          <div>
            <div className="text-[9px] text-amber-200/80 uppercase tracking-wider">CVV</div>
            <div className="font-mono font-semibold text-white">
              {showSensitiveDetails ? activeCard.cvv : '•••'}
            </div>
          </div>
        </div>

        {/* Freeze Overlay if card is locked */}
        {activeCard.isFrozen && (
          <div
            data-testid="card-frozen-overlay"
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center gap-2 text-white"
          >
            <Lock className="w-8 h-8 text-amber-400" />
            <div className="text-sm font-bold text-amber-300">CARD TEMPORARILY LOCKED</div>
            <div className="text-[11px] text-slate-300">Card blocked from transactions for your protection.</div>
          </div>
        )}
      </div>

      {/* Card Controls Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Toggle Freeze Box */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900">
              Instant Card Lock / Unlock
            </span>
            {activeCard.isFrozen ? (
              <Lock className="w-4 h-4 text-rose-600" />
            ) : (
              <Unlock className="w-4 h-4 text-emerald-600" />
            )}
          </div>
          <p className="text-xs text-slate-500">
            Instantly freeze or unfreeze your debit card to prevent unauthorized POS and ATM charges.
          </p>
          <button
            type="button"
            data-testid="toggle-freeze-card-btn"
            onClick={handleToggleFreeze}
            className={`w-full py-2 px-3 text-xs font-bold rounded-md transition-colors flex items-center justify-center gap-1.5 shadow-xs ${
              activeCard.isFrozen
                ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                : 'bg-rose-700 hover:bg-rose-800 text-white'
            }`}
          >
            {activeCard.isFrozen ? (
              <>
                <Unlock className="w-3.5 h-3.5" />
                <span>Unfreeze Card</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>Freeze / Lock Card</span>
              </>
            )}
          </button>
        </div>

        {/* Show/Hide sensitive details */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900">
              Show Card Number & CVV
            </span>
            <ShieldCheck className="w-4 h-4 text-slate-500" />
          </div>
          <p className="text-xs text-slate-500">
            Display the full 16-digit card number and 3-digit security CVV for e-commerce testing.
          </p>
          <button
            type="button"
            data-testid="toggle-card-details-btn"
            onClick={() => setShowSensitiveDetails(!showSensitiveDetails)}
            className="w-full py-2 px-3 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors flex items-center justify-center gap-1.5"
          >
            {showSensitiveDetails ? (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                <span>Mask Sensitive Details</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span>Show Full Card Details</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Daily Limits Form */}
      <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-4 shadow-xs">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
          Daily Spending & ATM Withdrawal Limit
        </h2>
        <form onSubmit={handleUpdateLimit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <label className="font-semibold text-slate-700">Daily ATM / POS Threshold (₹)</label>
              <span className="font-mono font-bold text-red-900" data-testid="current-limit-val">
                ₹{newLimit.toLocaleString('en-IN')}
              </span>
            </div>
            <input
              type="range"
              data-testid="card-limit-slider"
              min="1000"
              max="100000"
              step="1000"
              value={newLimit}
              onChange={(e) => setNewLimit(Number(e.target.value))}
              className="w-full accent-red-800"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
              <span>₹1,000 (Min)</span>
              <span>₹50,000</span>
              <span>₹1,00,000 (Max)</span>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              data-testid="save-card-limit-btn"
              className="px-4 py-2 text-xs font-bold text-white bg-red-800 hover:bg-red-900 rounded-md transition-colors shadow-xs"
            >
              Update Daily Limit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
