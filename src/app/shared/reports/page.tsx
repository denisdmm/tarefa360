
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { evaluationPeriods as mockPeriods, users } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

// This is a shared component, so we need to know who is viewing it.
// In a real app, this would come from an auth context.
// For now, we'll hardcode it, assuming the appraisee is logged in.
const FAKE_LOGGED_IN_USER_ID = 'user-appraisee-1';

export default function ReportsPage() {
    const router = useRouter();
    const currentUser = users.find(u => u.id === FAKE_LOGGED_IN_USER_ID);

    const handleView = (periodId: string) => {
        if (!currentUser) return;
        
        let reportUrl = '';

        if (currentUser.role === 'appraisee') {
            // Appraisee views their own report
            reportUrl = `/appraiser/appraisee/${currentUser.id}`;
        }
        // Note: Appraiser logic is now handled in its own dedicated page.
        
        // In a real app, we might pass the periodId to the report page
        // so it can filter the activities for that specific period.
        if(reportUrl) {
            router.push(reportUrl);
        }
    };

    return (
        <div className="flex flex-col h-full">
            <header className="bg-card border-b p-4">
                <h1 className="text-3xl font-bold font-headline">Relatórios Gerenciais</h1>
                <p className="text-muted-foreground">Visualize ou imprima os relatórios de avaliação.</p>
            </header>
            <main className="flex-1 p-4 md:p-6 overflow-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>Meus Períodos de Avaliação</CardTitle>
                        <CardDescription>Selecione um período para ver o seu relatório de atividades.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nome do Período</TableHead>
                                    <TableHead>Data de Início</TableHead>
                                    <TableHead>Data de Fim</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockPeriods.map((period) => (
                                    <TableRow key={period.id}>
                                        <TableCell className="font-medium">{period.name}</TableCell>
                                        <TableCell>{format(period.startDate, 'dd/MM/yyyy')}</TableCell>
                                        <TableCell>{format(period.endDate, 'dd/MM/yyyy')}</TableCell>
                                        <TableCell>
                                            <Badge variant={period.status === 'Ativo' ? 'default' : 'outline'}>{period.status}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button onClick={() => handleView(period.id)}>
                                                <Eye className="mr-2 h-4 w-4" />
                                                Visualizar
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
