"use client"

import { useState } from "react"
import { provideAutomatedAssignmentFeedback, type ProvideAutomatedAssignmentFeedbackOutput } from "@/ai/flows/provide-automated-assignment-feedback-flow"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle2, AlertCircle, FileText, Send } from "lucide-react"

export default function GradingAssistantPage() {
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<ProvideAutomatedAssignmentFeedbackOutput | null>(null)

  async function handleGrade(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    
    try {
      const result = await provideAutomatedAssignmentFeedback({
        assignmentPrompt: formData.get("assignmentPrompt") as string,
        studentSubmission: formData.get("studentSubmission") as string,
      })
      setFeedback(result)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const getBadgeColor = (category: string) => {
    switch (category) {
      case 'Excellent': return 'bg-green-100 text-green-700 border-green-200'
      case 'Good': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'Satisfactory': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'Needs Improvement': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'Unsatisfactory': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h2 className="font-headline text-3xl font-bold text-primary">Automated Grading Assistant</h2>
        <p className="text-muted-foreground">Intelligent semantic logic analysis for open-ended assignments.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <form onSubmit={handleGrade} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Assignment Details</CardTitle>
              <CardDescription>Enter the prompt and the student's work.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="assignmentPrompt">Assignment Prompt</Label>
                <Textarea 
                  id="assignmentPrompt" 
                  name="assignmentPrompt" 
                  placeholder="Describe the context or question given to the student..." 
                  className="min-h-[120px]"
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="studentSubmission">Student Submission</Label>
                <Textarea 
                  id="studentSubmission" 
                  name="studentSubmission" 
                  placeholder="Paste the student's response here..." 
                  className="min-h-[300px]"
                  required 
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <><Send className="mr-2 h-4 w-4" /> Analyze Submission</>}
              </Button>
            </CardFooter>
          </Card>
        </form>

        <div className="space-y-6">
          {!feedback && !loading && (
            <div className="flex flex-col items-center justify-center h-full py-20 text-center border-2 border-dashed rounded-xl bg-muted/30">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-headline text-xl font-medium">Ready for Analysis</h3>
              <p className="text-muted-foreground max-w-xs">Submit an assignment to receive AI-powered semantic feedback.</p>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center h-full py-20 space-y-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-lg font-medium animate-pulse">Evaluating logic and content...</p>
            </div>
          )}

          {feedback && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="font-headline">Assessment Result</CardTitle>
                  <Badge variant="outline" className={`${getBadgeColor(feedback.suggestedGradeCategory)} px-3 py-1`}>
                    {feedback.suggestedGradeCategory}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2 text-primary">
                      <CheckCircle2 className="h-4 w-4" />
                      Overall Feedback
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feedback.overallFeedback}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2 text-accent">
                      <AlertCircle className="h-4 w-4" />
                      Areas for Improvement
                    </h4>
                    <ul className="space-y-2">
                      {feedback.areasForImprovement.map((area, i) => (
                        <li key={i} className="text-sm flex gap-3 p-2 bg-secondary/50 rounded-md border border-secondary">
                          <span className="text-accent font-bold">{i + 1}.</span>
                          {area}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <p className="text-xs text-muted-foreground italic">
                    Note: This is an AI-generated assessment. Final grading should be verified by the instructor.
                  </p>
                </CardFooter>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
