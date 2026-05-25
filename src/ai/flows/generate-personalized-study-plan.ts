'use server';
/**
 * @fileOverview A Genkit flow for generating personalized study plans for students.
 *
 * - generatePersonalizedStudyPlan - A function that handles the personalized study plan generation process.
 * - GeneratePersonalizedStudyPlanInput - The input type for the generatePersonalizedStudyPlan function.
 * - GeneratePersonalizedStudyPlanOutput - The return type for the generatePersonalizedStudyPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePersonalizedStudyPlanInputSchema = z.object({
  studentName: z.string().describe('The name of the student.'),
  courseName: z.string().describe('The name of the course or topic for which to generate the study plan.'),
  learningGoals: z.string().describe('The student\u0027s specific learning goals (e.g., "Pass the exam with an A", "Understand advanced calculus concepts").'),
  currentGrades: z.string().describe('The student\u0027s current grades or performance snapshot (e.g., "Math: B, Science: C+, English: A").'),
  learningStyle: z.string().describe('The student\u0027s preferred learning style (e.g., "visual", "auditory", "kinesthetic", "reading/writing").'),
  timeCommitment: z.string().describe('The amount of time the student can commit to studying (e.g., "2 hours per day", "10 hours per week").'),
  areasToImprove: z.string().describe('Specific areas or topics the student needs to improve on (e.g., "Algebra, Geometry", "Essay writing", "Thermodynamics").'),
});
export type GeneratePersonalizedStudyPlanInput = z.infer<typeof GeneratePersonalizedStudyPlanInputSchema>;

const GeneratePersonalizedStudyPlanOutputSchema = z.object({
  planTitle: z.string().describe('A descriptive title for the personalized study plan.'),
  introduction: z.string().describe('A welcoming and encouraging introduction to the study plan.'),
  goalsSummary: z.string().describe('A summary of the student\u0027s learning goals based on the input.'),
  weeklySchedule: z.array(z.object({
    week: z.number().describe('The week number in the study plan, starting from 1.'),
    topics: z.array(z.string()).describe('A list of key topics to cover during this week.'),
    activities: z.array(z.string()).describe('Suggested study activities for the week (e.g., "Read Chapter 5", "Solve practice problems", "Watch video lectures").'),
    focusAreas: z.array(z.string()).describe('Specific areas or concepts to focus on for improvement this week.'),
    estimatedHours: z.number().describe('The estimated number of hours required for studying this week.'),
    notes: z.string().optional().describe('Any additional notes or tips for the week.'),
  })).describe('A detailed weekly breakdown of study topics, activities, and focus areas.'),
  recommendations: z.array(z.string()).describe('General recommendations and tips for effective studying, resource suggestions, or motivational advice.'),
  conclusion: z.string().describe('An encouraging closing remark for the student.'),
});
export type GeneratePersonalizedStudyPlanOutput = z.infer<typeof GeneratePersonalizedStudyPlanOutputSchema>;

export async function generatePersonalizedStudyPlan(input: GeneratePersonalizedStudyPlanInput): Promise<GeneratePersonalizedStudyPlanOutput> {
  return generatePersonalizedStudyPlanFlow(input);
}

const generatePersonalizedStudyPlanPrompt = ai.definePrompt({
  name: 'generatePersonalizedStudyPlanPrompt',
  input: {schema: GeneratePersonalizedStudyPlanInputSchema},
  output: {schema: GeneratePersonalizedStudyPlanOutputSchema},
  prompt: `You are an intelligent study planner AI named ScholAI. Your task is to create a highly personalized and effective study plan for a student based on their specific needs and goals. You should break down the study into a weekly schedule, suggesting topics, activities, and focusing on areas of improvement.

Here is the student's information:
Student Name: {{{studentName}}}
Course/Topic: {{{courseName}}}
Learning Goals: {{{learningGoals}}}
Current Grades/Performance: {{{currentGrades}}}
Preferred Learning Style: {{{learningStyle}}}
Time Commitment: {{{timeCommitment}}}
Areas to Improve: {{{areasToImprove}}}

Based on this information, generate a comprehensive study plan in the following JSON format. Ensure the plan is encouraging, practical, and directly addresses the student's areas for improvement and learning style.

Remember to provide a clear weekly breakdown, specific activities, and estimated hours, keeping the time commitment in mind.
`,
});

const generatePersonalizedStudyPlanFlow = ai.defineFlow(
  {
    name: 'generatePersonalizedStudyPlanFlow',
    inputSchema: GeneratePersonalizedStudyPlanInputSchema,
    outputSchema: GeneratePersonalizedStudyPlanOutputSchema,
  },
  async input => {
    const {output} = await generatePersonalizedStudyPlanPrompt(input);
    return output!;
  }
);
