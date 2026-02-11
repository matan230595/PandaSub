
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
  Copy,
  Filter,
  Check,
  AlertTriangle,
  CreditCard,
  RefreshCw,
  MoreVertical,
  ExternalLink,
  GripVertical,
  Settings2
} from "lucide-react"
import { 
  DropdownMenu, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu"
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
import { CATEGORY_METADATA, STATUS_METADATA, Subscription, SubscriptionCategory, SubscriptionStatus, CANCELLATION_LINKS } from "@/app/lib/subscription-store"
import { useSubscriptions } from "@/context/subscriptions-context"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { AddSubscriptionModal } from "./add-subscription-modal"
import { cn } from "@/lib/utils"
import { format, differenceInDays } from "date-fns"
import { he } from "date-fns/locale"

const ALL_COLUMNS = [
  { id: 'name', label: 'שם המינוי' },
  { id: 'category', label: 'קטגוריה' },
  { id: 'amount', label: 'סכום' },
  { id: 'renewalDate', label: 'תאריך חידוש' },
  { id: 'status', label: 'סטטוס' },
  { id: 'paymentMethod', label: 'אמצעי תשלום' },
]

export function SubscriptionList() {
  const { subscriptions, deleteSubscription, duplicateSubscription, updateSubscription, settings, updateSettings, convertAmount } = useSubscriptions()
  const { toast } = useToast()
  
  const [viewMode, setViewMode] = React.useState<'table' | 'cards' | 'kanban'>('cards')
  const [selectedSub, setSelectedSub] = React.useState<Subscription | null>(null)
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [categoryFilter, setCategoryFilter] = React.useState<SubscriptionCategory | 'all'>('all')
  const [statusFilter, setStatusFilter] = React.useState<SubscriptionStatus | 'all'>('all')
  const [deleteConfirmId, setDeleteConfirmId] = React.useState<string | null>(null)
  const [draggedId, setDraggedId] = React.useState<string | null>(null)

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

  const toggleColumn = (columnId: string) => {
    const current = settings.visibleColumns || []
    const next = current.includes(columnId)
      ? current.filter(id => id !== columnId)
      : [...current, columnId]
    updateSettings({ visibleColumns: next })
  }

  const isVisible = (columnId: string) => (settings.visibleColumns || []).includes(columnId)

  const handleCancelClick = (sub: Subscription) => {
    const nameKey = Object.keys(CANCELLATION_LINKS).find(k => sub.name.toLowerCase().includes(k));
    const cancelUrl = CANCELLATION_LINKS[nameKey || ""];
    if (cancelUrl) {
      window.open(cancelUrl, '_blank');
      toast({ title: "פותח דף ביטול", description: `מעביר אותך לדף הביטול הרשמי של ${sub.name}` });
    } else {
      toast({ title: "לא נמצא לינק", description: "לא הצלחנו למצוא דף ביטול אוטומטי למינוי זה.", variant: "destructive" });
    }
  }

  const renderCountdown = (sub: Subscription) => {
    const today = new Date()
    today.setHours(0,0,0,0)
    const renewal = new Date(sub.renewalDate)
    renewal.setHours(0,0,0,0)
    const daysLeft = differenceInDays(renewal, today)
    
    let progress = 100
    let color = "bg-green-500"
    let textClass = "text-green-600"

    if (daysLeft <= 0) {
      progress = 100; color = "bg-destructive animate-pulse"; textClass = "text-destructive font-black";
    } else if (daysLeft <= 3) {
      progress = 90; color = "bg-destructive"; textClass = "text-destructive font-bold";
    } else if (daysLeft <= 7) {
      progress = 70; color = "bg-orange-500"; textClass = "text-orange-600 font-bold";
    } else if (daysLeft <= 14) {
      progress = 40; color = "bg-blue-500"; textClass = "text-blue-600 font-bold";
    } else {
      progress = 20; color = "bg-green-500"; textClass = "text-green-600";
    }

    return (
      <div className="space-y-1.5 w-full mt-1">
        <div className="flex justify-between items-center text-[10px] font-bold flex-row-reverse">
          <span className={cn("flex items-center gap-1", textClass)}>
            <Clock className="h-3 w-3" />
            {daysLeft <= 0 ? "היום!" : `בעוד ${daysLeft} ימ'`}
          </span>
          <span className="text-muted-foreground opacity-50">{progress}%</span>
        </div>
        <Progress value={progress} className="h-1 rounded-full" indicatorClassName={color} />
      </div>
    )
  }

  const renderCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-fade-in mb-12">
      {filteredSubs.map(sub => (
        <Card 
          key={sub.id} 
          className="group relative border-none card-shadow rounded-[2rem] bg-white overflow-hidden transition-all hover:scale-[1.02] cursor-pointer"
          onClick={() => handleEdit(sub)}
        >
          <div className="h-2 w-full" style={{ backgroundColor: CATEGORY_METADATA[sub.category].color }} />
          
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-6 flex-row-reverse">
              <div className="flex items-center gap-4 flex-row-reverse max-w-[70%]">
                <div 
                  className="h-12 w-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm shrink-0" 
                  style={{ backgroundColor: `${CATEGORY_METADATA[sub.category].color}15` }}
                >
                  {CATEGORY_METADATA[sub.category].icon}
                </div>
                <div className="text-right overflow-hidden">
                  <h3 className="text-lg font-black text-foreground truncate">{sub.name}</h3>
                  <div className="flex items-center gap-2 flex-row-reverse justify-start">
                    <Badge variant="outline" className="text-[9px] px-2 border-primary/20 bg-primary/5 text-primary">
                      {sub.billingCycle === 'monthly' ? 'חודשי' : 'שנתי'}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="rounded-full h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-2xl p-2 text-right">
                    <DropdownMenuItem onClick={() => handleEdit(sub)} className="flex-row-reverse gap-2 rounded-xl font-bold"><Edit2 className="h-4 w-4" /> ערוך</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleCancelClick(sub)} className="flex-row-reverse gap-2 rounded-xl text-primary font-bold"><ExternalLink className="h-4 w-4" /> בטל מינוי</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => duplicateSubscription(sub.id)} className="flex-row-reverse gap-2 rounded-xl"><Copy className="h-4 w-4" /> שכפל</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setDeleteConfirmId(sub.id)} className="flex-row-reverse gap-2 rounded-xl text-destructive"><Trash2 className="h-4 w-4" /> מחק</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-muted/30 p-3 rounded-2xl text-right overflow-hidden">
                <div className="text-[9px] font-bold text-muted-foreground uppercase mb-1 flex items-center gap-1 flex-row-reverse">סכום חיוב</div>
                <div className="text-xl font-black text-primary truncate">{sub.amount} <span className="text-xs font-bold">{sub.currency}</span></div>
              </div>
              <div className="bg-muted/30 p-3 rounded-2xl text-right overflow-hidden">
                <div className="text-[9px] font-bold text-muted-foreground uppercase mb-1 flex items-center gap-1 flex-row-reverse">חידוש</div>
                <div className="text-sm font-bold text-foreground truncate">{format(new Date(sub.renewalDate), 'd בMMM', { locale: he })}</div>
              </div>
            </div>
            {renderCountdown(sub)}
          </CardContent>
          
          <CardFooter className="bg-muted/10 border-t p-3 flex justify-between items-center flex-row-reverse">
            <Badge style={{ backgroundColor: STATUS_METADATA[sub.status].color, color: 'white' }} className="rounded-full px-3 py-0.5 text-[9px] font-black border-none">{STATUS_METADATA[sub.status].label}</Badge>
          </CardFooter>
        </Card>
      ))}
    </div>
  )

  const renderTable = () => (
    <div className="rounded-[2rem] border-none card-shadow bg-white overflow-hidden animate-fade-in mb-12">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/10 h-12">
            <TableRow>
              {isVisible('name') && <TableHead className="text-right font-black w-[200px]">מינוי</TableHead>}
              {isVisible('category') && <TableHead className="text-right font-black w-[150px]">קטגוריה</TableHead>}
              {isVisible('amount') && <TableHead className="text-right font-black w-[120px]">סכום</TableHead>}
              {isVisible('renewalDate') && <TableHead className="text-right font-black w-[150px]">תאריך</TableHead>}
              {isVisible('status') && <TableHead className="text-right font-black w-[120px]">סטטוס</TableHead>}
              <TableHead className="text-center font-black w-[100px]">פעולות</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSubs.map((sub) => (
              <TableRow key={sub.id} className="group h-14 border-b border-border/50 hover:bg-primary/[0.01]">
                {isVisible('name') && (
                  <TableCell className="p-2">
                    <Input 
                      value={sub.name} 
                      onChange={(e) => updateSubscription(sub.id, { name: e.target.value })}
                      className="border-none bg-transparent hover:bg-muted/50 focus:bg-white focus:ring-1 focus:ring-primary/20 font-black h-8 text-xs text-right"
                    />
                  </TableCell>
                )}
                {isVisible('category') && (
                  <TableCell className="p-2">
                    <select 
                      value={sub.category} 
                      onChange={(e) => updateSubscription(sub.id, { category: e.target.value as SubscriptionCategory })}
                      className="w-full border-none bg-transparent hover:bg-muted/50 h-8 rounded-md text-xs px-2 cursor-pointer outline-none text-right"
                    >
                      {Object.entries(CATEGORY_METADATA).map(([key, val]) => (
                        <option key={key} value={key}>{val.icon} {val.label}</option>
                      ))}
                    </select>
                  </TableCell>
                )}
                {isVisible('amount') && (
                  <TableCell className="p-2">
                    <div className="flex items-center gap-1 justify-end">
                      <Input 
                        type="number"
                        value={sub.amount} 
                        onChange={(e) => updateSubscription(sub.id, { amount: parseFloat(e.target.value) || 0 })}
                        className="border-none bg-transparent hover:bg-muted/50 focus:bg-white focus:ring-1 focus:ring-primary/20 font-bold h-8 text-xs w-16 text-right"
                      />
                      <span className="text-[10px] opacity-40 shrink-0">{sub.currency}</span>
                    </div>
                  </TableCell>
                )}
                {isVisible('renewalDate') && (
                  <TableCell className="p-2">
                    <Input type="date" value={sub.renewalDate} onChange={(e) => updateSubscription(sub.id, { renewalDate: e.target.value })} className="border-none bg-transparent hover:bg-muted/50 h-8 text-xs text-right" />
                  </TableCell>
                )}
                {isVisible('status') && (
                  <TableCell className="p-2">
                    <select value={sub.status} onChange={(e) => updateSubscription(sub.id, { status: e.target.value as SubscriptionStatus })} className="w-full border-none bg-transparent hover:bg-muted/50 h-8 rounded-md text-xs px-2 font-bold cursor-pointer outline-none text-right" style={{ color: STATUS_METADATA[sub.status].color }}>
                      {Object.entries(STATUS_METADATA).map(([key, val]) => <option key={key} value={key}>{val.label}</option>)}
                    </select>
                  </TableCell>
                )}
                <TableCell className="text-center p-2">
                  <div className="flex items-center justify-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(sub)}><Edit2 className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteConfirmId(sub.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )

  const renderKanban = () => {
    const statuses: SubscriptionStatus[] = ['trial', 'active', 'frozen', 'cancelled']
    return (
      <div className="w-full overflow-x-auto pb-6 scrollbar-hide">
        <div className="flex gap-6 min-w-[1200px] flex-row-reverse px-2">
          {statuses.map(status => {
            const items = filteredSubs.filter(s => s.status === status)
            return (
              <div 
                key={status} 
                className="flex-shrink-0 w-[280px] flex flex-col gap-4" 
                onDragOver={(e) => e.preventDefault()} 
                onDrop={() => { if(draggedId) { updateSubscription(draggedId, { status }); setDraggedId(null); } }}
              >
                <div className="flex items-center justify-between px-5 py-3 bg-white rounded-3xl shadow-sm border-r-4" style={{ borderRightColor: STATUS_METADATA[status].color }}>
                  <div className="flex items-center gap-2 flex-row-reverse">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: STATUS_METADATA[status].color }} />
                    <h3 className="font-black text-xs">{STATUS_METADATA[status].label}</h3>
                  </div>
                  <Badge variant="secondary" className="rounded-full bg-muted/50 text-[9px]">{items.length}</Badge>
                </div>
                <div className="bg-muted/20 rounded-[2.5rem] p-3 space-y-4 min-h-[500px] border-2 border-dashed border-muted/50">
                  {items.map(sub => (
                    <Card key={sub.id} draggable onDragStart={() => setDraggedId(sub.id)} className="p-4 rounded-[1.8rem] bg-white shadow-md border-none cursor-grab active:cursor-grabbing group/item relative overflow-hidden" onClick={() => handleEdit(sub)}>
                      <div className="absolute top-2 left-2 opacity-30"><GripVertical className="h-4 w-4" /></div>
                      <div className="flex justify-between items-center flex-row-reverse mb-3">
                        <div className="flex items-center gap-2 flex-row-reverse overflow-hidden">
                           <span className="text-base shrink-0">{CATEGORY_METADATA[sub.category].icon}</span>
                           <span className="font-black text-[11px] truncate text-right">{sub.name}</span>
                        </div>
                        <span className="text-[11px] font-black text-primary shrink-0">{sub.amount}{sub.currency}</span>
                      </div>
                      {renderCountdown(sub)}
                    </Card>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-3 md:p-4 rounded-[2.5rem] shadow-lg border border-border/50 flex flex-col lg:flex-row gap-4 items-center flex-row-reverse">
        <div className="relative flex-1 w-full text-right">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input placeholder="חיפוש מהיר..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pr-12 h-11 text-base text-right bg-muted/20 border-none rounded-2xl" />
        </div>
        <div className="flex items-center gap-2 w-full lg:w-auto flex-row-reverse">
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="outline" className="rounded-2xl h-11 gap-2 border-primary/10 bg-primary/5 text-primary font-bold px-4"><Settings2 className="h-4 w-4" /> עמודות</Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="text-right rounded-2xl p-2 w-56">
              {ALL_COLUMNS.map(col => (
                <DropdownMenuCheckboxItem key={col.id} checked={isVisible(col.id)} onCheckedChange={() => toggleColumn(col.id)} className="flex-row-reverse text-right">{col.label}</DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex p-1 bg-muted/30 rounded-2xl h-11 flex-row-reverse shrink-0">
            <Button variant={viewMode === 'table' ? 'default' : 'ghost'} size="icon" onClick={() => setViewMode('table')} className="h-9 w-9 rounded-xl"><ListIcon className="h-4 w-4" /></Button>
            <Button variant={viewMode === 'cards' ? 'default' : 'ghost'} size="icon" onClick={() => setViewMode('cards')} className="h-9 w-9 rounded-xl"><LayoutGrid className="h-4 w-4" /></Button>
            <Button variant={viewMode === 'kanban' ? 'default' : 'ghost'} size="icon" onClick={() => setViewMode('kanban')} className="h-9 w-9 rounded-xl"><Columns className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>
      <div className="min-h-[400px]">
        {viewMode === 'table' && renderTable()}
        {viewMode === 'cards' && renderCards()}
        {viewMode === 'kanban' && renderKanban()}
      </div>
      <AddSubscriptionModal open={isModalOpen} onOpenChange={(val) => { setIsModalOpen(val); if (!val) setSelectedSub(null); }} subscription={selectedSub} />
      <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent className="text-right rounded-[2.5rem] border-none shadow-2xl p-10" dir="rtl">
          <AlertDialogHeader className="items-center">
            <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-6"><AlertTriangle className="h-10 w-10" /></div>
            <AlertDialogTitle className="text-2xl font-black">מחיקה סופית?</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-muted-foreground text-base">האם אתה בטוח שברצונך למחוק את המינוי? לא ניתן לשחזר את המידע.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center flex flex-row-reverse gap-4 mt-8">
            <AlertDialogAction onClick={() => { if (deleteConfirmId) deleteSubscription(deleteConfirmId); setDeleteConfirmId(null); }} className="bg-destructive hover:bg-destructive/90 rounded-full px-10 h-12 font-black">כן, מחק</AlertDialogAction>
            <AlertDialogCancel className="rounded-full h-12 px-10 font-bold">ביטול</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
