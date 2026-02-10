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
import { MoreHorizontal, Calendar, CreditCard, Trash2, Edit2, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { CATEGORY_METADATA, STATUS_METADATA, PRIORITY_CONFIG } from "@/app/lib/subscription-store"
import { useSubscriptions } from "@/context/subscriptions-context"
import { useToast } from "@/hooks/use-toast"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export function SubscriptionList() {
  const { subscriptions, deleteSubscription, markAsUsed } = useSubscriptions()
  const { toast } = useToast()

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

  return (
    <div className="rounded-2xl border-none bg-white shadow-xl shadow-black/5 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 border-none hover:bg-muted/30">
            <TableHead className="text-right py-6">מינוי</TableHead>
            <TableHead className="text-right">קטגוריה</TableHead>
            <TableHead className="text-right">מחיר</TableHead>
            <TableHead className="text-right">חידוש הבא</TableHead>
            <TableHead className="text-right">עדיפות</TableHead>
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
                      {sub.trialEndsAt ? (
                        <span className="text-orange-600 font-bold flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" /> ניסיון נגמר ב-{new Date(sub.trialEndsAt).toLocaleDateString('he-IL')}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1"><CreditCard className="h-3 w-3" /> חיוב חודשי</span>
                      )}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge 
                  variant="outline" 
                  className="rounded-full font-medium px-3 py-1 border-none shadow-sm"
                  style={{ backgroundColor: `${CATEGORY_METADATA[sub.category].color}10`, color: CATEGORY_METADATA[sub.category].color }}
                >
                  {CATEGORY_METADATA[sub.category].label}
                </Badge>
              </TableCell>
              <TableCell className="text-lg font-bold">
                {sub.amount.toLocaleString()} {sub.currency}
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {new Date(sub.renewalDate).toLocaleDateString('he-IL')}
                  </div>
                  {sub.autoCancelDate && (
                    <div className="text-[10px] text-destructive font-bold flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" /> ביטול אוטומטי ב-{new Date(sub.autoCancelDate).toLocaleDateString('he-IL')}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {sub.priority && sub.priority !== 'none' ? (
                  <Badge 
                    className="rounded-full px-2 py-0.5 text-[10px] border-none"
                    style={{ backgroundColor: PRIORITY_CONFIG[sub.priority].color, color: sub.priority === 'medium' ? 'black' : 'white' }}
                  >
                    {PRIORITY_CONFIG[sub.priority].label.split(' ')[0]}
                  </Badge>
                ) : (
                  <span className="text-xs text-muted-foreground">רגיל</span>
                )}
              </TableCell>
              <TableCell>
                <Badge 
                  className="rounded-full px-3 py-1 font-bold text-[11px] shadow-sm border-none"
                  style={{ backgroundColor: STATUS_METADATA[sub.status].color, color: 'white' }}
                >
                  {STATUS_METADATA[sub.status].label}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-9 w-9 rounded-full hover:bg-green-50 hover:text-green-600"
                        onClick={() => handleMarkUsed(sub.id, sub.name)}
                      >
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
                      <DropdownMenuItem className="gap-2 flex-row-reverse rounded-lg py-2">
                        <Edit2 className="h-4 w-4" /> עריכת פרטים
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="gap-2 flex-row-reverse text-destructive focus:bg-destructive/5 focus:text-destructive rounded-lg py-2"
                        onClick={() => handleDelete(sub.id, sub.name)}
                      >
                        <Trash2 className="h-4 w-4" /> ביטול ומחיקה
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {subscriptions.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="h-48 text-center text-muted-foreground">
                עדיין לא הוספת מינויים. לחץ על "הוסף מינוי" כדי להתחיל!
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}