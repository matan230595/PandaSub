
"use client"

import { Bell, Search, User, X, Calendar as CalendarIcon, Zap } from "lucide-react"
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
  const { notifications, markNotificationAsRead, settings } = useSubscriptions()
  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <header className="sticky top-0 z-40 flex h-16 md:h-20 w-full items-center justify-between border-b bg-white/95 px-4 backdrop-blur-md md:px-8" dir="rtl">
      <div className="flex items-center gap-3">
        <SidebarTrigger />
        
        {/* User & Notifications */}
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative text-muted-foreground rounded-full hover:bg-primary/5 hover:text-primary h-10 w-10">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-2.5 right-2.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-destructive text-[8px] text-white ring-2 ring-white">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 md:w-80 text-right rounded-2xl p-0 shadow-xl border-none mt-2 overflow-hidden">
              <div className="p-4 bg-muted/30 font-bold border-b text-right flex items-center justify-between">
                {unreadCount > 0 && <Badge variant="destructive" className="rounded-full text-[9px] h-5">{unreadCount} חדשות</Badge>}
                <span className="text-sm">התראות ותזכורות</span>
              </div>
              <ScrollArea className="h-[300px] md:h-[400px]">
                {notifications.length > 0 ? (
                  notifications.map(n => (
                    <div 
                      key={n.id} 
                      className={`p-4 border-b hover:bg-muted/20 cursor-pointer transition-colors text-right relative ${!n.read ? 'bg-primary/5' : ''}`}
                      onClick={() => markNotificationAsRead(n.id)}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[9px] text-muted-foreground tabular-nums">
                          {new Date(n.date).toLocaleDateString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <div className="flex items-center gap-2">
                          {n.priority === 'critical' && <Zap className="h-3 w-3 text-destructive animate-pulse" />}
                          <Badge 
                            variant={n.priority === 'critical' ? 'destructive' : 'secondary'} 
                            className="text-[8px] px-1.5 h-4"
                          >
                            {n.priority === 'critical' ? 'קריטי' : n.priority === 'high' ? 'דחוף' : 'מידע'}
                          </Badge>
                        </div>
                      </div>
                      <div className="font-bold text-xs text-foreground">{n.title}</div>
                      <div className="text-[10px] text-muted-foreground mt-1 leading-relaxed">{n.message}</div>
                      {!n.read && <div className="absolute right-1 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-primary" />}
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center text-muted-foreground italic flex flex-col items-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-muted/50 flex items-center justify-center text-xl">✨</div>
                    <span className="text-xs">אין התראות חדשות</span>
                  </div>
                )}
              </ScrollArea>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="rounded-full gap-2 bg-muted/30 hover:bg-muted/50 transition-all h-10 px-3 pr-1.5">
                <span className="text-xs font-bold hidden sm:inline-block truncate max-w-[80px]">{settings.userName}</span>
                <div className="bg-primary text-white h-7 w-7 rounded-full flex items-center justify-center font-bold shadow-sm text-xs">{settings.userName.charAt(0)}</div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 md:w-64 text-right rounded-2xl p-2 shadow-xl border-none mt-2">
              <DropdownMenuLabel className="flex flex-col items-center gap-1 py-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-bold border-2 border-primary/20">{settings.userName.charAt(0)}</div>
                <div className="font-bold text-base mt-1">{settings.userName}</div>
                <div className="text-[10px] text-muted-foreground font-normal">{settings.userEmail}</div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="rounded-xl flex-row-reverse py-2.5 cursor-pointer text-xs font-bold">
                <User className="ml-2 h-3.5 w-3.5" /> פרופיל אישי
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-xl flex-row-reverse py-2.5 cursor-pointer text-xs font-bold">
                <CalendarIcon className="ml-2 h-3.5 w-3.5" /> היסטוריית חיובים
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="rounded-xl text-destructive focus:bg-destructive/5 focus:text-destructive flex-row-reverse py-2.5 cursor-pointer text-xs font-bold">
                <X className="ml-2 h-3.5 w-3.5" /> התנתק
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative flex-1 max-w-md hidden sm:block mx-6">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="חיפוש מהיר..." 
          className="pr-10 rounded-full border-none bg-muted/50 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all text-right h-10" 
        />
      </div>
      
      <div className="hidden lg:block w-10"></div>
    </header>
  )
}
