"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useUser, useDoc, useCollection, useFirestore, useMemoFirebase } from '@/firebase'
import { collection, query, where, orderBy, doc, setDoc, updateDoc } from 'firebase/firestore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Plus, Search, BookOpen, Clock, Users, ArrowRight, Sparkles, ShieldCheck,
  Loader2, X, CheckCircle2, AlertTriangle, ChevronLeft, ChevronRight,
  Timer, Brain, Play, Send, Camera, Eye, BarChart2, Trophy
} from "lucide-react"
import { cn } from "@/lib/utils"
import { generateExamQuestions } from "@/ai/flows/generate-exam-questions"
import { analyzeProctoring } from "@/ai/flows/ai-exam-proctoring"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"

type ExamQuestion = {
  text: string
  options: string[]
  correctAnswer: string
  points: number
  rationale: string
}

type ExamSession = {
  exam: any
  questions: ExamQuestion[]
  answers: Record<number, string>
  currentQ: number
  timeLeft: number
  submitted: boolean
  score: number | null
  proctorAlerts: string[]
}

export default function CBTExamsPage() {
  const { user } = useUser()
  const { data: profile } = useDoc(user ? `users/${user.uid}` : null)
  const [searchTerm, setSearchTerm] = useState("")
  const db = useFirestore()

  // Modes: "list" | "architect" | "session" | "results"
  const [mode, setMode] = useState<"list" | "architect" | "session" | "results">("list")
  const [selectedExam, setSelectedExam] = useState<any>(null)
  const [session, setSession] = useState<ExamSession | null>(null)

  // AI Architect State
  const [archTopic, setArchTopic] = useState("")
  const [archDifficulty, setArchDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium")
  const [archCount, setArchCount] = useState(10)
  const [archContext, setArchContext] = useState("")
  const [generatedQuestions, setGeneratedQuestions] = useState<ExamQuestion[]>([])
  const [generating, setGenerating] = useState(false)
  const [archSummary, setArchSummary] = useState("")

  // Proctoring
  const videoRef = useRef<HTMLVideoElement>(null)
  const proctorIntervalRef = useRef<any>(null)
  const [proctorActive, setProctorActive] = useState(false)

  // Timer
  const timerRef = useRef<any>(null)

  const examsQuery = useMemoFirebase(() => {
    if (!db || !profile?.schoolId) return null
    return query(collection(db, 'exams'), where('schoolId', '==', profile.schoolId), orderBy('createdAt', 'desc'))
  }, [db, profile?.schoolId])

  const { data: exams } = useCollection(examsQuery)

  const filteredExams = exams?.filter(e =>
    e.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
      case 'Published': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'Closed': return 'bg-red-500/10 text-red-500 border-red-500/20'
      default: return 'bg-white/5 text-muted-foreground border-white/10'
    }
  }

  // ── AI ARCHITECT ───────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!archTopic) return
    setGenerating(true)
    setGeneratedQuestions([])
    try {
      const result = await generateExamQuestions({
        topic: archTopic,
        difficulty: archDifficulty,
        numQuestions: archCount,
        contextText: archContext || undefined,
      })
      setGeneratedQuestions(result.questions)
      setArchSummary(result.summary)
    } catch (e) {
      console.error(e)
    } finally {
      setGenerating(false)
    }
  }

  const handleSaveExam = async () => {
    if (!profile?.schoolId || generatedQuestions.length === 0) return
    const examId = `EXM-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
    const docRef = doc(db, 'exams', examId)
    const payload = {
      title: archTopic,
      subject: archTopic,
      difficulty: archDifficulty,
      duration: archCount * 2,
      status: 'Published',
      schoolId: profile.schoolId,
      createdAt: new Date().toISOString(),
      students: 0,
      questions: generatedQuestions,
    }
    await setDoc(docRef, payload, { merge: true }).catch(() => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: docRef.path, operation: 'write', requestResourceData: payload }))
    })
    setMode("list")
    setGeneratedQuestions([])
    setArchTopic("")
    setArchContext("")
  }

  // ── EXAM SESSION ───────────────────────────────────────────────
  const handleLaunchExam = (exam: any) => {
    if (!exam.questions || exam.questions.length === 0) return
    const newSession: ExamSession = {
      exam,
      questions: exam.questions,
      answers: {},
      currentQ: 0,
      timeLeft: (exam.duration || 30) * 60,
      submitted: false,
      score: null,
      proctorAlerts: [],
    }
    setSession(newSession)
    setSelectedExam(exam)
    setMode("session")
  }

  // Timer countdown
  useEffect(() => {
    if (mode !== "session" || !session || session.submitted) return
    timerRef.current = setInterval(() => {
      setSession(prev => {
        if (!prev) return prev
        if (prev.timeLeft <= 1) {
          clearInterval(timerRef.current)
          handleSubmitExam()
          return { ...prev, timeLeft: 0 }
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 }
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [mode, session?.submitted])

  // Webcam proctoring
  const startProctor = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setProctorActive(true)
      }
      proctorIntervalRef.current = setInterval(async () => {
        if (!videoRef.current) return
        const canvas = document.createElement("canvas")
        canvas.width = 320
        canvas.height = 240
        const ctx = canvas.getContext("2d")
        if (!ctx) return
        ctx.drawImage(videoRef.current, 0, 0, 320, 240)
        const dataUri = canvas.toDataURL("image/jpeg", 0.6)
        try {
          const result = await analyzeProctoring({ frameDataUri: dataUri, examId: selectedExam?.id || "unknown" })
          if (result.isSuspicious) {
            setSession(prev => prev ? {
              ...prev,
              proctorAlerts: [...prev.proctorAlerts.slice(-4), result.violationType || result.description]
            } : prev)
          }
        } catch { /* silent fail */ }
      }, 15000) // every 15 seconds
    } catch (e) {
      console.warn("Webcam not accessible for proctoring:", e)
    }
  }, [selectedExam])

  useEffect(() => {
    if (mode === "session") startProctor()
    return () => {
      clearInterval(proctorIntervalRef.current)
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
        tracks.forEach(t => t.stop())
      }
    }
  }, [mode])

  const handleAnswer = (optionIdx: number) => {
    if (!session) return
    setSession(prev => prev ? {
      ...prev,
      answers: { ...prev.answers, [prev.currentQ]: prev.questions[prev.currentQ].options[optionIdx] }
    } : prev)
  }

  const handleSubmitExam = useCallback(async () => {
    if (!session) return
    clearInterval(timerRef.current)
    clearInterval(proctorIntervalRef.current)

    // Calculate score
    let earned = 0
    let total = 0
    session.questions.forEach((q, i) => {
      total += q.points || 1
      if (session.answers[i] === q.correctAnswer) earned += q.points || 1
    })
    const pct = Math.round((earned / total) * 100)

    setSession(prev => prev ? { ...prev, submitted: true, score: pct } : prev)
    setMode("results")

    // Log to Firestore
    if (db && profile?.schoolId && user) {
      const resultId = `RES-${user.uid}-${selectedExam?.id}`
      const resultRef = doc(db, 'exam_results', resultId)
      await setDoc(resultRef, {
        examId: selectedExam?.id,
        examTitle: selectedExam?.title,
        userId: user.uid,
        userName: profile?.displayName || user.email,
        schoolId: profile.schoolId,
        score: pct,
        earned,
        total,
        proctorAlerts: session.proctorAlerts,
        submittedAt: new Date().toISOString(),
      }, { merge: true }).catch(() => {})
    }
  }, [session, db, profile, user, selectedExam])

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`

  const handleCreateExam = () => {
    if (!profile?.schoolId) return
    const examId = `EXM-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
    const docRef = doc(db, 'exams', examId)
    const payload = {
      title: 'New Assessment',
      subject: 'Undetermined',
      duration: 60,
      status: 'Draft',
      schoolId: profile.schoolId,
      createdAt: new Date().toISOString(),
      students: 0,
      questions: [],
    }
    setDoc(docRef, payload, { merge: true }).catch(() => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: docRef.path, operation: 'write', requestResourceData: payload }))
    })
  }

  // ── RESULTS VIEW ───────────────────────────────────────────────
  if (mode === "results" && session) {
    const pct = session.score ?? 0
    const passed = pct >= 50
    return (
      <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-700">
        <Card className={cn("glass-card border-none overflow-hidden", passed ? "border-emerald-500/30" : "border-red-500/30")}>
          <CardHeader className={cn("p-10 text-center", passed ? "bg-emerald-500/10" : "bg-red-500/10")}>
            <div className="flex justify-center mb-4">
              {passed
                ? <Trophy className="h-16 w-16 text-emerald-400" />
                : <AlertTriangle className="h-16 w-16 text-red-400" />}
            </div>
            <CardTitle className="text-4xl font-bold text-white">{pct}%</CardTitle>
            <CardDescription className="text-lg mt-2">
              {passed ? "✅ Assessment Passed" : "❌ Assessment Failed"}
            </CardDescription>
            <p className="text-sm text-muted-foreground mt-1">{session.exam.title}</p>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                { label: "Questions", value: session.questions.length },
                { label: "Correct", value: Object.entries(session.answers).filter(([i, ans]) => ans === session.questions[+i]?.correctAnswer).length },
                { label: "Proctor Alerts", value: session.proctorAlerts.length },
              ].map((s, i) => (
                <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-2xl font-bold text-white">{s.value}</p>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            {session.proctorAlerts.length > 0 && (
              <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 space-y-2">
                <p className="text-[9px] font-bold uppercase tracking-widest text-orange-400 flex items-center gap-2">
                  <AlertTriangle className="h-3 w-3" /> Integrity Alerts Logged
                </p>
                {session.proctorAlerts.map((alert, i) => (
                  <p key={i} className="text-xs text-orange-300">• {alert}</p>
                ))}
              </div>
            )}

            <ScrollArea className="h-64">
              <div className="space-y-3">
                {session.questions.map((q, i) => {
                  const answered = session.answers[i]
                  const correct = answered === q.correctAnswer
                  return (
                    <div key={i} className={cn("p-4 rounded-xl border text-sm", correct ? "bg-emerald-500/5 border-emerald-500/20" : "bg-red-500/5 border-red-500/20")}>
                      <p className="font-semibold text-white mb-2">Q{i + 1}: {q.text}</p>
                      <p className={cn("text-xs", correct ? "text-emerald-400" : "text-red-400")}>
                        Your answer: {answered || "—"} {correct ? "✓" : "✗"}
                      </p>
                      {!correct && <p className="text-xs text-muted-foreground mt-1">Correct: {q.correctAnswer}</p>}
                      <p className="text-[10px] text-muted-foreground mt-2 italic">{q.rationale}</p>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter className="p-6 border-t border-white/5">
            <Button className="w-full rounded-xl" onClick={() => { setMode("list"); setSession(null) }}>
              Back to Exam Registry
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // ── LIVE EXAM SESSION ──────────────────────────────────────────
  if (mode === "session" && session) {
    const q = session.questions[session.currentQ]
    const totalQ = session.questions.length
    const answered = Object.keys(session.answers).length
    const timePct = (session.timeLeft / ((session.exam.duration || 30) * 60)) * 100
    const urgent = session.timeLeft < 120

    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
        {/* Header bar */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-headline text-xl font-bold text-white">{session.exam.title}</h2>
            <p className="text-xs text-muted-foreground">{answered}/{totalQ} answered</p>
          </div>
          <div className="flex items-center gap-4">
            {proctorActive && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[9px] font-bold text-red-400 uppercase tracking-wider">Proctored</span>
              </div>
            )}
            <div className={cn("flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-lg font-bold",
              urgent ? "bg-red-500/10 border border-red-500/30 text-red-400" : "bg-white/5 border border-white/10 text-white"
            )}>
              <Timer className={cn("h-4 w-4", urgent && "animate-pulse")} />
              {formatTime(session.timeLeft)}
            </div>
          </div>
        </div>

        <Progress value={(session.currentQ + 1) / totalQ * 100} className="h-1.5" />

        <div className="grid gap-6 lg:grid-cols-12">
          {/* Question Card */}
          <div className="lg:col-span-8 space-y-4">
            <Card className="glass-card border-none">
              <CardHeader className="bg-primary/10 border-b border-white/5 p-6">
                <div className="flex justify-between items-center mb-3">
                  <Badge className="bg-primary/20 text-primary text-[9px] font-bold uppercase">Question {session.currentQ + 1} of {totalQ}</Badge>
                  <Badge variant="outline" className="text-[9px] border-white/10 text-muted-foreground">{q.points || 1} pt{(q.points || 1) > 1 ? "s" : ""}</Badge>
                </div>
                <CardTitle className="text-lg text-white leading-relaxed">{q.text}</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                {q.options.map((option, idx) => {
                  const selected = session.answers[session.currentQ] === option
                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(idx)}
                      className={cn(
                        "w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center gap-4",
                        selected
                          ? "bg-primary/20 border-primary/50 text-white"
                          : "bg-white/3 border-white/10 text-white/80 hover:bg-white/8 hover:border-white/20"
                      )}
                    >
                      <span className={cn(
                        "h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold border shrink-0",
                        selected ? "bg-primary border-primary text-white" : "border-white/20 text-muted-foreground"
                      )}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="text-sm">{option}</span>
                    </button>
                  )
                })}
              </CardContent>
              <CardFooter className="p-6 border-t border-white/5 flex justify-between">
                <Button variant="outline" className="rounded-xl border-white/10 bg-white/5"
                  disabled={session.currentQ === 0}
                  onClick={() => setSession(prev => prev ? { ...prev, currentQ: prev.currentQ - 1 } : prev)}>
                  <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                </Button>
                {session.currentQ < totalQ - 1 ? (
                  <Button className="rounded-xl"
                    onClick={() => setSession(prev => prev ? { ...prev, currentQ: prev.currentQ + 1 } : prev)}>
                    Next <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button className="rounded-xl bg-emerald-600 hover:bg-emerald-700" onClick={handleSubmitExam}>
                    <Send className="mr-2 h-4 w-4" /> Submit Exam
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>

          {/* Right rail: nav + proctor */}
          <div className="lg:col-span-4 space-y-4">
            {/* Webcam proctor */}
            <Card className="glass-card border-none overflow-hidden">
              <CardHeader className="bg-red-500/10 border-b border-white/5 p-3">
                <p className="text-[9px] font-bold uppercase tracking-widest text-red-400 flex items-center gap-1.5">
                  <Camera className="h-3 w-3" /> Live Proctor Feed
                </p>
              </CardHeader>
              <CardContent className="p-0">
                <video ref={videoRef} autoPlay playsInline muted className="w-full aspect-video object-cover opacity-80" />
                {session.proctorAlerts.length > 0 && (
                  <div className="p-3 space-y-1 bg-orange-500/10">
                    <p className="text-[8px] font-bold text-orange-400 uppercase">Latest Alert</p>
                    <p className="text-[9px] text-orange-300">{session.proctorAlerts[session.proctorAlerts.length - 1]}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Question navigator */}
            <Card className="glass-card border-none">
              <CardHeader className="border-b border-white/5 p-4">
                <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Navigator</p>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-5 gap-1.5">
                  {session.questions.map((_, i) => {
                    const isAnswered = session.answers[i] !== undefined
                    const isCurrent = i === session.currentQ
                    return (
                      <button key={i}
                        onClick={() => setSession(prev => prev ? { ...prev, currentQ: i } : prev)}
                        className={cn(
                          "h-8 w-full rounded-lg text-[10px] font-bold border transition-all",
                          isCurrent ? "bg-primary border-primary text-white" :
                          isAnswered ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400" :
                          "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10"
                        )}>
                        {i + 1}
                      </button>
                    )
                  })}
                </div>
                <div className="flex gap-3 mt-4 text-[9px] font-bold uppercase text-muted-foreground">
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-emerald-500/50" /> Answered</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-primary/50" /> Current</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-white/10" /> Pending</span>
                </div>
              </CardContent>
            </Card>

            <Button variant="destructive" className="w-full rounded-xl" onClick={handleSubmitExam}>
              <Send className="mr-2 h-4 w-4" /> Submit & End Exam
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // ── AI ARCHITECT ───────────────────────────────────────────────
  if (mode === "architect") {
    return (
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="rounded-xl border border-white/10 bg-white/5"
            onClick={() => { setMode("list"); setGeneratedQuestions([]); setArchTopic("") }}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <div>
            <h2 className="font-headline text-3xl font-bold text-white">AI Question Architect</h2>
            <p className="text-sm text-muted-foreground">Generate full assessments from a topic or syllabus in seconds.</p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* Config panel */}
          <div className="lg:col-span-4">
            <Card className="glass-card border-none h-fit">
              <CardHeader className="bg-primary/10 border-b border-white/5 p-6">
                <div className="flex items-center gap-2 mb-1">
                  <Brain className="h-4 w-4 text-primary" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-primary">Neural Generator</span>
                </div>
                <CardTitle className="text-xl text-white">Configuration</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div className="space-y-1.5">
                  <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Subject / Topic</Label>
                  <Input
                    placeholder="e.g. Quadratic Equations"
                    value={archTopic}
                    onChange={e => setArchTopic(e.target.value)}
                    className="bg-white/5 border-white/10 rounded-xl h-11"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Difficulty</Label>
                    <Select value={archDifficulty} onValueChange={v => setArchDifficulty(v as any)}>
                      <SelectTrigger className="bg-white/5 border-white/10 rounded-xl h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Easy">Easy</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Questions</Label>
                    <Input
                      type="number" min={1} max={20} value={archCount}
                      onChange={e => setArchCount(Number(e.target.value))}
                      className="bg-white/5 border-white/10 rounded-xl h-11"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Optional Syllabus Context</Label>
                  <Textarea
                    placeholder="Paste study material, chapter notes, or syllabus text here..."
                    value={archContext}
                    onChange={e => setArchContext(e.target.value)}
                    className="bg-white/5 border-white/10 rounded-xl min-h-[120px] text-xs"
                  />
                </div>
                <Button className="w-full h-12 rounded-xl font-bold shadow-lg shadow-primary/20" onClick={handleGenerate} disabled={generating || !archTopic}>
                  {generating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Synthesizing...</> : <><Sparkles className="mr-2 h-4 w-4" /> Generate Questions</>}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Generated Questions */}
          <div className="lg:col-span-8 space-y-4">
            {generating && (
              <div className="flex flex-col items-center justify-center py-32 bg-white/3 rounded-3xl border border-white/5 space-y-4">
                <Brain className="h-12 w-12 text-primary animate-pulse" />
                <p className="text-white font-bold">Axora is architecting your assessment...</p>
                <p className="text-xs text-muted-foreground">Generating {archCount} {archDifficulty} questions on: <span className="text-primary">{archTopic}</span></p>
              </div>
            )}

            {!generating && generatedQuestions.length === 0 && (
              <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-white/5 rounded-3xl bg-white/3 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground/20 mb-4" />
                <p className="text-white font-bold">No questions generated yet</p>
                <p className="text-xs text-muted-foreground mt-1">Configure the panel and click Generate Questions</p>
              </div>
            )}

            {generatedQuestions.length > 0 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {archSummary && (
                  <Card className="glass-card border-primary/20 bg-primary/5 border-none">
                    <CardContent className="p-4 flex items-start gap-3">
                      <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <p className="text-sm text-white/90">{archSummary}</p>
                    </CardContent>
                  </Card>
                )}
                <ScrollArea className="h-[600px] pr-2">
                  <div className="space-y-4">
                    {generatedQuestions.map((q, i) => (
                      <Card key={i} className="glass-card border-none">
                        <CardContent className="p-5 space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-sm font-semibold text-white leading-relaxed">
                              <span className="text-primary mr-2">Q{i + 1}.</span>{q.text}
                            </p>
                            <Badge className="bg-primary/10 text-primary text-[8px] shrink-0">{q.points || 1}pt</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {q.options.map((opt, oi) => (
                              <div key={oi} className={cn(
                                "p-2 rounded-lg text-xs border",
                                opt === q.correctAnswer ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold" : "bg-white/5 border-white/5 text-muted-foreground"
                              )}>
                                {String.fromCharCode(65 + oi)}. {opt}
                                {opt === q.correctAnswer && " ✓"}
                              </div>
                            ))}
                          </div>
                          <p className="text-[10px] text-muted-foreground italic border-t border-white/5 pt-2">{q.rationale}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 rounded-xl border-white/10 bg-white/5" onClick={handleGenerate} disabled={generating}>
                    Regenerate
                  </Button>
                  <Button className="flex-1 rounded-xl shadow-lg shadow-primary/20" onClick={handleSaveExam}>
                    <CheckCircle2 className="mr-2 h-4 w-4" /> Save to Registry
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── EXAM LIST ──────────────────────────────────────────────────
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5 uppercase tracking-widest text-[9px] font-bold">
              Institutional Assessment Node
            </Badge>
            <ShieldCheck className="h-3 w-3 text-emerald-500" />
          </div>
          <h2 className="font-headline text-4xl font-bold text-white tracking-tight">CBT Engine</h2>
          <p className="text-muted-foreground text-lg">Computer-Based Testing with AI-proctoring and neural grading.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search assessments..."
              className="bg-white/5 border-white/10 pl-9 rounded-xl h-10 text-xs"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="rounded-xl border-white/10 bg-white/5" onClick={() => setMode("architect")}>
            <Brain className="mr-2 h-4 w-4" /> AI Architect
          </Button>
          <Button className="rounded-xl shadow-lg shadow-primary/20 font-bold uppercase tracking-widest text-[10px]" onClick={handleCreateExam}>
            <Plus className="mr-2 h-4 w-4" /> New Exam
          </Button>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid gap-6 md:grid-cols-4">
        {[
          { label: "Total Exams", value: exams?.length || 0, icon: BookOpen, color: "text-primary" },
          { label: "Active Sessions", value: exams?.filter(e => e.status === 'Active').length || 0, icon: Play, color: "text-emerald-400" },
          { label: "Published", value: exams?.filter(e => e.status === 'Published').length || 0, icon: Eye, color: "text-blue-400" },
          { label: "AI Generated", value: exams?.filter(e => e.questions?.length > 0).length || 0, icon: Brain, color: "text-purple-400" },
        ].map((s, i) => (
          <Card key={i} className="glass-card border-none">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                <s.icon className={cn("h-5 w-5", s.color)} />
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{s.label}</p>
                <p className="text-2xl font-bold text-white">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredExams?.map((exam) => (
          <Card key={exam.id} className="glass-card border-none hover:border-primary/30 transition-all duration-500 group overflow-hidden flex flex-col">
            <CardHeader className="bg-white/3 border-b border-white/5 p-6 relative">
              <div className="flex justify-between items-start mb-4">
                <Badge variant="outline" className="text-[8px] font-bold border-white/10 text-muted-foreground uppercase">
                  {exam.subject}
                </Badge>
                <Badge className={cn("text-[8px] font-bold uppercase", getStatusColor(exam.status))}>
                  {exam.status}
                </Badge>
              </div>
              <CardTitle className="text-lg font-bold text-white group-hover:text-primary transition-colors">
                {exam.title}
              </CardTitle>
              <CardDescription className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-1">
                NODE: {exam.id}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4 flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span className="text-[11px] font-semibold">{exam.duration || 30} Minutes</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <BarChart2 className="h-4 w-4" />
                  <span className="text-[11px] font-semibold">{exam.questions?.length || 0} Questions</span>
                </div>
              </div>
              {exam.difficulty && (
                <Badge variant="outline" className={cn("text-[8px]",
                  exam.difficulty === "Hard" ? "border-red-500/30 text-red-400" :
                  exam.difficulty === "Medium" ? "border-orange-500/30 text-orange-400" :
                  "border-emerald-500/30 text-emerald-400"
                )}>
                  {exam.difficulty} Difficulty
                </Badge>
              )}
              {exam.status === 'Active' && (
                <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] font-bold text-emerald-500 uppercase">Live Session Underway</span>
                </div>
              )}
            </CardContent>
            <CardFooter className="bg-white/3 p-4 border-t border-white/5 flex gap-2">
              <Button variant="ghost" className="flex-1 h-9 rounded-xl text-[9px] font-bold uppercase tracking-widest text-muted-foreground hover:text-white"
                onClick={() => setMode("architect")}>
                Edit / AI
              </Button>
              <Button
                className="flex-1 h-9 rounded-xl text-[9px] font-bold uppercase tracking-widest group"
                disabled={!exam.questions || exam.questions.length === 0}
                onClick={() => handleLaunchExam(exam)}>
                {exam.questions?.length > 0 ? "Launch Portal" : "No Questions"}
                {exam.questions?.length > 0 && <ArrowRight className="ml-2 h-3 w-3 group-hover:translate-x-1 transition-transform" />}
              </Button>
            </CardFooter>
          </Card>
        ))}

        {/* AI Architect shortcut card */}
        <Card
          className="glass-card border-dashed border-2 border-white/5 flex flex-col items-center justify-center p-12 hover:bg-white/5 transition-all cursor-pointer"
          onClick={() => setMode("architect")}
        >
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
            <Brain className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-white uppercase tracking-widest">AI Question Architect</h3>
          <p className="text-[10px] text-muted-foreground text-center mt-2 max-w-[200px]">
            Generate full assessments from your course syllabus in seconds.
          </p>
        </Card>
      </div>
    </div>
  )
}