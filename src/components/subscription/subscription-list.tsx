
"use client"

import * as React from "react"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  Edit2, 
  LayoutGrid,
  List as ListIcon,
  Columns,
  Clock,
  Search,
  Trash2,
  AlertTriangle
} from "lucide-react"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { CATEGORY_METADATA, STATUS_METADATA, Subscription, SubscriptionCategory, SubscriptionStatus } from "@/app/lib/subscription-store"
import { useSubscriptions } from "@/context/subscriptions-context"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { AddSubscriptionModal } from "./add-subscription-modal"
import { cn } from "@/lib/utils"
import { format, differenceInDays } from "date-fns"
import { he } from "date-fns/locale"

export function SubscriptionList() {
  const { subscriptions, deleteSubscription, settings, updateSettings } = useSubscriptions()
  
  const [viewMode, setViewMode] = React.useState<'table' | 'cards' | 'kanban'>('cards')
  const [selectedSub, setSelectedSub] = React.useState<Subscription | null>(null)
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [categoryFilter] = React.useState<SubscriptionCategory | 'all'>('all')
  const [statusFilter] = React.useState<SubscriptionStatus | 'all'>('all')
  const [deleteConfirmId, setDeleteConfirmId] = React.useState<string | null>(null)

  const filteredSubs = subscriptions.filter(sub => {
    const matchesSearch = sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         CATEGORY_METADATA[sub.category].label.includes(searchTerm);
    const matchesCategory = categoryFilter === 'all' || sub.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  })

  const handleEdit = (sub: Subscription) => {
    setSelectedSub(sub)
    setIsModalOpen(true)
  }

  const isVisible = (columnId: string) => (settings.visibleColumns || []).includes(columnId)

  const renderCountdown = (sub: Subscription) => {
    const today = new Date()
    today.setHours(0,0,0,0)
    const renewal = new Date(sub.renewalDate)
    renewal.setHours(0,0,0,0)
    const daysLeft = differenceInDays(renewal, today)
    let progress = 100
    let color = "bg-green-500"
    let textClass = "text-green-600"
    if (daysLeft <= 0) { progress = 100; color = "bg-destructive animate-pulse"; textClass = "text-destructive font-black"; }
    else if (daysLeft <= 3) { progress = 90; color = "bg-destructive"; textClass = "text-destructive font-bold"; }
    else if (daysLeft <= 7) { progress = 70; color = "bg-orange-500"; textClass = "text-orange-600 font-bold"; }
    else if (daysLeft <= 14) { progress = 40; color = "bg-blue-500"; textClass = "text-blue-600 font-bold"; }
    else { progress = 20; color = "bg-green-500"; textClass = "text-green-600"; }
    return (
      <div className="space-y-1 w-full mt-1">
        <div className="flex justify-between items-center text-[9px] font-bold flex-row-reverse">
          <span className={cn("flex items-center gap-1", textClass)}>
            <Clock className="h-2.5 w-2.5" />
            {daysLeft <= 0 ? "היום!" : `בעוד ${daysLeft} ימ'`}
          </span>
          <span className="text-muted-foreground opacity-50">{progress}%</span>
        </div>
        <Progress value={progress} indicatorClassName={color} className="h-1 rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6 min-w-0 max-w-full overflow-hidden" dir="rtl">
      <div className="bg-white p-3 md:p-4 rounded-[2rem] shadow-md border border-border/50 flex flex-col lg:flex-row gap-4 items-center">
        <div className="flex items-center gap-3 w-full lg:w-auto shrink-0 flex-row-reverse">
          <div className="flex p-1.5 bg-muted/40 rounded-2xl h-11 flex-row-reverse shrink-0 shadow-inner">
            <Button variant={viewMode === 'table' ? 'default' : 'ghost'} size="icon" onClick={() => setViewMode('table')} className={cn("h-8 w-9 rounded-lg transition-all", viewMode === 'table' && "shadow-md")}><ListIcon className="h-4 w-4" /></Button>
            <Button variant={viewMode === 'cards' ? 'default' : 'ghost'} size="icon" onClick={() => setViewMode('cards')} className={cn("h-8 w-9 rounded-lg transition-all", viewMode === 'cards' && "shadow-md")}><LayoutGrid className="h-4 w-4" /></Button>
            <Button variant={viewMode === 'kanban' ? 'default' : 'ghost'} size="icon" onClick={() => setViewMode('kanban')} className={cn("h-8 w-9 rounded-lg transition-all", viewMode === 'kanban' && "shadow-md")}><Columns className="h-4 w-4" /></Button>
          </div>
        </div>
        <div className="relative flex-1 w-full">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="חפש מינוי..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pr-11 h-11 text-sm text-right bg-muted/20 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all font-medium" />
        </div>
      </div>
      <div className="min-h-[400px] max-w-full overflow-hidden">
        {viewMode === 'table' && (
          <div className="rounded-[1.5rem] border border-border/50 shadow-xl bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/20">
                  <TableRow>
                    {isVisible('name') && <TableHead className="text-right p-4">מינוי</TableHead>}
                    {isVisible('category') && <TableHead className="text-right p-4">קטגוריה</TableHead>}
                    {isVisible('amount') && <TableHead className="text-right p-4">סכום</TableHead>}
                    {isVisible('renewalDate') && <TableHead className="text-right p-4">תאריך</TableHead>}
                    <TableHead className="text-center p-4 w-[100px]">פעולות</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubs.map((sub) => (
                    <TableRow key={sub.id} className="hover:bg-primary/[0.02] transition-colors">
                      {isVisible('name') && <TableCell className="p-4 text-right font-black">{sub.name}</TableCell>}
                      {isVisible('category') && <TableCell className="p-4 text-right">{CATEGORY_METADATA[sub.category].label}</TableCell>}
                      {isVisible('amount') && <TableCell className="p-4 text-right tabular-nums font-black">{sub.amount}{sub.currency}</TableCell>}
                      {isVisible('renewalDate') && <TableCell className="p-4 text-right">{format(new Date(sub.renewalDate), 'd/MM/yy')}</TableCell>}
                      <TableCell className="p-4 flex items-center justify-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => handleEdit(sub)}><Edit2 className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteConfirmId(sub.id)}><Trash2 className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
        {viewMode === 'cards' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {filteredSubs.map(sub => (
              <Card key={sub.id} className="border-none shadow-md hover:shadow-xl rounded-[1.5rem] bg-white overflow-hidden transition-all cursor-pointer" onClick={() => handleEdit(sub)}>
                <div className="h-1.5 w-full" style={{ backgroundColor: CATEGORY_METADATA[sub.category].color }} />
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-4 flex-row-reverse">
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: `${CATEGORY_METADATA[sub.category].color}15` }}>{CATEGORY_METADATA[sub.category].icon}</div>
                    <div className="text-right">
                      <h3 className="text-base font-black truncate max-w-[150px]">{sub.name}</h3>
                      <Badge variant="outline" className="text-[9px] border-primary/20 bg-primary/5 text-primary font-bold">{sub.billingCycle === 'monthly' ? 'חודשי' : 'שנתי'}</Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-muted/30 p-2.5 rounded-xl text-right border border-muted/50">
                      <div className="text-[9px] font-bold text-muted-foreground uppercase mb-0.5">סכום</div>
                      <div className="text-lg font-black text-primary truncate tabular-nums leading-none flex items-baseline justify-end gap-1 flex-row-reverse">
                        <span className="text-xs font-bold">{sub.currency}</span>
                        {sub.amount}
                      </div>
                    </div>
                    <div className="bg-muted/30 p-2.5 rounded-xl text-right border border-muted/50">
                      <div className="text-[9px] font-bold text-muted-foreground uppercase mb-0.5">חידוש</div>
                      <div className="text-xs font-black text-foreground">{format(new Date(sub.renewalDate), 'd בMMM', { locale: he })}</div>
                    </div>
                  </div>
                  {renderCountdown(sub)}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        {viewMode === 'kanban' && (
          <div className="flex gap-6 overflow-x-auto pb-8 custom-scrollbar min-w-full flex-row-reverse">
            {['trial', 'active', 'frozen', 'cancelled'].map(status => {
              const items = filteredSubs.filter(s => s.status === status)
              return (
                <div key={status} className="flex-shrink-0 w-[280px] flex flex-col gap-4">
                  <div className="flex items-center justify-between px-5 py-3 bg-white rounded-2xl shadow-sm border-r-4" style={{ borderRightColor: STATUS_METADATA[status as any].color }}>
                    <h3 className="font-black text-sm">{STATUS_METADATA[status as any].label}</h3>
                    <Badge variant="secondary" className="rounded-full h-5 font-bold">{items.length}</Badge>
                  </div>
                  <div className="bg-muted/10 rounded-3xl p-3 space-y-4 min-h-[500px] border-2 border-dashed border-muted/30">
                    {items.map(sub => (
                      <Card key={sub.id} className="p-4 rounded-2xl bg-white shadow-sm border-none cursor-pointer" onClick={() => handleEdit(sub)}>
                        <div className="flex justify-between items-center mb-3 flex-row-reverse">
                           <span className="text-xl">{CATEGORY_METADATA[sub.category].icon}</span>
                           <span className="font-black text-xs truncate max-w-[100px] text-right">{sub.name}</span>
                        </div>
                        <div className="text-sm font-black text-primary text-right tabular-nums flex flex-row-reverse gap-1">
                          {sub.amount}
                          <span className="text-xs">{sub.currency}</span>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
      <AddSubscriptionModal open={isModalOpen} onOpenChange={(val) => { setIsModalOpen(val); if (!val) setSelectedSub(null); }} subscription={selectedSub} />
      <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent className="text-right rounded-3xl" dir="rtl">
          <AlertDialogHeader className="items-center">
            <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-4"><AlertTriangle className="h-10 w-10" /></div>
            <AlertDialogTitle className="text-2xl font-black">מחיקת מינוי?</AlertDialogTitle>
            <AlertDialogDescription className="text-center">האם אתה בטוח שברצונך למחוק את המינוי לצמיתות?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-row-reverse gap-3 mt-8 justify-center">
            <AlertDialogAction onClick={() => { if (deleteConfirmId) deleteSubscription(deleteConfirmId); setDeleteConfirmId(null); }} className="bg-destructive hover:bg-destructive/90 rounded-full px-8 h-12 font-black">כן, מחק</AlertDialogAction>
            <AlertDialogCancel className="rounded-full h-12 px-8 font-bold border-2">ביטול</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
