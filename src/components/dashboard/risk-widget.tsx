"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Clock, TrendingUp } from "lucide-react"
import { SAMPLE_SUBSCRIPTIONS, CATEGORY_METADATA } from "@/app/lib/subscription-store"

export function SubscriptionsAtRisk() {
  const atRisk = SAMPLE_SUBSCRIPTIONS.filter(s => s.atRisk || s.status === 'trial')

  return (
    <Card className="border-destructive/20 bg-destructive/5">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">מינויים בסיכון</CardTitle>
        <AlertCircle className="h-4 w-4 text-destructive" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {atRisk.map((sub) => (
            <div key={sub.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{CATEGORY_METADATA[sub.category].icon}</div>
                <div>
                  <div className="font-medium text-sm">{sub.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {sub.status === 'trial' ? 'תקופת ניסיון מסתיימת בקרוב' : 'חוסר שימוש מזוהה'}
                  </div>
                </div>
              </div>
              <Badge variant={sub.status === 'trial' ? "secondary" : "destructive"} className="text-[10px]">
                {sub.status === 'trial' ? <Clock className="me-1 h-3 w-3" /> : <TrendingUp className="me-1 h-3 w-3" />}
                {sub.status === 'trial' ? 'ניסיון' : 'בסיכון'}
              </Badge>
            </div>
          ))}
          {atRisk.length === 0 && (
            <div className="text-sm text-center text-muted-foreground py-4">
              אין מינויים בסיכון כרגע. עבודה טובה!
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
