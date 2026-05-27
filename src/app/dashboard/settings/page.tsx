"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useFirestore, useDoc } from "@/firebase"
import { doc, setDoc, updateDoc } from "firebase/firestore"
import { 
  Settings, CreditCard, Shield, Sparkles, Check, 
  Building, RefreshCw, Key, ShieldAlert, Cpu
} from "lucide-react"

export default function SettingsPage() {
  const db = useFirestore()
  const [activeTab, setActiveTab] = useState("payment")
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  // Settings State Form
  const [paystackPub, setPaystackPub] = useState("")
  const [paystackSec, setPaystackSec] = useState("")
  const [currency, setCurrency] = useState("NGN")
  const [webhookUrl, setWebhookUrl] = useState("")

  const [institutionName, setInstitutionName] = useState("")
  const [contactEmail, setContactEmail] = useState("")

  // Fetch configs
  useEffect(() => {
    // Standard mock or placeholder to populate config state values
    setWebhookUrl(`${window.location.origin}/api/paystack/webhook`)
    setPaystackPub("pk_test_a9e88dbac78b65eef83a992d")
    setPaystackSec("••••••••••••••••••••••••••••••••••••••••")
    setInstitutionName("Axora Academy")
    setContactEmail("finance@axora.edu")
  }, [])

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSuccess(false)
    
    // Simulate updating gateway options block inside active school document record
    setTimeout(() => {
      setSaving(false)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }, 1200)
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-5xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5 uppercase tracking-widest text-[9px] font-bold">
              System Control Console
            </Badge>
            <Shield className="h-3 w-3 text-primary animate-pulse" />
          </div>
          <h2 className="font-headline text-4xl font-bold text-white tracking-tight">Settings</h2>
          <p className="text-muted-foreground text-lg">System node operations, security keys, and gateway credentials.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 glass-card p-1 rounded-2xl h-12 border-white/5">
          <TabsTrigger value="payment" className="rounded-xl font-bold uppercase tracking-widest text-[9px] flex items-center gap-1.5"><CreditCard className="h-3.5 w-3.5" /> Payment Gateway</TabsTrigger>
          <TabsTrigger value="institution" className="rounded-xl font-bold uppercase tracking-widest text-[9px] flex items-center gap-1.5"><Building className="h-3.5 w-3.5" /> Institution Info</TabsTrigger>
          <TabsTrigger value="security" className="rounded-xl font-bold uppercase tracking-widest text-[9px] flex items-center gap-1.5"><ShieldAlert className="h-3.5 w-3.5" /> Nodes & Security</TabsTrigger>
        </TabsList>

        {/* Tab 1: Payment Gateway Settings */}
        <TabsContent value="payment" className="mt-8 space-y-6 animate-in fade-in duration-300">
          <form onSubmit={handleSaveSettings}>
            <Card className="glass-card border-none">
              <CardHeader className="bg-primary/10 border-b border-white/5 p-6">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-primary font-mono">Fintech Core Configuration</span>
                </div>
                <CardTitle className="text-xl text-white">Paystack API Gateway Integration</CardTitle>
                <CardDescription className="text-xs">Setup local transaction networks, active currency codes and verify credentials.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Paystack Public Key</Label>
                    <div className="relative">
                      <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
                      <Input
                        value={paystackPub}
                        onChange={e => setPaystackPub(e.target.value)}
                        className="bg-white/5 border-white/10 h-11 pl-10 rounded-xl text-xs font-mono"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Paystack Secret Key</Label>
                    <div className="relative">
                      <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
                      <Input
                        type="password"
                        value={paystackSec}
                        onChange={e => setPaystackSec(e.target.value)}
                        className="bg-white/5 border-white/10 h-11 pl-10 rounded-xl text-xs font-mono"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 pt-2">
                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Primary Settlement Currency</Label>
                    <select
                      value={currency}
                      onChange={e => setCurrency(e.target.value)}
                      className="flex h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      <option value="NGN" className="bg-slate-900">NGN (Nigerian Naira ₦)</option>
                      <option value="GHS" className="bg-slate-900">GHS (Ghanaian Cedi ₵)</option>
                      <option value="ZAR" className="bg-slate-900">ZAR (South African Rand R)</option>
                      <option value="USD" className="bg-slate-900">USD (United States Dollar $)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Calculated API Endpoint Status</Label>
                    <div className="h-11 border border-white/5 bg-white/3 rounded-xl flex items-center justify-between px-4">
                      <span className="text-[10px] text-muted-foreground font-mono">https://api.paystack.co/</span>
                      <Badge className="bg-emerald-500/10 text-emerald-400 border-none text-[8px] tracking-wider uppercase font-black">Connected</Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 pt-3 border-t border-white/5">
                  <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Paystack Webhook Endpoint (For automated ledger updates)</Label>
                  <Input
                    value={webhookUrl}
                    readOnly
                    className="bg-white/3 border-white/10 h-11 rounded-xl text-xs font-mono text-muted-foreground"
                  />
                  <p className="text-[9px] text-muted-foreground mt-1">Copy this webhook URL directly into your Paystack Dashboard settings area under Webhook URL field.</p>
                </div>
              </CardContent>
              <CardFooter className="p-6 border-t border-white/5 flex justify-between items-center bg-white/3">
                <span className="text-[9px] font-mono text-muted-foreground/60">NODE ID: GW_PAYSTACK_ACTIVE</span>
                <Button type="submit" className="rounded-xl h-11 px-6 font-bold uppercase text-[9px] tracking-widest shadow-lg" disabled={saving}>
                  {saving ? <><RefreshCw className="mr-2 h-3.5 w-3.5 animate-spin" /> Committing...</> : 
                   success ? <><Check className="mr-2 h-3.5 w-3.5" /> Committed Successfully</> : 
                   "Save Gateway Settings"}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>

        {/* Tab 2: Institution Settings */}
        <TabsContent value="institution" className="mt-8 space-y-6 animate-in fade-in duration-300">
          <Card className="glass-card border-none">
            <CardHeader className="bg-primary/10 border-b border-white/5 p-6">
              <CardTitle className="text-xl text-white">Institution Profile Node</CardTitle>
              <CardDescription className="text-xs">Operational identifiers and metadata parameters.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Institutional Name</Label>
                  <Input value={institutionName} onChange={e => setInstitutionName(e.target.value)} className="bg-white/5 border-white/10 h-11 rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Primary Support / Billing Email</Label>
                  <Input value={contactEmail} onChange={e => setContactEmail(e.target.value)} className="bg-white/5 border-white/10 h-11 rounded-xl" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-6 border-t border-white/5 flex justify-between items-center bg-white/3">
              <span className="text-[9px] font-mono text-muted-foreground/60">Registry reference sync</span>
              <Button onClick={() => alert("Settings Committed")} className="rounded-xl h-10 px-6 font-bold uppercase text-[9px] tracking-widest">
                Save Profile
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Tab 3: Operational Node Status */}
        <TabsContent value="security" className="mt-8 space-y-6 animate-in fade-in duration-300">
          <Card className="glass-card border-none">
            <CardHeader className="bg-primary/10 border-b border-white/5 p-6">
              <CardTitle className="text-xl text-white">Security & Operational Node Status</CardTitle>
              <CardDescription className="text-xs">Real-time surveillance microservice parameters and API server connections.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { label: "Surveillance Pipeline", value: "Operational", desc: "FastAPI + YOLOv8 Active", color: "text-emerald-400 bg-emerald-500/10" },
                  { label: "Go2RTC Core Stream Proxy", value: "Connected", desc: "Ports 1984 & 8554 Binded", color: "text-emerald-400 bg-emerald-500/10" },
                  { label: "Primary Database Connection", value: "Stable Pool", desc: "Firestore Sync Active", color: "text-emerald-400 bg-emerald-500/10" }
                ].map((node, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-white/3 border border-white/5 text-center">
                    <Cpu className="h-6 w-6 text-primary mx-auto mb-2 animate-pulse" />
                    <p className="text-[10px] font-bold text-white uppercase">{node.label}</p>
                    <Badge className={cn("text-[8px] font-black uppercase mt-2 border-none", node.color)}>{node.value}</Badge>
                    <p className="text-[9px] text-muted-foreground mt-1.5">{node.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
