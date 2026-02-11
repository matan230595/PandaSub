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
  MoreVertical,
  ExternalLink,
  GripVertical,
  Settings2,
  AlertTriangle
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
      <div className="space-y-1 w-full mt-1">
        <div className="flex justify-between items-center text-[9px] font-bold">
          <span className="text-muted-foreground opacity-50">{progress}%</span>
          <span className={cn("flex items-center gap-1", textClass)}>
            <Clock className="h-2.5 w-2.5" />
            {daysLeft <= 0 ? "היום!" : `בעוד ${daysLeft} ימ'`}
          </span>
        </div>
        <Progress value={progress} indicatorClassName={color} className="h-1 rounded-full" />
      </div>
    )
  }

  const renderCards = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 animate-fade-in mb-12">
      {filteredSubs.map(sub => (
        <Card 
          key={sub.id} 
          className="group relative border-none shadow-md hover:shadow-xl rounded-[1.5rem] bg-white overflow-hidden transition-all hover:translate-y-[-4px] cursor-pointer"
          onClick={() => handleEdit(sub)}
        >
          <div className="h-1.5 w-full" style={{ backgroundColor: CATEGORY_METADATA[sub.category].color }} />
          
          <CardContent className="p-5">
            <div className="flex justify-between items-start mb-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" onClick={(e) => e.stopPropagation()}><MoreVertical className="h-4 w-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="rounded-xl p-1 text-right">
                  <DropdownMenuItem onClick={() => handleEdit(sub)} className="flex-row-reverse justify-between gap-2 rounded-lg font-bold text-xs"><Edit2 className="h-3.5 w-3.5" /> ערוך</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => duplicateSubscription(sub.id)} className="flex-row-reverse justify-between gap-2 rounded-lg text-xs"><Copy className="h-3.5 w-3.5" /> שכפל</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setDeleteConfirmId(sub.id)} className="flex-row-reverse justify-between gap-2 rounded-lg text-destructive text-xs"><Trash2 className="h-3.5 w-3.5" /> מחק</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <h3 className="text-base font-black text-foreground truncate max-w-[120px]">{sub.name}</h3>
                  <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-primary/20 bg-primary/5 text-primary font-bold uppercase tracking-tighter">
                    {sub.billingCycle === 'monthly' ? 'חודשי' : 'שנתי'}
                  </Badge>
                </div>
                <div 
                  className="h-10 w-10 rounded-xl flex items-center justify-center text-xl shadow-sm" 
                  style={{ backgroundColor: `${CATEGORY_METADATA[sub.category].color}15` }}
                >
                  {CATEGORY_METADATA[sub.category].icon}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-muted/30 p-2.5 rounded-xl text-right overflow-hidden border border-muted/50">
                <div className="text-[9px] font-bold text-muted-foreground uppercase mb-0.5">סכום</div>
                <div className="text-lg font-black text-primary truncate tabular-nums leading-none">{sub.amount}<span className="text-xs font-bold mr-0.5">{sub.currency}</span></div>
              </div>
              <div className="bg-muted/30 p-2.5 rounded-xl text-right overflow-hidden border border-muted/50">
                <div className="text-[9px] font-bold text-muted-foreground uppercase mb-0.5">חידוש</div>
                <div className="text-xs font-black text-foreground truncate leading-none">{format(new Date(sub.renewalDate), 'd בMMM', { locale: he })}</div>
              </div>
            </div>
            {renderCountdown(sub)}
          </CardContent>
          
          <CardFooter className="bg-muted/10 border-t p-2 px-4 flex justify-between items-center">
            <Button variant="ghost" size="sm" className="h-7 text-[9px] font-black gap-1.5 rounded-full text-primary hover:bg-primary/10" onClick={(e) => { e.stopPropagation(); handleCancelClick(sub); }}>
              <ExternalLink className="h-3 w-3" /> ביטול מהיר
            </Button>
            <Badge style={{ backgroundColor: STATUS_METADATA[sub.status].color, color: 'white' }} className="rounded-full px-2.5 py-0 text-[9px] font-black border-none shadow-sm">{STATUS_METADATA[sub.status].label}</Badge>
          </CardFooter>
        </Card>
      ))}
    </div>
  )

  const renderTable = () => (
    <div className="rounded-[1.5rem] border border-border/50 shadow-xl bg-white overflow-hidden animate-fade-in mb-12">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/20">
            <TableRow>
              {isVisible('name') && <TableHead className="text-right font-black text-sm p-4">מינוי</TableHead>}
              {isVisible('category') && <TableHead className="text-right font-black text-sm p-4">קטגוריה</TableHead>}
              {isVisible('amount') && <TableHead className="text-right font-black text-sm p-4">סכום</TableHead>}
              {isVisible('renewalDate') && <TableHead className="text-right font-black text-sm p-4">תאריך</TableHead>}
              {isVisible('status') && <TableHead className="text-right font-black text-sm p-4">סטטוס</TableHead>}
              <TableHead className="text-center font-black text-sm p-4 w-[100px]">פעולות</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSubs.map((sub) => (
              <TableRow key={sub.id} className="group border-b border-border/30 hover:bg-primary/[0.02] transition-colors">
                {isVisible('name') && (
                  <TableCell className="p-4">
                    <Input 
                      value={sub.name} 
                      onChange={(e) => updateSubscription(sub.id, { name: e.target.value })}
                      className="border-none bg-transparent hover:bg-muted/50 focus:bg-white focus:ring-2 focus:ring-primary/20 font-black h-9 text-sm text-right"
                    />
                  </TableCell>
                )}
                {isVisible('category') && (
                  <TableCell className="p-4">
                    <select 
                      value={sub.category} 
                      onChange={(e) => updateSubscription(sub.id, { category: e.target.value as SubscriptionCategory })}
                      className="w-full border-none bg-transparent hover:bg-muted/50 h-9 rounded-xl text-sm px-2 cursor-pointer outline-none text-right font-medium"
                    >
                      {Object.entries(CATEGORY_METADATA).map(([key, val]) => (
                        <option key={key} value={key}>{val.icon} {val.label}</option>
                      ))}
                    </select>
                  </TableCell>
                )}
                {isVisible('amount') && (
                  <TableCell className="p-4">
                    <div className="flex items-center gap-2 justify-end">
                      <Input 
                        type="number"
                        value={sub.amount} 
                        onChange={(e) => updateSubscription(sub.id, { amount: parseFloat(e.target.value) || 0 })}
                        className="border-none bg-transparent hover:bg-muted/50 focus:bg-white focus:ring-2 focus:ring-primary/20 font-black h-9 text-sm w-20 text-right tabular-nums"
                      />
                      <span className="text-xs font-bold opacity-50">{sub.currency}</span>
                    </div>
                  </TableCell>
                )}
                {isVisible('renewalDate') && (
                  <TableCell className="p-4">
                    <Input type="date" value={sub.renewalDate} onChange={(e) => updateSubscription(sub.id, { renewalDate: e.target.value })} className="border-none bg-transparent hover:bg-muted/50 h-9 text-sm text-right rounded-xl" />
                  </TableCell>
                )}
                {isVisible('status') && (
                  <TableCell className="p-4">
                    <select value={sub.status} onChange={(e) => updateSubscription(sub.id, { status: e.target.value as SubscriptionStatus })} className="w-full border-none bg-transparent hover:bg-muted/50 h-9 rounded-xl text-sm px-2 font-black cursor-pointer outline-none text-right" style={{ color: STATUS_METADATA[sub.status].color }}>
                      {Object.entries(STATUS_METADATA).map(([key, val]) => <option key={key} value={key}>{val.label}</option>)}
                    </select>
                  </TableCell>
                )}
                <TableCell className="text-center p-4">
                  <div className="flex items-center justify-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-primary/10 text-primary" onClick={() => handleEdit(sub)}><Edit2 className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-destructive/10 text-destructive" onClick={() => setDeleteConfirmId(sub.id)}><Trash2 className="h-4 w-4" /></Button>
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
      <div className="flex gap-6 overflow-x-auto pb-8 custom-scrollbar min-h-[600px] px-2" dir="rtl">
        {statuses.map(status => {
          const items = filteredSubs.filter(s => s.status === status)
          return (
            <div 
              key={status} 
              className="flex-shrink-0 w-[280px] flex flex-col gap-4" 
              onDragOver={(e) => e.preventDefault()} 
              onDrop={() => { if(draggedId) { updateSubscription(draggedId, { status }); setDraggedId(null); } }}
            >
              <div className="flex items-center justify-between px-5 py-3 bg-white rounded-2xl shadow-sm border-r-4 transition-all" style={{ borderRightColor: STATUS_METADATA[status].color }}>
                <Badge variant="secondary" className="rounded-full bg-muted/50 text-[10px] h-5 flex items-center font-bold">{items.length}</Badge>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-sm">{STATUS_METADATA[status].label}</h3>
                  <div className="h-2 w-2 rounded-full shadow-sm" style={{ backgroundColor: STATUS_METADATA[status].color }} />
                </div>
              </div>
              <div className="bg-muted/10 rounded-3xl p-3 space-y-4 min-h-[500px] border-2 border-dashed border-muted/30">
                {items.map(sub => (
                  <Card key={sub.id} draggable onDragStart={() => setDraggedId(sub.id)} className="p-4 rounded-2xl bg-white shadow-sm border-none cursor-grab active:cursor-grabbing hover:shadow-md transition-all relative overflow-hidden group" onClick={() => handleEdit(sub)}>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-20 transition-opacity"><GripVertical className="h-4 w-4" /></div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-black text-primary tabular-nums">{sub.amount}{sub.currency}</span>
                      <div className="flex items-center gap-2">
                         <span className="font-black text-xs truncate max-w-[100px] text-right">{sub.name}</span>
                         <span className="text-xl">{CATEGORY_METADATA[sub.category].icon}</span>
                      </div>
                    </div>
                    {renderCountdown(sub)}
                  </Card>
                ))}
                {items.length === 0 && (
                  <div className="h-full flex items-center justify-center opacity-20 italic text-xs py-20 text-center px-4">
                    גרור מינויים לכאן כדי לשנות סטטוס
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-3 md:p-4 rounded-[2rem] shadow-md border border-border/50 flex flex-col lg:flex-row gap-4 items-center">
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="flex p-1.5 bg-muted/40 rounded-2xl h-11 flex-row-reverse shrink-0 shadow-inner">
            <Button variant={viewMode === 'table' ? 'default' : 'ghost'} size="icon" onClick={() => setViewMode('table')} className={cn("h-8 w-9 rounded-lg transition-all", viewMode === 'table' && "shadow-md")}><ListIcon className="h-4 w-4" /></Button>
            <Button variant={viewMode === 'cards' ? 'default' : 'ghost'} size="icon" onClick={() => setViewMode('cards')} className={cn("h-8 w-9 rounded-lg transition-all", viewMode === 'cards' && "shadow-md")}><LayoutGrid className="h-4 w-4" /></Button>
            <Button variant={viewMode === 'kanban' ? 'default' : 'ghost'} size="icon" onClick={() => setViewMode('kanban')} className={cn("h-8 w-9 rounded-lg transition-all", viewMode === 'kanban' && "shadow-md")}><Columns className="h-4 w-4" /></Button>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="rounded-xl h-11 gap-2 border-primary/10 bg-primary/5 text-primary font-black px-4 text-xs shadow-sm hover:bg-primary/10 transition-all">
                <Settings2 className="h-4 w-4" /> עמודות
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="text-right rounded-2xl p-2 w-56 shadow-xl">
              <DropdownMenuLabel className="text-right text-[10px] font-black opacity-50 uppercase tracking-tighter p-2">הצג/הסתר עמודות</DropdownMenuLabel>
              {ALL_COLUMNS.map(col => (
                <DropdownMenuCheckboxItem key={col.id} checked={isVisible(col.id)} onCheckedChange={() => toggleColumn(col.id)} className="flex-row-reverse text-right text-xs font-bold rounded-xl py-2 cursor-pointer">{col.label}</DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="relative flex-1 w-full">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="חפש מינוי לפי שם או קטגוריה..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pr-11 h-11 text-sm text-right bg-muted/20 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all font-medium" />
        </div>
      </div>
      
      <div className="min-h-[400px]">
        {viewMode === 'table' && renderTable()}
        {viewMode === 'cards' && renderCards()}
        {viewMode === 'kanban' && renderKanban()}
      </div>

      <AddSubscriptionModal open={isModalOpen} onOpenChange={(val) => { setIsModalOpen(val); if (!val) setSelectedSub(null); }} subscription={selectedSub} />
      
      <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent className="text-right rounded-3xl border-none shadow-2xl p-8" dir="rtl">
          <AlertDialogHeader className="items-center">
            <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-6">
              <AlertTriangle className="h-10 w-10" />
            </div>
            <AlertDialogTitle className="text-2xl font-black text-center">מחיקת מינוי לצמיתות?</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-muted-foreground text-sm leading-relaxed">
              האם אתה בטוח שברצונך למחוק את המינוי? פעולה זו היא סופית ולא ניתן יהיה לשחזר את המידע הקשור אליו.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-row-reverse gap-3 mt-8 justify-center">
            <AlertDialogAction onClick={() => { if (deleteConfirmId) deleteSubscription(deleteConfirmId); setDeleteConfirmId(null); }} className="bg-destructive hover:bg-destructive/90 rounded-full px-8 h-12 font-black text-base shadow-xl shadow-destructive/20 transition-all active:scale-95">כן, מחק מינוי</AlertDialogAction>
            <AlertDialogCancel className="rounded-full h-12 px-8 font-bold text-base border-2">ביטול</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
