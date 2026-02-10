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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useSubscriptions } from "@/context/subscriptions-context"
import { CATEGORY_METADATA, SubscriptionCategory, SubscriptionStatus, PRIORITY_CONFIG, Subscription } from "@/app/lib/subscription-store"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Key, Mail, Phone, Copy, Trash2, Save, FileText, AlertTriangle, Bell, CreditCard, RefreshCw } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

const formSchema = z.object({
  name: z.string().min(2, { message: "שם המינוי חייב להכיל לפחות 2 תווים" }),
  category: z.string(),
  amount: z.coerce.number().min(0.1, { message: "הסכום חייב להיות גדול מ-0" }),
  renewalDate: z.string().min(1, { message: "חובה להזין תאריך חידוש" }),
  billingCycle: z.enum(["monthly", "yearly"]),
  paymentMethod: z.string().optional(),
  reminderDays: z.array(z.number()),
  status: z.string(),
  priority: z.string(),
  trialEndsAt: z.string().optional(),
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

const REMINDER_OPTIONS = [
  { label: "באותו היום", value: 0 },
  { label: "יום לפני", value: 1 },
  { label: "3 ימים לפני", value: 3 },
  { label: "שבוע לפני", value: 7 },
  { label: "10 ימים לפני", value: 10 },
  { label: "שבועיים לפני", value: 14 },
  { label: "חודש לפני", value: 30 },
]

export function AddSubscriptionModal({ open, onOpenChange, subscription }: AddSubscriptionModalProps) {
  const { addSubscription, updateSubscription, deleteSubscription, duplicateSubscription } = useSubscriptions()
  const { toast } = useToast()
  const [showDeleteAlert, setShowDeleteAlert] = React.useState(false)
  const isEdit = !!subscription
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      category: "streaming",
      amount: 0,
      renewalDate: new Date().toISOString().split('T')[0],
      billingCycle: "monthly",
      paymentMethod: "",
      reminderDays: [3],
      status: "active",
      priority: "none",
      trialEndsAt: "",
      notes: "",
      username: "",
      email: "",
      password: "",
      phone: "",
    },
  })

  React.useEffect(() => {
    if (open && subscription) {
      form.reset({
        name: subscription.name,
        category: subscription.category,
        amount: subscription.amount,
        renewalDate: subscription.renewalDate,
        billingCycle: subscription.billingCycle,
        paymentMethod: subscription.paymentMethod || "",
        reminderDays: subscription.reminderDays || [3],
        status: subscription.status,
        priority: subscription.priority || "none",
        trialEndsAt: subscription.trialEndsAt || "",
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
        billingCycle: "monthly",
        paymentMethod: "",
        reminderDays: [3],
        status: "active",
        priority: "none",
        trialEndsAt: "",
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
      billingCycle: values.billingCycle,
      paymentMethod: values.paymentMethod,
      reminderDays: values.reminderDays,
      status: values.status as SubscriptionStatus,
      priority: values.priority as any,
      trialEndsAt: values.trialEndsAt || undefined,
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

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] text-right p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col max-h-[90vh]">
              <DialogHeader className="p-6 bg-primary/5 border-b flex flex-row items-center justify-between">
                <div className="flex-1">
                  <DialogTitle className="text-2xl font-black">
                    {isEdit ? "עריכת מינוי" : "הוספת מינוי חדש"}
                  </DialogTitle>
                  <DialogDescription className="text-sm mt-1">
                    {isEdit ? "נהל את פרטי החיוב והתזכורות שלך" : "הזן את פרטי המינוי כדי להתחיל לעקוב"}
                  </DialogDescription>
                </div>
                {isEdit && (
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" size="icon" className="h-10 w-10 rounded-2xl shadow-sm" onClick={() => duplicateSubscription(subscription!.id)} title="שכפל">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="outline" size="icon" className="h-10 w-10 rounded-2xl text-destructive hover:bg-destructive/10 border-destructive/20 shadow-sm" onClick={() => setShowDeleteAlert(true)} title="מחק">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </DialogHeader>

              <ScrollArea className="flex-1 p-6">
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-4 mb-8 bg-muted/50 p-1.5 rounded-2xl h-14">
                    <TabsTrigger value="basic" className="rounded-xl font-bold">בסיסי</TabsTrigger>
                    <TabsTrigger value="billing" className="rounded-xl font-bold">חיוב</TabsTrigger>
                    <TabsTrigger value="reminders" className="rounded-xl font-bold">תזכורות</TabsTrigger>
                    <TabsTrigger value="security" className="rounded-xl font-bold">אבטחה</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="basic" className="space-y-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem className="text-right">
                          <FormLabel className="text-base font-bold">שם המינוי</FormLabel>
                          <FormControl>
                            <Input placeholder="לדוגמה: Netflix, Spotify, חדר כושר..." className="rounded-xl h-12 text-right text-lg" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem className="text-right">
                            <FormLabel className="text-base font-bold">קטגוריה</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="rounded-xl h-12 flex-row-reverse">
                                  <SelectValue placeholder="בחר קטגוריה" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="rounded-xl">
                                {Object.entries(CATEGORY_METADATA).map(([key, value]) => (
                                  <SelectItem key={key} value={key} className="text-right py-3">
                                    <span className="flex items-center gap-3 flex-row-reverse justify-end">
                                      <span className="text-xl">{value.icon}</span>
                                      <span className="font-bold">{value.label}</span>
                                    </span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem className="text-right">
                            <FormLabel className="text-base font-bold">סטטוס</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="rounded-xl h-12 flex-row-reverse">
                                  <SelectValue placeholder="סטטוס" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="rounded-xl">
                                <SelectItem value="active" className="text-right font-bold text-green-600">פעיל</SelectItem>
                                <SelectItem value="trial" className="text-right font-bold text-orange-500">תקופת ניסיון</SelectItem>
                                <SelectItem value="frozen" className="text-right font-bold text-blue-500">מוקפא</SelectItem>
                                <SelectItem value="not_in_use" className="text-right font-bold text-amber-500">לא בשימוש</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="billing" className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem className="text-right">
                            <FormLabel className="text-base font-bold">סכום לחיוב</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input type="number" step="0.01" className="rounded-xl h-12 pr-12 text-right text-lg font-black" {...field} />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">₪</span>
                              </div>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="billingCycle"
                        render={({ field }) => (
                          <FormItem className="text-right">
                            <FormLabel className="text-base font-bold">מחזור חיוב</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="rounded-xl h-12 flex-row-reverse">
                                  <SelectValue placeholder="בחר מחזור" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="rounded-xl">
                                <SelectItem value="monthly" className="text-right font-bold">חודשי</SelectItem>
                                <SelectItem value="yearly" className="text-right font-bold">שנתי</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="renewalDate"
                        render={({ field }) => (
                          <FormItem className="text-right">
                            <FormLabel className="text-base font-bold">תאריך חידוש קרוב</FormLabel>
                            <FormControl>
                              <Input type="date" className="rounded-xl h-12 text-right" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="paymentMethod"
                        render={({ field }) => (
                          <FormItem className="text-right">
                            <FormLabel className="text-base font-bold">אמצעי תשלום</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input placeholder="לדוגמה: ויזה 4242" className="rounded-xl h-12 pr-12 text-right" {...field} />
                                <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                              </div>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="reminders" className="space-y-6">
                    <FormItem className="text-right">
                      <div className="flex items-center gap-2 flex-row-reverse justify-start mb-4">
                        <Bell className="h-5 w-5 text-primary" />
                        <FormLabel className="text-lg font-black">התראות ותזכורות</FormLabel>
                      </div>
                      <FormDescription className="mb-6">בחר מתי תרצה ש-PandaSub יזכיר לך על החיוב הקרוב:</FormDescription>
                      
                      <FormField
                        control={form.control}
                        name="reminderDays"
                        render={() => (
                          <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-2xl border border-border/50">
                            {REMINDER_OPTIONS.map((option) => (
                              <FormField
                                key={option.value}
                                control={form.control}
                                name="reminderDays"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={option.value}
                                      className="flex flex-row-reverse items-center justify-between space-y-0 gap-3 hover:bg-white p-2 rounded-xl transition-colors cursor-pointer"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(option.value)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...field.value, option.value])
                                              : field.onChange(
                                                  field.value?.filter(
                                                    (value: number) => value !== option.value
                                                  )
                                                )
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-bold cursor-pointer">{option.label}</FormLabel>
                                    </FormItem>
                                  )
                                }}
                              />
                            ))}
                          </div>
                        )}
                      />
                    </FormItem>
                    
                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem className="text-right">
                          <FormLabel className="text-base font-bold">רמת דחיפות (Priority)</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="rounded-xl h-12 flex-row-reverse">
                                <SelectValue placeholder="בחר עדיפות" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-xl">
                              {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                                <SelectItem key={key} value={key} className="text-right py-3">
                                  <span className="flex items-center gap-3 flex-row-reverse justify-end">
                                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: config.color }} />
                                    <span className="font-bold">{config.label}</span>
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </TabsContent>

                  <TabsContent value="security" className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem className="text-right">
                            <FormLabel className="flex items-center gap-2 justify-end text-sm font-bold"><User className="h-4 w-4" /> שם משתמש</FormLabel>
                            <FormControl><Input className="rounded-xl h-11 text-right" {...field} /></FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem className="text-right">
                            <FormLabel className="flex items-center gap-2 justify-end text-sm font-bold"><Mail className="h-4 w-4" /> אימייל לחשבון</FormLabel>
                            <FormControl><Input type="email" className="rounded-xl h-11 text-right" {...field} /></FormControl>
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
                            <FormLabel className="flex items-center gap-2 justify-end text-sm font-bold"><Key className="h-4 w-4" /> סיסמה</FormLabel>
                            <FormControl><Input type="password" placeholder="••••" className="rounded-xl h-11 text-left" {...field} /></FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem className="text-right">
                            <FormLabel className="flex items-center gap-2 justify-end text-sm font-bold"><Phone className="h-4 w-4" /> טלפון לזיהוי</FormLabel>
                            <FormControl><Input className="rounded-xl h-11 text-right" {...field} /></FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem className="text-right">
                          <FormLabel className="flex items-center gap-2 justify-end text-sm font-bold"><FileText className="h-4 w-4" /> הערות וקופונים</FormLabel>
                          <FormControl>
                            <Textarea placeholder="כתוב כאן הערות חשובות, קודי קופון או פרטים נוספים..." className="rounded-xl min-h-[120px] text-right p-4" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                </Tabs>
              </ScrollArea>

              <DialogFooter className="p-6 bg-muted/20 gap-4 flex-row-reverse sm:justify-start">
                <Button type="submit" className="bg-primary hover:bg-primary/90 rounded-full px-12 h-14 text-lg font-black gap-3 shadow-xl shadow-primary/20 transition-all active:scale-95">
                  <Save className="h-5 w-5" /> {isEdit ? "עדכן שינויים" : "שמור מינוי חדש"}
                </Button>
                <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="rounded-full h-14 px-8 text-base font-bold">
                  ביטול
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent className="text-right rounded-[2rem] border-none shadow-2xl p-8" dir="rtl">
          <AlertDialogHeader className="items-center">
            <div className="h-24 w-24 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-6 animate-bounce">
              <AlertTriangle className="h-12 w-12" />
            </div>
            <AlertDialogTitle className="text-3xl font-black">למחוק את המינוי?</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-muted-foreground text-lg leading-relaxed">
              האם אתה בטוח שברצונך למחוק את <strong>{subscription?.name}</strong>? כל המידע, הערות וההתראות יימחקו לצמיתות.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center flex-row-reverse gap-4 mt-10">
            <AlertDialogAction onClick={() => { deleteSubscription(subscription!.id); onOpenChange(false); }} className="bg-destructive hover:bg-destructive/90 rounded-full px-10 h-14 text-lg font-black shadow-xl shadow-destructive/20">
              כן, מחק מינוי
            </AlertDialogAction>
            <AlertDialogCancel className="rounded-full h-14 px-10 text-lg font-bold">ביטול</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}