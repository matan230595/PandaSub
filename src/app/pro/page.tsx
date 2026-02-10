
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
  Lock,
  Heart
} from "lucide-react"
import Link from "next/link"

export default function ProPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA]">
      <TopNav />
      <main className="flex-1 container mx-auto p-4 md:p-8 space-y-12 animate-fade-in pb-20 max-w-6xl">
        
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

        {/* Comparison Section - Now with 3 plans */}
        <div className="space-y-8 mt-12">
          <div className="text-center">
            <h2 className="text-3xl font-black">המסלול שמתאים לך</h2>
            <p className="text-muted-foreground mt-2">שקיפות מלאה ללא אותיות קטנות</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Free Plan */}
            <Card className="card-shadow border-none rounded-3xl overflow-hidden bg-white flex flex-col">
              <div className="p-8 space-y-6 flex-1">
                <h3 className="text-2xl font-bold text-right">Panda Free</h3>
                <div className="text-4xl font-black text-right">₪0 <span className="text-sm font-normal text-muted-foreground">/ לתמיד</span></div>
                <ul className="space-y-4">
                  <PriceItem text="ניהול ידני של עד 10 מינויים" check />
                  <PriceItem text="יומן חיובים בסיסי" check />
                  <PriceItem text="התראות לפני חיוב" check />
                  <PriceItem text="סנכרון בנקאי" cross />
                  <PriceItem text="ביטול אוטומטי" cross />
                </ul>
              </div>
              <div className="p-8 pt-0">
                <Button variant="outline" className="w-full rounded-2xl h-12 font-bold">המשך בחינם</Button>
              </div>
            </Card>

            {/* Pro Plan */}
            <Card className="card-shadow border-2 border-primary rounded-3xl overflow-hidden bg-white relative flex flex-col scale-105 z-10">
              <div className="absolute top-4 left-4 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter shadow-lg">מומלץ</div>
              <div className="p-8 space-y-6 flex-1 bg-primary/[0.02]">
                <h3 className="text-2xl font-bold text-primary text-right">Panda Pro</h3>
                <div className="text-4xl font-black text-primary text-right">₪19 <span className="text-sm font-normal text-muted-foreground">/ לחודש</span></div>
                <ul className="space-y-4">
                  <PriceItem text="ניהול מינויים ללא הגבלה" check />
                  <PriceItem text="סנכרון בנקאי אוטומטי" check />
                  <PriceItem text="ביטול בלחיצת כפתור" check />
                  <PriceItem text="דוח תובנות AI מפורט" check />
                  <PriceItem text="תמיכה בניהול משפחתי" cross />
                </ul>
              </div>
              <div className="p-8 pt-0 bg-primary/[0.02]">
                <Button className="w-full rounded-2xl h-12 font-bold shadow-lg google-btn">השתדרג ל-Pro</Button>
              </div>
            </Card>

            {/* Family Plan */}
            <Card className="card-shadow border-none rounded-3xl overflow-hidden bg-white flex flex-col">
              <div className="p-8 space-y-6 flex-1">
                <h3 className="text-2xl font-bold text-right flex items-center gap-2 justify-end">Panda Family <Heart className="h-5 w-5 text-red-500 fill-red-500" /></h3>
                <div className="text-4xl font-black text-right">₪35 <span className="text-sm font-normal text-muted-foreground">/ לחודש</span></div>
                <ul className="space-y-4">
                  <PriceItem text="כל יכולות ה-Pro ל-5 משתמשים" check />
                  <PriceItem text="ניהול תקציב משותף" check />
                  <PriceItem text="בקרת הורים על מינויי נוער" check />
                  <PriceItem text="תמיכה אישית בביטולים מורכבים" check />
                  <PriceItem text="תמיכת VIP עדיפות ראשונה" check />
                </ul>
              </div>
              <div className="p-8 pt-0">
                <Button variant="outline" className="w-full rounded-2xl h-12 font-bold border-primary text-primary hover:bg-primary/5">בחר במסלול משפחתי</Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Trust Footer */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-muted-foreground opacity-60 grayscale hover:grayscale-0 transition-all pt-10">
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
      <span className="flex-1 text-right">{text}</span>
    </li>
  )
}
