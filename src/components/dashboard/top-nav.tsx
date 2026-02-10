"use client"

import { Bell, Search, User, LayoutDashboard, List, Calendar, PieChart, Settings, X } from "lucide-react"
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
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSubscriptions } from "@/context/subscriptions-context"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

export function TopNav() {
  const pathname = usePathname()
  const { notifications, markNotificationAsRead } = useSubscriptions()
  const unreadCount = notifications.filter(n => !n.read).length

  const navLinks = [
    { href: "/", label: "דשבורד", icon: <LayoutDashboard className="h-4 w-4" /> },
    { href: "/subscriptions", label: "מינויים", icon: <List className="h-4 w-4" /> },
    { href: "/calendar", label: "לוח שנה", icon: <Calendar className="h-4 w-4" /> },
  ]

  return (
    <header className="sticky top-0 z-50 flex h-20 w-full items-center gap-4 border-b bg-white/95 px-4 backdrop-blur-md md:px-8">
      <div className="flex items-center gap-3 font-bold text-primary">
        <div className="bg-primary text-white h-10 w-10 rounded-2xl flex items-center justify-center text-xl shadow-lg shadow-primary/20">🐼</div>
        <span className="text-2xl hidden md:inline-block font-headline tracking-tight">PandaSub</span>
      </div>

      <nav className="hidden lg:flex items-center gap-1 mx-8 bg-muted/50 p-1 rounded-full">
        {navLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <Button 
              variant={pathname === link.href ? "default" : "ghost"} 
              className={`rounded-full gap-2 transition-all ${pathname === link.href ? 'shadow-md' : 'hover:bg-primary/5 hover:text-primary'}`}
              size="sm"
            >
              {link.icon}
              {link.label}
            </Button>
          </Link>
        ))}
      </nav>

      <div className="mr-auto flex flex-1 items-center gap-4 md:mr-0 md:gap-8 justify-end">
        <div className="flex items-center gap-3">
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
              <div className="p-4 bg-muted/30 font-bold border-b text-right">התראות ותזכורות</div>
              <ScrollArea className="h-[300px]">
                {notifications.length > 0 ? (
                  notifications.map(n => (
                    <div 
                      key={n.id} 
                      className={`p-4 border-b hover:bg-muted/20 cursor-pointer transition-colors text-right ${!n.read ? 'bg-primary/5' : ''}`}
                      onClick={() => markNotificationAsRead(n.id)}
                    >
                      <div className="flex justify-between items-start flex-row-reverse">
                        <Badge variant={n.type === 'critical' ? 'destructive' : 'secondary'} className="text-[10px]">
                          {n.type === 'critical' ? 'דחוף' : 'מידע'}
                        </Badge>
                        {!n.read && <div className="h-2 w-2 rounded-full bg-primary" />}
                      </div>
                      <div className="font-bold text-sm mt-1">{n.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{n.message}</div>
                    </div>
                  ))
                ) : (
                  <div className="p-10 text-center text-muted-foreground italic">אין התראות חדשות</div>
                )}
              </ScrollArea>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full bg-muted overflow-hidden hover:ring-2 hover:ring-primary/20 transition-all ripple">
                <div className="bg-primary/10 text-primary h-full w-full flex items-center justify-center font-bold">י</div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 text-right rounded-2xl p-2 shadow-xl border-none mt-2">
              <DropdownMenuLabel className="flex flex-col items-center gap-1 py-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">י</div>
                <div className="font-bold text-lg">ישראל ישראלי</div>
                <div className="text-xs text-muted-foreground font-normal">israel@example.com</div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="rounded-lg gap-2 flex-row-reverse py-3 cursor-pointer">
                <User className="h-4 w-4" /> פרופיל אישי
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg gap-2 flex-row-reverse py-3 cursor-pointer">
                <Settings className="h-4 w-4" /> הגדרות
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="rounded-lg text-destructive focus:bg-destructive/5 focus:text-destructive gap-2 flex-row-reverse py-3 cursor-pointer">
                התנתק
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
