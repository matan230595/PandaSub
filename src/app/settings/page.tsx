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
  CheckCircle2
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const { exportData } = useSubscriptions()
  const { toast } = useToast()
  const [loading, setLoading] = React.useState(false)

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
            <Card className="card-shadow border-none rounded-3xl">
              <CardHeader className="border-b bg-muted/20">
                <CardTitle className="text-xl">פרופיל משתמש</CardTitle>
                <CardDescription>כיצד הפרטים שלך יופיעו במערכת</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="flex flex-col md:flex-row gap-6 items-center flex-row-reverse">
                  <div className="relative group">
                    <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-bold border-4 border-white shadow-xl">י</div>
                    <button className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <Upload className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex-1 grid gap-4 w-full">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2 text-right">
                        <Label>שם מלא</Label>
                        <Input defaultValue="ישראל ישראלי" className="rounded-xl h-12 text-right" />
                      </div>
                      <div className="space-y-2 text-right">
                        <Label>אימייל</Label>
                        <Input defaultValue="israel@example.com" className="rounded-xl h-12 text-right" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-shadow border-none rounded-3xl">
              <CardHeader className="border-b bg-muted/20">
                <CardTitle className="text-xl">העדפות מערכת</CardTitle>
                <CardDescription>התאמה אישית של חוויית המשתמש</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="flex items-center justify-between flex-row-reverse">
                  <div className="text-right">
                    <div className="font-bold">מצב כהה (Dark Mode)</div>
                    <div className="text-sm text-muted-foreground">מעבר אוטומטי בהתאם למערכת ההפעלה</div>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between flex-row-reverse">
                  <div className="text-right">
                    <div className="font-bold">התראות דחיפה (Push)</div>
                    <div className="text-sm text-muted-foreground">קבל התראות על חיובים ישירות לדפדפן</div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between flex-row-reverse">
                  <div className="text-right">
                    <div className="font-bold">מטבע ברירת מחדל</div>
                    <div className="text-sm text-muted-foreground">המטבע שבו יוצגו הסיכומים בדשבורד</div>
                  </div>
                  <select className="bg-muted/50 rounded-xl px-4 py-2 text-sm font-bold border-none">
                    <option>₪ - שקל חדש</option>
                    <option>$ - דולר ארה"ב</option>
                    <option>€ - אירו</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            <Card className="card-shadow border-none rounded-3xl border-destructive/20 overflow-hidden">
              <CardHeader className="border-b bg-destructive/5">
                <CardTitle className="text-xl text-destructive">אזור רגיש</CardTitle>
                <CardDescription>ניהול מידע ומחיקת חשבון</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="flex flex-col md:flex-row gap-4 flex-row-reverse">
                  <Button variant="outline" className="flex-1 gap-2 rounded-xl h-12" onClick={exportData}>
                    <Download className="h-4 w-4" /> ייצוא כל הנתונים (CSV)
                  </Button>
                  <Button variant="outline" className="flex-1 gap-2 rounded-xl h-12 text-destructive border-destructive/20 hover:bg-destructive/5">
                    <Trash2 className="h-4 w-4" /> מחיקת כל המידע לצמיתות
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end pt-4">
              <Button onClick={handleSave} disabled={loading} className="gap-2 rounded-full px-12 h-14 bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 text-lg font-bold">
                {loading ? "שומר..." : <><Save className="h-5 w-5" /> שמור שינויים</>}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function SettingsNavItem({ icon, label, active }: any) {
  return (
    <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all flex-row-reverse ${active ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:bg-primary/5 hover:text-primary'}`}>
      <span className="flex-1 text-right font-bold text-sm">{label}</span>
      {icon}
      {active && <CheckCircle2 className="h-4 w-4" />}
    </button>
  )
}