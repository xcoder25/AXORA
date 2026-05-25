import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Users, GraduationCap, TrendingUp, Bell, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const stats = [
    { title: "Active Students", value: "1,284", icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
    { title: "Total Courses", value: "48", icon: BookOpen, color: "text-indigo-500", bg: "bg-indigo-50" },
    { title: "Graduation Rate", value: "94%", icon: GraduationCap, color: "text-emerald-500", bg: "bg-emerald-50" },
    { title: "Performance Index", value: "+4.2%", icon: TrendingUp, color: "text-violet-500", bg: "bg-violet-50" },
  ]

  const quickActions = [
    { title: "Create New Course Registry", icon: BookOpen, href: "/dashboard/courses" },
    { title: "Generate Weekly Study Plan", icon: GraduationCap, href: "/dashboard/planner" },
    { title: "Run Performance Prediction", icon: TrendingUp, href: "/dashboard/performance" },
  ]

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-2">
        <h2 className="font-headline text-4xl font-extrabold text-foreground tracking-tight">
          Welcome back, <span className="text-primary">Professor</span>
        </h2>
        <p className="text-muted-foreground text-lg">
          Here is what is happening across ScholAI today.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={stat.title} className={`border-none shadow-sm hover:shadow-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 delay-${i * 100}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{stat.title}</CardTitle>
              <div className={`p-2 rounded-xl ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tighter">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-emerald-500" />
                Updated 12 mins ago
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4 border-none shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/30 pb-4">
            <CardTitle className="font-headline text-2xl">Recent Academic Activity</CardTitle>
            <CardDescription>Real-time updates from ongoing courses and submissions.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 rounded-2xl border bg-card p-4 hover:bg-muted/50 transition-colors group">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Bell className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-semibold leading-none">New assignment submission</p>
                    <p className="text-xs text-muted-foreground">Advanced Physics - Section B • 5 mins ago</p>
                  </div>
                  <button className="text-xs font-bold text-primary hover:underline">Review Now</button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Quick Actions</CardTitle>
            <CardDescription>Tools to manage your day efficiently.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action, i) => (
              <Link 
                key={i} 
                href={action.href}
                className="flex w-full items-center justify-between rounded-xl border p-4 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 group"
              >
                <div className="flex items-center gap-3">
                  <action.icon className="h-5 w-5 opacity-60 group-hover:opacity-100" />
                  <span className="text-sm font-semibold">{action.title}</span>
                </div>
                <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0" />
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
