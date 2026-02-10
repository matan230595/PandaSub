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
  Loader2
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

export default function SettingsPage() {
  const { exportData } = useSubscriptions()
  const { toast } = useToast()
  const [loading, setLoading] = React.useState(false)
  const [showDeleteAllAlert, setShowDeleteAllAlert] = React.useState(false)
  
  // הגדרות מקומיות
  const [userName, setUserName] = React.useState("ישראל ישראלי")
  const [userEmail, setUserEmail] = React.useState("israel@example.com")
  const [darkMode, setDarkMode] = React.useState(false)
  const [pushNotifications, setPushNotifications] = React.useState(true)
  const [currency, setCurrency] = React.useState("₪")

  const handleSave = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      toast({
        title: "הגדרות נשמרו",
        description: "השינויים עודכנו בהצלחה במערכת.",
      })
    }, 1000)
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
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-right" dir="rtl">
      <TopNav />
      <main className="flex-1 container mx-auto p-4 md:p-8 space-y-8 animate-fade-in pb-20">
        <div className="space-y-2">
          <h1 className="text-3xl font-black tracking-tight text-foreground">הגדרות מערכת</h1>
          <p className="text-muted-foreground text-lg">נהל את הפרופיל, ההעדפות והמידע שלך במקום אחד</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* ניווט פנימי - דסקטופ */}
          <div className="lg:col-span-3 space-y-2 hidden lg:block">
            <SettingsNavItem icon={<User className="h-4 w-4" />} label="פרופיל אישי" active />
            <SettingsNavItem icon={<Bell className="h-4 w-4" />} label="התראות" />
            <SettingsNavItem icon={<Globe className="h-4 w-4" />} label="שפה ומטבע" />
            <SettingsNavItem icon={<Database className="h-4 w-4" />} label="ניהול נתונים" />
          </div>

          <div className="lg:col-span-9 space-y-6">
            {/* כרטיס פרופיל */}
            <Card className="card-shadow border-none rounded-3xl overflow-hidden bg-white">
              <CardHeader className="border-b bg-muted/20 p-6 text-right">
                <CardTitle className="text-xl font-bold">פרופיל משתמש</CardTitle>
                <CardDescription>פרטי המשתמש כפי שיופיעו במערכת</CardDescription>
              </CardHeader>
              <CardContent className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="relative">
                    <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-black border-2 border-primary/20 shadow-inner">
                      {userName.charAt(0)}
                    </div>
                    <button className="absolute -bottom-1 -right-1 bg-primary text-white p-2 rounded-full shadow-lg hover:scale-110 transition-transform">
                      <Upload className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="flex-1 grid gap-6 w-full">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="font-bold text-sm">שם מלא</Label>
                        <Input 
                          value={userName} 
                          onChange={(e) => setUserName(e.target.value)}
                          className="rounded-xl h-11 text-right bg-muted/30 focus:bg-white transition-all" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-bold text-sm">כתובת אימייל</Label>
                        <Input 
                          type="email"
                          value={userEmail} 
                          onChange={(e) => setUserEmail(e.target.value)}
                          className="rounded-xl h-11 text-right bg-muted/30 focus:bg-white transition-all" 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* העדפות מערכת */}
            <Card className="card-shadow border-none rounded-3xl overflow-hidden bg-white">
              <CardHeader className="border-b bg-muted/20 p-6 text-right">
                <CardTitle className="text-xl font-bold">העדפות ותצוגה</CardTitle>
                <CardDescription>התאם את PandaSub לסגנון העבודה שלך</CardDescription>
              </CardHeader>
              <CardContent className="p-6 md:p-8 space-y-6">
                <div className="flex items-center justify-between py-2">
                  <div className="space-y-0.5 text-right">
                    <Label className="text-base font-bold">מצב כהה (Dark Mode)</Label>
                    <p className="text-sm text-muted-foreground">הפעל תצוגה כהה לחיסכון בסוללה ונוחות העיניים</p>
                  </div>
                  <Switch checked={darkMode} onCheckedChange={setDarkMode} />
                </div>
                
                <div className="h-px bg-muted w-full" />

                <div className="flex items-center justify-between py-2">
                  <div className="space-y-0.5 text-right">
                    <Label className="text-base font-bold">התראות דחיפה</Label>
                    <p className="text-sm text-muted-foreground">קבל עדכונים על חיובים קרובים ישירות לדפדפן</p>
                  </div>
                  <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
                </div>

                <div className="h-px bg-muted w-full" />

                <div className="flex items-center justify-between py-2">
                  <div className="space-y-0.5 text-right">
                    <Label className="text-base font-bold">מטבע ברירת מחדל</Label>
                    <p className="text-sm text-muted-foreground">המטבע העיקרי להצגת סיכומים</p>
                  </div>
                  <select 
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="bg-muted/50 rounded-xl px-4 py-2 text-sm font-bold border-none outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="₪">₪ - שקל חדש</option>
                    <option value="$">$ - דולר ארה"ב</option>
                    <option value="€">€ - אירו</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* ניהול נתונים */}
            <Card className="card-shadow border-none rounded-3xl bg-white border-destructive/10 overflow-hidden">
              <CardHeader className="border-b bg-destructive/5 p-6 text-right">
                <CardTitle className="text-xl font-bold text-destructive flex items-center gap-2 justify-end">
                  <Shield className="h-5 w-5" />
                  ניהול מידע ופרטיות
                </CardTitle>
                <CardDescription>פעולות רגישות הקשורות למידע שלך</CardDescription>
              </CardHeader>
              <CardContent className="p-6 md:p-8">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    variant="outline" 
                    onClick={exportData}
                    className="flex-1 rounded-xl h-12 gap-2 font-bold border-primary/20 hover:bg-primary/5 text-primary"
                  >
                    <Download className="h-4 w-4" /> ייצוא נתונים (CSV)
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowDeleteAllAlert(true)}
                    className="flex-1 rounded-xl h-12 gap-2 font-bold text-destructive border-destructive/20 hover:bg-destructive/5"
                  >
                    <Trash2 className="h-4 w-4" /> מחיקת כל המידע
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* כפתור שמירה מרכזי */}
            <div className="flex justify-end pt-4">
              <Button 
                onClick={handleSave} 
                disabled={loading}
                className="rounded-full px-12 h-14 bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 text-lg font-black transition-all"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Save className="ml-2 h-5 w-5" /> שמור שינויים</>}
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* מודאל אישור מחיקה */}
      <AlertDialog open={showDeleteAllAlert} onOpenChange={setShowDeleteAllAlert}>
        <AlertDialogContent className="text-right rounded-3xl border-none shadow-2xl max-w-sm">
          <AlertDialogHeader className="items-center">
            <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-4">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <AlertDialogTitle className="text-xl font-bold text-center w-full">למחוק את כל המידע?</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              פעולה זו תנקה את כל המינויים וההגדרות שלך לצמיתות. לא ניתן יהיה לשחזר את הנתונים לאחר מכן.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse sm:justify-center gap-3 mt-6">
            <AlertDialogAction 
              onClick={handleDeleteAll}
              className="bg-destructive hover:bg-destructive/90 rounded-full px-8 h-12 font-bold flex-1"
            >
              כן, מחק הכל
            </AlertDialogAction>
            <AlertDialogCancel className="rounded-full h-12 px-8 font-medium flex-1">ביטול</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function SettingsNavItem({ icon, label, active }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <button className={`w-full flex items-center gap-3 px-5 py-3 rounded-2xl transition-all flex-row-reverse group ${active ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:bg-primary/5 hover:text-primary'}`}>
      <div className={`transition-transform group-hover:scale-110 ${active ? 'text-white' : 'text-muted-foreground'}`}>
        {icon}
      </div>
      <span className="flex-1 text-right font-bold text-sm">{label}</span>
      {active && <CheckCircle2 className="h-4 w-4" />}
    </button>
  )
}
