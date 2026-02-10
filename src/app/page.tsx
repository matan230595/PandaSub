"use client"

import * as React from "react"
import { TopNav } from "@/components/dashboard/top-nav"
import { DashboardCharts } from "@/components/dashboard/stats-charts"
import { SubscriptionList } from "@/components/subscription/subscription-list"
import { VoiceCreator } from "@/components/gen-ai/voice-creator"
import { AIRecommendations } from "@/components/gen-ai/recommendations"
import { SubscriptionsAtRisk } from "@/components/dashboard/risk-widget"
import { Button } from "@/components/ui/button"
import { Plus, Download, Filter, TrendingUp, Calendar, Lightbulb, Hourglass } from "lucide-react"
import { Toaster } from "@/components/ui/toaster"
import { AddSubscriptionModal } from "@/components/subscription/add-subscription-modal"
import { useSubscriptions } from "@/context/subscriptions-context"
import { Card, CardContent } from "@/components/ui/card"

export default function Home() {
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false)
  const { subscriptions } = useSubscriptions()

  const totalMonthly = subscriptions
    .filter(s => s.status === 'active' || s.status === 'trial')
    .reduce((sum, s) => sum + s.amount, 0)

  const upcomingRenewals = subscriptions.filter(s => {
    const diff = new Date(s.renewalDate).getTime() - new Date().getTime()
    return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000
  }).length

  const trialCount = subscriptions.filter(s => s.status === 'trial').length

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA]">
      <TopNav />
      <main className="flex-1 container mx-auto p-4 md:p-8 space-y-8 animate-in-slide">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">שלום, ישראל! 👋</h1>
            <p className="text-muted-foreground mt-1">יש לך {subscriptions.length} מינויים במעקב החודש.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="rounded-full gap-2 border-primary/20 hover:bg-primary/5 text-primary">
              <Download className="h-4 w-4" /> ייצוא דוח
            </Button>
            <Button onClick={() => setIsAddModalOpen(true)} className="rounded-full google-btn gap-2 shadow-lg bg-primary hover:bg-primary/90">
              <Plus className="h-5 w-5" /> הוסף מינוי
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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
            value={`${upcomingRenewals} מינויים`} 
            icon={<Calendar className="text-cat-fitness h-6 w-6" />}
            trendDesc="ב-7 הימים הקרובים"
            color="bg-green-100"
          />
          <StatCard 
            title='חיסכון פוטנציאלי' 
            value={`₪1,420`} 
            icon={<Lightbulb className="text-cat-mobile h-6 w-6" />}
            trendDesc="לפי המלצות ה-AI"
            color="bg-orange-100"
          />
          <StatCard 
            title='מינויי ניסיון' 
            value={`${trialCount} פעילים`} 
            icon={<Hourglass className="text-cat-streaming h-6 w-6" />}
            trendDesc="דורש תשומת לב"
            color="bg-pink-100"
          />
        </div>

        {/* Charts and AI Tools */}
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <DashboardCharts />
            <div className="flex items-center justify-between pt-4">
              <h2 className="text-2xl font-bold">המינויים שלי</h2>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="gap-2 rounded-full">
                  <Filter className="h-4 w-4" /> סינון
                </Button>
              </div>
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

      <footer className="border-t bg-white py-10 text-center">
        <div className="container mx-auto">
          <div className="flex items-center justify-center gap-2 font-bold text-primary mb-4">
            <span className="bg-primary text-white h-8 w-8 rounded-lg flex items-center justify-center">🐼</span>
            <span className="text-xl">PandaSub IL</span>
          </div>
          <p className="text-sm text-muted-foreground">
            המערכת החכמה לניהול המינויים שלך. © 2025 כל הזכויות שמורות.
          </p>
        </div>
      </footer>
      <AddSubscriptionModal open={isAddModalOpen} onOpenChange={setIsAddModalOpen} />
      <Toaster />
    </div>
  )
}

function StatCard({ title, value, icon, trend, trendDesc, color }: any) {
  return (
    <Card className="card-shadow border-none rounded-2xl overflow-hidden group transition-all">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
          <div className={`p-2 rounded-xl ${color} group-hover:scale-110 transition-transform`}>
            {icon}
          </div>
        </div>
        <div className="text-3xl font-bold text-foreground">{value}</div>
        <div className="mt-2 flex items-center gap-1">
          {trend && <span className="text-sm font-bold text-green-500">{trend}</span>}
          <span className="text-xs text-muted-foreground">{trendDesc}</span>
        </div>
      </CardContent>
    </Card>
  )
}