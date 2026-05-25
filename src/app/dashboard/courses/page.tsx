"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Users, Plus, LayoutGrid, List, Layers, ArrowUpRight } from "lucide-react"

const courses = [
  { 
    id: 1, 
    title: "Advanced Quantum Mechanics", 
    code: "PHY401", 
    students: 24, 
    progress: 65, 
    category: "Physics",
    status: "Ongoing",
    color: "bg-blue-500"
  },
  { 
    id: 2, 
    title: "Introduction to Artificial Intelligence", 
    code: "CS201", 
    students: 42, 
    progress: 88, 
    category: "Computer Science",
    status: "Upcoming",
    color: "bg-violet-500"
  },
  { 
    id: 3, 
    title: "Multivariable Calculus", 
    code: "MATH302", 
    students: 31, 
    progress: 42, 
    category: "Mathematics",
    status: "Ongoing",
    color: "bg-emerald-500"
  },
  { 
    id: 4, 
    title: "Organic Chemistry II", 
    code: "CHEM202", 
    students: 28, 
    progress: 15, 
    category: "Science",
    status: "Ongoing",
    color: "bg-amber-500"
  },
]

export default function CourseManagementPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="font-headline text-4xl font-extrabold text-foreground tracking-tight">Course Registry</h2>
          <p className="text-muted-foreground text-lg">Manage your digital classrooms and learning paths.</p>
        </div>
        <div className="flex gap-2 bg-muted/50 p-1.5 rounded-2xl border">
          <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10">
            <LayoutGrid className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10">
            <List className="h-5 w-5" />
          </Button>
          <Button className="flex gap-2 rounded-xl shadow-lg shadow-primary/20">
            <Plus className="h-4 w-4" />
            New Course
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {courses.map((course, i) => (
          <Card key={course.id} className={`group overflow-hidden border-none shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4 delay-${i * 50}`}>
            <CardHeader className="relative h-32 flex flex-col justify-end p-6">
              <div className={`absolute inset-0 opacity-10 ${course.color}`} />
              <div className="flex justify-between items-start mb-auto">
                <Badge variant="outline" className="bg-background/80 backdrop-blur-sm px-3 py-1 text-[10px] font-bold uppercase tracking-widest border-muted">
                  {course.category}
                </Badge>
                <Badge className={course.status === 'Ongoing' ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20' : 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20'}>
                  {course.status}
                </Badge>
              </div>
              <div>
                <CardTitle className="font-headline text-xl group-hover:text-primary transition-colors line-clamp-1">
                  {course.title}
                </CardTitle>
                <CardDescription className="font-mono text-xs font-bold tracking-tighter opacity-60">
                  {course.code}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-lg">
                  <Users className="h-4 w-4" />
                  <span className="font-medium">{course.students} Students</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-lg">
                  <Layers className="h-4 w-4" />
                  <span className="font-medium">12 Modules</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  <span>Progress</span>
                  <span className="text-foreground">{course.progress}%</span>
                </div>
                <Progress value={course.progress} className="h-2 bg-muted" />
              </div>
            </CardContent>
            <CardFooter className="bg-muted/30 border-t flex gap-2 p-4">
              <Button variant="ghost" size="sm" className="flex-1 rounded-xl">Details</Button>
              <Button size="sm" className="flex-1 rounded-xl group/btn">
                Manage
                <ArrowUpRight className="h-3 w-3 ml-1 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
