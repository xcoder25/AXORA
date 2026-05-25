"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Users, Plus, LayoutGrid, List, Layers } from "lucide-react"

const courses = [
  { 
    id: 1, 
    title: "Advanced Quantum Mechanics", 
    code: "PHY401", 
    students: 24, 
    progress: 65, 
    category: "Physics",
    status: "Ongoing"
  },
  { 
    id: 2, 
    title: "Introduction to Artificial Intelligence", 
    code: "CS201", 
    students: 42, 
    progress: 88, 
    category: "Computer Science",
    status: "Upcoming"
  },
  { 
    id: 3, 
    title: "Multivariable Calculus", 
    code: "MATH302", 
    students: 31, 
    progress: 42, 
    category: "Mathematics",
    status: "Ongoing"
  },
  { 
    id: 4, 
    title: "Organic Chemistry II", 
    code: "CHEM202", 
    students: 28, 
    progress: 15, 
    category: "Science",
    status: "Ongoing"
  },
]

export default function CourseManagementPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-headline text-3xl font-bold text-primary">Course Management</h2>
          <p className="text-muted-foreground">Create classrooms, assign curriculum, and update records.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <List className="h-4 w-4" />
          </Button>
          <Button className="flex gap-2">
            <Plus className="h-4 w-4" />
            Create Course
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {courses.map((course) => (
          <Card key={course.id} className="group overflow-hidden border-2 hover:border-primary/20 transition-all duration-300">
            <CardHeader className="bg-secondary/30 pb-4">
              <div className="flex justify-between items-start mb-2">
                <Badge variant="outline" className="text-[10px] bg-background">
                  {course.category}
                </Badge>
                <Badge variant={course.status === 'Ongoing' ? 'default' : 'secondary'}>
                  {course.status}
                </Badge>
              </div>
              <CardTitle className="font-headline group-hover:text-primary transition-colors">
                {course.title}
              </CardTitle>
              <CardDescription className="font-mono text-xs font-bold">
                {course.code}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{course.students} Students</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Layers className="h-4 w-4" />
                  <span>12 Modules</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span>Curriculum Completion</span>
                  <span>{course.progress}%</span>
                </div>
                <Progress value={course.progress} className="h-1.5" />
              </div>
            </CardContent>
            <CardFooter className="border-t bg-muted/20 flex gap-2 pt-4">
              <Button variant="outline" size="sm" className="flex-1">Manage</Button>
              <Button size="sm" className="flex-1">Syllabus</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
