'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { User } from 'firebase/auth';
import {
  collection,
  doc,
  getDocs,
  limit,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useFirestore } from '@/firebase';
import { EReceiptCard, FeeReceiptData, printReceipt } from '@/components/finance/e-receipt';
import {
  openPaystackCheckout,
  generatePaymentReference,
  toPaystackAmount,
} from '@/lib/paystack';
import { startAxoraLoading, stopAxoraLoading } from '@/lib/axora-loading';
import { CreditCard, Receipt, ShieldCheck, Printer, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type FeeRecord = {
  id: string;
  studentId: string;
  studentName: string;
  tuition: number;
  pta: number;
  transport: number;
  paid: number;
  status: string;
  schoolId: string;
  userId?: string;
};

const SANDBOX_FEES = { tuition: 1500, pta: 100, transport: 200 };

export function ParentFeePortal({
  user,
  profile,
  school,
}: {
  user: User;
  profile: Record<string, unknown> & { schoolId?: string; displayName?: string; role?: string };
  school?: Record<string, unknown> & { name?: string; finance?: { currency?: string } };
}) {
  const db = useFirestore();
  const [record, setRecord] = useState<FeeRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [receipt, setReceipt] = useState<FeeReceiptData | null>(null);

  const currency = (school?.finance?.currency as string) || 'USD';
  const schoolName = (school?.name as string) || 'Your School';

  const loadOrCreateRecord = useCallback(async () => {
    if (!db || !profile?.schoolId || !user) return;
    setLoading(true);

    try {
      const byUid = query(
        collection(db, 'finance'),
        where('schoolId', '==', profile.schoolId),
        where('studentId', '==', user.uid),
        limit(1)
      );
      let snap = await getDocs(byUid);

      if (snap.empty) {
        const byUserId = query(
          collection(db, 'finance'),
          where('schoolId', '==', profile.schoolId),
          where('userId', '==', user.uid),
          limit(1)
        );
        snap = await getDocs(byUserId);
      }

      if (!snap.empty) {
        const docSnap = snap.docs[0];
        setRecord({ id: docSnap.id, ...docSnap.data() } as FeeRecord);
        return;
      }

      const studentId = user.uid;
      const payload: FeeRecord = {
        id: studentId,
        studentId,
        userId: user.uid,
        studentName: (profile.displayName as string) || user.email?.split('@')[0] || 'Student',
        ...SANDBOX_FEES,
        paid: 0,
        status: 'Pending',
        schoolId: profile.schoolId,
      };

      await setDoc(doc(db, 'finance', studentId), {
        ...payload,
        lastPaymentDate: new Date().toISOString(),
      });
      setRecord(payload);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [db, profile, user]);

  useEffect(() => {
    void loadOrCreateRecord();
  }, [loadOrCreateRecord]);

  const totalDue = useMemo(() => {
    if (!record) return 0;
    return record.tuition + record.pta + (record.transport || 0);
  }, [record]);

  const balance = totalDue - (record?.paid || 0);
  const progress = totalDue > 0 ? ((record?.paid || 0) / totalDue) * 100 : 0;
  const isPaid = balance <= 0;

  const handlePaystack = async () => {
    if (!record || !user?.email || balance <= 0) return;

    const reference = generatePaymentReference('AXORA_FEE');
    startAxoraLoading('Opening Paystack checkout…');

    try {
      await openPaystackCheckout({
        email: user.email,
        amount: toPaystackAmount(balance, currency),
        currency: currency.toUpperCase(),
        ref: reference,
        metadata: {
          studentId: record.studentId,
          schoolId: record.schoolId,
          custom_fields: [
            { display_name: 'Student', variable_name: 'student', value: record.studentName },
          ],
        },
        callback: async (response) => {
          startAxoraLoading('Confirming payment…');
          try {
            const newPaid = (record.paid || 0) + balance;
            const newStatus = newPaid >= totalDue ? 'Paid' : 'Partially Paid';
            const paidAt = new Date().toISOString();

            await updateDoc(doc(db, 'finance', record.studentId), {
              paid: newPaid,
              status: newStatus,
              lastPaymentDate: paidAt,
              lastPaystackRef: response.reference,
            });

            await setDoc(doc(db, 'finance_transactions', response.reference), {
              reference: response.reference,
              schoolId: record.schoolId,
              studentId: record.studentId,
              studentName: record.studentName,
              amount: balance,
              currency,
              channel: 'paystack',
              status: 'success',
              paidAt,
              financeRecordId: record.studentId,
            });

            setRecord((prev) =>
              prev
                ? { ...prev, paid: newPaid, status: newStatus }
                : prev
            );

            setReceipt({
              reference: response.reference,
              studentName: record.studentName,
              studentId: record.studentId,
              schoolName,
              schoolId: record.schoolId,
              tuition: record.tuition,
              pta: record.pta,
              transport: record.transport || 0,
              amountPaid: balance,
              totalDue,
              paidAt,
              currency,
            });
          } finally {
            stopAxoraLoading();
          }
        },
        onClose: () => stopAxoraLoading(),
      });
    } catch (e) {
      console.error(e);
      stopAxoraLoading();
      alert('Could not open Paystack. Check your connection and try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-muted-foreground animate-pulse">Loading your fee statement…</p>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        Unable to load billing record. Contact your school administrator.
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 max-w-3xl mx-auto w-full">
      <div>
        <Badge className="mb-3 bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[9px] font-bold uppercase tracking-widest">
          <ShieldCheck className="h-3 w-3 mr-1 inline" /> Secure Billing Portal
        </Badge>
        <h2 className="font-headline text-3xl md:text-4xl font-bold text-white tracking-tight">
          School Fees
        </h2>
        <p className="text-muted-foreground mt-2">
          View and pay your institutional fees online via Paystack.
        </p>
      </div>

      <Card className="glass-card border-none overflow-hidden">
        <CardHeader className="bg-primary/10 border-b border-white/5">
          <CardTitle className="text-xl text-white flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            Fee Statement — {record.studentName}
          </CardTitle>
          <CardDescription>Student ID: {record.studentId}</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: 'Tuition', value: record.tuition },
              { label: 'PTA', value: record.pta },
              { label: 'Transport', value: record.transport || 0 },
            ].map((item) => (
              <div key={item.label} className="rounded-xl bg-white/5 border border-white/10 p-4">
                <p className="text-[9px] font-bold uppercase text-muted-foreground">{item.label}</p>
                <p className="text-lg font-bold text-white mt-1">
                  {currency === 'NGN' ? '₦' : '$'}
                  {item.value.toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Payment progress</span>
              <span className="font-bold text-white">
                {currency === 'NGN' ? '₦' : '$'}
                {record.paid.toLocaleString()} / {totalDue.toLocaleString()}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
            <div>
              <p className="text-[10px] font-bold uppercase text-muted-foreground">Outstanding</p>
              <p className={cn('text-2xl font-bold', isPaid ? 'text-emerald-400' : 'text-orange-400')}>
                {currency === 'NGN' ? '₦' : '$'}
                {Math.max(0, balance).toLocaleString()}
              </p>
            </div>
            <Badge
              className={
                isPaid
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-orange-500/20 text-orange-400'
              }
            >
              {record.status}
            </Badge>
          </div>
        </CardContent>
        <CardFooter className="p-6 pt-0 flex flex-col sm:flex-row gap-3">
          {!isPaid && (
            <Button
              className="w-full sm:flex-1 h-12 rounded-xl font-bold shadow-lg shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-700"
              onClick={handlePaystack}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Pay Online via Paystack
            </Button>
          )}
          {isPaid && (
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold w-full justify-center">
              <CheckCircle2 className="h-5 w-5" /> All fees cleared — thank you!
            </div>
          )}
        </CardFooter>
      </Card>

      {receipt && (
        <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500">
          <EReceiptCard receipt={receipt} />
          <Button
            variant="outline"
            className="w-full rounded-xl border-white/10"
            onClick={printReceipt}
          >
            <Printer className="mr-2 h-4 w-4" /> Print Official Receipt
          </Button>
        </div>
      )}

      <p className="text-[10px] text-center text-muted-foreground/70">
        Sandbox mode: use Paystack test cards. No real money is charged.
      </p>
    </div>
  );
}
