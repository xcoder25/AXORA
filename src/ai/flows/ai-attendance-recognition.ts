'use server';
/**
 * @fileOverview Deep Vision Neural Identity Matrix for institutional security.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AttendanceRecognitionInputSchema = z.object({
  photoDataUri: z.string().describe('Deep vision frame from institutional security node as a data URI.'),
  nodeId: z.string().optional().describe('The hardware ID of the camera performing the capture.'),
});

const AttendanceRecognitionOutputSchema = z.object({
  identifiedEntities: z.array(z.object({
    id: z.string(),
    name: z.string(),
    role: z.enum(['student', 'teacher', 'security', 'unknown']),
    confidence: z.number().describe('Neural match probability (0-1).'),
    status: z.enum(['Present', 'Flagged', 'Unknown']),
    timestamp: z.string(),
    metadata: z.object({
      posture: z.string().optional(),
      uniformMatch: z.boolean().optional(),
      nodeLatency: z.string().optional(),
    }).optional(),
  })),
  summary: z.string().describe('Deep vision analysis summary.'),
  totalDetected: z.number(),
  neuralLoad: z.string().describe('Inference engine processing load.'),
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
        {text: `Perform Deep Vision Neural Analysis on this institutional security feed. 
        1. Identify all human entities with high-precision bounding logic.
        2. Classify roles based on visual context (uniforms, badges, behavioral patterns).
        3. Cross-reference with the Institutional Node Matrix (Node ID: ${input.nodeId || 'DEFAULT_HUB'}).
        4. Detect posture and uniform compliance if applicable.`},
        {media: {url: input.photoDataUri, contentType: 'image/jpeg'}}
      ],
      output: {schema: AttendanceRecognitionOutputSchema}
    });
    return output!;
  }
);
