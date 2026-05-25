"use client"

import { useState } from "react"
import { generatePersonalizedStudyPlan, type GeneratePersonalizedStudyPlanOutput } from "@/ai/flows/generate-personalized-study-plan"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, Loader2, BookOpen, Clock, Target } from "lucide-react"

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
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h2 className="font-headline text-3xl font-bold text-primary">Intelligent Study Planner</h2>
        <p className="text-muted-foreground">AI-driven personalized learning paths tailored to your performance.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>Planner Details</CardTitle>
            <CardDescription>Tell ScholAI about your learning journey.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="studentName">Student Name</Label>
                <Input id="studentName" name="studentName" placeholder="e.g. Alex Johnson" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="courseName">Course/Topic</Label>
                <Input id="courseName" name="courseName" placeholder="e.g. Advanced Calculus" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="learningStyle">Learning Style</Label>
                <Input id="learningStyle" name="learningStyle" placeholder="e.g. Visual, Kinesthetic" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeCommitment">Time Commitment</Label>
                <Input id="timeCommitment" name="timeCommitment" placeholder="e.g. 5 hours/week" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="learningGoals">Learning Goals</Label>
                <Textarea id="learningGoals" name="learningGoals" placeholder="What do you want to achieve?" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="areasToImprove">Areas for Improvement</Label>
                <Textarea id="areasToImprove" name="areasToImprove" placeholder="Specific topics you struggle with..." required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Generate Study Plan"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          {!plan && !loading && (
            <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-xl bg-muted/30">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-headline text-xl font-medium">No Plan Generated</h3>
              <p className="text-muted-foreground max-w-xs">Fill out the form to create your custom AI study schedule.</p>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-lg font-medium animate-pulse">ScholAI is analyzing your profile...</p>
            </div>
          )}

          {plan && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card className="bg-primary text-primary-foreground">
                <CardHeader>
                  <CardTitle className="font-headline text-2xl">{plan.planTitle}</CardTitle>
                  <CardDescription className="text-primary-foreground/80">{plan.introduction}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm">
                    <Target className="h-4 w-4" />
                    <span>{plan.goalsSummary}</span>
                  </div>
                </CardContent>
              </Card>

              {plan.weeklySchedule.map((week) => (
                <Card key={week.week}>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">Week {week.week}: Focus Areas</CardTitle>
                    <div className="flex items-center gap-2 text-sm font-medium text-accent">
                      <Clock className="h-4 w-4" />
                      {week.estimatedHours}h estimated
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Topics</h4>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          {week.topics.map((t, i) => <li key={i}>{t}</li>)}
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Activities</h4>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          {week.activities.map((a, i) => <li key={i}>{a}</li>)}
                        </ul>
                      </div>
                    </div>
                    {week.notes && (
                      <div className="bg-muted p-3 rounded-md text-xs italic">
                        Note: {week.notes}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              <Card border-accent>
                <CardHeader>
                  <CardTitle className="text-accent flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {plan.recommendations.map((rec, i) => (
                      <li key={i} className="text-sm flex gap-2">
                        <span className="text-accent font-bold">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-6 font-medium text-primary text-center italic">
                    "{plan.conclusion}"
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
