
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
  SidebarRail,
} from "@/components/ui/sidebar";
import { LogOut, LayoutDashboard, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { useDataContext } from "@/context/DataContext";
import { useSidebar } from "@/components/ui/sidebar";

const AdminSidebarContent = () => {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;
  const { users } = useDataContext();
  const adminUser = users.find(u => u.role === 'admin');
  const { state: sidebarState } = useSidebar();

  return (
    <>
       <SidebarHeader>
        <div className="flex items-center gap-2">
            <Logo />
            {sidebarState === 'expanded' && <span className="text-lg font-semibold">Tarefa360</span>}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/admin/dashboard")} tooltip="Painel">
              <Link href="/admin/dashboard">
                <LayoutDashboard />
                <span>Painel</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/admin/profile")} tooltip="Meu Perfil">
              <Link href="/admin/profile">
                <User />
                <span>Meu Perfil</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center gap-3 p-2 border-t">
           <Avatar className="h-10 w-10">
            <AvatarImage src={adminUser?.avatarUrl} alt={adminUser?.name} />
            <AvatarFallback>{adminUser?.name.charAt(0)}</AvatarFallback>
          </Avatar>
          {sidebarState === 'expanded' && (
            <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-semibold truncate">{adminUser?.name}</span>
                <span className="text-xs text-muted-foreground truncate">{adminUser?.email}</span>
            </div>
          )}
        </div>
         <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Sair">
                    <Link href="/">
                    <LogOut />
                    <span>Sair</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
         </SidebarMenu>
      </SidebarFooter>
    </>
  )
}


export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <AdminSidebarContent/>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 items-center justify-start gap-4 border-b bg-card p-4 md:justify-start">
          <SidebarTrigger />
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
