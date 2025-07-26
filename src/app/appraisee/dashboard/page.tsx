
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
import type { Activity, ProgressEntry, EvaluationPeriod } from "@/lib/types";
import { Edit, PlusCircle, Trash2, CheckCircle, ListTodo, CalendarIcon, Plus, X, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useDataContext } from "@/context/DataContext";
import { format, getMonth, getYear, startOfDay, eachMonthOfInterval, startOfMonth, max, parse, isValid, add, sub, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const ActivityForm = ({
  activity,
  onSave,
  onClose,
  currentUserId,
  isReadOnly = false,
  activePeriod,
}: {
  activity?: Activity | null;
  onSave: (activity: Activity) => void;
  onClose: () => void;
  currentUserId: string;
  isReadOnly?: boolean;
  activePeriod?: EvaluationPeriod;
}) => {
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [startDate, setStartDate] = React.useState('');
  const [dateError, setDateError] = React.useState<string | null>(null);
  const [progressHistory, setProgressHistory] = React.useState<ProgressEntry[]>([]);

  const [isAddingProgress, setIsAddingProgress] = React.useState(false);
  const [newProgress, setNewProgress] = React.useState<{date: string, percentage: number, comment: string} | null>(null);

  const { toast } = useToast();
  
  const validateStartDate = (dateString: string) => {
    // Only validate for new activities.
    if (activity) {
        setDateError(null);
        return;
    }
  
    if (!dateString) {
        setDateError("A data de início é obrigatória.");
        return;
    }

    // The input type="date" returns "YYYY-MM-DD".
    // new Date() will parse it as UTC, which can cause off-by-one day errors
    // depending on the user's timezone. We need to parse it as local time.
    const parts = dateString.split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
    const day = parseInt(parts[2], 10);
    const parsedDate = new Date(year, month, day);

    if (isNaN(parsedDate.getTime())) {
        setDateError("Formato de data inválido.");
        return;
    }
    
    if (activePeriod) {
        // Compare dates by creating UTC dates from local components to avoid timezone issues.
        const checkDate = startOfDay(parsedDate);
        const startDatePeriod = startOfDay(activePeriod.startDate);
        const endDatePeriod = startOfDay(activePeriod.endDate);

        if (checkDate < startDatePeriod || checkDate > endDatePeriod) {
             setDateError("A data deve estar dentro do período de avaliação ativo.");
        } else {
            setDateError(null);
        }
    } else {
        setDateError(null); // No active period, no validation needed
    }
  };


  const isSaveDisabled = React.useMemo(() => {
    if (isReadOnly) return true;
    if (!title.trim() || !startDate || dateError) return true;
    
    return false;
  }, [title, startDate, dateError, isReadOnly]);


  React.useEffect(() => {
    if (activity) {
      setTitle(activity.title || "");
      setDescription(activity.description || "");
      setStartDate(activity.startDate ? format(activity.startDate, 'yyyy-MM-dd') : '');
      setProgressHistory(activity.progressHistory || []);
    } else {
      // For new activities
      setTitle("");
      setDescription("");
      setStartDate('');
      setProgressHistory([]);
      setDateError(null);
    }
  }, [activity]);

  const handleStartAddNewProgress = () => {
    const lastProgress = progressHistory.sort((a, b) => b.year - a.year || b.month - a.month)[0];
    setNewProgress({
        date: format(new Date(), 'yyyy-MM-dd'),
        percentage: lastProgress?.percentage || 0,
        comment: ""
    });
    setIsAddingProgress(true);
  }

  const handleSaveNewProgress = () => {
    if (!newProgress?.date) {
        toast({ variant: 'destructive', title: "Data Inválida", description: "Por favor, selecione uma data para o registro de progresso."});
        return;
    }
    
    // Parse date directly from string to avoid timezone issues
    const parts = newProgress.date.split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);

    const existingEntryIndex = progressHistory.findIndex(p => p.year === year && p.month === month);
    if(existingEntryIndex > -1) {
        toast({ variant: 'destructive', title: "Registro Duplicado", description: "Já existe um registro de progresso para este mês."});
        return;
    }

    setProgressHistory(prev => [...prev, {
        year,
        month,
        percentage: newProgress.percentage,
        comment: newProgress.comment
    }]);
    setIsAddingProgress(false);
    setNewProgress(null);
  };
  
  const handleRemoveProgress = (year: number, month: number) => {
    setProgressHistory(prev => prev.filter(p => !(p.year === year && p.month === month)));
  }


  const handleSubmit = () => {
    if (isSaveDisabled) {
        toast({
            variant: "destructive",
            title: "Formulário Inválido",
            description: "Por favor, preencha todos os campos obrigatórios e corrija os erros.",
        });
        return;
    }
    
    const parts = startDate.split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const dateWithOffset = new Date(year, month, day);

    const updatedActivity: Activity = {
      id: activity?.id || `act-${Date.now()}`,
      title,
      description,
      startDate: dateWithOffset,
      progressHistory: progressHistory,
      userId: currentUserId,
    };
    onSave(updatedActivity);
    onClose();
  };
  
  const sortedProgressHistory = [...progressHistory].sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.month - a.month;
  });

  return (
    <DialogContent className="sm:max-w-[625px]">
      <DialogHeader>
        <DialogTitle>{activity ? (isReadOnly ? "Visualizar Atividade" : "Editar Atividade") : "Criar Nova Atividade"}</DialogTitle>
        <DialogDescription>
          {isReadOnly 
            ? "Visualize os detalhes e o progresso da sua atividade."
            : activity
            ? "Atualize os detalhes e o progresso da sua atividade."
            : "Registre uma nova atividade para o período de avaliação atual."}
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-6 py-4 max-h-[70vh] overflow-y-auto pr-4">
        {/* Activity Details */}
        <div className="space-y-4">
            <h3 className="font-semibold text-lg">Detalhes da Atividade</h3>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">Título</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="col-span-3" readOnly={isReadOnly} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">Descrição</Label>
                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" readOnly={isReadOnly} />
            </div>
             <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="start-date" className="text-right pt-2">Data de Início</Label>
                <div className="col-span-3">
                    <Input
                        id="start-date"
                        type="date"
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                        onBlur={e => validateStartDate(e.target.value)}
                        className={cn(dateError && "border-destructive")}
                        readOnly={isReadOnly || !!activity}
                    />
                    {dateError && <p className="text-sm text-destructive mt-1">{dateError}</p>}
                </div>
            </div>
        </div>

        <Separator />
        
        {/* Progress Registration */}
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                 <h3 className="font-semibold text-lg">Histórico de Progresso</h3>
                 {!isAddingProgress && !isReadOnly && (
                     <Button variant="outline" size="sm" onClick={handleStartAddNewProgress}>
                        <Plus className="mr-2 h-4 w-4" /> Adicionar Novo Progresso
                     </Button>
                 )}
            </div>
            {isAddingProgress && newProgress && (
                <div className="p-4 border rounded-lg bg-muted/50 space-y-4">
                    <div className="flex justify-between items-center">
                        <h4 className="font-medium">Novo Registro de Progresso</h4>
                        <Button variant="ghost" size="icon" onClick={() => setIsAddingProgress(false)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="new-progress-date" className="text-right">Data do Registro</Label>
                        <Input 
                            id="new-progress-date" 
                            type="date"
                            value={newProgress.date} 
                            onChange={e => setNewProgress({...newProgress, date: e.target.value})}
                            className="col-span-3" 
                        />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="new-progress-percentage" className="text-right">Conclusão (%)</Label>
                        <Input 
                            id="new-progress-percentage" 
                            type="number" 
                            min="0"
                            max="100"
                            value={newProgress.percentage} 
                            onChange={e => setNewProgress({...newProgress, percentage: parseInt(e.target.value)})} 
                            className="col-span-3" 
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="new-progress-comment" className="text-right">Comentário</Label>
                        <Textarea 
                            id="new-progress-comment"
                            value={newProgress.comment}
                            onChange={e => setNewProgress({...newProgress, comment: e.target.value})}
                            className="col-span-3"
                        />
                    </div>
                    <div className="flex justify-end">
                        <Button onClick={handleSaveNewProgress}>Salvar Progresso</Button>
                    </div>
                </div>
            )}
             <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Período</TableHead>
                            <TableHead>Progresso</TableHead>
                            <TableHead>Comentário</TableHead>
                            {!isReadOnly && <TableHead className="text-right"></TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedProgressHistory.length > 0 ? sortedProgressHistory.map(p => (
                            <TableRow key={`${p.year}-${p.month}`}>
                                <TableCell className="font-medium">
                                    {format(new Date(p.year, p.month - 1), "MMMM yyyy", { locale: ptBR })}
                                </TableCell>
                                <TableCell>{p.percentage}%</TableCell>
                                <TableCell className="text-muted-foreground">{p.comment}</TableCell>
                                {!isReadOnly && (
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => handleRemoveProgress(p.year, p.month)}>
                                        <Trash2 className="h-4 w-4 text-destructive"/>
                                    </Button>
                                </TableCell>
                                )}
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={isReadOnly ? 3 : 4} className="h-24 text-center">Nenhum progresso registrado.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Card>
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild><Button variant="outline">Fechar</Button></DialogClose>
        {!isReadOnly && <Button onClick={handleSubmit} disabled={isSaveDisabled}>Salvar Atividade</Button>}
      </DialogFooter>
    </DialogContent>
  );
};


const ActivityCard = ({
  activity,
  onEdit,
  onDelete,
  onView,
}: {
  activity: Activity;
  onEdit: (activity: Activity) => void;
  onDelete: (activityId: string) => void;
  onView: (activity: Activity) => void;
}) => {
    
  const getLatestProgress = (activity: Activity) => {
    const { progressHistory } = activity;
    if (!progressHistory || progressHistory.length === 0) return 0;
    const sortedHistory = [...progressHistory].sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });
    return sortedHistory[0].percentage;
  };
  
  const latestProgress = getLatestProgress(activity);
  const isCompleted = latestProgress === 100;

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>{activity.title}</CardTitle>
        <CardDescription>
          Iniciada em {activity.startDate ? format(add(activity.startDate, {minutes: activity.startDate.getTimezoneOffset()}), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : 'Data não definida'}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground mb-4">{activity.description}</p>
        <Progress value={latestProgress} aria-label={`${latestProgress}% completo`} />
        <p className="text-sm font-medium text-right mt-1">{latestProgress}%</p>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        {isCompleted ? (
            <Button variant="outline" size="sm" onClick={() => onView(activity)}>
                <Eye className="mr-2" />
                Visualizar
            </Button>
        ) : (
            <Button variant="outline" size="sm" onClick={() => onEdit(activity)}>
                <Edit className="mr-2" />
                Editar
            </Button>
        )}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash2 />
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
              <AlertDialogAction onClick={() => onDelete(activity.id)}>
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
};


export default function AppraiseeDashboard() {
  const { toast } = useToast();
  const { activities, setActivities, evaluationPeriods } = useDataContext();
  const currentUserId = 'user-appraisee-1'; // Hardcoded for now
  const userActivities = activities.filter(a => a.userId === currentUserId);

  const [isActivityFormOpen, setActivityFormOpen] = React.useState(false);
  const [selectedActivity, setSelectedActivity] = React.useState<Activity | null>(null);
  const [isFormReadOnly, setIsFormReadOnly] = React.useState(false);

  const activePeriod = evaluationPeriods.find(p => p.status === 'Ativo');

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
    handleCloseForms();
  };

  const handleOpenActivityForm = (activity: Activity | null, readOnly = false) => {
    setSelectedActivity(activity);
    setIsFormReadOnly(readOnly);
    setActivityFormOpen(true);
  }

  const handleCloseForms = () => {
    setActivityFormOpen(false);
    setSelectedActivity(null);
    setIsFormReadOnly(false);
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
            <Button onClick={() => handleOpenActivityForm(null)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Registrar Atividade
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Tabs defaultValue="in-progress">
            <TabsList className="mb-4">
              <TabsTrigger value="in-progress"><ListTodo className="mr-2" />Em Andamento</TabsTrigger>
              <TabsTrigger value="completed"><CheckCircle className="mr-2" />Concluídas</TabsTrigger>
            </TabsList>
            <TabsContent value="in-progress">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {inProgressActivities.map((activity) => (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    onEdit={() => handleOpenActivityForm(activity)}
                    onDelete={handleDeleteActivity}
                    onView={() => handleOpenActivityForm(activity, true)}
                  />
                ))}
                {inProgressActivities.length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
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
                        <TableHead>Início</TableHead>
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
                              {activity.startDate ? format(add(activity.startDate, {minutes: activity.startDate.getTimezoneOffset()}), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : 'N/A'}
                            </TableCell>
                            <TableCell>
                              <Badge>Concluído</Badge>
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                              <Button variant="ghost" size="icon" onClick={() => handleOpenActivityForm(activity, true)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                               <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                      <Trash2 className="h-4 w-4" />
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

        <Dialog open={isActivityFormOpen} onOpenChange={setActivityFormOpen}>
          {isActivityFormOpen && ( // Render only when open to re-mount and fetch correct state
            <ActivityForm
              activity={selectedActivity}
              onSave={handleSaveActivity}
              onClose={handleCloseForms}
              currentUserId={currentUserId}
              isReadOnly={isFormReadOnly}
              activePeriod={activePeriod}
            />
          )}
        </Dialog>
        
      </div>
    </>
  );
}
