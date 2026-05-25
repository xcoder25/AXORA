
"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  BookOpen, 
  Calendar, 
  ChevronRight, 
  GraduationCap, 
  LayoutDashboard, 
  LineChart, 
  NotebookPen, 
  Settings, 
  Sparkles, 
  Users 
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
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
    title: "Study Planner",
    url: "/dashboard/planner",
    icon: Calendar,
    roles: ["student"],
  },
  {
    title: "Grading Assistant",
    url: "/dashboard/grading",
    icon: NotebookPen,
    roles: ["teacher"],
  },
  {
    title: "Course Registry",
    url: "/dashboard/courses",
    icon: BookOpen,
    roles: ["teacher"],
  },
  {
    title: "Performance",
    url: "/dashboard/performance",
    icon: LineChart,
  },
  {
    title: "Resource Generator",
    url: "/dashboard/resources",
    icon: Sparkles,
    roles: ["teacher"],
  },
  {
    title: "Student Registry",
    url: "/dashboard/registry",
    icon: Users,
    roles: ["teacher"],
  },
]

export function DashboardSidebar({ userRole }: { userRole: string }) {
  const pathname = usePathname()
  
  const filteredNavItems = navItems.filter(item => 
    !item.roles || item.roles.includes(userRole)
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="font-headline text-xl font-bold tracking-tight group-data-[collapsible=icon]:hidden">
            ScholAI
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
          <SidebarMenu>
            {filteredNavItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  asChild 
                  isActive={pathname === item.url}
                  tooltip={item.title}
                >
                  <Link href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Settings">
              <Settings />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
