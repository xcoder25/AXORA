'use server';
/**
 * @fileOverview AI Exam Proctoring analysis.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProctoringInputSchema = z.object({
  frameDataUri: z.string().describe('Current frame from the student webcam.'),
  examId: z.string(),
});

const ProctoringOutputSchema = z.object({
  isSuspicious: z.boolean(),
  detectedObjects: z.array(z.string()),
  violationType: z.string().optional(),
  description: z.string(),
});

export async function analyzeProctoring(input: z.infer<typeof ProctoringInputSchema>) {
  return proctoringFlow(input);
}

const proctoringFlow = ai.defineFlow(
  {
    name: 'proctoringFlow',
    inputSchema: ProctoringInputSchema,
    outputSchema: ProctoringOutputSchema,
  },
  async input => {
    const {output} = await ai.generate({
      prompt: [
        {text: 'Analyze this proctoring frame for academic integrity violations (multiple people, phone use, looking away).'},
        {media: {url: input.frameDataUri, contentType: 'image/jpeg'}}
      ],
      output: {schema: ProctoringOutputSchema}
    });
    return output!;
  }
);
