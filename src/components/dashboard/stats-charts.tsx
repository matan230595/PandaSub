
"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Cell, Pie, PieChart, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useSubscriptions } from "@/context/subscriptions-context"
import { CATEGORY_METADATA } from "@/app/lib/subscription-store"

const data = [
  { name: "ינואר", total: 450 },
  { name: "פברואר", total: 450 },
  { name: "מרץ", total: 520 },
  { name: "אפריל", total: 490 },
  { name: "מאי", total: 610 },
  { name: "יוני", total: 580 },
]

export function DashboardCharts() {
  const { subscriptions } = useSubscriptions()

  const categoryTotals = subscriptions.reduce((acc, sub) => {
    const cat = CATEGORY_METADATA[sub.category].label
    acc[cat] = (acc[cat] || 0) + sub.amount
    return acc
  }, {} as Record<string, number>)

  const categoryData = Object.entries(categoryTotals).map(([name, value]) => {
    const catKey = Object.keys(CATEGORY_METADATA).find(k => CATEGORY_METADATA[k as any].label === name)
    return {
      name,
      value,
      color: catKey ? CATEGORY_METADATA[catKey as any].color : "#000"
    }
  })

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 max-w-full overflow-hidden">
      <Card className="lg:col-span-4 card-shadow border-none rounded-[2rem] bg-white overflow-hidden">
        <CardHeader>
          <CardTitle className="text-xl">מגמת הוצאות חודשית</CardTitle>
          <CardDescription>סיכום ההוצאות על מינויים בחצי השנה האחרונה</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E0E0" />
              <XAxis dataKey="name" stroke="#9E9E9E" fontSize={12} tickLine={false} axisLine={false} dy={10} />
              <YAxis stroke="#9E9E9E" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₪${value}`} dx={-10} orientation="right" />
              <Tooltip cursor={{ fill: 'rgba(0, 0, 0, 0.04)' }} content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-xl border-none bg-white p-3 shadow-2xl text-right">
                      <div className="font-bold text-primary mb-1">{payload[0].payload.name}</div>
                      <div className="text-xl font-bold">{payload[0].value} ₪</div>
                    </div>
                  )
                }
                return null
              }} />
              <Bar dataKey="total" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="lg:col-span-3 card-shadow border-none rounded-[2rem] bg-white overflow-hidden">
        <CardHeader>
          <CardTitle className="text-xl">התפלגות לפי קטגוריות</CardTitle>
          <CardDescription>חלוקת התקציב החודשי הנוכחי</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-[300px] pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value" stroke="none">
                {categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
              </Pie>
              <Tooltip content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-xl border-none bg-white p-3 shadow-2xl text-right">
                      <div className="font-bold mb-1" style={{ color: payload[0].payload.color }}>{payload[0].name}</div>
                      <div className="text-xl font-bold">{payload[0].value} ₪</div>
                    </div>
                  )
                }
                return null
              }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-2 w-full px-6">
            {categoryData.slice(0, 4).map((item) => (
              <div key={item.name} className="flex items-center gap-2 justify-end">
                <span className="text-xs font-medium text-muted-foreground truncate">{item.name}</span>
                <div className="h-2 w-2 rounded-full shadow-sm" style={{ backgroundColor: item.color }} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
