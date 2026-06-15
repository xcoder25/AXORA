'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Users, Search, Filter, UserPlus, Download, MoreHorizontal, FileSpreadsheet,
  Mail, Smartphone, MapPin, GraduationCap, Building2, ShieldCheck, Contact
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Data ───────────────────────────────────────────────────────────────────
const ROLES = ['All', 'Student', 'Teacher', 'Parent', 'Admin', 'Staff'];

const REGISTRY = [
  { id: 'STU-8821', name: 'Alice Johnson', role: 'Student', grade: 'JSS-3A', email: 'alice.j@axora.edu', phone: '+234 801 234 5678', status: 'active', parent: 'Mr. Johnson' },
  { id: 'STU-9045', name: 'Brian Okafor', role: 'Student', grade: 'SSS-1B', email: 'brian.o@axora.edu', phone: '+234 802 345 6789', status: 'active', parent: 'Mrs. Okafor' },
  { id: 'FAC-1004', name: 'Dr. Emeka Adeyemi', role: 'Teacher', grade: 'Science Dept', email: 'e.adeyemi@axora.edu', phone: '+234 803 456 7890', status: 'active', parent: '-' },
  { id: 'PAR-4432', name: 'Mrs. Grace Okafor', role: 'Parent', grade: '-', email: 'grace.o@gmail.com', phone: '+234 804 567 8901', status: 'active', parent: '-' },
  { id: 'STU-7732', name: 'Chioma Nweke', role: 'Student', grade: 'SSS-3A', email: 'chioma.n@axora.edu', phone: '+234 805 678 9012', status: 'suspended', parent: 'Mr. Nweke' },
  { id: 'ADM-001', name: 'System Administrator', role: 'Admin', grade: '-', email: 'admin@axora.edu', phone: '-', status: 'active', parent: '-' },
];

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function RegistryPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  const filtered = REGISTRY.filter(person => 
    (roleFilter === 'All' || person.role === roleFilter) &&
    (person.name.toLowerCase().includes(search.toLowerCase()) || person.id.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700 w-full">

      {/* ── Header ───────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 font-black uppercase tracking-widest text-[9px]">
            <Users className="mr-1 h-3 w-3" /> Core Registry
          </Badge>
          <h2 className="font-headline text-4xl font-black text-white tracking-tight drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">
            User Directory
          </h2>
          <p className="text-muted-foreground max-w-xl">
            Centralized database for students, faculty, and administrative staff management.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl h-11 px-5 font-black uppercase tracking-widest text-[10px] bg-white/5 border-white/10">
            <FileSpreadsheet className="mr-2 h-4 w-4" /> Import CSV
          </Button>
          <Button className="rounded-xl h-11 px-6 font-black uppercase tracking-widest text-[10px] bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/20">
            <UserPlus className="mr-2 h-4 w-4" /> Add User
          </Button>
        </div>
      </div>

      {/* ── Filter & Search Bar ──────────────────────────── */}
      <Card className="glass-card border-white/5">
        <CardContent className="p-4 flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search directory by name, email, or ID..."
              className="h-12 pl-10 bg-white/5 border-white/10 rounded-xl text-white placeholder:text-white/30"
            />
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px] bg-white/5 border-white/10 rounded-xl h-12 text-white font-bold">
                <SelectValue placeholder="Filter by Role" />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant="outline" className="h-12 w-12 rounded-xl bg-white/5 border-white/10 p-0 flex items-center justify-center">
              <Filter className="h-4 w-4 text-white/70" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Directory Table ──────────────────────────────── */}
      <Card className="glass-card border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-white/70">
            <thead className="bg-black/20 border-b border-white/5 text-[9px] font-black uppercase tracking-widest text-white/40">
              <tr>
                <th className="px-6 py-4 rounded-tl-xl">User Profile</th>
                <th className="px-6 py-4">Contact Info</th>
                <th className="px-6 py-4">Role & Dept</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right rounded-tr-xl">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map(person => (
                <tr key={person.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center font-black text-white shrink-0 shadow-inner',
                        person.role === 'Student' ? 'bg-gradient-to-br from-blue-500 to-indigo-600' :
                        person.role === 'Teacher' ? 'bg-gradient-to-br from-violet-500 to-fuchsia-600' :
                        person.role === 'Parent' ? 'bg-gradient-to-br from-emerald-500 to-teal-600' :
                        'bg-gradient-to-br from-slate-600 to-slate-800'
                      )}>
                        {person.name[0]}
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm group-hover:text-blue-400 transition-colors cursor-pointer">{person.name}</p>
                        <p className="text-[10px] text-white/40 font-mono mt-0.5">{person.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <Mail className="h-3 w-3 text-white/30" /> {person.email}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-white/40">
                      <Smartphone className="h-3 w-3 text-white/20" /> {person.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Badge className={cn('text-[9px] font-black uppercase border-none',
                        person.role === 'Student' ? 'bg-blue-500/10 text-blue-400' :
                        person.role === 'Teacher' ? 'bg-violet-500/10 text-violet-400' :
                        person.role === 'Parent' ? 'bg-emerald-500/10 text-emerald-400' :
                        'bg-slate-500/10 text-slate-400'
                      )}>{person.role}</Badge>
                      <span className="text-xs font-medium text-white/60">{person.grade}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <span className={cn('h-2 w-2 rounded-full', person.status === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-red-400')} />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-white/60">{person.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-white/40 hover:text-white hover:bg-white/10">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-24 text-center text-white/30">
                    <Users className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p className="font-bold">No users found in directory</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <CardFooter className="p-4 border-t border-white/5 bg-black/20 flex items-center justify-between">
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Showing {filtered.length} entries</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-8 text-[9px] font-black uppercase bg-white/5 border-white/10" disabled>Previous</Button>
            <Button variant="outline" size="sm" className="h-8 text-[9px] font-black uppercase bg-white/5 border-white/10">Next</Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}