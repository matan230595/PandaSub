"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Sparkles, ArrowLeft, RefreshCcw, CheckCircle2 } from "lucide-react"
import { subscriptionRecommendation } from "@/ai/flows/ai-subscription-recommendations"
import { useSubscriptions } from "@/context/subscriptions-context"
import { Skeleton } from "@/components/ui/skeleton"

export function AIRecommendations() {
  const { subscriptions } = useSubscriptions()
  const [loading, setLoading] = React.useState(false)
  const [results, setResults] = React.useState<string | null>(null)

  const getRecommendations = async () => {
    setLoading(true)
    try {
      const subListStr = subscriptions.length > 0 
        ? subscriptions.map(s => `${s.name}: ${s.amount}${s.currency} (${s.category}), מחדש ב-${s.renewalDate}`).join('\n')
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
    <Card className="overflow-hidden border-none card-shadow rounded-3xl bg-white">
      <CardHeader className="bg-primary/5 border-b p-6">
        <div className="flex items-center justify-between flex-row-reverse">
          <div className="flex items-center gap-3 flex-row-reverse">
            <div className="bg-primary/10 p-2 rounded-xl">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div className="text-right">
              <CardTitle className="text-xl font-bold">תובנות Panda AI</CardTitle>
              <CardDescription className="text-xs">ניתוח חכם של הרגלי הצריכה שלך</CardDescription>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={getRecommendations} 
            disabled={loading}
            className="text-primary hover:text-primary hover:bg-primary/10 rounded-full"
          >
            {loading ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {!results && !loading ? (
          <div className="p-12 text-center space-y-6">
            <div className="mx-auto h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary animate-pulse">
              <Sparkles className="h-10 w-10" />
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-xl">מוכן לחיסכון חכם?</h4>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">ה-AI שלנו יסרוק את המינויים שלך וימצא עבורך כפילויות, חלופות זולות יותר וטיפים לניהול תקציב נכון.</p>
            </div>
            <Button onClick={getRecommendations} className="bg-primary hover:bg-primary/90 rounded-full px-8 h-12 shadow-lg shadow-primary/20 font-bold">צור המלצות עכשיו</Button>
          </div>
        ) : loading ? (
          <div className="p-8 space-y-4">
            <Skeleton className="h-4 w-3/4 ml-auto" />
            <Skeleton className="h-4 w-full ml-auto" />
            <Skeleton className="h-4 w-5/6 ml-auto" />
            <Skeleton className="h-4 w-2/3 ml-auto" />
          </div>
        ) : (
          <div className="p-8 space-y-6">
            <div className="text-right">
              <div className="whitespace-pre-wrap text-base leading-relaxed text-foreground font-medium">
                {results}
              </div>
            </div>
            <div className="pt-4 flex gap-4">
              <Button size="lg" className="flex-1 gap-2 rounded-full font-bold shadow-lg shadow-primary/20">
                <CheckCircle2 className="h-5 w-5" /> יישם המלצות
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
