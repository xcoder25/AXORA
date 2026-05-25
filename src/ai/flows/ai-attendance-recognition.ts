
'use server';
/**
 * @fileOverview AI Multi-Entity Recognition for institutional attendance tracking.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AttendanceRecognitionInputSchema = z.object({
  photoDataUri: z.string().describe('Real-time image from institutional camera nodes as a data URI.'),
  nodeId: z.string().optional().describe('The hardware ID of the camera performing the capture.'),
});

const AttendanceRecognitionOutputSchema = z.object({
  identifiedEntities: z.array(z.object({
    id: z.string(),
    name: z.string(),
    role: z.enum(['student', 'teacher', 'security', 'unknown']),
    confidence: z.number().describe('Probability of match (0-1).'),
    status: z.enum(['Present', 'Flagged', 'Unknown']),
    timestamp: z.string(),
  })),
  summary: z.string().describe('A summary of the scanning cycle outcomes.'),
  totalDetected: z.number(),
});

export async function recognizeAttendance(input: z.infer<typeof AttendanceRecognitionInputSchema>) {
  return recognizeAttendanceFlow(input);
}

const recognizeAttendanceFlow = ai.defineFlow(
  {
    name: 'recognizeAttendanceFlow',
    inputSchema: AttendanceRecognitionInputSchema,
    outputSchema: AttendanceRecognitionOutputSchema,
  },
  async input => {
    const {output} = await ai.generate({
      prompt: [
        {text: `Analyze this institutional security feed. 
        Identify all human entities. 
        Classify each as 'student', 'teacher', or 'security' based on visual uniform/context. 
        Generate unique tracking IDs for each. 
        Current Node ID: ${input.nodeId || 'DEFAULT_HUB'}`},
        {media: {url: input.photoDataUri, contentType: 'image/jpeg'}}
      ],
      output: {schema: AttendanceRecognitionOutputSchema}
    });
    return output!;
  }
);
