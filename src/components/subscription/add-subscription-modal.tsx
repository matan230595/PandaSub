
"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useSubscriptions } from "@/context/subscriptions-context"
import { CATEGORY_METADATA, SubscriptionCategory, SubscriptionStatus, PRIORITY_CONFIG, Subscription } from "@/app/lib/subscription-store"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Key, Mail, Phone, AlertCircle, Copy, Trash2, Save, X } from "lucide-react"

const formSchema = z.object({
  name: z.string().min(2, { message: "שם המינוי חייב להכיל לפחות 2 תווים" }),
  category: z.string(),
  amount: z.coerce.number().min(0.1, { message: "הסכום חייב להיות גדול מ-0" }),
  renewalDate: z.string().min(1, { message: "חובה להזין תאריך חידוש" }),
  status: z.string(),
  priority: z.string(),
  trialEndsAt: z.string().optional(),
  autoCancelDate: z.string().optional(),
  cancelLeadDays: z.coerce.number().min(0).max(30).optional(),
  notes: z.string().optional(),
  username: z.string().optional(),
  email: z.string().optional(),
  password: z.string().optional(),
  phone: z.string().optional(),
})

interface AddSubscriptionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subscription?: Subscription | null // null for Add mode
}

export function AddSubscriptionModal({ open, onOpenChange, subscription }: AddSubscriptionModalProps) {
  const { addSubscription, updateSubscription, deleteSubscription, duplicateSubscription } = useSubscriptions()
  const { toast } = useToast()
  const isEdit = !!subscription
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: {
      name: subscription?.name || "",
      category: subscription?.category || "streaming",
      amount: subscription?.amount || 0,
      renewalDate: subscription?.renewalDate || new Date().toISOString().split('T')[0],
      status: subscription?.status || "active",
      priority: subscription?.priority || "none",
      trialEndsAt: subscription?.trialEndsAt || "",
      autoCancelDate: subscription?.autoCancelDate || "",
      cancelLeadDays: subscription?.cancelLeadDays || 3,
      notes: subscription?.notes || "",
      username: subscription?.credentials?.username || "",
      email: subscription?.credentials?.email || "",
      password: subscription?.credentials?.password || "",
      phone: subscription?.credentials?.phone || "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    const data = {
      name: values.name,
      category: values.category as SubscriptionCategory,
      amount: values.amount,
      currency: "₪",
      renewalDate: values.renewalDate,
      status: values.status as SubscriptionStatus,
      priority: values.priority as any,
      trialEndsAt: values.trialEndsAt || undefined,
      autoCancelDate: values.autoCancelDate || undefined,
      cancelLeadDays: values.cancelLeadDays,
      notes: values.notes || undefined,
      credentials: {
        username: values.username,
        email: values.email,
        password: values.password,
        phone: values.phone,
      }
    }

    if (isEdit && subscription) {
      updateSubscription(subscription.id, data)
      toast({ title: "המינוי עודכן בהצלחה" })
    } else {
      addSubscription(data)
      toast({ title: "המינוי נוסף בהצלחה" })
    }
    
    onOpenChange(false)
    form.reset()
  }

  const handleDuplicate = () => {
    if (subscription) {
      duplicateSubscription(subscription.id)
      toast({ title: "המינוי שוכפל" })
      onOpenChange(false)
    }
  }

  const handleDelete = () => {
    if (subscription) {
      deleteSubscription(subscription.id)
      toast({ title: "המינוי נמחק" })
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] text-right p-0 overflow-hidden border-none card-shadow">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="p-6 bg-primary/5 border-b flex items-center justify-between flex-row-reverse">
              <DialogHeader className="p-0">
                <DialogTitle className="text-xl font-bold">{isEdit ? "פרטי מינוי" : "הוסף מינוי חדש"}</DialogTitle>
                <DialogDescription className="text-right">
                  {isEdit ? "נהל את פרטי המינוי, התראות ופרטי גישה" : "הזן את פרטי המינוי כדי להתחיל לעקוב"}
                </DialogDescription>
              </DialogHeader>
              {isEdit && (
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" size="icon" className="rounded-full h-9 w-9" onClick={handleDuplicate} title="שכפל מינוי">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="outline" size="icon" className="rounded-full h-9 w-9 text-destructive hover:bg-destructive/10" onClick={handleDelete} title="מחק מינוי">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="p-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6 bg-muted/50 p-1 rounded-xl">
                  <TabsTrigger value="basic" className="rounded-lg">בסיסי</TabsTrigger>
                  <TabsTrigger value="advanced" className="rounded-lg">ניהול חכם</TabsTrigger>
                  <TabsTrigger value="credentials" className="rounded-lg">התחברות</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4 animate-fade-in">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>שם המינוי</FormLabel>
                        <FormControl>
                          <Input placeholder="לדוגמה: Netflix" className="rounded-xl h-12" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>סכום (₪)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" className="rounded-xl h-12" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="renewalDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>תאריך חידוש</FormLabel>
                          <FormControl>
                            <Input type="date" className="rounded-xl h-12" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>קטגוריה</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="rounded-xl h-12">
                              <SelectValue placeholder="בחר קטגוריה" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-xl">
                            {Object.entries(CATEGORY_METADATA).map(([key, value]) => (
                              <SelectItem key={key} value={key} className="text-right py-3">
                                {value.icon} {value.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="advanced" className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>סטטוס</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="rounded-xl h-12">
                                <SelectValue placeholder="סטטוס" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-xl">
                              <SelectItem value="active" className="text-right">פעיל</SelectItem>
                              <SelectItem value="trial" className="text-right">תקופת ניסיון</SelectItem>
                              <SelectItem value="frozen" className="text-right">מוקפא</SelectItem>
                              <SelectItem value="not_in_use" className="text-right">לא בשימוש</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>עדיפות תזכורות</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="rounded-xl h-12">
                                <SelectValue placeholder="עדיפות" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-xl">
                              {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                                <SelectItem key={key} value={key} className="text-right">
                                  <span className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: config.color }} />
                                    {config.label}
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="trialEndsAt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>סיום תקופת ניסיון</FormLabel>
                          <FormControl>
                            <Input type="date" className="rounded-xl h-12" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="cancelLeadDays"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ביטול יזום (ימים מראש)</FormLabel>
                          <FormControl>
                            <Input type="number" className="rounded-xl h-12" {...field} />
                          </FormControl>
                          <FormDescription>מתי להזכיר לך לבטל?</FormDescription>
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="autoCancelDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>תאריך ביטול אוטומטי מתוכנן</FormLabel>
                        <FormControl>
                          <Input type="date" className="rounded-xl h-12" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="credentials" className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <User className="h-3 w-3" /> שם משתמש
                          </FormLabel>
                          <FormControl>
                            <Input className="rounded-xl h-12" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Mail className="h-3 w-3" /> אימייל
                          </FormLabel>
                          <FormControl>
                            <Input type="email" className="rounded-xl h-12" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Key className="h-3 w-3" /> סיסמה
                          </FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" className="rounded-xl h-12 text-left" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Phone className="h-3 w-3" /> נייד
                          </FormLabel>
                          <FormControl>
                            <Input className="rounded-xl h-12" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>הערות ומידע נוסף</FormLabel>
                        <FormControl>
                          <Textarea placeholder="למשל: תנאי ביטול, קוד קופון וכו'..." className="rounded-xl min-h-[100px] text-right" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </TabsContent>
              </Tabs>
            </div>

            <DialogFooter className="p-6 bg-muted/20 flex-row-reverse gap-3">
              <Button type="submit" className="bg-primary hover:bg-primary/90 rounded-full px-8 h-12 gap-2 shadow-lg shadow-primary/20">
                <Save className="h-4 w-4" /> {isEdit ? "שמור שינויים" : "שמור מינוי"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="rounded-full h-12 px-6">
                ביטול
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
