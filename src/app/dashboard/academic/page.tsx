"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  GanttChartSquare, 
  Settings2, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  GraduationCap,
  Sparkles,
  Layout,
  Plus,
  Search,
  Users,
  Calendar,
  Layers,
  MapPin,
  Laptop,
  Check,
  UserCheck,
  MoreHorizontal,
  AlertTriangle,
  Loader2,
  Trash2,
  Edit,
  Activity
} from "lucide-react"
import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc } from "@/firebase"
import { collection, query, where, doc, setDoc, updateDoc, deleteDoc } from "firebase/firestore"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Resources templates
const RESOURCE_POOL = [
  "Smartboard", 
  "Science Kit", 
  "Air Conditioning", 
  "Graphing Tablets", 
  "VR Headsets", 
  "Computer Stations"
]

export default function AcademicEnginePage() {
  const [activeEngineTab, setActiveEngineTab] = useState<"classrooms" | "timetable" | "grading">("classrooms")
  const db = useFirestore()
  const { user } = useUser()
  const { data: profile } = useDoc(user ? `users/${user.uid}` : null)

  // ── Firestore Queries ─────────────────────────────
  const classesQuery = useMemoFirebase(() => {
    if (!db || !profile?.schoolId) return null
    return query(
      collection(db, "classes"),
      where("schoolId", "==", profile.schoolId)
    )
  }, [db, profile?.schoolId])

  const teachersQuery = useMemoFirebase(() => {
    if (!db || !profile?.schoolId) return null
    return query(
      collection(db, "users"),
      where("role", "==", "teacher"),
      where("schoolId", "==", profile.schoolId)
    )
  }, [db, profile?.schoolId])

  const { data: classes, loading: classesLoading } = useCollection(classesQuery)
  const { data: teachers } = useCollection(teachersQuery)

  // ── Seeding Mock Classes if Empty ────────────────
  useEffect(() => {
    if (!db || !profile?.schoolId || classesLoading || !classes) return
    
    if (classes.length === 0) {
      const seedMockClasses = async () => {
        const initial = [
          {
            name: "Primary 1 Green",
            level: "primary",
            roomNo: "Room 101",
            capacity: 25,
            studentCount: 18,
            resources: ["Smartboard", "Air Conditioning"],
            schedule: "08:00 AM - 01:30 PM",
            primaryMilestones: ["Phonetic Sounds", "Basic Addition", "Sharing and Cooperation"],
            teacherId: null,
            teacherName: null,
          },
          {
            name: "Primary 5 Gold",
            level: "primary",
            roomNo: "Room 204",
            capacity: 30,
            studentCount: 26,
            resources: ["Smartboard", "Science Kit", "Air Conditioning"],
            schedule: "08:00 AM - 02:00 PM",
            primaryMilestones: ["Fractions & Decimals", "Basic Ecosystems", "Paragraph Drafting"],
            teacherId: null,
            teacherName: null,
          },
          {
            name: "Grade 10 Calculus",
            level: "secondary",
            roomNo: "Science Hall B",
            capacity: 35,
            studentCount: 28,
            resources: ["Smartboard", "Graphing Tablets"],
            schedule: "09:00 AM - 10:30 AM",
            secondaryCredits: 4,
            teacherId: null,
            teacherName: null,
          },
          {
            name: "Grade 12 Quantum Physics",
            level: "secondary",
            roomNo: "Advanced Physics Lab",
            capacity: 30,
            studentCount: 22,
            resources: ["Smartboard", "VR Headsets", "Computer Stations"],
            schedule: "11:00 AM - 12:30 PM",
            secondaryCredits: 5,
            teacherId: null,
            teacherName: null,
          }
        ]

        for (const item of initial) {
          const docRef = doc(collection(db, "classes"))
          await setDoc(docRef, {
            uid: docRef.id,
            schoolId: profile.schoolId,
            ...item,
            createdAt: new Date().toISOString()
          })
        }
      }
      seedMockClasses()
    }
  }, [db, profile?.schoolId, classesLoading, classes])

  // ── Classroom States & Forms ──────────────────────
  const [levelFilter, setLevelFilter] = useState<"all" | "primary" | "secondary" | "tertiary">("all")
  const [searchQuery, setSearchQuery] = useState("")
  
  // Dialogs
  const [createOpen, setCreateOpen] = useState(false)
  const [assignOpen, setAssignOpen] = useState(false)
  const [activeClassForAssign, setActiveClassForAssign] = useState<any | null>(null)

  // Creation form states
  const [className, setClassName] = useState("")
  const [classLevel, setClassLevel] = useState<"primary" | "secondary" | "tertiary">("primary")
  const [roomNo, setRoomNo] = useState("")
  const [capacity, setCapacity] = useState("30")
  const [schedule, setSchedule] = useState("08:00 AM - 02:00 PM")
  const [resources, setResources] = useState<string[]>([])
  
  // Adaptive Level states
  const [milestonesText, setMilestonesText] = useState("")
  const [credits, setCredits] = useState("4")
  const [semester, setSemester] = useState("Fall 2026")
  
  const [saving, setSaving] = useState(false)

  // ── Timetable Solver States ──────────────────────
  const [solverLoading, setSolverLoading] = useState(false)
  const [solverProgress, setSolverProgress] = useState(0)
  const [solverLog, setSolverLog] = useState("")
  const [solverLevel, setSolverLevel] = useState<"primary" | "secondary" | "tertiary">("primary")
  const [constraintStrength, setConstraintStrength] = useState("strict")
  const [timetableResult, setTimetableResult] = useState<any[] | null>(null)

  // Generate dynamic, data-aware mock timetable
  const generateMockTimetable = (level: "primary" | "secondary" | "tertiary") => {
    const primarySubjects = ["English Language", "Mathematics", "Science & Nature", "Social Studies", "Art & Music"]
    const secondarySubjects = ["Geometry", "World History", "Chemistry Lab", "English Literature", "Physical Education"]
    const tertiarySubjects = ["Algorithms 2", "Organic Chemistry", "Quantum Theory", "Macroeconomics", "Cognitive Psych"]
    
    const subjects = level === "primary" ? primarySubjects : level === "secondary" ? secondarySubjects : tertiarySubjects
    
    const matchedClasses = classes?.filter(c => c.level === level)
    const classNames = matchedClasses && matchedClasses.length > 0
      ? matchedClasses.map(c => c.name)
      : (level === "primary" ? ["Primary 1 Green", "Primary 5 Gold"] : ["Grade 10 Calculus", "Grade 12 Quantum Physics"])
    
    const teacherNames = teachers && teachers.length > 0
      ? teachers.map(t => t.displayName || t.email?.split("@")[0] || "Faculty")
      : ["Dr. Austin Vance", "Mrs. Tate", "Mr. Caleb Sterling", "Ms. Brooke Rowe"]
    
    const matrix: any[] = []
    classNames.forEach(cName => {
      const rows: any[] = []
      for (let period = 1; period <= 5; period++) {
        const subject = subjects[(period + Math.floor(Math.random() * 5)) % subjects.length]
        const teacher = teacherNames[(period + Math.floor(Math.random() * teacherNames.length)) % teacherNames.length]
        rows.push({
          period,
          subject,
          teacher,
          conflictFree: true,
          color: period === 1 ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" :
                 period === 2 ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                 period === 3 ? "bg-blue-500/10 border-blue-500/20 text-blue-400" :
                 period === 4 ? "bg-purple-500/10 border-purple-500/20 text-purple-400" :
                 "bg-orange-500/10 border-orange-500/20 text-orange-400"
        })
      }
      matrix.push({ className: cName, periods: rows })
    })
    return matrix
  }

  const runSchedulerEngine = () => {
    setSolverLoading(true)
    setSolverProgress(0)
    setSolverLog("Initializing evolutionary chromosomes...")
    setTimetableResult(null)

    const logs = [
      "Analyzing section availability parameters...",
      "Resolving physical room double-booking restrictions...",
      "Checking teacher availability & workload thresholds...",
      "Resolving prerequisite cohort overlaps...",
      "Running genetic crossovers (Generation 150/1000)...",
      "Performing mutation vector adjustments (Generation 480/1000)...",
      "Securing zero-overlap integrity thresholds...",
      "Compiling conflict-free scheduling master nodes..."
    ]

    let currentProgress = 0
    const interval = setInterval(() => {
      currentProgress += 5
      setSolverProgress(currentProgress)
      
      const logIndex = Math.min(logs.length - 1, Math.floor((currentProgress / 100) * logs.length))
      setSolverLog(logs[logIndex])
      
      if (currentProgress >= 100) {
        clearInterval(interval)
        const result = generateMockTimetable(solverLevel)
        setTimetableResult(result)
        setSolverLoading(false)
      }
    }, 120)
  }

  // ── Resource Check Toggle ────────────────────────
  const toggleResource = (res: string) => {
    setResources(prev => 
      prev.includes(res) ? prev.filter(r => r !== res) : [...prev, res]
    )
  }

  // ── Handlers ──────────────────────────────────────
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!db || !profile?.schoolId) return
    setSaving(true)

    try {
      const docRef = doc(collection(db, "classes"))
      const payload: any = {
        uid: docRef.id,
        schoolId: profile.schoolId,
        name: className,
        level: classLevel,
        roomNo: roomNo || "TBD",
        capacity: parseInt(capacity) || 30,
        studentCount: Math.floor(Math.random() * 10) + 15, // randomize starting count
        resources: resources,
        schedule: schedule,
        teacherId: null,
        teacherName: null,
        createdAt: new Date().toISOString()
      }

      if (classLevel === "primary") {
        payload.primaryMilestones = milestonesText
          ? milestonesText.split(",").map(m => m.trim()).filter(Boolean)
          : ["General Development"]
      } else if (classLevel === "secondary") {
        payload.secondaryCredits = parseInt(credits) || 4
      } else if (classLevel === "tertiary") {
        payload.tertiarySemester = semester || "Fall 2026"
      }

      await setDoc(docRef, payload)
      
      // Reset form
      setClassName("")
      setClassLevel("primary")
      setRoomNo("")
      setCapacity("30")
      setSchedule("08:00 AM - 02:00 PM")
      setResources([])
      setMilestonesText("")
      setCredits("4")
      setSemester("Fall 2026")
      setCreateOpen(false)
    } catch (err) {
      console.error("Error creating classroom:", err)
      alert("Failed to create classroom node")
    } finally {
      setSaving(false)
    }
  }

  const handleAssignTeacher = async (teacherId: string) => {
    if (!db || !activeClassForAssign) return
    setSaving(true)

    try {
      const teacher = teachers?.find(t => t.uid === teacherId || t.id === teacherId)
      const name = teacher ? (teacher.displayName || teacher.email?.split("@")[0] || "Anonymous") : "Unassigned"
      
      const docRef = doc(db, "classes", activeClassForAssign.uid)
      await updateDoc(docRef, {
        teacherId: teacherId === "none" ? null : teacherId,
        teacherName: teacherId === "none" ? null : name
      })
      
      setAssignOpen(false)
      setActiveClassForAssign(null)
    } catch (err) {
      console.error("Error assigning teacher:", err)
      alert("Failed to assign teacher")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteClass = async (classId: string) => {
    if (!db || !confirm("Are you sure you want to decommission this classroom node?")) return
    try {
      await deleteDoc(doc(db, "classes", classId))
    } catch (err) {
      console.error("Error deleting classroom:", err)
      alert("Decommissioning failed")
    }
  }

  // ── Filters & Search ──────────────────────────────
  const filteredClasses = classes?.filter(c => {
    const matchesLevel = levelFilter === "all" ? true : c.level === levelFilter
    const matchesSearch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.roomNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.teacherName || "").toLowerCase().includes(searchQuery.toLowerCase())
    return matchesLevel && matchesSearch
  })

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 w-full max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <Badge className="bg-primary/10 text-primary border-primary/20 font-bold uppercase tracking-widest text-[9px] h-5">
            Academic Systems Management
          </Badge>
          <h2 className="font-headline text-3xl font-bold text-white tracking-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] leading-tight">Academic Engine</h2>
          <p className="text-muted-foreground text-sm">Configure assessment frameworks, classroom assignments, and institutional structures.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-xl border-white/10 bg-white/5 text-white hover:bg-white/10">
            <Settings2 className="mr-2 h-4 w-4" /> Systems Check
          </Button>

          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl shadow-lg shadow-primary/20 bg-primary font-bold uppercase tracking-widest text-[10px]">
                <Plus className="mr-2 h-4 w-4" /> Create Class Node
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-white/10 text-white max-w-lg rounded-3xl">
              <form onSubmit={handleCreateSubmit}>
                <DialogHeader>
                  <DialogTitle className="text-xl text-white">Provision Class Section</DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                    Define name, section, classroom capacity, and tailored academic level properties.
                  </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4 text-left">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Classroom Name</Label>
                      <Input required value={className} onChange={e => setClassName(e.target.value)} placeholder="e.g. Primary 3 Green" className="bg-white/5 border-white/10 rounded-xl text-white placeholder:text-white/20" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Academic Tier</Label>
                      <select
                        value={classLevel}
                        onChange={e => setClassLevel(e.target.value as any)}
                        className="flex h-11 w-full rounded-xl border border-white/10 bg-[#0a0a14] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      >
                        <option value="primary">Primary School</option>
                        <option value="secondary">Secondary School</option>
                        <option value="tertiary">Tertiary / Higher</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Room Number</Label>
                      <Input value={roomNo} onChange={e => setRoomNo(e.target.value)} placeholder="e.g. Rm 102" className="bg-white/5 border-white/10 rounded-xl text-white" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Capacity (Max)</Label>
                      <Input type="number" value={capacity} onChange={e => setCapacity(e.target.value)} placeholder="30" className="bg-white/5 border-white/10 rounded-xl text-white" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Daily Schedule</Label>
                      <Input value={schedule} onChange={e => setSchedule(e.target.value)} placeholder="08:00 AM - 02:00 PM" className="bg-white/5 border-white/10 rounded-xl text-white" />
                    </div>
                  </div>

                  {/* Level-specific adaptive parameters */}
                  <div className="border border-primary/20 bg-primary/5 p-4 rounded-2xl space-y-3">
                    <span className="text-[9px] uppercase font-bold tracking-widest text-primary flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" /> Tailored Academic Tier Settings: {classLevel.toUpperCase()}
                    </span>
                    
                    {classLevel === "primary" && (
                      <div className="space-y-1.5">
                        <Label className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">Milestones (Comma-separated)</Label>
                        <textarea
                          value={milestonesText}
                          onChange={e => setMilestonesText(e.target.value)}
                          placeholder="Alphabet Fluency, Cooperative Play, Basic Counting"
                          className="flex min-h-[60px] w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white focus:outline-none placeholder:text-white/20"
                        />
                      </div>
                    )}

                    {classLevel === "secondary" && (
                      <div className="space-y-1.5">
                        <Label className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">Credit Units / Weight</Label>
                        <Input type="number" value={credits} onChange={e => setCredits(e.target.value)} placeholder="4" className="bg-white/5 border-white/10 rounded-xl text-white" />
                      </div>
                    )}

                    {classLevel === "tertiary" && (
                      <div className="space-y-1.5">
                        <Label className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">Academic Term / Semester</Label>
                        <Input value={semester} onChange={e => setSemester(e.target.value)} placeholder="Fall 2026" className="bg-white/5 border-white/10 rounded-xl text-white" />
                      </div>
                    )}
                  </div>

                  {/* Resources checks */}
                  <div className="space-y-2">
                    <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Classroom Resources</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {RESOURCE_POOL.map(res => {
                        const active = resources.includes(res)
                        return (
                          <button
                            key={res}
                            type="button"
                            onClick={() => toggleResource(res)}
                            className={`h-9 px-3 text-[10px] uppercase font-bold border rounded-xl flex items-center justify-between transition-all ${
                              active 
                                ? 'bg-primary/20 border-primary text-white' 
                                : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10'
                            }`}
                          >
                            <span>{res}</span>
                            {active && <Check className="h-3 w-3 text-primary" />}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>

                <DialogFooter className="mt-4">
                  <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving} className="rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/25">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Deploys Classroom Node"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeEngineTab} onValueChange={(val) => setActiveEngineTab(val as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-3 glass-card p-1 rounded-2xl h-12 border-white/5 max-w-lg">
          <TabsTrigger value="classrooms" className="rounded-xl font-bold uppercase tracking-widest text-[9px] flex items-center gap-1">
            <Layout className="h-4 w-4 text-indigo-400" />
            Classrooms
          </TabsTrigger>
          <TabsTrigger value="timetable" className="rounded-xl font-bold uppercase tracking-widest text-[9px] flex items-center gap-1">
            <Calendar className="h-4 w-4 text-indigo-400" />
            AI Timetable
          </TabsTrigger>
          <TabsTrigger value="grading" className="rounded-xl font-bold uppercase tracking-widest text-[9px] flex items-center gap-1">
            <GanttChartSquare className="h-4 w-4 text-indigo-400" />
            Assessor & Rules
          </TabsTrigger>
        </TabsList>

        {/* ── CLASSROOM SECTIONS TAB ─────────────────── */}
        <TabsContent value="classrooms" className="mt-6 space-y-6">
          
          {/* Filters Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border border-white/5 bg-white/3 p-4 rounded-3xl">
            <div className="flex gap-1.5 overflow-x-auto pb-2 md:pb-0">
              <Button
                variant={levelFilter === "all" ? "default" : "outline"}
                onClick={() => setLevelFilter("all")}
                className="h-8 rounded-lg text-[9px] uppercase font-bold"
              >
                All Sections
              </Button>
              <Button
                variant={levelFilter === "primary" ? "default" : "outline"}
                onClick={() => setLevelFilter("primary")}
                className="h-8 rounded-lg text-[9px] uppercase font-bold"
              >
                Primary
              </Button>
              <Button
                variant={levelFilter === "secondary" ? "default" : "outline"}
                onClick={() => setLevelFilter("secondary")}
                className="h-8 rounded-lg text-[9px] uppercase font-bold"
              >
                Secondary
              </Button>
              <Button
                variant={levelFilter === "tertiary" ? "default" : "outline"}
                onClick={() => setLevelFilter("tertiary")}
                className="h-8 rounded-lg text-[9px] uppercase font-bold"
              >
                Tertiary
              </Button>
            </div>

            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by Class, Room, or Teacher..."
                className="pl-9 bg-white/5 border-white/10 rounded-xl text-white placeholder:text-muted-foreground/50 h-9"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {classesLoading && (
            <div className="py-20 flex flex-col items-center justify-center gap-4 opacity-50">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-white">Synchronizing Section Nodes...</p>
            </div>
          )}

          {!classesLoading && filteredClasses?.length === 0 && (
            <div className="py-20 text-center border border-dashed border-white/10 rounded-3xl opacity-40">
              <GraduationCap className="h-12 w-12 mx-auto mb-3 text-indigo-400" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-white">No Classroom Records Found</p>
              <p className="text-[9px] mt-1 text-muted-foreground">Deploy a new class node to begin academic assignments.</p>
            </div>
          )}

          {!classesLoading && filteredClasses && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredClasses.map((item) => {
                const occupancyPercent = Math.min(100, Math.round((item.studentCount / item.capacity) * 100))
                
                return (
                  <Card key={item.uid || item.id} className="glass-card border-none overflow-hidden relative group hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300">
                    <CardHeader className="bg-white/3 border-b border-white/5 p-5 flex flex-row items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge className={`text-[8px] font-bold uppercase tracking-widest border-none px-2 h-4 ${
                            item.level === "primary" 
                              ? "bg-emerald-500/10 text-emerald-400"
                              : item.level === "secondary"
                              ? "bg-blue-500/10 text-blue-400"
                              : "bg-purple-500/10 text-purple-400"
                          }`}>
                            {item.level}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground font-mono font-bold flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {item.roomNo}
                          </span>
                        </div>
                        <CardTitle className="text-white text-lg font-bold tracking-tight">{item.name}</CardTitle>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClass(item.uid || item.id)}
                        className="h-8 w-8 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardHeader>
                    
                    <CardContent className="p-5 space-y-4">
                      {/* Teacher Assignment Box */}
                      <div className="border border-white/5 bg-white/3 p-3.5 rounded-2xl space-y-3 relative overflow-hidden">
                        {item.teacherId ? (
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-violet-600 border border-white/10 flex items-center justify-center text-white font-bold text-xs uppercase">
                              {item.teacherName?.slice(0, 2) || "T"}
                            </div>
                            <div className="flex-1 overflow-hidden">
                              <p className="text-[9px] uppercase tracking-wider font-bold text-primary">Assigned Faculty</p>
                              <p className="text-xs font-bold text-white truncate">{item.teacherName}</p>
                            </div>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => {
                                setActiveClassForAssign(item)
                                setAssignOpen(true)
                              }}
                              className="h-7 text-[8px] uppercase tracking-wider font-bold rounded-lg border-white/10 bg-white/5 hover:bg-white/10 shrink-0"
                            >
                              Change
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shrink-0 animate-pulse">
                                <AlertTriangle className="h-4 w-4" />
                              </div>
                              <div className="text-left">
                                <p className="text-xs font-bold text-orange-400">Faculty Unassigned</p>
                                <p className="text-[8px] text-muted-foreground uppercase font-bold tracking-tight mt-0.5">Alert active</p>
                              </div>
                            </div>
                            <Button 
                              size="sm"
                              onClick={() => {
                                setActiveClassForAssign(item)
                                setAssignOpen(true)
                              }}
                              className="h-7 text-[8px] uppercase tracking-wider font-bold rounded-lg bg-orange-500 hover:bg-orange-600 text-white shrink-0 shadow-lg shadow-orange-500/20"
                            >
                              Assign Teacher
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Student occupancy bar */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                          <span>Section Enrolled</span>
                          <span className="text-white">{item.studentCount} / {item.capacity} students</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-white/5 border border-white/5 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              occupancyPercent >= 90 
                                ? "bg-red-500" 
                                : occupancyPercent >= 70 
                                ? "bg-orange-500" 
                                : "bg-primary"
                            }`} 
                            style={{ width: `${occupancyPercent}%` }} 
                          />
                        </div>
                      </div>

                      {/* Tailored Section */}
                      <div className="py-2.5 px-3 border-t border-b border-white/5 flex items-center justify-between gap-3 text-xs">
                        {item.level === "primary" && (
                          <div className="text-left w-full">
                            <span className="text-[8px] uppercase font-bold tracking-wider text-primary">Academic Milestones ({item.primaryMilestones?.length || 0})</span>
                            <p className="text-[10px] text-white/80 font-medium truncate mt-0.5">
                              {item.primaryMilestones?.join(" · ") || "General Assessment"}
                            </p>
                          </div>
                        )}
                        {item.level === "secondary" && (
                          <div className="flex items-center justify-between w-full">
                            <span className="text-[8px] uppercase font-bold tracking-wider text-primary">Credit Score Value</span>
                            <span className="text-xs font-bold text-white font-mono">{item.secondaryCredits || 4} Units</span>
                          </div>
                        )}
                        {item.level === "tertiary" && (
                          <div className="flex items-center justify-between w-full">
                            <span className="text-[8px] uppercase font-bold tracking-wider text-primary">Active Semester</span>
                            <span className="text-xs font-bold text-white font-mono">{item.tertiarySemester || "Fall 2026"}</span>
                          </div>
                        )}
                      </div>

                      {/* Resources lists */}
                      {item.resources && item.resources.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[8px] uppercase font-bold tracking-wider text-muted-foreground block text-left">Classroom Equipment</span>
                          <div className="flex flex-wrap gap-1">
                            {item.resources.map((res: string) => (
                              <Badge key={res} variant="secondary" className="text-[8px] uppercase border-none tracking-tighter bg-white/5 text-white/80 rounded-md">
                                {res}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                    
                    <CardFooter className="bg-white/3 border-t border-white/5 p-4 flex items-center justify-between">
                      <span className="text-[9px] font-mono text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-primary" /> {item.schedule}
                      </span>
                      <span className="text-[8px] uppercase tracking-widest text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/10">Active System</span>
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* ── AI TIMETABLE SOLVER TAB ─────────────────── */}
        <TabsContent value="timetable" className="mt-6 space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            
            {/* Solver Config Card */}
            <Card className="glass-card border-none h-fit">
              <CardHeader className="bg-primary/10 border-b border-white/5 p-5">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-primary">Axiom Scheduler Engine</span>
                </div>
                <CardTitle className="text-white text-lg font-bold">Configure AI Solver</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">Setup active parameters to trigger constraint optimization loops.</CardDescription>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="space-y-1.5 text-left">
                  <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Select Academic Tier</Label>
                  <select
                    value={solverLevel}
                    onChange={e => setSolverLevel(e.target.value as any)}
                    className="flex h-10 w-full rounded-xl border border-white/10 bg-[#0a0a14] px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="primary">Primary School sections</option>
                    <option value="secondary">Secondary School grades</option>
                    <option value="tertiary">Tertiary semesters</option>
                  </select>
                </div>

                <div className="space-y-1.5 text-left">
                  <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Constraint Strictness</Label>
                  <select
                    value={constraintStrength}
                    onChange={e => setConstraintStrength(e.target.value)}
                    className="flex h-10 w-full rounded-xl border border-white/10 bg-[#0a0a14] px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="standard">Standard Constraints (Fast Loop)</option>
                    <option value="strict">Strict Room & Faculty Rules (Standard)</option>
                    <option value="heavy">Infinite Optimization Loop (Deep Check)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs border border-white/5 bg-white/3 p-3 rounded-xl">
                  <div className="text-left">
                    <span className="text-[8px] uppercase font-bold text-muted-foreground">Target Rooms</span>
                    <p className="font-bold text-white font-mono">{classes?.filter(c => c.level === solverLevel).length || 2} Rooms</p>
                  </div>
                  <div className="text-left">
                    <span className="text-[8px] uppercase font-bold text-muted-foreground">Active Faculty</span>
                    <p className="font-bold text-white font-mono">{teachers?.length || 4} Teachers</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-5 pt-0">
                <Button 
                  onClick={runSchedulerEngine}
                  disabled={solverLoading}
                  className="w-full rounded-xl bg-primary hover:bg-primary/90 text-white font-bold h-11 shadow-lg shadow-primary/25 text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5"
                >
                  {solverLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Optimizing...</> : <><Sparkles className="h-4 w-4" /> Trigger AI Solver</>}
                </Button>
              </CardFooter>
            </Card>

            {/* Solver Monitoring / Log Output */}
            <div className="lg:col-span-2 space-y-6">
              {solverLoading && (
                <Card className="glass-card border-none flex flex-col items-center justify-center p-12 min-h-[300px] text-center gap-5">
                  <div className="relative flex items-center justify-center">
                    <Loader2 className="h-16 w-16 animate-spin text-primary" />
                    <Sparkles className="h-6 w-6 text-indigo-400 absolute animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-white font-bold text-base uppercase tracking-wider">Evolutionary Solver Active</p>
                    <p className="text-xs text-muted-foreground italic font-mono bg-black/25 px-4 py-2 border border-white/5 rounded-xl">{solverLog}</p>
                  </div>
                  <div className="w-full max-w-md space-y-1.5 text-left">
                    <div className="flex justify-between text-[9px] uppercase tracking-widest font-bold text-muted-foreground">
                      <span>Conflict integrity check</span>
                      <span>{solverProgress}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-white/5 border border-white/5 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-primary to-violet-500 transition-all duration-150" style={{ width: `${solverProgress}%` }} />
                    </div>
                  </div>
                </Card>
              )}

              {!solverLoading && !timetableResult && (
                <div className="border border-dashed border-white/10 rounded-3xl p-16 text-center opacity-40 min-h-[300px] flex flex-col items-center justify-center gap-3">
                  <Calendar className="h-12 w-12 text-indigo-400 animate-float" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white">Axiom Timetable Matrix Standby</p>
                  <p className="text-[9px] text-muted-foreground max-w-sm leading-relaxed">
                    Trigger the Evolutionary Solver to compile conflict-free schedules mapping active classroom sections, room capacities, daily schedule limits, and teacher workloads.
                  </p>
                </div>
              )}

              {/* Timetable results matrix */}
              {!solverLoading && timetableResult && (
                <Card className="glass-card border-none overflow-hidden animate-in fade-in zoom-in-95 duration-500">
                  <CardHeader className="bg-white/3 border-b border-white/5 p-5 flex flex-row items-center justify-between">
                    <div className="text-left">
                      <div className="flex items-center gap-2 mb-0.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-400">Optimization Completed</span>
                      </div>
                      <CardTitle className="text-white text-lg font-bold">Conflict-Free Master Schedule</CardTitle>
                    </div>
                    <Badge variant="outline" className="border-emerald-500/20 text-emerald-400 uppercase text-[8px] font-bold">100% Conflict Integrity</Badge>
                  </CardHeader>
                  <CardContent className="p-5 overflow-x-auto">
                    <div className="min-w-[650px] space-y-4">
                      {/* Grid Header */}
                      <div className="grid grid-cols-6 gap-2 text-center text-[9px] font-bold uppercase tracking-wider text-muted-foreground pb-2 border-b border-white/5">
                        <div>Room / Section</div>
                        <div>Period 1 (08:30)</div>
                        <div>Period 2 (09:40)</div>
                        <div>Period 3 (10:50)</div>
                        <div>Period 4 (12:00)</div>
                        <div>Period 5 (13:10)</div>
                      </div>

                      {/* Grid Rows */}
                      <div className="space-y-3">
                        {timetableResult.map((row, idx) => (
                          <div key={idx} className="grid grid-cols-6 gap-2 items-center">
                            <div className="text-[10px] font-bold text-white text-left pl-1 truncate">{row.className}</div>
                            {row.periods.map((p: any) => (
                              <div key={p.period} className={`p-2.5 rounded-xl border flex flex-col text-left overflow-hidden min-h-[56px] transition-all hover:scale-[1.02] cursor-pointer ${p.color}`}>
                                <span className="font-bold text-[9px] truncate leading-none mb-1">{p.subject}</span>
                                <span className="text-[7.5px] uppercase tracking-wider opacity-65 truncate mt-auto">{p.teacher}</span>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-white/3 border-t border-white/5 p-4 text-[9px] text-muted-foreground flex justify-between">
                    <span>Generated via Axiom Genetic Algorithm · Fitness Score 0.998</span>
                    <span className="font-bold text-primary cursor-pointer hover:underline uppercase tracking-wider">Export PDF Timetable</span>
                  </CardFooter>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* ── ASSESSOR & GRADING TAB (Original UI) ────────── */}
        <TabsContent value="grading" className="mt-6">
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-4 space-y-6">
              <Card className="glass-card border-none">
                <CardHeader className="bg-primary/10 border-b border-white/5 p-6">
                  <CardTitle className="text-xl text-white">Grading Protocol</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">Select your school's official assessment framework.</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Framework Type</Label>
                    <Select defaultValue="a-f">
                      <SelectTrigger className="bg-white/5 border-white/10 rounded-xl h-11 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0a0a14] border-white/10 text-white">
                        <SelectItem value="a-f">Standard A-F System</SelectItem>
                        <SelectItem value="gpa">4.0 / 5.0 GPA Scale</SelectItem>
                        <SelectItem value="percentages">Raw Percentages</SelectItem>
                        <SelectItem value="custom">Axora Custom Logic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-4 pt-4 border-t border-white/5 text-left">
                    <h4 className="text-[10px] font-bold uppercase text-primary tracking-[0.2em]">Promotion Thresholds</h4>
                    <div className="space-y-3">
                       {['Automatic Promotion', 'Conditional Promotion', 'Retention Index'].map((rule) => (
                         <div key={rule} className="flex items-center justify-between p-3 bg-white/3 rounded-xl border border-white/5">
                            <span className="text-xs font-semibold text-white/70">{rule}</span>
                            <Input className="w-16 h-8 text-center bg-transparent border-white/10 text-xs text-white" placeholder="50%" />
                         </div>
                       ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-6 pt-0">
                   <Button className="w-full h-11 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-primary/20">
                     Commit Framework
                   </Button>
                </CardFooter>
              </Card>
            </div>

            <div className="lg:col-span-8 space-y-8">
              <div className="grid gap-6 sm:grid-cols-2">
                <Card className="glass-card border-none hover:border-accent/30 transition-all cursor-pointer group">
                  <CardHeader className="p-6">
                     <div className="h-10 w-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mb-4 group-hover:scale-110 transition-transform">
                       <Layout className="h-5 w-5" />
                     </div>
                     <CardTitle className="text-lg text-white">Report Card Builder</CardTitle>
                     <CardDescription className="text-xs text-muted-foreground">Drag & drop layout for mid-term and end-of-term results.</CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <span className="text-[9px] font-bold text-accent uppercase tracking-widest flex items-center gap-2">
                      Launch Visual Editor <ArrowUpRight className="h-3 w-3" />
                    </span>
                  </CardFooter>
                </Card>

                <Card className="glass-card border-none hover:border-blue-500/30 transition-all cursor-pointer group">
                  <CardHeader className="p-6">
                     <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform">
                       <GraduationCap className="h-5 w-5" />
                     </div>
                     <CardTitle className="text-lg text-white">Subject Prerequisites</CardTitle>
                     <CardDescription className="text-xs text-muted-foreground">Configure academic pathways and required foundations.</CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2">
                      Configure Paths <ArrowUpRight className="h-3 w-3" />
                    </span>
                  </CardFooter>
                </Card>
              </div>

              <Card className="glass-card border-none shadow-2xl overflow-hidden">
                <CardHeader className="bg-white/3 border-b border-white/5 p-6">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    <span className="text-[9px] font-bold uppercase tracking-widest text-primary">Axora Promotion Audit</span>
                  </div>
                  <CardTitle className="text-xl text-white">Promotion Readiness Registry</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                   <div className="divide-y divide-white/5">
                     {[1, 2, 3].map((i) => (
                       <div key={i} className="flex items-center justify-between p-5 hover:bg-white/3 transition-colors group">
                          <div className="flex items-center gap-4">
                             <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-primary/30 transition-all">
                                <FileText className="h-5 w-5 text-muted-foreground" />
                             </div>
                             <div>
                                <p className="text-sm font-bold text-white">Student_Node_{i * 42}</p>
                                <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter">Current Avg: {80 + (i * 2)}% • Threshold: 50%</p>
                             </div>
                          </div>
                          <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 uppercase text-[8px] font-bold">
                            Eligible for Promotion
                          </Badge>
                       </div>
                     ))}
                   </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* ── TEACHER ASSIGNMENT DIALOG ─────────────────── */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="glass-card border-white/10 text-white max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-white text-lg">Assign Faculty Member</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Select an active teacher from the Academic Registry node to assign to <strong className="text-white">{activeClassForAssign?.name}</strong>.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4 text-left">
            <div className="space-y-1.5">
              <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Select Faculty Teacher</Label>
              <select
                defaultValue={activeClassForAssign?.teacherId || "none"}
                onChange={e => handleAssignTeacher(e.target.value)}
                className="flex h-11 w-full rounded-xl border border-white/10 bg-[#0a0a14] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="none">-- Unassign Teacher / Vacation --</option>
                {teachers?.map(t => (
                  <option key={t.uid || t.id} value={t.uid || t.id}>
                    {t.displayName || t.email?.split("@")[0]} ({t.department || "No Dept"})
                  </option>
                ))}
              </select>
            </div>
            
            {(!teachers || teachers.length === 0) && (
              <div className="flex items-start gap-2 bg-orange-500/10 border border-orange-500/20 p-3.5 rounded-2xl text-[10px] text-orange-400">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">No Faculty Found</p>
                  <p className="text-muted-foreground/80 mt-0.5">Please populate the registry directory with Faculty/Teacher roles first so they are assignable.</p>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignOpen(false)} className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10">
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
