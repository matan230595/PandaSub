"use client"

import * as React from "react"
import { TopNav } from "@/components/dashboard/top-nav"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { useSubscriptions } from "@/context/subscriptions-context"
import { CATEGORY_METADATA } from "@/app/lib/subscription-store"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronRight, ChevronLeft, Calendar as CalendarIcon, Clock, Bell } from "lucide-react"
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns"
import { he } from "date-fns/locale"

export default function CalendarPage() {
  const { subscriptions } = useSubscriptions()
  const [date, setDate] = React.useState<Date | undefined>(new Date())

  // סינון מינויים ליום שנבחר
  const selectedDaySubs = subscriptions.filter(sub => {
    const subDate = new Date(sub.renewalDate)
    return date && isSameDay(subDate, date)
  })

  // חישוב הוצאות ליום שנבחר
  const dailyTotal = selectedDaySubs.reduce((sum, s) => sum + s.amount, 0)

  // פונקציה לבדיקה האם יש אירועים ביום מסוים (עבור לוח השנה)
  const getSubForDay = (day: Date) => {
    return subscriptions.filter(sub => isSameDay(new Date(sub.renewalDate), day))
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA]">
      <TopNav />
      <main className="flex-1 container mx-auto p-4 md:p-8 space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">לוח שנה חכם</h1>
            <p className="text-muted-foreground">עקוב אחר חיובים עתידיים ומועדי פקיעה של תקופות ניסיון</p>
          </div>
          <div className="flex gap-2 bg-white p-1 rounded-full shadow-sm border">
            <Badge variant="outline" className="rounded-full px-4 py-1.5 border-none bg-primary/10 text-primary font-bold">חודשי</Badge>
            <Badge variant="ghost" className="rounded-full px-4 py-1.5 text-muted-foreground opacity-50">שבועי</Badge>
          </div>
        </div>
        
        <div className="grid lg:grid-cols-12 gap-8">
          {/* לוח השנה - תצוגה מרכזית */}
          <Card className="lg:col-span-8 card-shadow border-none rounded-3xl overflow-hidden bg-white">
            <CardContent className="p-4 md:p-8">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                locale={he}
                className="w-full"
                classNames={{
                  months: "w-full",
                  month: "w-full space-y-4",
                  caption: "flex justify-between items-center px-4 py-2 mb-4",
                  caption_label: "text-2xl font-bold text-primary",
                  nav: "flex items-center gap-2",
                  table: "w-full border-collapse",
                  head_row: "flex w-full mb-4",
                  head_cell: "text-muted-foreground flex-1 font-bold text-sm",
                  row: "flex w-full mt-1",
                  cell: "h-24 md:h-32 flex-1 relative p-0 text-center text-sm focus-within:relative focus-within:z-20 border border-muted/30 first:rounded-r-xl last:rounded-l-xl overflow-hidden",
                  day: "h-full w-full p-2 font-normal aria-selected:opacity-100 hover:bg-muted/50 transition-colors flex flex-col items-start justify-start",
                  day_selected: "bg-primary/5 text-primary !opacity-100",
                  day_today: "bg-orange-50/50 text-orange-600 font-bold border-2 border-orange-200",
                  day_outside: "text-muted-foreground/30 opacity-50",
                }}
                components={{
                  DayContent: ({ date: dayDate }) => {
                    const daySubs = getSubForDay(dayDate)
                    return (
                      <div className="w-full h-full text-right">
                        <span className="block mb-1 text-xs font-medium opacity-70">{dayDate.getDate()}</span>
                        <div className="space-y-1">
                          {daySubs.slice(0, 3).map(sub => (
                            <div 
                              key={sub.id} 
                              className="calendar-event"
                              style={{ backgroundColor: CATEGORY_METADATA[sub.category].color }}
                            >
                              {sub.name}
                            </div>
                          ))}
                          {daySubs.length > 3 && (
                            <div className="text-[9px] text-muted-foreground font-bold pr-1">
                              +{daySubs.length - 3} נוספים
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  }
                }}
              />
            </CardContent>
          </Card>

          {/* פאנל צד - פירוט היום שנבחר */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="card-shadow border-none rounded-3xl bg-white overflow-hidden flex flex-col h-[400px] lg:h-full max-h-[700px]">
              <CardHeader className="bg-primary/5 border-b p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="bg-primary text-white p-2 rounded-2xl shadow-lg shadow-primary/20">
                    <CalendarIcon className="h-5 w-5" />
                  </div>
                  <Badge variant="secondary" className="rounded-full bg-white shadow-sm border-none px-3">
                    {selectedDaySubs.length} חיובים
                  </Badge>
                </div>
                <CardTitle className="text-xl">
                  {date ? format(date, "EEEE, d בMMMM", { locale: he }) : "בחר יום"}
                </CardTitle>
                <CardDescription>סיכום חיובים ואירועים ליום זה</CardDescription>
              </CardHeader>
              
              <CardContent className="flex-1 p-0">
                <ScrollArea className="h-full p-6">
                  {selectedDaySubs.length > 0 ? (
                    <div className="space-y-4">
                      {selectedDaySubs.map(sub => (
                        <div key={sub.id} className="group relative flex items-center justify-between p-4 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-all cursor-pointer border-r-4" style={{ borderRightColor: CATEGORY_METADATA[sub.category].color }}>
                          <div className="flex items-center gap-4">
                            <span className="text-3xl filter drop-shadow-sm">{CATEGORY_METADATA[sub.category].icon}</span>
                            <div>
                              <div className="font-bold text-foreground">{sub.name}</div>
                              <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {sub.status === 'trial' ? 'סיום ניסיון' : 'חידוש חודשי'}
                              </div>
                            </div>
                          </div>
                          <div className="text-left">
                            <div className="font-bold text-lg text-primary">{sub.amount} {sub.currency}</div>
                            <Badge variant="outline" className="text-[10px] rounded-full border-none bg-white py-0 h-5">
                              {CATEGORY_METADATA[sub.category].label}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                      <div className="text-6xl mb-4 grayscale">🐼</div>
                      <div className="font-medium">אין חיובים מתוכננים</div>
                      <div className="text-xs">יום שקט בכיס...</div>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
              
              {dailyTotal > 0 && (
                <div className="p-6 bg-muted/10 border-t mt-auto">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">סה"כ יומי:</span>
                    <span className="text-2xl font-black text-foreground">₪{dailyTotal.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </Card>

            <Card className="card-shadow border-none rounded-3xl bg-orange-500 text-white overflow-hidden group">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-white/20 p-2 rounded-xl group-hover:scale-110 transition-transform">
                    <Bell className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold">טיפ חכם מהפנדה</h3>
                </div>
                <p className="text-sm text-orange-50 leading-relaxed">
                  החודש יש לך 3 מינויי ניסיון שמסתיימים. הגדרנו לך תזכורות יומיים מראש כדי שלא תשלם סתם! 🚀
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
