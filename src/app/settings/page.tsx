
"use client"

import * as React from "react"
import { TopNav } from "@/components/dashboard/top-nav"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useSubscriptions } from "@/context/subscriptions-context"
import { 
  User, 
  Bell, 
  Shield, 
  Database, 
  Globe, 
  Download, 
  Upload, 
  Trash2,
  Save,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Moon,
  Sun,
  Monitor,
  Volume2,
  Eye,
  Type,
  Mail,
  Send
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { sendWeeklyDigestAction } from "@/app/actions/email-actions"

export default function SettingsPage() {
  const { exportData, settings, updateSettings, subscriptions } = useSubscriptions()
  const { toast } = useToast()
  const [loading, setLoading] = React.useState(false)
  const [emailLoading, setEmailLoading] = React.useState(false)
  const [showDeleteAllAlert, setShowDeleteAllAlert] = React.useState(false)
  
  const [localProfile, setLocalProfile] = React.useState({
    userName: settings.userName,
    userEmail: settings.userEmail,
    userPhone: settings.userPhone
  });

  const handleSave = () => {
    setLoading(true)
    setTimeout(() => {
      updateSettings(localProfile);
      setLoading(false)
      toast({
        title: "הגדרות נשמרו",
        description: "כל השינויים עודכנו בהצלחה במערכת.",
      })
    }, 1000)
  }

  const handleSendRealEmail = async () => {
    setEmailLoading(true)
    try {
      // שליחת המיייל האמיתי דרך Server Action
      const result = await sendWeeklyDigestAction({
        email: settings.userEmail,
        userName: settings.userName,
        subscriptions: subscriptions
      })

      if (result.success) {
        toast({
          title: "אימייל נשלח בהצלחה!",
          description: `סיכום המינויים נשלח לכתובת ${settings.userEmail}`,
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "שגיאה בשליחת המייל",
        description: "ודא שהגדרת API Key עבור שירות המיילים.",
      })
    } finally {
      setEmailLoading(false)
    }
  }

  const handleDeleteAll = () => {
    localStorage.clear()
    toast({
      variant: "destructive",
      title: "המידע נמחק",
      description: "כל הנתונים שלך נמחקו לצמיתות.",
    })
    setShowDeleteAllAlert(false)
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] dark:bg-zinc-950 transition-colors duration-300">
      <TopNav />
      <main className="flex-1 container mx-auto p-4 md:p-8 space-y-8 animate-fade-in pb-24 max-w-5xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b pb-6">
          <div className="text-right space-y-1">
            <h1 className="text-4xl font-black tracking-tight text-foreground dark:text-zinc-100">הגדרות</h1>
            <p className="text-muted-foreground text-lg">ניהול החשבון, העדפות התצוגה והתראות המערכת</p>
          </div>
          <Button 
            onClick={handleSave} 
            disabled={loading}
            className="rounded-full px-10 h-12 bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 text-md font-bold transition-all ripple"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Save className="ml-2 h-5 w-5" /> שמור שינויים</>}
          </Button>
        </div>

        <Tabs defaultValue="profile" className="w-full" dir="rtl">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-muted/50 dark:bg-zinc-900 rounded-2xl p-1.5 h-auto mb-8">
            <TabsTrigger value="profile" className="rounded-xl py-3 font-bold gap-2">
              <User className="h-4 w-4" /> פרופיל
            </TabsTrigger>
            <TabsTrigger value="display" className="rounded-xl py-3 font-bold gap-2">
              <Eye className="h-4 w-4" /> תצוגה
            </TabsTrigger>
            <TabsTrigger value="notifications" className="rounded-xl py-3 font-bold gap-2">
              <Bell className="h-4 w-4" /> התראות
            </TabsTrigger>
            <TabsTrigger value="data" className="rounded-xl py-3 font-bold gap-2">
              <Database className="h-4 w-4" /> מידע ופרטיות
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card className="card-shadow border-none rounded-3xl overflow-hidden bg-white dark:bg-zinc-900">
              <CardHeader className="bg-muted/10 dark:bg-zinc-800/50 p-6 border-b">
                <CardTitle className="text-xl text-right">מידע אישי</CardTitle>
                <CardDescription className="text-right">פרטי המשתמש המשמשים לניהול המינויים שלך</CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row-reverse gap-10 items-center">
                  <div className="relative group">
                    <div className="h-32 w-32 rounded-3xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary text-4xl font-black border-2 border-primary/20 shadow-inner group-hover:scale-105 transition-transform">
                      {localProfile.userName.charAt(0)}
                    </div>
                  </div>
                  
                  <div className="flex-1 grid gap-6 w-full">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2 text-right">
                        <Label className="font-bold text-sm">שם מלא</Label>
                        <Input 
                          value={localProfile.userName} 
                          onChange={(e) => setLocalProfile(prev => ({ ...prev, userName: e.target.value }))}
                          className="rounded-xl h-12 text-right bg-muted/30 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-primary/20" 
                        />
                      </div>
                      <div className="space-y-2 text-right">
                        <Label className="font-bold text-sm">כתובת אימייל</Label>
                        <Input 
                          type="email"
                          value={localProfile.userEmail} 
                          onChange={(e) => setLocalProfile(prev => ({ ...prev, userEmail: e.target.value }))}
                          className="rounded-xl h-12 text-right bg-muted/30 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-primary/20" 
                        />
                      </div>
                      <div className="space-y-2 text-right">
                        <Label className="font-bold text-sm">מספר טלפון</Label>
                        <Input 
                          value={localProfile.userPhone} 
                          onChange={(e) => setLocalProfile(prev => ({ ...prev, userPhone: e.target.value }))}
                          className="rounded-xl h-12 text-right bg-muted/30 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-primary/20" 
                        />
                      </div>
                      <div className="space-y-2 text-right">
                        <Label className="font-bold text-sm">מטבע ברירת מחדל</Label>
                        <select 
                          value={settings.currency}
                          onChange={(e) => updateSettings({ currency: e.target.value })}
                          className="w-full h-12 rounded-xl bg-muted/30 dark:bg-zinc-800 px-4 font-bold outline-none border-none focus:ring-2 focus:ring-primary/20"
                        >
                          <option value="₪">₪ - שקל חדש</option>
                          <option value="$">$ - דולר אמריקאי</option>
                          <option value="€">€ - אירו</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="display" className="space-y-6">
            <Card className="card-shadow border-none rounded-3xl overflow-hidden bg-white dark:bg-zinc-900">
              <CardHeader className="bg-muted/10 dark:bg-zinc-800/50 p-6 border-b">
                <CardTitle className="text-xl text-right">נראות וממשק</CardTitle>
                <CardDescription className="text-right">התאם את חוויית השימוש שלך ב-PandaSub</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="flex items-center justify-between flex-row-reverse">
                  <div className="space-y-1 text-right">
                    <div className="flex items-center gap-2 justify-start flex-row-reverse">
                      <Label className="text-lg font-bold">מצב כהה (Dark Mode)</Label>
                      <Moon className="h-5 w-5 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground">הפעל תצוגה כהה המותאמת לעבודה בלילה ולחיסכון בסוללה</p>
                  </div>
                  <Switch checked={settings.darkMode} onCheckedChange={(checked) => updateSettings({ darkMode: checked })} />
                </div>
                
                <div className="h-px bg-muted dark:bg-zinc-800 w-full" />

                <div className="flex items-center justify-between flex-row-reverse">
                  <div className="space-y-1 text-right">
                    <div className="flex items-center gap-2 justify-start flex-row-reverse">
                      <Label className="text-lg font-bold">תצוגה דחוסה (Compact)</Label>
                      <Monitor className="h-5 w-5 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground">צמצם את המרווחים בממשק כדי לראות יותר מידע במסך אחד</p>
                  </div>
                  <Switch checked={settings.compactMode} onCheckedChange={(checked) => updateSettings({ compactMode: checked })} />
                </div>

                <div className="h-px bg-muted dark:bg-zinc-800 w-full" />

                <div className="flex items-center justify-between flex-row-reverse">
                  <div className="space-y-1 text-right">
                    <div className="flex items-center gap-2 justify-start flex-row-reverse">
                      <Label className="text-lg font-bold">גודל גופן</Label>
                      <Type className="h-5 w-5 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground">בחר את גודל הטקסט הנוח ביותר עבורך</p>
                  </div>
                  <select 
                    value={settings.fontSize}
                    onChange={(e) => updateSettings({ fontSize: e.target.value as any })}
                    className="h-10 rounded-xl bg-muted/30 dark:bg-zinc-800 px-4 font-medium outline-none border-none"
                  >
                    <option value="small">קטן</option>
                    <option value="medium">בינוני</option>
                    <option value="large">גדול</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card className="card-shadow border-none rounded-3xl overflow-hidden bg-white dark:bg-zinc-900">
              <CardHeader className="bg-muted/10 dark:bg-zinc-800/50 p-6 border-b">
                <CardTitle className="text-xl text-right">התראות ותזכורות</CardTitle>
                <CardDescription className="text-right">שלוט בדרך שבה PandaSub מתקשר איתך</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="flex items-center justify-between flex-row-reverse">
                  <div className="space-y-1 text-right">
                    <Label className="text-lg font-bold">התראות דפדפן (Push)</Label>
                    <p className="text-sm text-muted-foreground">קבל התראות בזמן אמת על חיובים קרובים וסיום ניסיון</p>
                  </div>
                  <Switch checked={settings.pushNotifications} onCheckedChange={(checked) => updateSettings({ pushNotifications: checked })} />
                </div>
                
                <div className="h-px bg-muted dark:bg-zinc-800 w-full" />

                <div className="flex items-center justify-between flex-row-reverse">
                  <div className="space-y-1 text-right">
                    <Label className="text-lg font-bold">סיכום שבועי באימייל</Label>
                    <p className="text-sm text-muted-foreground">קבל אימייל עם סיכום כל החיובים הצפויים השבוע (שליחה אמיתית)</p>
                  </div>
                  <div className="flex items-center gap-4 flex-row-reverse">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleSendRealEmail} 
                      disabled={emailLoading}
                      className="rounded-full gap-2 border-primary/20 text-primary hover:bg-primary/5"
                    >
                      {emailLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                      שלח עכשיו
                    </Button>
                    <Switch checked={settings.emailDigest} onCheckedChange={(checked) => updateSettings({ emailDigest: checked })} />
                  </div>
                </div>

                <div className="h-px bg-muted dark:bg-zinc-800 w-full" />

                <div className="flex items-center justify-between flex-row-reverse">
                  <div className="space-y-1 text-right">
                    <div className="flex items-center gap-2 justify-start flex-row-reverse">
                      <Label className="text-lg font-bold">התראות קוליות</Label>
                      <Volume2 className="h-5 w-5 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground">השמע צליל בעת קבלת התראה חדשה במערכת</p>
                  </div>
                  <Switch checked={settings.soundEnabled} onCheckedChange={(checked) => updateSettings({ soundEnabled: checked })} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data" className="space-y-6">
            <Card className="card-shadow border-none rounded-3xl overflow-hidden bg-white dark:bg-zinc-900">
              <CardHeader className="bg-destructive/5 dark:bg-destructive/10 p-6 border-b">
                <div className="flex items-center gap-2 justify-start flex-row-reverse">
                  <Shield className="h-6 w-6 text-destructive" />
                  <CardTitle className="text-xl text-destructive text-right">אבטחה ופרטיות</CardTitle>
                </div>
                <CardDescription className="text-right">ניהול המידע האישי שלך והגנה על החשבון</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="p-6 rounded-3xl border border-primary/20 bg-primary/5 dark:bg-primary/10 space-y-4 text-right">
                    <div className="flex items-center justify-between flex-row-reverse">
                      <div className="p-2 bg-primary/20 rounded-xl"><Download className="h-5 w-5 text-primary" /></div>
                      <h4 className="font-bold">גיבוי נתונים</h4>
                    </div>
                    <p className="text-xs text-muted-foreground">הורד את כל רשימת המינויים שלך לקובץ CSV לשימוש חיצוני או לגיבוי.</p>
                    <Button variant="outline" onClick={exportData} className="w-full rounded-xl border-primary/20 hover:bg-primary/10 text-primary font-bold">
                      ייצוא נתונים עכשיו
                    </Button>
                  </div>

                  <div className="p-6 rounded-3xl border border-destructive/20 bg-destructive/5 dark:bg-destructive/10 space-y-4 text-right">
                    <div className="flex items-center justify-between flex-row-reverse">
                      <div className="p-2 bg-destructive/20 rounded-xl"><Trash2 className="h-5 w-5 text-destructive" /></div>
                      <h4 className="font-bold text-destructive">מחיקת חשבון</h4>
                    </div>
                    <p className="text-xs text-muted-foreground">פעולה זו תמחק את כל המידע שלך מהמכשיר לצמיתות. לא ניתן לשחזר זאת.</p>
                    <Button variant="outline" onClick={() => setShowDeleteAllAlert(true)} className="w-full rounded-xl border-destructive/20 hover:bg-destructive/10 text-destructive font-bold">
                      מחק הכל לצמיתות
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <AlertDialog open={showDeleteAllAlert} onOpenChange={setShowDeleteAllAlert}>
        <AlertDialogContent className="text-right rounded-3xl border-none shadow-2xl max-w-sm dark:bg-zinc-900">
          <AlertDialogHeader className="items-center">
            <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-4 animate-pulse">
              <AlertTriangle className="h-10 w-10" />
            </div>
            <AlertDialogTitle className="text-2xl font-bold text-center w-full">למחוק את הכל?</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-base">
              פעולה זו תנקה את כל המינויים וההגדרות שלך לצמיתות מהזיכרון המקומי.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse sm:justify-center gap-3 mt-8">
            <AlertDialogAction 
              onClick={handleDeleteAll}
              className="bg-destructive hover:bg-destructive/90 rounded-full px-10 h-12 font-black flex-1 shadow-lg shadow-destructive/20"
            >
              כן, מחק הכל
            </AlertDialogAction>
            <AlertDialogCancel className="rounded-full h-12 px-10 font-bold flex-1">ביטול</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
