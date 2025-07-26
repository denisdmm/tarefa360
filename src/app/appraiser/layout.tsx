
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
import { LogOut, LayoutDashboard, Briefcase, FileText, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Logo } from "@/components/logo";
import { useDataContext } from "@/context/DataContext";
import { useSidebar } from "@/components/ui/sidebar";


const AppraiserSidebarContent = () => {
    const pathname = usePathname();
    const isActive = (path: string) => pathname.startsWith(path);
    const { users } = useDataContext();
    const appraiser = users.find(u => u.role === 'appraiser');
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
                    <SidebarMenuButton asChild isActive={isActive("/appraiser/dashboard")} tooltip="Painel do Avaliador">
                        <Link href="/appraiser/dashboard">
                        <LayoutDashboard />
                        <span>Painel do Avaliador</span>
                        </Link>
                    </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/appraiser/reports")} tooltip="Relatórios">
                        <Link href="/appraiser/reports">
                        <FileText />
                        <span>Relatórios</span>
                        </Link>
                    </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/appraisee/dashboard")} tooltip="Minhas Atividades">
                        <Link href="/appraisee/dashboard">
                        <Briefcase />
                        <span>Minhas Atividades</span>
                        </Link>
                    </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/appraiser/profile")} tooltip="Meu Perfil">
                        <Link href="/appraiser/profile">
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
                    <AvatarImage src={appraiser?.avatarUrl} alt={appraiser?.name} />
                    <AvatarFallback>{appraiser?.name.charAt(0)}</AvatarFallback>
                </Avatar>
                {sidebarState === 'expanded' && (
                    <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-semibold truncate">{appraiser?.name}</span>
                    <span className="text-xs text-muted-foreground truncate">{appraiser?.email}</span>
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

export default function AppraiserLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <AppraiserSidebarContent />
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
