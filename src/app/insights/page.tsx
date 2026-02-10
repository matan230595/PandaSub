
"use client"

import * as React from "react"
import { TopNav } from "@/components/dashboard/top-nav"
import { AIRecommendations } from "@/components/gen-ai/recommendations"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Sparkles, BrainCircuit, Lightbulb, Zap, TrendingDown, Target } from "lucide-react"
import Link from "next/link"

export default function InsightsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA]">
      <TopNav />
      <main className="flex-1 container mx-auto p-4 md:p-8 space-y-8 animate-fade-in pb-20">
        <div className="flex items-center justify-between flex-row-reverse">
          <div className="text-right">
            <h1 className="text-3xl font-bold tracking-tight">תובנות בינה מלאכותית</h1>
            <p className="text-muted-foreground text-lg">ה-Panda AI מנתח את ההרגלים שלך ומציע דרכים לחיסכון</p>
          </div>
          <div className="bg-primary/10 p-4 rounded-3xl animate-pulse">
            <BrainCircuit className="h-10 w-10 text-primary" />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <InsightCard 
            title="פוטנציאל חיסכון חודשי"
            value="₪420"
            description="על בסיס כפילויות שזוהו"
            icon={<TrendingDown className="text-green-500 h-6 w-6" />}
          />
          <InsightCard 
            title="ציון בריאות פיננסית"
            value="84"
            description="עליה של 5 נקודות מהחודש שעבר"
            icon={<Target className="text-blue-500 h-6 w-6" />}
          />
          <InsightCard 
            title="התראות יזומות"
            value="3"
            description="חידושים שדורשים החלטה השבוע"
            icon={<Zap className="text-orange-500 h-6 w-6" />}
          />
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 text-right">
            <AIRecommendations />
          </div>
          <div className="space-y-6">
            <Card className="card-shadow border-none rounded-3xl bg-white overflow-hidden">
              <CardHeader className="bg-primary/5 border-b">
                <div className="flex items-center gap-2 flex-row-reverse justify-start">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">טיפ Panda חכם</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 text-right space-y-4">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  זיהינו שיש לך גם **Apple TV+** וגם **Netflix Premium**. ה-AI מציע לשקול הקפאה של אחד מהם בחודשים שבהם אין סדרות חדשות שמעניינות אותך.
                </p>
                <div className="h-px bg-muted w-full" />
                <p className="text-sm leading-relaxed text-muted-foreground">
                  המינוי ל-**Adobe** הוא בהתחייבות שנתית. המועד הקרוב לביטול ללא קנס הוא ה-28 במאי. הוספנו תזכורת ביומן.
                </p>
              </CardContent>
            </Card>

            <Card className="card-shadow border-none rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white group">
              <CardContent className="p-6 text-right space-y-4">
                <div className="flex items-center justify-between flex-row-reverse">
                  <Sparkles className="h-6 w-6 animate-pulse" />
                  <span className="font-bold text-lg tracking-tight">Panda Pro</span>
                </div>
                <p className="text-sm leading-relaxed opacity-90">
                  הצטרף למסלול ה-Pro וקבל ניתוח אוטומטי של חשבונות הבנק שלך וביטול מינויים בלחיצת כפתור אחת.
                </p>
                <Link href="/pro">
                  <button className="w-full mt-2 bg-white text-blue-700 font-bold py-3 rounded-2xl text-sm shadow-xl ripple hover:scale-105 transition-transform active:scale-95">
                    למידע נוסף
                  </button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

function InsightCard({ title, value, description, icon }: any) {
  return (
    <Card className="card-shadow border-none rounded-3xl bg-white overflow-hidden group">
      <CardContent className="p-6 text-right flex flex-col items-end">
        <div className="bg-muted/50 p-3 rounded-2xl mb-4 group-hover:scale-110 transition-transform self-start">
          {icon}
        </div>
        <h3 className="text-muted-foreground text-sm font-bold uppercase tracking-wider mb-1">{title}</h3>
        <div className="text-3xl font-black text-foreground mb-1">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}
