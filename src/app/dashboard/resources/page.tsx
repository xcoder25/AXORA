"use client"

import { useState } from "react"
import { generateStudyResourcesFromSyllabus, type GenerateStudyResourcesFromSyllabusOutput } from "@/ai/flows/generate-study-resources-from-syllabus"
import { synthesizeAxoraVoice } from "@/ai/flows/axora-voice-flow"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, BookOpen, PenTool, Sparkles, FileText, CheckCircle, Volume2 } from "lucide-react"

export default function ResourceGeneratorPage() {
  const [loading, setLoading] = useState(false)
  const [voicing, setVocalizing] = useState(false)
  const [resources, setResources] = useState<GenerateStudyResourcesFromSyllabusOutput | null>(null)
  const [activeTab, setActiveTab] = useState("summary")
  const [audioUrl, setAudioUrl] = useState<string | null>(null)

  async function handleGenerate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setAudioUrl(null)
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

  async function handleVocalize() {
    if (!resources?.summary) return
    setVocalizing(true)
    try {
      const { media } = await synthesizeAxoraVoice(resources.summary)
      setAudioUrl(media)
    } catch (error) {
      console.error(error)
    } finally {
      setVocalizing(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="font-headline text-3xl md:text-4xl font-bold text-white tracking-tight">Resource Engine</h2>
          <p className="text-muted-foreground text-sm md:text-lg">Convert institutional documents into optimized study modules.</p>
        </div>
        <Sparkles className="h-8 w-8 text-accent hidden lg:block animate-pulse" />
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-5 xl:col-span-4 h-fit sticky top-24">
          <Card className="glass-card border-none overflow-hidden">
            <CardHeader className="bg-primary/10 border-b border-white/5 p-6">
              <CardTitle className="text-xl text-white">Syllabus Ingest</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">Paste raw institutional document text below.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleGenerate} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="syllabusContent" className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Document Content</Label>
                  <Textarea 
                    id="syllabusContent" 
                    name="syllabusContent" 
                    placeholder="Course Objectives, Grading Policy, Weekly Schedule..." 
                    className="min-h-[300px] lg:min-h-[450px] text-xs leading-relaxed bg-white/5 border-white/10 rounded-xl focus:bg-white/10 transition-all"
                    required 
                  />
                </div>
                <Button type="submit" className="w-full h-11 rounded-xl font-bold text-sm shadow-lg shadow-primary/20" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <><Sparkles className="mr-2 h-4 w-4" /> Synthesize Data</>}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-7 xl:col-span-8">
          {!resources && !loading && (
            <div className="flex flex-col items-center justify-center h-full min-h-[500px] text-center p-12 border-2 border-dashed rounded-3xl bg-white/3 border-white/5">
              <BookOpen className="h-12 w-12 text-muted-foreground/20 mb-6" />
              <h3 className="font-headline text-xl font-bold text-white">Awaiting Payload</h3>
              <p className="text-muted-foreground text-sm max-w-sm mt-2">Upload syllabus text to generate modular learning assets.</p>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center min-h-[500px] space-y-6 bg-white/3 rounded-3xl border border-white/5">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <div className="text-center">
                <p className="text-lg font-bold text-white">Deconstructing document...</p>
                <p className="text-xs text-muted-foreground mt-1">This may take moments for complex institutional records.</p>
              </div>
            </div>
          )}

          {resources && (
            <div className="space-y-6 animate-in zoom-in-95 duration-500">
              <div className="flex justify-between items-center mb-2 px-2">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 glass-card p-1 rounded-2xl h-12 border-white/5">
                    <TabsTrigger value="summary" className="rounded-xl font-bold uppercase tracking-widest text-[9px] data-[state=active]:bg-primary">
                      <FileText className="h-3.5 w-3.5 mr-2" />
                      Logic Summary
                    </TabsTrigger>
                    <TabsTrigger value="quiz" className="rounded-xl font-bold uppercase tracking-widest text-[9px] data-[state=active]:bg-primary">
                      <PenTool className="h-3.5 w-3.5 mr-2" />
                      Practice Nodes
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="summary" className="mt-6">
                    <Card className="glass-card border-none overflow-hidden">
                      <CardHeader className="p-8 border-b border-white/5 bg-white/3 flex flex-row items-center justify-between">
                        <div>
                          <CardTitle className="font-headline text-2xl text-white">Strategic Summary</CardTitle>
                          <CardDescription className="text-xs text-muted-foreground">Key objectives and assessment logic extracted.</CardDescription>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleVocalize} 
                          disabled={voicing}
                          className="rounded-xl border-primary/20 bg-primary/5 text-primary font-bold text-[9px] uppercase tracking-widest h-9"
                        >
                          {voicing ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" /> : <Volume2 className="h-3.5 w-3.5 mr-2" />}
                          Axora Neural Voice
                        </Button>
                      </CardHeader>
                      <CardContent className="p-8">
                        {audioUrl && (
                          <div className="mb-6 p-4 rounded-2xl bg-primary/5 border border-primary/10 animate-in slide-in-from-top-2">
                            <p className="text-[9px] font-bold text-primary uppercase tracking-[0.2em] mb-2">Neural Vocal Stream Active</p>
                            <audio controls className="w-full h-8 opacity-80 filter invert grayscale">
                              <source src={audioUrl} type="audio/wav" />
                            </audio>
                          </div>
                        )}
                        <div className="prose prose-invert prose-sm max-w-none text-white/80 leading-relaxed whitespace-pre-wrap text-sm">
                          {resources.summary}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="quiz" className="mt-6 space-y-6">
                    {resources.quizzes.map((q, idx) => (
                      <Card key={idx} className="glass-card border-none overflow-hidden">
                        <div className="bg-primary/10 px-6 py-2.5 border-b border-white/5">
                          <span className="text-[9px] font-bold text-primary uppercase tracking-[0.2em]">Node {idx + 1}</span>
                        </div>
                        <CardHeader className="p-6">
                          <CardTitle className="text-base font-bold text-white leading-snug">{q.question}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 pt-0 space-y-3">
                          <div className="grid gap-2">
                            {q.options.map((opt, oIdx) => (
                              <div 
                                key={oIdx} 
                                className={`p-3.5 rounded-xl border text-xs flex items-center justify-between transition-all
                                  ${opt === q.correctAnswer ? 'bg-accent/10 border-accent/30 text-accent font-semibold' : 'bg-white/3 border-white/5 hover:bg-white/8'}`}
                              >
                                {opt}
                                {opt === q.correctAnswer && <CheckCircle className="h-3.5 w-3.5 text-accent" />}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
