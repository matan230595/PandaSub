
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
      <main className="flex-1 container mx-auto p-4 md:p-8 space-y-8 animate-fade-in pb-20 overflow-x-hidden">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="text-right">
            <h1 className="text-4xl font-black tracking-tight text-foreground">שלום, {settings.userName.split(' ')[0]}! 👋</h1>
            <p className="text-muted-foreground mt-1 text-lg">המערכת מעודכנת. יש לך {subscriptions.length} מינויים רשומים.</p>
          </div>
          <div className="flex items-center gap-3 flex-row-reverse">
            <Button onClick={() => setIsAddModalOpen(true)} className="rounded-full google-btn gap-2 shadow-lg h-12 px-8">
              <Plus className="h-5 w-5" /> הוסף מינוי
            </Button>
            <Button variant="outline" onClick={handleGenerateDraft} className="rounded-full gap-2 border-primary/20 hover:bg-primary/5 text-primary h-12 px-6 bg-white">
              <FileText className="h-4 w-4" /> טיוטת מייל
            </Button>
            <Button variant="ghost" onClick={exportData} className="rounded-full gap-2 text-muted-foreground h-12 px-4">
              <Download className="h-4 w-4" /> ייצוא
            </Button>
          </div>
        </div>

        {/* Quick Actions & AI Card Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Action Card - FIXED LAYOUT */}
          <Card className="lg:col-span-2 border-none card-shadow bg-gradient-to-br from-primary to-blue-700 text-white rounded-[2.5rem] overflow-hidden relative group">
            <CardContent className="p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 h-full">
              <div className="text-right space-y-4 z-10 flex-1">
                <div className="flex items-center gap-3 justify-end mb-2">
                  <h3 className="text-3xl font-black">פעולה מהירה 🐼</h3>
                </div>
                <p className="text-lg opacity-90 leading-relaxed max-w-lg">
                  צריך להוסיף מינוי מהר? פשוט תגיד ל-Panda AI או סרוק את החשבונית שקיבלת במייל.
                </p>
                <div className="flex flex-wrap gap-4 pt-4 justify-end">
                  <Button 
                    variant="secondary" 
                    onClick={() => setIsAddModalOpen(true)} 
                    className="rounded-full font-black px-8 py-6 shadow-xl text-primary hover:bg-white transition-all scale-105 hover:scale-110 active:scale-95"
                  >
                    <ShieldCheck className="ml-2 h-5 w-5" /> סרוק חשבונית AI
                  </Button>
                  <Button 
                    variant="outline" 
                    className="rounded-full border-white/40 text-white hover:bg-white/10 font-bold px-8 py-6 transition-all"
                  >
                    <Zap className="ml-2 h-5 w-5" /> הוספה קולית
                  </Button>
                </div>
              </div>
              
              {/* Decorative Icon - Fixed overlap */}
              <div className="relative hidden md:flex items-center justify-center">
                <div className="bg-white/10 p-8 rounded-[2.5rem] backdrop-blur-sm border border-white/20 shadow-inner group-hover:scale-110 transition-transform duration-500">
                  <ShieldCheck className="h-20 w-20 text-white" />
                </div>
                {/* Accent blobs */}
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-blue-400/30 rounded-full blur-xl animate-pulse" />
                <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/20 rounded-full blur-xl animate-pulse" />
              </div>
            </CardContent>
          </Card>

          {/* AI Recommendations - Fixed height */}
          <div className="h-full">
            <AIRecommendations />
          </div>
        </div>

        {/* Stats Grid - FIXED OVERLAP */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            title='סה"כ חודשי (משוקלל)' 
            value={totalMonthlyILS.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} 
            symbol="₪"
            icon={<TrendingUp className="text-primary h-6 w-6" />}
            trend="↓ 12%"
            trendDesc="מהחודש הקודם"
            color="bg-primary/10"
          />
          <StatCard 
            title='חידושים קרובים' 
            value={`${upcomingRenewals}`} 
            icon={<Calendar className="text-[#4CAF50] h-6 w-6" />}
            trendDesc="ב-7 הימים הקרובים"
            color="bg-[#4CAF50]/10"
          />
          <StatCard 
            title='חיסכון אפשרי' 
            value={`1,420`} 
            symbol="₪"
            icon={<Lightbulb className="text-[#FF9800] h-6 w-6" />}
            trendDesc="לפי המלצות ה-AI"
            color="bg-[#FF9800]/10"
          />
          <StatCard 
            title='תקופות ניסיון' 
            value={`${trialCount}`} 
            icon={<Hourglass className="text-[#E91E63] h-6 w-6" />}
            trendDesc="דורש תשומת לב"
            color="bg-[#E91E63]/10"
          />
        </div>

        {/* Middle Section: Charts & List */}
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <DashboardCharts />
            <div className="flex items-center justify-between pt-4">
              <h2 className="text-2xl font-black text-right w-full text-foreground border-r-4 border-primary pr-4">מינויים אחרונים</h2>
            </div>
            <SubscriptionList />
          </div>

          {/* Sidebar Components */}
          <div className="space-y-8">
            <SubscriptionsAtRisk />
            <VoiceCreator />
          </div>
        </div>
      </main>

      <footer className="border-t bg-white dark:bg-zinc-900 py-12 text-center mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-3 font-bold text-primary mb-6">
            <div className="bg-primary text-white h-10 w-10 rounded-2xl flex items-center justify-center text-xl shadow-lg shadow-primary/20">🐼</div>
            <span className="text-2xl font-black tracking-tight">PandaSub IL</span>
          </div>
          <p className="text-base text-muted-foreground font-medium mb-2">© 2025 כל הזכויות שמורות. נבנה עבורך באהבה בישראל.</p>
          <div className="flex justify-center gap-6 text-sm text-primary/60 font-bold">
            <a href="#" className="hover:text-primary transition-colors">תנאי שימוש</a>
            <a href="#" className="hover:text-primary transition-colors">מדיניות פרטיות</a>
            <a href="#" className="hover:text-primary transition-colors">צרו קשר</a>
          </div>
        </div>
      </footer>
      <AddSubscriptionModal open={isAddModalOpen} onOpenChange={setIsAddModalOpen} />
      <Toaster />
    </div>
  )
}

function StatCard({ title, value, symbol, icon, trend, trendDesc, color }: any) {
  return (
    <Card className="card-shadow border-none rounded-[2rem] overflow-hidden group transition-all animate-slide-in dark:bg-zinc-900 bg-white">
      <CardContent className="p-8 text-right">
        <div className="flex items-center justify-between mb-6 flex-row-reverse">
          <div className={`p-3 rounded-2xl ${color} group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
            {icon}
          </div>
          <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{title}</span>
        </div>
        <div className="flex items-baseline justify-end gap-2 flex-row-reverse mb-2">
          <div className="text-4xl font-black text-foreground tabular-nums">{value}</div>
          {symbol && <div className="text-2xl font-black text-primary ml-1">{symbol}</div>}
        </div>
        <div className="mt-4 flex items-center gap-2 flex-row-reverse justify-start">
          {trend && <span className="text-sm font-black text-green-500 bg-green-50 px-2 py-0.5 rounded-full">{trend}</span>}
          <span className="text-xs font-bold text-muted-foreground opacity-70">{trendDesc}</span>
        </div>
      </CardContent>
    </Card>
  )
}
