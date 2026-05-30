'use client';

import { cn } from '@/lib/utils';

export type FeeReceiptData = {
  reference: string;
  studentName: string;
  studentId: string;
  schoolName: string;
  schoolId: string;
  tuition: number;
  pta: number;
  transport: number;
  amountPaid: number;
  totalDue: number;
  paidAt: string;
  currency: string;
};

export function EReceiptCard({
  receipt,
  className,
}: {
  receipt: FeeReceiptData;
  className?: string;
}) {
  const symbol = receipt.currency === 'NGN' ? '₦' : '$';

  return (
    <div
      id="axora-e-receipt"
      className={cn(
        'relative overflow-hidden rounded-3xl border-2 border-emerald-200 bg-white p-8 shadow-xl print:shadow-none',
        className
      )}
    >
      <div
        className="pointer-events-none absolute -right-8 top-8 rotate-12 rounded-xl border-4 border-emerald-500 px-6 py-3 opacity-90"
        aria-hidden
      >
        <span className="text-2xl font-black uppercase tracking-widest text-emerald-600">Paid</span>
      </div>

      <div className="mb-6 border-b border-slate-200 pb-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-indigo-600">
          Official School E-Receipt
        </p>
        <h3 className="font-headline mt-1 text-2xl font-bold text-slate-900">{receipt.schoolName}</h3>
        <p className="text-xs text-slate-500">Institution ID: {receipt.schoolId}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 text-sm">
        <div>
          <p className="text-[9px] font-bold uppercase text-slate-400">Student</p>
          <p className="font-semibold text-slate-900">{receipt.studentName}</p>
          <p className="text-xs text-slate-500">{receipt.studentId}</p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-[9px] font-bold uppercase text-slate-400">Transaction Ref</p>
          <p className="font-mono text-xs font-bold text-indigo-700">{receipt.reference}</p>
          <p className="mt-1 text-xs text-slate-500">{new Date(receipt.paidAt).toLocaleString()}</p>
        </div>
      </div>

      <div className="mt-6 space-y-2 rounded-2xl bg-slate-50 p-4">
        {[
          { label: 'Tuition', value: receipt.tuition },
          { label: 'PTA Levy', value: receipt.pta },
          { label: 'Transport', value: receipt.transport },
        ].map((line) => (
          <div key={line.label} className="flex justify-between text-sm">
            <span className="text-slate-600">{line.label}</span>
            <span className="font-medium text-slate-900">
              {symbol}
              {line.value.toLocaleString()}
            </span>
          </div>
        ))}
        <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-bold">
          <span className="text-slate-800">Amount Paid</span>
          <span className="text-emerald-600">
            {symbol}
            {receipt.amountPaid.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between text-xs text-slate-500">
          <span>Total Invoice</span>
          <span>
            {symbol}
            {receipt.totalDue.toLocaleString()}
          </span>
        </div>
      </div>

      <p className="mt-6 text-center text-[9px] font-semibold uppercase tracking-widest text-slate-400">
        Verified by Axora · Nexora Payments
      </p>
    </div>
  );
}

export function printReceipt() {
  if (typeof window === 'undefined') return;
  window.print();
}
