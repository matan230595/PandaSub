
"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Sparkles, RefreshCcw, CheckCircle2 } from "lucide-react"
import { subscriptionRecommendation } from "@/ai/flows/ai-subscription-recommendations"
import { useSubscriptions } from "@/context/subscriptions-context"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export function AIRecommendations({ compact = false }: { compact?: boolean }) {
  const { subscriptions, convertAmount } = useSubscriptions()
  const [loading, setLoading] = React.useState(false)
  const [results, setResults] = React.useState<string | null>(null)

  const getRecommendations = async () => {
    setLoading(true)
    try {
      const subListStr = subscriptions.length > 0 
        ? subscriptions.map(s => `${s.name}: ${s.amount}${s.currency} (${s.category}), ≈ ₪${convertAmount(s.amount, s.currency).toFixed(1)}, מחדש ב-${s.renewalDate}`).join('\n')
        : "אין מינויים כרגע"
      
      const { recommendations } = await subscriptionRecommendation({ subscriptionList: subListStr })
      setResults(recommendations)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className={cn(
      "overflow-hidden border-none shadow-lg rounded-3xl bg-white dark:bg-zinc-900 h-full flex flex-col",
      compact ? "min-h-[160px]" : "min-h-[300px]"
    )} dir="rtl">
      {/* Header with gradient and RTL alignment */}
      <CardHeader className="bg-gradient-to-br from-primary to-blue-700 text-white border-b-0 p-6 md:p-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-2xl shadow-sm border border-white/10">
              <Sparkles className="text-white h-6 w-6" />
            </div>
            <div className="text-right">
              <CardTitle className="font-black text-xl md:text-2xl">תובנות Panda AI</CardTitle>
              <CardDescription className="text-sm font-medium mt-1 text-blue-50/80">ניתוח חכם של הרגלי הצריכה שלך</CardDescription>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={getRecommendations} 
            disabled={loading}
            className="text-white hover:text-white hover:bg-white/10 rounded-full h-10 w-10 p-0"
          >
            <RefreshCcw className={cn(loading ? "animate-spin" : "", "h-5 w-5")} />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 flex-1 flex flex-col justify-center overflow-hidden bg-muted/5">
        {!results && !loading ? (
          <div className="text-center animate-fade-in p-8 md:p-12 space-y-8">
            <div className="relative mx-auto h-24 w-24">
              <div className="absolute inset-0 bg-primary/10 rounded-full animate-pulse" />
              <div className="relative h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto border-2 border-primary/20">
                <Sparkles className="h-12 w-12" />
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-black text-xl md:text-2xl">מוכן לחיסכון חכם?</h4>
              <p className="text-muted-foreground mx-auto font-medium leading-relaxed max-w-sm">
                ה-AI שלנו יסרוק את המינויים שלך וימצא עבורך כפילויות, חלופות זולות יותר והזדמנויות לחיסכון מיידי.
              </p>
            </div>
            <Button 
              onClick={getRecommendations} 
              className="bg-primary hover:bg-primary/90 rounded-full shadow-xl shadow-primary/20 font-black transition-all hover:scale-105 active:scale-95 px-12 h-14 text-lg"
            >
              צור המלצות עכשיו
            </Button>
          </div>
        ) : loading ? (
          <div className="p-8 md:p-12 space-y-6">
            <div className="space-y-3">
              <Skeleton className="h-4 w-3/4 mr-0 ml-auto rounded-full" />
              <Skeleton className="h-4 w-full mr-0 ml-auto rounded-full" />
              <Skeleton className="h-4 w-5/6 mr-0 ml-auto rounded-full" />
              <Skeleton className="h-4 w-2/3 mr-0 ml-auto rounded-full" />
            </div>
            <div className="flex justify-center pt-4">
              <div className="flex items-center gap-3 text-primary font-bold animate-pulse">
                <RefreshCcw className="h-5 w-5 animate-spin" />
                מנתח את הנתונים שלך...
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in flex-1 flex flex-col h-full max-h-[500px]">
            <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1">
              <div className="text-right bg-white dark:bg-zinc-800 rounded-3xl border border-primary/10 shadow-inner p-6 md:p-8">
                <div className="whitespace-pre-wrap leading-relaxed text-foreground font-medium selection:bg-primary/20 text-base md:text-lg prose prose-zinc dark:prose-invert max-w-none">
                  {results}
                </div>
              </div>
            </div>
            <div className="p-6 md:p-8 bg-white/50 border-t">
              <Button 
                size="lg" 
                onClick={() => setResults(null)} 
                className="w-full gap-3 rounded-full font-black shadow-lg bg-primary text-white hover:bg-primary/90 h-14 text-lg"
              >
                <CheckCircle2 className="h-6 w-6" /> הבנתי, תודה!
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
