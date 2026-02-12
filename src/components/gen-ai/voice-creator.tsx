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
      <div className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 shadow-inner">
        <div className="text-center space-y-2">
          <h3 className="font-bold text-lg">הוספה קולית חכמה</h3>
          <p className="text-sm text-muted-foreground">פשוט תגיד "הוסף נטפליקס ב-55 שקלים כל חודש"</p>
        </div>
        
        <Button 
          size="lg" 
          variant={isRecording ? "destructive" : "default"}
          className={`h-16 w-16 rounded-full shadow-lg transition-all ${isRecording ? 'animate-pulse scale-110' : 'hover:scale-105'}`}
          onClick={toggleRecording}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <Loader2 className="h-8 w-8 animate-spin" />
          ) : isRecording ? (
            <MicOff className="h-8 w-8" />
          ) : (
            <Mic className="h-8 w-8" />
          )}
        </Button>

        {isProcessing && (
          <div className="flex items-center gap-2 text-primary animate-pulse font-medium">
            <Sparkles className="h-4 w-4" />
            מעבד את הבקשה שלך...
          </div>
        )}
      </div>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="sm:max-w-md text-right">
          <DialogHeader>
            <DialogTitle>זיהינו מינוי חדש!</DialogTitle>
            <DialogDescription>האם הפרטים שחולצו מהקול שלך נכונים? אשר כדי לשמור אותם למערכת.</DialogDescription>
          </DialogHeader>
          {extractedData && (
            <div className="space-y-4 py-4">
              <div className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                <span className="font-bold">{extractedData.subscriptionName}</span>
                <span className="text-xs text-muted-foreground">שם המינוי</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                <span className="font-bold">{extractedData.amount} {extractedData.currency}</span>
                <span className="text-xs text-muted-foreground">סכום</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                <span className="font-bold">{extractedData.category}</span>
                <span className="text-xs text-muted-foreground">קטגוריה</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                <span className="font-bold">{extractedData.renewalDate}</span>
                <span className="text-xs text-muted-foreground">תאריך חידוש</span>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:justify-start">
            <Button variant="default" onClick={() => {
              setShowConfirm(false)
              toast({ title: "המינוי נוסף בהצלחה!", description: "המינוי החדש זמין כעת ברשימה." })
            }}>אישור ושמירה</Button>
            <Button variant="outline" onClick={() => setShowConfirm(false)}>ביטול</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
