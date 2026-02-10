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
  CreditCard, 
  Trash2, 
  Edit2, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck,
  LayoutGrid,
  List as ListIcon,
  Columns,
  Clock,
  Eye,
  EyeOff
} from "lucide-react"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { CATEGORY_METADATA, STATUS_METADATA, PRIORITY_CONFIG, Subscription } from "@/app/lib/subscription-store"
import { useSubscriptions } from "@/context/subscriptions-context"
import { useToast } from "@/hooks/use-toast"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export function SubscriptionList() {
  const { subscriptions, deleteSubscription, markAsUsed } = useSubscriptions()
  const { toast } = useToast()
  const [viewMode, setViewMode] = React.useState<'table' | 'cards' | 'kanban'>('table')
  const [showPasswords, setShowPasswords] = React.useState<Record<string, boolean>>({})

  const handleDelete = (id: string, name: string) => {
    deleteSubscription(id)
    toast({
      title: "המינוי הוסר",
      description: `${name} הוסר מהרשימה בהצלחה.`,
    })
  }

  const handleMarkUsed = (id: string, name: string) => {
    markAsUsed(id)
    toast({
      title: "כל הכבוד!",
      description: `סימנת שנעשה שימוש ב-${name} היום.`,
    })
  }

  const togglePassword = (id: string) => {
    setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }))
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
            <TableHead className="text-right py-6">מינוי</TableHead>
            <TableHead className="text-right">קטגוריה</TableHead>
            <TableHead className="text-right">מחיר</TableHead>
            <TableHead className="text-right">חידוש / ניסיון</TableHead>
            <TableHead className="text-right">ספירה לאחור</TableHead>
            <TableHead className="text-right">סטטוס</TableHead>
            <TableHead className="w-[100px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscriptions.map((sub) => (
            <TableRow key={sub.id} className="group border-b border-muted/30 hover:bg-primary/[0.02] transition-colors">
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
                    <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                      {sub.credentials?.email || sub.credentials?.username || "ללא פרטי גישה"}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="rounded-full border-none shadow-sm" style={{ backgroundColor: `${CATEGORY_METADATA[sub.category].color}10`, color: CATEGORY_METADATA[sub.category].color }}>
                  {CATEGORY_METADATA[sub.category].label}
                </Badge>
              </TableCell>
              <TableCell className="text-lg font-bold">{sub.amount.toLocaleString()} {sub.currency}</TableCell>
              <TableCell>
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {new Date(sub.status === 'trial' ? sub.trialEndsAt! : sub.renewalDate).toLocaleDateString('he-IL')}
                  </div>
                  {sub.cancelLeadDays && (
                    <div className="text-[10px] text-primary font-bold">התראה יזומה: {sub.cancelLeadDays} ימים מראש</div>
                  )}
                </div>
              </TableCell>
              <TableCell>{renderCountdown(sub)}</TableCell>
              <TableCell>
                <Badge className="rounded-full px-3 py-1 font-bold text-[11px] shadow-sm border-none" style={{ backgroundColor: STATUS_METADATA[sub.status].color, color: 'white' }}>
                  {STATUS_METADATA[sub.status].label}
                </Badge>
              </TableCell>
              <TableCell>
                <ActionButtons sub={sub} onMarkUsed={handleMarkUsed} onDelete={handleDelete} onTogglePassword={togglePassword} showPassword={showPasswords[sub.id]} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )

  const renderCards = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {subscriptions.map(sub => (
        <Card key={sub.id} className="card-shadow border-none rounded-2xl overflow-hidden group">
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
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-[10px] font-bold">
                  <span>תקופת ניסיון</span>
                  {renderCountdown(sub)}
                </div>
                <Progress value={Math.max(0, 100 - (calculateDaysLeft(sub.trialEndsAt!) * 3))} className="h-1.5" />
              </div>
            )}

            {sub.credentials && (
              <div className="bg-muted/30 p-3 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">אימייל/שם:</span>
                  <span className="font-medium">{sub.credentials.email || sub.credentials.username}</span>
                </div>
                {sub.credentials.password && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">סיסמה:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono">{showPasswords[sub.id] ? sub.credentials.password : '••••••••'}</span>
                      <button onClick={() => togglePassword(sub.id)} className="text-primary hover:text-primary/70">
                        {showPasswords[sub.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter className="bg-muted/20 p-4 flex justify-between">
            <Button variant="ghost" size="sm" onClick={() => handleMarkUsed(sub.id, sub.name)} className="gap-2 text-xs font-bold hover:bg-primary/10 hover:text-primary rounded-full">
              <CheckCircle2 className="h-4 w-4" /> השתמשתי היום
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="text-right rounded-xl">
                <DropdownMenuItem className="gap-2 flex-row-reverse"><Edit2 className="h-4 w-4" /> עריכה</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleDelete(sub.id, sub.name)} className="gap-2 flex-row-reverse text-destructive"><Trash2 className="h-4 w-4" /> מחיקה</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
          const items = subscriptions.filter(s => s.status === status)
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
                  <Card key={sub.id} className="border-none shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing rounded-xl">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{CATEGORY_METADATA[sub.category].icon}</span>
                        <div className="font-bold text-sm">{sub.name}</div>
                      </div>
                      <div className="flex justify-between items-end">
                        <div className="text-lg font-bold">{sub.amount} ₪</div>
                        <div className="text-[10px] text-muted-foreground">חידוש: {new Date(sub.renewalDate).toLocaleDateString('he-IL', { month: 'short', day: 'numeric' })}</div>
                      </div>
                      {sub.status === 'trial' && renderCountdown(sub)}
                    </CardContent>
                  </Card>
                ))}
                {items.length === 0 && (
                  <div className="h-24 border-2 border-dashed rounded-xl flex items-center justify-center text-muted-foreground text-xs italic">
                    אין מינויים בסטטוס זה
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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center p-1 bg-white rounded-full shadow-sm border">
          <Button 
            variant={viewMode === 'table' ? 'default' : 'ghost'} 
            size="sm" 
            onClick={() => setViewMode('table')}
            className="rounded-full gap-2 px-4 h-8"
          >
            <ListIcon className="h-4 w-4" /> טבלה
          </Button>
          <Button 
            variant={viewMode === 'cards' ? 'default' : 'ghost'} 
            size="sm" 
            onClick={() => setViewMode('cards')}
            className="rounded-full gap-2 px-4 h-8"
          >
            <LayoutGrid className="h-4 w-4" /> כרטיסים
          </Button>
          <Button 
            variant={viewMode === 'kanban' ? 'default' : 'ghost'} 
            size="sm" 
            onClick={() => setViewMode('kanban')}
            className="rounded-full gap-2 px-4 h-8"
          >
            <Columns className="h-4 w-4" /> קאנבן
          </Button>
        </div>
        <p className="text-sm text-muted-foreground italic">מציג {subscriptions.length} מינויים פעילים</p>
      </div>

      <div className="animate-fade-in">
        {viewMode === 'table' && renderTable()}
        {viewMode === 'cards' && renderCards()}
        {viewMode === 'kanban' && renderKanban()}
      </div>

      {subscriptions.length === 0 && (
        <div className="text-center py-24 bg-white rounded-3xl card-shadow border-2 border-dashed">
          <div className="text-6xl mb-6 animate-bounce">🐼</div>
          <h2 className="text-2xl font-bold mb-2">עדיין לא הוספת מינויים?</h2>
          <p className="text-muted-foreground">הוסף את המינוי הראשון שלך כדי להתחיל לעקוב ולחסוך!</p>
        </div>
      )}
    </div>
  )
}

function ActionButtons({ sub, onMarkUsed, onDelete, onTogglePassword, showPassword }: any) {
  return (
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-green-50 hover:text-green-600" onClick={() => onMarkUsed(sub.id, sub.name)}>
            <CheckCircle2 className="h-5 w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>סימון כשימוש היום</TooltipContent>
      </Tooltip>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="text-right rounded-xl shadow-xl p-1 border-none">
          <DropdownMenuItem className="gap-2 flex-row-reverse rounded-lg py-2"><Edit2 className="h-4 w-4" /> עריכה</DropdownMenuItem>
          {sub.credentials?.password && (
            <DropdownMenuItem onClick={() => onTogglePassword(sub.id)} className="gap-2 flex-row-reverse rounded-lg py-2">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showPassword ? 'הסתר סיסמה' : 'הצג סיסמה'}
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem className="gap-2 flex-row-reverse text-destructive focus:bg-destructive/5 focus:text-destructive rounded-lg py-2" onClick={() => onDelete(sub.id, sub.name)}>
            <Trash2 className="h-4 w-4" /> מחיקה
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
