"use client"

import { useState } from "react"
import { provideAutomatedAssignmentFeedback, type ProvideAutomatedAssignmentFeedbackOutput } from "@/ai/flows/provide-automated-assignment-feedback-flow"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle2, AlertCircle, FileText, Send, Sparkles } from "lucide-react"

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

  const getBadgeStyles = (category: string) => {
    switch (category) {
      case 'Excellent': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
      case 'Good': return 'bg-blue-500/10 text-blue-600 border-blue-500/20'
      case 'Satisfactory': return 'bg-amber-500/10 text-amber-600 border-amber-500/20'
      case 'Needs Improvement': return 'bg-orange-500/10 text-orange-600 border-orange-500/20'
      case 'Unsatisfactory': return 'bg-red-500/10 text-red-600 border-red-500/20'
      default: return 'bg-gray-500/10 text-gray-600'
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-2">
        <h2 className="font-headline text-4xl font-extrabold text-foreground tracking-tight">AI Grading Assistant</h2>
        <p className="text-muted-foreground text-lg">Semantic analysis and logic evaluation for written assignments.</p>
      </div>

      <div className="grid gap-10 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <form onSubmit={handleGrade} className="space-y-6 h-full">
            <Card className="border-none shadow-xl h-full flex flex-col">
              <CardHeader className="bg-primary text-primary-foreground rounded-t-2xl">
                <CardTitle className="font-headline">Input Data</CardTitle>
                <CardDescription className="text-primary-foreground/70">Context and student work for analysis.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6 flex-1">
                <div className="space-y-2">
                  <Label htmlFor="assignmentPrompt" className="text-sm font-bold uppercase tracking-widest opacity-60">Prompt</Label>
                  <Textarea 
                    id="assignmentPrompt" 
                    name="assignmentPrompt" 
                    placeholder="What was the question?" 
                    className="min-h-[100px] rounded-xl border-muted bg-muted/20 focus:bg-background transition-all"
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="studentSubmission" className="text-sm font-bold uppercase tracking-widest opacity-60">Student Submission</Label>
                  <Textarea 
                    id="studentSubmission" 
                    name="studentSubmission" 
                    placeholder="Paste student text here..." 
                    className="min-h-[350px] rounded-xl border-muted bg-muted/20 focus:bg-background transition-all"
                    required 
                  />
                </div>
              </CardContent>
              <CardFooter className="pt-0 p-6">
                <Button type="submit" className="w-full h-12 rounded-xl text-lg font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]" disabled={loading}>
                  {loading ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Evaluating...</>
                  ) : (
                    <><Sparkles className="mr-2 h-5 w-5" /> Run Analysis</>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>

        <div className="lg:col-span-3">
          {!feedback && !loading && (
            <div className="flex flex-col items-center justify-center h-full min-h-[500px] text-center p-12 border-2 border-dashed rounded-3xl bg-muted/30">
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-6">
                <FileText className="h-10 w-10 text-muted-foreground/40" />
              </div>
              <h3 className="font-headline text-2xl font-bold">Awaiting Submission</h3>
              <p className="text-muted-foreground max-w-xs mt-2">Submit an assignment to generate AI-powered semantic insights and feedback.</p>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center h-full min-h-[500px] space-y-6 bg-muted/10 rounded-3xl border">
              <div className="relative">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <Sparkles className="h-6 w-6 text-amber-500 absolute top-0 right-0 animate-pulse" />
              </div>
              <div className="text-center">
                <p className="text-xl font-bold tracking-tight">ScholAI is thinking...</p>
                <p className="text-sm text-muted-foreground mt-1">Analyzing context, tone, and logic patterns.</p>
              </div>
            </div>
          )}

          {feedback && (
            <div className="space-y-6 animate-in zoom-in-95 duration-700">
              <Card className="border-none shadow-2xl overflow-hidden rounded-3xl">
                <CardHeader className="flex flex-row items-center justify-between bg-muted/50 pb-6 border-b">
                  <div className="space-y-1">
                    <CardTitle className="font-headline text-2xl">Analysis Report</CardTitle>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Final Evaluation</p>
                  </div>
                  <Badge variant="outline" className={`${getBadgeStyles(feedback.suggestedGradeCategory)} px-5 py-2 text-sm font-black rounded-xl border-2`}>
                    {feedback.suggestedGradeCategory}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-8 pt-8">
                  <div className="relative pl-6 border-l-4 border-primary/20">
                    <h4 className="text-xs font-black uppercase tracking-widest mb-3 text-primary flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Executive Summary
                    </h4>
                    <p className="text-lg font-medium leading-relaxed text-foreground/90 italic">
                      "{feedback.overallFeedback}"
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-widest mb-3 text-amber-600 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Improvement Matrix
                    </h4>
                    <div className="grid gap-3">
                      {feedback.areasForImprovement.map((area, i) => (
                        <div key={i} className="flex gap-4 p-4 bg-muted/30 rounded-2xl border hover:bg-muted/50 transition-colors group">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background font-bold text-amber-600 shadow-sm border">
                            {i + 1}
                          </span>
                          <p className="text-sm font-medium leading-relaxed group-hover:text-foreground transition-colors">
                            {area}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/30 p-4 justify-center">
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest text-center">
                    Verified ScholAI Analysis Outcome
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
