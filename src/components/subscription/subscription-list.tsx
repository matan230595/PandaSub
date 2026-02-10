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
  Copy
} from "lucide-react"
import { 
  DropdownMenu, 
  DropdownMenuCheckboxItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuContent
} from "@/components/ui/dropdown-menu"
import { CATEGORY_METADATA, STATUS_METADATA, Subscription } from "@/app/lib/subscription-store"
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
  
  const [visibleColumns, setVisibleColumns] = React.useState<Record<ColumnKey, boolean>>({
    name: true,
    category: true,
    amount: true,
    renewal: true,
    countdown: true,
    status: true,
    actions: true
  })

  const filteredSubs = subscriptions.filter(sub => 
    sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    CATEGORY_METADATA[sub.category].label.includes(searchTerm)
  )

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
      <div className={cn("flex items-center gap-1.5 font-bold text-[11px] justify-end", colorClass)}>
        <Clock className="h-3.5 w-3.5" />
        {isOverdue ? "פג תוקף" : `עוד ${daysLeft} ימים`}
      </div>
    )
  }

  const renderTable = () => (
    <div className="rounded-2xl border bg-white shadow-sm overflow-hidden animate-fade-in mb-8">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30 border-none">
            {visibleColumns.name && <TableHead className="py-4 text-right">מינוי</TableHead>}
            {visibleColumns.category && <TableHead className="text-right">קטגוריה</TableHead>}
            {visibleColumns.amount && <TableHead className="text-right">מחיר</TableHead>}
            {visibleColumns.renewal && <TableHead className="text-right">חידוש</TableHead>}
            {visibleColumns.countdown && <TableHead className="text-right">ימים שנותרו</TableHead>}
            {visibleColumns.status && <TableHead className="text-right">סטטוס</TableHead>}
            {visibleColumns.actions && <TableHead className="w-[180px] text-left">פעולות מהירות</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredSubs.map((sub) => (
            <TableRow 
              key={sub.id} 
              className="group cursor-pointer transition-colors hover:bg-primary/[0.02]"
              onClick={() => { setSelectedSub(sub); setIsModalOpen(true); }}
            >
              {visibleColumns.name && (
                <TableCell className="py-4 text-right">
                  <div className="flex items-center gap-3 flex-row-reverse">
                    <div 
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-xl shrink-0 shadow-sm"
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
              {visibleColumns.amount && <TableCell className="font-bold text-base text-right">{sub.amount.toLocaleString()} {sub.currency}</TableCell>}
              {visibleColumns.renewal && (
                <TableCell className="text-xs text-right">
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
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-start gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary" onClick={(e) => handleEdit(e, sub)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary" onClick={(e) => handleDuplicate(e, sub.id)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive" onClick={(e) => handleDelete(e, sub.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-green-50 hover:text-green-600" onClick={(e) => handleMarkUsed(e, sub.id, sub.name)}>
                      <CheckCircle2 className="h-4 w-4" />
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in p-4 mb-8 overflow-visible">
      {filteredSubs.map(sub => (
        <Card 
          key={sub.id} 
          className="card-shadow border-none rounded-[1.5rem] overflow-visible cursor-pointer bg-white group relative transition-all duration-300 hover:scale-[1.02]"
          onClick={() => { setSelectedSub(sub); setIsModalOpen(true); }}
        >
          {/* Quick Actions Header - Now always visible slightly and fully on hover */}
          <div className="absolute top-3 left-3 flex gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity z-20">
            <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full shadow-md bg-white/95 backdrop-blur-sm" onClick={(e) => handleDuplicate(e, sub.id)}>
              <Copy className="h-3.5 w-3.5 text-primary" />
            </Button>
            <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full shadow-md bg-white/95 backdrop-blur-sm" onClick={(e) => handleEdit(e, sub)}>
              <Edit2 className="h-3.5 w-3.5 text-primary" />
            </Button>
            <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full shadow-md bg-white/95 backdrop-blur-sm" onClick={(e) => handleDelete(e, sub.id)}>
              <Trash2 className="h-3.5 w-3.5 text-destructive" />
            </Button>
          </div>

          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4 flex-row-reverse">
              <div className="flex items-center gap-3 flex-row-reverse">
                <div className="h-12 w-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm" style={{ backgroundColor: `${CATEGORY_METADATA[sub.category].color}15` }}>
                  {CATEGORY_METADATA[sub.category].icon}
                </div>
                <div className="text-right">
                  <h3 className="font-bold text-lg tracking-tight text-foreground truncate max-w-[120px]">{sub.name}</h3>
                  <Badge variant="ghost" className="p-0 text-[10px] font-bold" style={{ color: CATEGORY_METADATA[sub.category].color }}>
                    {CATEGORY_METADATA[sub.category].label}
                  </Badge>
                </div>
              </div>
              <Badge style={{ backgroundColor: STATUS_METADATA[sub.status].color, color: 'white' }} className="border-none rounded-full text-[9px] px-2 py-0.5 shadow-sm font-black">
                {STATUS_METADATA[sub.status].label}
              </Badge>
            </div>
            
            <div className="flex justify-between items-end mb-6 flex-row-reverse">
              <div className="text-right">
                <span className="text-3xl font-black text-foreground">{sub.amount}</span>
                <span className="text-lg font-bold text-muted-foreground mr-1">{sub.currency}</span>
              </div>
              <div className="text-left">
                <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-black mb-0.5">חיוב הבא</p>
                <p className="text-sm font-bold text-primary">{new Date(sub.renewalDate).toLocaleDateString('he-IL')}</p>
              </div>
            </div>

            <div className="space-y-3">
               <div className="flex justify-between items-center flex-row-reverse">
                <span className="text-[10px] font-bold text-muted-foreground">סטטוס:</span>
                {renderCountdown(sub)}
              </div>
              
              {sub.status === 'trial' && (
                <div className="space-y-1">
                  <Progress value={Math.max(15, 100 - (calculateDaysLeft(sub.trialEndsAt!) * 4))} className="h-1.5 rounded-full bg-muted/50" />
                  <p className="text-[9px] text-muted-foreground text-center font-bold">תקופת ניסיון</p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="bg-muted/5 px-6 py-3 flex justify-between border-t rounded-b-[1.5rem] flex-row-reverse">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-[11px] gap-1.5 font-black hover:text-green-600 rounded-full h-8 px-3 transition-colors"
              onClick={(e) => handleMarkUsed(e, sub.id, sub.name)}
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> השתמשתי
            </Button>
            <div className="text-[9px] font-bold text-muted-foreground italic">
              {sub.lastUsed ? `עודכן: ${new Date(sub.lastUsed).toLocaleDateString('he-IL')}` : 'מעולם'}
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )

  const renderKanban = () => {
    const statuses: (keyof typeof STATUS_METADATA)[] = ['trial', 'active', 'frozen', 'cancelled', 'not_in_use']
    return (
      <div className="flex gap-6 overflow-x-auto pb-10 -mx-4 px-4 h-[700px] animate-fade-in scrollbar-hide flex-row-reverse">
        {statuses.map(status => {
          const items = filteredSubs.filter(s => s.status === status)
          return (
            <div key={status} className="flex-shrink-0 w-72 flex flex-col gap-3">
              <div className="flex items-center justify-between px-2 flex-row-reverse">
                <div className="flex items-center gap-2 flex-row-reverse">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: STATUS_METADATA[status].color }} />
                  <h3 className="font-bold text-sm">{STATUS_METADATA[status].label}</h3>
                </div>
                <Badge variant="secondary" className="rounded-full text-[10px] h-5 px-2 font-bold bg-muted/50 border-none">{items.length}</Badge>
              </div>
              <div className="flex-1 bg-muted/10 rounded-[1.5rem] p-3 space-y-3 overflow-y-auto border border-dashed border-muted/50">
                {items.map(sub => (
                  <Card 
                    key={sub.id} 
                    className="border-none shadow-sm hover:shadow-md transition-all cursor-pointer rounded-xl bg-white group active:scale-95"
                    onClick={() => { setSelectedSub(sub); setIsModalOpen(true); }}
                  >
                    <CardContent className="p-4 space-y-3 text-right relative">
                      <div className="absolute left-1.5 top-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                         <Button variant="secondary" size="icon" className="h-6 w-6 rounded-full shadow-sm" onClick={(e) => handleEdit(e, sub)}>
                          <Edit2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between flex-row-reverse">
                        <div className="flex items-center gap-2 overflow-hidden flex-row-reverse">
                          <span className="text-xl h-8 w-8 flex items-center justify-center rounded-lg bg-muted/30">{CATEGORY_METADATA[sub.category].icon}</span>
                          <div className="font-bold text-xs truncate text-right">{sub.name}</div>
                        </div>
                        {renderCountdown(sub)}
                      </div>
                      <div className="flex justify-between items-end pt-1.5 border-t border-muted/20 flex-row-reverse">
                        <div className="text-base font-black text-primary">{sub.amount} ₪</div>
                        <div className="text-[9px] text-muted-foreground">{new Date(sub.renewalDate).toLocaleDateString('he-IL', { month: 'short', day: 'numeric' })}</div>
                      </div>
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
      {/* Search & View Toggle Bar */}
      <div className="bg-white p-3 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4 items-center border">
        <div className="relative flex-1 w-full">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="חיפוש חופשי (שם, קטגוריה...)" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-12 rounded-xl border-none bg-muted/30 focus:bg-white h-11 text-base shadow-inner text-right" 
          />
        </div>
        
        <div className="flex items-center p-1 bg-muted/30 rounded-xl h-11 shadow-inner">
          <Button 
            variant={viewMode === 'table' ? 'default' : 'ghost'} 
            size="sm" 
            onClick={() => setViewMode('table')}
            className={cn("rounded-lg gap-2 px-4 h-9 font-bold transition-all", viewMode === 'table' ? 'shadow-md bg-primary text-white' : 'text-muted-foreground hover:text-primary')}
          >
            <ListIcon className="h-4 w-4" /> טבלה
          </Button>
          <Button 
            variant={viewMode === 'cards' ? 'default' : 'ghost'} 
            size="sm" 
            onClick={() => setViewMode('cards')}
            className={cn("rounded-lg gap-2 px-4 h-9 font-bold transition-all", viewMode === 'cards' ? 'shadow-md bg-primary text-white' : 'text-muted-foreground hover:text-primary')}
          >
            <LayoutGrid className="h-4 w-4" /> כרטיסים
          </Button>
          <Button 
            variant={viewMode === 'kanban' ? 'default' : 'ghost'} 
            size="sm" 
            onClick={() => setViewMode('kanban')}
            className={cn("rounded-lg gap-2 px-4 h-9 font-bold transition-all", viewMode === 'kanban' ? 'shadow-md bg-primary text-white' : 'text-muted-foreground hover:text-primary')}
          >
            <Columns className="h-4 w-4" /> קאנבן
          </Button>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="rounded-xl h-11 w-11 border-none bg-muted/30 hover:bg-muted shrink-0 shadow-sm">
              <Settings2 className="h-5 w-5 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-xl border-none mt-2">
            <DropdownMenuLabel className="text-right font-bold text-base mb-1">הגדרות תצוגה</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="space-y-0.5 mt-1">
              {Object.keys(visibleColumns).map((col) => (
                col !== 'actions' && (
                  <DropdownMenuCheckboxItem 
                    key={col}
                    checked={visibleColumns[col as ColumnKey]} 
                    onCheckedChange={() => toggleColumn(col as ColumnKey)} 
                    className="flex-row-reverse text-right rounded-lg h-9 cursor-pointer"
                  >
                    {col === 'name' ? 'שם המינוי' : col === 'category' ? 'קטגוריה' : col === 'amount' ? 'מחיר חודשי' : col === 'renewal' ? 'תאריך חידוש' : col === 'countdown' ? 'ספירה לאחור' : 'סטטוס'}
                  </DropdownMenuCheckboxItem>
                )
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="min-h-[400px] pb-24">
        {viewMode === 'table' && renderTable()}
        {viewMode === 'cards' && renderCards()}
        {viewMode === 'kanban' && renderKanban()}
        
        {filteredSubs.length === 0 && (
          <div className="text-center py-24 bg-white/50 rounded-[2.5rem] border-4 border-dashed border-muted/20">
            <div className="text-7xl mb-4">🔍</div>
            <h2 className="text-xl font-black mb-1 text-foreground">לא מצאנו תוצאות</h2>
            <p className="text-muted-foreground text-sm">נסה לשנות את מונחי החיפוש או הוסף מינוי חדש</p>
            <Button onClick={() => { setSelectedSub(null); setIsModalOpen(true); }} className="mt-6 rounded-full px-8 bg-primary hover:bg-primary/90 h-12 text-base font-bold gap-2 shadow-lg shadow-primary/20">
              <Plus className="h-5 w-5" /> הוסף מינוי ראשון
            </Button>
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
