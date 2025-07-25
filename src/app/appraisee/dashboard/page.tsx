
"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Activity, ProgressEntry } from "@/lib/types";
import { Edit, PlusCircle, Trash2, CheckCircle, ListTodo, CalendarIcon, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useDataContext } from "@/context/DataContext";
import { format, getMonth, getYear, parse, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ActivityForm = ({
  activity,
  onSave,
  onClose,
  currentUserId,
}: {
  activity?: Activity | null;
  onSave: (activity: Activity) => void;
  onClose: () => void;
  currentUserId: string;
}) => {
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [startDateStr, setStartDateStr] = React.useState('');
  const [endDateStr, setEndDateStr] = React.useState('');
  const [progressHistory, setProgressHistory] = React.useState<ProgressEntry[]>([]);

  // States for the new progress entry form
  const [currentProgress, setCurrentProgress] = React.useState(0);
  const [currentComment, setCurrentComment] = React.useState("");

  const { toast } = useToast();
  const { evaluationPeriods } = useDataContext();
  const activePeriod = evaluationPeriods.find(p => p.status === 'Ativo');

  const currentMonth = getMonth(new Date()) + 1; // 1-12
  const currentYear = getYear(new Date());

  const canAddProgressForCurrentMonth = React.useMemo(() => {
    const startDate = parse(startDateStr, 'dd/MM/yyyy', new Date());
    const endDate = parse(endDateStr, 'dd/MM/yyyy', new Date());
    if (!isValid(startDate) || !isValid(endDate)) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today >= startDate && today <= endDate;
  }, [startDateStr, endDateStr]);

  const hasProgressForCurrentMonth = React.useMemo(() => {
    return progressHistory.some(p => p.year === currentYear && p.month === currentMonth);
  }, [progressHistory, currentYear, currentMonth]);
  
  React.useEffect(() => {
    if (activity) {
        setTitle(activity.title || "");
        setDescription(activity.description || "");
        setStartDateStr(activity.startDate ? format(activity.startDate, 'dd/MM/yyyy') : '');
        setEndDateStr(activity.endDate ? format(activity.endDate, 'dd/MM/yyyy') : '');
        setProgressHistory(activity.progressHistory || []);
    } else {
        // Reset for new activity
        setTitle("");
        setDescription("");
        setStartDateStr(format(new Date(), 'dd/MM/yyyy'));
        setEndDateStr('');
        setProgressHistory([]);
    }
    // Reset progress form fields whenever the activity changes
    setCurrentProgress(0);
    setCurrentComment("");
  }, [activity]);

  const handleAddOrUpdateProgress = () => {
    const newEntry: ProgressEntry = {
      year: currentYear,
      month: currentMonth,
      percentage: currentProgress,
      comment: currentComment,
    };

    const existingEntryIndex = progressHistory.findIndex(p => p.year === currentYear && p.month === currentMonth);

    let updatedHistory = [...progressHistory];
    if (existingEntryIndex > -1) {
      updatedHistory[existingEntryIndex] = newEntry;
    } else {
      updatedHistory.push(newEntry);
    }
    setProgressHistory(updatedHistory);
    setCurrentProgress(0);
    setCurrentComment("");
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (value: string) => void) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove all non-digits
    if (value.length > 8) value = value.slice(0, 8);
    
    if (value.length > 4) {
      value = `${value.slice(0, 2)}/${value.slice(2, 4)}/${value.slice(4)}`;
    } else if (value.length > 2) {
      value = `${value.slice(0, 2)}/${value.slice(2)}`;
    }
    setter(value);
  };

  const handleSubmit = () => {
    const startDate = parse(startDateStr, 'dd/MM/yyyy', new Date());
    const endDate = parse(endDateStr, 'dd/MM/yyyy', new Date());
    
    if (!isValid(startDate) || !isValid(endDate)) {
        toast({
            variant: "destructive",
            title: "Data Inválida",
            description: "Por favor, insira datas de início e fim válidas no formato DD/MM/AAAA.",
        });
        return;
    }

    const newActivity: Activity = {
      id: activity?.id || `act-${Date.now()}`,
      title,
      description,
      startDate,
      endDate,
      progressHistory,
      userId: currentUserId,
    };
    onSave(newActivity);
    onClose();
  };
  
  const getLatestProgress = (history: ProgressEntry[]) => {
    if (!history || history.length === 0) return 0;
    // Sort by year then month to find the latest
    const sortedHistory = [...history].sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });
    return sortedHistory[0].percentage;
  };

  return (
    <DialogContent className="sm:max-w-[625px]">
      <DialogHeader>
        <DialogTitle>{activity ? "Editar Atividade" : "Criar Nova Atividade"}</DialogTitle>
        <DialogDescription>
          {activity
            ? "Atualize os detalhes e o progresso da sua atividade."
            : "Registre uma nova atividade para o período de avaliação atual."}
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
        {/* Activity Details Form */}
        <div className="space-y-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">Título</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">Descrição</Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="start-date" className="text-right">Data de Início</Label>
                <Input 
                    id="start-date"
                    value={startDateStr}
                    onChange={(e) => handleDateChange(e, setStartDateStr)}
                    placeholder="DD/MM/AAAA"
                    className="col-span-3"
                />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="end-date" className="text-right">Data de Fim</Label>
                 <Input 
                    id="end-date"
                    value={endDateStr}
                    onChange={(e) => handleDateChange(e, setEndDateStr)}
                    placeholder="DD/MM/AAAA"
                    className="col-span-3"
                />
            </div>
        </div>

        {/* Progress History Section */}
        {activity && (
          <div className="space-y-4 pt-4 border-t">
              <h3 className="text-lg font-semibold text-center">Histórico de Progresso</h3>
              {/* Form to add new progress for the current month */}
              {canAddProgressForCurrentMonth && (
                <div className="p-4 border rounded-lg bg-muted/50 space-y-3">
                   <h4 className="font-medium">
                      {hasProgressForCurrentMonth ? 'Atualizar Progresso de ' : 'Adicionar Progresso para '}{format(new Date(), 'MMMM', {locale: ptBR})}
                   </h4>
                   <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="current-progress" className="text-right">Conclusão</Label>
                      <Input id="current-progress" type="number" value={currentProgress} onChange={(e) => setCurrentProgress(Number(e.target.value))} className="col-span-3" min="0" max="100"/>
                   </div>
                   <div className="grid grid-cols-4 items-center gap-4">
                       <Label htmlFor="current-comment" className="text-right">Comentário</Label>
                       <Textarea id="current-comment" value={currentComment} onChange={e => setCurrentComment(e.target.value)} className="col-span-3" placeholder="Descreva o que foi feito este mês..."/>
                   </div>
                   <div className="flex justify-end">
                      <Button size="sm" onClick={handleAddOrUpdateProgress}>
                          {hasProgressForCurrentMonth ? 'Atualizar' : 'Adicionar'} Progresso
                      </Button>
                   </div>
                </div>
              )}

              {/* Display existing progress history */}
              {progressHistory.length > 0 ? (
                <div className="space-y-3">
                  {progressHistory.sort((a,b) => b.year - a.year || b.month - a.month).map((p, index) => (
                    <div key={index} className="text-sm p-3 border-b">
                      <div className="flex justify-between items-center font-semibold">
                         <span>{format(new Date(p.year, p.month - 1), 'MMMM, yyyy', {locale: ptBR})}</span>
                         <span className="text-primary">{p.percentage}%</span>
                      </div>
                      <p className="text-muted-foreground mt-1 pl-2 border-l-2">{p.comment || 'Nenhum comentário.'}</p>
                    </div>
                  ))}
                </div>
              ) : (
                 <p className="text-center text-muted-foreground py-4">Nenhum progresso registrado.</p>
              )}
          </div>
        )}
      </div>
      <DialogFooter>
        <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
        <Button onClick={handleSubmit}>Salvar Atividade</Button>
      </DialogFooter>
    </DialogContent>
  );
};


export default function AppraiseeDashboard() {
  const { toast } = useToast();
  const { activities, setActivities } = useDataContext();
  const currentUserId = 'user-appraisee-1'; // Hardcoded for now
  const userActivities = activities.filter(a => a.userId === currentUserId);

  const [isFormOpen, setFormOpen] = React.useState(false);
  const [selectedActivity, setSelectedActivity] = React.useState<Activity | null>(null);

  const getLatestProgress = (activity: Activity) => {
    const { progressHistory } = activity;
    if (!progressHistory || progressHistory.length === 0) return 0;
    const sortedHistory = [...progressHistory].sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });
    return sortedHistory[0].percentage;
  };

  const handleSaveActivity = (activity: Activity) => {
    const isEditing = activities.some(a => a.id === activity.id);
    if (isEditing) {
      setActivities(prevActivities => prevActivities.map(a => a.id === activity.id ? activity : a));
      toast({ title: "Atividade Atualizada", description: "Sua atividade foi atualizada com sucesso." });
    } else {
      setActivities(prevActivities => [activity, ...prevActivities]);
      toast({ title: "Atividade Criada", description: "Sua nova atividade foi registrada." });
    }
    handleCloseForm();
  };
  
  const handleOpenForm = (activity: Activity | null) => {
    setSelectedActivity(activity);
    setFormOpen(true);
  }

  const handleCloseForm = () => {
    setFormOpen(false);
    setSelectedActivity(null);
  }

  const handleDeleteActivity = (activityId: string) => {
    setActivities(prevActivities => prevActivities.filter(a => a.id !== activityId));
    toast({ variant: 'destructive', title: "Atividade Excluída", description: "A atividade foi removida." });
  };
  
  const inProgressActivities = userActivities.filter(a => getLatestProgress(a) < 100);
  const completedActivities = userActivities.filter(a => getLatestProgress(a) === 100);

  return (
    <>
      <div className="flex flex-col h-full">
         <header className="bg-card border-b p-4">
           <div className="flex justify-between items-center">
             <div>
               <h1 className="text-3xl font-bold font-headline">Minhas Atividades</h1>
               <p className="text-muted-foreground">Gerencie suas tarefas e progressos em andamento.</p>
             </div>
             <Button onClick={() => handleOpenForm(null)}>
               <PlusCircle className="mr-2 h-4 w-4" />
               Registrar Atividade
             </Button>
           </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Tabs defaultValue="in-progress">
              <TabsList className="mb-4">
                  <TabsTrigger value="in-progress"><ListTodo className="mr-2"/>Em Andamento</TabsTrigger>
                  <TabsTrigger value="completed"><CheckCircle className="mr-2"/>Concluídas</TabsTrigger>
              </TabsList>
              <TabsContent value="in-progress">
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {inProgressActivities.map((activity) => {
                      const latestProgress = getLatestProgress(activity);
                      return (
                      <Card key={activity.id} className="flex flex-col">
                        <CardHeader>
                          <CardTitle>{activity.title}</CardTitle>
                          <CardDescription>
                            {format(activity.startDate, "MMM yyyy", { locale: ptBR })} - {format(activity.endDate, "MMM yyyy", { locale: ptBR })}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                          <p className="text-sm text-muted-foreground mb-4">{activity.description}</p>
                          <Progress value={latestProgress} aria-label={`${latestProgress}% completo`} />
                          <p className="text-sm font-medium text-right mt-1">{latestProgress}%</p>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleOpenForm(activity)}>
                                <Edit className="mr-2 h-4 w-4" /> Editar
                            </Button>
                           <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                  <Trash2 className="mr-2 h-4 w-4" /> Excluir
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta ação não pode ser desfeita. Isso excluirá permanentemente esta atividade.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteActivity(activity.id)}>
                                    Excluir
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                           </AlertDialog>
                        </CardFooter>
                      </Card>
                    )})}
                    {inProgressActivities.length === 0 && (
                        <div className="col-span-full text-center py-12">
                            <CheckCircle className="mx-auto h-12 w-12 text-green-500"/>
                            <h2 className="mt-4 text-xl font-semibold">Tudo em dia!</h2>
                            <p className="text-muted-foreground">Você não possui atividades pendentes.</p>
                        </div>
                    )}
                  </div>
              </TabsContent>
              <TabsContent value="completed">
                <Card>
                    <CardHeader>
                        <CardTitle>Histórico de Atividades</CardTitle>
                        <CardDescription>Atividades que você já finalizou.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Título</TableHead>
                                    <TableHead>Período</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {completedActivities.length > 0 ? (
                                    completedActivities.map(activity => (
                                        <TableRow key={activity.id}>
                                            <TableCell className="font-medium">{activity.title}</TableCell>
                                            <TableCell>
                                              {format(activity.startDate, "MMM yyyy", { locale: ptBR })} - {format(activity.endDate, "MMM yyyy", { locale: ptBR })}
                                            </TableCell>
                                            <TableCell>
                                                <Badge>Concluído</Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" onClick={() => handleOpenForm(activity)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">Nenhuma atividade concluída ainda.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
              </TabsContent>
          </Tabs>
        </main>
        
        <Dialog open={isFormOpen} onOpenChange={setFormOpen}>
            <ActivityForm 
                activity={selectedActivity} 
                onSave={handleSaveActivity} 
                onClose={handleCloseForm}
                currentUserId={currentUserId}
            />
        </Dialog>
      </div>
    </>
  );
}

    