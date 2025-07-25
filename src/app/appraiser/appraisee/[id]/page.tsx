
"use client";

import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { activities, users, evaluationPeriods } from "@/lib/mock-data";
import type { Activity, User } from "@/lib/types";
import { ArrowLeft, Filter, Printer } from "lucide-react";
import Link from 'next/link';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function AppraiseeDetailView({ params }: { params: { id: string } }) {
  const [appraisee, setAppraisee] = React.useState<User | null>(null);
  const [userActivities, setUserActivities] = React.useState<Activity[]>([]);
  const [filteredActivities, setFilteredActivities] = React.useState<Activity[]>([]);
  const [monthFilter, setMonthFilter] = React.useState('all');
  const [isGeneratingPdf, setIsGeneratingPdf] = React.useState(false);

  React.useEffect(() => {
    const foundUser = users.find(u => u.id === params.id) || null;
    setAppraisee(foundUser);
    const activitiesForUser = activities.filter(a => a.userId === params.id);
    setUserActivities(activitiesForUser);
  }, [params.id]);

  React.useEffect(() => {
    if (monthFilter === 'all') {
      setFilteredActivities(userActivities);
    } else {
      setFilteredActivities(userActivities.filter(a => a.month === monthFilter));
    }
  }, [userActivities, monthFilter]);
  
  const handleDownloadPdf = async () => {
    const reportElement = document.getElementById('print-content');
    if (!reportElement) return;

    setIsGeneratingPdf(true);

    // Temporarily make the element visible for capture
    reportElement.style.display = 'block';
    reportElement.style.fontFamily = `'Times New Roman', Times, serif`;
    reportElement.style.fontSize = '12pt';

    const canvas = await html2canvas(reportElement, {
      scale: 2, // Improve quality
      useCORS: true,
      onclone: (document) => {
        // Ensure styles are applied in the cloned document
        const clonedReport = document.getElementById('print-content');
        if (clonedReport) {
            clonedReport.style.display = 'block';
            clonedReport.style.fontFamily = `'Times New Roman', Times, serif`;
            clonedReport.style.fontSize = '12pt';
        }
      }
    });

    // Hide the element again
    reportElement.style.display = 'none';

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`relatorio-${appraisee?.name.replace(/\s/g, '_')}-${new Date().toISOString().split('T')[0]}.pdf`);
    
    setIsGeneratingPdf(false);
  };

  if (!appraisee) {
    return <div className="p-6">Avaliado não encontrado.</div>;
  }
  
  const allMonths = [
    ...new Set(userActivities.map(a => a.month)),
  ];

  const activePeriod = evaluationPeriods.find(p => p.status === 'Ativo');

  const groupedActivities = filteredActivities.reduce((acc, activity) => {
    const month = activity.month;
    if (!acc[month]) {
      acc[month] = [];
    }
    acc[month].push(activity);
    return acc;
  }, {} as Record<string, Activity[]>);

  const monthOrder = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const sortedMonths = Object.keys(groupedActivities).sort((a, b) => monthOrder.indexOf(a) - monthOrder.indexOf(b));

  return (
    <>
      <div className="print:hidden flex flex-col h-full">
        <header className="bg-card border-b p-4">
          <div className="flex justify-between items-center">
            <div>
              <Button variant="ghost" asChild className="mb-2">
                 <Link href="/appraiser/dashboard">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao Painel
                 </Link>
              </Button>
              <h1 className="text-3xl font-bold font-headline">Relatório de Atividades</h1>
              <div className="flex items-center gap-2 mt-1">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={appraisee.avatarUrl} />
                  <AvatarFallback>{appraisee.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <p className="text-muted-foreground font-medium">{appraisee.name}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={monthFilter} onValueChange={setMonthFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrar por mês" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Meses</SelectItem>
                    {allMonths.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleDownloadPdf} disabled={isGeneratingPdf}>
                <Printer className="mr-2 h-4 w-4" />
                {isGeneratingPdf ? 'Gerando...' : 'Gerar PDF'}
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Card>
            <CardHeader>
              <CardTitle>Visão Geral das Tarefas</CardTitle>
              <CardDescription>
                Lista detalhada de atividades realizadas durante o período de avaliação.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">Título</TableHead>
                    <TableHead>Mês</TableHead>
                    <TableHead className="w-[30%]">Conclusão</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredActivities.map(activity => (
                    <TableRow key={activity.id}>
                      <TableCell className="font-medium">{activity.title}</TableCell>
                      <TableCell>{activity.month}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={activity.completionPercentage} className="w-[80%]" />
                          <span>{activity.completionPercentage}%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                   {filteredActivities.length === 0 && (
                     <TableRow>
                       <TableCell colSpan={3} className="text-center h-24">Nenhuma atividade encontrada para o período ou filtro selecionado.</TableCell>
                     </TableRow>
                   )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </div>

      <div id="print-content" className="hidden print:block p-8 bg-white" style={{ fontFamily: '"Times New Roman", Times, serif', fontSize: '12pt', color: 'black' }}>
        <div className="text-center mb-6">
            <h1 className="text-xl font-bold">FICHA DE REGISTRO DE TRABALHOS REALIZADOS</h1>
        </div>
        
        <table className="w-full border-collapse border border-black mb-6">
            <tbody>
                <tr>
                    <td className="border border-black p-2 font-bold text-center">POSTO/GRAD. E NOME DO AVALIADO</td>
                    <td className="border border-black p-2 font-bold text-center">CARGO/FUNÇÃO</td>
                </tr>
                <tr>
                    <td className="border border-black p-2 text-center">{appraisee.name}</td>
                    <td className="border border-black p-2 text-center">{appraisee.jobTitle}</td>
                </tr>
            </tbody>
        </table>

        <div className="border border-black">
            <div className="text-center p-2 border-b border-black">
                <p className="font-bold">PRINCIPAIS ATIVIDADES DESENVOLVIDAS NO PERÍODO DE AVALIAÇÃO</p>
            </div>
            {activePeriod && (
                <div className="text-center p-1 border-b border-black font-bold">
                    <span>{format(activePeriod.startDate, 'yyyy')}</span>-<span>{format(activePeriod.endDate, 'yyyy')}</span>
                </div>
            )}

            {sortedMonths.map(month => (
              <div key={month}>
                <div className="text-center p-1 border-b border-black font-bold bg-gray-200">
                  {month.toUpperCase()} {activePeriod && format(activePeriod.startDate, 'yyyy')}
                </div>
                <table className="w-full" style={{borderCollapse: 'collapse'}}>
                  <tbody>
                  {groupedActivities[month].map(activity => (
                     <tr key={activity.id}>
                       <td className="w-[15%] p-2 border-r border-black text-center">{activity.completionPercentage}%</td>
                       <td className="p-2 border-b border-black">{activity.title}</td>
                     </tr>
                  ))}
                  </tbody>
                </table>
              </div>
            ))}
             {sortedMonths.length === 0 && (
                <div className="text-center p-4">Nenhuma atividade registrada para o período.</div>
            )}
        </div>
        
      </div>
    </>
  );
}
