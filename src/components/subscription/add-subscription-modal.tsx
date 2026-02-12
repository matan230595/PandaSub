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
import { Badge } from "@/components/ui/badge"
import { useSubscriptions } from "@/context/subscriptions-context"
import { CATEGORY_METADATA, SubscriptionCategory, SubscriptionStatus, Subscription } from "@/app/lib/subscription-store"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Key, FileText, AlertTriangle, Clock, Sparkles, Loader2, Save, Copy, Trash2 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { differenceInDays } from "date-fns"
import { cn } from "@/lib/utils"
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
  { label: "שבועיים לפני", value: 14 },
  { label: "חודש לפני", value: 30 },
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
    },
  })

  React.useEffect(() => {
    if (open && subscription) {
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
      })
    } else if (open && !subscription) {
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
      })
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
      toast({ title: "שגיאה בסריקה", description: "לא הצלחנו לחלץ נתונים מהטקסט שסופק.", variant: "destructive" });
    } finally {
      setIsAiLoading(false);
    }
  }

  const renderCountdownInModal = () => {
    const today = new Date()
    const renewalDateValue = form.watch("renewalDate")
    if (!renewalDateValue) return null
    
    const renewal = new Date(renewalDateValue)
    const daysLeft = differenceInDays(renewal, today)
    
    let progress = 100
    let color = "bg-green-500"
    let textClass = "text-green-600"

    if (daysLeft <= 0) {
      progress = 100; color = "bg-destructive animate-pulse"; textClass = "text-destructive font-black";
    } else if (daysLeft <= 3) {
      progress = 90; color = "bg-destructive animate-pulse"; textClass = "text-destructive font-bold";
    } else if (daysLeft <= 7) {
      progress = 70; color = "bg-orange-500"; textClass = "text-orange-600 font-bold";
    } else if (daysLeft <= 14) {
      progress = 40; color = "bg-blue-500"; textClass = "text-blue-600 font-bold";
    } else {
      progress = 20; color = "bg-green-500"; textClass = "text-green-600";
    }

    return (
      <div className="bg-white/50 p-4 rounded-2xl border mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className={cn("text-sm font-black flex items-center gap-2", textClass)}>
            <Clock className="h-4 w-4" />
            {daysLeft <= 0 ? "החיוב היום!" : `נותרו ${daysLeft} ימים לחידוש`}
          </span>
          <Badge variant="secondary" className="rounded-full">{progress}% לקראת חיוב</Badge>
        </div>
        <Progress value={progress} className="h-2" indicatorClassName={color} />
      </div>
    )
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    const data = {
      name: values.name,
      category: values.category as SubscriptionCategory,
      amount: values.amount,
      currency: values.currency,
      renewalDate: values.renewalDate,
      billingCycle: values.billingCycle,
      paymentMethod: values.paymentMethod,
      reminderDays: values.reminderDays,
      status: values.status as SubscriptionStatus,
      priority: values.priority as any,
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

  function onFormError(errors: any) {
    console.log("Form Errors:", errors);
    toast({
      variant: "destructive",
      title: "שגיאה בטופס",
      description: "אנא בדוק את כל השדות בשלבי הטופס השונים (בסיסי, חיוב וכו').",
    });
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] text-right p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, onFormError)} className="flex flex-col max-h-[90vh]">
              <DialogHeader className="p-6 bg-primary/5 border-b flex flex-row items-center justify-between">
                <div className="flex-1">
                  <DialogTitle className="text-2xl font-black">
                    {isEdit ? "עריכת מינוי" : "הוספת מינוי חדש"}
                  </DialogTitle>
                </div>
                <div className="flex items-center gap-2">
                  {!isEdit && (
                    <Button type="button" variant="outline" size="sm" onClick={handleAiScan} disabled={isAiLoading} className="rounded-full gap-2 border-primary/20 bg-white text-primary font-bold">
                      {isAiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} סרוק חשבונית AI
                    </Button>
                  )}
                  {isEdit && (
                    <>
                      <Button type="button" variant="outline" size="icon" className="h-10 w-10 rounded-2xl shadow-sm" onClick={() => duplicateSubscription(subscription!.id)} title="שכפל">
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button type="button" variant="outline" size="icon" className="h-10 w-10 rounded-2xl text-destructive hover:bg-destructive/10 border-destructive/20 shadow-sm" onClick={() => setShowDeleteAlert(true)} title="מחק">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </DialogHeader>

              <ScrollArea className="flex-1 p-6">
                {renderCountdownInModal()}
                
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
                            <Input placeholder="Netflix, Spotify, Google Cloud..." className="rounded-xl h-12 text-right text-lg" {...field} />
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
                                <SelectTrigger className="rounded-xl h-12 flex-row-reverse text-right">
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
                                <SelectTrigger className="rounded-xl h-12 flex-row-reverse text-right">
                                  <SelectValue placeholder="סטטוס" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="rounded-xl">
                                <SelectItem value="active" className="text-right font-bold text-green-600">פעיל</SelectItem>
                                <SelectItem value="trial" className="text-right font-bold text-orange-500">תקופת ניסיון</SelectItem>
                                <SelectItem value="frozen" className="text-right font-bold text-blue-500">מוקפא</SelectItem>
                                <SelectItem value="cancelled" className="text-right font-bold text-muted-foreground">בוטל</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="billing" className="space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem className="text-right col-span-2">
                            <FormLabel className="text-base font-bold">סכום</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" className="rounded-xl h-12 text-right text-lg font-black" {...field} />
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
                                <SelectTrigger className="rounded-xl h-12 flex-row-reverse text-right">
                                  <SelectValue placeholder="מטבע" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="rounded-xl">
                                <SelectItem value="₪" className="text-right font-bold">₪ - שקלים</SelectItem>
                                <SelectItem value="$" className="text-right font-bold">$ - דולרים</SelectItem>
                                <SelectItem value="€" className="text-right font-bold">€ - אירו</SelectItem>
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
                            <FormLabel className="text-base font-bold">תאריך חידוש</FormLabel>
                            <FormControl>
                              <Input type="date" className="rounded-xl h-12 text-right" {...field} />
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
                            <FormLabel className="text-base font-bold">מחזור חיוב</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="rounded-xl h-12 flex-row-reverse text-right">
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
                  </TabsContent>

                  <TabsContent value="reminders" className="space-y-6">
                    <FormItem className="text-right">
                      <FormLabel className="text-base font-black">התראות פעילות</FormLabel>
                      <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-2xl border">
                        {REMINDER_OPTIONS.map((option) => (
                          <FormField
                            key={option.value}
                            control={form.control}
                            name="reminderDays"
                            render={({ field }) => (
                              <FormItem className="flex flex-row-reverse items-center justify-between space-y-0 gap-3">
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
                    </FormItem>
                  </TabsContent>

                  <TabsContent value="security" className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem className="text-right">
                            <FormLabel className="text-sm font-bold flex items-center gap-2 justify-end"><User className="h-3 w-3" /> שם משתמש</FormLabel>
                            <FormControl><Input className="rounded-xl h-11 text-right" {...field} /></FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem className="text-right">
                            <FormLabel className="text-sm font-bold flex items-center gap-2 justify-end"><Key className="h-3 w-3" /> סיסמה</FormLabel>
                            <FormControl><Input type="password" placeholder="••••" className="rounded-xl h-11 text-left" {...field} /></FormControl>
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
                            <Textarea placeholder="קוד קופון, הנחות או מידע נוסף..." className="rounded-xl min-h-[100px] text-right" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                </Tabs>
              </ScrollArea>

              <DialogFooter className="p-6 bg-muted/20 gap-4 flex-row-reverse sm:justify-start">
                <Button type="submit" className="bg-primary hover:bg-primary/90 rounded-full px-12 h-14 text-lg font-black gap-3 shadow-xl shadow-primary/20">
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
            <div className="h-24 w-24 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-6">
              <AlertTriangle className="h-12 w-12" />
            </div>
            <AlertDialogTitle className="text-3xl font-black">מחיקת מינוי סופית?</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-muted-foreground text-lg leading-relaxed">
              האם אתה בטוח שברצונך למחוק את המינוי? כל המידע יימחק לצמיתות.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center flex flex-row-reverse gap-4 mt-10">
            <AlertDialogAction onClick={() => { if(subscription) deleteSubscription(subscription.id); onOpenChange(false); }} className="bg-destructive hover:bg-destructive/90 rounded-full px-10 h-14 text-lg font-black">
              כן, מחק מינוי
            </AlertDialogAction>
            <AlertDialogCancel className="rounded-full h-14 px-10 text-lg font-bold">ביטול</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
