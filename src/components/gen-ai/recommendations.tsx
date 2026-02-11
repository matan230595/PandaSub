"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Sparkles, RefreshCcw } from "lucide-react"
import { subscriptionRecommendation } from "@/ai/flows/ai-subscription-recommendations"
import { useSubscriptions } from "@/context/subscriptions-context"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

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
    <Card className="overflow-hidden border-none shadow-lg rounded-[2rem] bg-white dark:bg-zinc-900 h-full flex flex-col min-h-[160px]" dir="rtl">
      <CardHeader className="bg-gradient-to-br from-primary to-blue-700 text-white border-b-0 p-5">
        <div className="flex items-center justify-between gap-4 flex-row-reverse">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl border border-white/10">
              <Sparkles className="text-white h-4 w-4" />
            </div>
            <div className="text-right">
              <CardTitle className="font-black text-lg">תובנות Panda AI</CardTitle>
              <CardDescription className="text-[10px] font-medium text-blue-50/80">ניתוח חכם</CardDescription>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={getRecommendations} 
            disabled={loading}
            className="text-white hover:text-white hover:bg-white/10 rounded-full h-8 w-8 p-0"
          >
            <RefreshCcw className={cn(loading ? "animate-spin" : "", "h-4 w-4")} />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 flex-1 flex flex-col justify-center overflow-hidden bg-muted/5">
        {!results && !loading ? (
          <div className="text-center animate-fade-in p-6 space-y-4">
            <h4 className="font-black text-base">מוכן לחיסכון חכם?</h4>
            <Button 
              onClick={getRecommendations} 
              size="sm"
              className="bg-primary hover:bg-primary/90 rounded-full shadow-lg font-black px-6 h-10 text-xs"
            >
              צור המלצות עכשיו
            </Button>
          </div>
        ) : loading ? (
          <div className="p-6 space-y-3">
            <Skeleton className="h-3 w-3/4 mr-0 ml-auto rounded-full" />
            <Skeleton className="h-3 w-full mr-0 ml-auto rounded-full" />
            <div className="flex justify-center pt-2">
              <div className="flex items-center gap-2 text-primary text-xs font-bold animate-pulse">
                <RefreshCcw className="h-4 w-4 animate-spin" />
                מנתח...
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in flex-1 flex flex-col h-full max-h-[300px]">
            <div className="p-4 overflow-y-auto custom-scrollbar flex-1">
              <div className="text-right bg-white dark:bg-zinc-800 rounded-xl border border-primary/10 p-4">
                <div className="whitespace-pre-wrap leading-relaxed text-foreground font-medium text-xs prose prose-zinc dark:prose-invert max-w-none">
                  {results}
                </div>
              </div>
            </div>
            <div className="p-3 bg-white/50 border-t">
              <Button 
                size="sm" 
                onClick={() => setResults(null)} 
                className="w-full rounded-full font-black shadow-lg bg-primary text-white hover:bg-primary/90 h-10 text-xs"
              >
                הבנתי, תודה!
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
