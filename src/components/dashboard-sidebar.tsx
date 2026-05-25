
"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
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
  Baby
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
  SidebarTrigger,
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
    title: "Child Progress",
    url: "/dashboard/performance",
    icon: Baby,
    roles: ["parent"],
  },
  {
    title: "Performance",
    url: "/dashboard/performance",
    icon: LineChart,
    roles: ["teacher", "admin", "student"],
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

export function DashboardSidebar({ userRole }: { userRole: string }) {
  const pathname = usePathname()
  
  const filteredNavItems = navItems.filter(item => 
    !item.roles || item.roles.includes(userRole)
  );

  return (
    <Sidebar collapsible="icon" className="border-r border-white/5 bg-[#02040a]">
      <SidebarHeader className="px-6 py-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-indigo-600 text-white shadow-lg shadow-primary/20">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="font-headline text-xl font-black tracking-tighter text-white">
              ScholAI
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-accent/80">Enterprise</span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 mb-4">
            Command Center
          </SidebarGroupLabel>
          <SidebarMenu className="gap-2">
            {filteredNavItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  asChild 
                  isActive={pathname === item.url}
                  tooltip={item.title}
                  className="rounded-xl h-11 px-4 hover:bg-white/5 data-[active=true]:bg-primary data-[active=true]:text-white transition-all duration-300"
                >
                  <Link href={item.url} className="flex items-center gap-3">
                    <item.icon className="h-4 w-4" />
                    <span className="font-bold text-xs uppercase tracking-widest">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 bg-white/5">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="System Settings" className="rounded-xl h-11 px-4 text-muted-foreground hover:text-white transition-colors">
              <Settings className="h-4 w-4" />
              <span className="font-bold text-xs uppercase tracking-widest">Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
