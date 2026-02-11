"use client"

import * as React from "react"
import { TopNav } from "@/components/dashboard/top-nav"
import { DashboardCharts } from "@/components/dashboard/stats-charts"
import { SubscriptionList } from "@/components/subscription/subscription-list"
import { VoiceCreator } from "@/components/gen-ai/voice-creator"
import { AIRecommendations } from "@/components/gen-ai/recommendations"
import { SubscriptionsAtRisk } from "@/components/dashboard/risk-widget"
import { Button } from "@/components/ui/button"
import { Plus, Download, TrendingUp, Calendar, Lightbulb, Hourglass, FileText, ShieldCheck, Zap } from "lucide-react"
import { Toaster } from "@/components/ui/toaster"
import { AddSubscriptionModal } from "@/components/subscription/add-subscription-modal"
import { useSubscriptions } from "@/context/subscriptions-context"
import { Card, CardContent } from "@/components/ui/card"
import { SetupWizard } from "@/components/setup-wizard"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

export default function Home() {
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false)
  const { subscriptions, exportData, settings, convertAmount } = useSubscriptions()
  const { toast } = useToast()

  const totalMonthlyILS = subscriptions
    .filter(s => s.status === 'active' || s.status === 'trial')
    .reduce((sum, s) => sum + convertAmount(s.amount, s.currency), 0)

  const upcomingRenewals = subscriptions.filter(s => {
    const renewal = new Date(s.renewalDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const diff = renewal.getTime() - today.getTime()
    return diff >= 0 && diff < 7 * 24 * 60 * 60 * 1000
  }).length

  const trialCount = subscriptions.filter(s => s.status === 'trial').length

  const handleGenerateDraft = () => {
    const activeSubs = subscriptions.filter(s => s.status === 'active' || s.status === 'trial');
    const total = activeSubs.reduce((sum, s) => sum + convertAmount(s.amount, s.currency), 0);
    
    const subListText = activeSubs.map(s => `• ${s.name}: ${s.amount}${s.currency} (≈ ₪${convertAmount(s.amount, s.currency).toFixed(1)})`).join('\n');
    
    const subject = encodeURIComponent("סיכום מינויים שבועי - PandaSub IL");
    const body = encodeURIComponent(
      `שלום ${settings.userName},\n\nלהלן סיכום המינויים הפעילים שלך:\n\n${subListText}\n\nסה"כ חודשי (משוקלל): ₪${total.toLocaleString()}\n\nנשלח מ-PandaSub IL`
    );

    window.location.href = `mailto:${settings.userEmail}?subject=${subject}&body=${body}`;
    
    toast({
      title: "טיוטת מייל נוצרה",
      description: "אפליקציית המייל נפתחה עם הנתונים המומרים שלך.",
    })
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] dark:bg-zinc-950">
      <SetupWizard />
      <TopNav />
      <main className="flex-1 container mx-auto p-4 md:p-8 space-y-6 animate-fade-in pb-20">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="text-right">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground">שלום, {settings.userName.split(' ')[0]}! 👋</h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base font-medium">יש לך {subscriptions.length} מינויים רשומים במערכת.</p>
          </div>
          <div className="flex items-center gap-2 md:gap-3 justify-end">
            <Button onClick={() => setIsAddModalOpen(true)} className="rounded-full google-btn gap-2 shadow-lg h-10 px-6 text-sm font-black">
              <Plus className="h-4 w-4" /> הוסף מינוי
            </Button>
            <Button variant="outline" onClick={handleGenerateDraft} className="rounded-full gap-2 border-primary/20 hover:bg-primary/5 text-primary h-10 px-5 bg-white text-sm font-bold shadow-sm">
              <FileText className="h-4 w-4" /> טיוטה
            </Button>
            <Button variant="ghost" onClick={exportData} className="rounded-full gap-2 text-muted-foreground h-10 px-4 text-sm font-bold hidden sm:flex">
              <Download className="h-4 w-4" /> ייצוא
            </Button>
          </div>
        </div>

        {/* Action Row - Side by side, equal height, smaller */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <Card className="border-none shadow-lg bg-gradient-to-br from-primary to-blue-700 text-white rounded-3xl overflow-hidden relative group h-[220px] flex items-center">
            <CardContent className="p-6 md:p-8 flex flex-row justify-between items-center gap-6 relative z-10 w-full">
              <div className="text-right space-y-3 flex-1">
                <div className="inline-flex items-center gap-2 bg-white/20 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest">
                  Panda AI Automation
                </div>
                <h3 className="text-xl md:text-2xl font-black">פעולה מהירה 🐼</h3>
                <p className="text-xs md:text-sm opacity-90 leading-relaxed max-w-sm font-medium">
                  סרוק חשבונית או השתמש בהוספה קולית כדי לעדכן את המערכת באופן מיידי.
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <Button 
                    variant="secondary" 
                    onClick={() => setIsAddModalOpen(true)} 
                    className="rounded-full font-black px-6 h-10 shadow-lg bg-white text-primary hover:bg-zinc-100 transition-all border-none text-xs"
                  >
                    <ShieldCheck className="ml-2 h-4 w-4" /> סריקת AI
                  </Button>
                  <Button 
                    variant="outline"
                    className="rounded-full border-2 border-white/50 text-white hover:bg-white/10 font-black px-6 h-10 transition-all text-xs"
                  >
                    <Zap className="ml-2 h-4 w-4" /> הוספה קולית
                  </Button>
                </div>
              </div>
              <div className="opacity-10 pointer-events-none shrink-0 hidden sm:block">
                <ShieldCheck className="h-24 w-24 text-white stroke-[1]" />
              </div>
            </CardContent>
          </Card>

          <div className="h-[220px] overflow-hidden">
            <AIRecommendations compact />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <StatCard 
            title='סה"כ חודשי' 
            value={totalMonthlyILS.toLocaleString(undefined, { maximumFractionDigits: 0 })} 
            symbol="₪"
            icon={<TrendingUp className="text-primary h-4 w-4" />}
            trend="↓ 12%"
            color="bg-primary/10"
          />
          <StatCard 
            title='חידושים קרובים' 
            value={`${upcomingRenewals}`} 
            icon={<Calendar className="text-[#4CAF50] h-4 w-4" />}
            trendDesc="ב-7 הימים הקרובים"
            color="bg-[#4CAF50]/10"
          />
          <StatCard 
            title='חיסכון אפשרי' 
            value={`1,420`} 
            symbol="₪"
            icon={<Lightbulb className="text-[#FF9800] h-4 w-4" />}
            trendDesc="לפי Panda AI"
            color="bg-[#FF9800]/10"
          />
          <StatCard 
            title='תקופות ניסיון' 
            value={`${trialCount}`} 
            icon={<Hourglass className="text-[#E91E63] h-4 w-4" />}
            trendDesc="דורש תשומת לב"
            color="bg-[#E91E63]/10"
          />
        </div>

        {/* Main Content Area */}
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <DashboardCharts />
            <div className="flex items-center justify-between pt-2">
              <h2 className="text-xl font-black text-right w-full text-foreground border-r-4 border-primary pr-3">ניהול מינויים פעילים</h2>
            </div>
            <SubscriptionList />
          </div>

          <div className="space-y-6">
            <SubscriptionsAtRisk />
            <VoiceCreator />
          </div>
        </div>
      </main>

      <footer className="border-t bg-white dark:bg-zinc-900 py-10 text-center mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-2 font-bold text-primary mb-4">
            <div className="bg-primary text-white h-8 w-8 rounded-2xl flex items-center justify-center text-lg shadow-lg">🐼</div>
            <span className="text-xl font-black tracking-tight">PandaSub IL</span>
          </div>
          <p className="text-sm text-muted-foreground font-medium opacity-70">© 2025 כל הזכויות שמורות. נבנה עבורך בביטחון מלא.</p>
        </div>
      </footer>
      <AddSubscriptionModal open={isAddModalOpen} onOpenChange={setIsAddModalOpen} />
      <Toaster />
    </div>
  )
}

function StatCard({ title, value, symbol, icon, trend, trendDesc, color }: any) {
  const fontSize = value.length > 8 ? 'text-lg' : value.length > 5 ? 'text-xl' : 'text-2xl md:text-3xl';

  return (
    <Card className="shadow-sm border-none rounded-2xl overflow-hidden group transition-all hover:shadow-md dark:bg-zinc-900 bg-white h-full">
      <CardContent className="p-4 text-right flex flex-col justify-between h-full">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className={`p-1.5 rounded-lg ${color} group-hover:scale-110 transition-transform duration-300 shadow-sm shrink-0`}>
              {icon}
            </div>
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest truncate ml-2">{title}</span>
          </div>
          <div className="flex items-baseline justify-end gap-1 tabular-nums flex-wrap overflow-hidden">
            <div className={cn("font-black text-foreground leading-none", fontSize)}>
              {value}
            </div>
            {symbol && <div className="text-base font-black text-primary shrink-0">{symbol}</div>}
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2 justify-end overflow-hidden">
          {trend && <span className="text-[9px] font-black text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full shrink-0 border border-green-100">{trend}</span>}
          <span className="text-[9px] font-bold text-muted-foreground opacity-70 truncate">{trendDesc}</span>
        </div>
      </CardContent>
    </Card>
  )
}
