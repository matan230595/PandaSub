
"use client"

import * as React from "react"
import { TopNav } from "@/components/dashboard/top-nav"
import { DashboardCharts } from "@/components/dashboard/stats-charts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useSubscriptions } from "@/context/subscriptions-context"
import { CATEGORY_METADATA } from "@/app/lib/subscription-store"
import { TrendingUp, DollarSign, Wallet, ArrowUpRight, ArrowDownRight, Activity } from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts"

export default function AnalysisPage() {
  const { subscriptions, convertAmount } = useSubscriptions()

  const totalMonthly = subscriptions
    .filter(s => s.status === 'active' || s.status === 'trial')
    .reduce((sum, s) => sum + convertAmount(s.amount, s.currency), 0)

  const categorySpending = subscriptions.reduce((acc, sub) => {
    const amount = convertAmount(sub.amount, sub.currency)
    acc[sub.category] = (acc[sub.category] || 0) + amount
    return acc
  }, {} as Record<string, number>)

  const sortedCategories = Object.entries(categorySpending)
    .sort(([, a], [, b]) => b - a)

  const pricePerUseData = subscriptions
    .filter(s => s.usageCount && s.usageCount > 0)
    .map(s => ({
      name: s.name,
      ppu: convertAmount(s.amount, s.currency) / (s.usageCount || 1),
      color: CATEGORY_METADATA[s.category].color
    }))
    .sort((a, b) => b.ppu - a.ppu)

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] dark:bg-zinc-950">
      <TopNav />
      <main className="flex-1 container mx-auto p-4 md:p-8 space-y-8 animate-fade-in pb-24 overflow-x-hidden">
        <div className="text-right">
          <h1 className="text-3xl font-black tracking-tight">ניתוח פיננסי מעמיק</h1>
          <p className="text-muted-foreground text-lg">סקירה ויזואלית של התקציב והרגלי הצריכה שלך</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="card-shadow border-none rounded-3xl bg-gradient-to-br from-primary to-blue-700 text-white overflow-hidden">
            <CardContent className="p-6 md:p-8 text-right relative">
              <div className="flex items-center justify-between mb-4 flex-row-reverse">
                <div className="bg-white/20 p-2.5 rounded-2xl">
                  <Wallet className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold opacity-80 uppercase tracking-wider">הוצאה חודשית משוקללת</span>
              </div>
              <div className="flex items-baseline justify-end gap-1 flex-row-reverse overflow-hidden">
                <span className={`font-black truncate ${totalMonthly > 9999 ? 'text-2xl' : 'text-4xl'}`}>
                  {totalMonthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
                <span className="text-xl font-bold shrink-0">₪</span>
              </div>
              <div className="mt-4 flex items-center gap-2 justify-end text-xs font-bold">
                <span className="bg-white/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                  12.5%+ <ArrowUpRight className="h-3 w-3" />
                </span>
                <span className="opacity-70">מהחודש שעבר</span>
              </div>
            </CardContent>
          </Card>

          <Card className="card-shadow border-none rounded-3xl bg-white dark:bg-zinc-900">
            <CardContent className="p-6 md:p-8 text-right">
              <div className="flex items-center justify-between mb-4 flex-row-reverse">
                <div className="bg-green-100 p-2.5 rounded-2xl text-green-600">
                  <DollarSign className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">ממוצע למינוי</span>
              </div>
              <div className="flex items-baseline justify-end gap-1 flex-row-reverse overflow-hidden">
                <span className="text-3xl font-black text-foreground truncate">
                  {(subscriptions.length > 0 ? totalMonthly / subscriptions.length : 0).toFixed(0)}
                </span>
                <span className="text-xl font-bold text-foreground shrink-0">₪</span>
              </div>
              <div className="mt-4 flex items-center gap-2 justify-end text-[10px] font-bold text-green-600">
                <span className="bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                  4.2%- <ArrowDownRight className="h-3 w-3" />
                </span>
                <span className="text-muted-foreground">התייעלות במחיר</span>
              </div>
            </CardContent>
          </Card>

          <Card className="card-shadow border-none rounded-3xl bg-white dark:bg-zinc-900">
            <CardContent className="p-6 md:p-8 text-right">
              <div className="flex items-center justify-between mb-4 flex-row-reverse">
                <div className="bg-orange-100 p-2.5 rounded-2xl text-orange-600">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">הוצאה שנתית חזויה</span>
              </div>
              <div className="flex items-baseline justify-end gap-1 flex-row-reverse overflow-hidden">
                <span className={`font-black text-foreground truncate ${totalMonthly * 12 > 99999 ? 'text-xl md:text-2xl' : 'text-3xl md:text-4xl'}`}>
                  {(totalMonthly * 12).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
                <span className="text-xl font-bold text-foreground shrink-0">₪</span>
              </div>
              <div className="mt-4 text-[10px] font-medium text-muted-foreground truncate">כולל חישוב אינפלציה וחידושים</div>
            </CardContent>
          </Card>
        </div>

        <DashboardCharts />

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="card-shadow border-none rounded-3xl bg-white dark:bg-zinc-900 overflow-hidden">
            <CardHeader className="bg-muted/30 border-b">
              <div className="flex items-center gap-2 flex-row-reverse justify-start">
                <Activity className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg font-bold">יחס עלות מול תועלת</CardTitle>
              </div>
              <CardDescription>כמה עולה לך כל "כניסה" או שימוש במינוי?</CardDescription>
            </CardHeader>
            <CardContent className="p-6 h-[350px]">
              {pricePerUseData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pricePerUseData} layout="vertical" margin={{ right: 30, left: 30 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} orientation="right" />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white p-2 border rounded-xl shadow-lg text-right">
                              <p className="font-bold text-sm">{payload[0].payload.name}</p>
                              <p className="text-primary font-black">₪{payload[0].value?.toLocaleString()} לשימוש</p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Bar dataKey="ppu" radius={[0, 4, 4, 0]} barSize={20}>
                      {pricePerUseData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full opacity-40 text-center">
                  <div className="text-5xl mb-4">📊</div>
                  <p className="font-bold">אין מספיק נתוני שימוש</p>
                  <p className="text-xs">עדכן את כמות השימושים במינויים כדי לראות ניתוח</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="card-shadow border-none rounded-3xl bg-white dark:bg-zinc-900">
            <CardHeader>
              <CardTitle className="text-lg font-bold">התפלגות לפי קטגוריה</CardTitle>
              <CardDescription>איפה הכסף שלך מושקע הכי הרבה?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {sortedCategories.map(([cat, amount]) => (
                <div key={cat} className="space-y-2">
                  <div className="flex justify-between items-center flex-row-reverse">
                    <div className="flex items-center gap-2 flex-row-reverse">
                      <span className="text-xl">{CATEGORY_METADATA[cat as any].icon}</span>
                      <span className="font-bold text-sm">{CATEGORY_METADATA[cat as any].label}</span>
                    </div>
                    <span className="font-black text-primary text-sm">₪{amount.toLocaleString()}</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-1000" 
                      style={{ 
                        width: `${(amount / (totalMonthly || 1)) * 100}%`,
                        backgroundColor: CATEGORY_METADATA[cat as any].color
                      }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
