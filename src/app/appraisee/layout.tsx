
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
import { LogOut, LayoutDashboard, FileText, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Logo } from "@/components/logo";
import { useDataContext } from "@/context/DataContext";
import { useSidebar } from "@/components/ui/sidebar";


const AppraiseeSidebarContent = () => {
    const pathname = usePathname();
    const isActive = (path: string) => pathname === path;
    const { loggedInUser } = useDataContext();
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
                    <SidebarMenuButton asChild isActive={isActive("/appraisee/dashboard")} tooltip="Painel">
                    <Link href="/appraisee/dashboard">
                        <LayoutDashboard />
                        {sidebarState === 'expanded' && <span className="truncate">Painel</span>}
                    </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/appraisee/reports")} tooltip="Relatórios">
                    <Link href="/appraisee/reports">
                        <FileText />
                        {sidebarState === 'expanded' && <span className="truncate">Relatórios</span>}
                    </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/appraisee/profile")} tooltip="Meu Perfil">
                    <Link href="/appraisee/profile">
                        <User />
                        {sidebarState === 'expanded' && <span className="truncate">Meu Perfil</span>}
                    </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
                <div className="flex items-center gap-2 p-2 border-t">
                <Avatar className="h-9 w-9">
                    <AvatarImage src={loggedInUser?.avatarUrl} alt={loggedInUser?.name} />
                    <AvatarFallback>{loggedInUser?.name.charAt(0)}</AvatarFallback>
                </Avatar>
                {sidebarState === 'expanded' && (
                    <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-semibold truncate">{loggedInUser?.name}</span>
                    <span className="text-xs text-muted-foreground truncate">{loggedInUser?.email}</span>
                    </div>
                )}
                </div>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="Sair">
                            <Link href="/">
                            <LogOut />
                            {sidebarState === 'expanded' && <span className="truncate">Sair</span>}
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </>
    )
}

export default function AppraiseeLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <AppraiseeSidebarContent />
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 items-center justify-start gap-4 border-b bg-card p-2 md:p-4 md:justify-start">
          <SidebarTrigger />
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
