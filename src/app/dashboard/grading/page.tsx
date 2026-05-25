"use client"

import { useState } from "react"
import { provideAutomatedAssignmentFeedback, type ProvideAutomatedAssignmentFeedbackOutput } from "@/ai/flows/provide-automated-assignment-feedback-flow"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle2, AlertCircle, FileText, Sparkles } from "lucide-react"

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
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 w-full">
      <div className="flex flex-col gap-2">
        <h2 className="font-headline text-3xl md:text-4xl font-bold text-foreground tracking-tight">AI Grading Assistant</h2>
        <p className="text-muted-foreground text-sm md:text-lg">Semantic analysis and logic evaluation for written assignments.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-5 xl:col-span-4">
          <form onSubmit={handleGrade} className="space-y-6">
            <Card className="border-none shadow-xl flex flex-col glass-card">
              <CardHeader className="bg-primary/10 rounded-t-2xl p-6 border-b border-white/5">
                <CardTitle className="font-headline text-xl text-white">Input Module</CardTitle>
                <CardDescription className="text-muted-foreground text-xs">Student work for deep analysis.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6 p-6">
                <div className="space-y-1.5">
                  <Label htmlFor="assignmentPrompt" className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Original Prompt</Label>
                  <Textarea 
                    id="assignmentPrompt" 
                    name="assignmentPrompt" 
                    placeholder="Context or question..." 
                    className="min-h-[80px] rounded-xl border-white/10 bg-white/5 focus:bg-white/10 transition-all text-sm"
                    required 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="studentSubmission" className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Student Response</Label>
                  <Textarea 
                    id="studentSubmission" 
                    name="studentSubmission" 
                    placeholder="Paste student text here..." 
                    className="min-h-[250px] lg:min-h-[350px] rounded-xl border-white/10 bg-white/5 focus:bg-white/10 transition-all text-sm"
                    required 
                  />
                </div>
              </CardContent>
              <CardFooter className="p-6 pt-0">
                <Button type="submit" className="w-full h-11 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.01]" disabled={loading}>
                  {loading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</>
                  ) : (
                    <><Sparkles className="mr-2 h-4 w-4" /> Run Semantic Audit</>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>

        <div className="lg:col-span-7 xl:col-span-8 h-full">
          {!feedback && !loading && (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-12 border-2 border-dashed rounded-3xl bg-white/3 border-white/5">
              <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
                <FileText className="h-8 w-8 text-muted-foreground/30" />
              </div>
              <h3 className="font-headline text-xl font-bold text-white">Awaiting Payload</h3>
              <p className="text-muted-foreground text-sm max-w-xs mt-2">Submit an assignment to generate AI-powered insights and feedback logs.</p>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] space-y-6 bg-white/3 rounded-3xl border border-white/5">
              <div className="relative">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <Sparkles className="h-4 w-4 text-accent absolute -top-1 -right-1 animate-pulse" />
              </div>
              <div className="text-center">
                <p className="text-lg font-bold tracking-tight text-white">ScholAI is auditng...</p>
                <p className="text-xs text-muted-foreground mt-1">Analyzing context, tone, and logic patterns.</p>
              </div>
            </div>
          )}

          {feedback && (
            <div className="space-y-6 animate-in zoom-in-95 duration-700 h-full">
              <Card className="border-none shadow-2xl overflow-hidden rounded-3xl glass-card h-full">
                <CardHeader className="flex flex-row items-center justify-between bg-white/5 pb-6 border-b border-white/5 p-6">
                  <div className="space-y-1">
                    <CardTitle className="font-headline text-xl text-white">Evaluation Report</CardTitle>
                    <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">Semantic Audit Complete</p>
                  </div>
                  <Badge variant="outline" className={`${getBadgeStyles(feedback.suggestedGradeCategory)} px-4 py-1.5 text-[10px] font-bold rounded-xl border-2`}>
                    {feedback.suggestedGradeCategory}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-8 pt-8 p-6">
                  <div className="relative pl-5 border-l-2 border-primary/30">
                    <h4 className="text-[9px] font-bold uppercase tracking-widest mb-3 text-primary flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Executive Verdict
                    </h4>
                    <p className="text-base font-medium leading-relaxed text-white/90 italic">
                      "{feedback.overallFeedback}"
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-[9px] font-bold uppercase tracking-widest mb-3 text-accent flex items-center gap-2">
                      <AlertCircle className="h-3.5 w-3.5" />
                      Growth Matrix
                    </h4>
                    <div className="grid gap-3">
                      {feedback.areasForImprovement.map((area, i) => (
                        <div key={i} className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors group">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-background font-bold text-[10px] text-accent shadow-sm border border-white/5">
                            {i + 1}
                          </span>
                          <p className="text-xs font-medium leading-relaxed text-muted-foreground group-hover:text-white transition-colors">
                            {area}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-white/5 p-4 justify-center">
                  <p className="text-[8px] text-muted-foreground font-bold uppercase tracking-widest text-center">
                    Verified ScholAI Analysis Output
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
