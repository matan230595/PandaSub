
"use client"

import * as React from "react"
import { TopNav } from "@/components/dashboard/top-nav"
import { DashboardCharts } from "@/components/dashboard/stats-charts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useSubscriptions } from "@/context/subscriptions-context"
import { CATEGORY_METADATA } from "@/app/lib/subscription-store"
import { TrendingUp, DollarSign, Wallet, ArrowUpRight, ArrowDownRight, Activity } from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts"
import { cn } from "@/lib/utils"

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
          <StatCard 
            title="הוצאה חודשית משוקללת"
            value={totalMonthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            symbol="₪"
            icon={<Wallet className="h-5 w-5" />}
            trend="12.5%+"
            trendDesc="מהחודש שעבר"
            primary
          />

          <StatCard 
            title="ממוצע למינוי"
            value={(subscriptions.length > 0 ? totalMonthly / subscriptions.length : 0).toFixed(0)}
            symbol="₪"
            icon={<DollarSign className="h-5 w-5" />}
            trend="4.2%-"
            trendDesc="התייעלות במחיר"
            green
          />

          <StatCard 
            title="הוצאה שנתית חזויה"
            value={(totalMonthly * 12).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            symbol="₪"
            icon={<TrendingUp className="h-5 w-5" />}
            trendDesc="כולל אינפלציה וחידושים"
            orange
          />
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

function StatCard({ title, value, symbol, icon, trend, trendDesc, primary, green, orange }: any) {
  const fontSize = value.length > 8 ? 'text-xl' : value.length > 5 ? 'text-2xl' : 'text-3xl md:text-4xl';
  
  return (
    <Card className={cn(
      "card-shadow border-none rounded-3xl overflow-hidden h-full",
      primary ? "bg-gradient-to-br from-primary to-blue-700 text-white" : "bg-white dark:bg-zinc-900"
    )}>
      <CardContent className="p-6 md:p-8 text-right flex flex-col justify-between h-full">
        <div>
          <div className="flex items-center justify-between mb-4 flex-row-reverse">
            <div className={cn(
              "p-2.5 rounded-2xl",
              primary ? "bg-white/20" : green ? "bg-green-100 text-green-600" : orange ? "bg-orange-100 text-orange-600" : "bg-muted"
            )}>
              {icon}
            </div>
            <span className={cn(
              "text-[10px] font-bold uppercase tracking-wider",
              primary ? "opacity-80" : "text-muted-foreground"
            )}>{title}</span>
          </div>
          <div className="flex items-baseline justify-end gap-1 flex-row-reverse overflow-hidden">
            <span className={cn("font-black tabular-nums truncate", fontSize, !primary && "text-foreground")}>
              {value}
            </span>
            {symbol && <span className={cn("text-xl font-bold shrink-0", !primary && "text-foreground")}>{symbol}</span>}
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 justify-end">
          {trend && (
            <span className={cn(
              "px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1",
              primary ? "bg-white/20" : green ? "bg-green-50 text-green-600" : "bg-muted"
            )}>
              {trend} {trend.includes('+') ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            </span>
          )}
          <span className={cn("text-[10px] font-bold truncate", primary ? "opacity-70" : "text-muted-foreground")}>
            {trendDesc}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
