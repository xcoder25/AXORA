'use server';
/**
 * @fileOverview Axora Institutional Intelligence Engine.
 * High-level strategic analysis for school administrators.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AxoraAdminInputSchema = z.object({
  query: z.string().describe('The administrator\'s natural language command or question.'),
  schoolContext: z.object({
    studentCount: z.number().optional(),
    teacherCount: z.number().optional(),
    revenueCollectionRate: z.number().optional(),
    averageAttendance: z.number().optional(),
    riskIndex: z.number().optional(),
    outstandingDebt: z.number().optional(),
    netPosition: z.number().optional(),
    expenseTotal: z.number().optional(),
  }).optional(),
});

const AxoraAdminOutputSchema = z.object({
  analysis: z.string().describe('Deep semantic analysis of the current school state or query.'),
  recommendations: z.array(z.string()).describe('Strategic actionable recommendations.'),
  suggestedActions: z.array(z.object({
    label: z.string(),
    actionCode: z.string(),
  })).describe('Direct system actions suggested for the admin to execute.'),
  verdict: z.enum(['Optimal', 'Nominal', 'Critical', 'Needs Attention']),
});

export async function askAxoraAdmin(input: z.infer<typeof AxoraAdminInputSchema>) {
  return axoraAdminIntelligenceFlow(input);
}

const axoraAdminIntelligenceFlow = ai.defineFlow(
  {
    name: 'axoraAdminIntelligenceFlow',
    inputSchema: AxoraAdminInputSchema,
    outputSchema: AxoraAdminOutputSchema,
  },
  async (input) => {
    const ctx = input.schoolContext;
    const { output } = await ai.generate({
      prompt: `You are Axora, the supercharged AI Command Intelligence for this institution.
      Your goal is to assist the Administrator in managing every aspect of the school — especially finance and accounting.
      
      User Query: ${input.query}
      ${ctx ? `Current School Context:
      - Student Population: ${ctx.studentCount ?? 'unknown'}
      - Revenue Collection Rate: ${ctx.revenueCollectionRate ?? 'unknown'}%
      - Outstanding AR: $${ctx.outstandingDebt ?? 'unknown'}
      - Net Position: $${ctx.netPosition ?? 'unknown'}
      - Operating Expenses: $${ctx.expenseTotal ?? 'unknown'}
      - Avg Attendance: ${ctx.averageAttendance ?? 'unknown'}%
      - Security Risk Index: ${ctx.riskIndex ?? 'unknown'}` : ''}
      
      For finance questions, recommend concrete actions: export ledger CSV, run AR aging, post expenses, bank reconciliation, send fee reminders via AXIOM.
      Provide a highly strategic, professional, and data-driven response.`,
      output: { schema: AxoraAdminOutputSchema },
    });
    return output!;
  }
);
