
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
import { useDataContext } from '@/context/DataContext';
import type { Activity, User, ProgressEntry } from "@/lib/types";
import { ArrowLeft, Filter, Printer } from "lucide-react";
import Link from 'next/link';
import { format, getMonth, getYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

type MonthlyActivity = Activity & {
    progressForMonth: ProgressEntry;
};

export default function AppraiseeDetailView({ params }: { params: { id: string } }) {
  const { users, activities, evaluationPeriods } = useDataContext();
  const [appraisee, setAppraisee] = React.useState<User | null>(null);
  const [monthFilter, setMonthFilter] = React.useState('all');
  const [isGeneratingPdf, setIsGeneratingPdf] = React.useState(false);

  React.useEffect(() => {
    const foundUser = users.find(u => u.id === params.id) || null;
    setAppraisee(foundUser);
  }, [params.id, users]);

  const getActivitiesByMonth = React.useCallback(() => {
    const userActivities = activities.filter(a => a.userId === params.id);
    const monthlyData: Record<string, MonthlyActivity[]> = {};

    userActivities.forEach(activity => {
        // Ensure there is a 0% progress entry for the start date if no other entry exists for that month
        const startYear = getYear(activity.startDate);
        const startMonth = getMonth(activity.startDate) + 1;
        const startMonthKey = format(activity.startDate, 'yyyy-MM');
        
        const hasEntryForStartMonth = activity.progressHistory.some(p => p.year === startYear && p.month === startMonth);
        
        const historyWithBaseline = [...activity.progressHistory];

        if (!hasEntryForStartMonth) {
            historyWithBaseline.unshift({
                year: startYear,
                month: startMonth,
                percentage: 0,
                comment: "Início da atividade."
            });
        }


        historyWithBaseline.forEach(progress => {
            const monthYearKey = format(new Date(progress.year, progress.month - 1), 'yyyy-MM');
            if (!monthlyData[monthYearKey]) {
                monthlyData[monthYearKey] = [];
            }
             // Avoid duplicating activity if multiple progress points are in the same month (take latest)
            const existingActivityIndex = monthlyData[monthYearKey].findIndex(a => a.id === activity.id);
            if (existingActivityIndex > -1) {
                // Replace if current progress is more recent (e.g. user edits)
                // This scenario is less likely with one entry per month, but good practice
                monthlyData[monthYearKey][existingActivityIndex].progressForMonth = progress;
            } else {
                 monthlyData[monthYearKey].push({
                    ...activity,
                    progressForMonth: progress,
                });
            }
        });
    });
    return monthlyData;
  }, [activities, params.id]);

  const [monthlyActivities, setMonthlyActivities] = React.useState<Record<string, MonthlyActivity[]>>({});

  React.useEffect(() => {
      setMonthlyActivities(getActivitiesByMonth());
  }, [getActivitiesByMonth]);

  const filteredMonths = React.useMemo(() => {
    const allKeys = Object.keys(monthlyActivities).sort().reverse(); // Sort descending
    if (monthFilter === 'all') {
      return allKeys;
    }
    return allKeys.filter(key => key === monthFilter);
  }, [monthlyActivities, monthFilter]);
  
  const handleDownloadPdf = async () => {
    const reportElement = document.getElementById('print-content');
    if (!reportElement) return;

    setIsGeneratingPdf(true);

    reportElement.style.display = 'block';

    const canvas = await html2canvas(reportElement, {
      scale: 2,
      useCORS: true,
    });

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
  
  const allMonthsOptions = Object.keys(monthlyActivities).map(key => {
    const [year, month] = key.split('-').map(Number);
    return {
        value: key,
        label: format(new Date(year, month - 1), "MMMM 'de' yyyy", {locale: ptBR})
    };
  }).sort((a,b) => b.value.localeCompare(a.value));


  const activePeriod = evaluationPeriods.find(p => p.status === 'Ativo');

  const pdfMonths = React.useMemo(() => {
    return [...filteredMonths].sort();
  }, [filteredMonths]);

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
                    {allMonthsOptions.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
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

        <main className="flex-1 p-4 md:p-6 overflow-auto space-y-6">
          {filteredMonths.length > 0 ? filteredMonths.map(monthKey => {
            const [year, month] = monthKey.split('-').map(Number);
             return (
                <Card key={monthKey}>
                    <CardHeader>
                    <CardTitle>{format(new Date(year, month -1), "MMMM 'de' yyyy", {locale: ptBR})}</CardTitle>
                    <CardDescription>
                        Atividades com progresso registrado neste mês.
                    </CardDescription>
                    </CardHeader>
                    <CardContent>
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead className="w-[40%]">Título</TableHead>
                            <TableHead className="w-[40%]">Comentário do Mês</TableHead>
                            <TableHead>Progresso no Mês</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                         {monthlyActivities[monthKey].map(activity => (
                            <TableRow key={`${activity.id}-${monthKey}`}>
                            <TableCell className="font-medium">{activity.title}</TableCell>
                            <TableCell className="text-muted-foreground italic">"{activity.progressForMonth.comment || 'N/A'}"</TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                <Progress value={activity.progressForMonth.percentage} className="w-[80%]" />
                                <span>{activity.progressForMonth.percentage}%</span>
                                </div>
                            </TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                    </CardContent>
                </Card>
             )
          }) : (
            <div className="text-center py-12 text-muted-foreground">
                <p>Nenhuma atividade encontrada para o período ou filtro selecionado.</p>
            </div>
          )}
        </main>
      </div>

      {/* Content for PDF Generation */}
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

              {pdfMonths.map(monthKey => {
                const [year, month] = monthKey.split('-').map(Number);
                return (
                  <div key={monthKey}>
                    <div className="text-center p-1 border-b border-black font-bold bg-gray-200">
                      {format(new Date(year, month - 1), "MMMM 'de' yyyy", {locale: ptBR}).toUpperCase()}
                    </div>
                    <table className="w-full" style={{borderCollapse: 'collapse'}}>
                      <tbody>
                      {monthlyActivities[monthKey].map(activity => (
                        <tr key={`${activity.id}-${monthKey}-pdf`}>
                          <td className="w-[15%] p-2 border border-black text-center">{activity.progressForMonth.percentage}%</td>
                          <td className="p-2 border border-black text-left">{activity.title} - <i>{activity.progressForMonth.comment || 'Nenhum comentário.'}</i></td>
                        </tr>
                      ))}
                      </tbody>
                    </table>
                  </div>
                )
              })}
              {pdfMonths.length === 0 && (
                  <div className="text-center p-4">Nenhuma atividade registrada para o período.</div>
              )}
          </div>
      </div>
    </>
  );
}

    
