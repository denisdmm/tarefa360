

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
import Link from "next/link";


export default function ReportsPage() {
    const { evaluationPeriods } = useDataContext();

    return (
        <div className="flex flex-col h-full">
            <main className="flex-1 p-2 md:p-6 overflow-auto">
                 <div className="mb-6">
                    <h1 className="text-3xl font-bold font-headline">Meus Relatórios</h1>
                    <p className="text-muted-foreground">Visualize ou imprima os relatórios de avaliação.</p>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Períodos de Avaliação</CardTitle>
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
                                    <TableHead className="text-center">Ações</TableHead>
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
                                        <TableCell className="text-center">
                                            <Button asChild>
                                                <Link href="/appraisee/report-detail">
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    Visualizar
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {evaluationPeriods.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">Nenhum período de avaliação encontrado.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
