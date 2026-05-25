import { config } from 'dotenv';
config();

import '@/ai/flows/generate-study-resources-from-syllabus.ts';
import '@/ai/flows/provide-automated-assignment-feedback-flow.ts';
import '@/ai/flows/generate-personalized-study-plan.ts';
import '@/ai/flows/ai-attendance-recognition.ts';
import '@/ai/flows/ai-exam-proctoring.ts';
