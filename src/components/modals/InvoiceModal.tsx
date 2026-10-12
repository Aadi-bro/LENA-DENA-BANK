import React from 'react';
import { Order } from '../../types/store';
import { X, Printer, Download, CheckCircle, Landmark } from 'lucide-react';

interface InvoiceModalProps {
  order: Order;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, onClose }) => {
  return (
    <div
      data-testid="invoice-modal-overlay"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in"
    >
      <div
        data-testid="invoice-modal-content"
        className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden"
      >
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-lg tracking-tight text-white">LENA DENA STORE</span>
            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest px-2 py-0.5 bg-slate-800 rounded">
              Tax Invoice
            </span>
          </div>
          <button
            type="button"
            data-testid="close-invoice-btn"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Invoice Body (TC_OC_03) */}
        <div className="p-6 lg:p-8 space-y-6 text-xs text-slate-700 font-sans" id="printable-invoice">
          {/* Top Invoice Metadata */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Invoice To:</p>
              <h3 className="font-bold text-sm text-slate-900 mt-0.5">{order.shippingAddress.fullName}</h3>
              <p className="text-slate-600 mt-0.5">{order.shippingAddress.addressLine}</p>
              <p className="text-slate-600">
                {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pinCode}
              </p>
              <p className="text-slate-500 mt-0.5">Phone: +91 {order.shippingAddress.phone}</p>
            </div>

            <div className="sm:text-right space-y-1">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold">Invoice No:</span>{' '}
                <span className="font-mono font-bold text-slate-900" data-testid="invoice-number">
                  INV-{order.orderId}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold">Order ID:</span>{' '}
                <span className="font-mono font-semibold text-slate-700">{order.orderId}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold">Date:</span>{' '}
                <span className="font-medium text-slate-700">{order.date}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold">Payment:</span>{' '}
                <span className="font-semibold text-emerald-700">{order.paymentMethod} (PAID)</span>
              </div>
            </div>
          </div>

          {/* Product Items Table (TC_OC_03) */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" data-testid="invoice-items-table">
              <thead>
                <tr className="border-b border-slate-300 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-2">Item Description</th>
                  <th className="py-2 text-center">Qty</th>
                  <th className="py-2 text-right">Unit Price</th>
                  <th className="py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {order.items.map((item, idx) => (
                  <tr key={idx} className="text-slate-800">
                    <td className="py-2.5 pr-2">
                      <div className="font-bold text-slate-900">{item.product.name}</div>
                      <div className="text-[10px] text-slate-400">SKU: {item.product.specifications.sku}</div>
                    </td>
                    <td className="py-2.5 text-center font-medium">{item.quantity}</td>
                    <td className="py-2.5 text-right font-medium">₹{item.product.price.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 text-right font-bold text-slate-900">
                      ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total Breakdown */}
          <div className="border-t border-slate-200 pt-3 flex justify-end">
            <div className="w-64 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-semibold text-slate-900">₹{order.subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST Tax (18%):</span>
                <span className="font-semibold text-slate-900">₹{order.tax.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shipping Charges:</span>
                <span className="font-semibold text-slate-900">
                  {order.shippingFee === 0 ? 'FREE' : `₹${order.shippingFee}`}
                </span>
              </div>
              <div className="border-t border-slate-300 pt-1.5 flex justify-between font-extrabold text-sm text-slate-900">
                <span>Grand Total:</span>
                <span className="text-red-700" data-testid="invoice-grand-total">
                  ₹{order.total.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-[10px] text-slate-500 text-center">
            This is a computer generated commercial invoice. GSTIN: 27AABCL1234F1Z8. Lena Dena Retail Private Limited.
          </div>
        </div>

        {/* Modal Actions */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Invoice</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
