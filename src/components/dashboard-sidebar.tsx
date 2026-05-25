
"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { 
  BookOpen, 
  Calendar, 
  GraduationCap, 
  LayoutDashboard, 
  LineChart, 
  NotebookPen, 
  Settings, 
  Sparkles, 
  Users,
  Wallet,
  Megaphone,
  Camera,
  ShieldCheck,
  Package,
  Video,
  ClipboardList
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

interface NavItem {
  title: string;
  url: string;
  icon: any;
  roles?: string[];
}

const navItems: NavItem[] = [
  { title: "Overview", url: "/dashboard", icon: LayoutDashboard },
  { title: "Finance", url: "/dashboard/finance", icon: Wallet, roles: ["admin", "parent"] },
  { title: "Payroll", url: "/dashboard/payroll", icon: Wallet, roles: ["admin"] },
  { title: "Comms", url: "/dashboard/communication", icon: Megaphone },
  { title: "Attendance", url: "/dashboard/attendance", icon: Camera, roles: ["admin", "teacher"] },
  { title: "Security", url: "/dashboard/security", icon: Video, roles: ["admin"] },
  { title: "Assets", url: "/dashboard/assets", icon: Package, roles: ["admin"] },
  { title: "CBT Exams", url: "/dashboard/exams", icon: ClipboardList, roles: ["teacher", "admin", "student"] },
  { title: "Grading", url: "/dashboard/grading", icon: NotebookPen, roles: ["teacher", "admin"] },
  { title: "Courses", url: "/dashboard/courses", icon: BookOpen },
  { title: "Performance", url: "/dashboard/performance", icon: LineChart },
  { title: "Resources", url: "/dashboard/resources", icon: Sparkles },
  { title: "Students", url: "/dashboard/registry", icon: Users, roles: ["teacher", "admin"] },
]

export function DashboardSidebar({ userRole, schoolLogo, schoolName }: { userRole: string; schoolLogo?: string; schoolName?: string; }) {
  const pathname = usePathname()
  const filteredNavItems = navItems.filter(item => !item.roles || item.roles.includes(userRole));

  return (
    <Sidebar collapsible="icon" className="border-r border-white/5 bg-[#02040a]">
      <SidebarHeader className="px-5 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-indigo-600 text-white shadow-lg relative overflow-hidden group">
            {schoolLogo ? (
              <div className="relative w-full h-full p-2">
                <Image src={schoolLogo} alt={schoolName || "Logo"} fill className="object-contain" />
              </div>
            ) : (
              <GraduationCap className="h-5 w-5" />
            )}
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden overflow-hidden">
            <span className="font-bold text-base tracking-tight text-white leading-tight truncate">
              {schoolName || "ScholAI"}
            </span>
            <span className="text-[8px] font-bold uppercase tracking-widest text-accent">Core Engine</span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-3">
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/30 mb-2">
            Management
          </SidebarGroupLabel>
          <SidebarMenu className="gap-1">
            {filteredNavItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  asChild 
                  isActive={pathname === item.url}
                  tooltip={item.title}
                  className={cn(
                    "rounded-xl h-10 px-4 transition-all group",
                    pathname === item.url 
                      ? "bg-primary/10 text-white" 
                      : "hover:bg-white/5 text-muted-foreground hover:text-white"
                  )}
                >
                  <Link href={item.url} className="flex items-center gap-3">
                    <item.icon className={cn("h-4 w-4", pathname === item.url ? "text-primary" : "text-muted-foreground")} />
                    <span className="font-semibold text-[10px] uppercase tracking-wider">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="rounded-xl h-10 px-4 text-muted-foreground hover:text-white transition-colors bg-white/3">
              <Settings className="h-4 w-4" />
              <span className="font-semibold text-[10px] uppercase tracking-wider">Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
