export type AccountType = 'SAVINGS' | 'CURRENT' | 'FIXED_DEPOSIT' | 'RECURRING_DEPOSIT' | 'LOAN';
export type AccountStatus = 'ACTIVE' | 'FROZEN' | 'RESTRICTED';

export interface UserAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
}

export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  address: UserAddress;
  panMasked: string; // e.g. "ABCDE****F"
  aadhaarMasked: string; // e.g. "XXXX-XXXX-4892"
  avatarUrl: string;
  memberSince: string;
  customerTier: 'REGULAR' | 'PREMIUM' | 'PRIVILEGE';
}

export interface Account {
  id: string; // Account Number e.g. "30198420112"
  userId: string;
  type: AccountType;
  nickname: string;
  balance: number;
  availableBalance: number;
  currency: string;
  status: AccountStatus;
  ifscCode: string; // e.g. "LDBN0001001"
  branchName: string; // e.g. "Connaught Place, New Delhi"
  createdAt: string;
  interestRate?: number;
  maturityDate?: string;
}

export type TransactionType =
  | 'DEPOSIT'
  | 'WITHDRAWAL'
  | 'TRANSFER_IN'
  | 'TRANSFER_OUT'
  | 'BILL_PAY'
  | 'LOAN_DISBURSEMENT'
  | 'INTEREST_CREDIT'
  | 'FEE';

export type TransactionStatus = 'COMPLETED' | 'PENDING' | 'REJECTED';

export interface Transaction {
  id: string; // e.g. "TXN-90812"
  accountId: string;
  type: TransactionType;
  amount: number;
  balanceAfter: number;
  description: string;
  category: string;
  timestamp: string;
  status: TransactionStatus;
  referenceNumber: string; // UTR or Ref e.g. "UTR-LDBN-90184"
  counterpartyName?: string;
  memo?: string;
}

export interface Payee {
  id: string;
  name: string;
  category: string;
  accountNumber: string;
  ifscCode: string;
  phone: string;
}

export interface LoanApplication {
  id: string;
  userId: string;
  requestedAmount: number;
  downPayment: number;
  purpose: 'GOLD_LOAN' | 'PERSONAL' | 'HOME_LOAN' | 'CAR_LOAN' | 'BUSINESS';
  termMonths: number;
  annualIncome: number;
  status: 'APPROVED' | 'DENIED' | 'REVIEW';
  approvedRate?: number;
  monthlyPayment?: number;
  decisionReason: string;
  submittedAt: string;
  createdAccountId?: string;
}

export interface VirtualCard {
  id: string;
  accountId: string;
  cardNumberMasked: string;
  cardNumberFull: string;
  cardholderName: string;
  expDate: string;
  cvv: string;
  isFrozen: boolean;
  dailyLimit: number;
  network: 'RuPay' | 'VISA Platinum';
  cardType: 'DEBIT' | 'CREDIT';
}

export interface RecordedAction {
  id: string;
  timestamp: string;
  type: 'click' | 'fill' | 'select' | 'navigate';
  target: string;
  testId: string;
  value?: string;
  description: string;
}
