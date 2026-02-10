
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
  Trash2,
  Save,
  AlertTriangle,
  Loader2,
  Eye,
  FileText
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

export default function SettingsPage() {
  const { exportData, settings, updateSettings, subscriptions } = useSubscriptions()
  const { toast } = useToast()
  const [loading, setLoading] = React.useState(false)
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

  const handleGenerateDraft = () => {
    const activeSubs = subscriptions.filter(s => s.status === 'active' || s.status === 'trial');
    const total = activeSubs.reduce((sum, s) => sum + s.amount, 0);
    
    const subListText = activeSubs.map(s => `• ${s.name}: ${s.amount}${s.currency} (חידוש ב-${s.renewalDate})`).join('\n');
    
    const subject = encodeURIComponent(`סיכום מינויים שבועי - PandaSub IL`);
    const body = encodeURIComponent(
      `שלום ${localProfile.userName},\n\nלהלן סיכום המינויים הפעילים שלך:\n\n${subListText}\n\nסה"כ חודשי: ${total.toLocaleString()} ${settings.currency}\n\nנשלח מ-PandaSub IL`
    );

    window.location.href = `mailto:${localProfile.userEmail}?subject=${subject}&body=${body}`;
    
    toast({
      title: "טיוטת מייל נוצרה",
      description: "אפליקציית המייל נפתחה עם הנתונים שלך.",
    })
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
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] dark:bg-zinc-950">
      <TopNav />
      <main className="flex-1 container mx-auto p-4 md:p-8 space-y-8 animate-fade-in pb-24 max-w-5xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b pb-6 flex-row-reverse">
          <div className="text-right">
            <h1 className="text-4xl font-black tracking-tight">הגדרות</h1>
            <p className="text-muted-foreground text-lg">ניהול החשבון והעדפות המערכת</p>
          </div>
          <Button 
            onClick={handleSave} 
            disabled={loading}
            className="rounded-full px-10 h-12 google-btn"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Save className="ml-2 h-5 w-5" /> שמור שינויים</>}
          </Button>
        </div>

        <Tabs defaultValue="profile" className="w-full" dir="rtl">
          <TabsList className="grid w-full grid-cols-4 bg-muted/50 rounded-2xl p-1 mb-8 h-14">
            <TabsTrigger value="profile" className="rounded-xl font-bold gap-2">
              <User className="h-4 w-4" /> פרופיל
            </TabsTrigger>
            <TabsTrigger value="display" className="rounded-xl font-bold gap-2">
              <Eye className="h-4 w-4" /> תצוגה
            </TabsTrigger>
            <TabsTrigger value="notifications" className="rounded-xl font-bold gap-2">
              <Bell className="h-4 w-4" /> התראות
            </TabsTrigger>
            <TabsTrigger value="data" className="rounded-xl font-bold gap-2">
              <Database className="h-4 w-4" /> מידע ופרטיות
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card className="card-shadow border-none rounded-3xl overflow-hidden bg-white">
              <CardHeader className="text-right">
                <CardTitle className="text-xl">מידע אישי</CardTitle>
                <CardDescription>פרטי המשתמש המשמשים לניהול המינויים</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 text-right">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="font-bold">שם מלא</Label>
                    <Input 
                      value={localProfile.userName} 
                      onChange={(e) => setLocalProfile(prev => ({ ...prev, userName: e.target.value }))}
                      className="rounded-xl h-12 text-right" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">כתובת אימייל</Label>
                    <Input 
                      type="email"
                      value={localProfile.userEmail} 
                      onChange={(e) => setLocalProfile(prev => ({ ...prev, userEmail: e.target.value }))}
                      className="rounded-xl h-12 text-right" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">מספר טלפון</Label>
                    <Input 
                      value={localProfile.userPhone} 
                      onChange={(e) => setLocalProfile(prev => ({ ...prev, userPhone: e.target.value }))}
                      className="rounded-xl h-12 text-right" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">מטבע ברירת מחדל</Label>
                    <select 
                      value={settings.currency}
                      onChange={(e) => updateSettings({ currency: e.target.value })}
                      className="w-full h-12 rounded-xl bg-muted/30 px-4 font-bold border-none text-right"
                    >
                      <option value="₪">₪ - שקל חדש</option>
                      <option value="$">$ - דולר אמריקאי</option>
                      <option value="€">€ - אירו</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="display" className="space-y-6">
            <Card className="card-shadow border-none rounded-3xl overflow-hidden bg-white">
              <CardHeader className="text-right">
                <CardTitle className="text-xl">נראות וממשק</CardTitle>
                <CardDescription>התאם את חוויית השימוש שלך</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="flex items-center justify-between flex-row-reverse">
                  <div className="space-y-1 text-right">
                    <Label className="text-lg font-bold">מצב כהה (Dark Mode)</Label>
                    <p className="text-sm text-muted-foreground">הפעל תצוגה כהה לחיסכון בסוללה</p>
                  </div>
                  <Switch checked={settings.darkMode} onCheckedChange={(checked) => updateSettings({ darkMode: checked })} />
                </div>
                
                <div className="h-px bg-muted w-full" />

                <div className="flex items-center justify-between flex-row-reverse">
                  <div className="space-y-1 text-right">
                    <Label className="text-lg font-bold">תצוגה דחוסה</Label>
                    <p className="text-sm text-muted-foreground">צמצם מרווחים כדי לראות יותר מידע</p>
                  </div>
                  <Switch checked={settings.compactMode} onCheckedChange={(checked) => updateSettings({ compactMode: checked })} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card className="card-shadow border-none rounded-3xl overflow-hidden bg-white">
              <CardHeader className="text-right">
                <CardTitle className="text-xl">התראות ותזכורות</CardTitle>
                <CardDescription>שלוט בדרך שבה PandaSub מתקשר איתך</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="flex items-center justify-between flex-row-reverse">
                  <div className="space-y-1 text-right">
                    <Label className="text-lg font-bold">התראות דפדפן (Push)</Label>
                    <p className="text-sm text-muted-foreground">קבל התראות בזמן אמת על חיובים</p>
                  </div>
                  <Switch checked={settings.pushNotifications} onCheckedChange={(checked) => updateSettings({ pushNotifications: checked })} />
                </div>
                
                <div className="h-px bg-muted w-full" />

                <div className="flex items-center justify-between flex-row-reverse">
                  <div className="space-y-1 text-right">
                    <Label className="text-lg font-bold">סיכום שבועי באימייל</Label>
                    <p className="text-sm text-muted-foreground">קבל אימייל עם סיכום כל החיובים השבועיים</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleGenerateDraft} 
                      className="rounded-full gap-2 border-primary/20 text-primary"
                    >
                      <FileText className="h-4 w-4" />
                      צור טיוטת מייל
                    </Button>
                    <Switch checked={settings.emailDigest} onCheckedChange={(checked) => updateSettings({ emailDigest: checked })} />
                  </div>
                </div>

                <div className="h-px bg-muted w-full" />

                <div className="flex items-center justify-between flex-row-reverse">
                  <div className="space-y-1 text-right">
                    <Label className="text-lg font-bold">התראות קוליות</Label>
                    <p className="text-sm text-muted-foreground">השמע צליל בעת התראה חדשה</p>
                  </div>
                  <Switch checked={settings.soundEnabled} onCheckedChange={(checked) => updateSettings({ soundEnabled: checked })} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data" className="space-y-6">
            <Card className="card-shadow border-none rounded-3xl overflow-hidden bg-white">
              <CardHeader className="text-right flex flex-col items-end">
                <div className="flex items-center gap-3 justify-end flex-row-reverse">
                  <Shield className="h-6 w-6 text-primary" />
                  <CardTitle className="text-xl">אבטחה ופרטיות</CardTitle>
                </div>
                <CardDescription>ניהול המידע האישי והגנה על החשבון</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="p-6 rounded-3xl border border-primary/20 bg-primary/5 space-y-4 text-right">
                    <h4 className="font-bold flex items-center gap-2 justify-end">גיבוי נתונים <Trash2 className="h-4 w-4" /></h4>
                    <p className="text-xs text-muted-foreground">הורד את כל רשימת המינויים שלך לקובץ CSV.</p>
                    <Button variant="outline" onClick={exportData} className="w-full rounded-xl border-primary/20 text-primary font-bold">
                      ייצוא נתונים עכשיו
                    </Button>
                  </div>

                  <div className="p-6 rounded-3xl border border-destructive/20 bg-destructive/5 space-y-4 text-right">
                    <h4 className="font-bold text-destructive flex items-center gap-2 justify-end">מחיקת חשבון <Trash2 className="h-4 w-4" /></h4>
                    <p className="text-xs text-muted-foreground">פעולה זו תמחק את כל המידע שלך לצמיתות.</p>
                    <Button variant="outline" onClick={() => setShowDeleteAllAlert(true)} className="w-full rounded-xl border-destructive/20 text-destructive font-bold">
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
        <AlertDialogContent className="text-right rounded-3xl border-none shadow-2xl" dir="rtl">
          <AlertDialogHeader className="items-center">
            <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-4">
              <AlertTriangle className="h-10 w-10" />
            </div>
            <AlertDialogTitle className="text-2xl font-bold">למחוק את הכל?</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-muted-foreground">
              פעולה זו תנקה את כל המינויים וההגדרות שלך לצמיתות. לא ניתן יהיה לשחזר את המידע.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-row-reverse justify-center gap-3 mt-8">
            <AlertDialogAction onClick={handleDeleteAll} className="bg-destructive hover:bg-destructive/90 rounded-full px-10 h-12 font-black">
              כן, מחק הכל
            </AlertDialogAction>
            <AlertDialogCancel className="rounded-full h-12 px-10 font-bold">ביטול</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
