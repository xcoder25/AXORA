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
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, query, where, orderBy } from "firebase/firestore"

export default function StudentRegistryPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const db = useFirestore()

  const studentsQuery = useMemoFirebase(() => {
    if (!db) return null;
    // Real-time query for student users in this school
    return query(
      collection(db, 'users'),
      where('role', '==', 'student'),
      where('schoolId', '==', 'INST-001') // Mock ID
    );
  }, [db]);

  const { data: students, loading } = useCollection(studentsQuery);

  const filteredStudents = students?.filter(s => 
    s.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.uid?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
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

      <Card className="glass-card border-none">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Academic Records</CardTitle>
              <CardDescription>Managing {students?.length || 0} enrolled students.</CardDescription>
            </div>
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by name or ID..." 
                className="pl-9 bg-white/5 border-white/10"
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
                <TableHead className="text-white/60">Student</TableHead>
                <TableHead className="text-white/60">ID</TableHead>
                <TableHead className="text-white/60">Major</TableHead>
                <TableHead className="text-white/60">GPA</TableHead>
                <TableHead className="text-white/60">Status</TableHead>
                <TableHead className="text-right text-white/60">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents?.map((student) => (
                <TableRow key={student.uid} className="border-white/5 hover:bg-white/3 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium text-white">{student.displayName || 'Anonymous'}</div>
                        <div className="text-xs text-muted-foreground">{student.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-[10px] text-white/40">{student.uid?.slice(0, 8).toUpperCase()}</TableCell>
                  <TableCell className="text-white/80">{student.major || 'Undeclared'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-white">
                      <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                      {student.gpa || 'N/A'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={student.status === 'Active' ? 'default' : 'secondary'} className="text-[10px] uppercase tracking-wider">
                      {student.status || 'Active'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white">
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
               <p className="text-[10px] font-bold uppercase tracking-widest">Synchronizing Node Data...</p>
             </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}