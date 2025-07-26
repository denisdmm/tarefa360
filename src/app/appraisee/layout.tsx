
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
import { LogOut, LayoutDashboard, FileText, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { useDataContext } from "@/context/DataContext";

export default function AppraiseeLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;
  const { users } = useDataContext();
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
                  Painel
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/appraisee/reports")}>
                <Link href="/appraisee/reports">
                  <FileText />
                  Relatórios
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/appraisee/profile")}>
                <Link href="/appraisee/profile">
                  <User />
                  Meu Perfil
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <div className="flex items-center gap-3 p-2 border-t">
            <Avatar className="h-10 w-10">
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
              Sair
             </Link>
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 items-center justify-end gap-4 border-b bg-card p-4 md:justify-end">
          <SidebarTrigger className="md:hidden" />
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
