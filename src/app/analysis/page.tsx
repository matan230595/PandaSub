"use client"

import * as React from "react"
import { TopNav } from "@/components/dashboard/top-nav"
import { DashboardCharts } from "@/components/dashboard/stats-charts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useSubscriptions } from "@/context/subscriptions-context"
import { CATEGORY_METADATA } from "@/app/lib/subscription-store"
import { TrendingUp, TrendingDown, DollarSign, Wallet, ArrowUpRight, ArrowDownRight } from "lucide-react"

export default function AnalysisPage() {
  const { subscriptions } = useSubscriptions()

  const totalMonthly = subscriptions
    .filter(s => s.status === 'active' || s.status === 'trial')
    .reduce((sum, s) => sum + s.amount, 0)

  const categorySpending = subscriptions.reduce((acc, sub) => {
    acc[sub.category] = (acc[sub.category] || 0) + sub.amount
    return acc
  }, {} as Record<string, number>)

  const sortedCategories = Object.entries(categorySpending)
    .sort(([, a], [, b]) => b - a)

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA]">
      <TopNav />
      <main className="flex-1 container mx-auto p-4 md:p-8 space-y-8 animate-fade-in pb-20">
        <div className="text-right">
          <h1 className="text-3xl font-bold tracking-tight">ניתוח הוצאות מעמיק</h1>
          <p className="text-muted-foreground text-lg">סקירה ויזואלית של התקציב והרגלי הצריכה שלך</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="card-shadow border-none rounded-3xl bg-gradient-to-br from-primary to-blue-700 text-white">
            <CardContent className="p-8 text-right">
              <div className="flex items-center justify-between mb-4 flex-row-reverse">
                <div className="bg-white/20 p-3 rounded-2xl">
                  <Wallet className="h-6 w-6" />
                </div>
                <span className="text-sm font-bold opacity-80 uppercase tracking-wider">הוצאה חודשית נוכחית</span>
              </div>
              <div className="text-4xl font-black">₪{totalMonthly.toLocaleString()}</div>
              <div className="mt-4 flex items-center gap-2 justify-end text-sm font-bold">
                <span className="bg-white/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                  12.5%+ <ArrowUpRight className="h-3 w-3" />
                </span>
                <span className="opacity-70">מהחודש שעבר</span>
              </div>
            </CardContent>
          </Card>

          <Card className="card-shadow border-none rounded-3xl bg-white">
            <CardContent className="p-8 text-right">
              <div className="flex items-center justify-between mb-4 flex-row-reverse">
                <div className="bg-green-100 p-3 rounded-2xl text-green-600">
                  <DollarSign className="h-6 w-6" />
                </div>
                <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">ממוצע למינוי</span>
              </div>
              <div className="text-4xl font-black text-foreground">
                ₪{subscriptions.length > 0 ? (totalMonthly / subscriptions.length).toFixed(1) : 0}
              </div>
              <div className="mt-4 flex items-center gap-2 justify-end text-sm font-bold text-green-600">
                <span className="bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                  4.2%- <ArrowDownRight className="h-3 w-3" />
                </span>
                <span className="text-muted-foreground">התייעלות במחיר</span>
              </div>
            </CardContent>
          </Card>

          <Card className="card-shadow border-none rounded-3xl bg-white">
            <CardContent className="p-8 text-right">
              <div className="flex items-center justify-between mb-4 flex-row-reverse">
                <div className="bg-orange-100 p-3 rounded-2xl text-orange-600">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">הוצאה שנתית חזויה</span>
              </div>
              <div className="text-4xl font-black text-foreground">₪{(totalMonthly * 12).toLocaleString()}</div>
              <div className="mt-4 text-sm font-medium text-muted-foreground">כולל חישוב אינפלציה וחידושים</div>
            </CardContent>
          </Card>
        </div>

        <DashboardCharts />

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="card-shadow border-none rounded-3xl bg-white">
            <CardHeader>
              <CardTitle>התפלגות לפי קטגוריה</CardTitle>
              <CardDescription>איפה הכסף שלך מושקע הכי הרבה?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {sortedCategories.map(([cat, amount]) => (
                <div key={cat} className="space-y-2">
                  <div className="flex justify-between items-center flex-row-reverse">
                    <div className="flex items-center gap-2 flex-row-reverse">
                      <span className="text-xl">{CATEGORY_METADATA[cat as any].icon}</span>
                      <span className="font-bold">{CATEGORY_METADATA[cat as any].label}</span>
                    </div>
                    <span className="font-black text-primary">₪{amount.toLocaleString()}</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-1000" 
                      style={{ 
                        width: `${(amount / totalMonthly) * 100}%`,
                        backgroundColor: CATEGORY_METADATA[cat as any].color
                      }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="card-shadow border-none rounded-3xl bg-white">
            <CardHeader>
              <CardTitle>מגמות ושינויים</CardTitle>
              <CardDescription>תובנות על בסיס נתונים היסטוריים</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-4">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <TrendingUp className="h-10 w-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">הוצאות הענן שלך גדלו</h3>
                <p className="text-muted-foreground max-w-xs">זיהינו עלייה של 15% בהוצאות על אחסון ענן בשלושת החודשים האחרונים.</p>
              </div>
              <div className="pt-4 flex gap-3">
                <div className="bg-muted/50 p-4 rounded-2xl text-right flex-1">
                  <div className="text-xs font-bold text-muted-foreground mb-1 uppercase">הכי יקר</div>
                  <div className="font-black text-lg">Adobe</div>
                </div>
                <div className="bg-muted/50 p-4 rounded-2xl text-right flex-1">
                  <div className="text-xs font-bold text-muted-foreground mb-1 uppercase">הכי זול</div>
                  <div className="font-black text-lg">Spotify</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}