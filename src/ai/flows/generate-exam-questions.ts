
'use server';
/**
 * @fileOverview AI Exam Question Architect.
 * Generates structured assessments from topics or study material.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateExamQuestionsInputSchema = z.object({
  topic: z.string().describe('The subject or topic for the exam.'),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  numQuestions: z.number().min(1).max(20),
  contextText: z.string().optional().describe('Optional study material or syllabus text to base questions on.'),
});

const GenerateExamQuestionsOutputSchema = z.object({
  questions: z.array(z.object({
    text: z.string(),
    options: z.array(z.string()).length(4),
    correctAnswer: z.string(),
    points: z.number().default(1),
    rationale: z.string().describe('Reason why the answer is correct.'),
  })),
  summary: z.string(),
});

export async function generateExamQuestions(input: z.infer<typeof GenerateExamQuestionsInputSchema>) {
  return generateExamQuestionsFlow(input);
}

const generateExamQuestionsFlow = ai.defineFlow(
  {
    name: 'generateExamQuestionsFlow',
    inputSchema: GenerateExamQuestionsInputSchema,
    outputSchema: GenerateExamQuestionsOutputSchema,
  },
  async input => {
    const {output} = await ai.generate({
      prompt: `You are an expert examiner. Generate ${input.numQuestions} ${input.difficulty} multiple-choice questions about "${input.topic}".
      ${input.contextText ? `Base the questions on this context: ${input.contextText}` : ''}
      Ensure options are distinct and plausible. Include a brief rationale for the correct answer.`,
      output: {schema: GenerateExamQuestionsOutputSchema}
    });
    return output!;
  }
);
