'use server';
/**
 * @fileoverview Axora NLP Voice Command Intelligence.
 * Processes spoken/typed admin commands across all modules — including full finance desk.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const FinanceSnapshotSchema = z.object({
  totalRevenue: z.number().optional(),
  totalExpected: z.number().optional(),
  outstandingDebt: z.number().optional(),
  netPosition: z.number().optional(),
  expenseTotal: z.number().optional(),
  transactionVolume: z.number().optional(),
  paidStudents: z.number().optional(),
  partialStudents: z.number().optional(),
  pendingStudents: z.number().optional(),
  aging: z.object({
    current: z.number(),
    days30: z.number(),
    days60: z.number(),
    days90: z.number(),
  }).optional(),
  topDebtors: z.array(z.object({
    studentName: z.string(),
    studentId: z.string(),
    balance: z.number(),
  })).optional(),
}).optional();

const VoiceCommandInputSchema = z.object({
  command: z.string().describe('The spoken or typed command from the admin.'),
  schoolContext: z.object({
    studentCount: z.number().optional(),
    teacherCount: z.number().optional(),
    schoolName: z.string().optional(),
    revenueCollectionRate: z.number().optional(),
    pendingInvoices: z.number().optional(),
    financeSnapshot: FinanceSnapshotSchema,
  }).optional(),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).optional().describe('Previous turns for context.'),
});

const FinanceActionSchema = z.object({
  type: z.enum([
    'switch_tab',
    'export_ledger',
    'export_transactions',
    'prefill_invoice',
    'record_expense',
    'send_reminders',
  ]),
  tab: z.enum([
    'overview', 'ledger', 'transactions', 'aging', 'reports', 'expenses', 'reconciliation', 'splitting', 'discounts',
  ]).optional(),
  studentName: z.string().optional(),
  studentId: z.string().optional(),
  tuition: z.number().optional(),
  pta: z.number().optional(),
  transport: z.number().optional(),
  category: z.string().optional(),
  amount: z.number().optional(),
  description: z.string().optional(),
  vendor: z.string().optional(),
  target: z.enum(['all_overdue', 'partial']).optional(),
}).optional();

const VoiceCommandOutputSchema = z.object({
  response: z.string().describe('Natural language response to the command.'),
  action: z.string().optional().describe('Detected intent action e.g. "enroll_student", "generate_report", "view_finance".'),
  navigateTo: z.string().optional().describe('Optional dashboard route to navigate to e.g. "/dashboard/finance".'),
  data: z.object({
    financeAction: FinanceActionSchema,
  }).optional().describe('Structured finance desk actions for the UI to execute.'),
  confidence: z.number().min(0).max(1).describe('Confidence score of the interpretation.'),
  citations: z.array(z.string()).optional().describe('Footnoted institutional document IDs.'),
});

export type VoiceCommandOutput = z.infer<typeof VoiceCommandOutputSchema>;

const INSTITUTIONAL_POLICIES = [
  {
    docId: 'DOC-204 (Emergency Safety)',
    keywords: ['emergency', 'fire', 'evacuation', 'hazard', 'safety', 'assembly', 'drill'],
    content: 'In case of emergency evacuation, all staff must lead students immediately to Assembly Point Alpha (main Sports Field). The safety coordinator must verify classroom checklists. No re-entry is permitted until official clear is signaled by security.',
  },
  {
    docId: 'DOC-102 (Academic Assessment Rules)',
    keywords: ['grading', 'credits', 'framework', 'exams', 'gpa', 'a-f', 'promotion', 'average'],
    content: 'Standard academic promotion requires a cumulative average score of >= 50%. A grade scale of A (80-100), B (70-79), C (60-69), D (50-59), and F (below 50) is used. Prerequisite courses must achieve a C grade minimum before advanced class advancement.',
  },
  {
    docId: 'DOC-308 (Disciplinary & Conduct Code)',
    keywords: ['discipline', 'cheating', 'conduct', 'late', 'absence', 'proctoring', 'dishonesty'],
    content: 'Academic dishonesty (cheating) triggers automatic suspension for 3 academic days. Students with >3 consecutive unexcused absences trigger immediate proctor system alerts to registered parents.',
  },
  {
    docId: 'DOC-401 (Fee Collection & Billing Policy)',
    keywords: ['fee', 'fees', 'tuition', 'billing', 'invoice', 'payment', 'paystack', 'debt', 'arrears', 'outstanding', 'collection', 'ledger', 'receipt'],
    content: 'All tuition, PTA, and transport fees must be settled before exam clearance. Partial payments are accepted; status becomes Partially Paid until full settlement. Paystack online payments auto-reconcile to the student ledger. Accounts 30+ days overdue trigger automated parent reminders. Refunds require admin approval and audit log entry.',
  },
  {
    docId: 'DOC-402 (Expense & Procurement Policy)',
    keywords: ['expense', 'expenses', 'procurement', 'vendor', 'budget', 'salary', 'utilities', 'purchase', 'reimburse'],
    content: 'Operating expenses above $500 require category classification and vendor reference. Salaries, utilities, supplies, maintenance, and transport are standard GL categories. All posted expenses reduce net position in the institutional P&L report.',
  },
  {
    docId: 'DOC-403 (Bank Reconciliation SOP)',
    keywords: ['reconcile', 'reconciliation', 'bank', 'variance', 'settlement', 'statement'],
    content: 'Monthly bank reconciliation must match Paystack settlement totals to book balance. Variances over $50 require investigation and journal adjustment. Outstanding AR is excluded from bank balance comparison.',
  },
];

export async function processVoiceCommand(input: z.infer<typeof VoiceCommandInputSchema>): Promise<VoiceCommandOutput> {
  return voiceCommandFlow(input);
}

const voiceCommandFlow = ai.defineFlow(
  {
    name: 'axoraVoiceCommandFlow',
    inputSchema: VoiceCommandInputSchema,
    outputSchema: VoiceCommandOutputSchema,
  },
  async (input) => {
    const cmd = input.command.toLowerCase();

    let foundPolicyContent = '';
    const foundPolicyId: string[] = [];

    for (const policy of INSTITUTIONAL_POLICIES) {
      const match = policy.keywords.some((keyword) => cmd.includes(keyword));
      if (match) {
        foundPolicyContent += `\nReference policy [${policy.docId}]: "${policy.content}"\n`;
        foundPolicyId.push(policy.docId);
      }
    }

    const ragContextBlock = foundPolicyContent
      ? `Simulated RAG Retrieval Policy Block: ${foundPolicyContent}`
      : '';

    const fs = input.schoolContext?.financeSnapshot;
    const financeBlock = fs
      ? `LIVE FINANCE LEDGER (use these exact numbers in answers):
      - Total collected: $${fs.totalRevenue ?? 0}
      - Total billed: $${fs.totalExpected ?? 0}
      - Outstanding AR: $${fs.outstandingDebt ?? 0}
      - Collection rate: ${input.schoolContext?.revenueCollectionRate ?? 0}%
      - Net position (collections minus expenses): $${fs.netPosition ?? 0}
      - Expenses posted: $${fs.expenseTotal ?? 0}
      - Paystack volume: $${fs.transactionVolume ?? 0}
      - Paid accounts: ${fs.paidStudents ?? 0}, Partial: ${fs.partialStudents ?? 0}, Pending: ${fs.pendingStudents ?? 0}
      - AR Aging — 0-30d: $${fs.aging?.current ?? 0}, 31-60d: $${fs.aging?.days30 ?? 0}, 61-90d: $${fs.aging?.days60 ?? 0}, 90+d: $${fs.aging?.days90 ?? 0}
      - Top debtors: ${JSON.stringify(fs.topDebtors ?? [])}`
      : '';

    const contextBlock = input.schoolContext
      ? `School context: ${JSON.stringify({ ...input.schoolContext, financeSnapshot: undefined })}\n${financeBlock}`
      : financeBlock;

    const historyBlock = input.conversationHistory?.length
      ? `Previous conversation:\n${input.conversationHistory.map((h) => `${h.role}: ${h.content}`).join('\n')}`
      : '';

    const { output } = await ai.generate({
      prompt: `You are AXIOM — the Axora Institutional AI Voice Assistant and virtual school accountant.
      
      You help school admins control their institution through natural language. When finance data is provided, ALWAYS cite the live ledger numbers — never invent figures.

      GENERAL CAPABILITIES:
      - Enroll students or teachers (action: "enroll_student" / "enroll_teacher")
      - Navigate to modules (action: "navigate", navigateTo: "/dashboard/...")
      - Answer policy questions using retrieved documents

      FINANCE DESK CAPABILITIES (populate data.financeAction when user wants these executed):
      - switch_tab: navigate finance UI tabs (overview, ledger, transactions, aging, reports, expenses, reconciliation, splitting, discounts)
      - export_ledger: download CSV of student fee ledger
      - export_transactions: download CSV of payment transactions
      - prefill_invoice: open invoice form with studentName, studentId, tuition, pta, transport
      - record_expense: post expense with category, amount, description, vendor
      - send_reminders: target "all_overdue" or "partial" for fee chase campaigns

      FINANCE QUERY EXAMPLES:
      - "What's our outstanding debt?" → answer from live ledger, optionally switch_tab aging
      - "Export the ledger" → export_ledger + confirm in response
      - "Record a $500 utilities expense for March power bill" → record_expense
      - "Send reminders to overdue parents" → send_reminders all_overdue
      - "Show me the aging report" → switch_tab aging
      - "Create invoice for John Doe STU-123 tuition 1500" → prefill_invoice + switch_tab ledger
      - "Who owes the most?" → list topDebtors from live data
      
      ${ragContextBlock}
      ${contextBlock}
      ${historyBlock}

      Admin command: "${input.command}"

      Respond conversationally as AXIOM. Be concise, smart, and action-oriented.
      For finance commands, ALWAYS populate data.financeAction when an executable action is detected.
      Set navigateTo to "/dashboard/finance" when discussing finance modules.`,
      output: { schema: VoiceCommandOutputSchema },
    });

    if (foundPolicyId.length > 0 && output) {
      output.citations = foundPolicyId;
    }

    return output!;
  }
);
