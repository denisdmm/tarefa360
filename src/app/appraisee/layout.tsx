"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { LogOut, Settings, LayoutDashboard } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { users } from "@/lib/mock-data";

export default function AppraiseeLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;
  const appraisee = users.find(u => u.role === 'appraisee');

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Logo />
            <span className="text-lg font-semibold">Tarefa360</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/appraisee/dashboard")}>
                <Link href="/appraisee/dashboard">
                  <LayoutDashboard />
                  Dashboard
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/appraisee/settings")}>
                <Link href="#">
                  <Settings />
                  Settings
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <div className="flex items-center gap-3 p-2 border-t">
            <Avatar>
              <AvatarImage src={appraisee?.avatarUrl} alt={appraisee?.name} />
              <AvatarFallback>{appraisee?.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-semibold truncate">{appraisee?.name}</span>
              <span className="text-xs text-muted-foreground truncate">{appraisee?.email}</span>
            </div>
          </div>
           <Button variant="ghost" className="w-full justify-start gap-2" asChild>
             <Link href="/">
              <LogOut />
              Logout
             </Link>
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 items-center justify-between border-b bg-card p-4 sticky top-0 z-10">
          <SidebarTrigger className="md:hidden" />
          <div/>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
