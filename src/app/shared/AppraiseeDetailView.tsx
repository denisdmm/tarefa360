
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
import type { Activity, User, ProgressEntry, EvaluationPeriod } from "@/lib/types";
import { ArrowLeft, Filter, Printer, Eye } from "lucide-react";
import Link from 'next/link';
import { format, eachMonthOfInterval, startOfMonth, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Dialog } from '@/components/ui/dialog';
import { ActivityForm } from '@/app/shared/ActivityForm';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

type MonthlyActivity = {
    id: string;
    title: string;
    description: string;
    totalPercentage: number;
    comments: string[];
    // Include the original activity for the modal
    originalActivity: Activity;
};

// This is a shared component to display the detail view for an appraisee.
// It can be used by the appraiser (viewing someone else) or the appraisee (viewing their own report).
export function AppraiseeDetailView({ userId }: { userId: string }) {
  const { users, activities, evaluationPeriods, loggedInUser } = useDataContext();
  const router = useRouter();
  
  const [appraisee, setAppraisee] = React.useState<User | null>(null);
  const [selectedPeriodId, setSelectedPeriodId] = React.useState<string>('');
  const [monthFilter, setMonthFilter] = React.useState('all');
  const [isGeneratingPdf, setIsGeneratingPdf] = React.useState(false);
  const [showPdfPreview, setShowPdfPreview] = React.useState(false);
  
  const [selectedActivity, setSelectedActivity] = React.useState<Activity | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const selectedPeriod = React.useMemo(() => {
    if (!selectedPeriodId) return null;
    return evaluationPeriods.find(p => p.id === selectedPeriodId) ?? null;
  }, [selectedPeriodId, evaluationPeriods]);

  React.useEffect(() => {
    const foundUser = users.find(u => u.id === userId) || null;
    setAppraisee(foundUser);
  }, [userId, users]);

  React.useEffect(() => {
    // Set the default selected period to the active one on initial load
    if (evaluationPeriods.length > 0 && !selectedPeriodId) {
      const activePeriod = evaluationPeriods.find(p => p.status === 'Ativo');
      if (activePeriod) {
        setSelectedPeriodId(activePeriod.id);
      } else if (evaluationPeriods[0]) {
        setSelectedPeriodId(evaluationPeriods[0].id); // Fallback to the first one if none are active
      }
    }
  }, [evaluationPeriods, selectedPeriodId]);

  const monthlyActivities = React.useMemo(() => {
    if (!selectedPeriod || !appraisee) return {};

    const userActivities = activities.filter(a => {
        if (a.userId !== appraisee.id) return false;

        const activityStartDate = (a.startDate as any).seconds 
            ? (a.startDate as any).toDate() 
            : new Date(a.startDate as any);

        const periodInterval = {
            start: new Date(selectedPeriod.startDate as any),
            end: new Date(selectedPeriod.endDate as any),
        };

        return isWithinInterval(activityStartDate, periodInterval);
    });

    const monthlyData: Record<string, Record<string, MonthlyActivity>> = {};

    const periodInterval = {
      start: new Date(selectedPeriod.startDate as any),
      end: new Date(selectedPeriod.endDate as any),
    };

    userActivities.forEach(activity => {
      activity.progressHistory.forEach(progress => {
        const progressDate = new Date(progress.year, progress.month - 1);
        if (isWithinInterval(progressDate, periodInterval)) {
          const monthYearKey = format(progressDate, 'yyyy-MM');
          
          if (!monthlyData[monthYearKey]) {
              monthlyData[monthYearKey] = {};
          }
          
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
          
          // Use latest percentage for the month, not sum
          monthlyData[monthYearKey][activity.id].totalPercentage = progress.percentage;
          if (progress.comment) {
            monthlyData[monthYearKey][activity.id].comments.push(progress.comment);
          }
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
    const allKeys = Object.keys(monthlyActivities).sort().reverse(); // Sort descending for on-screen view
    if (monthFilter === 'all') {
      return allKeys;
    }
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
      }).sort((a,b) => b.value.localeCompare(a.value)); // Descending for the dropdown
  }, [monthlyActivities, selectedPeriod]);


  const pdfMonths = React.useMemo(() => {
    if (!selectedPeriod) return [];
    
    const monthsInPeriod = eachMonthOfInterval({
        start: startOfMonth(new Date(selectedPeriod.startDate as any)),
        end: startOfMonth(new Date(selectedPeriod.endDate as any))
    });
    
    // Sort ascending for PDF
    const monthKeys = monthsInPeriod.map(date => format(date, 'yyyy-MM')).sort((a, b) => a.localeCompare(b));

    if (monthFilter === 'all') {
      return monthKeys; 
    }
    
    return monthKeys.filter(key => key === monthFilter);
  }, [selectedPeriod, monthFilter]);


  const handleDownloadPdf = async () => {
    const reportElement = document.getElementById('print-content');
    if (!reportElement) return;

    setIsGeneratingPdf(true);

    const wasHidden = reportElement.classList.contains('hidden');
    if (wasHidden) {
        reportElement.classList.remove('hidden');
    }

    // A4 page dimensions in mm
    const a4WidthMm = 210;
    const a4HeightMm = 297;
    
    const canvas = await html2canvas(reportElement, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        windowWidth: reportElement.scrollWidth,
        windowHeight: reportElement.scrollHeight
    });

    if (wasHidden) {
        reportElement.classList.add('hidden');
    }

    const imgData = canvas.toDataURL('image/png');
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    // Convert canvas dimensions to mm
    const imgWidthMm = (imgWidth / canvas.width) * a4WidthMm;
    const imgHeightMm = (imgHeight / canvas.width) * a4WidthMm;

    const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
    });

    let position = 0;
    const pageHeightMm = a4HeightMm - 20; // A4 height with margin

    pdf.addImage(imgData, 'PNG', 10, position, imgWidthMm - 20, imgHeightMm);
    let heightLeft = imgHeightMm;

    while (heightLeft > pageHeightMm) {
        position = heightLeft - imgHeightMm;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidthMm - 20, imgHeightMm);
        heightLeft -= pageHeightMm;
    }

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

  const handlePeriodChange = (periodId: string) => {
    setSelectedPeriodId(periodId);
    setMonthFilter('all'); // Reset month filter when period changes
  }


  if (!appraisee || !loggedInUser || !selectedPeriod) {
    return <div className="p-6">Carregando dados do relatório...</div>;
  }
  
  const canGoBack = loggedInUser.role === 'appraiser';
  const backLink = loggedInUser.role === 'appraiser' ? '/appraiser/dashboard' : '/appraisee/reports';

  return (
    <>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        {isModalOpen && selectedActivity && appraisee && (
            <ActivityForm
              activity={selectedActivity}
              onSave={() => Promise.resolve()} // No-op for read-only
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
                    {canGoBack ? 'Voltar ao Painel' : 'Voltar aos Relatórios'}
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
                    {evaluationPeriods.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
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
              {selectedPeriod && (
                  <div className="text-center p-1 border-b border-black font-bold uppercase">
                      <span>{format(new Date(selectedPeriod.startDate as any), 'MMM yyyy', {locale: ptBR})}</span> a <span>{format(new Date(selectedPeriod.endDate as any), 'MMM yyyy', {locale: ptBR})}</span>
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
                        <td className="w-[15%] p-2 pb-5 border border-black text-center uppercase">{activity.totalPercentage}%</td>
                        <td className="p-2 pb-5 border border-black text-justify uppercase">{activity.title} - <i>{activity.comments.join('; ') || 'Nenhum comentário.'}</i></td>
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
