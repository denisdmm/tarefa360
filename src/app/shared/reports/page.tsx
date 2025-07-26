
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDataContext } from "@/context/DataContext";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useRouter } from "next/navigation";


export default function ReportsPage() {
    const router = useRouter();
    const { evaluationPeriods, loggedInUser } = useDataContext();

    const handleView = (periodId: string) => {
        if (!loggedInUser) return;
        
        let reportUrl = '';

        if (loggedInUser.role === 'appraisee' || loggedInUser.role === 'appraiser') {
            reportUrl = `/appraiser/appraisee/${loggedInUser.id}`;
        }
        
        if(reportUrl) {
            router.push(reportUrl);
        }
    };

    return (
        <div className="flex flex-col h-full">
            <header className="bg-card border-b p-2 md:p-4">
                <h1 className="text-3xl font-bold font-headline">Relatórios Gerenciais</h1>
                <p className="text-muted-foreground">Visualize ou imprima os relatórios de avaliação.</p>
            </header>
            <main className="flex-1 p-2 md:p-6 overflow-auto">
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
                                {evaluationPeriods.map((period) => (
                                    <TableRow key={period.id}>
                                        <TableCell className="font-medium">{period.name}</TableCell>
                                        <TableCell>{format(period.startDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</TableCell>
                                        <TableCell>{format(period.endDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</TableCell>
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
