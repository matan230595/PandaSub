"use client"

import * as React from "react"
import { TopNav } from "@/components/dashboard/top-nav"
import { SubscriptionList } from "@/components/subscription/subscription-list"
import { Button } from "@/components/ui/button"
import { Plus, Filter, Search, Download } from "lucide-react"
import { AddSubscriptionModal } from "@/components/subscription/add-subscription-modal"
import { useSubscriptions } from "@/context/subscriptions-context"
import { Input } from "@/components/ui/input"

export default function SubscriptionsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false)
  const { subscriptions, exportData } = useSubscriptions()

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA]">
      <TopNav />
      <main className="flex-1 container mx-auto p-4 md:p-8 space-y-8 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">ניהול מינויים</h1>
            <p className="text-muted-foreground">נהל את כל המינויים שלך במקום אחד</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={exportData} className="rounded-full gap-2 ripple">
              <Download className="h-4 w-4" /> ייצוא CSV
            </Button>
            <Button onClick={() => setIsAddModalOpen(true)} className="rounded-full google-btn gap-2 shadow-lg ripple">
              <Plus className="h-5 w-5" /> הוסף מינוי
            </Button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl card-shadow flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="חיפוש חופשי..." className="pr-10 rounded-full border-none bg-muted/50" />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button variant="ghost" className="rounded-full gap-2 border">
              <Filter className="h-4 w-4" /> סינון קטגוריה
            </Button>
            <Button variant="ghost" className="rounded-full gap-2 border">
              סטטוס
            </Button>
          </div>
        </div>

        <SubscriptionList />
      </main>
      <AddSubscriptionModal open={isAddModalOpen} onOpenChange={setIsAddModalOpen} />
    </div>
  )
}