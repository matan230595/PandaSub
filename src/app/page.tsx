"use client"

import { TopNav } from "@/components/dashboard/top-nav"
import { DashboardCharts } from "@/components/dashboard/stats-charts"
import { SubscriptionList } from "@/components/subscription/subscription-list"
import { VoiceCreator } from "@/components/gen-ai/voice-creator"
import { AIRecommendations } from "@/components/gen-ai/recommendations"
import { SubscriptionsAtRisk } from "@/components/dashboard/risk-widget"
import { Button } from "@/components/ui/button"
import { Plus, Download, Filter } from "lucide-react"
import { Toaster } from "@/components/ui/toaster"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <TopNav />
      <main className="flex-1 container mx-auto p-4 md:p-8 space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">שלום, ישראל! 👋</h1>
            <p className="text-muted-foreground">יש לך 5 מינויים פעילים החודש.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" /> ייצוא דוח
            </Button>
            <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4" /> הוסף מינוי ידני
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between pb-2">
              <span className="text-sm font-medium text-muted-foreground">סה"כ חודשי</span>
              <span className="text-xl">💰</span>
            </div>
            <div className="text-2xl font-bold">₪624.6</div>
            <div className="text-xs text-green-500 mt-1 flex items-center gap-1">
              <span>↓ 12%</span>
              <span className="text-muted-foreground">מהחודש הקודם</span>
            </div>
          </div>
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between pb-2">
              <span className="text-sm font-medium text-muted-foreground">חידושים קרובים</span>
              <span className="text-xl">📅</span>
            </div>
            <div className="text-2xl font-bold">3 מינויים</div>
            <div className="text-xs text-muted-foreground mt-1">ב-7 הימים הקרובים</div>
          </div>
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between pb-2">
              <span className="text-sm font-medium text-muted-foreground">חיסכון שנתי פוטנציאלי</span>
              <span className="text-xl">💡</span>
            </div>
            <div className="text-2xl font-bold">₪1,420</div>
            <div className="text-xs text-accent mt-1 font-medium">לפי המלצות ה-AI שלנו</div>
          </div>
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between pb-2">
              <span className="text-sm font-medium text-muted-foreground">מינויי ניסיון</span>
              <span className="text-xl">⏳</span>
            </div>
            <div className="text-2xl font-bold">1 פעיל</div>
            <div className="text-xs text-destructive mt-1 font-medium">מסתיים עוד יומיים!</div>
          </div>
        </div>

        {/* Charts and AI Tools */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <DashboardCharts />
            <div className="flex items-center justify-between pt-4">
              <h2 className="text-2xl font-bold">המינויים שלי</h2>
              <Button variant="ghost" size="sm" className="gap-2">
                <Filter className="h-4 w-4" /> סינון
              </Button>
            </div>
            <SubscriptionList />
          </div>

          <div className="space-y-6">
            <SubscriptionsAtRisk />
            <VoiceCreator />
            <AIRecommendations />
          </div>
        </div>
      </main>

      <footer className="border-t bg-muted/30 py-6 text-center">
        <p className="text-sm text-muted-foreground">
          © 2025 PandaSub IL. כל הזכויות שמורות. מנוהל באהבה 🐼
        </p>
      </footer>
      <Toaster />
    </div>
  )
}
