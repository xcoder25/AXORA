import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Users, GraduationCap, TrendingUp, Bell } from "lucide-react"

export default function DashboardPage() {
  const stats = [
    { title: "Active Students", value: "1,284", icon: Users, color: "text-blue-600" },
    { title: "Total Courses", value: "48", icon: BookOpen, color: "text-teal-600" },
    { title: "Graduation Rate", value: "94%", icon: GraduationCap, color: "text-indigo-600" },
    { title: "Performance Index", value: "+4.2%", icon: TrendingUp, color: "text-green-600" },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-headline text-3xl font-bold text-primary">Welcome back, Professor</h2>
        <p className="text-muted-foreground">Here is what is happening across ScholAI today.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">Updated 12 mins ago</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="font-headline">Recent Academic Activity</CardTitle>
            <CardDescription>Real-time updates from ongoing courses and submissions.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 rounded-lg border p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                    <Bell className="h-5 w-5 text-accent" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">New assignment submission</p>
                    <p className="text-xs text-muted-foreground">Advanced Physics - Section B • 5 mins ago</p>
                  </div>
                  <div className="text-xs font-medium text-accent">Review Now</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-headline">Quick Actions</CardTitle>
            <CardDescription>Tools to manage your day efficiently.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <button className="flex w-full items-center justify-between rounded-md border p-3 hover:bg-muted transition-colors text-sm font-medium">
              Create New Course Registry
              <ChevronRight className="h-4 w-4" />
            </button>
            <button className="flex w-full items-center justify-between rounded-md border p-3 hover:bg-muted transition-colors text-sm font-medium">
              Generate Weekly Study Plan
              <ChevronRight className="h-4 w-4" />
            </button>
            <button className="flex w-full items-center justify-between rounded-md border p-3 hover:bg-muted transition-colors text-sm font-medium">
              Run Performance Prediction
              <ChevronRight className="h-4 w-4" />
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" viewBox="0 0 24 24" 
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
      className={className}
    >
      <path d="m9 18 6-6-6-6"/>
    </svg>
  )
}
