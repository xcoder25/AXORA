"use client"

import { useState } from "react"
import { generateStudyResourcesFromSyllabus, type GenerateStudyResourcesFromSyllabusOutput } from "@/ai/flows/generate-study-resources-from-syllabus"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, BookOpen, PenTool, Sparkles, FileText, CheckCircle } from "lucide-react"

export default function ResourceGeneratorPage() {
  const [loading, setLoading] = useState(false)
  const [resources, setResources] = useState<GenerateStudyResourcesFromSyllabusOutput | null>(null)
  const [activeTab, setActiveTab] = useState("summary")

  async function handleGenerate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    
    try {
      const result = await generateStudyResourcesFromSyllabus({
        syllabusContent: formData.get("syllabusContent") as string,
      })
      setResources(result)
      setActiveTab("summary")
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-headline text-3xl font-bold text-primary">Instant Resource Generator</h2>
          <p className="text-muted-foreground">Convert long syllabus documents into bite-sized summaries and quizzes.</p>
        </div>
        <Sparkles className="h-8 w-8 text-accent hidden md:block" />
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-4 h-fit sticky top-20">
          <Card>
            <CardHeader>
              <CardTitle>Syllabus Input</CardTitle>
              <CardDescription>Paste the raw text of your syllabus content below.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGenerate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="syllabusContent">Document Content</Label>
                  <Textarea 
                    id="syllabusContent" 
                    name="syllabusContent" 
                    placeholder="Course Objectives, Grading Policy, Weekly Schedule..." 
                    className="min-h-[400px] text-sm leading-relaxed"
                    required 
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Transform Syllabus"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-8">
          {!resources && !loading && (
            <div className="flex flex-col items-center justify-center h-full py-40 text-center border-2 border-dashed rounded-xl bg-muted/30">
              <BookOpen className="h-16 w-16 text-muted-foreground/40 mb-4" />
              <h3 className="font-headline text-2xl font-medium text-muted-foreground">Waiting for Content</h3>
              <p className="text-muted-foreground max-w-sm">Provide your course document to generate learning resources automatically.</p>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-40 space-y-6">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <div className="text-center space-y-2">
                <p className="text-xl font-medium animate-pulse">Extracting key concepts...</p>
                <p className="text-sm text-muted-foreground">This might take a few moments for longer documents.</p>
              </div>
            </div>
          )}

          {resources && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8">
                  <TabsTrigger value="summary" className="flex gap-2">
                    <FileText className="h-4 w-4" />
                    Syllabus Summary
                  </TabsTrigger>
                  <TabsTrigger value="quiz" className="flex gap-2">
                    <PenTool className="h-4 w-4" />
                    Practice Quiz
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="summary" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="font-headline text-2xl">Executive Summary</CardTitle>
                      <CardDescription>Key topics, learning objectives, and assessment methods.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {resources.summary}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="quiz" className="space-y-6">
                  {resources.quizzes.map((q, idx) => (
                    <Card key={idx} className="overflow-hidden">
                      <div className="bg-primary/5 px-6 py-3 border-b border-primary/10">
                        <span className="text-xs font-bold text-primary uppercase tracking-widest">Question {idx + 1}</span>
                      </div>
                      <CardHeader>
                        <CardTitle className="text-lg leading-snug">{q.question}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid gap-2">
                          {q.options.map((opt, oIdx) => (
                            <div 
                              key={oIdx} 
                              className={`p-3 rounded-md border text-sm flex items-center justify-between transition-colors
                                ${opt === q.correctAnswer ? 'bg-green-50/50 border-green-100 text-green-900 font-medium' : 'bg-background hover:bg-muted'}`}
                            >
                              {opt}
                              {opt === q.correctAnswer && <CheckCircle className="h-4 w-4 text-green-600" />}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
