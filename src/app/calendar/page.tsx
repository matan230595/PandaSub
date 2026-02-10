"use client"

import * as React from "react"
import { TopNav } from "@/components/dashboard/top-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { useSubscriptions } from "@/context/subscriptions-context"
import { CATEGORY_METADATA } from "@/app/lib/subscription-store"
import { Badge } from "@/components/ui/badge"

export default function CalendarPage() {
  const { subscriptions } = useSubscriptions()
  const [date, setDate] = React.useState<Date | undefined>(new Date())

  const selectedDaySubs = subscriptions.filter(sub => {
    const subDate = new Date(sub.renewalDate)
    return subDate.getDate() === date?.getDate() && 
           subDate.getMonth() === date?.getMonth() &&
           subDate.getFullYear() === date?.getFullYear()
  })

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA]">
      <TopNav />
      <main className="flex-1 container mx-auto p-4 md:p-8 animate-fade-in">
        <h1 className="text-3xl font-bold mb-8">לוח שנה לחיובים</h1>
        
        <div className="grid lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 card-shadow border-none rounded-2xl overflow-hidden bg-white">
            <CardContent className="p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="w-full flex justify-center p-8 scale-110"
                classNames={{
                  day_selected: "bg-primary text-white rounded-full font-bold",
                  day_today: "bg-muted text-primary rounded-full",
                }}
              />
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="card-shadow border-none rounded-2xl bg-white">
              <CardHeader>
                <CardTitle className="text-lg">
                  חיובים ב-{date?.toLocaleDateString('he-IL')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedDaySubs.map(sub => (
                    <div key={sub.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{CATEGORY_METADATA[sub.category].icon}</span>
                        <div>
                          <div className="font-bold">{sub.name}</div>
                          <div className="text-xs text-muted-foreground">{CATEGORY_METADATA[sub.category].label}</div>
                        </div>
                      </div>
                      <div className="font-bold text-primary">{sub.amount} {sub.currency}</div>
                    </div>
                  ))}
                  {selectedDaySubs.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground italic">
                      אין חיובים מתוכננים ליום זה
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="card-shadow border-none rounded-2xl bg-primary/5">
              <CardHeader>
                <CardTitle className="text-lg">סיכום חודשי</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>חיובים שנותרו החודש:</span>
                  <span className="font-bold text-primary">₪840</span>
                </div>
                <div className="flex justify-between">
                  <span>מינויי ניסיון פוקעים:</span>
                  <span className="font-bold text-orange-500">2</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}