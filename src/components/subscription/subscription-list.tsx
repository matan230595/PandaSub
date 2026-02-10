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
import { 
  Edit2, 
  LayoutGrid,
  List as ListIcon,
  Columns,
  Clock,
  Settings2,
  Search,
  Plus,
  Trash2,
  Copy,
  Filter,
  Check,
  AlertTriangle
} from "lucide-react"
import { 
  DropdownMenu, 
  DropdownMenuCheckboxItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuContent,
  DropdownMenuItem
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
import { CATEGORY_METADATA, STATUS_METADATA, Subscription, SubscriptionCategory, SubscriptionStatus } from "@/app/lib/subscription-store"
import { useSubscriptions } from "@/context/subscriptions-context"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { AddSubscriptionModal } from "./add-subscription-modal"
import { cn } from "@/lib/utils"

type ColumnKey = 'name' | 'category' | 'amount' | 'renewal' | 'status' | 'actions';

export function SubscriptionList() {
  const { subscriptions, deleteSubscription, duplicateSubscription } = useSubscriptions()
  const { toast } = useToast()
  
  const [viewMode, setViewMode] = React.useState<'table' | 'cards' | 'kanban'>('table')
  const [selectedSub, setSelectedSub] = React.useState<Subscription | null>(null)
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [categoryFilter, setCategoryFilter] = React.useState<SubscriptionCategory | 'all'>('all')
  const [statusFilter, setStatusFilter] = React.useState<SubscriptionStatus | 'all'>('all')
  const [deleteConfirmId, setDeleteConfirmId] = React.useState<string | null>(null)
  
  const [visibleColumns, setVisibleColumns] = React.useState<Record<ColumnKey, boolean>>({
    name: true,
    category: true,
    amount: true,
    renewal: true,
    status: true,
    actions: true
  })

  const filteredSubs = subscriptions.filter(sub => {
    const matchesSearch = sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         CATEGORY_METADATA[sub.category].label.includes(searchTerm);
    const matchesCategory = categoryFilter === 'all' || sub.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  })

  const handleEdit = (e: React.MouseEvent, sub: Subscription) => {
    e.stopPropagation()
    setSelectedSub(sub)
    setIsModalOpen(true)
  }

  const handleDeleteTrigger = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    setDeleteConfirmId(id)
  }

  const handleConfirmDelete = () => {
    if (deleteConfirmId) {
      deleteSubscription(deleteConfirmId)
      toast({ title: "המינוי נמחק", variant: "destructive" })
      setDeleteConfirmId(null)
    }
  }

  const handleDuplicate = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    duplicateSubscription(id)
    toast({ title: "המינוי שוכפל" })
  }

  const toggleColumn = (col: ColumnKey) => {
    setVisibleColumns(prev => ({ ...prev, [col]: !prev[col] }))
  }

  const calculateDaysLeft = (date: string) => {
    const diff = new Date(date).getTime() - new Date().getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  const renderCountdown = (sub: Subscription) => {
    const targetDate = sub.status === 'trial' ? sub.trialEndsAt : sub.renewalDate
    if (!targetDate) return null
    const daysLeft = calculateDaysLeft(targetDate)
    const colorClass = daysLeft <= 3 ? "text-destructive" : daysLeft <= 7 ? "text-orange-500" : "text-primary"
    return (
      <div className={cn("flex items-center gap-1 font-bold text-[10px] justify-end", colorClass)}>
        <Clock className="h-3 w-3" />
        {daysLeft < 0 ? "פג תוקף" : `עוד ${daysLeft} ימים`}
      </div>
    )
  }

  const renderTable = () => (
    <div className="rounded-xl border bg-white shadow-sm overflow-hidden animate-fade-in mb-8">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30">
            {visibleColumns.name && <TableHead className="text-right py-3">מינוי</TableHead>}
            {visibleColumns.category && <TableHead className="text-right py-3">קטגוריה</TableHead>}
            {visibleColumns.amount && <TableHead className="text-right py-3">מחיר</TableHead>}
            {visibleColumns.renewal && <TableHead className="text-right py-3">חידוש</TableHead>}
            {visibleColumns.status && <TableHead className="text-right py-3">סטטוס</TableHead>}
            {visibleColumns.actions && <TableHead className="text-center py-3">פעולות</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredSubs.map((sub) => (
            <TableRow 
              key={sub.id} 
              className="cursor-pointer hover:bg-primary/[0.02]"
              onClick={() => { setSelectedSub(sub); setIsModalOpen(true); }}
            >
              {visibleColumns.name && (
                <TableCell className="py-2 text-right">
                  <div className="flex items-center gap-2 flex-row-reverse justify-end">
                    <span className="text-lg">{CATEGORY_METADATA[sub.category].icon}</span>
                    <span className="font-bold text-sm text-right">{sub.name}</span>
                  </div>
                </TableCell>
              )}
              {visibleColumns.category && (
                <TableCell className="text-right">
                  <Badge variant="outline" className="text-[10px] px-2 py-0" style={{ color: CATEGORY_METADATA[sub.category].color, borderColor: `${CATEGORY_METADATA[sub.category].color}30` }}>
                    {CATEGORY_METADATA[sub.category].label}
                  </Badge>
                </TableCell>
              )}
              {visibleColumns.amount && <TableCell className="text-right font-bold text-sm">{sub.amount} {sub.currency}</TableCell>}
              {visibleColumns.renewal && <TableCell className="text-right text-xs">{new Date(sub.renewalDate).toLocaleDateString('he-IL')}</TableCell>}
              {visibleColumns.status && (
                <TableCell className="text-right">
                  <Badge className="text-[10px] px-2" style={{ backgroundColor: STATUS_METADATA[sub.status].color, color: 'white' }}>
                    {STATUS_METADATA[sub.status].label}
                  </Badge>
                </TableCell>
              )}
              {visibleColumns.actions && (
                <TableCell onClick={(e) => e.stopPropagation()} className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={(e) => handleEdit(e, sub)} title="ערוך"><Edit2 className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={(e) => handleDuplicate(e, sub.id)} title="שכפל"><Copy className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-destructive" onClick={(e) => handleDeleteTrigger(e, sub.id)} title="מחק"><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )

  const renderCards = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-2 animate-fade-in mb-8">
      {filteredSubs.map(sub => (
        <Card 
          key={sub.id} 
          className="border-none shadow-md rounded-2xl overflow-hidden cursor-pointer bg-white group transition-all hover:-translate-y-1 relative"
          onClick={() => { setSelectedSub(sub); setIsModalOpen(true); }}
        >
          <div className="absolute top-2 left-2 flex gap-1 z-10">
            <Button variant="secondary" size="icon" className="h-7 w-7 rounded-full bg-white/80 shadow-sm opacity-60 group-hover:opacity-100" onClick={(e) => handleDuplicate(e, sub.id)}>
              <Copy className="h-3.5 w-3.5" />
            </Button>
            <Button variant="secondary" size="icon" className="h-7 w-7 rounded-full bg-white/80 shadow-sm opacity-60 group-hover:opacity-100" onClick={(e) => handleEdit(e, sub)}>
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
            <Button variant="secondary" size="icon" className="h-7 w-7 rounded-full bg-white/80 shadow-sm text-destructive opacity-60 group-hover:opacity-100" onClick={(e) => handleDeleteTrigger(e, sub.id)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>

          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-3 flex-row-reverse">
              <div className="flex items-center gap-2 flex-row-reverse">
                <div className="h-8 w-8 rounded-lg flex items-center justify-center text-lg" style={{ backgroundColor: `${CATEGORY_METADATA[sub.category].color}15` }}>
                  {CATEGORY_METADATA[sub.category].icon}
                </div>
                <div className="text-right">
                  <h3 className="font-bold text-sm truncate text-right">{sub.name}</h3>
                  <div className="text-[10px] font-bold text-right" style={{ color: CATEGORY_METADATA[sub.category].color }}>{CATEGORY_METADATA[sub.category].label}</div>
                </div>
              </div>
              <Badge style={{ backgroundColor: STATUS_METADATA[sub.status].color, color: 'white' }} className="text-[9px] px-1.5 h-4">
                {STATUS_METADATA[sub.status].label}
              </Badge>
            </div>
            
            <div className="flex justify-between items-end mb-3 flex-row-reverse">
              <div className="text-right">
                <span className="text-xl font-black">{sub.amount}</span>
                <span className="text-[10px] font-bold text-muted-foreground mr-0.5">{sub.currency}</span>
              </div>
              <div className="text-left">
                <p className="text-[10px] font-bold text-primary">{new Date(sub.renewalDate).toLocaleDateString('he-IL')}</p>
              </div>
            </div>

            <div className="space-y-1">
               <div className="flex justify-between items-center flex-row-reverse">
                <span className="text-[9px] font-bold text-muted-foreground">חידוש:</span>
                {renderCountdown(sub)}
              </div>
              {sub.status === 'trial' && (
                <Progress value={70} className="h-1 bg-muted/30" />
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const renderKanban = () => {
    const statuses: (keyof typeof STATUS_METADATA)[] = ['trial', 'active', 'frozen', 'cancelled']
    return (
      <div className="flex gap-4 overflow-x-auto pb-4 flex-row-reverse">
        {statuses.map(status => {
          const items = filteredSubs.filter(s => s.status === status)
          return (
            <div key={status} className="flex-shrink-0 w-56 flex flex-col gap-2">
              <div className="flex items-center justify-between px-2 flex-row-reverse">
                <h3 className="font-bold text-xs">{STATUS_METADATA[status].label} ({items.length})</h3>
              </div>
              <div className="bg-muted/10 rounded-xl p-2 space-y-2 min-h-[400px]">
                {items.map(sub => (
                  <Card key={sub.id} className="p-2.5 rounded-lg bg-white shadow-sm cursor-pointer" onClick={() => { setSelectedSub(sub); setIsModalOpen(true); }}>
                    <div className="flex justify-between items-center flex-row-reverse mb-1">
                      <span className="font-bold text-xs truncate text-right">{sub.name}</span>
                      <span className="text-[10px]">{sub.amount}₪</span>
                    </div>
                    {renderCountdown(sub)}
                  </Card>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-white p-2.5 rounded-xl shadow-sm border flex flex-col md:flex-row gap-2 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="חיפוש..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-9 h-9 text-xs text-right bg-muted/30 border-none" 
          />
        </div>
        
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1 text-[11px] font-bold">
                <Filter className="h-3 w-3" /> קטגוריה
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="text-right">
              <DropdownMenuItem onClick={() => setCategoryFilter('all')} className="text-right">הכל</DropdownMenuItem>
              {Object.entries(CATEGORY_METADATA).map(([key, val]) => (
                <DropdownMenuItem key={key} onClick={() => setCategoryFilter(key as any)} className="text-right">
                  {categoryFilter === key && <Check className="h-3 w-3 ml-1" />}
                  {val.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1 text-[11px] font-bold">
                <Filter className="h-3 w-3" /> סטטוס
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="text-right">
              <DropdownMenuItem onClick={() => setStatusFilter('all')} className="text-right">הכל</DropdownMenuItem>
              {Object.entries(STATUS_METADATA).map(([key, val]) => (
                <DropdownMenuItem key={key} onClick={() => setStatusFilter(key as any)} className="text-right">
                  {statusFilter === key && <Check className="h-3 w-3 ml-1" />}
                  {val.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex p-1 bg-muted/50 rounded-lg h-9">
            <Button variant={viewMode === 'table' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('table')} className="h-7 px-2"><ListIcon className="h-3.5 w-3.5" /></Button>
            <Button variant={viewMode === 'cards' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('cards')} className="h-7 px-2"><LayoutGrid className="h-3.5 w-3.5" /></Button>
            <Button variant={viewMode === 'kanban' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('kanban')} className="h-7 px-2"><Columns className="h-3.5 w-3.5" /></Button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9"><Settings2 className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="text-right">
              {Object.keys(visibleColumns).map(col => (
                <DropdownMenuCheckboxItem key={col} checked={visibleColumns[col as ColumnKey]} onCheckedChange={() => toggleColumn(col as ColumnKey)} className="text-right flex-row-reverse">
                  {col === 'name' ? 'שם' : col === 'category' ? 'קטגוריה' : col === 'amount' ? 'סכום' : col === 'renewal' ? 'חידוש' : col === 'status' ? 'סטטוס' : 'פעולות'}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="min-h-[300px]">
        {viewMode === 'table' && renderTable()}
        {viewMode === 'cards' && renderCards()}
        {viewMode === 'kanban' && renderKanban()}
      </div>

      <AddSubscriptionModal 
        open={isModalOpen} 
        onOpenChange={(val) => { setIsModalOpen(val); if (!val) setSelectedSub(null); }} 
        subscription={selectedSub} 
      />

      <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent className="text-right rounded-3xl border-none shadow-2xl">
          <AlertDialogHeader className="items-center">
            <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-4">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <AlertDialogTitle className="text-2xl font-bold">האם אתה בטוח?</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-muted-foreground text-base">
              פעולה זו תמחוק את המינוי לצמיתות. לא ניתן יהיה לשחזר את פרטי ההתחברות וההערות שנשמרו.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center flex-row-reverse gap-3 mt-6">
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive hover:bg-destructive/90 rounded-full px-8 h-12 font-bold shadow-lg shadow-destructive/20">
              כן, מחק מינוי
            </AlertDialogAction>
            <AlertDialogCancel className="rounded-full h-12 px-8 font-medium">ביטול</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}