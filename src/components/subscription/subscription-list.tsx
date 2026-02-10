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
  Search,
  Trash2,
  Copy,
  Filter,
  Check,
  AlertTriangle,
  CreditCard,
  RefreshCw,
  MoreVertical
} from "lucide-react"
import { 
  DropdownMenu, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
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
import { CATEGORY_METADATA, STATUS_METADATA, Subscription, SubscriptionCategory, SubscriptionStatus, PRIORITY_CONFIG } from "@/app/lib/subscription-store"
import { useSubscriptions } from "@/context/subscriptions-context"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { AddSubscriptionModal } from "./add-subscription-modal"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { he } from "date-fns/locale"

export function SubscriptionList() {
  const { subscriptions, deleteSubscription, duplicateSubscription } = useSubscriptions()
  const { toast } = useToast()
  
  const [viewMode, setViewMode] = React.useState<'table' | 'cards' | 'kanban'>('cards')
  const [selectedSub, setSelectedSub] = React.useState<Subscription | null>(null)
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [categoryFilter, setCategoryFilter] = React.useState<SubscriptionCategory | 'all'>('all')
  const [statusFilter, setStatusFilter] = React.useState<SubscriptionStatus | 'all'>('all')
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

  const calculateDaysLeft = (date: string) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const renewal = new Date(date)
    renewal.setHours(0, 0, 0, 0)
    const diff = renewal.getTime() - today.getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  const renderCountdown = (sub: Subscription) => {
    const daysLeft = calculateDaysLeft(sub.renewalDate)
    
    if (daysLeft < 0) return <span className="text-destructive font-black">פג תוקף</span>
    if (daysLeft === 0) return (
      <div className="flex items-center gap-1 font-black text-xs text-primary animate-pulse">
        <Clock className="h-3 w-3" />
        היום!
      </div>
    )
    
    // סולם צבעים חכם ודינמי
    let colorClass = "text-green-600"
    if (daysLeft <= 3) colorClass = "text-destructive animate-bounce"
    else if (daysLeft <= 7) colorClass = "text-orange-500"
    else if (daysLeft <= 14) colorClass = "text-blue-500"

    return (
      <div className={cn("flex items-center gap-1 font-black text-xs transition-colors duration-500", colorClass)}>
        <Clock className="h-3 w-3" />
        עוד {daysLeft} ימים
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
              <div className="flex items-center gap-4 flex-row-reverse">
                <div 
                  className="h-14 w-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm" 
                  style={{ backgroundColor: `${CATEGORY_METADATA[sub.category].color}15` }}
                >
                  {CATEGORY_METADATA[sub.category].icon}
                </div>
                <div className="text-right">
                  <h3 className="text-xl font-black text-foreground truncate max-w-[150px]">{sub.name}</h3>
                  <div className="flex items-center gap-2 flex-row-reverse justify-start">
                    <Badge variant="outline" className="text-[10px] px-2 border-primary/20 bg-primary/5 text-primary">
                      {sub.billingCycle === 'monthly' ? 'חודשי' : 'שנתי'}
                    </Badge>
                    {sub.priority && sub.priority !== 'none' && (
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: PRIORITY_CONFIG[sub.priority].color }} />
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full h-8 w-8 hover:bg-primary/5"
                  onClick={(e) => { e.stopPropagation(); handleEdit(sub); }}
                >
                  <Edit2 className="h-4 w-4 text-muted-foreground" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-2xl p-2 text-right">
                    <DropdownMenuItem onClick={() => duplicateSubscription(sub.id)} className="flex-row-reverse gap-2 rounded-xl">
                      <Copy className="h-4 w-4" /> שכפל מינוי
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => { setDeleteConfirmId(sub.id); }} className="flex-row-reverse gap-2 rounded-xl text-destructive">
                      <Trash2 className="h-4 w-4" /> מחק מינוי
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-muted/30 p-4 rounded-2xl text-right">
                <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1 flex items-center gap-1 flex-row-reverse">
                   סכום חיוב <CreditCard className="h-3 w-3" />
                </div>
                <div className="text-2xl font-black text-primary">
                  {sub.amount} <span className="text-sm font-bold">{sub.currency}</span>
                </div>
              </div>
              <div className="bg-muted/30 p-4 rounded-2xl text-right">
                <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1 flex items-center gap-1 flex-row-reverse">
                   חידוש קרוב <RefreshCw className="h-3 w-3" />
                </div>
                <div className="text-base font-bold text-foreground">
                  {format(new Date(sub.renewalDate), 'd בMMMM', { locale: he })}
                </div>
                {renderCountdown(sub)}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between flex-row-reverse text-xs">
                <span className="font-bold text-muted-foreground">שיטת תשלום:</span>
                <span className="font-black text-foreground">{sub.paymentMethod || 'לא הוגדר'}</span>
              </div>
              <div className="flex items-center justify-between flex-row-reverse text-xs">
                <span className="font-bold text-muted-foreground">תזכורות פעילות:</span>
                <div className="flex gap-1 flex-row-reverse">
                  {(sub.reminderDays || [3]).map(day => (
                    <Badge key={day} variant="secondary" className="text-[9px] px-1.5 rounded-md">
                      {day === 0 ? 'היום' : `${day} ימים`}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="bg-muted/10 border-t p-4 flex justify-between items-center flex-row-reverse">
            <Badge 
              style={{ backgroundColor: STATUS_METADATA[sub.status].color, color: 'white' }} 
              className="rounded-full px-3 py-0.5 text-[10px] font-black border-none"
            >
              {STATUS_METADATA[sub.status].label}
            </Badge>
            <div className="text-[10px] font-bold text-muted-foreground italic">
              עודכן לאחרונה: {sub.lastUsed ? format(new Date(sub.lastUsed), 'dd/MM/yy') : 'מעולם לא'}
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )

  const renderTable = () => (
    <div className="rounded-[2rem] border-none card-shadow bg-white overflow-hidden animate-fade-in mb-12">
      <Table>
        <TableHeader className="bg-muted/30 h-14">
          <TableRow>
            <TableHead className="text-right font-black">מינוי</TableHead>
            <TableHead className="text-right font-black">קטגוריה</TableHead>
            <TableHead className="text-right font-black">סכום</TableHead>
            <TableHead className="text-right font-black">שיטת תשלום</TableHead>
            <TableHead className="text-right font-black">חידוש</TableHead>
            <TableHead className="text-right font-black">סטטוס</TableHead>
            <TableHead className="text-center font-black">פעולות</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredSubs.map((sub) => (
            <TableRow 
              key={sub.id} 
              className="cursor-pointer hover:bg-primary/[0.02] h-16 border-b border-border/50"
              onClick={() => handleEdit(sub)}
            >
              <TableCell className="text-right">
                <div className="flex items-center gap-3 flex-row-reverse justify-end">
                  <span className="text-xl">{CATEGORY_METADATA[sub.category].icon}</span>
                  <div className="flex flex-col text-right">
                    <span className="font-black text-sm">{sub.name}</span>
                    <span className="text-[10px] text-muted-foreground">{sub.billingCycle === 'monthly' ? 'חודשי' : 'שנתי'}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Badge variant="outline" className="text-[10px] px-2 py-0.5 rounded-lg border-primary/20 text-primary">
                  {CATEGORY_METADATA[sub.category].label}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-black text-primary">{sub.amount} {sub.currency}</TableCell>
              <TableCell className="text-right text-xs font-bold text-muted-foreground">{sub.paymentMethod || '-'}</TableCell>
              <TableCell className="text-right">
                <div className="flex flex-col text-right">
                  <span className="text-xs font-bold">{new Date(sub.renewalDate).toLocaleDateString('he-IL')}</span>
                  {renderCountdown(sub)}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Badge className="text-[10px] px-2 rounded-full border-none font-black" style={{ backgroundColor: STATUS_METADATA[sub.status].color, color: 'white' }}>
                  {STATUS_METADATA[sub.status].label}
                </Badge>
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()} className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-primary/5 hover:text-primary" onClick={() => handleEdit(sub)}><Edit2 className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-destructive/5 hover:text-destructive text-destructive" onClick={() => setDeleteConfirmId(sub.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )

  const renderKanban = () => {
    const statuses: SubscriptionStatus[] = ['trial', 'active', 'frozen', 'cancelled']
    return (
      <div className="flex gap-6 overflow-x-auto pb-8 flex-row-reverse snap-x">
        {statuses.map(status => {
          const items = filteredSubs.filter(s => s.status === status)
          return (
            <div key={status} className="flex-shrink-0 w-80 flex flex-col gap-4 snap-center">
              <div className="flex items-center justify-between px-4 py-3 bg-white rounded-2xl shadow-sm border-r-4" style={{ borderRightColor: STATUS_METADATA[status].color }}>
                <h3 className="font-black text-sm">{STATUS_METADATA[status].label}</h3>
                <Badge variant="secondary" className="rounded-full bg-muted/50">{items.length}</Badge>
              </div>
              <div className="bg-muted/20 rounded-[2rem] p-3 space-y-4 min-h-[600px] border-2 border-dashed border-muted">
                {items.map(sub => (
                  <Card key={sub.id} className="p-4 rounded-2xl bg-white shadow-md border-none cursor-pointer transition-all hover:scale-[1.03]" onClick={() => handleEdit(sub)}>
                    <div className="flex justify-between items-center flex-row-reverse mb-3">
                      <div className="flex items-center gap-2 flex-row-reverse">
                         <span className="text-lg">{CATEGORY_METADATA[sub.category].icon}</span>
                         <span className="font-black text-xs truncate max-w-[100px] text-right">{sub.name}</span>
                      </div>
                      <span className="text-xs font-black text-primary">{sub.amount}₪</span>
                    </div>
                    <div className="flex justify-between items-center flex-row-reverse">
                       <span className="text-[10px] text-muted-foreground font-bold">{sub.paymentMethod || 'ללא שיטה'}</span>
                       {renderCountdown(sub)}
                    </div>
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
      <div className="bg-white p-4 rounded-[2rem] shadow-lg border border-border/50 flex flex-col lg:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="חפש מינוי, קטגוריה או שיטת תשלום..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-12 h-12 text-base text-right bg-muted/30 border-none rounded-2xl focus:ring-primary/20" 
          />
        </div>
        
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="rounded-2xl h-12 gap-2 border-primary/10 bg-primary/5 text-primary font-bold px-6">
                <Filter className="h-4 w-4" /> 
                {categoryFilter === 'all' ? 'כל הקטגוריות' : CATEGORY_METADATA[categoryFilter].label}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="text-right rounded-2xl p-2 w-56">
              <DropdownMenuItem onClick={() => setCategoryFilter('all')} className="text-right rounded-xl">כל הקטגוריות</DropdownMenuItem>
              <DropdownMenuSeparator />
              {Object.entries(CATEGORY_METADATA).map(([key, val]) => (
                <DropdownMenuItem key={key} onClick={() => setCategoryFilter(key as any)} className="text-right flex-row-reverse gap-3 rounded-xl">
                  {val.icon} {val.label}
                  {categoryFilter === key && <Check className="h-4 w-4 mr-auto text-primary" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex p-1.5 bg-muted/50 rounded-2xl h-12">
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

      <AddSubscriptionModal 
        open={isModalOpen} 
        onOpenChange={(val) => { setIsModalOpen(val); if (!val) setSelectedSub(null); }} 
        subscription={selectedSub} 
      />

      <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent className="text-right rounded-[2.5rem] border-none shadow-2xl p-10" dir="rtl">
          <AlertDialogHeader className="items-center">
            <div className="h-24 w-24 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-6 animate-pulse">
              <AlertTriangle className="h-12 w-12" />
            </div>
            <AlertDialogTitle className="text-3xl font-black">מחיקת מינוי סופית?</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-muted-foreground text-lg leading-relaxed">
              פעולה זו לא ניתנת לביטול. כל ההיסטוריה והתזכורות של המינוי יימחקו לנצח.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center flex-row-reverse gap-4 mt-10">
            <AlertDialogAction onClick={() => { if (deleteConfirmId) deleteSubscription(deleteConfirmId); setDeleteConfirmId(null); toast({ title: "המינוי נמחק בהצלחה", variant: "destructive" }); }} className="bg-destructive hover:bg-destructive/90 rounded-full px-12 h-14 text-lg font-black shadow-xl shadow-destructive/20">
              כן, מחק מינוי
            </AlertDialogAction>
            <AlertDialogCancel className="rounded-full h-14 px-12 text-lg font-bold">ביטול</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
