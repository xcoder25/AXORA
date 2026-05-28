"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  Wallet, TrendingUp, Plus, Download, Clock, RefreshCw, User, Loader2
} from "lucide-react"
import { useFirestore, useUser, useDoc, useCollection, useMemoFirebase } from "@/firebase"
import { collection, query, where, doc, setDoc } from "firebase/firestore"

// Declare Paystack global variable
declare global {
  interface Window {
    PaystackPop: any
  }
}

export default function PayrollPage() {
  const { user } = useUser()
  const db = useFirestore()
  const { data: profile } = useDoc(user ? `users/${user.uid}` : null)
  const { data: school } = useDoc(profile?.schoolId ? `schools/${profile.schoolId}` : null)

  const [processingId, setProcessingId] = useState<string | null>(null)
  const [runningCycle, setRunningCycle] = useState(false)

  // 1. Fetch real-time teachers
  const staffQuery = useMemoFirebase(() => {
    if (!db || !profile?.schoolId) return null
    return query(
      collection(db, "users"),
      where("role", "==", "teacher"),
      where("schoolId", "==", profile.schoolId)
    )
  }, [db, profile?.schoolId])

  const { data: staffList, loading: staffLoading } = useCollection(staffQuery)

  // 2. Fetch real-time payroll ledger disbursements
  const payrollQuery = useMemoFirebase(() => {
    if (!db || !profile?.schoolId) return null
    return query(
      collection(db, "payroll"),
      where("schoolId", "==", profile.schoolId)
    )
  }, [db, profile?.schoolId])

  const { data: payrollHistory, loading: historyLoading } = useCollection(payrollQuery)

  // Dynamic Paystack inline script loading
  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://js.paystack.co/v1/inline.js"
    script.async = true
    document.body.appendChild(script)
    return () => {
      document.body.removeChild(script)
    }
  }, [])

  // Process disbursement using real Paystack popup
  const handleDisburse = (staff: any) => {
    if (typeof window === "undefined" || !window.PaystackPop) {
      alert("Paystack SDK is loading. Please try again in a few seconds.")
      return
    }

    if (!school?.paystackPub) {
      alert("Paystack Public Key is not configured! Please set it in Settings → Payment Gateway first.")
      return
    }

    setProcessingId(staff.uid || staff.id)

    const baseSalary = staff.salary || 4000
    const bonus = 100
    const totalAmount = baseSalary + bonus
    const currency = school.currency || "NGN"

    const handler = window.PaystackPop.setup({
      key: school.paystackPub,
      email: staff.email || "faculty@axora.edu",
      amount: totalAmount * 100, // Convert to kobo/cents
      currency: currency,
      ref: "PAYROLL_" + Math.random().toString(36).substring(2, 12).toUpperCase(),
      callback: async function (response: any) {
        try {
          const docRef = doc(collection(db, "payroll"))
          await setDoc(docRef, {
            id: docRef.id,
            staffId: staff.uid || staff.id,
            staffName: staff.displayName || "Faculty Member",
            role: staff.role || "teacher",
            base: baseSalary,
            bonus: bonus,
            status: "disbursed",
            date: new Date().toISOString().split("T")[0],
            schoolId: profile?.schoolId || "",
            reference: response.reference,
            createdAt: new Date().toISOString()
          })
          alert(`Disbursement of ${currency} ${totalAmount.toLocaleString()} to ${staff.displayName} completed successfully!`)
        } catch (err) {
          console.error("Error logging payroll:", err)
        } finally {
          setProcessingId(null)
        }
      },
      onClose: function () {
        setProcessingId(null)
      }
    })
    handler.openIframe()
  }

  // Simulate a full cycle batch run
  const runPayrollCycle = async () => {
    if (!staffList || staffList.length === 0 || !profile?.schoolId || !db) return
    setRunningCycle(true)

    try {
      const pendingStaff = staffList.filter(s => {
        const lastRecord = payrollHistory?.find(h => h.staffId === (s.uid || s.id))
        return !lastRecord
      })

      if (pendingStaff.length === 0) {
        alert("All faculty members have already been paid for this cycle.")
        setRunningCycle(false)
        return
      }

      // Write simulated disbursements
      for (const staff of pendingStaff) {
        const docRef = doc(collection(db, "payroll"))
        await setDoc(docRef, {
          id: docRef.id,
          staffId: staff.uid || staff.id,
          staffName: staff.displayName || "Faculty Member",
          role: "teacher",
          base: staff.salary || 4000,
          bonus: 100,
          status: "disbursed",
          date: new Date().toISOString().split("T")[0],
          schoolId: profile.schoolId,
          reference: "SIM_BATCH_" + Math.random().toString(36).substring(2, 10).toUpperCase(),
          createdAt: new Date().toISOString()
        })
      }
      alert(`Successfully processed payroll cycle for ${pendingStaff.length} pending faculty members!`)
    } catch (err) {
      console.error("Error running payroll cycle:", err)
    } finally {
      setRunningCycle(false)
    }
  }

  // Compute stats
  const totalMonthlyPayroll = payrollHistory?.reduce((sum, item) => sum + (item.base || 0) + (item.bonus || 0), 0) || 0
  const paidCount = payrollHistory?.length || 0
  const totalStaffCount = staffList?.length || 0
  const pendingCount = Math.max(0, totalStaffCount - paidCount)
  const pendingAmount = pendingCount * 4100 // avg salary estimate

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="font-headline text-4xl font-bold text-white tracking-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.45)]">HR & Payroll</h2>
          <p className="text-muted-foreground text-lg">Manage institutional staff accounts, benefits, and salary disbursement.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white">
            <Download className="mr-2 h-4 w-4" /> Export Report
          </Button>
          <Button onClick={runPayrollCycle} disabled={runningCycle} className="rounded-xl shadow-lg shadow-primary/20 bg-primary hover:bg-primary/80">
            {runningCycle ? <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Committing Cycle...</> : <><Plus className="mr-2 h-4 w-4" /> Run Payroll Cycle</>}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Monthly Disbursed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">${totalMonthlyPayroll.toLocaleString()}</div>
            <p className="text-[9px] text-emerald-400 font-bold uppercase mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> Real-time active ledger
            </p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Pending Disbursement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">${pendingAmount.toLocaleString()}</div>
            <p className="text-[9px] text-orange-400 font-bold uppercase mt-1 flex items-center gap-1">
              <Clock className="h-3 w-3 animate-pulse" /> {pendingCount} Accounts Awaiting
            </p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Gateway Provider</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-400">{school?.paystackPub ? "Paystack" : "Not Set"}</div>
            <p className="text-[9px] text-muted-foreground font-bold uppercase mt-1">Currency: {school?.currency || "NGN"}</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total Staff Count</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{totalStaffCount}</div>
            <p className="text-[9px] text-primary font-bold uppercase mt-1">Faculty Records Enrolled</p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card border-none">
        <CardHeader>
          <CardTitle className="text-xl text-white">Faculty Salary Ledger</CardTitle>
          <CardDescription>Cycle: Current - Professional & Support Staff</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow className="border-white/10">
                <TableHead className="text-[10px] font-bold uppercase text-muted-foreground">Member</TableHead>
                <TableHead className="text-[10px] font-bold uppercase text-muted-foreground">Department</TableHead>
                <TableHead className="text-[10px] font-bold uppercase text-muted-foreground">Base Salary</TableHead>
                <TableHead className="text-[10px] font-bold uppercase text-muted-foreground">Adjustments</TableHead>
                <TableHead className="text-[10px] font-bold uppercase text-muted-foreground">Status</TableHead>
                <TableHead className="text-[10px] font-bold uppercase text-muted-foreground text-right">Action / Net Pay</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staffList?.map((staff) => {
                const payrollRecord = payrollHistory?.find(h => h.staffId === (staff.uid || staff.id))
                const isPaid = !!payrollRecord
                const base = staff.salary || 4000
                const bonus = 100
                const net = base + bonus

                return (
                  <TableRow key={staff.uid || staff.id} className="border-white/5 hover:bg-white/5 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full border border-white/10 overflow-hidden bg-white/5 flex items-center justify-center">
                          {staff.imageUrl ? (
                            <img src={staff.imageUrl} alt={staff.displayName} className="h-full w-full object-cover" />
                          ) : (
                            <User className="h-5 w-5 text-indigo-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{staff.displayName || "Faculty Member"}</p>
                          <p className="text-[9px] text-muted-foreground font-mono">{(staff.uid || staff.id)?.slice(0, 10).toUpperCase()}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{staff.department || "General Sciences"}</TableCell>
                    <TableCell className="text-xs text-white/90">${base.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[9px] border-emerald-500/20 text-emerald-500">
                        +${bonus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={isPaid ? "bg-emerald-500/10 text-emerald-500 border-none" : "bg-orange-500/10 text-orange-500 border-none"}>
                        {isPaid ? "disbursed" : "pending"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {isPaid ? (
                        <div className="text-right">
                          <span className="font-bold text-white text-sm">${net.toLocaleString()}</span>
                          <p className="text-[8px] text-muted-foreground font-mono">Ref: {payrollRecord.reference?.slice(0,12)}</p>
                        </div>
                      ) : (
                        <Button 
                          onClick={() => handleDisburse(staff)} 
                          disabled={processingId === (staff.uid || staff.id)}
                          className="h-8 rounded-xl px-4 text-[9px] font-bold uppercase tracking-wider bg-indigo-600 hover:bg-indigo-700"
                        >
                          {processingId === (staff.uid || staff.id) ? (
                            <RefreshCw className="h-3 w-3 animate-spin" />
                          ) : (
                            <>Disburse Salary</>
                          )}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          {staffLoading && (
             <div className="py-20 flex flex-col items-center justify-center gap-4 opacity-50">
               <Loader2 className="h-8 w-8 animate-spin text-primary" />
               <p className="text-[10px] font-bold uppercase tracking-widest text-white">Synchronizing Payroll Data...</p>
             </div>
          )}
          {!staffLoading && (!staffList || staffList.length === 0) && (
            <div className="py-20 text-center opacity-40">
              <Wallet className="h-12 w-12 mx-auto mb-3 text-indigo-400" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-white">No faculty members enrolled</p>
              <p className="text-[9px] mt-1 text-muted-foreground">Add faculty staff in the Registry tab to populate payroll ledger.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
