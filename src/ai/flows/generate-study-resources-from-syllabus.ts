'use server';
/**
 * @fileOverview A Genkit flow for generating study resources (summary and quizzes) from a course syllabus.
 *
 * - generateStudyResourcesFromSyllabus - A function that generates a summary and practice quizzes from a syllabus.
 * - GenerateStudyResourcesFromSyllabusInput - The input type for the generateStudyResourcesFromSyllabus function.
 * - GenerateStudyResourcesFromSyllabusOutput - The return type for the generateStudyResourcesFromSyllabus function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateStudyResourcesFromSyllabusInputSchema = z.object({
  syllabusContent: z.string().describe('The full text content of the course syllabus.'),
});
export type GenerateStudyResourcesFromSyllabusInput = z.infer<
  typeof GenerateStudyResourcesFromSyllabusInputSchema
>;

const GenerateStudyResourcesFromSyllabusOutputSchema = z.object({
  summary:
    z.string().describe('A concise summary of the key topics, learning objectives, and assessment methods covered in the syllabus.'),
  quizzes: z.array(
    z.object({
      question: z.string().describe('The quiz question.'),
      options: z.array(z.string()).describe('An array of possible answer options for the question.'),
      correctAnswer: z.string().describe('The correct answer option.'),
    }),
  ).describe('An array of multiple-choice practice quiz questions generated from the syllabus content. Each question should have four options and a single correct answer.'),
});
export type GenerateStudyResourcesFromSyllabusOutput = z.infer<
  typeof GenerateStudyResourcesFromSyllabusOutputSchema
>;

export async function generateStudyResourcesFromSyllabus(
  input: GenerateStudyResourcesFromSyllabusInput,
): Promise<GenerateStudyResourcesFromSyllabusOutput> {
  return generateStudyResourcesFromSyllabusFlow(input);
}

const generateStudyResourcesFromSyllabusPrompt = ai.definePrompt({
  name: 'generateStudyResourcesFromSyllabusPrompt',
  input: {schema: GenerateStudyResourcesFromSyllabusInputSchema},
  output: {schema: GenerateStudyResourcesFromSyllabusOutputSchema},
  prompt: `You are an intelligent assistant designed to help students understand their course syllabi.
Your task is to take the provided course syllabus, summarize its key information, and then generate a set of multiple-choice practice quiz questions based on the syllabus content.

The summary should cover main topics, learning objectives, grading criteria, important dates, and any other crucial information from the syllabus.
Each quiz question should be a multiple-choice question with four distinct options, and you must explicitly state the correct answer among the options.

Syllabus Content:
{{{syllabusContent}}}

Please output the summary and quizzes in the following JSON format:
{{json output.schema}}`,
});

const generateStudyResourcesFromSyllabusFlow = ai.defineFlow(
  {
    name: 'generateStudyResourcesFromSyllabusFlow',
    inputSchema: GenerateStudyResourcesFromSyllabusInputSchema,
    outputSchema: GenerateStudyResourcesFromSyllabusOutputSchema,
  },
  async input => {
    const {output} = await generateStudyResourcesFromSyllabusPrompt(input);
    if (!output) {
      throw new Error('Failed to generate study resources from syllabus.');
    }
    return output;
  },
);
