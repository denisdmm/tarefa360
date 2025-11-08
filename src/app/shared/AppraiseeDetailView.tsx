
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
import type { Activity, User, EvaluationPeriod } from "@/lib/types";
import { ArrowLeft, Filter, Printer, Eye } from "lucide-react";
import Link from 'next/link';
import { format, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Dialog } from '@/components/ui/dialog';
import { ActivityForm } from '@/app/shared/ActivityForm';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: { finalY: number };
  }
}

type MonthlyActivity = {
    id: string;
    title: string;
    description: string;
    totalPercentage: number;
    comments: string[];
    originalActivity: Activity;
};

export function AppraiseeDetailView({ userId }: { userId: string }) {
  const { users, activities, evaluationPeriods, loggedInUser, associations } = useDataContext();
  
  const [appraisee, setAppraisee] = React.useState<User | null>(null);
  const [selectedPeriodId, setSelectedPeriodId] = React.useState<string>('');
  const [monthFilter, setMonthFilter] = React.useState('all');
  const [isGeneratingPdf, setIsGeneratingPdf] = React.useState(false);
  
  const [selectedActivity, setSelectedActivity] = React.useState<Activity | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const relevantPeriods = React.useMemo(() => {
    if (!loggedInUser || loggedInUser.role !== 'appraiser') {
      return evaluationPeriods;
    }

    const myAppraiseeIds = associations
      .filter(assoc => assoc.appraiserId === loggedInUser.id)
      .map(assoc => assoc.appraiseeId);
    
    myAppraiseeIds.push(loggedInUser.id); // Include appraiser's own activities

    const userActivities = activities.filter(act => myAppraiseeIds.includes(act.userId));
    
    const activeYears = new Set<number>();
    userActivities.forEach(act => {
        const startDate = (act.startDate as any).seconds 
            ? (act.startDate as any).toDate() 
            : new Date(act.startDate as any);
        activeYears.add(startDate.getFullYear());
        
        act.progressHistory.forEach(prog => {
            activeYears.add(prog.year);
        });
    });
    
    // An evaluation period (e.g., "Periodo 2024") runs from Nov 2023 to Oct 2024.
    // So, an activity in 2023 could belong to the 2024 period.
    const relevantEvalYears = new Set<number>();
    activeYears.forEach(year => {
        relevantEvalYears.add(year);
        relevantEvalYears.add(year + 1); // An activity in Nov/Dec belongs to the next eval year
    });

    return evaluationPeriods.filter(period => {
        const periodNameYear = parseInt(period.name.split(' ')[3]);
        return relevantEvalYears.has(periodNameYear);
    });

  }, [loggedInUser, activities, evaluationPeriods, associations]);


  const selectedPeriod = React.useMemo(() => {
    const periods = relevantPeriods.length > 0 ? relevantPeriods : evaluationPeriods;
    if (!selectedPeriodId) {
      const activePeriod = periods.find(p => p.status === 'Ativo');
      return activePeriod ?? (periods.length > 0 ? periods[0] : null);
    }
    return periods.find(p => p.id === selectedPeriodId) ?? null;
  }, [selectedPeriodId, relevantPeriods, evaluationPeriods]);

  React.useEffect(() => {
    const foundUser = users.find(u => u.id === userId) || null;
    setAppraisee(foundUser);
  }, [userId, users]);

  React.useEffect(() => {
    const periods = relevantPeriods.length > 0 ? relevantPeriods : evaluationPeriods;
    if (periods.length > 0 && !selectedPeriodId) {
      const activePeriod = periods.find(p => p.status === 'Ativo');
      if (activePeriod) {
        setSelectedPeriodId(activePeriod.id);
      } else if (periods[0]) {
        setSelectedPeriodId(periods[0].id);
      }
    }
  }, [relevantPeriods, evaluationPeriods, selectedPeriodId]);

  const monthlyActivities = React.useMemo(() => {
    if (!selectedPeriod || !appraisee) return {};

    const periodInterval = {
        start: new Date(selectedPeriod.startDate as any),
        end: new Date(selectedPeriod.endDate as any),
    };

    const userActivities = activities.filter(a => {
        if (a.userId !== appraisee.id) return false;
        const activityStartDate = (a.startDate as any).seconds 
            ? (a.startDate as any).toDate() 
            : new Date(a.startDate as any);
        return isWithinInterval(activityStartDate, periodInterval);
    });

    const monthlyData: Record<string, Record<string, MonthlyActivity>> = {};

    userActivities.forEach(activity => {
      activity.progressHistory.forEach(progress => {
        const progressDate = new Date(progress.year, progress.month - 1);
        if (isWithinInterval(progressDate, periodInterval)) {
          const monthYearKey = format(progressDate, 'yyyy-MM');
          if (!monthlyData[monthYearKey]) monthlyData[monthYearKey] = {};
          if (!monthlyData[monthYearKey][activity.id]) {
            monthlyData[monthYearKey][activity.id] = {
                id: activity.id,
                title: activity.title,
                description: activity.description,
                totalPercentage: 0,
                comments: [],
                originalActivity: activity
            };
          }
          monthlyData[monthYearKey][activity.id].totalPercentage = progress.percentage;
          if (progress.comment) monthlyData[monthYearKey][activity.id].comments.push(progress.comment);
        }
      });
    });

    const finalMonthlyActivities: Record<string, MonthlyActivity[]> = {};
    for (const monthKey in monthlyData) {
        finalMonthlyActivities[monthKey] = Object.values(monthlyData[monthKey]);
    }
    return finalMonthlyActivities;
  }, [activities, appraisee, selectedPeriod]);

  const filteredMonths = React.useMemo(() => {
    const allKeys = Object.keys(monthlyActivities).sort().reverse();
    if (monthFilter === 'all') return allKeys;
    return allKeys.filter(key => key === monthFilter);
  }, [monthlyActivities, monthFilter]);
  
  const allMonthsOptions = React.useMemo(() => {
    if (!selectedPeriod) return [];
    return Object.keys(monthlyActivities).map(key => {
      const [year, month] = key.split('-').map(Number);
      return {
          value: key,
          label: format(new Date(year, month - 1), "MMMM 'de' yyyy", {locale: ptBR})
      };
    }).sort((a,b) => b.value.localeCompare(a.value));
  }, [monthlyActivities, selectedPeriod]);


  const handleDownloadPdf = async () => {
    if (!appraisee || !selectedPeriod) return;
    setIsGeneratingPdf(true);

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 15;
    
    const monthsToRender = (monthFilter === 'all'
      ? Object.keys(monthlyActivities).sort((a, b) => a.localeCompare(b))
      : [monthFilter]
    ).filter(key => monthlyActivities[key] && monthlyActivities[key].length > 0);
    
    let allRows: any[] = [];
    if (monthsToRender.length > 0) {
        monthsToRender.forEach(monthKey => {
            const [year, month] = monthKey.split('-').map(Number);
            const monthTitle = format(new Date(year, month - 1), "MMMM 'de' yyyy", { locale: ptBR });
            
            allRows.push([{ content: monthTitle.toUpperCase(), colSpan: 2, styles: { halign: 'center', fillColor: [230, 230, 230], textColor: 0, fontStyle: 'bold' } }]);
            
            const activitiesForMonth = monthlyActivities[monthKey];
            activitiesForMonth.forEach(activity => {
                 allRows.push([
                    `${activity.totalPercentage}%`,
                    `${activity.title.toUpperCase()} - ${activity.comments.join('; ') || 'Nenhum comentário.'}`
                ]);
            });
        });
    }

    if (allRows.length === 0) {
        pdf.text('Nenhuma atividade registrada para o período ou filtro selecionado.', margin, margin);
        pdf.save(`relatorio-${appraisee.name.replace(/\s/g, '_')}-${new Date().toISOString().split('T')[0]}.pdf`);
        setIsGeneratingPdf(false);
        return;
    }

    pdf.autoTable({
        body: allRows,
        columns: [
            { header: 'Progresso', dataKey: 0 },
            { header: 'Atividade e Comentários', dataKey: 1 },
        ],
        columnStyles: { 0: { cellWidth: 25, halign: 'center', fontStyle: 'bold' } },
        didParseCell: function (data: any) {
            // This ensures our month headers get the correct styles
            if (data.row.raw.length === 1 && data.row.raw[0].colSpan) {
                data.cell.styles.fillColor = [230, 230, 230];
                data.cell.styles.textColor = 0;
                data.cell.styles.fontStyle = 'bold';
                data.cell.styles.halign = 'center';
            }
        },
        willDrawPage: function (data: any) {
            // Header
            let yPos = margin;
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            pdf.text('FICHA DE REGISTRO DE TRABALHOS REALIZADOS', pageWidth / 2, yPos, { align: 'center' });
            yPos += 8;

            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            pdf.text(`Período de Avaliação: ${selectedPeriod.name}`, pageWidth / 2, yPos, { align: 'center' });
            yPos += 10;
            
            pdf.autoTable({
                startY: yPos,
                head: [["POSTO/GRAD. E NOME DO AVALIADO", "CARGO/FUNÇÃO"]],
                body: [[`${appraisee.postoGrad} ${appraisee.name}`, appraisee.jobTitle]],
                theme: 'grid',
                styles: { halign: 'center', fontStyle: 'bold', fontSize: 9 },
                headStyles: { fillColor: [220, 220, 220], textColor: 0 },
            });
            
            data.settings.startY = pdf.lastAutoTable.finalY + 5;
        },
        didDrawPage: function(data: any) {
            // Footer
            const pageCount = (pdf as any).internal.getNumberOfPages();
            pdf.setFontSize(8);
            pdf.text(`Página ${data.pageNumber} de ${pageCount}`, pageWidth - margin, pdf.internal.pageSize.getHeight() - 10, { align: 'right' });
        },
        margin: { top: margin + 35 } // Increased margin to avoid overlap
    });

    pdf.save(`relatorio-${appraisee.name.replace(/\s/g, '_')}-${new Date().toISOString().split('T')[0]}.pdf`);
    setIsGeneratingPdf(false);
  };


  const handleOpenModal = (activity: Activity) => {
    setSelectedActivity(activity);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedActivity(null);
  };

  const handlePeriodChange = (periodId: string) => {
    setSelectedPeriodId(periodId);
    setMonthFilter('all');
  }

  if (!appraisee || !loggedInUser) {
    return <div className="p-6">Carregando dados do relatório...</div>;
  }
  
  const backLink = loggedInUser.role === 'appraiser' ? '/appraiser/dashboard' : '/appraisee/reports';
  const displayPeriods = relevantPeriods.length > 0 ? relevantPeriods : evaluationPeriods;


  return (
    <>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        {isModalOpen && selectedActivity && appraisee && (
            <ActivityForm
              activity={selectedActivity}
              onSave={() => Promise.resolve()}
              onClose={handleCloseModal}
              currentUserId={appraisee.id}
              isReadOnly={true}
            />
        )}
      </Dialog>
      
      <div className="print:hidden flex flex-col h-full">
        <main className="flex-1 p-2 md:p-6 overflow-auto space-y-6">
          <header className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
            <div>
              <Button variant="ghost" asChild className="mb-2 -ml-4">
                 <Link href={backLink}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> 
                    Voltar
                 </Link>
              </Button>
              <h1 className="text-3xl font-bold font-headline">Relatório de Atividades</h1>
              <div className="flex items-center gap-2 mt-1">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={appraisee.avatarUrl} />
                  <AvatarFallback>{appraisee.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <p className="text-muted-foreground font-medium">{appraisee.postoGrad} {appraisee.name}</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={selectedPeriodId} onValueChange={handlePeriodChange}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Filtrar por período" />
                  </SelectTrigger>
                  <SelectContent>
                    {displayPeriods.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                 <Select value={monthFilter} onValueChange={setMonthFilter}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Filtrar por mês" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Meses</SelectItem>
                    {allMonthsOptions.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleDownloadPdf} disabled={isGeneratingPdf} className="w-full sm:w-auto">
                <Printer className="mr-2 h-4 w-4" />
                {isGeneratingPdf ? 'Gerando...' : 'Gerar PDF'}
              </Button>
            </div>
          </header>

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
                            <TableHead className="w-[40%] hidden sm:table-cell">Comentário do Mês</TableHead>
                            <TableHead>Progresso no Mês</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                         {monthlyActivities[monthKey]?.map(activity => (
                            <TableRow key={`${activity.id}-${monthKey}`}>
                            <TableCell className="font-medium">
                                <button
                                    className="text-left hover:underline"
                                    onClick={() => handleOpenModal(activity.originalActivity)}
                                >
                                    {activity.title}
                                </button>
                            </TableCell>
                            <TableCell className="text-muted-foreground italic hidden sm:table-cell">"{activity.comments.join('; ') || 'N/A'}"</TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                <Progress value={activity.totalPercentage} className="w-[60%] md:w-[80%]" />
                                <span className="text-xs md:text-sm">{activity.totalPercentage}%</span>
                                </div>
                            </TableCell>
                            </TableRow>
                        )) ?? (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center h-24">Nenhuma atividade registrada para este mês.</TableCell>
                           </TableRow>
                        )}
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
    </>
  );
}
