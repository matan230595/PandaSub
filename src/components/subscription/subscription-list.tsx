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
import { MoreHorizontal, Calendar, CreditCard, Trash2, Edit2 } from "lucide-react"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { SAMPLE_SUBSCRIPTIONS, CATEGORY_METADATA } from "@/app/lib/subscription-store"

export function SubscriptionList() {
  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="text-right">מינוי</TableHead>
            <TableHead className="text-right">קטגוריה</TableHead>
            <TableHead className="text-right">מחיר</TableHead>
            <TableHead className="text-right">חידוש הבא</TableHead>
            <TableHead className="text-right">סטטוס</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {SAMPLE_SUBSCRIPTIONS.map((sub) => (
            <TableRow key={sub.id} className="hover:bg-muted/30 transition-colors">
              <TableCell className="font-medium">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-xl shadow-sm">
                    {CATEGORY_METADATA[sub.category].icon}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{sub.name}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <CreditCard className="h-3 w-3" /> חיוב חודשי
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="font-normal border-primary/20 bg-primary/5 text-primary">
                  {CATEGORY_METADATA[sub.category].label}
                </Badge>
              </TableCell>
              <TableCell className="font-bold">
                {sub.amount} {sub.currency}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {new Date(sub.renewalDate).toLocaleDateString('he-IL')}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={sub.status === 'active' ? 'default' : 'secondary'} className="rounded-full">
                  {sub.status === 'active' ? 'פעיל' : sub.status === 'trial' ? 'ניסיון' : 'מושבת'}
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="text-right">
                    <DropdownMenuItem className="gap-2 flex-row-reverse">
                      עריכה <Edit2 className="h-4 w-4" />
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 flex-row-reverse text-destructive">
                      ביטול מינוי <Trash2 className="h-4 w-4" />
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
