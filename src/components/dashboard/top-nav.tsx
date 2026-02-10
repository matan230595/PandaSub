"use client"

import { Bell, Search, User, LayoutDashboard, List, Calendar, PieChart, Settings } from "lucide-react"
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

export function TopNav() {
  const pathname = usePathname()

  const navLinks = [
    { href: "/", label: "דשבורד", icon: <LayoutDashboard className="h-4 w-4" /> },
    { href: "/subscriptions", label: "מינויים", icon: <List className="h-4 w-4" /> },
    { href: "/calendar", label: "לוח שנה", icon: <Calendar className="h-4 w-4" /> },
    { href: "/stats", label: "סטטיסטיקה", icon: <PieChart className="h-4 w-4" /> },
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
        <form className="hidden xl:flex flex-1 max-w-sm relative group">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            type="search"
            placeholder="חיפוש מהיר..."
            className="w-full bg-muted/50 border-none rounded-full pr-10 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:bg-white transition-all h-10"
          />
        </form>
        
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="relative text-muted-foreground rounded-full hover:bg-primary/5 hover:text-primary">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2.5 right-2.5 flex h-2 w-2 rounded-full bg-destructive ring-2 ring-white" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full bg-muted overflow-hidden hover:ring-2 hover:ring-primary/20 transition-all">
                <div className="bg-primary/10 text-primary h-full w-full flex items-center justify-center font-bold">י</div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64 text-right rounded-2xl p-2 shadow-xl border-none mt-2">
              <DropdownMenuLabel className="flex flex-col items-center gap-1 py-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">י</div>
                <div className="font-bold text-lg">ישראל ישראלי</div>
                <div className="text-xs text-muted-foreground font-normal">israel@example.com</div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="rounded-lg gap-2 flex-row-reverse py-3">
                <User className="h-4 w-4" /> פרופיל אישי
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg gap-2 flex-row-reverse py-3">
                <Settings className="h-4 w-4" /> הגדרות מערכת
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="rounded-lg text-destructive focus:bg-destructive/5 focus:text-destructive gap-2 flex-row-reverse py-3">
                התנתק מהחשבון
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}