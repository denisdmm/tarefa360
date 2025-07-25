
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
import { LogOut, LayoutDashboard, Briefcase } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { users } from "@/lib/mock-data";

export default function AppraiserLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = (path: string) => pathname.startsWith(path);
  const appraiser = users.find(u => u.role === 'appraiser');

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
              <SidebarMenuButton asChild isActive={isActive("/appraiser/dashboard")}>
                <Link href="/appraiser/dashboard">
                  <LayoutDashboard />
                  Painel do Avaliador
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/appraisee/dashboard")}>
                <Link href="/appraisee/dashboard">
                  <Briefcase />
                  Minhas Atividades
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <div className="flex items-center gap-3 p-2 border-t">
            <Avatar>
              <AvatarImage src={appraiser?.avatarUrl} alt={appraiser?.name} />
              <AvatarFallback>{appraiser?.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-semibold truncate">{appraiser?.name}</span>
              <span className="text-xs text-muted-foreground truncate">{appraiser?.email}</span>
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
        <header className="flex h-16 items-center justify-between border-b bg-card p-4 sticky top-0 z-10">
          <SidebarTrigger className="md:hidden" />
          <div/>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
