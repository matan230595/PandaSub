"use client"

import * as React from "react"
import { TopNav } from "@/components/dashboard/top-nav"
import { DashboardCharts } from "@/components/dashboard/stats-charts"
import { SubscriptionList } from "@/components/subscription/subscription-list"
import { VoiceCreator } from "@/components/gen-ai/voice-creator"
import { AIRecommendations } from "@/components/gen-ai/recommendations"
import { SubscriptionsAtRisk } from "@/components/dashboard/risk-widget"
import { Button } from "@/components/ui/button"
import { Plus, Download, TrendingUp, Calendar, Lightbulb, Hourglass, FileText } from "lucide-react"
import { Toaster } from "@/components/ui/toaster"
import { AddSubscriptionModal } from "@/components/subscription/add-subscription-modal"
import { useSubscriptions } from "@/context/subscriptions-context"
import { Card, CardContent } from "@/components/ui/card"
import { SetupWizard } from "@/components/setup-wizard"
import { useToast } from "@/hooks/use-toast"

export default function Home() {
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false)
  const { subscriptions, exportData, settings } = useSubscriptions()
  const { toast } = useToast()

  const totalMonthly = subscriptions
    .filter(s => s.status === 'active' || s.status === 'trial')
    .reduce((sum, s) => sum + s.amount, 0)

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
    const total = activeSubs.reduce((sum, s) => sum + s.amount, 0);
    
    const subListText = activeSubs.map(s => `• ${s.name}: ${s.amount}${s.currency} (חידוש ב-${s.renewalDate})`).join('\n');
    
    const subject = encodeURIComponent("סיכום מינויים שבועי - PandaSub IL");
    const body = encodeURIComponent(
      `שלום ${settings.userName},\n\nלהלן סיכום המינויים הפעילים שלך:\n\n${subListText}\n\nסה"כ חודשי: ${total.toLocaleString()} ${settings.currency}\n\nנשלח מ-PandaSub IL`
    );

    window.location.href = `mailto:${settings.userEmail}?subject=${subject}&body=${body}`;
    
    toast({
      title: "טיוטת מייל נוצרה",
      description: "אפליקציית המייל נפתחה עם הנתונים שלך.",
    })
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] dark:bg-zinc-950">
      <SetupWizard />
      <TopNav />
      <main className="flex-1 container mx-auto p-4 md:p-8 space-y-8 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="text-right">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">שלום, {settings.userName.split(' ')[0]}! 👋</h1>
            <p className="text-muted-foreground mt-1">המערכת מעודכנת. יש לך {subscriptions.length} מינויים פעילים.</p>
          </div>
          <div className="flex items-center gap-3 flex-row-reverse">
            <Button onClick={() => setIsAddModalOpen(true)} className="rounded-full google-btn gap-2 shadow-lg h-12 px-6">
              <Plus className="h-5 w-5" /> הוסף מינוי
            </Button>
            <Button variant="outline" onClick={handleGenerateDraft} className="rounded-full gap-2 border-primary/20 hover:bg-primary/5 text-primary h-12">
              <FileText className="h-4 w-4" /> טיוטת מייל
            </Button>
            <Button variant="ghost" onClick={exportData} className="rounded-full gap-2 text-muted-foreground h-12">
              <Download className="h-4 w-4" /> ייצוא
            </Button>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            title='סה"כ חודשי' 
            value={`₪${totalMonthly.toLocaleString()}`} 
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
            value={`₪1,420`} 
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

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <DashboardCharts />
            <div className="flex items-center justify-between pt-4">
              <h2 className="text-2xl font-bold text-right w-full text-foreground">מינויים אחרונים</h2>
            </div>
            <SubscriptionList />
          </div>

          <div className="space-y-8">
            <SubscriptionsAtRisk />
            <VoiceCreator />
            <AIRecommendations />
          </div>
        </div>
      </main>

      <footer className="border-t bg-white dark:bg-zinc-900 py-10 text-center mt-auto">
        <div className="container mx-auto">
          <div className="flex items-center justify-center gap-2 font-bold text-primary mb-4">
            <span className="bg-primary text-white h-8 w-8 rounded-lg flex items-center justify-center">🐼</span>
            <span className="text-xl">PandaSub IL</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2025 כל הזכויות שמורות. נבנה עבורך באהבה.</p>
        </div>
      </footer>
      <AddSubscriptionModal open={isAddModalOpen} onOpenChange={setIsAddModalOpen} />
      <Toaster />
    </div>
  )
}

function StatCard({ title, value, icon, trend, trendDesc, color }: any) {
  return (
    <Card className="card-shadow border-none rounded-2xl overflow-hidden group transition-all animate-slide-in dark:bg-zinc-900">
      <CardContent className="p-6 text-right">
        <div className="flex items-center justify-between mb-4 flex-row-reverse">
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
          <div className={`p-2 rounded-xl ${color} group-hover:scale-110 transition-transform`}>
            {icon}
          </div>
        </div>
        <div className="text-3xl font-bold text-foreground">{value}</div>
        <div className="mt-2 flex items-center gap-1 flex-row-reverse justify-end">
          {trend && <span className="text-sm font-bold text-green-500">{trend}</span>}
          <span className="text-xs text-muted-foreground">{trendDesc}</span>
        </div>
      </CardContent>
    </Card>
  )
}
