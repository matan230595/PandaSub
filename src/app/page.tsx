
"use client"

import * as React from "react"
import { TopNav } from "@/components/dashboard/top-nav"
import { DashboardCharts } from "@/components/dashboard/stats-charts"
import { SubscriptionList } from "@/components/subscription/subscription-list"
import { VoiceCreator } from "@/components/gen-ai/voice-creator"
import { AIRecommendations } from "@/components/gen-ai/recommendations"
import { SubscriptionsAtRisk } from "@/components/dashboard/risk-widget"
import { Button } from "@/components/ui/button"
import { Plus, TrendingUp, Calendar, Lightbulb, Hourglass, FileText, ShieldCheck, Zap } from "lucide-react"
import { AddSubscriptionModal } from "@/components/subscription/add-subscription-modal"
import { useSubscriptions } from "@/context/subscriptions-context"
import { Card, CardContent } from "@/components/ui/card"
import { SetupWizard } from "@/components/setup-wizard"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { useUser } from "@/firebase"
import Link from "next/link"

export default function Home() {
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false)
  const { subscriptions, settings, convertAmount } = useSubscriptions()
  const { user, isUserLoading } = useUser()
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
    const body = encodeURIComponent(`שלום ${settings.userName},\n\nלהלן סיכום המינויים הפעילים שלך:\n\n${subListText}\n\nסה"כ חודשי (משוקלל): ₪${total.toLocaleString()}\n\nנשלח מ-PandaSub IL`);
    window.location.href = `mailto:${settings.userEmail}?subject=${subject}&body=${body}`;
    toast({ title: "טיוטת מייל נוצרה", description: "אפליקציית המייל נפתחה עם הנתונים המומרים שלך." })
  }

  if (isUserLoading) return null;
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] p-4">
        <Card className="w-full max-w-md p-8 text-center rounded-[2rem] shadow-2xl border-none">
          <div className="bg-primary text-white h-20 w-20 rounded-[2rem] flex items-center justify-center text-4xl shadow-xl mx-auto mb-6">🐼</div>
          <h1 className="text-3xl font-black mb-4">ברוכים הבאים ל-PandaSub</h1>
          <p className="text-muted-foreground mb-8">התחבר כדי לנהל את המינויים שלך בצורה חכמה ולחסוך כסף.</p>
          <Link href="/login" className="w-full">
            <Button className="w-full google-btn h-14 rounded-full text-lg font-bold">התחבר עכשיו</Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] dark:bg-zinc-950">
      <SetupWizard />
      <TopNav />
      <main className="flex-1 container mx-auto p-4 md:p-8 space-y-8 animate-fade-in pb-24 max-w-7xl overflow-x-hidden">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="text-right">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground">שלום, {settings.userName.split(' ')[0]}! 👋</h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base font-medium">יש לך {subscriptions.length} מינויים רשומים במערכת.</p>
          </div>
          <div className="flex items-center gap-3 justify-start md:justify-end flex-row-reverse">
            <Button onClick={() => setIsAddModalOpen(true)} className="rounded-full google-btn gap-2 shadow-lg h-11 px-6 text-sm font-black">
              <Plus className="h-5 w-5" /> הוסף מינוי
            </Button>
            <Button variant="outline" onClick={handleGenerateDraft} className="rounded-full gap-2 border-primary/20 hover:bg-primary/5 text-primary h-11 px-5 bg-white text-sm font-bold shadow-sm">
              <FileText className="h-4 w-4" /> טיוטה
            </Button>
          </div>
        </div>

        {/* 1. Stats Grid (Top) - Reordered to top as requested */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            title='סה"כ חודשי' 
            value={totalMonthlyILS.toLocaleString(undefined, { maximumFractionDigits: 0 })} 
            symbol="₪"
            icon={<TrendingUp className="text-primary h-5 w-5" />}
            trendDesc="הוצאה חודשית ממוצעת"
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
            trendDesc="לפי ניתוח Panda AI"
            color="bg-[#FF9800]/10"
          />
          <StatCard 
            title='תקופות ניסיון' 
            value={`${trialCount}`} 
            icon={<Hourglass className="text-[#E91E63] h-5 w-5" />}
            trendDesc="דורש החלטה בקרוב"
            color="bg-[#E91E63]/10"
          />
        </div>

        {/* 2. AI Insights (2/3) & Quick Actions (1/3) - Sized correctly */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <AIRecommendations />
          </div>
          <div className="lg:col-span-1">
            <Card className="border-none shadow-xl bg-gradient-to-br from-primary to-blue-700 text-white rounded-[2rem] overflow-hidden relative h-full flex flex-col justify-center">
              <CardContent className="p-6 md:p-8 text-right space-y-6">
                <div>
                  <h3 className="text-xl font-black mb-1">פעולה מהירה 🐼</h3>
                  <p className="text-xs opacity-90 leading-relaxed font-medium">
                    נהל את המינויים שלך בעזרת כלי ה-AI שלנו.
                  </p>
                </div>
                
                <div className="flex flex-col gap-3">
                  <Button 
                    variant="secondary" 
                    onClick={() => setIsAddModalOpen(true)} 
                    className="rounded-full font-black h-12 shadow-lg bg-white text-primary hover:bg-zinc-100 transition-all border-none text-sm"
                  >
                    <ShieldCheck className="ml-2 h-5 w-5" /> סריקת AI
                  </Button>
                  <Button 
                    variant="outline"
                    className="rounded-full border-2 border-white text-white hover:bg-white/10 font-black h-12 transition-all text-sm bg-transparent"
                  >
                    <Zap className="ml-2 h-5 w-5" /> הוספה קולית
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 3. Main Content Area */}
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8 min-w-0">
            <DashboardCharts />
            <div className="flex items-center justify-between pt-2">
              <h2 className="text-2xl font-black text-right w-full text-foreground border-r-4 border-primary pr-4">ניהול מינויים פעילים</h2>
            </div>
            <SubscriptionList />
          </div>

          <div className="space-y-8 min-w-0">
            <SubscriptionsAtRisk />
            <VoiceCreator />
          </div>
        </div>
      </main>

      <footer className="border-t bg-white dark:bg-zinc-900 py-12 text-center mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-2 font-bold text-primary mb-4 flex-row-reverse">
            <div className="bg-primary text-white h-10 w-10 rounded-2xl flex items-center justify-center text-xl shadow-lg">🐼</div>
            <span className="text-2xl font-black tracking-tight">PandaSub IL</span>
          </div>
          <p className="text-sm text-muted-foreground font-medium opacity-70">© 2025 כל הזכויות שמורות. נבנה עבורך בביטחון מלא.</p>
        </div>
      </footer>
      <AddSubscriptionModal open={isAddModalOpen} onOpenChange={setIsAddModalOpen} />
    </div>
  )
}

function StatCard({ title, value, symbol, icon, trendDesc, color }: any) {
  const fontSize = value.length > 8 ? 'text-xl' : value.length > 5 ? 'text-2xl' : 'text-3xl md:text-4xl';

  return (
    <Card className="shadow-sm border-none rounded-[2rem] overflow-hidden group transition-all hover:shadow-xl dark:bg-zinc-900 bg-white h-full card-shadow">
      <CardContent className="p-6 text-right flex flex-col justify-between h-full relative">
        <div className="flex justify-between items-start mb-4">
          <div className="text-right">
            <span className="text-[11px] font-black text-muted-foreground uppercase tracking-widest">{title}</span>
          </div>
          <div className={`p-3 rounded-2xl ${color} group-hover:rotate-6 transition-transform duration-300 shadow-sm shrink-0`}>
            {icon}
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-1 mb-2">
          <div className="flex items-baseline justify-end gap-1.5 tabular-nums overflow-hidden w-full flex-row-reverse">
             <div className={cn("font-black text-foreground leading-none", fontSize)}>
              {value}
            </div>
            {symbol && <div className="text-xl font-black text-primary mb-0.5">{symbol}</div>}
          </div>
        </div>

        <div className="flex items-center justify-end mt-2">
          <span className="text-[10px] font-bold text-muted-foreground opacity-70 truncate">{trendDesc}</span>
        </div>
      </CardContent>
    </Card>
  )
}
