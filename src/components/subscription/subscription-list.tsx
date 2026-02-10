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
  CheckCircle2, 
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
  Check
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
import { CATEGORY_METADATA, STATUS_METADATA, Subscription, SubscriptionCategory, SubscriptionStatus } from "@/app/lib/subscription-store"
import { useSubscriptions } from "@/context/subscriptions-context"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { AddSubscriptionModal } from "./add-subscription-modal"
import { cn } from "@/lib/utils"

type ColumnKey = 'name' | 'category' | 'amount' | 'renewal' | 'countdown' | 'status' | 'actions';

export function SubscriptionList() {
  const { subscriptions, markAsUsed, deleteSubscription, duplicateSubscription } = useSubscriptions()
  const { toast } = useToast()
  
  const [viewMode, setViewMode] = React.useState<'table' | 'cards' | 'kanban'>('table')
  const [selectedSub, setSelectedSub] = React.useState<Subscription | null>(null)
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [categoryFilter, setCategoryFilter] = React.useState<SubscriptionCategory | 'all'>('all')
  const [statusFilter, setStatusFilter] = React.useState<SubscriptionStatus | 'all'>('all')
  
  const [visibleColumns, setVisibleColumns] = React.useState<Record<ColumnKey, boolean>>({
    name: true,
    category: true,
    amount: true,
    renewal: true,
    countdown: true,
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

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    deleteSubscription(id)
    toast({ title: "המינוי נמחק בהצלחה", variant: "destructive" })
  }

  const handleDuplicate = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    duplicateSubscription(id)
    toast({ title: "המינוי שוכפל" })
  }

  const handleMarkUsed = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation()
    markAsUsed(id)
    toast({ title: "סימנת שנעשה שימוש היום", description: name })
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
    const isOverdue = daysLeft < 0
    const colorClass = daysLeft <= 3 ? "text-destructive" : daysLeft <= 7 ? "text-orange-500" : "text-green-500"

    return (
      <div className={cn("flex items-center gap-1.5 font-bold text-[11px] justify-end whitespace-nowrap", colorClass)}>
        <Clock className="h-3.5 w-3.5" />
        {isOverdue ? "פג תוקף" : `עוד ${daysLeft} ימים`}
      </div>
    )
  }

  const renderTable = () => (
    <div className="rounded-2xl border bg-white shadow-sm overflow-hidden animate-fade-in mb-8">
      <Table className="border-collapse">
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30 border-b">
            {visibleColumns.name && <TableHead className="py-4 text-right font-bold text-foreground">מינוי</TableHead>}
            {visibleColumns.category && <TableHead className="text-right font-bold text-foreground">קטגוריה</TableHead>}
            {visibleColumns.amount && <TableHead className="text-right font-bold text-foreground">מחיר</TableHead>}
            {visibleColumns.renewal && <TableHead className="text-right font-bold text-foreground">חידוש</TableHead>}
            {visibleColumns.countdown && <TableHead className="text-right font-bold text-foreground">יתרה</TableHead>}
            {visibleColumns.status && <TableHead className="text-right font-bold text-foreground">סטטוס</TableHead>}
            {visibleColumns.actions && <TableHead className="w-[140px] text-center font-bold text-foreground">פעולות</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredSubs.map((sub) => (
            <TableRow 
              key={sub.id} 
              className="group cursor-pointer transition-colors hover:bg-primary/[0.02] border-b last:border-0"
              onClick={() => { setSelectedSub(sub); setIsModalOpen(true); }}
            >
              {visibleColumns.name && (
                <TableCell className="py-3 text-right">
                  <div className="flex items-center gap-3 flex-row-reverse">
                    <div 
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-lg shrink-0"
                      style={{ backgroundColor: `${CATEGORY_METADATA[sub.category].color}15`, color: CATEGORY_METADATA[sub.category].color }}
                    >
                      {CATEGORY_METADATA[sub.category].icon}
                    </div>
                    <div className="overflow-hidden text-right">
                      <div className="font-bold text-sm truncate">{sub.name}</div>
                      <div className="text-[10px] text-muted-foreground truncate">{sub.credentials?.email || "ללא אימייל"}</div>
                    </div>
                  </div>
                </TableCell>
              )}
              {visibleColumns.category && (
                <TableCell className="text-right">
                  <Badge variant="outline" className="rounded-full border-none text-[10px] px-2 py-0.5" style={{ backgroundColor: `${CATEGORY_METADATA[sub.category].color}15`, color: CATEGORY_METADATA[sub.category].color }}>
                    {CATEGORY_METADATA[sub.category].label}
                  </Badge>
                </TableCell>
              )}
              {visibleColumns.amount && <TableCell className="font-bold text-sm text-right whitespace-nowrap">{sub.amount.toLocaleString()} {sub.currency}</TableCell>}
              {visibleColumns.renewal && (
                <TableCell className="text-xs text-right whitespace-nowrap">
                  {new Date(sub.status === 'trial' ? sub.trialEndsAt! : sub.renewalDate).toLocaleDateString('he-IL')}
                </TableCell>
              )}
              {visibleColumns.countdown && <TableCell className="text-right">{renderCountdown(sub)}</TableCell>}
              {visibleColumns.status && (
                <TableCell className="text-right">
                  <Badge className="rounded-full text-[10px] border-none px-2 py-0.5" style={{ backgroundColor: STATUS_METADATA[sub.status].color, color: 'white' }}>
                    {STATUS_METADATA[sub.status].label}
                  </Badge>
                </TableCell>
              )}
              {visibleColumns.actions && (
                <TableCell onClick={(e) => e.stopPropagation()} className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/10" onClick={(e) => handleEdit(e, sub)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/10" onClick={(e) => handleDuplicate(e, sub.id)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-destructive/10 text-destructive" onClick={(e) => handleDelete(e, sub.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in p-1 mb-8">
      {filteredSubs.map(sub => (
        <Card 
          key={sub.id} 
          className="card-shadow border-none rounded-2xl overflow-hidden cursor-pointer bg-white group relative transition-all duration-300 hover:-translate-y-1"
          onClick={() => { setSelectedSub(sub); setIsModalOpen(true); }}
        >
          <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <Button variant="secondary" size="icon" className="h-7 w-7 rounded-full shadow-sm" onClick={(e) => handleDuplicate(e, sub.id)}>
              <Copy className="h-3.5 w-3.5" />
            </Button>
            <Button variant="secondary" size="icon" className="h-7 w-7 rounded-full shadow-sm" onClick={(e) => handleEdit(e, sub)}>
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
            <Button variant="secondary" size="icon" className="h-7 w-7 rounded-full shadow-sm text-destructive" onClick={(e) => handleDelete(e, sub.id)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>

          <CardContent className="p-5">
            <div className="flex justify-between items-start mb-4 flex-row-reverse">
              <div className="flex items-center gap-2.5 flex-row-reverse">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center text-xl shadow-sm" style={{ backgroundColor: `${CATEGORY_METADATA[sub.category].color}15` }}>
                  {CATEGORY_METADATA[sub.category].icon}
                </div>
                <div className="text-right">
                  <h3 className="font-bold text-base text-foreground truncate max-w-[100px]">{sub.name}</h3>
                  <div className="text-[10px] font-bold" style={{ color: CATEGORY_METADATA[sub.category].color }}>
                    {CATEGORY_METADATA[sub.category].label}
                  </div>
                </div>
              </div>
              <Badge style={{ backgroundColor: STATUS_METADATA[sub.status].color, color: 'white' }} className="border-none rounded-full text-[9px] px-2 py-0.5">
                {STATUS_METADATA[sub.status].label}
              </Badge>
            </div>
            
            <div className="flex justify-between items-end mb-4 flex-row-reverse">
              <div className="text-right">
                <span className="text-2xl font-black text-foreground">{sub.amount}</span>
                <span className="text-xs font-bold text-muted-foreground mr-1">{sub.currency}</span>
              </div>
              <div className="text-left">
                <p className="text-[9px] text-muted-foreground font-black mb-0.5">חיוב הבא</p>
                <p className="text-xs font-bold text-primary">{new Date(sub.renewalDate).toLocaleDateString('he-IL')}</p>
              </div>
            </div>

            <div className="space-y-2">
               <div className="flex justify-between items-center flex-row-reverse">
                <span className="text-[10px] font-bold text-muted-foreground">סטטוס:</span>
                {renderCountdown(sub)}
              </div>
              {sub.status === 'trial' && (
                <Progress value={Math.max(15, 100 - (calculateDaysLeft(sub.trialEndsAt!) * 4))} className="h-1 rounded-full bg-muted/50" />
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const renderKanban = () => {
    const statuses: (keyof typeof STATUS_METADATA)[] = ['trial', 'active', 'frozen', 'cancelled', 'not_in_use']
    return (
      <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide flex-row-reverse">
        {statuses.map(status => {
          const items = filteredSubs.filter(s => s.status === status)
          return (
            <div key={status} className="flex-shrink-0 w-64 flex flex-col gap-3">
              <div className="flex items-center justify-between px-2 flex-row-reverse">
                <div className="flex items-center gap-2 flex-row-reverse">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: STATUS_METADATA[status].color }} />
                  <h3 className="font-bold text-xs">{STATUS_METADATA[status].label}</h3>
                </div>
                <Badge variant="secondary" className="rounded-full text-[9px] h-4 px-1.5 font-bold bg-muted/50">{items.length}</Badge>
              </div>
              <div className="flex-1 bg-muted/10 rounded-2xl p-2 space-y-2 min-h-[400px] border-2 border-dashed border-muted/20">
                {items.map(sub => (
                  <Card 
                    key={sub.id} 
                    className="border-none shadow-sm hover:shadow-md transition-all cursor-pointer rounded-xl bg-white active:scale-95"
                    onClick={() => { setSelectedSub(sub); setIsModalOpen(true); }}
                  >
                    <CardContent className="p-3 space-y-2 text-right">
                      <div className="flex items-center justify-between flex-row-reverse">
                        <div className="flex items-center gap-2 flex-row-reverse">
                          <span className="text-lg">{CATEGORY_METADATA[sub.category].icon}</span>
                          <div className="font-bold text-[11px] truncate">{sub.name}</div>
                        </div>
                        <div className="text-[10px] font-black text-primary">{sub.amount} ₪</div>
                      </div>
                      {renderCountdown(sub)}
                    </CardContent>
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
    <div className="space-y-6">
      <div className="bg-white p-3 rounded-2xl shadow-sm border flex flex-col md:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="חיפוש חופשי..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10 rounded-xl border-none bg-muted/40 focus:bg-white h-10 text-sm text-right" 
          />
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* פילטר קטגוריה */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="rounded-xl gap-2 h-10 bg-muted/20 border-none text-xs font-bold">
                <Filter className="h-3.5 w-3.5" />
                {categoryFilter === 'all' ? 'כל הקטגוריות' : CATEGORY_METADATA[categoryFilter].label}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl p-1 text-right">
              <DropdownMenuItem onClick={() => setCategoryFilter('all')} className="flex-row-reverse gap-2">
                <span>כל הקטגוריות</span>
                {categoryFilter === 'all' && <Check className="h-3 w-3" />}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {Object.entries(CATEGORY_METADATA).map(([key, value]) => (
                <DropdownMenuItem 
                  key={key} 
                  onClick={() => setCategoryFilter(key as SubscriptionCategory)}
                  className="flex-row-reverse gap-2"
                >
                  <span className="flex-1 text-right">{value.label}</span>
                  <span className="text-xs">{value.icon}</span>
                  {categoryFilter === key && <Check className="h-3 w-3" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* פילטר סטטוס */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="rounded-xl gap-2 h-10 bg-muted/20 border-none text-xs font-bold">
                {statusFilter === 'all' ? 'כל הסטטוסים' : STATUS_METADATA[statusFilter].label}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 rounded-xl p-1 text-right">
              <DropdownMenuItem onClick={() => setStatusFilter('all')} className="flex-row-reverse gap-2">
                <span>כל הסטטוסים</span>
                {statusFilter === 'all' && <Check className="h-3 w-3" />}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {Object.entries(STATUS_METADATA).map(([key, value]) => (
                <DropdownMenuItem 
                  key={key} 
                  onClick={() => setStatusFilter(key as SubscriptionStatus)}
                  className="flex-row-reverse gap-2"
                >
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: value.color }} />
                  <span className="flex-1 text-right">{value.label}</span>
                  {statusFilter === key && <Check className="h-3 w-3" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="h-6 w-px bg-border mx-1 hidden md:block" />

          <div className="flex items-center p-1 bg-muted/30 rounded-xl h-10 shadow-inner shrink-0">
            <Button 
              variant={viewMode === 'table' ? 'default' : 'ghost'} 
              size="sm" 
              onClick={() => setViewMode('table')}
              className={cn("rounded-lg px-3 h-8 text-[10px] font-bold", viewMode === 'table' ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground')}
            >
              <ListIcon className="h-3.5 w-3.5 mr-1" /> טבלה
            </Button>
            <Button 
              variant={viewMode === 'cards' ? 'default' : 'ghost'} 
              size="sm" 
              onClick={() => setViewMode('cards')}
              className={cn("rounded-lg px-3 h-8 text-[10px] font-bold", viewMode === 'cards' ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground')}
            >
              <LayoutGrid className="h-3.5 w-3.5 mr-1" /> כרטיסים
            </Button>
            <Button 
              variant={viewMode === 'kanban' ? 'default' : 'ghost'} 
              size="sm" 
              onClick={() => setViewMode('kanban')}
              className={cn("rounded-lg px-3 h-8 text-[10px] font-bold", viewMode === 'kanban' ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground')}
            >
              <Columns className="h-3.5 w-3.5 mr-1" /> קאנבן
            </Button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-xl h-10 w-10 border-none bg-muted/30 hover:bg-muted shrink-0">
                <Settings2 className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl p-2 shadow-xl border-none mt-2">
              <DropdownMenuLabel className="text-right font-bold text-sm mb-1">הגדרות תצוגה</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="space-y-0.5 mt-1">
                {Object.keys(visibleColumns).map((col) => (
                  col !== 'actions' && (
                    <DropdownMenuCheckboxItem 
                      key={col}
                      checked={visibleColumns[col as ColumnKey]} 
                      onCheckedChange={() => toggleColumn(col as ColumnKey)} 
                      className="flex-row-reverse text-right rounded-lg h-8 cursor-pointer text-xs"
                    >
                      {col === 'name' ? 'שם המינוי' : col === 'category' ? 'קטגוריה' : col === 'amount' ? 'מחיר' : col === 'renewal' ? 'חידוש' : col === 'countdown' ? 'יתרה' : 'סטטוס'}
                    </DropdownMenuCheckboxItem>
                  )
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="min-h-[300px] pb-10">
        {viewMode === 'table' && renderTable()}
        {viewMode === 'cards' && renderCards()}
        {viewMode === 'kanban' && renderKanban()}
        
        {filteredSubs.length === 0 && (
          <div className="text-center py-20 bg-white/50 rounded-3xl border-2 border-dashed border-muted/30">
            <div className="text-5xl mb-4 text-muted-foreground opacity-20">🔍</div>
            <h2 className="text-lg font-bold mb-1">לא נמצאו תוצאות</h2>
            <p className="text-muted-foreground text-xs">נסה לשנות את מונחי החיפוש או הסינון</p>
          </div>
        )}
      </div>

      <AddSubscriptionModal 
        open={isModalOpen} 
        onOpenChange={(val) => {
          setIsModalOpen(val);
          if (!val) setSelectedSub(null);
        }} 
        subscription={selectedSub} 
      />
    </div>
  )
}
