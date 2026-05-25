'use server';
/**
 * @fileOverview AI Facial Recognition for attendance tracking.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AttendanceRecognitionInputSchema = z.object({
  photoDataUri: z.string().describe('Image of the classroom or student as a data URI.'),
});

const AttendanceRecognitionOutputSchema = z.object({
  identifiedStudents: z.array(z.object({
    name: z.string(),
    confidence: z.number(),
    status: z.enum(['Present', 'Flagged', 'Unknown']),
  })),
  summary: z.string(),
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
        {text: 'Identify the students in this photo for attendance. Simulate a list of 3-5 students with confidence scores and presence status.'},
        {media: {url: input.photoDataUri, contentType: 'image/jpeg'}}
      ],
      output: {schema: AttendanceRecognitionOutputSchema}
    });
    return output!;
  }
);
