"use client"

import { Bell, Search, User, Menu, X, Calendar as CalendarIcon, Info, AlertCircle, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { useSubscriptions } from "@/context/subscriptions-context"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function TopNav() {
  const { notifications, markNotificationAsRead } = useSubscriptions()
  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <header className="sticky top-0 z-40 flex h-20 w-full items-center gap-4 border-b bg-white/95 px-4 backdrop-blur-md md:px-8">
      <div className="flex items-center gap-4 lg:hidden">
        <SidebarTrigger />
      </div>

      <div className="relative flex-1 max-w-md hidden md:block">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="חיפוש מהיר..." 
          className="pr-10 rounded-full border-none bg-muted/50 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all text-right" 
        />
      </div>

      <div className="mr-auto flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative text-muted-foreground rounded-full hover:bg-primary/5 hover:text-primary ripple">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-2.5 right-2.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-white ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 text-right rounded-2xl p-0 shadow-xl border-none mt-2 overflow-hidden">
            <div className="p-4 bg-muted/30 font-bold border-b text-right flex items-center justify-between flex-row-reverse">
              <span>התראות ותזכורות</span>
              {unreadCount > 0 && <Badge variant="destructive" className="rounded-full text-[10px]">{unreadCount} חדשות</Badge>}
            </div>
            <ScrollArea className="h-[400px]">
              {notifications.length > 0 ? (
                notifications.map(n => (
                  <div 
                    key={n.id} 
                    className={`p-4 border-b hover:bg-muted/20 cursor-pointer transition-colors text-right relative ${!n.read ? 'bg-primary/5' : ''}`}
                    onClick={() => markNotificationAsRead(n.id)}
                  >
                    <div className="flex justify-between items-start flex-row-reverse mb-1">
                      <div className="flex items-center gap-2">
                        {n.priority === 'critical' && <Zap className="h-3 w-3 text-destructive animate-pulse" />}
                        {n.priority === 'high' && <AlertCircle className="h-3 w-3 text-orange-500" />}
                        <Badge 
                          variant={n.type === 'critical' ? 'destructive' : 'secondary'} 
                          className={`text-[9px] px-1.5 ${n.priority === 'high' ? 'bg-orange-500 hover:bg-orange-600' : ''}`}
                        >
                          {n.priority === 'critical' ? 'קריטי' : n.priority === 'high' ? 'דחוף' : 'מידע'}
                        </Badge>
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(n.date).toLocaleDateString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="font-bold text-sm text-foreground">{n.title}</div>
                    <div className="text-xs text-muted-foreground mt-1 leading-relaxed">{n.message}</div>
                    {!n.read && <div className="absolute right-1 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-primary" />}
                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-muted-foreground italic flex flex-col items-center gap-2">
                  <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center text-2xl">✨</div>
                  אין התראות חדשות
                </div>
              )}
            </ScrollArea>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="rounded-full gap-3 bg-muted/30 hover:bg-muted/50 transition-all pr-2 ripple h-10">
              <div className="bg-primary text-white h-8 w-8 rounded-full flex items-center justify-center font-bold shadow-sm">י</div>
              <span className="text-sm font-medium hidden sm:inline-block">ישראל ישראלי</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 text-right rounded-2xl p-2 shadow-xl border-none mt-2">
            <DropdownMenuLabel className="flex flex-col items-center gap-1 py-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold border-2 border-primary/20">י</div>
              <div className="font-bold text-lg mt-2">ישראל ישראלי</div>
              <div className="text-xs text-muted-foreground font-normal">israel@example.com</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="rounded-lg gap-2 flex-row-reverse py-3 cursor-pointer">
              <User className="h-4 w-4" /> פרופיל אישי
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-lg gap-2 flex-row-reverse py-3 cursor-pointer">
              <CalendarIcon className="h-4 w-4" /> היסטוריית חיובים
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="rounded-lg text-destructive focus:bg-destructive/5 focus:text-destructive gap-2 flex-row-reverse py-3 cursor-pointer">
              התנתק מהמערכת
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}