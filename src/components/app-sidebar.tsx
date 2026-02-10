"use client"

import * as React from "react"
import { 
  LayoutDashboard, 
  List, 
  Calendar, 
  PieChart, 
  Settings, 
  PlusCircle, 
  Sparkles,
  HelpCircle,
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
  useSidebar
} from "@/components/ui/sidebar"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"

export function AppSidebar() {
  const pathname = usePathname()
  const { setOpenMobile } = useSidebar()

  const mainNav = [
    { href: "/", label: "דשבורד", icon: LayoutDashboard },
    { href: "/subscriptions", label: "ניהול מינויים", icon: List },
    { href: "/calendar", label: "לוח שנה לחיובים", icon: Calendar },
  ]

  const toolNav = [
    { href: "#", label: "ניתוח הוצאות", icon: PieChart },
    { href: "#", label: "תובנות AI", icon: Sparkles },
  ]

  return (
    <Sidebar side="right" className="border-l border-border bg-white shadow-xl">
      <SidebarHeader className="h-20 flex items-center justify-center border-b px-6">
        <div className="flex items-center gap-3 font-bold text-primary w-full">
          <div className="bg-primary text-white h-10 w-10 rounded-2xl flex items-center justify-center text-xl shadow-lg shadow-primary/20">🐼</div>
          <span className="text-2xl font-headline tracking-tight">PandaSub</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-right px-4 mb-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">ניווט ראשי</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href} onClick={() => setOpenMobile(false)}>
                    <SidebarMenuButton 
                      isActive={pathname === item.href}
                      className={`w-full flex-row-reverse gap-3 rounded-xl h-12 px-4 transition-all ${
                        pathname === item.href 
                        ? 'bg-primary/10 text-primary font-bold shadow-sm' 
                        : 'hover:bg-primary/5 hover:text-primary'
                      }`}
                    >
                      <item.icon className={`h-5 w-5 ${pathname === item.href ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className="flex-1 text-right">{item.label}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="text-right px-4 mb-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">כלים חכמים</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {toolNav.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton 
                    className="w-full flex-row-reverse gap-3 rounded-xl h-12 px-4 hover:bg-primary/5 hover:text-primary transition-all"
                  >
                    <item.icon className="h-5 w-5 text-muted-foreground" />
                    <span className="flex-1 text-right">{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="w-full flex-row-reverse gap-3 rounded-xl h-10 px-4 hover:bg-primary/5 transition-all text-muted-foreground hover:text-primary">
              <Settings className="h-4 w-4" />
              <span className="flex-1 text-right">הגדרות</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton className="w-full flex-row-reverse gap-3 rounded-xl h-10 px-4 hover:bg-destructive/5 transition-all text-muted-foreground hover:text-destructive">
              <LogOut className="h-4 w-4" />
              <span className="flex-1 text-right">התנתקות</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
