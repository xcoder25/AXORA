'use server';
/**
 * @fileoverview Axora NLP Voice Command Intelligence.
 * Processes spoken/typed admin commands across all modules.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const VoiceCommandInputSchema = z.object({
  command: z.string().describe('The spoken or typed command from the admin.'),
  schoolContext: z.object({
    studentCount: z.number().optional(),
    teacherCount: z.number().optional(),
    schoolName: z.string().optional(),
    revenueCollectionRate: z.number().optional(),
    pendingInvoices: z.number().optional(),
  }).optional(),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).optional().describe('Previous turns for context.'),
});

const VoiceCommandOutputSchema = z.object({
  response: z.string().describe('Natural language response to the command.'),
  action: z.string().optional().describe('Detected intent action e.g. "enroll_student", "generate_report", "view_finance".'),
  navigateTo: z.string().optional().describe('Optional dashboard route to navigate to e.g. "/dashboard/finance".'),
  data: z.record(z.any()).optional().describe('Any structured data relevant to the action.'),
  confidence: z.number().min(0).max(1).describe('Confidence score of the interpretation.'),
  citations: z.array(z.string()).optional().describe('Footnoted institutional document IDs.'),
});

export type VoiceCommandOutput = z.infer<typeof VoiceCommandOutputSchema>;

// Mock Document Database for policy RAG simulation
const INSTITUTIONAL_POLICIES = [
  {
    docId: "DOC-204 (Emergency Safety)",
    keywords: ["emergency", "fire", "evacuation", "hazard", "safety", "assembly", "drill"],
    content: "In case of emergency evacuation, all staff must lead students immediately to Assembly Point Alpha (main Sports Field). The safety coordinator must verify classroom checklists. No re-entry is permitted until official clear is signaled by security."
  },
  {
    docId: "DOC-102 (Academic Assessment Rules)",
    keywords: ["grading", "credits", "framework", "exams", "gpa", "a-f", "promotion", "average"],
    content: "Standard academic promotion requires a cumulative average score of >= 50%. A grade scale of A (80-100), B (70-79), C (60-69), D (50-59), and F (below 50) is used. Prerequisite courses must achieve a C grade minimum before advanced class advancement."
  },
  {
    docId: "DOC-308 (Disciplinary & Conduct Code)",
    keywords: ["discipline", "cheating", "conduct", "late", "absence", "proctoring", "dishonesty"],
    content: "Academic dishonesty (cheating) triggers automatic suspension for 3 academic days. Students with >3 consecutive unexcused absences trigger immediate proctor system alerts to registered parents."
  }
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
    
    // Simulate RAG vector search over institutional policies
    let foundPolicyContent = "";
    let foundPolicyId: string[] = [];
    
    for (const policy of INSTITUTIONAL_POLICIES) {
      const match = policy.keywords.some(keyword => cmd.includes(keyword));
      if (match) {
        foundPolicyContent += `\nReference policy [${policy.docId}]: "${policy.content}"\n`;
        foundPolicyId.push(policy.docId);
      }
    }

    const ragContextBlock = foundPolicyContent
      ? `Simulated RAG Retrieval Policy Block: ${foundPolicyContent}`
      : '';

    const contextBlock = input.schoolContext
      ? `School context: ${JSON.stringify(input.schoolContext)}`
      : '';

    const historyBlock = input.conversationHistory?.length
      ? `Previous conversation:\n${input.conversationHistory.map(h => `${h.role}: ${h.content}`).join('\n')}`
      : '';

    const { output } = await ai.generate({
      prompt: `You are AXIOM — the Axora Institutional AI Voice Assistant. You help school admins control their institution through natural language.
      
      If the admin asks questions about policy rules or safety, use the policy block context below and explain it conversationally. Highlight that you've retrieved this from the official school database documents.

      You can:
      - Enroll students or teachers (action: "enroll_student" / "enroll_teacher")
      - Generate financial reports (action: "generate_report", navigateTo: "/dashboard/finance")
      - Check attendance (action: "view_attendance", navigateTo: "/dashboard/attendance")
      - Run exam analysis (action: "view_exams", navigateTo: "/dashboard/exams")
      - Navigate to modules (action: "navigate")
      - Answer questions about the institution using context provided
      
      ${ragContextBlock}
      ${contextBlock}
      ${historyBlock}

      Admin command: "${input.command}"

      Respond conversationally as AXIOM. Be concise, smart, and action-oriented. If you detect a clear action, populate the action and navigateTo fields.`,
      output: { schema: VoiceCommandOutputSchema },
    });

    // Inject citations if vector RAG was triggered
    if (foundPolicyId.length > 0 && output) {
      output.citations = foundPolicyId;
    }

    return output!;
  }
);
