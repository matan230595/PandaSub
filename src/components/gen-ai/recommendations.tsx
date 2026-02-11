
"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Sparkles, RefreshCcw, CheckCircle2 } from "lucide-react"
import { subscriptionRecommendation } from "@/ai/flows/ai-subscription-recommendations"
import { useSubscriptions } from "@/context/subscriptions-context"
import { Skeleton } from "@/components/ui/skeleton"

export function AIRecommendations() {
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
    <Card className="overflow-hidden border-none card-shadow rounded-[2.5rem] bg-white dark:bg-zinc-900 h-full flex flex-col">
      <CardHeader className="bg-primary/5 border-b p-8">
        <div className="flex items-center justify-between flex-row-reverse gap-4">
          <div className="flex items-center gap-4 flex-row-reverse">
            <div className="bg-primary/10 p-3 rounded-2xl shadow-sm border border-primary/10">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div className="text-right">
              <CardTitle className="text-2xl font-black">תובנות Panda AI</CardTitle>
              <CardDescription className="text-sm font-medium mt-1">ניתוח חכם של הרגלי הצריכה שלך</CardDescription>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={getRecommendations} 
            disabled={loading}
            className="text-primary hover:text-primary hover:bg-primary/10 rounded-full h-10 w-10 p-0 transition-transform active:rotate-180"
          >
            {loading ? <RefreshCcw className="h-5 w-5 animate-spin" /> : <RefreshCcw className="h-5 w-5" />}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 flex-1 flex flex-col justify-center min-h-[300px]">
        {!results && !loading ? (
          <div className="p-10 text-center space-y-8 animate-fade-in">
            <div className="relative mx-auto h-24 w-24">
              <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping opacity-20" />
              <div className="relative h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Sparkles className="h-12 w-12" />
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-black text-2xl">מוכן לחיסכון חכם?</h4>
              <p className="text-base text-muted-foreground max-w-xs mx-auto font-medium">
                ה-AI שלנו יסרוק את המינויים שלך וימצא עבורך כפילויות, חלופות זולות וטיפים לניהול תקציב נכון.
              </p>
            </div>
            <Button 
              onClick={getRecommendations} 
              className="bg-primary hover:bg-primary/90 rounded-full px-10 h-14 shadow-xl shadow-primary/20 font-black text-lg transition-all hover:scale-105 active:scale-95"
            >
              צור המלצות עכשיו
            </Button>
          </div>
        ) : loading ? (
          <div className="p-10 space-y-6">
            <div className="space-y-4">
              <Skeleton className="h-5 w-3/4 ml-auto rounded-full" />
              <Skeleton className="h-5 w-full ml-auto rounded-full" />
              <Skeleton className="h-5 w-5/6 ml-auto rounded-full" />
              <Skeleton className="h-5 w-2/3 ml-auto rounded-full" />
              <Skeleton className="h-5 w-full ml-auto rounded-full" />
            </div>
            <div className="flex justify-center pt-4">
              <div className="flex items-center gap-2 text-primary font-bold animate-pulse">
                <RefreshCcw className="h-4 w-4 animate-spin" />
                מנתח נתונים...
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 space-y-8 animate-fade-in overflow-y-auto max-h-[500px]">
            <div className="text-right bg-primary/5 p-8 rounded-[2rem] border border-primary/10 shadow-inner">
              <div className="whitespace-pre-wrap text-base leading-relaxed text-foreground font-bold selection:bg-primary/20 direction-rtl">
                {results}
              </div>
            </div>
            <div className="pt-2">
              <Button 
                size="lg" 
                onClick={() => setResults(null)} 
                className="w-full gap-3 rounded-full font-black shadow-lg shadow-primary/20 bg-white text-primary border-2 border-primary/10 hover:bg-primary/5 h-14 text-lg"
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
