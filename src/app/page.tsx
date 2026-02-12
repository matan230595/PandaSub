
"use client"

import * as React from "react"
import { TopNav } from "@/components/dashboard/top-nav"
import { DashboardCharts } from "@/components/dashboard/stats-charts"
import { SubscriptionList } from "@/components/subscription/subscription-list"
import { AIRecommendations } from "@/components/gen-ai/recommendations"
import { SubscriptionsAtRisk } from "@/components/dashboard/risk-widget"
import { Button } from "@/components/ui/button"
import { TrendingUp, Calendar, Lightbulb, Hourglass, Zap, Mic, Sparkles } from "lucide-react"
import { AddSubscriptionModal } from "@/components/subscription/add-subscription-modal"
import { useSubscriptions } from "@/context/subscriptions-context"
import { Card, CardContent } from "@/components/ui/card"
import { SetupWizard } from "@/components/setup-wizard"
import { cn } from "@/lib/utils"
import { useUser } from "@/firebase"
import Link from "next/link"

export default function Home() {
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false)
  const { subscriptions, convertAmount } = useSubscriptions()
  const { user, isUserLoading } = useUser()

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

  if (isUserLoading) return null;
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] p-4" dir="rtl">
        <Card className="w-full max-w-md p-8 text-center rounded-[2rem] shadow-2xl border-none">
          <div className="bg-primary text-white h-20 w-20 rounded-[2rem] flex items-center justify-center text-4xl shadow-xl mx-auto mb-6">🐼</div>
          <h1 className="text-3xl font-black mb-4">ברוכים הבאים ל-PandaSub</h1>
          <p className="text-muted-foreground mb-8 text-center">התחבר כדי לנהל את המינויים שלך בצורה חכמה ולחסוך כסף.</p>
          <Link href="/login" className="w-full">
            <Button className="w-full google-btn h-14 rounded-full text-lg font-bold">התחבר עכשיו</Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] dark:bg-zinc-950" dir="rtl">
      <SetupWizard />
      <TopNav />
      <main className="flex-1 container mx-auto p-4 md:p-8 space-y-8 animate-fade-in pb-24 max-w-7xl">
        
        {/* Stats Grid - Fixed Proportions */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 lg:justify-items-center">
          <StatCard 
            title='סה"כ חודשי' 
            value={totalMonthlyILS.toLocaleString(undefined, { maximumFractionDigits: 0 })} 
            symbol="₪"
            icon={<TrendingUp className="text-primary h-5 w-5" />}
            trendDesc="הוצאה חודשית"
            color="bg-primary/10"
          />
          <StatCard 
            title='חידושים' 
            value={`${upcomingRenewals}`} 
            icon={<Calendar className="text-[#4CAF50] h-5 w-5" />}
            trendDesc="ב-7 ימים"
            color="bg-[#4CAF50]/10"
          />
          <StatCard 
            title='חיסכון' 
            value={`1,420`} 
            symbol="₪"
            icon={<Lightbulb className="text-[#FF9800] h-5 w-5" />}
            trendDesc="לפי ה-AI"
            color="bg-[#FF9800]/10"
          />
          <StatCard 
            title='ניסיון' 
            value={`${trialCount}`} 
            icon={<Hourglass className="text-[#E91E63] h-5 w-5" />}
            trendDesc="דורש החלטה"
            color="bg-[#E91E63]/10"
          />
        </div>

        {/* AI Insights & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <AIRecommendations />
          </div>
          <div>
            <Card className="border-none shadow-xl bg-gradient-to-br from-primary to-blue-700 text-white rounded-[2rem] overflow-hidden flex flex-col justify-center h-full min-h-[180px]">
              <CardContent className="p-6 text-right space-y-4">
                <div className="flex items-center justify-between mb-2">
                   <Zap className="h-6 w-6 text-white/50" />
                   <h3 className="text-lg font-black">פעולה מהירה 🐼</h3>
                </div>
                <div className="flex flex-col gap-3">
                  <Button 
                    onClick={() => setIsAddModalOpen(true)} 
                    className="w-full rounded-full font-black h-11 bg-white text-primary hover:bg-zinc-100 transition-all border-none text-xs shadow-lg"
                  >
                    <Sparkles className="ml-2 h-4 w-4" /> סריקת חשבונית AI
                  </Button>
                  <Button 
                    variant="outline"
                    className="w-full rounded-full border-2 border-white/50 text-white hover:bg-white/10 font-black h-11 transition-all text-xs bg-transparent"
                  >
                    <Mic className="ml-2 h-4 w-4" /> הוספה קולית
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <DashboardCharts />
            <div className="flex items-center justify-between pt-2">
              <h2 className="text-2xl font-black text-right w-full text-foreground border-r-4 border-primary pr-4 leading-none">ניהול מינויים פעילים</h2>
            </div>
            <SubscriptionList />
          </div>

          <div className="space-y-8">
            <SubscriptionsAtRisk />
          </div>
        </div>
      </main>

      <AddSubscriptionModal open={isAddModalOpen} onOpenChange={setIsAddModalOpen} />
    </div>
  )
}

function StatCard({ title, value, symbol, icon, trendDesc, color }: any) {
  const fontSize = value.length > 8 ? 'text-lg' : value.length > 5 ? 'text-xl' : 'text-2xl md:text-3xl';

  return (
    <Card className="shadow-sm border-none rounded-[2rem] overflow-hidden group transition-all hover:shadow-xl dark:bg-zinc-900 bg-white aspect-square lg:aspect-auto lg:h-32 lg:w-full w-full card-shadow">
      <CardContent className="p-4 md:p-6 text-right flex flex-col justify-between h-full relative">
        <div className="flex justify-between items-start mb-2">
          <div className="text-right">
            <span className="text-[10px] md:text-[11px] font-black text-muted-foreground uppercase tracking-widest">{title}</span>
          </div>
          <div className={cn("p-2 md:p-2.5 rounded-2xl group-hover:rotate-6 transition-transform duration-300 shadow-sm shrink-0", color)}>
            {icon}
          </div>
        </div>
        
        <div className="flex flex-row items-baseline justify-start gap-1 tabular-nums mt-auto" dir="rtl">
          {symbol && <div className="text-lg md:text-xl font-black text-primary">{symbol}</div>}
          <div className={cn("font-black text-foreground leading-none", fontSize)}>
            {value}
          </div>
        </div>

        <div className="flex items-center justify-start mt-1">
          <span className="text-[9px] md:text-[10px] font-bold text-muted-foreground opacity-70 truncate">{trendDesc}</span>
        </div>
      </CardContent>
    </Card>
  )
}
