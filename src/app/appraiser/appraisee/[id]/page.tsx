
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
import { ArrowLeft, Filter, Printer, Eye } from "lucide-react";
import Link from 'next/link';
import { format, eachMonthOfInterval, startOfMonth, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Dialog } from '@/components/ui/dialog';
import { ActivityForm } from '@/app/shared/ActivityForm';
import { cn } from '@/lib/utils';

type MonthlyActivity = Activity & {
    progressForMonth: ProgressEntry;
};

export default function AppraiseeDetailView({ params: paramsProp }: { params: { id: string } }) {
  const params = React.use(paramsProp);
  const { users, activities, evaluationPeriods } = useDataContext();
  
  const [appraisee, setAppraisee] = React.useState<User | null>(null);
  const [monthFilter, setMonthFilter] = React.useState('all');
  const [isGeneratingPdf, setIsGeneratingPdf] = React.useState(false);
  const [showPdfPreview, setShowPdfPreview] = React.useState(false);
  const [monthlyActivities, setMonthlyActivities] = React.useState<Record<string, MonthlyActivity[]>>({});
  
  const [selectedActivity, setSelectedActivity] = React.useState<Activity | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const activePeriod = React.useMemo(() => evaluationPeriods.find(p => p.status === 'Ativo'), [evaluationPeriods]);

  React.useEffect(() => {
    const foundUser = users.find(u => u.id === params.id) || null;
    setAppraisee(foundUser);
  }, [params.id, users]);

  const getActivitiesByMonth = React.useCallback(() => {
    if (!activePeriod || !appraisee) return {};

    const userActivities = activities.filter(a => a.userId === appraisee.id);
    const monthlyData: Record<string, MonthlyActivity[]> = {};

    userActivities.forEach(activity => {
      activity.progressHistory.forEach(progress => {
        const progressDate = new Date(progress.year, progress.month - 1);
        if (isWithinInterval(progressDate, { start: new Date(activePeriod.startDate as any), end: new Date(activePeriod.endDate as any) })) {
          const monthYearKey = format(progressDate, 'yyyy-MM');
          
          if (!monthlyData[monthYearKey]) {
              monthlyData[monthYearKey] = [];
          }

          const existingActivity = monthlyData[monthYearKey].find(a => a.id === activity.id);
          if (!existingActivity) {
              monthlyData[monthYearKey].push({
                  ...activity,
                  progressForMonth: progress,
              });
          }
        }
      });
    });

    return monthlyData;
  }, [activities, appraisee, activePeriod]);


  React.useEffect(() => {
      setMonthlyActivities(getActivitiesByMonth());
  }, [getActivitiesByMonth]);

  const filteredMonths = React.useMemo(() => {
    const allKeys = Object.keys(monthlyActivities).sort().reverse(); // Sort descending for on-screen view
    if (monthFilter === 'all') {
      return allKeys;
    }
    return allKeys.filter(key => key === monthFilter);
  }, [monthlyActivities, monthFilter]);
  
  const allMonthsOptions = React.useMemo(() => {
      return Object.keys(monthlyActivities).map(key => {
        const [year, month] = key.split('-').map(Number);
        return {
            value: key,
            label: format(new Date(year, month - 1), "MMMM 'de' yyyy", {locale: ptBR})
        };
      }).sort((a,b) => b.value.localeCompare(a.value)); // Descending for the dropdown
  }, [monthlyActivities]);


  const pdfMonths = React.useMemo(() => {
    if (!activePeriod) return [];
    
    const monthsInPeriod = eachMonthOfInterval({
        start: startOfMonth(new Date(activePeriod.startDate as any)),
        end: startOfMonth(new Date(activePeriod.endDate as any))
    });
    
    // Sort ascending for PDF
    const monthKeys = monthsInPeriod.map(date => format(date, 'yyyy-MM')).sort((a, b) => a.localeCompare(b));

    if (monthFilter === 'all') {
      return monthKeys; 
    }
    
    return monthKeys.filter(key => key === monthFilter);
  }, [activePeriod, monthFilter]);


  const handleDownloadPdf = async () => {
    const reportElement = document.getElementById('print-content');
    if (!reportElement) return;

    setIsGeneratingPdf(true);

    // Temporarily make it visible for capture if it was hidden
    const wasHidden = reportElement.classList.contains('hidden');
    if (wasHidden) {
        reportElement.classList.remove('hidden');
    }
    
    const canvas = await html2canvas(reportElement, {
      scale: 2,
      useCORS: true,
    });
    
    if (wasHidden) {
        reportElement.classList.add('hidden');
    }

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

  const handleOpenModal = (activity: Activity) => {
    setSelectedActivity(activity);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedActivity(null);
  };


  if (!appraisee) {
    return <div className="p-6">Avaliado não encontrado.</div>;
  }
  
  return (
    <>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        {isModalOpen && selectedActivity && appraisee && (
            <ActivityForm
              activity={selectedActivity}
              onSave={() => {}} // No-op for read-only
              onClose={handleCloseModal}
              currentUserId={appraisee.id}
              isReadOnly={true}
              activePeriod={activePeriod}
            />
        )}
      </Dialog>
      
      <div className="print:hidden flex flex-col h-full">
        <main className="flex-1 p-2 md:p-6 overflow-auto space-y-6">
          <header className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
            <div>
              <Button variant="ghost" asChild className="mb-2 -ml-4">
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
                <p className="text-muted-foreground font-medium">{appraisee.postoGrad} {appraisee.name}</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="h-4 w-4 text-muted-foreground" />
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
              <Button onClick={() => setShowPdfPreview(!showPdfPreview)} variant="outline" className="w-full sm:w-auto">
                <Eye className="mr-2 h-4 w-4" />
                {showPdfPreview ? 'Ocultar Mock' : 'Mostrar Mock do PDF'}
              </Button>
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
                                    onClick={() => handleOpenModal(activity)}
                                >
                                    {activity.title}
                                </button>
                            </TableCell>
                            <TableCell className="text-muted-foreground italic hidden sm:table-cell">"{activity.progressForMonth.comment || 'N/A'}"</TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                <Progress value={activity.progressForMonth.percentage} className="w-[60%] md:w-[80%]" />
                                <span className="text-xs md:text-sm">{activity.progressForMonth.percentage}%</span>
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

      {/* Content for PDF Generation */}
      <div id="print-content" className={cn("print:block p-8 bg-white", !showPdfPreview && "hidden")} style={{ fontFamily: '"Times New Roman", Times, serif', fontSize: '12pt', color: 'black' }}>
          <div className="text-center mb-6">
              <h1 className="text-xl font-bold uppercase">Ficha de Registro de Trabalhos Realizados</h1>
          </div>
          
          <table className="w-full border-collapse border border-black mb-6">
              <tbody>
                  <tr>
                      <td className="border border-black p-2 font-bold text-center uppercase">Posto/Grad. e Nome do Avaliado</td>
                      <td className="border border-black p-2 font-bold text-center uppercase">Cargo/Função</td>
                  </tr>
                  <tr>
                      <td className="border border-black p-2 text-center uppercase">{appraisee.postoGrad} {appraisee.name}</td>
                      <td className="border border-black p-2 text-center uppercase">{appraisee.jobTitle}</td>
                  </tr>
              </tbody>
          </table>

          <div className="border border-black">
              <div className="text-center p-2 border-b border-black">
                  <p className="font-bold uppercase">Principais Atividades Desenvolvidas no Período de Avaliação</p>
              </div>
              {activePeriod && (
                  <div className="text-center p-1 border-b border-black font-bold uppercase">
                      <span>{format(new Date(activePeriod.startDate as any), 'MMM yyyy', {locale: ptBR})}</span> a <span>{format(new Date(activePeriod.endDate as any), 'MMM yyyy', {locale: ptBR})}</span>
                  </div>
              )}

              {pdfMonths.map(monthKey => {
                const activitiesForMonth = monthlyActivities[monthKey];
                if (!activitiesForMonth || activitiesForMonth.length === 0) {
                    return null; // Omit month if no activities
                }

                const [year, month] = monthKey.split('-').map(Number);
                return (
                  <div key={`${monthKey}-pdf`}>
                    <div className="text-center p-1 border-b border-black font-bold bg-gray-200 uppercase">
                      {format(new Date(year, month - 1), "MMMM 'de' yyyy", {locale: ptBR})}
                    </div>
                    <table className="w-full" style={{borderCollapse: 'collapse'}}>
                    <tbody>
                    {activitiesForMonth.map(activity => (
                        <tr key={`${activity.id}-${monthKey}-pdf`}>
                        <td className="w-[15%] p-2 pb-5 border border-black text-center uppercase">{activity.progressForMonth.percentage}%</td>
                        <td className="p-2 pb-5 border border-black text-justify uppercase">{activity.title} - <i>{activity.progressForMonth.comment || 'Nenhum comentário.'}</i></td>
                        </tr>
                    ))}
                    </tbody>
                    </table>
                  </div>
                )
              })}
              {pdfMonths.every(monthKey => !monthlyActivities[monthKey] || monthlyActivities[monthKey].length === 0) && (
                  <div className="text-center p-4 uppercase">Nenhuma atividade registrada para o período.</div>
              )}
          </div>
      </div>
    </>
  );
}

    
