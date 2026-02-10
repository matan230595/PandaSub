"use client"

import { Bell, Search, User, Menu } from "lucide-react"
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

export function TopNav() {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-md md:px-6">
      <div className="flex items-center gap-2 font-bold text-primary">
        <div className="bg-primary text-primary-foreground h-8 w-8 rounded-lg flex items-center justify-center text-lg">🐼</div>
        <span className="text-xl hidden md:inline-block">PandaSub IL</span>
      </div>

      <div className="mr-auto flex flex-1 items-center gap-4 md:mr-0 md:gap-8 justify-end">
        <form className="hidden lg:flex flex-1 max-w-sm relative">
          <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="חיפוש מינויים..."
            className="w-full bg-secondary pr-9 border-none focus-visible:ring-1"
          />
        </form>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative text-muted-foreground">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 left-2 flex h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full bg-secondary">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 text-right">
              <DropdownMenuLabel>החשבון שלי</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>פרופיל</DropdownMenuItem>
              <DropdownMenuItem>הגדרות תשלום</DropdownMenuItem>
              <DropdownMenuItem>התראות</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">התנתק</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
