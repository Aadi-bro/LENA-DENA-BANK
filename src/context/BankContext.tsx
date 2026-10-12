import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  Account,
  Transaction,
  Payee,
  VirtualCard,
  LoanApplication,
  RecordedAction,
  AccountType,
} from '../types/bank';
import {
  INITIAL_USERS,
  INITIAL_ACCOUNTS,
  INITIAL_TRANSACTIONS,
  INITIAL_PAYEES,
  INITIAL_CARDS,
} from '../data/mockBankData';

interface TransferParams {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  transferType?: 'IMPS' | 'NEFT' | 'RTGS';
  beneficiaryName?: string;
  ifscCode?: string;
  remarks?: string;
}

interface BillPayParams {
  payeeName: string;
  accountNumber: string;
  verifyAccountNumber: string;
  amount: number;
  fromAccountId: string;
  category?: string;
}

interface LoanParams {
  requestedAmount: number;
  downPayment: number;
  purpose: 'GOLD_LOAN' | 'PERSONAL' | 'HOME_LOAN' | 'CAR_LOAN' | 'BUSINESS';
  termMonths: number;
  annualIncome: number;
}

interface OpenAccountParams {
  type: AccountType;
  initialDeposit: number;
  fundingAccountId: string;
  nickname: string;
}

interface BankContextType {
  currentUser: User | null;
  users: Record<string, User>;
  accounts: Account[];
  transactions: Transaction[];
  payees: Payee[];
  cards: VirtualCard[];
  loanApplications: LoanApplication[];
  recordedActions: RecordedAction[];

  // Auth & Session
  login: (username: string) => boolean;
  logout: () => void;
  switchPersona: (username: string) => void;
  registerUser: (userData: {
    username: string;
    fullName: string;
    email: string;
    phone: string;
    pan: string;
    aadhaar: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    initialDeposit: number;
  }) => void;
  updateUserProfile: (data: Partial<User>) => void;

  // Manual Testing Banking Operations
  openNewAccount: (params: OpenAccountParams) => Promise<{ account: Account; transactionId: string }>;
  transferFunds: (params: TransferParams) => Promise<{ utrNumber: string; timestamp: string }>;
  payBill: (params: BillPayParams) => Promise<{ referenceNumber: string; timestamp: string }>;
  applyLoan: (params: LoanParams) => Promise<LoanApplication>;
  toggleCardFreeze: (cardId: string) => void;
  updateCardLimit: (cardId: string, limit: number) => void;

  // Manual Tester Helper
  resetDatabase: () => void;
  recordAction: (action: Omit<RecordedAction, 'id' | 'timestamp'>) => void;
}

const BankContext = createContext<BankContextType | null>(null);

const STORAGE_KEY = 'lena_dena_bank_db_v2';

export const BankProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<Record<string, User>>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_users`);
      return saved ? JSON.parse(saved) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  const [currentUsername, setCurrentUsername] = useState<string>('rahul.sharma');

  const [accounts, setAccounts] = useState<Account[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_accounts`);
      return saved ? JSON.parse(saved) : INITIAL_ACCOUNTS;
    } catch {
      return INITIAL_ACCOUNTS;
    }
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_transactions`);
      return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  const [payees, setPayees] = useState<Payee[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_payees`);
      return saved ? JSON.parse(saved) : INITIAL_PAYEES;
    } catch {
      return INITIAL_PAYEES;
    }
  });

  const [cards, setCards] = useState<VirtualCard[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_cards`);
      return saved ? JSON.parse(saved) : INITIAL_CARDS;
    } catch {
      return INITIAL_CARDS;
    }
  });

  const [loanApplications, setLoanApplications] = useState<LoanApplication[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_loans`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [recordedActions, setRecordedActions] = useState<RecordedAction[]>([]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_users`, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_accounts`, JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_transactions`, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_payees`, JSON.stringify(payees));
  }, [payees]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_cards`, JSON.stringify(cards));
  }, [cards]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_loans`, JSON.stringify(loanApplications));
  }, [loanApplications]);

  const currentUser = currentUsername ? (users[currentUsername] ?? null) : null;

  const recordAction = (action: Omit<RecordedAction, 'id' | 'timestamp'>) => {
    const newAction: RecordedAction = {
      ...action,
      id: `act_${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    setRecordedActions((prev) => [newAction, ...prev.slice(0, 49)]);
  };

  const login = (username: string): boolean => {
    if (users[username]) {
      setCurrentUsername(username);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUsername('');
  };

  const switchPersona = (username: string) => {
    if (users[username]) {
      setCurrentUsername(username);
    }
  };

  const registerUser = (data: {
    username: string;
    fullName: string;
    email: string;
    phone: string;
    pan: string;
    aadhaar: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    initialDeposit: number;
  }) => {
    const newCustId = `LDB_CUST_${Math.floor(1000 + Math.random() * 9000)}`;
    const newAccNumber = `30${Math.floor(100000000 + Math.random() * 900000000)}`;

    const newUser: User = {
      id: newCustId,
      username: data.username,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      address: {
        street: data.street,
        city: data.city,
        state: data.state,
        zip: data.zip,
      },
      panMasked: data.pan ? `${data.pan.slice(0, 5)}****${data.pan.slice(-1)}` : 'ABCDE****F',
      aadhaarMasked: data.aadhaar ? `XXXX-XXXX-${data.aadhaar.slice(-4)}` : 'XXXX-XXXX-9999',
      avatarUrl: '/src/assets/images/avatar_john_doe_1791513743956.jpg',
      memberSince: new Date().toISOString().split('T')[0],
      customerTier: 'REGULAR',
    };

    const newAccount: Account = {
      id: newAccNumber,
      userId: newCustId,
      type: 'SAVINGS',
      nickname: 'Regular Savings Bank Account',
      balance: data.initialDeposit,
      availableBalance: data.initialDeposit,
      currency: 'INR',
      status: 'ACTIVE',
      ifscCode: 'LDBN0001001',
      branchName: 'Connaught Place Main Branch, New Delhi',
      createdAt: new Date().toISOString(),
      interestRate: 3.50,
    };

    const newCard: VirtualCard = {
      id: `card_${Date.now()}`,
      accountId: newAccNumber,
      cardNumberMasked: `6071 •••• •••• ${Math.floor(1000 + Math.random() * 9000)}`,
      cardNumberFull: `6071 8821 0041 ${Math.floor(1000 + Math.random() * 9000)}`,
      cardholderName: data.fullName.toUpperCase(),
      expDate: '10/31',
      cvv: `${Math.floor(100 + Math.random() * 900)}`,
      isFrozen: false,
      dailyLimit: 25000,
      network: 'RuPay',
      cardType: 'DEBIT',
    };

    const initialTxn: Transaction = {
      id: `TXN-IND-${Math.floor(100000 + Math.random() * 900000)}`,
      accountId: newAccNumber,
      type: 'DEPOSIT',
      amount: data.initialDeposit,
      balanceAfter: data.initialDeposit,
      description: 'Account Opening Cash/Cheque Deposit',
      category: 'Deposit',
      timestamp: new Date().toISOString(),
      status: 'COMPLETED',
      referenceNumber: `INIT-${newAccNumber}`,
    };

    setUsers((prev) => ({ ...prev, [data.username]: newUser }));
    setAccounts((prev) => [...prev, newAccount]);
    setCards((prev) => [...prev, newCard]);
    setTransactions((prev) => [initialTxn, ...prev]);
    setCurrentUsername(data.username);
  };

  const updateUserProfile = (data: Partial<User>) => {
    if (!currentUsername || !users[currentUsername]) return;
    setUsers((prev) => ({
      ...prev,
      [currentUsername]: {
        ...prev[currentUsername],
        ...data,
      },
    }));
  };

  const openNewAccount = async ({
    type,
    initialDeposit,
    fundingAccountId,
    nickname,
  }: OpenAccountParams): Promise<{ account: Account; transactionId: string }> => {
    if (!currentUser) throw new Error('Authentication required: Please sign in first');

    const fundingAccount = accounts.find((a) => a.id === fundingAccountId);
    if (!fundingAccount) throw new Error('Funding account not found');

    if (fundingAccount.availableBalance < initialDeposit) {
      throw new Error(`Insufficient funds: Available balance in source account is ₹${fundingAccount.availableBalance.toFixed(2)}`);
    }

    if (initialDeposit < 500) {
      throw new Error('Minimum opening amount for Lena Dena Bank account/deposit is ₹500.00');
    }

    const prefix = type === 'FIXED_DEPOSIT' ? '50' : type === 'RECURRING_DEPOSIT' ? '40' : '30';
    const newAccountId = `${prefix}${Math.floor(100000000 + Math.random() * 900000000)}`;
    const timestamp = new Date().toISOString();
    const utrRef = `UTR-LDBN-${Math.floor(100000 + Math.random() * 900000)}`;

    const newAccount: Account = {
      id: newAccountId,
      userId: currentUser.id,
      type,
      nickname: nickname || `${type === 'FIXED_DEPOSIT' ? 'Fixed Deposit (FD)' : type === 'CURRENT' ? 'Current Account' : 'Savings Account'}`,
      balance: initialDeposit,
      availableBalance: type === 'FIXED_DEPOSIT' ? 0 : initialDeposit,
      currency: 'INR',
      status: 'ACTIVE',
      ifscCode: fundingAccount.ifscCode || 'LDBN0001001',
      branchName: fundingAccount.branchName || 'Connaught Place Main Branch, New Delhi',
      createdAt: timestamp,
      interestRate: type === 'FIXED_DEPOSIT' ? 7.10 : type === 'RECURRING_DEPOSIT' ? 6.80 : 3.50,
      maturityDate: type === 'FIXED_DEPOSIT' ? '2027-10-15' : undefined,
    };

    const debitTxn: Transaction = {
      id: `TXN-IND-${Math.floor(100000 + Math.random() * 900000)}`,
      accountId: fundingAccountId,
      type: 'TRANSFER_OUT',
      amount: initialDeposit,
      balanceAfter: fundingAccount.balance - initialDeposit,
      description: `Debit for Opening New ${type} A/c #${newAccountId}`,
      category: 'Transfer',
      timestamp,
      status: 'COMPLETED',
      referenceNumber: utrRef,
    };

    const creditTxn: Transaction = {
      id: `TXN-IND-${Math.floor(100000 + Math.random() * 900000)}`,
      accountId: newAccountId,
      type: 'DEPOSIT',
      amount: initialDeposit,
      balanceAfter: initialDeposit,
      description: `Opening Deposit from A/c #${fundingAccountId}`,
      category: 'Deposit',
      timestamp,
      status: 'COMPLETED',
      referenceNumber: utrRef,
    };

    // INTENTIONAL DEFECT: Under-debits source account (only debits 1000 if deposit > 5000), causing balance reconciliation failure
    const actualDebitAmount = initialDeposit > 5000 ? 1000 : initialDeposit;

    setAccounts((prev) => [
      ...prev.map((acc) =>
        acc.id === fundingAccountId
          ? {
              ...acc,
              balance: acc.balance - actualDebitAmount,
              availableBalance: acc.availableBalance - actualDebitAmount,
            }
          : acc
      ),
      newAccount,
    ]);

    setTransactions((prev) => [creditTxn, debitTxn, ...prev]);

    return { account: newAccount, transactionId: utrRef };
  };

  const transferFunds = async ({
    fromAccountId,
    toAccountId,
    amount,
    transferType = 'IMPS',
    beneficiaryName,
    ifscCode,
    remarks,
  }: TransferParams): Promise<{ utrNumber: string; timestamp: string }> => {
    if (amount <= 0) {
      throw new Error('Transfer amount must be greater than ₹0.00');
    }

    const fromAcc = accounts.find((a) => a.id === fromAccountId);
    if (!fromAcc) throw new Error('Source account not found');

    if (fromAcc.status === 'FROZEN') {
      throw new Error('Source account is locked or frozen');
    }

    if (fromAcc.availableBalance < amount) {
      throw new Error(`Insufficient funds: Available balance is ₹${fromAcc.availableBalance.toFixed(2)}`);
    }

    if (fromAccountId === toAccountId) {
      throw new Error('Debit and Credit account numbers cannot be identical');
    }

    const internalToAcc = accounts.find((a) => a.id === toAccountId);
    const timestamp = new Date().toISOString();
    const utrNumber = `UTR-LDBN-${Math.floor(10000000 + Math.random() * 90000000)}`;

    const debitTxn: Transaction = {
      id: `TXN-IND-${Math.floor(100000 + Math.random() * 900000)}`,
      accountId: fromAccountId,
      type: 'TRANSFER_OUT',
      amount,
      balanceAfter: fromAcc.balance - amount,
      description: `${transferType} Outward to A/c #${toAccountId} ${beneficiaryName ? `(${beneficiaryName})` : ''}`,
      category: 'Transfer',
      timestamp,
      status: 'COMPLETED',
      referenceNumber: utrNumber,
      memo: remarks,
      counterpartyName: beneficiaryName || `A/c #${toAccountId}`,
    };

    let newTxns = [debitTxn];

    if (internalToAcc) {
      const creditTxn: Transaction = {
        id: `TXN-IND-${Math.floor(100000 + Math.random() * 900000)}`,
        accountId: toAccountId,
        type: 'TRANSFER_IN',
        amount,
        balanceAfter: internalToAcc.balance + amount,
        description: `${transferType} Inward from A/c #${fromAcc.id} (${fromAcc.nickname})`,
        category: 'Transfer',
        timestamp,
        status: 'COMPLETED',
        referenceNumber: utrNumber,
        memo: remarks,
        counterpartyName: fromAcc.nickname,
      };
      newTxns.push(creditTxn);
    }

    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === fromAccountId) {
          return {
            ...acc,
            balance: acc.balance - amount,
            availableBalance: acc.availableBalance - amount,
          };
        }
        if (internalToAcc && acc.id === toAccountId) {
          return {
            ...acc,
            balance: acc.balance + amount,
            availableBalance: acc.availableBalance + amount,
          };
        }
        return acc;
      })
    );

    setTransactions((prev) => [...newTxns, ...prev]);

    return { utrNumber, timestamp };
  };

  const payBill = async ({
    payeeName,
    accountNumber,
    verifyAccountNumber,
    amount,
    fromAccountId,
  }: BillPayParams): Promise<{ referenceNumber: string; timestamp: string }> => {
    if (!payeeName || !payeeName.trim()) {
      throw new Error('Please select or specify biller name');
    }

    if (accountNumber !== verifyAccountNumber) {
      throw new Error('Consumer/Account numbers do not match');
    }

    if (amount <= 0) {
      throw new Error('Bill amount must be greater than ₹0.00');
    }

    const fromAcc = accounts.find((a) => a.id === fromAccountId);
    if (!fromAcc) throw new Error('Payment account not found');

    if (fromAcc.availableBalance < amount) {
      throw new Error(`Insufficient funds: Available balance is ₹${fromAcc.availableBalance.toFixed(2)}`);
    }

    const timestamp = new Date().toISOString();
    const referenceNumber = `BP-BBPS-${Math.floor(10000000 + Math.random() * 90000000)}`;

    const billTxn: Transaction = {
      id: `TXN-IND-${Math.floor(100000 + Math.random() * 900000)}`,
      accountId: fromAccountId,
      type: 'BILL_PAY',
      amount,
      balanceAfter: fromAcc.balance - amount,
      description: `BBPS Bill Payment - ${payeeName} (Ref: ${accountNumber})`,
      category: 'Bill Payment',
      timestamp,
      status: 'COMPLETED',
      referenceNumber,
      counterpartyName: payeeName,
    };

    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === fromAccountId
          ? {
              ...acc,
              balance: acc.balance - amount,
              availableBalance: acc.availableBalance - amount,
            }
          : acc
      )
    );

    setTransactions((prev) => [billTxn, ...prev]);

    return { referenceNumber, timestamp };
  };

  const applyLoan = async ({
    requestedAmount,
    downPayment,
    purpose,
    termMonths,
    annualIncome,
  }: LoanParams): Promise<LoanApplication> => {
    if (!currentUser) throw new Error('Authentication required');

    const loanId = `LOAN-LDBN-${Math.floor(100000 + Math.random() * 900000)}`;
    const downPaymentRatio = downPayment / requestedAmount;

    let isApproved = true;
    let decisionReason = 'Loan eligibility approved: Income and margin requirements met successfully.';

    // Simple manual testing rules
    // INTENTIONAL DEFECT 1: If downPayment >= requestedAmount, triggers boundary failure rejection!
    if (downPayment >= requestedAmount) {
      isApproved = false;
      decisionReason = 'Rejected: Down payment cannot equal or exceed requested principal amount.';
    } else if (requestedAmount > 1000000 && annualIncome < 300000) {
      isApproved = false;
      decisionReason = 'Rejected: Annual income is insufficient for requested loan quantum.';
    } else if (downPaymentRatio < 0.15 && purpose !== 'GOLD_LOAN') {
      isApproved = false;
      decisionReason = `Rejected: Minimum 15% down payment margin required (provided ${(downPaymentRatio * 100).toFixed(1)}%).`;
    }

    const rate = isApproved
      ? purpose === 'GOLD_LOAN'
        ? 8.25
        : purpose === 'HOME_LOAN'
        ? 8.50
        : purpose === 'CAR_LOAN'
        ? 8.65
        : 10.50
      : undefined;

    // INTENTIONAL DEFECT 2: Flawed linear simple interest formula instead of standard reducing balance EMI formula
    const monthlyPayment = isApproved && rate
      ? Math.round((requestedAmount + (requestedAmount * (rate / 100) * (termMonths / 12))) / termMonths)
      : undefined;

    let createdAccountId: string | undefined;

    if (isApproved) {
      createdAccountId = `70${Math.floor(100000000 + Math.random() * 900000000)}`;
      const primarySavings = accounts.find((a) => a.userId === currentUser.id && a.type === 'SAVINGS');

      const newLoanAccount: Account = {
        id: createdAccountId,
        userId: currentUser.id,
        type: 'LOAN',
        nickname: `${purpose.replace('_', ' ')} Account`,
        balance: -requestedAmount,
        availableBalance: 0,
        currency: 'INR',
        status: 'ACTIVE',
        ifscCode: 'LDBN0001001',
        branchName: 'Connaught Place Main Branch, New Delhi',
        createdAt: new Date().toISOString(),
        interestRate: rate,
      };

      setAccounts((prev) => [...prev, newLoanAccount]);

      if (primarySavings) {
        const disburseTxn: Transaction = {
          id: `TXN-IND-${Math.floor(100000 + Math.random() * 900000)}`,
          accountId: primarySavings.id,
          type: 'LOAN_DISBURSEMENT',
          amount: requestedAmount,
          balanceAfter: primarySavings.balance + requestedAmount,
          description: `Loan Disbursed to Savings Account (Loan A/c #${createdAccountId})`,
          category: 'Loan Disbursement',
          timestamp: new Date().toISOString(),
          status: 'COMPLETED',
          referenceNumber: loanId,
        };

        setAccounts((prev) =>
          prev.map((acc) =>
            acc.id === primarySavings.id
              ? {
                  ...acc,
                  balance: acc.balance + requestedAmount,
                  availableBalance: acc.availableBalance + requestedAmount,
                }
              : acc
          )
        );

        setTransactions((prev) => [disburseTxn, ...prev]);
      }
    }

    const application: LoanApplication = {
      id: loanId,
      userId: currentUser.id,
      requestedAmount,
      downPayment,
      purpose,
      termMonths,
      annualIncome,
      status: isApproved ? 'APPROVED' : 'DENIED',
      approvedRate: rate,
      monthlyPayment: monthlyPayment ? Math.round(monthlyPayment) : undefined,
      decisionReason,
      submittedAt: new Date().toISOString(),
      createdAccountId,
    };

    setLoanApplications((prev) => [application, ...prev]);
    return application;
  };

  const toggleCardFreeze = (cardId: string) => {
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, isFrozen: !c.isFrozen } : c))
    );
  };

  const updateCardLimit = (cardId: string, limit: number) => {
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, dailyLimit: limit } : c))
    );
  };

  const resetDatabase = () => {
    setUsers(INITIAL_USERS);
    setAccounts(INITIAL_ACCOUNTS);
    setTransactions(INITIAL_TRANSACTIONS);
    setPayees(INITIAL_PAYEES);
    setCards(INITIAL_CARDS);
    setLoanApplications([]);
    setCurrentUsername('rahul.sharma');
    localStorage.removeItem(`${STORAGE_KEY}_users`);
    localStorage.removeItem(`${STORAGE_KEY}_accounts`);
    localStorage.removeItem(`${STORAGE_KEY}_transactions`);
    localStorage.removeItem(`${STORAGE_KEY}_payees`);
    localStorage.removeItem(`${STORAGE_KEY}_cards`);
    localStorage.removeItem(`${STORAGE_KEY}_loans`);
  };

  return (
    <BankContext.Provider
      value={{
        currentUser,
        users,
        accounts,
        transactions,
        payees,
        cards,
        loanApplications,
        recordedActions,
        login,
        logout,
        switchPersona,
        registerUser,
        updateUserProfile,
        openNewAccount,
        transferFunds,
        payBill,
        applyLoan,
        toggleCardFreeze,
        updateCardLimit,
        resetDatabase,
        recordAction,
      }}
    >
      {children}
    </BankContext.Provider>
  );
};

export const useBank = (): BankContextType => {
  const context = useContext(BankContext);
  if (!context) {
    throw new Error('useBank must be used within BankProvider');
  }
  return context;
};
