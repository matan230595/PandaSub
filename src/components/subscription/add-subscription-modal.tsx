"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
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
import { CATEGORY_METADATA, SubscriptionCategory, SubscriptionStatus, Subscription, PRIORITY_CONFIG } from "@/app/lib/subscription-store"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Key, FileText, AlertTriangle, Clock, Sparkles, Loader2, Save, Copy, Trash2, CalendarRange, CreditCard, Mail, Phone } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { addDays } from "date-fns"
import { extractSubscriptionFromInvoice } from "@/ai/flows/invoice-extraction-flow"

const formSchema = z.object({
  name: z.string().min(2, { message: "שם המינוי חייב להכיל לפחות 2 תווים" }),
  category: z.string(),
  amount: z.coerce.number().min(0.01, { message: "הסכום חייב להיות גדול מ-0" }),
  currency: z.string(),
  renewalDate: z.string().min(1, { message: "חובה להזין תאריך חידוש" }),
  billingCycle: z.enum(["monthly", "yearly"]),
  paymentMethod: z.string().optional(),
  reminderDays: z.array(z.number()),
  status: z.string(),
  priority: z.string(),
  notes: z.string().optional(),
  username: z.string().optional(),
  email: z.string().optional(),
  password: z.string().optional(),
  phone: z.string().optional(),
  durationMonths: z.coerce.number().optional(),
  trialPeriodDays: z.coerce.number().optional(),
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
]

export function AddSubscriptionModal({ open, onOpenChange, subscription }: AddSubscriptionModalProps) {
  const { addSubscription, updateSubscription, deleteSubscription, duplicateSubscription } = useSubscriptions()
  const { toast } = useToast()
  const [showDeleteAlert, setShowDeleteAlert] = React.useState(false)
  const [isAiLoading, setIsAiLoading] = React.useState(false)
  const isEdit = !!subscription
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      category: "streaming",
      amount: 0,
      currency: "₪",
      renewalDate: new Date().toISOString().split('T')[0],
      billingCycle: "monthly",
      paymentMethod: "",
      reminderDays: [3],
      status: "active",
      priority: "none",
      notes: "",
      username: "",
      email: "",
      password: "",
      phone: "",
      durationMonths: 1,
      trialPeriodDays: 14,
    },
  })

  const watchStatus = form.watch("status")
  const watchCycle = form.watch("billingCycle")

  React.useEffect(() => {
    if (open) {
      if (subscription) {
        form.reset({
          name: subscription.name,
          category: subscription.category,
          amount: subscription.amount,
          currency: subscription.currency || "₪",
          renewalDate: subscription.renewalDate,
          billingCycle: subscription.billingCycle,
          paymentMethod: subscription.paymentMethod || "",
          reminderDays: subscription.reminderDays || [3],
          status: subscription.status,
          priority: subscription.priority || "none",
          notes: subscription.notes || "",
          username: subscription.credentials?.username || "",
          email: subscription.credentials?.email || "",
          password: subscription.credentials?.password || "",
          phone: subscription.credentials?.phone || "",
          durationMonths: subscription.durationMonths || 1,
          trialPeriodDays: subscription.trialPeriodDays || 14,
        })
      } else {
        form.reset({
          name: "",
          category: "streaming",
          amount: 0,
          currency: "₪",
          renewalDate: new Date().toISOString().split('T')[0],
          billingCycle: "monthly",
          paymentMethod: "",
          reminderDays: [3],
          status: "active",
          priority: "none",
          notes: "",
          username: "",
          email: "",
          password: "",
          phone: "",
          durationMonths: 1,
          trialPeriodDays: 14,
        })
      }
    }
  }, [open, subscription, form])

  const handleAiScan = async () => {
    const text = prompt("הדבק כאן את הטקסט מהחשבונית או מהמייל:");
    if (!text) return;

    setIsAiLoading(true);
    try {
      const result = await extractSubscriptionFromInvoice({ invoiceText: text });
      form.setValue('name', result.subscriptionName);
      form.setValue('amount', result.amount);
      form.setValue('currency', result.currency);
      form.setValue('renewalDate', result.renewalDate);
      if (result.category in CATEGORY_METADATA) {
        form.setValue('category', result.category);
      }
      toast({ title: "הנתונים חולצו בהצלחה", description: "ה-AI מילא את השדות עבורך." });
    } catch (e) {
      toast({ title: "שגיאה בסריקה", description: "לא הצלחנו לחלץ נתונים.", variant: "destructive" });
    } finally {
      setIsAiLoading(false);
    }
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    let trialEndsAt = undefined;
    if (values.status === 'trial' && values.trialPeriodDays) {
      trialEndsAt = addDays(new Date(values.renewalDate), values.trialPeriodDays).toISOString().split('T')[0];
    }

    const data = {
      name: values.name,
      category: values.category as SubscriptionCategory,
      amount: values.amount,
      currency: values.currency,
      renewalDate: values.renewalDate,
      billingCycle: values.billingCycle,
      paymentMethod: values.paymentMethod || "",
      reminderDays: values.reminderDays,
      status: values.status as SubscriptionStatus,
      priority: values.priority as any,
      notes: values.notes || "",
      durationMonths: values.durationMonths,
      trialPeriodDays: values.trialPeriodDays,
      trialEndsAt,
      credentials: {
        username: values.username || "",
        email: values.email || "",
        password: values.password || "",
        phone: values.phone || "",
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

  function onFormError(errors: any) {
    console.log("Form Errors:", errors);
    const firstError = Object.values(errors)[0] as any;
    toast({
      variant: "destructive",
      title: "חסרים פרטים בטופס",
      description: firstError?.message || "אנא מלא את כל שדות החובה המסומנים.",
    });
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[650px] max-h-[90vh] text-right p-0 overflow-hidden border-none shadow-2xl rounded-[2.5rem]" aria-describedby="add-sub-description">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, onFormError)} className="flex flex-col max-h-[90vh]">
              <DialogHeader className="p-8 bg-primary/5 border-b">
                <div className="flex items-center justify-between">
                  <div className="text-right">
                    <DialogTitle className="text-3xl font-black text-primary">
                      {isEdit ? "עריכת מינוי" : "הוספת מינוי חדש"}
                    </DialogTitle>
                    <DialogDescription id="add-sub-description" className="text-muted-foreground mt-1">
                      נהל את המינוי שלך בצורה חכמה עם תזכורות ונתוני גישה
                    </DialogDescription>
                  </div>
                  {!isEdit && (
                    <Button type="button" variant="outline" onClick={handleAiScan} disabled={isAiLoading} className="rounded-full gap-2 border-primary/30 bg-white text-primary font-bold h-10 px-4">
                      {isAiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} סריקה חכמה
                    </Button>
                  )}
                </div>
              </DialogHeader>

              <ScrollArea className="flex-1 px-8 py-6">
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-4 mb-8 bg-muted/50 p-1.5 rounded-2xl h-14">
                    <TabsTrigger value="basic" className="rounded-xl font-bold">מידע</TabsTrigger>
                    <TabsTrigger value="billing" className="rounded-xl font-bold">חיוב</TabsTrigger>
                    <TabsTrigger value="reminders" className="rounded-xl font-bold">תזכורות</TabsTrigger>
                    <TabsTrigger value="security" className="rounded-xl font-bold">גישה</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="basic" className="space-y-6 animate-fade-in">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem className="text-right">
                          <FormLabel className="text-base font-bold">שם המינוי *</FormLabel>
                          <FormControl>
                            <Input placeholder="למשל: Netflix" className="rounded-xl h-14 text-right text-lg border-primary/10" {...field} />
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
                                <SelectTrigger className="rounded-xl h-14 flex-row-reverse text-right bg-muted/20 border-none">
                                  <SelectValue placeholder="בחר קטגוריה" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Object.entries(CATEGORY_METADATA).map(([key, value]) => (
                                  <SelectItem key={key} value={key} className="text-right">{value.icon} {value.label}</SelectItem>
                                ))}
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
                            <FormLabel className="text-base font-bold">עדיפות</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="rounded-xl h-14 flex-row-reverse text-right bg-muted/20 border-none">
                                  <SelectValue placeholder="בחר עדיפות" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Object.entries(PRIORITY_CONFIG).map(([key, value]) => (
                                  <SelectItem key={key} value={key} className="text-right">
                                    <span className="flex items-center gap-2 justify-end">
                                      {value.label}
                                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: value.color }} />
                                    </span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem className="text-right">
                          <FormLabel className="text-base font-bold">סטטוס</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="rounded-xl h-14 flex-row-reverse text-right bg-muted/20 border-none">
                                <SelectValue placeholder="בחר סטטוס" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="active" className="text-right">פעיל</SelectItem>
                              <SelectItem value="trial" className="text-right">תקופת ניסיון</SelectItem>
                              <SelectItem value="frozen" className="text-right">מוקפא</SelectItem>
                              <SelectItem value="cancelled" className="text-right">מבוטל</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    {watchStatus === 'trial' && (
                      <div className="bg-orange-50 p-6 rounded-3xl border border-orange-100 animate-in fade-in">
                        <FormField
                          control={form.control}
                          name="trialPeriodDays"
                          render={({ field }) => (
                            <FormItem className="text-right">
                              <FormLabel className="text-sm font-black text-orange-700 flex items-center gap-2 justify-end">
                                <Clock className="h-4 w-4" /> משך תקופת הניסיון (בימים)
                              </FormLabel>
                              <FormControl>
                                <Input type="number" className="rounded-xl h-12 bg-white text-right" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="billing" className="space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem className="text-right col-span-2">
                            <FormLabel className="text-base font-bold">סכום לתשלום *</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" className="rounded-xl h-14 text-right text-xl font-black" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="currency"
                        render={({ field }) => (
                          <FormItem className="text-right">
                            <FormLabel className="text-base font-bold">מטבע</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="rounded-xl h-14 flex-row-reverse text-right bg-muted/20 border-none">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="₪" className="text-right">₪ - שקל</SelectItem>
                                <SelectItem value="$" className="text-right">$ - דולר</SelectItem>
                                <SelectItem value="€" className="text-right">€ - אירו</SelectItem>
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
                            <FormLabel className="text-base font-bold">תאריך חיוב הבא *</FormLabel>
                            <FormControl>
                              <Input type="date" className="rounded-xl h-14 text-right" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="billingCycle"
                        render={({ field }) => (
                          <FormItem className="text-right">
                            <FormLabel className="text-base font-bold">תדירות</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="rounded-xl h-14 flex-row-reverse text-right bg-muted/20 border-none">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="monthly" className="text-right">חודשי</SelectItem>
                                <SelectItem value="yearly" className="text-right">שנתי</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem className="text-right">
                          <FormLabel className="text-base font-bold">אמצעי תשלום</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input placeholder="למשל: Visa 4242" className="rounded-xl h-14 text-right" {...field} />
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {watchCycle === 'monthly' && (
                      <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10 animate-in fade-in">
                        <FormField
                          control={form.control}
                          name="durationMonths"
                          render={({ field }) => (
                            <FormItem className="text-right">
                              <FormLabel className="text-sm font-black text-primary flex items-center gap-2 justify-end">
                                <CalendarRange className="h-4 w-4" /> לכמה חודשים משולם מראש?
                              </FormLabel>
                              <FormControl>
                                <Input type="number" className="rounded-xl h-12 bg-white text-right font-bold" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="reminders" className="space-y-6">
                    <div className="p-6 rounded-3xl border bg-muted/10">
                      <FormLabel className="text-lg font-black mb-4 block">מתי נתריע לך?</FormLabel>
                      <div className="grid grid-cols-2 gap-4">
                        {REMINDER_OPTIONS.map((option) => (
                          <FormField
                            key={option.value}
                            control={form.control}
                            name="reminderDays"
                            render={({ field }) => (
                              <FormItem className="flex flex-row-reverse items-center justify-between p-4 bg-white rounded-2xl shadow-sm space-y-0 gap-3">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(option.value)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, option.value])
                                        : field.onChange(field.value?.filter((v: number) => v !== option.value))
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-bold cursor-pointer">{option.label}</FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="security" className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem className="text-right">
                            <FormLabel className="text-sm font-bold flex items-center gap-2 justify-end"><User className="h-3 w-3" /> שם משתמש</FormLabel>
                            <FormControl><Input className="rounded-xl h-12 text-right bg-muted/20 border-none" {...field} /></FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem className="text-right">
                            <FormLabel className="text-sm font-bold flex items-center gap-2 justify-end"><Mail className="h-3 w-3" /> אימייל</FormLabel>
                            <FormControl><Input type="email" className="rounded-xl h-12 text-right bg-muted/20 border-none" {...field} /></FormControl>
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
                            <FormLabel className="text-sm font-bold flex items-center gap-2 justify-end"><Key className="h-3 w-3" /> סיסמה</FormLabel>
                            <FormControl><Input type="password" placeholder="••••" className="rounded-xl h-12 text-left bg-muted/20 border-none" {...field} /></FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem className="text-right">
                            <FormLabel className="text-sm font-bold flex items-center gap-2 justify-end"><Phone className="h-3 w-3" /> טלפון</FormLabel>
                            <FormControl><Input className="rounded-xl h-12 text-right bg-muted/20 border-none" {...field} /></FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem className="text-right">
                          <FormLabel className="text-sm font-bold flex items-center gap-2 justify-end"><FileText className="h-3 w-3" /> הערות וקופונים</FormLabel>
                          <FormControl>
                            <Textarea placeholder="מידע נוסף..." className="rounded-2xl min-h-[100px] text-right bg-muted/20 border-none p-4" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                </Tabs>
              </ScrollArea>

              <DialogFooter className="p-8 bg-muted/20 gap-4 flex-row-reverse sm:justify-start">
                <Button type="submit" className="bg-primary hover:bg-primary/90 rounded-full px-12 h-16 text-xl font-black gap-3 shadow-xl google-btn">
                  <Save className="h-6 w-6" /> {isEdit ? "עדכן" : "שמור"}
                </Button>
                <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="rounded-full h-16 px-8 text-lg font-bold">ביטול</Button>
                {isEdit && (
                  <div className="mr-auto flex gap-2">
                    <Button type="button" variant="outline" size="icon" className="h-16 w-16 rounded-full shadow-md" onClick={() => duplicateSubscription(subscription!.id)}>
                      <Copy className="h-6 w-6" />
                    </Button>
                    <Button type="button" variant="outline" size="icon" className="h-16 w-16 rounded-full text-destructive shadow-md" onClick={() => setShowDeleteAlert(true)}>
                      <Trash2 className="h-6 w-6" />
                    </Button>
                  </div>
                )}
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent className="text-right rounded-[2.5rem] border-none shadow-2xl p-10" dir="rtl" aria-describedby="delete-alert-description">
          <AlertDialogHeader className="items-center">
            <div className="h-24 w-24 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-6">
              <AlertTriangle className="h-12 w-12" />
            </div>
            <AlertDialogTitle className="text-3xl font-black">מחיקת מינוי?</AlertDialogTitle>
            <AlertDialogDescription id="delete-alert-description" className="text-center text-muted-foreground text-lg mt-2">
              פעולה זו היא סופית ולא ניתן יהיה לשחזר את המידע.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center flex flex-row-reverse gap-4 mt-10">
            <AlertDialogAction onClick={() => { if(subscription) deleteSubscription(subscription.id); onOpenChange(false); }} className="bg-destructive hover:bg-destructive/90 rounded-full px-12 h-16 text-xl font-black">כן, מחק</AlertDialogAction>
            <AlertDialogCancel className="rounded-full h-16 px-12 text-lg font-bold">ביטול</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
