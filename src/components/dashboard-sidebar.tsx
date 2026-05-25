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
  ShieldAlert,
  Wallet,
  Megaphone,
  ChevronRight
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

interface NavItem {
  title: string;
  url: string;
  icon: any;
  roles?: string[];
}

const navItems: NavItem[] = [
  {
    title: "Overview",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "School Admin",
    url: "/dashboard/admin",
    icon: ShieldAlert,
    roles: ["admin"],
  },
  {
    title: "Finance & Fees",
    url: "/dashboard/finance",
    icon: Wallet,
    roles: ["admin", "parent"],
  },
  {
    title: "Communication",
    url: "/dashboard/communication",
    icon: Megaphone,
    roles: ["admin", "teacher", "student", "parent"],
  },
  {
    title: "Study Planner",
    url: "/dashboard/planner",
    icon: Calendar,
    roles: ["student", "admin", "parent"],
  },
  {
    title: "Grading Assistant",
    url: "/dashboard/grading",
    icon: NotebookPen,
    roles: ["teacher", "admin"],
  },
  {
    title: "Course Registry",
    url: "/dashboard/courses",
    icon: BookOpen,
    roles: ["teacher", "admin", "student"],
  },
  {
    title: "Performance",
    url: "/dashboard/performance",
    icon: LineChart,
    roles: ["teacher", "admin", "student", "parent"],
  },
  {
    title: "Resource Engine",
    url: "/dashboard/resources",
    icon: Sparkles,
    roles: ["teacher", "admin", "student"],
  },
  {
    title: "Student Database",
    url: "/dashboard/registry",
    icon: Users,
    roles: ["teacher", "admin"],
  },
]

export function DashboardSidebar({ 
  userRole, 
  schoolLogo, 
  schoolName 
}: { 
  userRole: string;
  schoolLogo?: string;
  schoolName?: string;
}) {
  const pathname = usePathname()
  
  const filteredNavItems = navItems.filter(item => 
    !item.roles || item.roles.includes(userRole)
  );

  return (
    <Sidebar collapsible="icon" className="border-r border-white/5 bg-[#02040a]">
      <SidebarHeader className="px-6 py-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-indigo-600 text-white shadow-xl shadow-primary/20 relative overflow-hidden group">
            {schoolLogo ? (
              <Image 
                src={schoolLogo} 
                alt={schoolName || "School Logo"} 
                fill 
                className="object-contain p-2" 
              />
            ) : (
              <GraduationCap className="h-6 w-6 group-hover:scale-110 transition-transform" />
            )}
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="font-headline text-xl font-black tracking-tighter text-white leading-tight">
              {schoolName || "ScholAI"}
            </span>
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-accent">Core Engine</span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-3">
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 mb-4">
            Command Center
          </SidebarGroupLabel>
          <SidebarMenu className="gap-1.5">
            {filteredNavItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  asChild 
                  isActive={pathname === item.url}
                  tooltip={item.title}
                  className={cn(
                    "rounded-xl h-12 px-4 transition-all duration-300 group",
                    pathname === item.url 
                      ? "bg-primary/20 border border-primary/20 text-white shadow-[0_0_20px_rgba(var(--primary),0.1)]" 
                      : "hover:bg-white/5 text-muted-foreground hover:text-white"
                  )}
                >
                  <Link href={item.url} className="flex items-center gap-3">
                    <item.icon className={cn(
                      "h-4 w-4 transition-transform group-hover:scale-110",
                      pathname === item.url ? "text-primary" : "text-muted-foreground"
                    )} />
                    <span className="font-bold text-[11px] uppercase tracking-[0.15em]">{item.title}</span>
                    {pathname === item.url && <ChevronRight className="ml-auto h-3 w-3 opacity-50" />}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 mt-auto">
        <div className="group-data-[collapsible=icon]:hidden mb-4 px-2">
           <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">AI Node Active</span>
              </div>
              <p className="text-[10px] font-medium text-muted-foreground leading-relaxed">
                Predictive models optimizing learning paths.
              </p>
           </div>
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="System Settings" className="rounded-xl h-11 px-4 text-muted-foreground hover:text-white transition-colors bg-white/3 hover:bg-white/8">
              <Settings className="h-4 w-4" />
              <span className="font-bold text-xs uppercase tracking-widest">Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
