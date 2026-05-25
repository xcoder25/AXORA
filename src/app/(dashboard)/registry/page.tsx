"use client"

import { useState } from "react"
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
import { Search, Plus, Filter, MoreHorizontal, User } from "lucide-react"

const students = [
  { id: "STU001", name: "Alex Johnson", email: "alex.j@scholai.edu", major: "Physics", status: "Active", gpa: "3.8" },
  { id: "STU002", name: "Sarah Williams", email: "sarah.w@scholai.edu", major: "Computer Science", status: "Active", gpa: "3.9" },
  { id: "STU003", name: "Michael Chen", email: "m.chen@scholai.edu", major: "Mathematics", status: "On Leave", gpa: "3.5" },
  { id: "STU004", name: "Elena Rodriguez", email: "e.rod@scholai.edu", major: "Biochemistry", status: "Active", gpa: "3.7" },
  { id: "STU005", name: "James Wilson", email: "j.wilson@scholai.edu", major: "Engineering", status: "Active", gpa: "3.6" },
  { id: "STU006", name: "Emma Brown", email: "emma.b@scholai.edu", major: "Literature", status: "Active", gpa: "4.0" },
]

export default function StudentRegistryPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-headline text-3xl font-bold text-primary">Student Data Registry</h2>
          <p className="text-muted-foreground">Centralized record management for academic histories and contact info.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
          <Button className="flex gap-2">
            <Plus className="h-4 w-4" />
            Enroll Student
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Academic Records</CardTitle>
              <CardDescription>Managing {students.length} enrolled students.</CardDescription>
            </div>
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by name or ID..." 
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Major</TableHead>
                <TableHead>GPA</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{student.name}</div>
                        <div className="text-xs text-muted-foreground">{student.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{student.id}</TableCell>
                  <TableCell>{student.major}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                      {student.gpa}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={student.status === 'Active' ? 'default' : 'secondary'} className="text-[10px] uppercase tracking-wider">
                      {student.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
