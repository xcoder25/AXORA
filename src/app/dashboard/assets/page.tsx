"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, Book, Home, Bus, Warehouse, AlertCircle, Plus, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export default function AssetsPage() {
  const assets = [
    { name: 'Physics Lab Equipments', cat: 'Inventory', qty: '1,200 units', health: 92, status: 'Optimal' },
    { name: 'University Main Library', cat: 'Library', qty: '42,000 titles', health: 88, status: 'Optimal' },
    { name: 'Female Hostel Block A', cat: 'Hostel', qty: '240 beds', health: 75, status: 'Maintenance' },
    { name: 'Fleet Services', cat: 'Transport', qty: '12 vehicles', health: 98, status: 'Active' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="font-headline text-4xl font-bold text-white tracking-tight">Institutional Assets</h2>
          <p className="text-muted-foreground text-lg">Inventory, Library, Hostel, and Fleet management hub.</p>
        </div>
        <div className="flex gap-3 bg-white/5 p-1 rounded-2xl border border-white/10">
           <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
             <Input placeholder="Search assets..." className="h-9 w-48 pl-8 bg-transparent border-none text-xs" />
           </div>
           <Button size="sm" className="rounded-xl h-9">
             <Plus className="h-4 w-4 mr-2" /> Register Asset
           </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {assets.map((asset, i) => (
          <Card key={i} className="glass-card border-none hover:border-primary/40 transition-all group">
            <CardHeader className="pb-4">
               <div className="flex justify-between items-start">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    {asset.cat === 'Inventory' && <Warehouse className="h-5 w-5" />}
                    {asset.cat === 'Library' && <Book className="h-5 w-5" />}
                    {asset.cat === 'Hostel' && <Home className="h-5 w-5" />}
                    {asset.cat === 'Transport' && <Bus className="h-5 w-5" />}
                  </div>
                  <Badge className={asset.status === 'Optimal' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'}>
                    {asset.status}
                  </Badge>
               </div>
               <CardTitle className="text-sm font-bold text-white mt-4">{asset.name}</CardTitle>
               <CardDescription className="text-[10px] font-mono uppercase tracking-widest">{asset.qty}</CardDescription>
            </CardHeader>
            <CardContent>
               <div className="space-y-2">
                  <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                    <span>Condition Index</span>
                    <span className="text-white">{asset.health}%</span>
                  </div>
                  <Progress value={asset.health} className="h-1 bg-white/5" />
               </div>
            </CardContent>
            <CardFooter className="pt-0">
               <Button variant="ghost" className="w-full h-8 text-[9px] font-bold uppercase tracking-widest text-muted-foreground hover:text-white">
                 Asset Details
               </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="inventory" className="w-full">
        <TabsList className="grid w-full grid-cols-4 glass-card p-1 rounded-2xl h-12 border-white/5">
          <TabsTrigger value="inventory" className="rounded-xl font-bold uppercase tracking-widest text-[9px]">Inventory</TabsTrigger>
          <TabsTrigger value="library" className="rounded-xl font-bold uppercase tracking-widest text-[9px]">Library</TabsTrigger>
          <TabsTrigger value="hostel" className="rounded-xl font-bold uppercase tracking-widest text-[9px]">Hostels</TabsTrigger>
          <TabsTrigger value="fleet" className="rounded-xl font-bold uppercase tracking-widest text-[9px]">Fleet</TabsTrigger>
        </TabsList>
        <TabsContent value="inventory" className="mt-8">
           <Card className="glass-card border-none">
              <CardContent className="flex flex-col items-center justify-center py-24 opacity-30">
                <Warehouse className="h-12 w-12 mb-4" />
                <p className="font-bold uppercase tracking-widest text-[10px]">Decompressing inventory databases...</p>
              </CardContent>
           </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
