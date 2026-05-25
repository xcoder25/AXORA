
"use client"

import { useState } from "react"
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
  Layout
} from "lucide-react"

export default function AcademicEnginePage() {
  const [activeTab, setActiveTab] = useState("grading");

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge className="bg-primary/10 text-primary border-primary/20 font-bold uppercase tracking-widest text-[9px] h-5">
              Institutional Intelligence Node
            </Badge>
          </div>
          <h2 className="font-headline text-4xl font-bold text-white tracking-tight leading-tight">Academic Engine</h2>
          <p className="text-muted-foreground text-lg">Promotion rules, grading systems, and dynamic reporting.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl border-white/10 bg-white/5">
            <Settings2 className="mr-2 h-4 w-4" /> Global Rules
          </Button>
          <Button className="rounded-xl shadow-lg shadow-primary/20 bg-primary font-bold uppercase tracking-widest text-[10px]">
            <Sparkles className="mr-2 h-4 w-4" /> Build Report Card
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-4 space-y-6">
          <Card className="glass-card border-none">
            <CardHeader className="bg-primary/10 border-b border-white/5 p-6">
              <CardTitle className="text-xl text-white">Grading Protocol</CardTitle>
              <CardDescription className="text-xs">Select your school's official assessment framework.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-1.5">
                <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Framework Type</Label>
                <Select defaultValue="a-f">
                  <SelectTrigger className="bg-white/5 border-white/10 rounded-xl h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="a-f">Standard A-F System</SelectItem>
                    <SelectItem value="gpa">4.0 / 5.0 GPA Scale</SelectItem>
                    <SelectItem value="percentages">Raw Percentages</SelectItem>
                    <SelectItem value="custom">Axora Custom Logic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-4 pt-4 border-t border-white/5">
                <h4 className="text-[10px] font-bold uppercase text-primary tracking-[0.2em]">Promotion Thresholds</h4>
                <div className="space-y-3">
                   {['Automatic Promotion', 'Conditional Promotion', 'Retention Index'].map((rule) => (
                     <div key={rule} className="flex items-center justify-between p-3 bg-white/3 rounded-xl border border-white/5">
                        <span className="text-xs font-semibold text-white/70">{rule}</span>
                        <Input className="w-16 h-8 text-center bg-transparent border-white/10 text-xs" placeholder="50%" />
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
                 <CardDescription className="text-xs">Drag & drop layout for mid-term and end-of-term results.</CardDescription>
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
                 <CardDescription className="text-xs">Configure academic pathways and required foundations.</CardDescription>
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
    </div>
  )
}
