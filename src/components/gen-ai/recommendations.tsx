"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Sparkles, ArrowLeft, RefreshCcw, CheckCircle2 } from "lucide-react"
import { subscriptionRecommendation } from "@/ai/flows/ai-subscription-recommendations"
import { SAMPLE_SUBSCRIPTIONS } from "@/app/lib/subscription-store"
import { Skeleton } from "@/components/ui/skeleton"

export function AIRecommendations() {
  const [loading, setLoading] = React.useState(false)
  const [results, setResults] = React.useState<string | null>(null)

  const getRecommendations = async () => {
    setLoading(true)
    try {
      const subListStr = SAMPLE_SUBSCRIPTIONS.map(s => 
        `${s.name}: ${s.amount}${s.currency} (${s.category}), מחדש ב-${s.renewalDate}`
      ).join('\n')
      
      const { recommendations } = await subscriptionRecommendation({ subscriptionList: subListStr })
      setResults(recommendations)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="overflow-hidden border-accent/20">
      <CardHeader className="bg-accent/5 border-b border-accent/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            <CardTitle>תובנות AI מותאמות אישית</CardTitle>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={getRecommendations} 
            disabled={loading}
            className="text-accent hover:text-accent hover:bg-accent/10"
          >
            {loading ? <RefreshCcw className="h-4 w-4 animate-spin" /> : "נתח מחדש"}
          </Button>
        </div>
        <CardDescription>הבינה המלאכותית שלנו תעזור לך לחסוך כסף ולמצוא כפילויות</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {!results && !loading ? (
          <div className="p-12 text-center space-y-4">
            <div className="mx-auto h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center text-accent">
              <Sparkles className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">מוכן לחיסכון?</h4>
              <p className="text-sm text-muted-foreground">לחץ על הכפתור כדי לקבל המלצות לשיפור ניהול המינויים שלך</p>
            </div>
            <Button onClick={getRecommendations} className="bg-accent hover:bg-accent/90">צור המלצות</Button>
          </div>
        ) : loading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : (
          <div className="p-6 space-y-4">
            <div className="prose prose-sm max-w-none text-right">
              <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/80">
                {results}
              </div>
            </div>
            <div className="pt-4 flex gap-2">
              <Button size="sm" variant="outline" className="flex-1 gap-2">
                <CheckCircle2 className="h-4 w-4" /> קבל המלצות
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
