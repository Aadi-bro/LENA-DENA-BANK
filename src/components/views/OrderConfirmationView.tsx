import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { CheckCircle2, FileText, ArrowLeft, Package, Download } from 'lucide-react';
import { InvoiceModal } from '../modals/InvoiceModal';

interface OrderConfirmationViewProps {
  onBackToStore: () => void;
}

export const OrderConfirmationView: React.FC<OrderConfirmationViewProps> = ({
  onBackToStore,
}) => {
  const { lastOrder, cart } = useStore();
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  if (!lastOrder) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <h2 className="text-base font-bold text-slate-800">No active order found</h2>
        <button
          type="button"
          onClick={onBackToStore}
          className="text-xs bg-red-700 text-white px-4 py-2 rounded-lg font-semibold"
        >
          Back to Store
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6" data-testid="order-confirmation-page">
      {/* TC_OC_01: Order confirmation message */}
      <div
        className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs text-center space-y-4"
        data-testid="order-success-card"
      >
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-1">
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">
            Order Confirmed
          </span>
          <h1
            data-testid="order-confirmation-heading"
            className="text-2xl font-extrabold text-slate-900 tracking-tight pt-2"
          >
            Thank You For Your Order!
          </h1>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Your payment via {lastOrder.paymentMethod} was authorized. A confirmation receipt has been sent to your registered email.
          </p>
        </div>

        {/* Order Details Snippet */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-left space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500">Order ID:</span>
            <span className="font-mono font-bold text-slate-900" data-testid="confirmed-order-id">
              {lastOrder.orderId}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Order Date:</span>
            <span className="font-semibold text-slate-800">{lastOrder.date}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Delivery To:</span>
            <span className="font-semibold text-slate-800">
              {lastOrder.shippingAddress.fullName}, {lastOrder.shippingAddress.city}
            </span>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-slate-900">
            <span>Total Paid:</span>
            <span className="text-emerald-700 text-sm" data-testid="confirmed-total-amount">
              ₹{lastOrder.total.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* TC_OC_02: Verify bag after successful order is empty */}
        <div className="text-[11px] text-slate-500 bg-slate-100 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5">
          <Package className="w-3.5 h-3.5 text-slate-400" />
          <span data-testid="bag-status-check">
            Bag status: <strong className="text-slate-800">{cart.length === 0 ? 'Empty (0 items)' : `${cart.length} items`}</strong>
          </span>
        </div>

        {/* Action Buttons: TC_OC_03 View Invoice & TC_OC_04 Back to Store */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          {/* TC_OC_03: View Invoice */}
          <button
            type="button"
            data-testid="view-invoice-btn"
            onClick={() => setIsInvoiceOpen(true)}
            className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2.5 px-5 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>View Tax Invoice</span>
          </button>

          {/* TC_OC_04 & TC_CO_08: Back to store / shopping */}
          <button
            type="button"
            data-testid="back-to-store-btn"
            onClick={onBackToStore}
            className="w-full sm:w-auto bg-red-700 hover:bg-red-800 text-white font-semibold text-xs py-2.5 px-5 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Store</span>
          </button>
        </div>
      </div>

      {/* Invoice Modal */}
      {isInvoiceOpen && (
        <InvoiceModal order={lastOrder} onClose={() => setIsInvoiceOpen(false)} />
      )}
    </div>
  );
};
