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
  AlertTriangle
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
  
  // הגדרות מקומיות (ניתן לחבר ל-context בעתיד)
  const [userName, setUserName] = React.useState("ישראל ישראלי")
  const [userEmail, setUserEmail] = React.useState("israel@example.com")
  const [darkMode, setDarkMode] = React.useState(false)
  const [pushNotifications, setPushNotifications] = React.useState(true)
  const [currency, setCurrency] = React.useState("₪ - שקל חדש")

  const handleSave = () => {
    setLoading(true)
    // סימולציית שמירה
    setTimeout(() => {
      setLoading(false)
      toast({
        title: "הגדרות נשמרו",
        description: "השינויים עודכנו בהצלחה במערכת.",
      })
    }, 1200)
  }

  const handleDeleteAll = () => {
    // כאן תבוא לוגיקה של ניקוי localStorage
    localStorage.clear()
    toast({
      variant: "destructive",
      title: "המידע נמחק",
      description: "כל הנתונים שלך נמחקו לצמיתות מהמערכת.",
    })
    setShowDeleteAllAlert(false)
    window.location.reload()
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA]">
      <TopNav />
      <main className="flex-1 container mx-auto p-4 md:p-8 space-y-8 animate-fade-in pb-20">
        <div className="text-right">
          <h1 className="text-3xl font-bold tracking-tight">הגדרות מערכת</h1>
          <p className="text-muted-foreground">ניהול פרופיל, אבטחה והעדפות אפליקציה</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* ניווט הגדרות */}
          <div className="lg:col-span-3 space-y-2">
            <SettingsNavItem icon={<User className="h-4 w-4" />} label="פרופיל אישי" active />
            <SettingsNavItem icon={<Bell className="h-4 w-4" />} label="התראות ותזכורות" />
            <SettingsNavItem icon={<Shield className="h-4 w-4" />} label="אבטחה ופרטיות" />
            <SettingsNavItem icon={<Globe className="h-4 w-4" />} label="שפה ומטבע" />
            <SettingsNavItem icon={<Database className="h-4 w-4" />} label="ניהול נתונים" />
          </div>

          {/* תוכן הגדרות */}
          <div className="lg:col-span-9 space-y-6">
            <Card className="card-shadow border-none rounded-3xl overflow-hidden">
              <CardHeader className="border-b bg-muted/20 p-6">
                <CardTitle className="text-xl">פרופיל משתמש</CardTitle>
                <CardDescription>כיצד הפרטים שלך יופיעו במערכת</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="flex flex-col md:flex-row gap-8 items-center flex-row-reverse">
                  <div className="relative group">
                    <div className="h-28 w-28 rounded-full bg-primary/10 flex items-center justify-center text-primary text-4xl font-black border-4 border-white shadow-2xl">י</div>
                    <button className="absolute bottom-1 right-1 bg-primary text-white p-2.5 rounded-full shadow-lg hover:scale-110 transition-transform">
                      <Upload className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex-1 grid gap-6 w-full">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2 text-right">
                        <Label className="font-bold">שם מלא</Label>
                        <Input 
                          value={userName} 
                          onChange={(e) => setUserName(e.target.value)}
                          className="rounded-xl h-12 text-right focus:ring-primary/20" 
                        />
                      </div>
                      <div className="space-y-2 text-right">
                        <Label className="font-bold">אימייל</Label>
                        <Input 
                          type="email"
                          value={userEmail} 
                          onChange={(e) => setUserEmail(e.target.value)}
                          className="rounded-xl h-12 text-right focus:ring-primary/20" 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-shadow border-none rounded-3xl overflow-hidden">
              <CardHeader className="border-b bg-muted/20 p-6">
                <CardTitle className="text-xl">העדפות מערכת</CardTitle>
                <CardDescription>התאמה אישית של חוויית המשתמש</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="flex items-center justify-between flex-row-reverse group">
                  <div className="text-right">
                    <div className="font-bold text-lg">מצב כהה (Dark Mode)</div>
                    <div className="text-sm text-muted-foreground">מעבר אוטומטי בהתאם למערכת ההפעלה</div>
                  </div>
                  <Switch checked={darkMode} onCheckedChange={setDarkMode} />
                </div>
                
                <div className="h-px bg-muted w-full" />

                <div className="flex items-center justify-between flex-row-reverse group">
                  <div className="text-right">
                    <div className="font-bold text-lg">התראות דחיפה (Push)</div>
                    <div className="text-sm text-muted-foreground">קבל התראות על חיובים ישירות לדפדפן</div>
                  </div>
                  <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
                </div>

                <div className="h-px bg-muted w-full" />

                <div className="flex items-center justify-between flex-row-reverse group">
                  <div className="text-right">
                    <div className="font-bold text-lg">מטבע ברירת מחדל</div>
                    <div className="text-sm text-muted-foreground">המטבע שבו יוצגו הסיכומים בדשבורד</div>
                  </div>
                  <select 
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="bg-muted/50 rounded-xl px-4 py-3 text-sm font-bold border-none outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                  >
                    <option value="₪ - שקל חדש">₪ - שקל חדש</option>
                    <option value="$ - דולר ארה\"ב">$ - דולר ארה"ב</option>
                    <option value="€ - אירו">€ - אירו</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            <Card className="card-shadow border-none rounded-3xl border-destructive/20 overflow-hidden">
              <CardHeader className="border-b bg-destructive/5 p-6">
                <CardTitle className="text-xl text-destructive flex items-center gap-2 flex-row-reverse">
                  <AlertTriangle className="h-5 w-5" />
                  אזור רגיש
                </CardTitle>
                <CardDescription>ניהול מידע ומחיקת חשבון</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="flex flex-col md:flex-row gap-4 flex-row-reverse">
                  <Button variant="outline" className="flex-1 gap-2 rounded-xl h-14 font-bold border-primary/20 hover:bg-primary/5 transition-all" onClick={exportData}>
                    <Download className="h-4 w-4" /> ייצוא כל הנתונים (CSV)
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 gap-2 rounded-xl h-14 text-destructive border-destructive/20 hover:bg-destructive/5 font-bold transition-all"
                    onClick={() => setShowDeleteAllAlert(true)}
                  >
                    <Trash2 className="h-4 w-4" /> מחיקת כל המידע לצמיתות
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end pt-6">
              <Button 
                onClick={handleSave} 
                disabled={loading} 
                className="gap-3 rounded-full px-16 h-16 bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/30 text-xl font-black transition-all hover:-translate-y-1"
              >
                {loading ? "שומר..." : <><Save className="h-6 w-6" /> שמור שינויים</>}
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* התראת מחיקה גלובלית */}
      <AlertDialog open={showDeleteAllAlert} onOpenChange={setShowDeleteAllAlert}>
        <AlertDialogContent className="text-right rounded-3xl border-none shadow-2xl max-w-md">
          <AlertDialogHeader className="items-center">
            <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-4 animate-pulse">
              <AlertTriangle className="h-10 w-10" />
            </div>
            <AlertDialogTitle className="text-2xl font-black">מחיקת כל הנתונים?</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-muted-foreground text-lg mt-2">
              פעולה זו תנקה את כל המינויים, ההגדרות והיסטוריית החיובים שלך. **לא ניתן לשחזר פעולה זו.**
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center flex-row-reverse gap-4 mt-8">
            <AlertDialogAction onClick={handleDeleteAll} className="bg-destructive hover:bg-destructive/90 rounded-full px-10 h-14 font-black text-lg shadow-lg shadow-destructive/20">
              כן, מחק הכל
            </AlertDialogAction>
            <AlertDialogCancel className="rounded-full h-14 px-10 font-bold text-lg">ביטול</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function SettingsNavItem({ icon, label, active }: any) {
  return (
    <button className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all flex-row-reverse group ${active ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-muted-foreground hover:bg-primary/5 hover:text-primary'}`}>
      <span className="flex-1 text-right font-black text-sm tracking-tight">{label}</span>
      <div className={`transition-transform group-hover:scale-110 ${active ? 'text-white' : 'text-muted-foreground'}`}>
        {icon}
      </div>
      {active && <CheckCircle2 className="h-4 w-4" />}
    </button>
  )
}
