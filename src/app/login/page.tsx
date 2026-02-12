"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/firebase"
import { auth } from "@/lib/firebaseClient"
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Mail, Lock, UserPlus, LogIn } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [isRegistering, setIsRegistering] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const { user } = useUser()
  const router = useRouter()
  const { toast } = useToast()

  React.useEffect(() => {
    if (user) router.push("/")
  }, [user, router])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!auth) {
      toast({ variant: "destructive", title: "שגיאה", description: "שירותי Firebase אינם זמינים כרגע." });
      return;
    }
    setIsLoading(true)
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password)
        toast({ title: "חשבון נוצר בהצלחה", description: "ברוכים הבאים ל-PandaSub!" })
      } else {
        await signInWithEmailAndPassword(auth, email, password)
        toast({ title: "מחובר בהצלחה", description: "שמחים לראות אותך שוב." })
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "שגיאה", description: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] p-4" dir="rtl">
      <Card className="w-full max-w-md rounded-[2.5rem] shadow-2xl border-none overflow-hidden bg-white">
        <div className="bg-primary p-8 text-center text-white">
          <div className="bg-white/20 h-20 w-20 rounded-[1.5rem] flex items-center justify-center text-4xl shadow-lg mx-auto mb-4">🐼</div>
          <CardTitle className="text-3xl font-black">PandaSub IL</CardTitle>
          <CardDescription className="text-white/80 font-medium text-center">ניהול מינויים חכם לעידן החדש</CardDescription>
        </div>
        <CardContent className="p-8">
          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-2 text-right">
              <Label htmlFor="email" className="font-bold flex items-center gap-2 justify-end">
                אימייל <Mail className="h-4 w-4" />
              </Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="example@mail.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                className="rounded-xl h-12 text-right" 
              />
            </div>
            <div className="space-y-2 text-right">
              <Label htmlFor="password" className="font-bold flex items-center gap-2 justify-end">
                סיסמה <Lock className="h-4 w-4" />
              </Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                className="rounded-xl h-12 text-right" 
              />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full h-14 rounded-full font-black text-lg google-btn">
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : isRegistering ? <><UserPlus className="ml-2 h-5 w-5" /> הרשמה</> : <><LogIn className="ml-2 h-5 w-5" /> התחברות</>}
            </Button>
          </form>
          <div className="mt-6 flex flex-col gap-3">
            <Button variant="ghost" onClick={() => setIsRegistering(!isRegistering)} className="rounded-full font-bold">
              {isRegistering ? "כבר יש לי חשבון? התחבר" : "אין לך חשבון? הירשם עכשיו"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
