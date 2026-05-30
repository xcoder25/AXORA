'use client';

import { useMemo } from 'react';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { buildFinanceSnapshot } from '@/lib/finance-metrics';
import type { FeeRecord, FinanceExpense, FinanceTransaction } from '@/lib/finance-types';

export function useFinanceData(schoolId?: string) {
  const db = useFirestore();

  const financeQuery = useMemoFirebase(() => {
    if (!db || !schoolId) return null;
    return query(
      collection(db, 'finance'),
      where('schoolId', '==', schoolId),
      orderBy('lastPaymentDate', 'desc')
    );
  }, [db, schoolId]);

  const txQuery = useMemoFirebase(() => {
    if (!db || !schoolId) return null;
    return query(
      collection(db, 'finance_transactions'),
      where('schoolId', '==', schoolId),
      orderBy('paidAt', 'desc')
    );
  }, [db, schoolId]);

  const expenseQuery = useMemoFirebase(() => {
    if (!db || !schoolId) return null;
    return query(
      collection(db, 'finance_expenses'),
      where('schoolId', '==', schoolId),
      orderBy('date', 'desc')
    );
  }, [db, schoolId]);

  const { data: feeRecordsRaw, loading: loadingFees } = useCollection(financeQuery);
  const { data: txRaw, loading: loadingTx } = useCollection(txQuery);
  const { data: expenseRaw, loading: loadingExpenses } = useCollection(expenseQuery);

  const feeRecords = useMemo(
    () => (feeRecordsRaw || []) as FeeRecord[],
    [feeRecordsRaw]
  );
  const transactions = useMemo(
    () => (txRaw || []) as FinanceTransaction[],
    [txRaw]
  );
  const expenses = useMemo(
    () => (expenseRaw || []) as FinanceExpense[],
    [expenseRaw]
  );

  const snapshot = useMemo(
    () => buildFinanceSnapshot(feeRecords, transactions, expenses),
    [feeRecords, transactions, expenses]
  );

  return {
    feeRecords,
    transactions,
    expenses,
    snapshot,
    loading: loadingFees || loadingTx || loadingExpenses,
  };
}
