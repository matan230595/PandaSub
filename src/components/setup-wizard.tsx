"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { useSubscriptions } from "@/context/subscriptions-context"
import { Sparkles, ShieldCheck, PieChart, CreditCard, ChevronLeft, ChevronRight } from "lucide-react"

export function SetupWizard() {
  const { isWizardComplete, completeWizard } = useSubscriptions()
  const [step, setStep] = React.useState(1)
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    if (!isWizardComplete) {
      setOpen(true)
    }
  }, [isWizardComplete])

  const steps = [
    {
      title: "ברוכים הבאים ל-PandaSub! 🐼",
      description: "המערכת החכמה ביותר לניהול המינויים שלך, חסכון בכסף ומעקב הוצאות.",
      icon: <Sparkles className="h-12 w-12 text-primary" />,
      content: "כאן תוכלו לרכז את כל המינויים שלכם (נטפליקס, חדר כושר, ביטוחים ועוד) ולקבל התראות לפני חיובים."
    },
    {
      title: "מעקב וניהול חכם",
      description: "אנחנו נדאג להזכיר לך מתי מינוי עומד להתחדש.",
      icon: <ShieldCheck className="h-12 w-12 text-green-500" />,
      content: "זיהוי אוטומטי של תקופות ניסיון שמסתיימות והתראות על מינויים שלא בשימוש."
    },
    {
      title: "תובנות AI וסטטיסטיקה",
      description: "קבל תמונה מלאה על ההוצאות החודשיות שלך.",
      icon: <PieChart className="h-12 w-12 text-blue-500" />,
      content: "גרפים אינטראקטיביים והמלצות בינה מלאכותית לחסכון בכסף ומציאת חלופות זולות יותר."
    }
  ]

  const currentStep = steps[step - 1]

  const handleNext = () => {
    if (step < steps.length) {
      setStep(step + 1)
    } else {
      completeWizard()
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px] text-right" aria-describedby="setup-desc">
        <DialogHeader className="items-center">
          <div className="mb-4 bg-primary/10 p-4 rounded-full animate-bounce">
            {currentStep.icon}
          </div>
          <DialogTitle className="text-2xl font-bold">{currentStep.title}</DialogTitle>
          <DialogDescription id="setup-desc" className="text-base mt-2">
            {currentStep.description}
          </DialogDescription>
        </DialogHeader>
        <div className="py-6 text-center text-muted-foreground">
          {currentStep.content}
        </div>
        <div className="flex justify-center gap-1 mb-6">
          {steps.map((_, i) => (
            <div 
              key={i} 
              className={`h-2 rounded-full transition-all ${step === i + 1 ? 'w-8 bg-primary' : 'w-2 bg-muted'}`} 
            />
          ))}
        </div>
        <DialogFooter className="sm:justify-between flex-row-reverse w-full gap-4">
          <Button onClick={handleNext} className="gap-2 rounded-full px-8 ripple">
            {step === steps.length ? "בואו נתחיל!" : "הבא"} 
            {step < steps.length && <ChevronLeft className="h-4 w-4" />}
          </Button>
          {step > 1 && (
            <Button variant="ghost" onClick={() => setStep(step - 1)} className="rounded-full">
              חזרה
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
