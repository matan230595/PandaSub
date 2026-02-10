"use client"

import * as React from "react"
import { TopNav } from "@/components/dashboard/top-nav"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { useSubscriptions } from "@/context/subscriptions-context"
import { CATEGORY_METADATA, Subscription } from "@/app/lib/subscription-store"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  ChevronRight, 
  ChevronLeft, 
  Calendar as CalendarIcon, 
  Clock, 
  Bell, 
  ChevronDown,
  Info,
  MoreHorizontal,
  Plus
} from "lucide-react"
import { 
  format, 
  isSameDay, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  addMonths, 
  subMonths,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  addDays,
  startOfDay
} from "date-fns"
import { he } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { AddSubscriptionModal } from "@/components/subscription/add-subscription-modal"

type ViewType = 'month' | 'week' | 'day'

export default function CalendarPage() {
  const { subscriptions } = useSubscriptions()
  const [currentMonth, setCurrentMonth] = React.useState(new Date())
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date())
  const [view, setView] = React.useState<ViewType>('month')
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false)

  // ניווט
  const next = () => {
    if (view === 'month') setCurrentMonth(addMonths(currentMonth, 1))
    else if (view === 'week') setCurrentMonth(addDays(currentMonth, 7))
    else setCurrentMonth(addDays(currentMonth, 1))
  }
  
  const prev = () => {
    if (view === 'month') setCurrentMonth(subMonths(currentMonth, 1))
    else if (view === 'week') setCurrentMonth(addDays(currentMonth, -7))
    else setCurrentMonth(addDays(currentMonth, -1))
  }

  const goToToday = () => {
    const today = new Date()
    setCurrentMonth(today)
    setSelectedDate(today)
  }

  // סינון מינויים ליום שנבחר
  const selectedDaySubs = subscriptions.filter(sub => {
    const subDate = new Date(sub.renewalDate)
    return isSameDay(subDate, selectedDate)
  })

  // חישוב הוצאות ליום שנבחר
  const dailyTotal = selectedDaySubs.reduce((sum, s) => sum + s.amount, 0)

  // פונקציה לקבלת אירועים ליום מסוים
  const getSubForDay = (day: Date) => {
    return subscriptions.filter(sub => isSameDay(new Date(sub.renewalDate), day))
  }

  // חישוב טווח הימים לתצוגה
  const calendarDays = React.useMemo(() => {
    if (view === 'month') {
      const monthStart = startOfMonth(currentMonth)
      const monthEnd = endOfMonth(monthStart)
      const startDate = startOfWeek(monthStart, { weekStartsOn: 0 })
      const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 })
      return eachDayOfInterval({ start: startDate, end: endDate })
    } else if (view === 'week') {
      const startDate = startOfWeek(currentMonth, { weekStartsOn: 0 })
      const endDate = endOfWeek(currentMonth, { weekStartsOn: 0 })
      return eachDayOfInterval({ start: startDate, end: endDate })
    } else {
      return [startOfDay(currentMonth)]
    }
  }, [currentMonth, view])

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA]">
      <TopNav />
      <main className="flex-1 container mx-auto p-4 md:p-8 space-y-6 animate-fade-in pb-20">
        
        {/* כותרת וסרגל ניווט עליון בסגנון גוגל */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-border/50">
          <div className="flex items-center gap-6 flex-row-reverse">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold tracking-tight">יומן חיובים</h1>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={goToToday} className="rounded-full px-6 font-bold hover:bg-primary/5">היום</Button>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={prev} className="rounded-full">
                  <ChevronRight className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={next} className="rounded-full">
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              </div>
              <span className="text-xl font-bold min-w-[150px] text-center">
                {format(currentMonth, view === 'day' ? "d בMMMM yyyy" : "MMMM yyyy", { locale: he })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="rounded-full gap-2 border-primary/20 bg-primary/5 text-primary font-bold">
                  {view === 'month' ? 'חודשי' : view === 'week' ? 'שבועי' : 'יומי'}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl">
                <DropdownMenuItem onClick={() => setView('month')} className="text-right">תצוגה חודשית</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setView('week')} className="text-right">תצוגה שבועית</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setView('day')} className="text-right">תצוגה יומית</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={() => setIsAddModalOpen(true)} className="rounded-full google-btn gap-2 shadow-lg h-10 px-5">
              <Plus className="h-4 w-4" /> הוסף חיוב
            </Button>
          </div>
        </div>
        
        <div className="grid lg:grid-cols-12 gap-6">
          {/* לוח השנה המרכזי */}
          <div className="lg:col-span-9 bg-white rounded-3xl shadow-xl border border-border/50 overflow-hidden min-h-[700px]">
            {/* כותרות ימי השבוע */}
            <div className="grid grid-cols-7 border-b bg-muted/20">
              {['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'].map(day => (
                <div key={day} className="py-3 text-center text-sm font-bold text-muted-foreground">
                  יום {day}'
                </div>
              ))}
            </div>

            {/* גריד הימים - משתנה לפי התצוגה */}
            <div className={cn(
              "grid min-h-[600px]",
              view === 'month' ? "grid-cols-7" : view === 'week' ? "grid-cols-7" : "grid-cols-1"
            )}>
              {calendarDays.map((day, idx) => {
                const daySubs = getSubForDay(day)
                const isSelected = isSameDay(day, selectedDate)
                const isToday = isSameDay(day, new Date())
                const isCurrentMonth = isSameMonth(day, currentMonth)

                return (
                  <div 
                    key={idx}
                    onClick={() => { setSelectedDate(day); setCurrentMonth(day); }}
                    className={cn(
                      "min-h-[120px] p-2 border-l border-b last:border-l-0 transition-colors cursor-pointer hover:bg-muted/30 flex flex-col gap-1",
                      view === 'month' && !isCurrentMonth && "bg-muted/10 opacity-40",
                      isSelected && "bg-primary/5",
                      isToday && "bg-orange-50/30"
                    )}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className={cn(
                        "h-8 w-8 flex items-center justify-center rounded-full text-sm font-bold",
                        isToday && "bg-primary text-white",
                        isSelected && !isToday && "bg-muted text-foreground"
                      )}>
                        {day.getDate()}
                      </span>
                      {daySubs.length > 0 && (
                        <span className="text-[10px] font-bold text-muted-foreground">
                          ₪{daySubs.reduce((s, b) => s + b.amount, 0).toLocaleString()}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 space-y-1 overflow-hidden">
                      {daySubs.slice(0, 4).map(sub => (
                        <div 
                          key={sub.id} 
                          className="calendar-event-pill"
                          style={{ backgroundColor: CATEGORY_METADATA[sub.category].color }}
                        >
                          <span className="truncate">{sub.name}</span>
                          <span className="ml-auto font-mono text-[9px] opacity-80">{sub.amount}</span>
                        </div>
                      ))}
                      {daySubs.length > 4 && (
                        <div className="text-[10px] font-bold text-muted-foreground text-center pt-1">
                          +{daySubs.length - 4} נוספים...
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* פאנל צד - פירוט היום שנבחר */}
          <div className="lg:col-span-3 space-y-6">
            <Card className="card-shadow border-none rounded-3xl bg-white overflow-hidden flex flex-col h-full max-h-[850px]">
              <CardHeader className="bg-primary/5 border-b p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-primary text-white p-2.5 rounded-2xl shadow-lg shadow-primary/20">
                    <CalendarIcon className="h-5 w-5" />
                  </div>
                  <Badge variant="secondary" className="rounded-full bg-white shadow-sm border-none px-4 py-1 text-primary font-bold">
                    {selectedDaySubs.length} אירועים
                  </Badge>
                </div>
                <CardTitle className="text-2xl font-black">
                  {format(selectedDate, "EEEE, d בMMMM", { locale: he })}
                </CardTitle>
                <CardDescription className="text-base">פירוט חיובים והתראות ליום זה</CardDescription>
              </CardHeader>
              
              <CardContent className="flex-1 p-0 overflow-hidden">
                <ScrollArea className="h-[450px] p-6">
                  {selectedDaySubs.length > 0 ? (
                    <div className="space-y-4">
                      {selectedDaySubs.map(sub => (
                        <div 
                          key={sub.id} 
                          className="group relative flex items-center justify-between p-4 rounded-2xl bg-muted/30 hover:bg-white hover:shadow-md transition-all cursor-pointer border-r-4" 
                          style={{ borderRightColor: CATEGORY_METADATA[sub.category].color }}
                        >
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
                            <div className="font-black text-lg text-primary">{sub.amount} {sub.currency}</div>
                            <Badge variant="outline" className="text-[10px] rounded-full border-none bg-white py-0 h-5">
                              {CATEGORY_METADATA[sub.category].label}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-30">
                      <div className="text-7xl mb-6">🏝️</div>
                      <div className="font-bold text-lg">יום שקט בחיובים</div>
                      <p className="text-sm">אין תשלומים מתוכננים להיום</p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
              
              {dailyTotal > 0 && (
                <div className="p-6 bg-primary/5 border-t mt-auto">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-muted-foreground">סיכום יומי:</span>
                    <span className="text-3xl font-black text-primary">₪{dailyTotal.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </Card>

            {/* כרטיס טיפ חכם */}
            <Card className="card-shadow border-none rounded-3xl bg-gradient-to-br from-orange-500 to-orange-600 text-white overflow-hidden group">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-white/20 p-2.5 rounded-xl group-hover:scale-110 transition-transform">
                    <Bell className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-lg">תובנת פנדה 🐼</h3>
                </div>
                <p className="text-sm text-orange-50 leading-relaxed font-medium">
                  ניהול היומן עוזר לך להבין את תזרים המזומנים הצפוי החודש. וודא שיש כיסוי לכל המינויים! 🚀
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <AddSubscriptionModal open={isAddModalOpen} onOpenChange={setIsAddModalOpen} />

      <style jsx global>{`
        .calendar-event-pill {
          display: flex;
          align-items: center;
          padding: 2px 8px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
          color: white;
          white-space: nowrap;
          overflow: hidden;
          transition: transform 0.1s;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }
        .calendar-event-pill:hover {
          transform: scale(1.02);
          filter: brightness(1.1);
        }
      `}</style>
    </div>
  )
}
