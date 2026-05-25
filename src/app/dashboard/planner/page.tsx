"use client"

import { useState } from "react"
import { generatePersonalizedStudyPlan, type GeneratePersonalizedStudyPlanOutput } from "@/ai/flows/generate-personalized-study-plan"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, Loader2, BookOpen, Clock, Target, Sparkles } from "lucide-react"

export default function StudyPlannerPage() {
  const [loading, setLoading] = useState(false)
  const [plan, setPlan] = useState<GeneratePersonalizedStudyPlanOutput | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    
    try {
      const result = await generatePersonalizedStudyPlan({
        studentName: formData.get("studentName") as string,
        courseName: formData.get("courseName") as string,
        learningGoals: formData.get("learningGoals") as string,
        currentGrades: formData.get("currentGrades") as string,
        learningStyle: formData.get("learningStyle") as string,
        timeCommitment: formData.get("timeCommitment") as string,
        areasToImprove: formData.get("areasToImprove") as string,
      })
      setPlan(result)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h2 className="font-headline text-3xl md:text-4xl font-bold text-white tracking-tight">Intelligent Study Planner</h2>
        <p className="text-muted-foreground text-sm md:text-lg">AI-driven personalized learning paths tailored to academic metrics.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        <Card className="lg:col-span-5 xl:col-span-4 h-fit glass-card border-none">
          <CardHeader className="bg-primary/10 border-b border-white/5 p-6">
            <CardTitle className="text-xl text-white">Planner Profile</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">Tell ScholAI about your academic objectives.</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                <div className="space-y-1.5">
                  <Label htmlFor="studentName" className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Name</Label>
                  <Input id="studentName" name="studentName" placeholder="e.g. Alex Johnson" required className="bg-white/5 border-white/10 h-10 rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="courseName" className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Subject</Label>
                  <Input id="courseName" name="courseName" placeholder="e.g. Quantum Physics" required className="bg-white/5 border-white/10 h-10 rounded-xl" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                <div className="space-y-1.5">
                  <Label htmlFor="learningStyle" className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Modality</Label>
                  <Input id="learningStyle" name="learningStyle" placeholder="e.g. Visual/Spatial" required className="bg-white/5 border-white/10 h-10 rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="timeCommitment" className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Bandwidth</Label>
                  <Input id="timeCommitment" name="timeCommitment" placeholder="e.g. 10 hrs/week" required className="bg-white/5 border-white/10 h-10 rounded-xl" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="learningGoals" className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Key Milestones</Label>
                <Textarea id="learningGoals" name="learningGoals" placeholder="What is the end goal?" required className="bg-white/5 border-white/10 min-h-[80px] rounded-xl text-xs" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="areasToImprove" className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Weak Nodes</Label>
                <Textarea id="areasToImprove" name="areasToImprove" placeholder="Specific topics to reinforce..." required className="bg-white/5 border-white/10 min-h-[80px] rounded-xl text-xs" />
              </div>
              <Button type="submit" className="w-full h-11 rounded-xl text-sm font-bold shadow-lg shadow-primary/20" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <><Sparkles className="mr-2 h-4 w-4" /> Synthesize Plan</>}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          {!plan && !loading && (
            <div className="flex flex-col items-center justify-center py-32 text-center border-2 border-dashed rounded-3xl bg-white/3 border-white/5">
              <Calendar className="h-12 w-12 text-muted-foreground/20 mb-4" />
              <h3 className="font-headline text-xl font-bold text-white">No Active Schedule</h3>
              <p className="text-muted-foreground text-sm max-w-xs mt-2">Initialize your profile to generate a custom study route.</p>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-32 space-y-6 bg-white/3 rounded-3xl border border-white/5">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <div className="text-center">
                <p className="text-lg font-bold text-white">ScholAI is mapping learning nodes...</p>
                <p className="text-xs text-muted-foreground mt-1">Generating optimal path based on style and goals.</p>
              </div>
            </div>
          )}

          {plan && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Card className="bg-gradient-to-br from-primary to-indigo-900 text-white border-none shadow-xl overflow-hidden">
                <CardHeader className="p-8">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-accent" />
                    <span className="text-[9px] font-bold uppercase tracking-widest">AI Generated Route</span>
                  </div>
                  <CardTitle className="font-headline text-3xl">{plan.planTitle}</CardTitle>
                  <CardDescription className="text-primary-foreground/70 text-sm mt-2">{plan.introduction}</CardDescription>
                </CardHeader>
                <CardContent className="px-8 pb-8 pt-0">
                  <div className="flex items-center gap-2 text-xs font-semibold bg-white/10 w-fit px-4 py-2 rounded-full border border-white/10">
                    <Target className="h-3.5 w-3.5" />
                    <span>{plan.goalsSummary}</span>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-6">
                {plan.weeklySchedule.map((week) => (
                  <Card key={week.week} className="glass-card border-none overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 p-6 bg-white/3">
                      <CardTitle className="text-base font-bold text-white">Cycle {week.week}: Optimization</CardTitle>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-accent uppercase tracking-widest">
                        <Clock className="h-3.5 w-3.5" />
                        {week.estimatedHours}h BANDWIDTH
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-3">
                          <h4 className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Primary Topics</h4>
                          <ul className="space-y-2">
                            {week.topics.map((t, i) => (
                              <li key={i} className="text-xs flex gap-3 text-white/80">
                                <span className="h-1 w-1 rounded-full bg-primary mt-1.5 shrink-0" />
                                {t}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="space-y-3">
                          <h4 className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Strategic Activities</h4>
                          <ul className="space-y-2">
                            {week.activities.map((a, i) => (
                              <li key={i} className="text-xs flex gap-3 text-white/80">
                                <span className="h-1 w-1 rounded-full bg-accent mt-1.5 shrink-0" />
                                {a}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      {week.notes && (
                        <div className="bg-white/3 p-4 rounded-xl text-xs italic text-muted-foreground border border-white/5">
                          Strategy Note: {week.notes}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="border-accent/20 glass-card">
                <CardHeader className="p-6">
                  <CardTitle className="text-accent flex items-center gap-2 text-lg">
                    <BookOpen className="h-4 w-4" />
                    Recommended Protocols
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <div className="grid gap-3 mb-8">
                    {plan.recommendations.map((rec, i) => (
                      <div key={i} className="text-xs flex gap-3 p-3 bg-white/3 rounded-xl border border-white/5">
                        <span className="text-accent font-bold">#0{i + 1}</span>
                        {rec}
                      </div>
                    ))}
                  </div>
                  <div className="text-center p-6 border-t border-white/5">
                    <p className="text-sm font-semibold text-white italic">
                      "{plan.conclusion}"
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
