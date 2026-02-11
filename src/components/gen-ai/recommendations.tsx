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
      compact ? "h-[220px]" : ""
    )}>
      {/* Updated Header with blue gradient and RTL alignment */}
      <CardHeader className={cn(
        "bg-gradient-to-br from-primary to-blue-700 text-white border-b-0",
        compact ? "p-4 py-3" : "p-8"
      )}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "bg-white/20 rounded-xl shadow-sm border border-white/10",
              compact ? "p-1.5" : "p-3"
            )}>
              <Sparkles className={cn("text-white", compact ? "h-4 w-4" : "h-6 w-6")} />
            </div>
            <div className="text-right">
              <CardTitle className={cn("font-black", compact ? "text-lg" : "text-2xl")}>תובנות Panda AI</CardTitle>
              {!compact && <CardDescription className="text-sm font-medium mt-1 text-blue-50/80">ניתוח חכם של הרגלי הצריכה שלך</CardDescription>}
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
      
      <CardContent className="p-0 flex-1 flex flex-col justify-center overflow-hidden">
        {!results && !loading ? (
          <div className={cn("text-center animate-fade-in", compact ? "p-4 space-y-3" : "p-10 space-y-8")}>
            {!compact && (
              <div className="relative mx-auto h-20 w-24">
                <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping opacity-20" />
                <div className="relative h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto">
                  <Sparkles className="h-10 w-10" />
                </div>
              </div>
            )}
            <div className="space-y-1">
              <h4 className={cn("font-black", compact ? "text-sm" : "text-xl")}>מוכן לחיסכון חכם?</h4>
              <p className={cn("text-muted-foreground mx-auto font-medium leading-tight", compact ? "text-[10px] max-w-[180px]" : "text-base max-w-xs")}>
                ה-AI שלנו יסרוק את המינויים שלך וימצא עבורך כפילויות וחלופות זולות.
              </p>
            </div>
            <Button 
              onClick={getRecommendations} 
              className={cn(
                "bg-primary hover:bg-primary/90 rounded-full shadow-lg shadow-primary/20 font-black transition-all hover:scale-105 active:scale-95",
                compact ? "px-6 h-9 text-xs" : "px-10 h-14 text-lg"
              )}
            >
              צור המלצות
            </Button>
          </div>
        ) : loading ? (
          <div className={cn("space-y-4", compact ? "p-4" : "p-10")}>
            <div className="space-y-2">
              <Skeleton className="h-3 w-3/4 ml-auto rounded-full" />
              <Skeleton className="h-3 w-full ml-auto rounded-full" />
              <Skeleton className="h-3 w-5/6 ml-auto rounded-full" />
            </div>
            <div className="flex justify-center pt-2">
              <div className="flex items-center gap-2 text-primary text-xs font-bold animate-pulse">
                <RefreshCcw className="h-3 w-3 animate-spin" />
                מנתח...
              </div>
            </div>
          </div>
        ) : (
          <div className={cn("animate-fade-in overflow-y-auto custom-scrollbar", compact ? "p-4" : "p-8")}>
            <div className={cn(
              "text-right bg-primary/5 rounded-2xl border border-primary/10 shadow-inner",
              compact ? "p-4" : "p-8"
            )}>
              <div className={cn(
                "whitespace-pre-wrap leading-relaxed text-foreground font-bold selection:bg-primary/20 direction-rtl",
                compact ? "text-[11px]" : "text-base"
              )}>
                {results}
              </div>
            </div>
            <div className={cn(compact ? "mt-3" : "mt-6")}>
              <Button 
                size="sm" 
                onClick={() => setResults(null)} 
                className={cn(
                  "w-full gap-2 rounded-full font-black shadow-md bg-white text-primary border border-primary/10 hover:bg-primary/5",
                  compact ? "h-9 text-xs" : "h-14 text-lg"
                )}
              >
                <CheckCircle2 className={compact ? "h-4 w-4" : "h-6 w-6"} /> הבנתי!
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
