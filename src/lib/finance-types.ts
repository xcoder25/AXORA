export type FeeRecord = {
  id: string;
  studentId: string;
  studentName: string;
  tuition: number;
  pta: number;
  transport?: number;
  paid: number;
  status: string;
  schoolId: string;
  userId?: string;
  lastPaymentDate?: string;
  lastPaystackRef?: string;
  dueDate?: string;
  notes?: string;
};

export type FinanceTransaction = {
  id: string;
  reference: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  amount: number;
  currency: string;
  channel: string;
  status: string;
  paidAt: string;
  financeRecordId?: string;
};

export type FinanceExpense = {
  id: string;
  schoolId: string;
  category: string;
  amount: number;
  description: string;
  vendor?: string;
  date: string;
  createdBy: string;
  status: 'posted' | 'pending' | 'void';
};

export type FinanceSnapshot = {
  totalRevenue: number;
  totalExpected: number;
  outstandingDebt: number;
  collectionRate: number;
  debtStudentsCount: number;
  paidStudentsCount: number;
  partialCount: number;
  pendingCount: number;
  transactionCount: number;
  transactionVolume: number;
  expenseTotal: number;
  netPosition: number;
  aging: { current: number; days30: number; days60: number; days90: number };
  topDebtors: { studentName: string; studentId: string; balance: number }[];
  recentTransactions: FinanceTransaction[];
};

export type FinanceTab =
  | 'overview'
  | 'ledger'
  | 'transactions'
  | 'aging'
  | 'reports'
  | 'expenses'
  | 'reconciliation'
  | 'splitting'
  | 'discounts';

export type AxiomFinanceAction =
  | { type: 'switch_tab'; tab: FinanceTab }
  | { type: 'export_ledger' }
  | { type: 'export_transactions' }
  | { type: 'prefill_invoice'; studentName?: string; studentId?: string; tuition?: number; pta?: number; transport?: number }
  | { type: 'record_expense'; category: string; amount: number; description: string; vendor?: string }
  | { type: 'send_reminders'; target: 'all_overdue' | 'partial' };
