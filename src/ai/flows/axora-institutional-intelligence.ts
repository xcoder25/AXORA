'use server';
/**
 * @fileOverview Axora Institutional Intelligence Engine.
 * High-level strategic analysis for school administrators.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AxoraAdminInputSchema = z.object({
  query: z.string().describe('The administrator\'s natural language command or question.'),
  schoolContext: z.object({
    studentCount: z.number(),
    teacherCount: z.number(),
    revenueCollectionRate: z.number(),
    averageAttendance: z.number(),
    riskIndex: z.number(),
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
  async input => {
    const {output} = await ai.generate({
      prompt: `You are Axora, the supercharged AI Command Intelligence for this institution. 
      Your goal is to assist the Administrator in managing every aspect of the school.
      
      User Query: ${input.query}
      ${input.schoolContext ? `Current School Context:
      - Student Population: ${input.schoolContext.studentCount}
      - Revenue Rate: ${input.schoolContext.revenueCollectionRate}%
      - Avg Attendance: ${input.schoolContext.averageAttendance}%
      - Security Risk Index: ${input.schoolContext.riskIndex}` : ''}
      
      Provide a highly strategic, professional, and data-driven response. Suggest direct institutional actions like 'Generate Finance Report', 'Trigger Staff Audit', or 'Dispatch Parent Memo'.`,
      output: {schema: AxoraAdminOutputSchema}
    });
    return output!;
  }
);
