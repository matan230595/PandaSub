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
  Calendar, 
  Edit2, 
  CheckCircle2, 
  LayoutGrid,
  List as ListIcon,
  Columns,
  Clock,
  Settings2,
  Search,
  Plus
} from "lucide-react"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuCheckboxItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu"
import { CATEGORY_METADATA, STATUS_METADATA, Subscription } from "@/app/lib/subscription-store"
import { useSubscriptions } from "@/context/subscriptions-context"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { AddSubscriptionModal } from "./add-subscription-modal"

type ColumnKey = 'name' | 'category' | 'amount' | 'renewal' | 'countdown' | 'status' | 'actions';

export function SubscriptionList() {
  const { subscriptions, markAsUsed } = useSubscriptions()
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

  const handleRowClick = (sub: Subscription) => {
    setSelectedSub(sub)
    setIsModalOpen(true)
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
      <div className={`flex items-center gap-1.5 font-bold text-[11px] ${colorClass}`}>
        <Clock className="h-3.5 w-3.5" />
        {isOverdue ? "פג תוקף" : `עוד ${daysLeft} ימים`}
      </div>
    )
  }

  const renderTable = () => (
    <div className="rounded-3xl border bg-white shadow-sm overflow-hidden animate-fade-in">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30 border-none">
            {visibleColumns.name && <TableHead className="py-6">מינוי</TableHead>}
            {visibleColumns.category && <TableHead>קטגוריה</TableHead>}
            {visibleColumns.amount && <TableHead>מחיר</TableHead>}
            {visibleColumns.renewal && <TableHead>חידוש</TableHead>}
            {visibleColumns.countdown && <TableHead>ימים שנותרו</TableHead>}
            {visibleColumns.status && <TableHead>סטטוס</TableHead>}
            {visibleColumns.actions && <TableHead className="w-[80px]"></TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredSubs.map((sub) => (
            <TableRow 
              key={sub.id} 
              className="group cursor-pointer transition-colors hover:bg-primary/[0.02]"
              onClick={() => handleRowClick(sub)}
            >
              {visibleColumns.name && (
                <TableCell className="py-5">
                  <div className="flex items-center gap-4">
                    <div 
                      className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl shrink-0 shadow-sm transition-transform group-hover:scale-110"
                      style={{ backgroundColor: `${CATEGORY_METADATA[sub.category].color}15`, color: CATEGORY_METADATA[sub.category].color }}
                    >
                      {CATEGORY_METADATA[sub.category].icon}
                    </div>
                    <div className="overflow-hidden">
                      <div className="font-bold text-base truncate">{sub.name}</div>
                      <div className="text-[11px] text-muted-foreground truncate">{sub.credentials?.email || "ללא פרטי גישה"}</div>
                    </div>
                  </div>
                </TableCell>
              )}
              {visibleColumns.category && (
                <TableCell>
                  <Badge variant="outline" className="rounded-full border-none text-[11px] px-3 py-1" style={{ backgroundColor: `${CATEGORY_METADATA[sub.category].color}15`, color: CATEGORY_METADATA[sub.category].color }}>
                    {CATEGORY_METADATA[sub.category].label}
                  </Badge>
                </TableCell>
              )}
              {visibleColumns.amount && <TableCell className="font-bold text-lg">{sub.amount.toLocaleString()} {sub.currency}</TableCell>}
              {visibleColumns.renewal && (
                <TableCell className="text-sm">
                  {new Date(sub.status === 'trial' ? sub.trialEndsAt! : sub.renewalDate).toLocaleDateString('he-IL')}
                </TableCell>
              )}
              {visibleColumns.countdown && <TableCell>{renderCountdown(sub)}</TableCell>}
              {visibleColumns.status && (
                <TableCell>
                  <Badge className="rounded-full text-[11px] border-none px-3 py-1" style={{ backgroundColor: STATUS_METADATA[sub.status].color, color: 'white' }}>
                    {STATUS_METADATA[sub.status].label}
                  </Badge>
                </TableCell>
              )}
              {visibleColumns.actions && (
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-10 w-10 rounded-full hover:text-green-600 hover:bg-green-50"
                    onClick={(e) => handleMarkUsed(e, sub.id, sub.name)}
                  >
                    <CheckCircle2 className="h-5 w-5" />
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )

  const renderCards = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in p-2">
      {filteredSubs.map(sub => (
        <Card 
          key={sub.id} 
          className="card-shadow border-none rounded-3xl overflow-visible cursor-pointer bg-white"
          onClick={() => handleRowClick(sub)}
        >
          <CardContent className="p-8 pb-4">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-3xl flex items-center justify-center text-3xl shadow-sm" style={{ backgroundColor: `${CATEGORY_METADATA[sub.category].color}15` }}>
                  {CATEGORY_METADATA[sub.category].icon}
                </div>
                <div>
                  <h3 className="font-bold text-xl tracking-tight">{sub.name}</h3>
                  <p className="text-sm text-muted-foreground">{CATEGORY_METADATA[sub.category].label}</p>
                </div>
              </div>
              <Badge style={{ backgroundColor: STATUS_METADATA[sub.status].color, color: 'white' }} className="border-none rounded-full text-[11px] px-3 py-1 shadow-sm">
                {STATUS_METADATA[sub.status].label}
              </Badge>
            </div>
            
            <div className="flex justify-between items-end mb-8">
              <div>
                <span className="text-4xl font-black text-foreground">{sub.amount}</span>
                <span className="text-xl font-bold text-muted-foreground mr-1">{sub.currency}</span>
              </div>
              <div className="text-left">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">חיוב הבא</p>
                <p className="text-base font-bold text-primary">{new Date(sub.renewalDate).toLocaleDateString('he-IL')}</p>
              </div>
            </div>

            {sub.status === 'trial' && (
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-muted-foreground">תקופת ניסיון</span>
                  {renderCountdown(sub)}
                </div>
                <Progress value={Math.max(15, 100 - (calculateDaysLeft(sub.trialEndsAt!) * 4))} className="h-2 rounded-full" />
              </div>
            )}
          </CardContent>
          <CardFooter className="bg-muted/10 px-8 py-4 flex justify-between border-t rounded-b-3xl">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-sm gap-2 font-black hover:text-green-600 rounded-full h-10 px-4 transition-colors"
              onClick={(e) => handleMarkUsed(e, sub.id, sub.name)}
            >
              <CheckCircle2 className="h-4 w-4" /> השתמשתי היום
            </Button>
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-white shadow-sm transition-all">
              <Edit2 className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )

  const renderKanban = () => {
    const statuses: (keyof typeof STATUS_METADATA)[] = ['trial', 'active', 'frozen', 'cancelled', 'not_in_use']
    return (
      <div className="flex gap-8 overflow-x-auto pb-8 -mx-4 px-4 h-[700px] animate-fade-in scrollbar-hide">
        {statuses.map(status => {
          const items = filteredSubs.filter(s => s.status === status)
          return (
            <div key={status} className="flex-shrink-0 w-80 flex flex-col gap-4">
              <div className="flex items-center justify-between px-3">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full shadow-sm" style={{ backgroundColor: STATUS_METADATA[status].color }} />
                  <h3 className="font-bold text-base">{STATUS_METADATA[status].label}</h3>
                </div>
                <Badge variant="secondary" className="rounded-full text-[11px] h-6 px-2.5 font-bold bg-muted/50 border-none">{items.length}</Badge>
              </div>
              <div className="flex-1 bg-muted/20 rounded-[2rem] p-4 space-y-4 overflow-y-auto border-2 border-dashed border-muted/50">
                {items.map(sub => (
                  <Card 
                    key={sub.id} 
                    className="border-none shadow-sm hover:shadow-md transition-all cursor-pointer rounded-2xl bg-white group"
                    onClick={() => handleRowClick(sub)}
                  >
                    <CardContent className="p-5 space-y-4 text-right">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <span className="text-2xl h-10 w-10 flex items-center justify-center rounded-xl bg-muted/30 group-hover:scale-110 transition-transform">{CATEGORY_METADATA[sub.category].icon}</span>
                          <div className="font-bold text-sm truncate">{sub.name}</div>
                        </div>
                        {renderCountdown(sub)}
                      </div>
                      <div className="flex justify-between items-end pt-2 border-t border-muted/30">
                        <div className="text-xl font-black text-primary">{sub.amount} ₪</div>
                        <div className="text-[10px] text-muted-foreground font-medium">{new Date(sub.renewalDate).toLocaleDateString('he-IL', { month: 'short', day: 'numeric' })}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {items.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-xs opacity-50 py-10">
                    גרור לכאן מינויים
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
    <div className="space-y-8">
      <div className="bg-white p-4 rounded-3xl shadow-sm flex flex-col md:flex-row gap-4 items-center border">
        <div className="relative flex-1 w-full">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="חיפוש חופשי (שם, קטגוריה...)" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-12 rounded-2xl border-none bg-muted/40 focus:bg-white h-12 text-lg shadow-inner" 
          />
        </div>
        
        <div className="flex items-center p-1.5 bg-muted/40 rounded-2xl h-12 shadow-inner">
          <Button 
            variant={viewMode === 'table' ? 'default' : 'ghost'} 
            size="sm" 
            onClick={() => setViewMode('table')}
            className={`rounded-xl gap-2 px-5 h-9 font-bold transition-all ${viewMode === 'table' ? 'shadow-lg bg-primary text-white' : 'text-muted-foreground hover:text-primary'}`}
          >
            <ListIcon className="h-4 w-4" /> טבלה
          </Button>
          <Button 
            variant={viewMode === 'cards' ? 'default' : 'ghost'} 
            size="sm" 
            onClick={() => setViewMode('cards')}
            className={`rounded-xl gap-2 px-5 h-9 font-bold transition-all ${viewMode === 'cards' ? 'shadow-lg bg-primary text-white' : 'text-muted-foreground hover:text-primary'}`}
          >
            <LayoutGrid className="h-4 w-4" /> כרטיסים
          </Button>
          <Button 
            variant={viewMode === 'kanban' ? 'default' : 'ghost'} 
            size="sm" 
            onClick={() => setViewMode('kanban')}
            className={`rounded-xl gap-2 px-5 h-9 font-bold transition-all ${viewMode === 'kanban' ? 'shadow-lg bg-primary text-white' : 'text-muted-foreground hover:text-primary'}`}
          >
            <Columns className="h-4 w-4" /> קאנבן
          </Button>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="rounded-2xl h-12 w-12 border-none bg-muted/40 hover:bg-muted shrink-0 shadow-sm">
              <Settings2 className="h-6 w-6 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 rounded-3xl p-3 shadow-2xl border-none mt-2">
            <DropdownMenuLabel className="text-right font-bold text-lg mb-2">הגדרות תצוגה</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="space-y-1 mt-2">
              {Object.keys(visibleColumns).map((col) => (
                col !== 'actions' && (
                  <DropdownMenuCheckboxItem 
                    key={col}
                    checked={visibleColumns[col as ColumnKey]} 
                    onCheckedChange={() => toggleColumn(col as ColumnKey)} 
                    className="flex-row-reverse text-right rounded-xl h-10 cursor-pointer"
                  >
                    {col === 'name' ? 'שם המינוי' : col === 'category' ? 'קטגוריה' : col === 'amount' ? 'מחיר חודשי' : col === 'renewal' ? 'תאריך חידוש' : col === 'countdown' ? 'ספירה לאחור' : 'סטטוס'}
                  </DropdownMenuCheckboxItem>
                )
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="min-h-[500px] relative">
        {viewMode === 'table' && renderTable()}
        {viewMode === 'cards' && renderCards()}
        {viewMode === 'kanban' && renderKanban()}
        
        {filteredSubs.length === 0 && (
          <div className="text-center py-32 bg-white/50 rounded-[3rem] border-4 border-dashed border-muted/30 animate-pulse">
            <div className="text-8xl mb-6">🔍</div>
            <h2 className="text-2xl font-black mb-2 text-foreground">לא מצאנו תוצאות לחיפוש</h2>
            <p className="text-muted-foreground">נסה לשנות את מונחי החיפוש או הוסף מינוי חדש בלחיצה על הכפתור</p>
            <Button onClick={() => { setSelectedSub(null); setIsModalOpen(true); }} className="mt-8 rounded-full px-10 bg-primary hover:bg-primary/90 h-14 text-lg font-bold gap-3 shadow-xl shadow-primary/20">
              <Plus className="h-6 w-6" /> הוסף מינוי ראשון
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
