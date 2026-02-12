
"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, Sparkles, Loader2 } from "lucide-react"
import { createSubscriptionFromVoice } from "@/ai/flows/voice-based-subscription-creation"
import { useToast } from "@/hooks/use-toast"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"

export function VoiceCreator() {
  const [isRecording, setIsRecording] = React.useState(false)
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [showConfirm, setShowConfirm] = React.useState(false)
  const [extractedData, setExtractedData] = React.useState<any>(null)
  const { toast } = useToast()

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false)
      processVoice()
    } else {
      setIsRecording(true)
      toast({
        title: "הקלטה פעילה",
        description: "אמור את פרטי המינוי: שם, מחיר ומועד חידוש",
      })
    }
  }

  const processVoice = async () => {
    setIsProcessing(true)
    try {
      const mockVoiceDataUri = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAgD4AAAB9AAACABAAZGF0YQAAAAA="
      const result = await createSubscriptionFromVoice({ voiceDataUri: mockVoiceDataUri })
      setExtractedData(result)
      setShowConfirm(true)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "שגיאה בעיבוד",
        description: "לא הצלחנו להבין את ההקלטה. נסה שוב.",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <>
      <div className="flex flex-col items-center gap-4 p-6 rounded-3xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10 shadow-inner">
        <div className="text-center space-y-2">
          <h3 className="font-bold text-lg">הוספה קולית חכמה</h3>
          <p className="text-sm text-muted-foreground">פשוט תגיד "הוסף נטפליקס ב-55 שקלים כל חודש"</p>
        </div>
        
        <Button 
          size="lg" 
          variant={isRecording ? "destructive" : "default"}
          className={`h-20 w-20 rounded-full shadow-xl transition-all ${isRecording ? 'animate-pulse scale-110' : 'hover:scale-105'}`}
          onClick={toggleRecording}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <Loader2 className="h-10 w-10 animate-spin" />
          ) : isRecording ? (
            <MicOff className="h-10 w-10" />
          ) : (
            <Mic className="h-10 w-10" />
          )}
        </Button>

        {isProcessing && (
          <div className="flex items-center gap-2 text-primary animate-pulse font-bold">
            <Sparkles className="h-5 w-5" />
            Panda AI מנתח את הקול שלך...
          </div>
        )}
      </div>

      <Dialog open={showConfirm} onOpenChange={showConfirm ? setShowConfirm : undefined}>
        <DialogContent className="sm:max-w-md text-right rounded-[2rem] border-none shadow-2xl p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-primary">זיהינו מינוי חדש! 🐼</DialogTitle>
            <DialogDescription id="voice-desc" className="text-base mt-2">
              האם הפרטים שחולצו מהקול שלך נכונים? אשר כדי לשמור אותם במערכת.
            </DialogDescription>
          </DialogHeader>
          {extractedData && (
            <div className="space-y-4 py-6">
              <div className="flex justify-between items-center p-4 bg-primary/5 rounded-2xl">
                <span className="font-black text-lg">{extractedData.subscriptionName}</span>
                <span className="text-xs font-bold text-muted-foreground">שם המינוי</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-primary/5 rounded-2xl">
                <span className="font-black text-lg text-primary">{extractedData.amount} {extractedData.currency}</span>
                <span className="text-xs font-bold text-muted-foreground">סכום</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-primary/5 rounded-2xl">
                <span className="font-black text-lg">{extractedData.renewalDate}</span>
                <span className="text-xs font-bold text-muted-foreground">תאריך חידוש</span>
              </div>
            </div>
          )}
          <DialogFooter className="gap-3 sm:justify-start flex-row-reverse">
            <Button className="bg-primary hover:bg-primary/90 rounded-full px-8 h-12 font-black" onClick={() => {
              setShowConfirm(false)
              toast({ title: "המינוי נוסף בהצלחה!" })
            }}>אישור ושמירה</Button>
            <Button variant="ghost" className="rounded-full h-12 font-bold" onClick={() => setShowConfirm(false)}>ביטול</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
