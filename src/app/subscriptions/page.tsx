"use client"

import * as React from "react"
import { TopNav } from "@/components/dashboard/top-nav"
import { SubscriptionList } from "@/components/subscription/subscription-list"
import { Button } from "@/components/ui/button"
import { Plus, Download } from "lucide-react"
import { AddSubscriptionModal } from "@/components/subscription/add-subscription-modal"
import { useSubscriptions } from "@/context/subscriptions-context"

export default function SubscriptionsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false)
  const { exportData } = useSubscriptions()

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA]">
      <TopNav />
      <main className="flex-1 container mx-auto p-4 md:p-8 space-y-8 animate-fade-in pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="text-right">
            <h1 className="text-3xl font-bold tracking-tight">ניהול מינויים</h1>
            <p className="text-muted-foreground">כל המינויים שלך במקום אחד, מסונכרנים ומאורגנים</p>
          </div>
          <div className="flex items-center gap-3 flex-row-reverse">
            <Button onClick={() => setIsAddModalOpen(true)} className="rounded-full google-btn gap-2 shadow-lg h-11 px-6">
              <Plus className="h-5 w-5" /> הוסף מינוי
            </Button>
            <Button variant="outline" onClick={exportData} className="rounded-full gap-2 border-primary/20 hover:bg-primary/5 text-primary h-11">
              <Download className="h-4 w-4" /> ייצוא CSV
            </Button>
          </div>
        </div>

        {/* רשימת המינויים מכילה בתוכה את סרגל החיפוש והסינון הפונקציונלי */}
        <SubscriptionList />
      </main>
      <AddSubscriptionModal open={isAddModalOpen} onOpenChange={setIsAddModalOpen} />
    </div>
  )
}
