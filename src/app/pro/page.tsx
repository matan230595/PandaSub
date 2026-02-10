
"use client"

import * as React from "react"
import { TopNav } from "@/components/dashboard/top-nav"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Banknote, 
  MousePointerClick, 
  Users, 
  ArrowRight,
  CheckCircle2,
  Lock
} from "lucide-react"
import Link from "next/link"

export default function ProPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA]">
      <TopNav />
      <main className="flex-1 container mx-auto p-4 md:p-8 space-y-12 animate-fade-in pb-20 max-w-5xl">
        
        {/* Hero Section */}
        <div className="text-center space-y-6 pt-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full font-bold text-sm animate-bounce">
            <Sparkles className="h-4 w-4" />
            העתיד של ניהול המינויים כבר כאן
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-foreground leading-tight">
            תהיה מאסטר בכסף שלך עם <span className="text-primary">Panda Pro</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            הצטרף לאלפי משתמשים שחוסכים בממוצע ₪1,840 בשנה באמצעות אוטומציה מלאה ובינה מלאכותית מתקדמת.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button size="lg" className="rounded-full px-12 h-14 text-lg font-bold google-btn shadow-2xl shadow-primary/30">
              התחל תקופת ניסיון בחינם
            </Button>
            <Link href="/">
              <Button variant="ghost" size="lg" className="rounded-full px-8 h-14 font-bold">
                חזרה לדשבורד
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid gap-8 md:grid-cols-3 pt-12">
          <FeatureCard 
            icon={<Banknote className="h-8 w-8 text-blue-500" />}
            title="סנכרון בנקאי אוטומטי"
            description="חיבור מאובטח לחשבון הבנק וכרטיס האשראי. המערכת תזהה ותעדכן את המינויים שלך בזמן אמת ללא צורך בהזנה ידנית."
          />
          <FeatureCard 
            icon={<MousePointerClick className="h-8 w-8 text-purple-500" />}
            title="ביטול בלחיצת כפתור"
            description="נמאס לך לחכות לנציג שירות? פשוט לחץ על 'בטל' וה-AI שלנו יבצע עבורך את תהליך הביטול מול החברה."
          />
          <FeatureCard 
            icon={<Users className="h-8 w-8 text-green-500" />}
            title="ניהול משפחתי"
            description="נהל את המינויים של כל בני הבית במקום אחד. מנע כפילויות משפחתיות וחסוך כסף רב בכל חודש."
          />
        </div>

        {/* Comparison Section */}
        <Card className="card-shadow border-none rounded-3xl overflow-hidden bg-white mt-12">
          <CardHeader className="bg-primary/5 text-center p-8 border-b">
            <CardTitle className="text-3xl font-black">המסלול שמתאים לך</CardTitle>
            <CardDescription className="text-lg">שקיפות מלאה ללא אותיות קטנות</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid md:grid-cols-2 divide-x divide-x-reverse">
              <div className="p-10 space-y-6">
                <h3 className="text-2xl font-bold">Panda Free</h3>
                <div className="text-4xl font-black">₪0 <span className="text-sm font-normal text-muted-foreground">/ לתמיד</span></div>
                <ul className="space-y-4">
                  <PriceItem text="ניהול ידני של עד 10 מינויים" check />
                  <PriceItem text="יומן חיובים בסיסי" check />
                  <PriceItem text="התראות לפני חיוב" check />
                  <PriceItem text="סנכרון בנקאי" cross />
                  <PriceItem text="ביטול אוטומטי" cross />
                </ul>
              </div>
              <div className="p-10 space-y-6 bg-primary/[0.02] relative">
                <div className="absolute top-6 left-6 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter shadow-lg">מומלץ</div>
                <h3 className="text-2xl font-bold text-primary">Panda Pro</h3>
                <div className="text-4xl font-black text-primary">₪19 <span className="text-sm font-normal text-muted-foreground">/ לחודש</span></div>
                <ul className="space-y-4">
                  <PriceItem text="ניהול מינויים ללא הגבלה" check />
                  <PriceItem text="סנכרון בנקאי אוטומטי מלא" check />
                  <PriceItem text="ביטול מינויים בלחיצת כפתור" check />
                  <PriceItem text="דוח תובנות AI שבועי מפורט" check />
                  <PriceItem text="תמיכה בניהול משפחתי" check />
                </ul>
                <Button className="w-full rounded-2xl h-12 font-bold shadow-lg mt-6">השתדרג ל-Pro עכשיו</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trust Footer */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-muted-foreground opacity-60 grayscale hover:grayscale-0 transition-all">
          <div className="flex items-center gap-2 font-bold"><ShieldCheck className="h-5 w-5" /> אבטחה בדרגת בנק</div>
          <div className="flex items-center gap-2 font-bold"><Lock className="h-5 w-5" /> מידע מוצפן 256-bit</div>
          <div className="flex items-center gap-2 font-bold"><CheckCircle2 className="h-5 w-5" /> 30 יום החזר כספי</div>
        </div>
      </main>
    </div>
  )
}

function FeatureCard({ icon, title, description }: any) {
  return (
    <Card className="card-shadow border-none rounded-3xl bg-white group hover:bg-primary/5 transition-colors">
      <CardContent className="p-8 text-right flex flex-col items-end space-y-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border group-hover:scale-110 transition-transform self-start">
          {icon}
        </div>
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  )
}

function PriceItem({ text, check, cross }: any) {
  return (
    <li className={`flex items-center gap-3 flex-row-reverse text-sm font-medium ${cross ? 'opacity-40' : ''}`}>
      {check && <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />}
      {cross && <Lock className="h-5 w-5 text-muted-foreground shrink-0" />}
      <span className="flex-1">{text}</span>
    </li>
  )
}
