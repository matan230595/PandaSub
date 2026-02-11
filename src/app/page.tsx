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
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] dark:bg-zinc-950 overflow-x-hidden">
      <SetupWizard />
      <TopNav />
      <main className="flex-1 container mx-auto p-4 md:p-8 space-y-6 animate-fade-in pb-20 overflow-x-hidden">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="text-right">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">שלום, {settings.userName.split(' ')[0]}! 👋</h1>
            <p className="text-muted-foreground mt-1 text-base">יש לך {subscriptions.length} מינויים רשומים במערכת.</p>
          </div>
          <div className="flex items-center gap-3 flex-row-reverse">
            <Button onClick={() => setIsAddModalOpen(true)} className="rounded-full google-btn gap-2 shadow-lg h-11 px-6">
              <Plus className="h-5 w-5" /> הוסף מינוי
            </Button>
            <Button variant="outline" onClick={handleGenerateDraft} className="rounded-full gap-2 border-primary/20 hover:bg-primary/5 text-primary h-11 px-5 bg-white">
              <FileText className="h-4 w-4" /> טיוטה
            </Button>
            <Button variant="ghost" onClick={exportData} className="rounded-full gap-2 text-muted-foreground h-11 px-4">
              <Download className="h-4 w-4" /> ייצוא
            </Button>
          </div>
        </div>

        {/* Quick Actions & AI Card Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-none card-shadow bg-gradient-to-br from-primary to-blue-700 text-white rounded-[2.5rem] overflow-hidden relative group min-h-[140px]">
            <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 h-full">
              <div className="text-right space-y-3 z-10 flex-1 w-full">
                <h3 className="text-xl font-black">פעולה מהירה 🐼</h3>
                <p className="text-sm opacity-90 leading-relaxed max-w-lg">
                  צריך להוסיף מינוי? אמור ל-Panda AI או סרוק את החשבונית.
                </p>
                <div className="flex flex-wrap gap-3 pt-1 justify-end">
                  <Button 
                    variant="secondary" 
                    onClick={() => setIsAddModalOpen(true)} 
                    className="rounded-full font-bold px-5 h-10 shadow-xl text-primary bg-white hover:bg-zinc-100 transition-all text-xs"
                  >
                    <ShieldCheck className="ml-2 h-4 w-4" /> סריקת AI
                  </Button>
                  <Button 
                    variant="outline" 
                    className="rounded-full border-white/40 text-white hover:bg-white/10 font-bold px-5 h-10 transition-all bg-transparent text-xs"
                  >
                    <Zap className="ml-2 h-4 w-4" /> הוספה קולית
                  </Button>
                </div>
              </div>
              
              <div className="relative hidden md:flex items-center justify-center shrink-0">
                <div className="bg-white/10 p-4 rounded-[1.5rem] backdrop-blur-sm border border-white/20 shadow-inner group-hover:scale-105 transition-transform duration-500">
                  <ShieldCheck className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="h-full min-h-[140px] min-w-0">
            <AIRecommendations />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            title='סה"כ חודשי (משוקלל)' 
            value={totalMonthlyILS.toLocaleString(undefined, { maximumFractionDigits: 0 })} 
            symbol="₪"
            icon={<TrendingUp className="text-primary h-5 w-5" />}
            trend="↓ 12%"
            trendDesc="מהחודש הקודם"
            color="bg-primary/10"
          />
          <StatCard 
            title='חידושים קרובים' 
            value={`${upcomingRenewals}`} 
            icon={<Calendar className="text-[#4CAF50] h-5 w-5" />}
            trendDesc="ב-7 הימים הקרובים"
            color="bg-[#4CAF50]/10"
          />
          <StatCard 
            title='חיסכון אפשרי' 
            value={`1,420`} 
            symbol="₪"
            icon={<Lightbulb className="text-[#FF9800] h-5 w-5" />}
            trendDesc="לפי Panda AI"
            color="bg-[#FF9800]/10"
          />
          <StatCard 
            title='תקופות ניסיון' 
            value={`${trialCount}`} 
            icon={<Hourglass className="text-[#E91E63] h-5 w-5" />}
            trendDesc="דורש תשומת לב"
            color="bg-[#E91E63]/10"
          />
        </div>

        {/* Middle Section: Charts & List */}
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6 min-w-0 overflow-hidden">
            <DashboardCharts />
            <div className="flex items-center justify-between pt-4">
              <h2 className="text-2xl font-black text-right w-full text-foreground border-r-4 border-primary pr-4">מינויים אחרונים</h2>
            </div>
            <div className="w-full min-w-0 overflow-hidden">
              <SubscriptionList />
            </div>
          </div>

          <div className="space-y-6 min-w-0">
            <SubscriptionsAtRisk />
            <VoiceCreator />
          </div>
        </div>
      </main>

      <footer className="border-t bg-white dark:bg-zinc-900 py-10 text-center mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-2 font-bold text-primary mb-4">
            <div className="bg-primary text-white h-8 w-8 rounded-xl flex items-center justify-center text-lg shadow-lg">🐼</div>
            <span className="text-xl font-black tracking-tight">PandaSub IL</span>
          </div>
          <p className="text-sm text-muted-foreground font-medium mb-2">© 2025 כל הזכויות שמורות. נבנה באהבה בישראל.</p>
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
    <Card className="card-shadow border-none rounded-[2rem] overflow-hidden group transition-all dark:bg-zinc-900 bg-white h-full min-w-0">
      <CardContent className="p-6 text-right flex flex-col justify-between h-full">
        <div>
          <div className="flex items-center justify-between mb-4 flex-row-reverse">
            <div className={`p-2.5 rounded-2xl ${color} group-hover:scale-110 transition-transform duration-300 shadow-sm shrink-0`}>
              {icon}
            </div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest truncate ml-2">{title}</span>
          </div>
          <div className="flex items-baseline justify-end gap-1.5 overflow-hidden flex-wrap">
            <div className={cn("font-black text-foreground tabular-nums truncate leading-tight", fontSize)}>
              {value}
            </div>
            {symbol && <div className="text-lg font-black text-primary shrink-0">{symbol}</div>}
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 flex-row-reverse justify-start overflow-hidden">
          {trend && <span className="text-[10px] font-black text-green-500 bg-green-50 px-2 py-0.5 rounded-full shrink-0">{trend}</span>}
          <span className="text-[10px] font-bold text-muted-foreground opacity-70 truncate">{trendDesc}</span>
        </div>
      </CardContent>
    </Card>
  )
}
