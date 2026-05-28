'use server';
/**
 * @fileOverview Deep Vision Neural Identity Matrix for institutional security.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

const AttendanceRecognitionInputSchema = z.object({
  photoDataUri: z.string().describe('Deep vision frame from institutional security node as a data URI.'),
  nodeId: z.string().optional().describe('The hardware ID of the camera performing the capture.'),
  schoolId: z.string().optional().describe('The school ID to query reference photos.'),
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
    // 1. Fetch enrolled personnel references from Firestore
    let enrolledUsers: any[] = [];
    if (input.schoolId) {
      try {
        const usersCol = collection(db, 'users');
        const q = query(usersCol, where('schoolId', '==', input.schoolId));
        const snapshot = await getDocs(q);
        enrolledUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (err) {
        console.error("Error querying users in Genkit flow:", err);
      }
    }

    // Filter enrolled users with reference images
    const activeEnrolled = enrolledUsers.filter(u => u.imageUrl && (u.role === 'student' || u.role === 'teacher'));

    // 2. Build the multimodal prompt array
    const promptParts: any[] = [
      { text: `Perform Deep Vision Neural Analysis on this live institutional security feed. 
      You need to identify all human entities and cross-reference them with the list of enrolled personnel.
      
      Enrolled personnel database:
      ${activeEnrolled.length > 0 
        ? activeEnrolled.map((u, i) => `${i + 1}. User ID: ${u.id || u.uid}, Name: ${u.displayName}, Role: ${u.role}, Major/Dept: ${u.major || u.department || 'N/A'}`).join('\n')
        : 'No enrolled personnel with photos found in the database.'
      }
      
      Instructions:
      1. Detect each person's face/body in the live security feed.
      2. Compare their visual appearance (face, features, attire) with the reference images of enrolled personnel provided below.
      3. For each identified person, find their match in the enrolled personnel list and output their exact ID, name, role, and match confidence (0.0 to 1.0).
      4. If a person in the live feed is not in the enrolled database, output them with role: 'unknown' and a descriptive temporary name (e.g. 'Unknown male in black shirt').
      5. Output a summary explaining who was identified and their integrity/status check.
      6. Output overall neural load and total detected count.` }
    ];

    // Add reference photos as media parts
    activeEnrolled.forEach((u) => {
      let mimeType = 'image/jpeg';
      if (u.imageUrl.startsWith('data:image/png')) {
        mimeType = 'image/png';
      } else if (u.imageUrl.startsWith('data:image/webp')) {
        mimeType = 'image/webp';
      }
      
      promptParts.push({ text: `Reference photo for enrolled ${u.role} "${u.displayName}" (ID: ${u.id || u.uid}):` });
      promptParts.push({ media: { url: u.imageUrl, contentType: mimeType } });
    });

    // Add live camera feed photo last
    promptParts.push({ text: `Live security camera feed frame (Node ID: ${input.nodeId || 'DEFAULT_HUB'}):` });
    promptParts.push({ media: { url: input.photoDataUri, contentType: 'image/jpeg' } });

    const {output} = await ai.generate({
      prompt: promptParts,
      output: {schema: AttendanceRecognitionOutputSchema}
    });

    return output!;
  }
);
