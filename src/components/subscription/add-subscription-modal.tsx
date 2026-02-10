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
import { User, Key, Mail, Phone, Copy, Trash2, Save, FileText } from "lucide-react"

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
  subscription?: Subscription | null
}

export function AddSubscriptionModal({ open, onOpenChange, subscription }: AddSubscriptionModalProps) {
  const { addSubscription, updateSubscription, deleteSubscription, duplicateSubscription } = useSubscriptions()
  const { toast } = useToast()
  const isEdit = !!subscription
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      category: "streaming",
      amount: 0,
      renewalDate: new Date().toISOString().split('T')[0],
      status: "active",
      priority: "none",
      trialEndsAt: "",
      autoCancelDate: "",
      cancelLeadDays: 3,
      notes: "",
      username: "",
      email: "",
      password: "",
      phone: "",
    },
  })

  // טעינת נתונים בעת עריכה
  React.useEffect(() => {
    if (open && subscription) {
      form.reset({
        name: subscription.name,
        category: subscription.category,
        amount: subscription.amount,
        renewalDate: subscription.renewalDate,
        status: subscription.status,
        priority: subscription.priority || "none",
        trialEndsAt: subscription.trialEndsAt || "",
        autoCancelDate: subscription.autoCancelDate || "",
        cancelLeadDays: subscription.cancelLeadDays || 3,
        notes: subscription.notes || "",
        username: subscription.credentials?.username || "",
        email: subscription.credentials?.email || "",
        password: subscription.credentials?.password || "",
        phone: subscription.credentials?.phone || "",
      })
    } else if (open && !subscription) {
      form.reset({
        name: "",
        category: "streaming",
        amount: 0,
        renewalDate: new Date().toISOString().split('T')[0],
        status: "active",
        priority: "none",
        trialEndsAt: "",
        autoCancelDate: "",
        cancelLeadDays: 3,
        notes: "",
        username: "",
        email: "",
        password: "",
        phone: "",
      })
    }
  }, [open, subscription, form])

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
      <DialogContent className="sm:max-w-[650px] text-right p-0 overflow-hidden border-none shadow-2xl rounded-[2.5rem]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="p-8 bg-primary/5 border-b flex items-center justify-between flex-row-reverse">
              <div className="text-right">
                <DialogTitle className="text-2xl font-black">{isEdit ? "ניהול מינוי" : "הוסף מינוי חדש"}</DialogTitle>
                <DialogDescription className="text-right mt-1 font-medium">
                  {isEdit ? "עריכת הגדרות, התראות ופרטי גישה" : "הזן את פרטי המינוי כדי להתחיל לעקוב"}
                </DialogDescription>
              </div>
              {isEdit && (
                <div className="flex items-center gap-3">
                  <Button type="button" variant="outline" size="icon" className="rounded-full h-10 w-10 shadow-sm" onClick={handleDuplicate}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="outline" size="icon" className="rounded-full h-10 w-10 text-destructive hover:bg-destructive/10 border-destructive/20 shadow-sm" onClick={handleDelete}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="p-8">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-8 bg-muted/50 p-1.5 rounded-2xl h-14">
                  <TabsTrigger value="basic" className="rounded-xl font-bold text-base">בסיסי</TabsTrigger>
                  <TabsTrigger value="advanced" className="rounded-xl font-bold text-base">ניהול חכם</TabsTrigger>
                  <TabsTrigger value="credentials" className="rounded-xl font-bold text-base">התחברות</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="text-right">
                        <FormLabel className="text-base font-bold">שם המינוי</FormLabel>
                        <FormControl>
                          <Input placeholder="לדוגמה: Netflix" className="rounded-xl h-12 text-lg text-right" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem className="text-right">
                          <FormLabel className="text-base font-bold">סכום (₪)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" className="rounded-xl h-12 text-lg text-right" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="renewalDate"
                      render={({ field }) => (
                        <FormItem className="text-right">
                          <FormLabel className="text-base font-bold">תאריך חידוש</FormLabel>
                          <FormControl>
                            <Input type="date" className="rounded-xl h-12 text-lg text-right" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem className="text-right">
                        <FormLabel className="text-base font-bold">קטגוריה</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="rounded-xl h-12 text-lg flex-row-reverse">
                              <SelectValue placeholder="בחר קטגוריה" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-xl">
                            {Object.entries(CATEGORY_METADATA).map(([key, value]) => (
                              <SelectItem key={key} value={key} className="text-right py-3 flex-row-reverse">
                                <span className="flex items-center gap-2 flex-row-reverse">
                                  <span>{value.icon}</span>
                                  <span>{value.label}</span>
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="advanced" className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem className="text-right">
                          <FormLabel className="text-base font-bold">סטטוס</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="rounded-xl h-12 text-lg flex-row-reverse">
                                <SelectValue placeholder="סטטוס" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-xl">
                              <SelectItem value="active" className="text-right py-3">פעיל</SelectItem>
                              <SelectItem value="trial" className="text-right py-3">תקופת ניסיון</SelectItem>
                              <SelectItem value="frozen" className="text-right py-3">מוקפא</SelectItem>
                              <SelectItem value="not_in_use" className="text-right py-3">לא בשימוש</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem className="text-right">
                          <FormLabel className="text-base font-bold">עדיפות תזכורות</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="rounded-xl h-12 text-lg flex-row-reverse">
                                <SelectValue placeholder="עדיפות" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-xl">
                              {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                                <SelectItem key={key} value={key} className="text-right py-3">
                                  <span className="flex items-center gap-2 flex-row-reverse justify-end">
                                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: config.color }} />
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
                  
                  <div className="grid grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="trialEndsAt"
                      render={({ field }) => (
                        <FormItem className="text-right">
                          <FormLabel className="text-base font-bold">סיום תקופת ניסיון</FormLabel>
                          <FormControl>
                            <Input type="date" className="rounded-xl h-12 text-lg text-right" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="cancelLeadDays"
                      render={({ field }) => (
                        <FormItem className="text-right">
                          <FormLabel className="text-base font-bold">ביטול יזום (ימים מראש)</FormLabel>
                          <FormControl>
                            <Input type="number" className="rounded-xl h-12 text-lg text-right" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="credentials" className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem className="text-right">
                          <FormLabel className="flex items-center gap-1.5 justify-end text-base font-bold"><User className="h-4 w-4" /> שם משתמש</FormLabel>
                          <FormControl><Input className="rounded-xl h-12 text-lg text-right" {...field} /></FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="text-right">
                          <FormLabel className="flex items-center gap-1.5 justify-end text-base font-bold"><Mail className="h-4 w-4" /> אימייל</FormLabel>
                          <FormControl><Input type="email" className="rounded-xl h-12 text-lg text-right" {...field} /></FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem className="text-right">
                          <FormLabel className="flex items-center gap-1.5 justify-end text-base font-bold"><Key className="h-4 w-4" /> סיסמה</FormLabel>
                          <FormControl><Input type="password" placeholder="••••••••" className="rounded-xl h-12 text-lg text-left" {...field} /></FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem className="text-right">
                          <FormLabel className="flex items-center gap-1.5 justify-end text-base font-bold"><Phone className="h-4 w-4" /> נייד</FormLabel>
                          <FormControl><Input className="rounded-xl h-12 text-lg text-right" {...field} /></FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem className="text-right">
                        <FormLabel className="flex items-center gap-1.5 justify-end text-base font-bold"><FileText className="h-4 w-4" /> הערות נוספות</FormLabel>
                        <FormControl>
                          <Textarea placeholder="קוד קופון, תנאי ביטול או הערות מיוחדות..." className="rounded-xl min-h-[100px] text-lg text-right p-4" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </TabsContent>
              </Tabs>
            </div>

            <DialogFooter className="p-8 bg-muted/20 gap-4 flex-row-reverse sm:justify-start">
              <Button type="submit" className="bg-primary hover:bg-primary/90 rounded-full px-10 h-14 text-lg font-bold gap-3 shadow-xl shadow-primary/20">
                <Save className="h-5 w-5" /> {isEdit ? "שמור שינויים" : "שמור מינוי"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="rounded-full h-14 px-8 text-lg font-medium">
                ביטול וסגירה
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
