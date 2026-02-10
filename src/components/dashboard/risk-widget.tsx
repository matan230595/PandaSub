"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Clock, TrendingUp, Zap } from "lucide-react"
import { useSubscriptions } from "@/context/subscriptions-context"
import { CATEGORY_METADATA, STATUS_METADATA } from "@/app/lib/subscription-store"

export function SubscriptionsAtRisk() {
  const { subscriptions } = useSubscriptions()
  const atRisk = subscriptions.filter(s => s.atRisk || s.status === 'trial')

  return (
    <Card className="border-none card-shadow bg-gradient-to-br from-white to-orange-50/30 rounded-2xl overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-orange-500" />
          מינויים בסיכון
        </CardTitle>
        <Badge variant="secondary" className="bg-orange-100 text-orange-600 border-none rounded-full">
          {atRisk.length} התראות
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
          {atRisk.map((sub) => (
            <div key={sub.id} className="flex items-center justify-between p-3 rounded-xl bg-white/50 hover:bg-white transition-all hover:shadow-sm">
              <div className="flex items-center gap-4">
                <div 
                  className="text-2xl h-10 w-10 flex items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${CATEGORY_METADATA[sub.category].color}15` }}
                >
                  {CATEGORY_METADATA[sub.category].icon}
                </div>
                <div>
                  <div className="font-bold text-sm text-foreground">{sub.name}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    {sub.status === 'trial' ? 'תקופת ניסיון מסתיימת בקרוב' : 'חוסר שימוש מזוהה'}
                  </div>
                </div>
              </div>
              <Badge 
                className="text-[10px] font-bold rounded-full border-none shadow-sm"
                style={{ backgroundColor: sub.status === 'trial' ? '#FF5722' : '#F44336', color: 'white' }}
              >
                {sub.status === 'trial' ? <Clock className="me-1 h-3 w-3" /> : <Zap className="me-1 h-3 w-3" />}
                {sub.status === 'trial' ? 'ניסיון' : 'בסיכון'}
              </Badge>
            </div>
          ))}
          {atRisk.length === 0 && (
            <div className="text-sm text-center text-muted-foreground py-8 bg-muted/20 rounded-2xl border-2 border-dashed">
              <div className="text-4xl mb-2">✨</div>
              אין מינויים בסיכון כרגע.
              <br />עבודה טובה!
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}