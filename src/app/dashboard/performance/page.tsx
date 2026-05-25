"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Legend
} from "recharts"
import { Brain, TrendingUp, AlertTriangle, ArrowUpRight } from "lucide-react"

const performanceData = [
  { month: 'Jan', score: 72, predicted: 72 },
  { month: 'Feb', score: 75, predicted: 75 },
  { month: 'Mar', score: 71, predicted: 71 },
  { month: 'Apr', score: 78, predicted: 80 },
  { month: 'May', score: 82, predicted: 85 },
  { month: 'Jun', score: null, predicted: 88 },
  { month: 'Jul', score: null, predicted: 91 },
]

const subjectData = [
  { subject: 'Math', avg: 82, target: 85 },
  { subject: 'Science', avg: 74, target: 80 },
  { subject: 'English', avg: 88, target: 90 },
  { subject: 'History', avg: 79, target: 85 },
  { subject: 'Art', avg: 92, target: 90 },
]

export default function PerformanceDashboard() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-headline text-3xl font-bold text-primary">Predictive Performance</h2>
          <p className="text-muted-foreground">AI-calculated trends and upcoming academic outcomes.</p>
        </div>
        <div className="flex items-center gap-2 bg-accent/10 px-4 py-2 rounded-full border border-accent/20">
          <Brain className="h-5 w-5 text-accent" />
          <span className="text-sm font-semibold text-accent">AI Prediction Model Active</span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-primary to-indigo-900 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-primary-foreground/80 text-sm font-medium">Predicted Final Grade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold">A-</span>
              <span className="text-primary-foreground/60 text-sm">(3.74 GPA)</span>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs text-green-300">
              <TrendingUp className="h-3 w-3" />
              <span>Improving trend detected</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">Retention Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold">Low</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">98.2%</span>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">Based on attendance & engagement</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">Focus Areas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">Thermodynamics</span>
            </div>
            <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
              <div className="bg-yellow-500 h-full w-[45%]" />
            </div>
            <p className="mt-4 text-xs text-muted-foreground">42% mastery vs class avg 68%</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-xl">Score Trend & Prediction</CardTitle>
            <CardDescription>Historical performance with AI forecasting for next quarter.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                <YAxis hide domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(value) => [`${value}%`, 'Score']}
                />
                <Area type="monotone" dataKey="score" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorScore)" strokeWidth={3} />
                <Area type="monotone" dataKey="predicted" stroke="hsl(var(--accent))" fillOpacity={0.05} strokeDasharray="5 5" fill="hsl(var(--accent))" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-xl">Subject Mastery</CardTitle>
            <CardDescription>Current averages compared to predicted target milestones.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="subject" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                <YAxis hide />
                <Tooltip 
                   contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Legend iconType="circle" />
                <Bar dataKey="avg" name="Current Avg" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="target" name="Predicted Target" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
