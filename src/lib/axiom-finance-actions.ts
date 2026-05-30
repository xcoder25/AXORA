import type { AxiomFinanceAction, FinanceTab } from './finance-types';

export const AXIOM_FINANCE_ACTION = 'axora-finance-action';
export const AXIOM_FINANCE_TAB = 'axora-finance-tab';

export function dispatchFinanceAction(action: AxiomFinanceAction) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(AXIOM_FINANCE_ACTION, { detail: action }));
}

export function dispatchFinanceTab(tab: FinanceTab) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(AXIOM_FINANCE_TAB, { detail: { tab } }));
}

export function parseFinanceActionFromAi(data?: Record<string, unknown>): AxiomFinanceAction | null {
  if (!data?.financeAction || typeof data.financeAction !== 'object') return null;
  const fa = data.financeAction as Record<string, unknown>;
  const type = fa.type as string;
  switch (type) {
    case 'switch_tab':
      return { type: 'switch_tab', tab: fa.tab as FinanceTab };
    case 'export_ledger':
      return { type: 'export_ledger' };
    case 'export_transactions':
      return { type: 'export_transactions' };
    case 'prefill_invoice':
      return {
        type: 'prefill_invoice',
        studentName: fa.studentName as string | undefined,
        studentId: fa.studentId as string | undefined,
        tuition: fa.tuition as number | undefined,
        pta: fa.pta as number | undefined,
        transport: fa.transport as number | undefined,
      };
    case 'record_expense':
      return {
        type: 'record_expense',
        category: (fa.category as string) || 'General',
        amount: Number(fa.amount) || 0,
        description: (fa.description as string) || '',
        vendor: fa.vendor as string | undefined,
      };
    case 'send_reminders':
      return {
        type: 'send_reminders',
        target: (fa.target as 'all_overdue' | 'partial') || 'all_overdue',
      };
    default:
      return null;
  }
}
