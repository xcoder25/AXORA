"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import {
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  LineChart,
  NotebookPen,
  Settings,
  Users,
  Wallet,
  Megaphone,
  Camera,
  Video,
  ClipboardList,
  Zap,
  GanttChartSquare,
  IdCard,
  Brain,
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
  title: string
  url: string
  icon: React.ComponentType<{ className?: string }>
  roles?: string[]
}

const navItems: NavItem[] = [
  { title: "Overview", url: "/dashboard", icon: LayoutDashboard },
  { title: "NEXORA AI Hub", url: "/dashboard/nexora", icon: Brain, roles: ["admin"] },
  { title: "Finance Hub", url: "/dashboard/finance", icon: Wallet, roles: ["admin", "parent"] },
  { title: "Academic Engine", url: "/dashboard/academic", icon: GanttChartSquare, roles: ["admin", "teacher"] },
  { title: "Workflows", url: "/dashboard/workflows", icon: Zap, roles: ["admin"] },
  { title: "Payroll", url: "/dashboard/payroll", icon: Wallet, roles: ["admin"] },
  { title: "Comms", url: "/dashboard/communication", icon: Megaphone },
  { title: "Identity Matrix", url: "/dashboard/attendance", icon: Camera, roles: ["admin", "teacher"] },
  { title: "ID Cards", url: "/dashboard/id-cards", icon: IdCard },
  { title: "Security", url: "/dashboard/security", icon: Video, roles: ["admin"] },
  { title: "CBT Exams", url: "/dashboard/exams", icon: ClipboardList },
  { title: "Grading", url: "/dashboard/grading", icon: NotebookPen, roles: ["teacher", "admin"] },
  { title: "Courses", url: "/dashboard/courses", icon: BookOpen },
  { title: "Performance", url: "/dashboard/performance", icon: LineChart },
  { title: "Registry", url: "/dashboard/registry", icon: Users, roles: ["teacher", "admin"] },
]

export function DashboardSidebar({
  userRole,
  schoolLogo,
  schoolName,
}: {
  userRole: string
  schoolLogo?: string
  schoolName?: string
}) {
  const pathname = usePathname()
  const filteredNavItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(userRole)
  )

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-sidebar-border bg-sidebar-background/75 backdrop-blur-2xl transition-all duration-300 shadow-[4px_0_24px_rgba(0,0,0,0.15)]"
    >
      <SidebarHeader className="px-4 py-6">
        <div className="flex items-center gap-3">
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-indigo-md transition-transform duration-300 hover:scale-105">
            {schoolLogo ? (
              schoolLogo.startsWith('data:') ? (
                <img
                  src={schoolLogo}
                  alt={schoolName || "Logo"}
                  className="h-full w-full object-contain p-2"
                />
              ) : (
                <Image src={schoolLogo} alt={schoolName || "Logo"} fill className="object-contain p-2" />
              )
            ) : (
              <GraduationCap className="h-5 w-5" />
            )}
          </div>
          <div className="flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
            <span className="truncate font-bold text-sm tracking-tight text-sidebar-foreground">
              {schoolName || "Axora"}
            </span>
            <span className="text-[8px] font-bold uppercase tracking-widest text-sidebar-primary">
              Institutional OS
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="mb-2 px-3 text-[9px] font-bold uppercase tracking-widest text-sidebar-foreground/60">
            Navigation
          </SidebarGroupLabel>
          <SidebarMenu className="gap-1">
            {filteredNavItems.map((item, i) => (
              <SidebarMenuItem
                key={item.title}
                className="animate-in fade-in slide-in-from-left-2 fill-mode-both"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.url}
                  tooltip={item.title}
                  className={cn(
                    "h-10 rounded-xl px-3 transition-all duration-300",
                    pathname === item.url
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md hover:bg-sidebar-primary hover:text-sidebar-primary-foreground"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <Link href={item.url} className="flex items-center gap-3">
                    <item.icon
                      className={cn(
                        "h-4 w-4 shrink-0 transition-transform duration-300 group-hover:scale-110",
                        pathname === item.url ? "text-sidebar-primary-foreground" : "text-sidebar-primary"
                      )}
                    />
                    <span className="font-semibold text-[10px] uppercase tracking-wider">
                      {item.title}
                    </span>
                    {item.url === '/dashboard/nexora' && pathname !== item.url && (
                      <span className="ml-auto rounded-md bg-violet-500/20 px-1.5 py-0.5 text-[7px] font-black uppercase text-violet-400">AI</span>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="h-10 rounded-xl px-3 text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
              <Link href="/dashboard/settings" className="flex items-center gap-3">
                <Settings className="h-4 w-4" />
                <span className="font-semibold text-[10px] uppercase tracking-wider">Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
