import React, { useState } from 'react';
import { useBank } from '../../context/BankContext';
import { CheckCircle2, Shield } from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { currentUser, updateUserProfile, recordAction } = useBank();

  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [street, setStreet] = useState(currentUser?.address.street || '');
  const [city, setCity] = useState(currentUser?.address.city || '');
  const [state, setState] = useState(currentUser?.address.state || '');
  const [zip, setZip] = useState(currentUser?.address.zip || '');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    recordAction({
      type: 'click',
      target: 'Update Profile Button',
      testId: 'update-profile-btn',
      value: `${fullName}, ${email}, ${phone}`,
      description: `Updated customer contact information for ${currentUser?.username}`,
    });

    // INTENTIONAL DEFECT 1: Omission of 'phone' in the updateUserProfile update payload
    // The UI shows success, but phone changes are never saved to persistent storage!
    updateUserProfile({
      fullName,
      email,
      // phone is intentionally omitted here!
      address: {
        street,
        city,
        state,
        zip, // INTENTIONAL DEFECT 2: Non-numeric PIN code is allowed without regex validation
      },
    });

    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 4000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6" data-testid="profile-view">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900" data-testid="profile-title">
          Customer Profile & KYC Information
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Verify and update legal identity, mailing address, and registered communication details
        </p>
      </div>

      {showSuccessToast && (
        <div
          data-testid="profile-update-success"
          className="p-4 bg-emerald-50 border border-emerald-300 rounded-lg flex items-center gap-3 text-emerald-900"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="text-xs font-semibold">
            Customer profile and contact details updated successfully.
          </div>
        </div>
      )}

      {/* KYC Identity Card */}
      <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-red-800" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              KYC Identity Verification
            </h2>
          </div>
          <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
            VERIFIED
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[11px] text-slate-500 block">PAN Card Number</span>
            <span className="font-mono font-bold text-slate-900 text-sm">{currentUser?.panMasked || 'ABCDE****F'}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[11px] text-slate-500 block">UIDAI Aadhaar Number</span>
            <span className="font-mono font-bold text-slate-900 text-sm">{currentUser?.aadhaarMasked || 'XXXX-XXXX-4892'}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[11px] text-slate-500 block">Customer ID / CIF</span>
            <span className="font-mono font-bold text-slate-900">{currentUser?.id}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[11px] text-slate-500 block">Customer Tier</span>
            <span className="font-bold text-red-900">{currentUser?.customerTier || 'REGULAR'}</span>
          </div>
        </div>
      </div>

      {/* Edit Contact Information Form */}
      <div className="p-6 bg-white border border-slate-200 rounded-xl space-y-5 shadow-xs">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
          Mailing Address & Contact Information
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Legal Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              data-testid="profile-fullname-input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-md p-2.5 text-slate-900 focus:outline-none focus:border-red-800"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Registered Email <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                data-testid="profile-email-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-md p-2.5 text-slate-900 focus:outline-none focus:border-red-800 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mobile Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                data-testid="profile-phone-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98101 23456"
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-md p-2.5 text-slate-900 focus:outline-none focus:border-red-800 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Street / Flat / Locality <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              data-testid="profile-street-input"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-md p-2.5 text-slate-900 focus:outline-none focus:border-red-800"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                City <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                data-testid="profile-city-input"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-md p-2.5 text-slate-900 focus:outline-none focus:border-red-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                State <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                data-testid="profile-state-input"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-md p-2.5 text-slate-900 focus:outline-none focus:border-red-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                PIN Code <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                data-testid="profile-zip-input"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                maxLength={6}
                placeholder="110001"
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-md p-2.5 text-slate-900 font-mono focus:outline-none focus:border-red-800"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end">
            <button
              type="submit"
              data-testid="update-profile-btn"
              className="py-2.5 px-6 text-xs font-bold text-white bg-red-800 hover:bg-red-900 rounded-md transition-colors shadow-xs"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
