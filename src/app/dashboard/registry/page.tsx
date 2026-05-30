"use client"

import { useState, useRef, useEffect } from "react"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Search, Plus, Filter, MoreHorizontal, User, Loader2,
  Camera, Upload, Trash, Briefcase, GraduationCap, RefreshCw, Check,
  Sparkles, FileText, CheckCircle, Info
} from "lucide-react"
import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc } from "@/firebase"
import { collection, query, where, doc, setDoc } from "firebase/firestore"
import { initializeApp, getApps, deleteApp } from "firebase/app"
import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth"
import { firebaseConfig } from "@/firebase/config"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"

// ── Auth & Password Helpers ──────────────────────────────────────────────────
const generatePassword = () => {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%"
  let pass = "Axora@"
  for (let i = 0; i < 8; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return pass
}

async function createAuthUser(email: string, password: string): Promise<string> {
  const appName = `temp-auth-app-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  const tempApp = initializeApp(firebaseConfig, appName);
  const tempAuth = getAuth(tempApp);
  try {
    const userCredential = await createUserWithEmailAndPassword(tempAuth, email, password);
    const uid = userCredential.user.uid;
    await signOut(tempAuth);
    return uid;
  } finally {
    await deleteApp(tempApp);
  }
}

export default function StudentRegistryPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeRegistryTab, setActiveRegistryTab] = useState<"student" | "teacher">("student")
  const db = useFirestore()
  const { user } = useUser()
  const { data: profile } = useDoc(user ? `users/${user.uid}` : null)
  const { data: schoolDoc } = useDoc(profile?.schoolId ? `schools/${profile.schoolId}` : null)

  // Queries
  const studentsQuery = useMemoFirebase(() => {
    if (!db || !profile?.schoolId) return null
    return query(
      collection(db, "users"),
      where("role", "==", "student"),
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

  const { data: students, loading: studentsLoading } = useCollection(studentsQuery)
  const { data: teachers, loading: teachersLoading } = useCollection(teachersQuery)

  const currentList = activeRegistryTab === "student" ? students : teachers
  const loading = activeRegistryTab === "student" ? studentsLoading : teachersLoading

  const filteredItems = currentList?.filter(s => 
    (s.displayName || "Anonymous").toLowerCase().includes(searchTerm.toLowerCase()) || 
    (s.uid || s.id)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Enrollment Form States
  const [enrollOpen, setEnrollOpen] = useState(false)
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [major, setMajor] = useState("")
  const [department, setDepartment] = useState("")
  const [gpa, setGpa] = useState("4.0")
  const [salary, setSalary] = useState("4000")
  const [status, setStatus] = useState("Active")
  const [enrolling, setEnrolling] = useState(false)
  const [password, setPassword] = useState("")
  const [generatedCredentials, setGeneratedCredentials] = useState<{ displayName: string; email: string; password: string; role: string }[]>([])
  const [showCredentialsDialog, setShowCredentialsDialog] = useState(false)

  // Pre-generate password when modal opens
  useEffect(() => {
    if (enrollOpen) {
      setPassword(generatePassword())
    }
  }, [enrollOpen])

  // Webcam Capture States
  const [webcamActive, setWebcamActive] = useState(false)
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  // ── Automation & Bulk States ──────────────────────
  const [nlpText, setNlpText] = useState("")
  const [parsedNlpList, setParsedNlpList] = useState<{ displayName: string; email: string; field: string; metric: string }[]>([])
  const [parsedCsvList, setParsedCsvList] = useState<{ displayName: string; email: string; field: string; metric: string }[]>([])
  const [bulkStatus, setBulkStatus] = useState<string | null>(null)

  // Smart RegEx parser for Natural Language Text
  const parseNlpInput = (text: string) => {
    setNlpText(text)
    const lines = text.split("\n")
    const list: any[] = []
    lines.forEach(line => {
      if (!line.trim()) return
      
      const emailMatch = line.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)
      const email = emailMatch ? emailMatch[0] : ""
      
      let cleanLine = line
      if (email) cleanLine = line.replace(email, "")
      
      const parts = cleanLine.split(/[,;\t|:-]/).map(p => p.trim()).filter(Boolean)
      
      if (parts.length > 0) {
        const displayName = parts[0]
        
        let metric = activeRegistryTab === "student" ? "4.0" : "4000"
        let field = activeRegistryTab === "student" ? "Computer Science" : "Mathematics"
        
        parts.slice(1).forEach(part => {
          if (!isNaN(parseFloat(part))) {
            const num = parseFloat(part)
            if (activeRegistryTab === "student" && num <= 4.0) {
              metric = num.toFixed(1)
            } else if (activeRegistryTab === "teacher" && num >= 1000) {
              metric = num.toString()
            }
          } else if (part.length > 3) {
            field = part
          }
        })
        
        if (displayName && email) {
          list.push({ displayName, email, field, metric })
        }
      }
    })
    setParsedNlpList(list)
  }

  // Handle CSV upload
  const handleCsvFileParse = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const text = event.target?.result as string
        if (text) {
          const lines = text.split("\n")
          const list: any[] = []
          lines.forEach((line, idx) => {
            if (idx === 0 && line.toLowerCase().includes("name")) return // skip header
            if (!line.trim()) return
            const parts = line.split(/[,;\t|]/).map(p => p.trim())
            if (parts.length >= 2) {
              list.push({
                displayName: parts[0].replace(/^["']|["']$/g, ''),
                email: parts[1].replace(/^["']|["']$/g, ''),
                field: (parts[2] || "").replace(/^["']|["']$/g, '') || (activeRegistryTab === "student" ? "General Studies" : "General Science"),
                metric: (parts[3] || "").replace(/^["']|["']$/g, '') || (activeRegistryTab === "student" ? "4.0" : "4000")
              })
            }
          })
          setParsedCsvList(list)
        }
      }
      reader.readAsText(file)
    }
  }

  // Generate Demo Profiles
  const triggerDemoGeneration = (type: "student" | "teacher") => {
    const firstNames = ["Austin", "Brooke", "Caleb", "Daphne", "Ethan", "Fiona", "Gabriel", "Haley", "Ian", "Julianna"]
    const lastNames = ["Vance", "Mercer", "Sterling", "Kemp", "Doyle", "Benton", "Rowe", "Garrison", "Sinclair", "Tate"]
    const majors = ["Cybersecurity", "Data Science", "Artificial Intelligence", "Bioengineering", "Quantum Physics", "Global Finance"]
    const depts = ["Advanced AI Division", "Cyber Security Dept", "Quantum Lab", "Macroeconomics Center", "Gene Therapeutics Division"]
    
    const list: any[] = []
    for (let i = 0; i < 5; i++) {
      const fn = firstNames[Math.floor(Math.random() * firstNames.length)]
      const ln = lastNames[Math.floor(Math.random() * lastNames.length)]
      const displayName = `${fn} ${ln}`
      const email = `${fn.toLowerCase()}.${ln.toLowerCase()}@scholai.edu`
      const field = type === "student" ? majors[Math.floor(Math.random() * majors.length)] : depts[Math.floor(Math.random() * depts.length)]
      const metric = type === "student" ? (3.2 + Math.random() * 0.8).toFixed(2) : (4500 + Math.floor(Math.random() * 2500)).toString()
      list.push({ displayName, email, field, metric })
    }
    
    setParsedNlpList(list)
    return list
  }

  // Bulk enrollment submission
  const executeBulkEnrollment = async (items: { displayName: string; email: string; field: string; metric: string }[], isDemo: boolean = false) => {
    if (!profile?.schoolId || !db || items.length === 0) return
    setEnrolling(true)
    setBulkStatus(`Enrolling ${items.length} records...`)
    
    const creds: typeof generatedCredentials = []
    
    try {
      let count = 0
      for (const item of items) {
        const pass = isDemo ? "Demo@12345" : generatePassword()
        setBulkStatus(`Creating Auth account for ${item.displayName}...`)
        const authUid = await createAuthUser(item.email, pass)
        
        const docRef = doc(db, "users", authUid)
        const payload: any = {
          uid: authUid,
          displayName: item.displayName,
          email: item.email,
          role: activeRegistryTab,
          status: "Active",
          schoolId: profile.schoolId,
          imageUrl: null,
          createdAt: new Date().toISOString()
        }
        
        if (activeRegistryTab === "student") {
          payload.major = item.field
          payload.gpa = parseFloat(item.metric) || 4.0
        } else {
          payload.department = item.field
          payload.salary = parseFloat(item.metric) || 4000.0
        }
        
        await setDoc(docRef, payload)
        
        creds.push({
          displayName: item.displayName,
          email: item.email,
          password: pass,
          role: activeRegistryTab
        })
        
        count++
        setBulkStatus(`Successfully enrolled ${count}/${items.length}...`)
      }
      
      setGeneratedCredentials(creds)
      setBulkStatus("Done!")
      setTimeout(() => {
        setBulkStatus(null)
        setNlpText("")
        setParsedNlpList([])
        setParsedCsvList([])
        setEnrollOpen(false)
        setShowCredentialsDialog(true)
      }, 1000)
    } catch (err: any) {
      console.error("Error with bulk enrollment:", err)
      alert(err?.message || "Failed during bulk enrollment process.")
    } finally {
      setEnrolling(false)
    }
  }


  const startWebcam = async () => {
    setWebcamActive(true)
    setCapturedPhoto(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (err) {
      console.error("Error accessing webcam:", err)
      alert("Could not access camera. Please check permissions or upload a file.")
      setWebcamActive(false)
    }
  }

  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
    setWebcamActive(false)
  }

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas")
      canvas.width = 320
      canvas.height = 240
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, 320, 240)
        const dataUrl = canvas.toDataURL("image/jpeg")
        setCapturedPhoto(dataUrl)
        stopWebcam()
      }
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setCapturedPhoto(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile?.schoolId || !db) return
    setEnrolling(true)

    try {
      // 1. Create account in Firebase Auth
      const authUid = await createAuthUser(email, password)

      // 2. Save user document in Firestore with the authUid as the document ID
      const docRef = doc(db, "users", authUid)
      const payload: any = {
        uid: authUid,
        displayName: fullName,
        email: email,
        role: activeRegistryTab,
        status: status,
        schoolId: profile.schoolId,
        imageUrl: capturedPhoto || null,
        createdAt: new Date().toISOString()
      }

      if (activeRegistryTab === "student") {
        payload.major = major || "Undeclared"
        payload.gpa = parseFloat(gpa) || 4.0
      } else {
        payload.department = department || "General Science"
        payload.salary = parseFloat(salary) || 4000.0
      }

      await setDoc(docRef, payload)
      
      setGeneratedCredentials([{
        displayName: fullName,
        email: email,
        password: password,
        role: activeRegistryTab
      }])
      
      // Reset form states
      setFullName("")
      setEmail("")
      setMajor("")
      setDepartment("")
      setGpa("4.0")
      setSalary("4000")
      setStatus("Active")
      setCapturedPhoto(null)
      setEnrollOpen(false)
      setShowCredentialsDialog(true)
    } catch (err: any) {
      console.error("Error enrolling member:", err)
      alert(err?.message || "Failed to enroll member")
    } finally {
      setEnrolling(false)
    }
  }

  // Cleanup webcam stream on unmount or modal close
  useEffect(() => {
    if (!enrollOpen) {
      stopWebcam()
    }
  }, [enrollOpen])

  const downloadCredentialsCsv = () => {
    if (generatedCredentials.length === 0) return
    const headers = "Name,Email,Password,Role\n"
    const rows = generatedCredentials.map(c => 
      `"${c.displayName}","${c.email}","${c.password}","${c.role}"`
    ).join("\n")
    
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `axora-credentials-${activeRegistryTab}-${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const copyAllCredentials = () => {
    if (generatedCredentials.length === 0) return
    const text = generatedCredentials.map(c => 
      `Name: ${c.displayName}\nEmail: ${c.email}\nPassword: ${c.password}\nRole: ${c.role}\n-------------------------`
    ).join("\n")
    navigator.clipboard.writeText(text)
    alert("All credentials copied to clipboard!")
  }

  const triggerMailTo = (name: string, email: string, pass: string, role: string) => {
    const schoolName = schoolDoc?.name || profile?.schoolId || "Your Institution"
    const schoolShortName = schoolDoc?.shortName || schoolName
    const schoolMotto = schoolDoc?.motto ? `"${schoolDoc.motto}"` : ""
    const schoolEmail = schoolDoc?.contact?.officialEmail || ""
    const schoolCity = schoolDoc?.location?.city || ""
    const schoolCountry = schoolDoc?.location?.country || ""
    const schoolLocation = [schoolCity, schoolCountry].filter(Boolean).join(", ")
    const roleLabel = role === "student" ? "Student" : "Faculty Member"
    const portalUrl = window.location.origin + "/login"

    const subject = encodeURIComponent(
      `${schoolName} — Your Portal Access Credentials`
    )

    const body = encodeURIComponent(
      `Dear ${name},\n\n` +
      `On behalf of the administration and faculty of ${schoolName}${schoolLocation ? ` (${schoolLocation})` : ""}, we are pleased to extend you a formal welcome as a new ${roleLabel} in our institution.\n\n` +
      (schoolMotto ? `${schoolMotto}\n\n` : "") +
      `As part of your onboarding, your institutional portal account has been created. ` +
      `Please use the login credentials below to access your personalised ${roleLabel.toLowerCase()} dashboard:\n\n` +
      `────────────────────────────────\n` +
      `  PORTAL ACCESS DETAILS\n` +
      `────────────────────────────────\n` +
      `  Portal:    ${portalUrl}\n` +
      `  Email:     ${email}\n` +
      `  Password:  ${pass}\n` +
      `  Role:      ${roleLabel}\n` +
      `────────────────────────────────\n\n` +
      `For security purposes, you are advised to update your password upon your first sign-in via Profile Settings.\n\n` +
      `Should you experience any difficulty accessing your account, please contact the Academic Office` +
      (schoolEmail ? ` at ${schoolEmail}` : "") + ` and we will assist you promptly.\n\n` +
      `We look forward to a productive and enriching academic journey with you.\n\n` +
      `Yours faithfully,\n` +
      `Office of Academic Administration\n` +
      `${schoolName}\n` +
      (schoolLocation ? `${schoolLocation}\n` : "") +
      `\n` +
      `─────────────────────────────────────────────────\n` +
      `This communication was generated securely via Axora OS — Institutional Intelligence Infrastructure.\n` +
      `Axora OS is the academic management system powering ${schoolShortName}'s portal operations.\n` +
      `─────────────────────────────────────────────────`
    )

    // Log to audit outbox in Firestore
    if (db) {
      import("firebase/firestore").then(({ collection, addDoc }) => {
        addDoc(collection(db, "outbox"), {
          to: email,
          recipientName: name,
          subject: `${schoolName} — Your Portal Access Credentials`,
          role: role,
          schoolId: profile?.schoolId,
          status: "Sent",
          sentAt: new Date().toISOString()
        }).catch(err => console.error("Error logging to outbox:", err))
      })
    }

    // Open local email client
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-headline text-3xl font-bold text-white tracking-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.45)]">Academic Registry</h2>
          <p className="text-muted-foreground">Centralized record management for student and teacher enrollment records.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex gap-2 rounded-xl border-white/10 bg-white/5 hover:bg-white/10">
            <Filter className="h-4 w-4 text-indigo-400" />
            Filters
          </Button>

          <Dialog open={enrollOpen} onOpenChange={setEnrollOpen}>
            <DialogTrigger asChild>
              <Button className="flex gap-2 rounded-xl shadow-lg shadow-primary/20">
                <Plus className="h-4 w-4" />
                Enroll {activeRegistryTab === "student" ? "Student" : "Faculty"}
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-white/10 text-white max-w-2xl rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-xl text-white">Enroll {activeRegistryTab === "student" ? "New Student" : "New Faculty Member"}</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Select an enrollment method below. Register individually or use the automated batch wizards.
                </DialogDescription>
              </DialogHeader>

              {bulkStatus && (
                <div className="bg-primary/10 border border-primary/20 text-white text-xs font-bold uppercase tracking-wider rounded-xl p-4 text-center animate-pulse">
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin inline" />
                  {bulkStatus}
                </div>
              )}

              {!bulkStatus && (
                <Tabs defaultValue="single" className="w-full">
                  <TabsList className="grid w-full grid-cols-4 bg-white/5 p-1 rounded-xl h-10 border border-white/10 mb-4">
                    <TabsTrigger value="single" className="rounded-lg font-bold text-[10px] uppercase">Single</TabsTrigger>
                    <TabsTrigger value="nlp" className="rounded-lg font-bold text-[10px] uppercase">AI Smart Paste</TabsTrigger>
                    <TabsTrigger value="csv" className="rounded-lg font-bold text-[10px] uppercase">CSV Batch</TabsTrigger>
                    <TabsTrigger value="demo" className="rounded-lg font-bold text-[10px] uppercase">Demo Generator</TabsTrigger>
                  </TabsList>

                  {/* ── Single Enrollment ────────────────── */}
                  <TabsContent value="single">
                    <form onSubmit={handleEnrollSubmit}>
                      <div className="py-2 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Full Name</label>
                            <Input required value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Jane Doe" className="bg-white/5 border-white/10 rounded-xl text-white" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Email Address</label>
                            <Input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jane@scholai.edu" className="bg-white/5 border-white/10 rounded-xl text-white" />
                          </div>
                        </div>

                        {activeRegistryTab === "student" ? (
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Major / Concentration</label>
                              <Input required value={major} onChange={e => setMajor(e.target.value)} placeholder="Computer Science" className="bg-white/5 border-white/10 rounded-xl text-white" />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">GPA (Starting)</label>
                              <Input type="number" step="0.1" min="0.0" max="4.0" value={gpa} onChange={e => setGpa(e.target.value)} placeholder="4.0" className="bg-white/5 border-white/10 rounded-xl text-white" />
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Department</label>
                              <Input required value={department} onChange={e => setDepartment(e.target.value)} placeholder="Mathematics" className="bg-white/5 border-white/10 rounded-xl text-white" />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Monthly Salary ($)</label>
                              <Input type="number" value={salary} onChange={e => setSalary(e.target.value)} placeholder="4500" className="bg-white/5 border-white/10 rounded-xl text-white" />
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Login Password</label>
                            <Input required value={password} onChange={e => setPassword(e.target.value)} placeholder="Auto-generated secure password" className="bg-white/5 border-white/10 rounded-xl text-white font-mono text-xs" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Status</label>
                            <select
                              value={status}
                              onChange={e => setStatus(e.target.value)}
                              className="flex h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            >
                              <option value="Active" className="bg-slate-900">Active</option>
                              <option value="On Leave" className="bg-slate-900">On Leave</option>
                            </select>
                          </div>
                        </div>

                        {/* Biometric webcam photo snapper & upload */}
                        <div className="border border-white/5 bg-white/3 p-4 rounded-2xl space-y-3">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-primary">Biometric Face Enrollment Template</span>
                          <div className="flex flex-col items-center justify-center border border-dashed border-white/10 rounded-xl p-3 min-h-[160px] bg-black/20">
                            {webcamActive ? (
                              <div className="relative flex flex-col items-center gap-2">
                                <video ref={videoRef} autoPlay playsInline className="h-40 w-52 rounded-xl object-cover border border-white/10" />
                                <Button type="button" onClick={capturePhoto} className="h-8 rounded-lg bg-primary hover:bg-primary/80 text-[10px] px-3">
                                  Take Snaphshot
                                </Button>
                              </div>
                            ) : capturedPhoto ? (
                              <div className="relative flex flex-col items-center gap-2">
                                <img src={capturedPhoto} alt="Captured preview" className="h-40 w-52 rounded-xl object-cover border border-white/10" />
                                <div className="flex gap-2">
                                  <Button type="button" variant="outline" onClick={startWebcam} className="h-8 rounded-lg border-white/10 bg-white/5 hover:bg-white/10 text-[10px] px-3">
                                    Retake Photo
                                  </Button>
                                  <Button type="button" variant="ghost" onClick={() => setCapturedPhoto(null)} className="h-8 rounded-lg text-red-400 hover:text-red-300 text-[10px] px-3">
                                    Remove
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-3 text-center">
                                <Camera className="h-8 w-8 text-muted-foreground/50 animate-pulse" />
                                <p className="text-[10px] text-muted-foreground max-w-xs leading-relaxed">
                                  Upload a JPG/PNG snapshot or capture live biometric face template photo.
                                </p>
                                <div className="flex gap-2">
                                  <Button type="button" onClick={startWebcam} className="h-8 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-[10px] px-3 flex items-center gap-1.5">
                                    <Camera className="h-3.5 w-3.5" /> Start Live Cam
                                  </Button>
                                  <label className="h-8 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-[10px] px-3 flex items-center gap-1.5 cursor-pointer justify-center">
                                    <Upload className="h-3.5 w-3.5" /> Upload File
                                    <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                                  </label>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <DialogFooter className="mt-4">
                        <Button type="button" variant="outline" onClick={() => setEnrollOpen(false)} className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10">
                          Cancel
                        </Button>
                        <Button type="submit" disabled={enrolling} className="rounded-xl shadow-lg shadow-primary/20">
                          {enrolling ? <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Enrolling...</> : "Complete Enrollment"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </TabsContent>

                  {/* ── AI NLP Smart Paste ──────────────── */}
                  <TabsContent value="nlp" className="space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Paste Unstructured Text block</label>
                        <Badge variant="outline" className="text-[8px] border-primary/30 text-primary uppercase font-bold">AI Smart Parser</Badge>
                      </div>
                      <textarea
                        value={nlpText}
                        onChange={e => parseNlpInput(e.target.value)}
                        placeholder={`Example:\nJane Smith - jane.smith@scholai.edu - ${activeRegistryTab === "student" ? "Computer Science - 3.8" : "Chemistry Dept - 4800"}\nRobert Miller, rob.m@scholai.edu, ${activeRegistryTab === "student" ? "Quantum Physics major, GPA 4.0" : "Mathematics Professor, salary 5000"}`}
                        className="flex min-h-[100px] w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 placeholder:text-muted-foreground/50"
                      />
                    </div>

                    {parsedNlpList.length > 0 && (
                      <div className="space-y-2 border border-white/5 bg-white/3 p-3 rounded-2xl">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] uppercase font-bold tracking-wider text-emerald-400 flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" /> Ready for enrollment ({parsedNlpList.length} parsed)
                          </span>
                        </div>
                        <div className="max-h-[140px] overflow-y-auto rounded-xl border border-white/10 bg-black/20 text-[10px]">
                          <table className="w-full text-left">
                            <thead className="bg-white/5 text-[8px] uppercase tracking-wider font-bold text-muted-foreground sticky top-0">
                              <tr>
                                <th className="p-2">Name</th>
                                <th className="p-2">Email</th>
                                <th className="p-2">{activeRegistryTab === "student" ? "Major" : "Dept"}</th>
                                <th className="p-2">{activeRegistryTab === "student" ? "GPA" : "Salary"}</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {parsedNlpList.map((item, idx) => (
                                <tr key={idx} className="hover:bg-white/3 text-white/80 font-mono">
                                  <td className="p-2 font-semibold text-white">{item.displayName}</td>
                                  <td className="p-2 text-muted-foreground">{item.email}</td>
                                  <td className="p-2">{item.field}</td>
                                  <td className="p-2 text-primary">{activeRegistryTab === "student" ? item.metric : `$${parseInt(item.metric).toLocaleString()}`}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    <DialogFooter className="mt-4">
                      <Button type="button" variant="outline" onClick={() => setEnrollOpen(false)} className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10">
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        onClick={() => executeBulkEnrollment(parsedNlpList)}
                        disabled={parsedNlpList.length === 0 || enrolling}
                        className="rounded-xl shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-white font-bold"
                      >
                        Enroll {parsedNlpList.length} Members
                      </Button>
                    </DialogFooter>
                  </TabsContent>

                  {/* ── CSV Batch Upload ────────────────── */}
                  <TabsContent value="csv" className="space-y-4">
                    <div className="border-2 border-dashed border-white/10 rounded-2xl p-6 bg-black/25 flex flex-col items-center justify-center text-center gap-3 relative hover:bg-white/5 transition-all">
                      <FileText className="h-8 w-8 text-primary animate-pulse" />
                      <div>
                        <p className="text-xs text-white font-bold">Select CSV spreadsheet document</p>
                        <p className="text-[10px] text-muted-foreground mt-1 max-w-xs">
                          Spreadsheet should contain columns: Name, Email, {activeRegistryTab === "student" ? "Major, GPA" : "Department, Salary"}.
                        </p>
                      </div>
                      <label className="h-8 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-[10px] px-4 flex items-center justify-center gap-1.5 cursor-pointer font-bold transition-all">
                        <Upload className="h-3.5 w-3.5" /> Upload CSV Document
                        <input type="file" accept=".csv" className="hidden" onChange={handleCsvFileParse} />
                      </label>
                    </div>

                    {parsedCsvList.length > 0 && (
                      <div className="space-y-2 border border-white/5 bg-white/3 p-3 rounded-2xl">
                        <span className="text-[9px] uppercase font-bold tracking-wider text-emerald-400 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" /> {parsedCsvList.length} CSV rows parsed successfully
                        </span>
                        <div className="max-h-[140px] overflow-y-auto rounded-xl border border-white/10 bg-black/20 text-[10px]">
                          <table className="w-full text-left">
                            <thead className="bg-white/5 text-[8px] uppercase tracking-wider font-bold text-muted-foreground sticky top-0">
                              <tr>
                                <th className="p-2">Name</th>
                                <th className="p-2">Email</th>
                                <th className="p-2">{activeRegistryTab === "student" ? "Major" : "Dept"}</th>
                                <th className="p-2">{activeRegistryTab === "student" ? "GPA" : "Salary"}</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {parsedCsvList.map((item, idx) => (
                                <tr key={idx} className="hover:bg-white/3 text-white/80 font-mono">
                                  <td className="p-2 font-semibold text-white">{item.displayName}</td>
                                  <td className="p-2 text-muted-foreground">{item.email}</td>
                                  <td className="p-2">{item.field}</td>
                                  <td className="p-2 text-primary">{activeRegistryTab === "student" ? item.metric : `$${parseInt(item.metric).toLocaleString()}`}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    <DialogFooter className="mt-4">
                      <Button type="button" variant="outline" onClick={() => setEnrollOpen(false)} className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10">
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        onClick={() => executeBulkEnrollment(parsedCsvList)}
                        disabled={parsedCsvList.length === 0 || enrolling}
                        className="rounded-xl shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-white font-bold"
                      >
                        Enroll {parsedCsvList.length} CSV Members
                      </Button>
                    </DialogFooter>
                  </TabsContent>

                  {/* ── Demo Data Generator ─────────────── */}
                  <TabsContent value="demo" className="space-y-5 py-2">
                    <div className="flex items-start gap-3 bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-2xl">
                      <Info className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-white uppercase tracking-wider">Instant Sandbox Data Generation</p>
                        <p className="text-[10px] text-muted-foreground leading-relaxed mt-1">
                          Rapidly populate the active registry node with realistic, high-fidelity sandbox profiles. Best for platform reviews, system evaluations, and proctoring testing.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="border border-white/5 bg-white/3 p-4 rounded-2xl flex flex-col justify-between items-center text-center gap-3">
                        <GraduationCap className="h-8 w-8 text-primary animate-float" />
                        <div>
                          <p className="text-xs font-bold text-white">Student Demo Block</p>
                          <p className="text-[9px] text-muted-foreground mt-0.5">Generate 5 active students</p>
                        </div>
                        <Button
                          type="button"
                          onClick={() => {
                            const list = triggerDemoGeneration("student");
                            executeBulkEnrollment(list);
                          }}
                          disabled={enrolling}
                          className="w-full rounded-xl text-[10px] font-bold h-8 uppercase bg-primary hover:bg-primary/90 text-white"
                        >
                          Generate Students
                        </Button>
                      </div>

                      <div className="border border-white/5 bg-white/3 p-4 rounded-2xl flex flex-col justify-between items-center text-center gap-3">
                        <Briefcase className="h-8 w-8 text-primary animate-float" />
                        <div>
                          <p className="text-xs font-bold text-white">Faculty Demo Block</p>
                          <p className="text-[9px] text-muted-foreground mt-0.5">Generate 5 faculty staff</p>
                        </div>
                        <Button
                          type="button"
                          onClick={() => {
                            const list = triggerDemoGeneration("teacher");
                            executeBulkEnrollment(list);
                          }}
                          disabled={enrolling}
                          className="w-full rounded-xl text-[10px] font-bold h-8 uppercase bg-primary hover:bg-primary/90 text-white"
                        >
                          Generate Faculty
                        </Button>
                      </div>
                    </div>

                    <DialogFooter className="mt-4">
                      <Button type="button" variant="outline" onClick={() => setEnrollOpen(false)} className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10 w-full">
                        Close Wizard
                      </Button>
                    </DialogFooter>
                  </TabsContent>
                </Tabs>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeRegistryTab} onValueChange={(val) => setActiveRegistryTab(val as "student" | "teacher")} className="w-full">
        <TabsList className="grid w-full grid-cols-2 glass-card p-1 rounded-2xl h-12 border-white/5 max-w-md">
          <TabsTrigger value="student" className="rounded-xl font-bold uppercase tracking-widest text-[10px] flex items-center gap-1.5">
            <GraduationCap className="h-4 w-4 text-indigo-400" />
            Students List
          </TabsTrigger>
          <TabsTrigger value="teacher" className="rounded-xl font-bold uppercase tracking-widest text-[10px] flex items-center gap-1.5">
            <Briefcase className="h-4 w-4 text-indigo-400" />
            Teachers / Faculty
          </TabsTrigger>
        </TabsList>

        <Card className="glass-card border-none mt-6">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-white">{activeRegistryTab === "student" ? "Academic Student Directory" : "Faculty & Staff Directory"}</CardTitle>
                <CardDescription>
                  Managing {currentList?.length || 0} enrolled {activeRegistryTab === "student" ? "students" : "teachers"}.
                </CardDescription>
              </div>
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search directory..." 
                  className="pl-9 bg-white/5 border-white/10 rounded-xl"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader className="bg-white/5">
                <TableRow className="border-white/10">
                  <TableHead className="text-white/60 font-bold uppercase tracking-wider text-[9px]">{activeRegistryTab === "student" ? "Student" : "Staff Name"}</TableHead>
                  <TableHead className="text-white/60 font-bold uppercase tracking-wider text-[9px]">Registry ID</TableHead>
                  <TableHead className="text-white/60 font-bold uppercase tracking-wider text-[9px]">{activeRegistryTab === "student" ? "Major" : "Department"}</TableHead>
                  <TableHead className="text-white/60 font-bold uppercase tracking-wider text-[9px]">{activeRegistryTab === "student" ? "GPA" : "Base Salary"}</TableHead>
                  <TableHead className="text-white/60 font-bold uppercase tracking-wider text-[9px]">Status</TableHead>
                  <TableHead className="text-right text-white/60 font-bold uppercase tracking-wider text-[9px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems?.map((item) => (
                  <TableRow key={item.uid || item.id} className="border-white/5 hover:bg-white/3 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full border border-white/10 overflow-hidden bg-white/5 flex items-center justify-center">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.displayName} className="h-full w-full object-cover" />
                          ) : (
                            <User className="h-5 w-5 text-indigo-400" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-white text-sm">{item.displayName || "Anonymous"}</div>
                          <div className="text-xs text-muted-foreground">{item.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-[10px] text-white/40">{(item.uid || item.id)?.slice(0, 10).toUpperCase()}</TableCell>
                    <TableCell className="text-white/80 text-xs">{activeRegistryTab === "student" ? item.major : item.department}</TableCell>
                    <TableCell className="text-xs text-white">
                      {activeRegistryTab === "student" ? (
                        <div className="flex items-center gap-1">
                          <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                          {item.gpa || "4.0"}
                        </div>
                      ) : (
                        `$${(item.salary || 4000).toLocaleString()}`
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.status === "Active" ? "default" : "secondary"} className="text-[9px] uppercase tracking-wider font-bold">
                        {item.status || "Active"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white rounded-lg">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {loading && (
               <div className="py-20 flex flex-col items-center justify-center gap-4 opacity-50">
                 <Loader2 className="h-8 w-8 animate-spin text-primary" />
                 <p className="text-[10px] font-bold uppercase tracking-widest text-white">Synchronizing Registry Node Data...</p>
               </div>
            )}
            {!loading && filteredItems?.length === 0 && (
              <div className="py-20 text-center opacity-40">
                <User className="h-12 w-12 mx-auto mb-3 text-indigo-400" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-white">No registry records found</p>
                <p className="text-[9px] mt-1 text-muted-foreground">Create a new entry by clicking the Enroll button above.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </Tabs>

      {/* ── Credentials Display Dialog ────────────────── */}
      <Dialog open={showCredentialsDialog} onOpenChange={setShowCredentialsDialog}>
        <DialogContent className="glass-card border-white/10 text-white max-w-2xl rounded-3xl font-body">
          <DialogHeader>
            <DialogTitle className="text-xl text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-400 animate-pulse" />
              Credentials Generated Successfully
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Institutional portal logins have been registered in Firebase Authentication and Firestore. Share these with the respective members.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="max-h-[260px] overflow-y-auto rounded-2xl border border-white/10 bg-black/30 p-2">
              <Table>
                <TableHeader className="bg-white/5 sticky top-0 z-10">
                  <TableRow className="border-white/5">
                    <TableHead className="text-white/60 font-bold uppercase tracking-wider text-[9px]">Name</TableHead>
                    <TableHead className="text-white/60 font-bold uppercase tracking-wider text-[9px]">Email</TableHead>
                    <TableHead className="text-white/60 font-bold uppercase tracking-wider text-[9px]">Password</TableHead>
                    <TableHead className="text-white/60 font-bold uppercase tracking-wider text-[9px]">Role</TableHead>
                    <TableHead className="text-right text-white/60 font-bold uppercase tracking-wider text-[9px]">Email Welcome</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-white/5">
                  {generatedCredentials.map((cred, idx) => (
                    <TableRow key={idx} className="border-white/5 hover:bg-white/3 font-mono text-[11px]">
                      <TableCell className="font-sans font-semibold text-white">{cred.displayName}</TableCell>
                      <TableCell className="text-muted-foreground">{cred.email}</TableCell>
                      <TableCell className="text-primary font-bold">{cred.password}</TableCell>
                      <TableCell className="text-[10px] uppercase font-bold text-indigo-400">{cred.role}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 text-indigo-400 hover:text-white hover:bg-indigo-500/20 rounded-md"
                          onClick={() => triggerMailTo(cred.displayName, cred.email, cred.password, cred.role)}
                          title="Send pre-filled welcome email"
                        >
                          <Mail className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button 
                variant="outline" 
                onClick={copyAllCredentials} 
                className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-xs flex items-center gap-1.5"
              >
                Copy All to Clipboard
              </Button>
              <Button 
                onClick={downloadCredentialsCsv} 
                className="rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg hover:opacity-90 transition-all"
              >
                Download CSV Index
              </Button>
              <Button 
                onClick={() => setShowCredentialsDialog(false)} 
                className="rounded-xl bg-primary text-white text-xs font-bold px-5"
              >
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}