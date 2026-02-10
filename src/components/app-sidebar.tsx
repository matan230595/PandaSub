"use client"

import * as React from "react"
import { 
  LayoutDashboard, 
  List, 
  Calendar as CalendarIcon, 
  PieChart, 
  Settings, 
  Sparkles,
  LogOut
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarTrigger,
  SidebarRail,
  useSidebar
} from "@/components/ui/sidebar"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function AppSidebar() {
  const pathname = usePathname()
  const { setOpenMobile, state } = useSidebar()
  const isCollapsed = state === "collapsed"

  const mainNav = [
    { href: "/", label: "דשבורד", icon: LayoutDashboard },
    { href: "/subscriptions", label: "ניהול מינויים", icon: List },
    { href: "/calendar", label: "לוח שנה לחיובים", icon: CalendarIcon },
  ]

  const toolNav = [
    { href: "/analysis", label: "ניתוח הוצאות", icon: PieChart },
    { href: "/insights", label: "תובנות AI", icon: Sparkles },
  ]

  return (
    <Sidebar side="right" className="border-l border-border bg-white shadow-xl transition-all duration-300" collapsible="icon">
      <SidebarHeader className="h-20 flex flex-row items-center justify-between border-b px-4">
        <div className={`flex items-center gap-3 font-bold text-primary overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-full opacity-100'}`}>
          <div className="bg-primary text-white h-10 w-10 min-w-[40px] rounded-2xl flex items-center justify-center text-xl shadow-lg shadow-primary/20">🐼</div>
          <span className="text-2xl font-headline tracking-tight whitespace-nowrap">PandaSub</span>
        </div>
        <SidebarTrigger className="h-10 w-10 text-primary hover:bg-primary/5 rounded-xl" />
      </SidebarHeader>
      
      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className={`text-right px-4 mb-2 text-xs font-bold text-muted-foreground uppercase tracking-wider transition-opacity ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
            ניווט ראשי
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href} onClick={() => setOpenMobile(false)}>
                    <SidebarMenuButton 
                      isActive={pathname === item.href}
                      tooltip={item.label}
                      className={`w-full flex-row-reverse gap-3 rounded-xl h-12 px-4 transition-all ${
                        pathname === item.href 
                        ? 'bg-primary/10 text-primary font-bold shadow-sm' 
                        : 'hover:bg-primary/5 hover:text-primary'
                      }`}
                    >
                      <item.icon className={`h-5 w-5 min-w-[20px] ${pathname === item.href ? 'text-primary' : 'text-muted-foreground'}`} />
                      {!isCollapsed && <span className="flex-1 text-right">{item.label}</span>}
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-4">
          {!isCollapsed && (
            <SidebarGroupLabel className="text-right px-4 mb-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
              כלים חכמים
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {toolNav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href} onClick={() => setOpenMobile(false)}>
                    <SidebarMenuButton 
                      isActive={pathname === item.href}
                      tooltip={item.label}
                      className={`w-full flex-row-reverse gap-3 rounded-xl h-12 px-4 transition-all ${
                        pathname === item.href 
                        ? 'bg-primary/10 text-primary font-bold shadow-sm' 
                        : 'hover:bg-primary/5 hover:text-primary'
                      }`}
                    >
                      <item.icon className={`h-5 w-5 min-w-[20px] ${pathname === item.href ? 'text-primary' : 'text-muted-foreground'}`} />
                      {!isCollapsed && <span className="flex-1 text-right">{item.label}</span>}
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="p-4 border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/settings" onClick={() => setOpenMobile(false)}>
              <SidebarMenuButton 
                isActive={pathname === "/settings"}
                tooltip="הגדרות" 
                className={`w-full flex-row-reverse gap-3 rounded-xl h-10 px-4 transition-all ${
                  pathname === "/settings" 
                  ? 'bg-primary/10 text-primary font-bold' 
                  : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                }`}
              >
                <Settings className="h-4 w-4 min-w-[16px]" />
                {!isCollapsed && <span className="flex-1 text-right">הגדרות</span>}
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="התנתקות" className="w-full flex-row-reverse gap-3 rounded-xl h-10 px-4 hover:bg-destructive/5 transition-all text-muted-foreground hover:text-destructive">
              <LogOut className="h-4 w-4 min-w-[16px]" />
              {!isCollapsed && <span className="flex-1 text-right">התנתקות</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}