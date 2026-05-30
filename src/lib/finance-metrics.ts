import type { FeeRecord, FinanceExpense, FinanceSnapshot, FinanceTransaction } from './finance-types';

export function feeTotal(record: Pick<FeeRecord, 'tuition' | 'pta' | 'transport'>): number {
  return record.tuition + record.pta + (record.transport || 0);
}

export function feeBalance(record: FeeRecord): number {
  return Math.max(0, feeTotal(record) - (record.paid || 0));
}

export function daysSince(dateIso?: string): number {
  if (!dateIso) return 999;
  const then = new Date(dateIso).getTime();
  if (Number.isNaN(then)) return 999;
  return Math.floor((Date.now() - then) / (1000 * 60 * 60 * 24));
}

export function buildFinanceSnapshot(
  feeRecords: FeeRecord[] = [],
  transactions: FinanceTransaction[] = [],
  expenses: FinanceExpense[] = []
): FinanceSnapshot {
  const totalRevenue = feeRecords.reduce((acc, r) => acc + (r.paid || 0), 0);
  const totalExpected = feeRecords.reduce((acc, r) => acc + feeTotal(r), 0);
  const outstandingDebt = Math.max(0, totalExpected - totalRevenue);
  const collectionRate = totalExpected > 0 ? (totalRevenue / totalExpected) * 100 : 100;

  const paidStudentsCount = feeRecords.filter((r) => r.status === 'Paid').length;
  const partialCount = feeRecords.filter((r) => r.status === 'Partially Paid').length;
  const pendingCount = feeRecords.filter((r) => r.status === 'Pending').length;
  const debtStudentsCount = feeRecords.filter((r) => r.status !== 'Paid').length;

  const aging = { current: 0, days30: 0, days60: 0, days90: 0 };
  for (const rec of feeRecords) {
    const balance = feeBalance(rec);
    if (balance <= 0) continue;
    const days = daysSince(rec.lastPaymentDate || rec.dueDate);
    if (days <= 30) aging.current += balance;
    else if (days <= 60) aging.days30 += balance;
    else if (days <= 90) aging.days60 += balance;
    else aging.days90 += balance;
  }

  const topDebtors = feeRecords
    .map((r) => ({ studentName: r.studentName, studentId: r.studentId, balance: feeBalance(r) }))
    .filter((d) => d.balance > 0)
    .sort((a, b) => b.balance - a.balance)
    .slice(0, 5);

  const expenseTotal = expenses
    .filter((e) => e.status === 'posted')
    .reduce((acc, e) => acc + e.amount, 0);

  const transactionVolume = transactions
    .filter((t) => t.status === 'success')
    .reduce((acc, t) => acc + t.amount, 0);

  return {
    totalRevenue,
    totalExpected,
    outstandingDebt,
    collectionRate,
    debtStudentsCount,
    paidStudentsCount,
    partialCount,
    pendingCount,
    transactionCount: transactions.length,
    transactionVolume,
    expenseTotal,
    netPosition: totalRevenue - expenseTotal,
    aging,
    topDebtors,
    recentTransactions: transactions.slice(0, 8),
  };
}

export function buildMonthlyRevenueChart(feeRecords: FeeRecord[]) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const year = new Date().getFullYear();
  const buckets = months.map((month, i) => ({
    month,
    collected: 0,
    expected: 0,
    monthIndex: i,
  }));

  for (const rec of feeRecords) {
    const date = rec.lastPaymentDate ? new Date(rec.lastPaymentDate) : null;
    if (date && date.getFullYear() === year) {
      buckets[date.getMonth()].collected += rec.paid || 0;
    }
    buckets[new Date().getMonth()].expected += feeTotal(rec);
  }

  return buckets;
}

export function exportLedgerCsv(records: FeeRecord[], currency = 'USD'): string {
  const header = 'Student ID,Student Name,Tuition,PTA,Transport,Total Due,Paid,Balance,Status,Last Payment';
  const rows = records.map((r) => {
    const total = feeTotal(r);
    const balance = feeBalance(r);
    return [
      r.studentId,
      `"${r.studentName.replace(/"/g, '""')}"`,
      r.tuition,
      r.pta,
      r.transport || 0,
      total,
      r.paid || 0,
      balance,
      r.status,
      r.lastPaymentDate?.slice(0, 10) || '',
    ].join(',');
  });
  return [header, ...rows].join('\n');
}

export function exportTransactionsCsv(transactions: FinanceTransaction[]): string {
  const header = 'Reference,Student,Amount,Currency,Channel,Status,Paid At';
  const rows = transactions.map((t) =>
    [
      t.reference,
      `"${t.studentName.replace(/"/g, '""')}"`,
      t.amount,
      t.currency,
      t.channel,
      t.status,
      t.paidAt?.slice(0, 19) || '',
    ].join(',')
  );
  return [header, ...rows].join('\n');
}

export function downloadCsv(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function formatMoney(amount: number, currency = 'USD') {
  const symbol = currency.toUpperCase() === 'NGN' ? '₦' : '$';
  return `${symbol}${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}
