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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useSubscriptions } from "@/context/subscriptions-context"
import { CATEGORY_METADATA, SubscriptionCategory, SubscriptionStatus, PRIORITY_CONFIG } from "@/app/lib/subscription-store"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Key, Mail, Phone, AlertCircle } from "lucide-react"

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

export function AddSubscriptionModal({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const { addSubscription } = useSubscriptions()
  const { toast } = useToast()
  
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

  function onSubmit(values: z.infer<typeof formSchema>) {
    addSubscription({
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
    })
    
    toast({
      title: "המינוי נוסף בהצלחה!",
      description: `${values.name} זמין כעת ברשימה שלך.`,
    })
    
    onOpenChange(false)
    form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] text-right">
        <DialogHeader>
          <DialogTitle>הוסף מינוי חדש</DialogTitle>
          <DialogDescription>
            הזן את פרטי המינוי כדי להתחיל לעקוב אחריו עם מערכת התזכורות החכמה.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="basic">בסיסי</TabsTrigger>
                <TabsTrigger value="advanced">מתקדם</TabsTrigger>
                <TabsTrigger value="credentials">התחברות</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>שם המינוי</FormLabel>
                      <FormControl>
                        <Input placeholder="לדוגמה: Netflix" {...field} />
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
                          <Input type="number" step="0.01" {...field} />
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
                          <Input type="date" {...field} />
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
                          <SelectTrigger>
                            <SelectValue placeholder="בחר קטגוריה" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(CATEGORY_METADATA).map(([key, value]) => (
                            <SelectItem key={key} value={key} className="text-right">
                              {value.icon} {value.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>סטטוס</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="סטטוס" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">פעיל</SelectItem>
                            <SelectItem value="trial">תקופת ניסיון</SelectItem>
                            <SelectItem value="frozen">מוקפא</SelectItem>
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
                            <SelectTrigger>
                              <SelectValue placeholder="עדיפות" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
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
                          <Input type="date" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cancelLeadDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>התראת ביטול יזום (ימים מראש)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormDescription>כמה ימים לפני החיוב להזכיר לך לבטל?</FormDescription>
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>הערות</FormLabel>
                      <FormControl>
                        <Input placeholder="מידע נוסף..." {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="credentials" className="space-y-4">
                <div className="bg-primary/5 p-4 rounded-xl flex items-start gap-3 mb-4">
                  <AlertCircle className="h-5 w-5 text-primary shrink-0" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    כאן תוכל לשמור את פרטי ההתחברות לשירות. הנתונים נשמרים מקומית על המכשיר שלך בלבד.
                  </p>
                </div>
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
                          <Input {...field} />
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
                          <Input type="email" {...field} />
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
                          <Input type="password" {...field} />
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
                          <Phone className="h-3 w-3" /> נייד לגיבוי
                        </FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-6 flex-row-reverse gap-2">
              <Button type="submit" className="bg-primary hover:bg-primary/90 rounded-full px-8 h-12">שמור מינוי</Button>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-full h-12">ביטול</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
