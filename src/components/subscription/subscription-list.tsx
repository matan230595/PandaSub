
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
  MoreHorizontal, 
  Calendar, 
  Trash2, 
  Edit2, 
  CheckCircle2, 
  LayoutGrid,
  List as ListIcon,
  Columns,
  Clock,
  Eye,
  EyeOff,
  Settings2,
  Filter,
  Search,
  Plus
} from "lucide-react"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu"
import { CATEGORY_METADATA, STATUS_METADATA, PRIORITY_CONFIG, Subscription } from "@/app/lib/subscription-store"
import { useSubscriptions } from "@/context/subscriptions-context"
import { useToast } from "@/hooks/use-toast"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { AddSubscriptionModal } from "./add-subscription-modal"

type ColumnKey = 'name' | 'category' | 'amount' | 'renewal' | 'countdown' | 'status' | 'actions';

export function SubscriptionList() {
  const { subscriptions, markAsUsed } = useSubscriptions()
  const { toast } = useToast()
  
  const [viewMode, setViewMode] = React.useState<'table' | 'cards' | 'kanban'>('table')
  const [showPasswords, setShowPasswords] = React.useState<Record<string, boolean>>({})
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
    <div className="rounded-2xl border-none bg-white shadow-xl shadow-black/5 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 border-none hover:bg-muted/30">
            {visibleColumns.name && <TableHead className="text-right py-6">מינוי</TableHead>}
            {visibleColumns.category && <TableHead className="text-right">קטגוריה</TableHead>}
            {visibleColumns.amount && <TableHead className="text-right">מחיר</TableHead>}
            {visibleColumns.renewal && <TableHead className="text-right">חידוש</TableHead>}
            {visibleColumns.countdown && <TableHead className="text-right">ימים שנותרו</TableHead>}
            {visibleColumns.status && <TableHead className="text-right">סטטוס</TableHead>}
            {visibleColumns.actions && <TableHead className="w-[80px]"></TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredSubs.map((sub) => (
            <TableRow 
              key={sub.id} 
              className="group border-b border-muted/30 hover:bg-primary/[0.02] transition-colors cursor-pointer"
              onClick={() => handleRowClick(sub)}
            >
              {visibleColumns.name && (
                <TableCell className="py-5 font-medium">
                  <div className="flex items-center gap-4">
                    <div 
                      className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl shadow-sm transition-transform group-hover:scale-110"
                      style={{ backgroundColor: `${CATEGORY_METADATA[sub.category].color}15`, color: CATEGORY_METADATA[sub.category].color }}
                    >
                      {CATEGORY_METADATA[sub.category].icon}
                    </div>
                    <div>
                      <div className="text-base font-bold text-foreground">{sub.name}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{sub.credentials?.email || "ללא פרטי גישה"}</div>
                    </div>
                  </div>
                </TableCell>
              )}
              {visibleColumns.category && (
                <TableCell>
                  <Badge variant="outline" className="rounded-full border-none shadow-sm" style={{ backgroundColor: `${CATEGORY_METADATA[sub.category].color}10`, color: CATEGORY_METADATA[sub.category].color }}>
                    {CATEGORY_METADATA[sub.category].label}
                  </Badge>
                </TableCell>
              )}
              {visibleColumns.amount && <TableCell className="text-lg font-bold">{sub.amount.toLocaleString()} {sub.currency}</TableCell>}
              {visibleColumns.renewal && (
                <TableCell>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {new Date(sub.status === 'trial' ? sub.trialEndsAt! : sub.renewalDate).toLocaleDateString('he-IL')}
                  </div>
                </TableCell>
              )}
              {visibleColumns.countdown && <TableCell>{renderCountdown(sub)}</TableCell>}
              {visibleColumns.status && (
                <TableCell>
                  <Badge className="rounded-full px-3 py-1 font-bold text-[11px] border-none" style={{ backgroundColor: STATUS_METADATA[sub.status].color, color: 'white' }}>
                    {STATUS_METADATA[sub.status].label}
                  </Badge>
                </TableCell>
              )}
              {visibleColumns.actions && (
                <TableCell>
                  <div className="flex items-center justify-end">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="rounded-full h-8 w-8 hover:bg-green-50 hover:text-green-600"
                      onClick={(e) => handleMarkUsed(e, sub.id, sub.name)}
                    >
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredSubs.map(sub => (
        <Card 
          key={sub.id} 
          className="card-shadow border-none rounded-2xl overflow-hidden group cursor-pointer"
          onClick={() => handleRowClick(sub)}
        >
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: `${CATEGORY_METADATA[sub.category].color}15` }}>
                  {CATEGORY_METADATA[sub.category].icon}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{sub.name}</h3>
                  <p className="text-xs text-muted-foreground">{CATEGORY_METADATA[sub.category].label}</p>
                </div>
              </div>
              <Badge style={{ backgroundColor: STATUS_METADATA[sub.status].color, color: 'white' }} className="border-none rounded-full">
                {STATUS_METADATA[sub.status].label}
              </Badge>
            </div>
            
            <div className="flex justify-between items-center mb-6">
              <div className="text-2xl font-bold">{sub.amount} {sub.currency}</div>
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground">חיוב הבא</p>
                <p className="text-sm font-bold">{new Date(sub.renewalDate).toLocaleDateString('he-IL')}</p>
              </div>
            </div>

            {sub.status === 'trial' && (
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-[10px] font-bold">
                  <span>תקופת ניסיון</span>
                  {renderCountdown(sub)}
                </div>
                <Progress value={Math.max(0, 100 - (calculateDaysLeft(sub.trialEndsAt!) * 3))} className="h-1.5" />
              </div>
            )}

            {sub.notes && (
              <div className="bg-muted/30 p-3 rounded-xl text-xs text-muted-foreground line-clamp-2 mt-2 italic">
                {sub.notes}
              </div>
            )}
          </CardContent>
          <CardFooter className="bg-muted/20 p-4 flex justify-between border-t border-white/50">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={(e) => handleMarkUsed(e, sub.id, sub.name)} 
              className="gap-2 text-xs font-bold hover:bg-green-50 hover:text-green-600 rounded-full h-9"
            >
              <CheckCircle2 className="h-4 w-4" /> סימון כשימוש
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
              <Edit2 className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )

  const renderKanban = () => {
    const statuses: (SubscriptionStatus)[] = ['trial', 'active', 'frozen', 'cancelled', 'not_in_use']
    return (
      <div className="flex gap-6 overflow-x-auto pb-6 -mx-4 px-4 h-[700px]">
        {statuses.map(status => {
          const items = filteredSubs.filter(s => s.status === status)
          return (
            <div key={status} className="flex-shrink-0 w-80 flex flex-col gap-4">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: STATUS_METADATA[status].color }} />
                  <h3 className="font-bold text-sm">{STATUS_METADATA[status].label}</h3>
                  <Badge variant="secondary" className="rounded-full text-[10px]">{items.length}</Badge>
                </div>
              </div>
              <div className="flex-1 bg-muted/30 rounded-2xl p-4 space-y-4 overflow-y-auto">
                {items.map(sub => (
                  <Card 
                    key={sub.id} 
                    className="border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer rounded-xl"
                    onClick={() => handleRowClick(sub)}
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{CATEGORY_METADATA[sub.category].icon}</span>
                        <div className="font-bold text-sm">{sub.name}</div>
                      </div>
                      <div className="flex justify-between items-end">
                        <div className="text-lg font-bold">{sub.amount} ₪</div>
                        <div className="text-[10px] text-muted-foreground">חיוב: {new Date(sub.renewalDate).toLocaleDateString('he-IL', { month: 'short', day: 'numeric' })}</div>
                      </div>
                      {sub.status === 'trial' && renderCountdown(sub)}
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
      <div className="bg-white p-4 rounded-3xl card-shadow flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="חיפוש חופשי..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10 rounded-full border-none bg-muted/50 focus:bg-white h-12" 
          />
        </div>
        
        <div className="flex items-center p-1 bg-muted/50 rounded-full h-12">
          <Button 
            variant={viewMode === 'table' ? 'default' : 'ghost'} 
            size="sm" 
            onClick={() => setViewMode('table')}
            className="rounded-full gap-2 px-6 h-10 transition-all"
          >
            <ListIcon className="h-4 w-4" /> טבלה
          </Button>
          <Button 
            variant={viewMode === 'cards' ? 'default' : 'ghost'} 
            size="sm" 
            onClick={() => setViewMode('cards')}
            className="rounded-full gap-2 px-6 h-10 transition-all"
          >
            <LayoutGrid className="h-4 w-4" /> כרטיסים
          </Button>
          <Button 
            variant={viewMode === 'kanban' ? 'default' : 'ghost'} 
            size="sm" 
            onClick={() => setViewMode('kanban')}
            className="rounded-full gap-2 px-6 h-10 transition-all"
          >
            <Columns className="h-4 w-4" /> קאנבן
          </Button>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="rounded-full h-12 w-12 border-none bg-muted/50 hover:bg-muted">
              <Settings2 className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 text-right rounded-2xl p-2 shadow-xl border-none">
            <DropdownMenuLabel className="text-right">שדות להצגה (טבלה)</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem checked={visibleColumns.category} onCheckedChange={() => toggleColumn('category')} className="text-right flex-row-reverse gap-2">קטגוריה</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked={visibleColumns.amount} onCheckedChange={() => toggleColumn('amount')} className="text-right flex-row-reverse gap-2">מחיר</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked={visibleColumns.renewal} onCheckedChange={() => toggleColumn('renewal')} className="text-right flex-row-reverse gap-2">תאריך חידוש</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked={visibleColumns.countdown} onCheckedChange={() => toggleColumn('countdown')} className="text-right flex-row-reverse gap-2">ימים שנותרו</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked={visibleColumns.status} onCheckedChange={() => toggleColumn('status')} className="text-right flex-row-reverse gap-2">סטטוס</DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="animate-fade-in min-h-[400px]">
        {viewMode === 'table' && renderTable()}
        {viewMode === 'cards' && renderCards()}
        {viewMode === 'kanban' && renderKanban()}
        
        {filteredSubs.length === 0 && (
          <div className="text-center py-32 bg-white rounded-[3rem] card-shadow border-4 border-dashed border-muted">
            <div className="text-7xl mb-6">🔍</div>
            <h2 className="text-2xl font-bold mb-2">לא מצאנו תוצאות</h2>
            <p className="text-muted-foreground">נסה לשנות את מונחי החיפוש או הוסף מינוי חדש.</p>
            <Button onClick={() => setIsModalOpen(true)} className="mt-6 rounded-full px-8 bg-primary h-12 gap-2">
              <Plus className="h-4 w-4" /> הוסף מינוי חדש
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
