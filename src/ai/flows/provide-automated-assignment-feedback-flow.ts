'use server';
/**
 * @fileOverview An AI assistant that provides initial feedback and suggests areas for improvement on open-ended student assignments.
 *
 * - provideAutomatedAssignmentFeedback - A function that handles the automated assignment feedback process.
 * - ProvideAutomatedAssignmentFeedbackInput - The input type for the provideAutomatedAssignmentFeedback function.
 * - ProvideAutomatedAssignmentFeedbackOutput - The return type for the provideAutomatedAssignmentFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProvideAutomatedAssignmentFeedbackInputSchema = z.object({
  assignmentPrompt: z.string().describe('The prompt or question for the assignment.'),
  studentSubmission: z.string().describe('The student\'s submission for the open-ended assignment.'),
});
export type ProvideAutomatedAssignmentFeedbackInput = z.infer<typeof ProvideAutomatedAssignmentFeedbackInputSchema>;

const ProvideAutomatedAssignmentFeedbackOutputSchema = z.object({
  overallFeedback: z.string().describe('Comprehensive feedback on the student\'s submission, highlighting strengths and weaknesses.'),
  areasForImprovement: z.array(z.string()).describe('A list of specific, actionable suggestions for the student to improve their assignment.'),
  suggestedGradeCategory: z.enum(['Excellent', 'Good', 'Satisfactory', 'Needs Improvement', 'Unsatisfactory']).describe('An overall category for the suggested grade.'),
});
export type ProvideAutomatedAssignmentFeedbackOutput = z.infer<typeof ProvideAutomatedAssignmentFeedbackOutputSchema>;

export async function provideAutomatedAssignmentFeedback(input: ProvideAutomatedAssignmentFeedbackInput): Promise<ProvideAutomatedAssignmentFeedbackOutput> {
  return provideAutomatedAssignmentFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'automatedAssignmentFeedbackPrompt',
  input: {schema: ProvideAutomatedAssignmentFeedbackInputSchema},
  output: {schema: ProvideAutomatedAssignmentFeedbackOutputSchema},
  prompt: `You are an AI assistant designed to provide initial feedback and suggest areas for improvement on open-ended student assignments. Your goal is to help teachers streamline their grading process and offer timely support.

Here is the assignment prompt:
{{{assignmentPrompt}}}

Here is the student's submission:
{{{studentSubmission}}}

Based on the assignment prompt and the student's submission, provide constructive feedback and suggest specific, actionable areas for improvement. Also, provide a suggested grade category based on the quality of the submission. Ensure your output strictly adheres to the JSON schema provided.`,
});

const provideAutomatedAssignmentFeedbackFlow = ai.defineFlow(
  {
    name: 'provideAutomatedAssignmentFeedbackFlow',
    inputSchema: ProvideAutomatedAssignmentFeedbackInputSchema,
    outputSchema: ProvideAutomatedAssignmentFeedbackOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
