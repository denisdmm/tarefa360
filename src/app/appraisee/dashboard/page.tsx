
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
import { Edit, PlusCircle, Trash2, CheckCircle, ListTodo, CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useDataContext } from "@/context/DataContext";
import { format, getMonth, getYear, startOfDay, eachMonthOfInterval, startOfMonth, max } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const [startDate, setStartDate] = React.useState<Date | undefined>();
  const [isStartDatePickerOpen, setStartDatePickerOpen] = React.useState(false);

  const [progressHistory, setProgressHistory] = React.useState<ProgressEntry[]>([]);
  const [currentProgress, setCurrentProgress] = React.useState(0);
  const [currentComment, setCurrentComment] = React.useState("");

  const [selectedYear, setSelectedYear] = React.useState<number>(getYear(new Date()));
  const [selectedMonth, setSelectedMonth] = React.useState<number>(getMonth(new Date()) + 1);


  const { toast } = useToast();

  const availableMonths = React.useMemo(() => {
    if (!startDate) return [];
    
    const today = new Date();
    // The range of months for progress registration should go from the activity's start date
    // up to the current month.
    const endRangeDate = startOfMonth(today);

    const interval = {
      start: startOfMonth(startDate),
      end: endRangeDate,
    };
    
    if (interval.start > interval.end) {
        return [{
            year: getYear(interval.start),
            month: getMonth(interval.start) + 1,
            label: format(interval.start, "MMMM 'de' yyyy", { locale: ptBR }),
            value: `${getYear(interval.start)}-${getMonth(interval.start) + 1}`
        }];
    }

    return eachMonthOfInterval(interval).map(date => ({
      year: getYear(date),
      month: getMonth(date) + 1,
      label: format(date, "MMMM 'de' yyyy", { locale: ptBR }),
      value: `${getYear(date)}-${getMonth(date) + 1}`
    })).reverse();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, activity]);


  React.useEffect(() => {
    if (activity) {
      setTitle(activity.title || "");
      setDescription(activity.description || "");
      setStartDate(activity.startDate ? startOfDay(activity.startDate) : undefined);
      setProgressHistory(activity.progressHistory || []);
    } else {
      setTitle("");
      setDescription("");
      setStartDate(startOfDay(new Date()));
      setProgressHistory([]);
      setCurrentProgress(0);
      setCurrentComment("");
    }
    
    // Set default selected month/year to current if available
    const today = new Date();
    const currentMonthInList = availableMonths.find(m => m.year === getYear(today) && m.month === getMonth(today) + 1);

    if(currentMonthInList) {
        setSelectedYear(getYear(today));
        setSelectedMonth(getMonth(today) + 1);
    } else if (availableMonths.length > 0) {
        // If current month is not available, select the first available month (most recent)
        const [year, month] = availableMonths[0].value.split('-').map(Number);
        setSelectedYear(year);
        setSelectedMonth(month);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activity, availableMonths.length]);

  // This effect updates the form when the selected month/year changes
  React.useEffect(() => {
    if (!activity) {
        // For new activities, reset progress fields
        const latestProgress = progressHistory.sort((a, b) => b.year - a.year || b.month - a.month)[0];
        setCurrentProgress(latestProgress?.percentage || 0);
        setCurrentComment("");
        return;
    };
    
    const existingEntry = activity.progressHistory?.find(p => p.year === selectedYear && p.month === selectedMonth);

    if (existingEntry) {
      setCurrentProgress(existingEntry.percentage);
      setCurrentComment(existingEntry.comment);
    } else {
      // If no entry for selected month, find the latest one before it to suggest progress
       const latestProgress = activity.progressHistory
        ?.filter(p => new Date(p.year, p.month -1) < new Date(selectedYear, selectedMonth -1))
        .sort((a, b) => b.year - a.year || b.month - a.month)[0];
       setCurrentProgress(latestProgress?.percentage || 0);
       setCurrentComment("");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activity, selectedMonth, selectedYear]);


  const handleDateChange = (date: Date | undefined, setter: (value: Date | undefined) => void) => {
    if (date) {
      setter(startOfDay(date));
    } else {
      setter(undefined);
    }
  };

  const handleSubmit = () => {
    if (!startDate) {
      toast({
        variant: "destructive",
        title: "Data Inválida",
        description: "Por favor, insira uma data de início válida.",
      });
      return;
    }
    
    // --- Save Progress Entry ---
    let updatedHistory = [...progressHistory];
    const newEntry: ProgressEntry = {
      year: selectedYear,
      month: selectedMonth,
      percentage: currentProgress,
      comment: currentComment,
    };
    const existingEntryIndex = progressHistory.findIndex(p => p.year === selectedYear && p.month === selectedMonth);

    if (currentComment || currentProgress > 0 || existingEntryIndex > -1){
        if (existingEntryIndex > -1) {
            if(currentComment || currentProgress > 0) {
              updatedHistory[existingEntryIndex] = newEntry;
            } else {
              // If user clears the fields, remove the entry
              updatedHistory.splice(existingEntryIndex, 1);
            }
        } else {
            updatedHistory.push(newEntry);
        }
    }
    
    // --- Save Activity ---
    const updatedActivity: Activity = {
      id: activity?.id || `act-${Date.now()}`,
      title,
      description,
      startDate,
      progressHistory: updatedHistory,
      userId: currentUserId,
    };
    onSave(updatedActivity);
    onClose();
  };

  const handleMonthYearChange = (value: string) => {
      const [year, month] = value.split('-').map(Number);
      setSelectedYear(year);
      setSelectedMonth(month);
  }

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
      <div className="grid gap-6 py-4 max-h-[70vh] overflow-y-auto pr-4">
        {/* Activity Details */}
        <div className="space-y-4">
            <h3 className="font-semibold text-lg">Detalhes da Atividade</h3>
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
                <Popover open={isStartDatePickerOpen} onOpenChange={setStartDatePickerOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="col-span-3 justify-start font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : <span>Escolha uma data</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => {
                        handleDateChange(date, setStartDate);
                        setStartDatePickerOpen(false);
                    }}
                    initialFocus
                    locale={ptBR}
                    />
                </PopoverContent>
                </Popover>
            </div>
        </div>

        <Separator />
        
        {/* Progress Registration */}
        <div className="space-y-4">
             <h3 className="font-semibold text-lg">Registrar Progresso</h3>
             <p className="text-sm text-muted-foreground">
                Selecione o período e atualize o andamento da sua atividade.
            </p>
             <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="month-year" className="text-right">Período</Label>
                <Select 
                    value={`${selectedYear}-${selectedMonth}`}
                    onValueChange={handleMonthYearChange}
                    disabled={!startDate}
                >
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Selecione o mês/ano" />
                    </SelectTrigger>
                    <SelectContent>
                        {availableMonths.map(m => (
                            <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                        ))}
                         {availableMonths.length === 0 && startDate && (
                            <SelectItem value="none" disabled>Progresso pode ser lançado a partir do mês atual.</SelectItem>
                        )}
                        {!startDate && (
                            <SelectItem value="none" disabled>Selecione uma data de início.</SelectItem>
                        )}
                    </SelectContent>
                </Select>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="current-progress" className="text-right">Conclusão (%)</Label>
                <Input
                    id="current-progress"
                    type="number"
                    value={currentProgress}
                    onChange={(e) => setCurrentProgress(Number(e.target.value))}
                    min="0"
                    max="100"
                    disabled={!startDate}
                    className="col-span-3"
                />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="current-comment" className="text-right">Comentário</Label>
                <Textarea
                    id="current-comment"
                    value={currentComment}
                    onChange={e => setCurrentComment(e.target.value)}
                    className="col-span-3"
                    placeholder="Descreva o que foi feito este mês..."
                    disabled={!startDate}
                />
            </div>
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
        <Button onClick={handleSubmit}>Salvar</Button>
      </DialogFooter>
    </DialogContent>
  );
};


const ActivityCard = ({
  activity,
  onEdit,
  onDelete,
}: {
  activity: Activity;
  onEdit: (activity: Activity) => void;
  onDelete: (activityId: string) => void;
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

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>{activity.title}</CardTitle>
        <CardDescription>
          Iniciada em {format(activity.startDate, "MMMM 'de' yyyy", { locale: ptBR })}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground mb-4">{activity.description}</p>
        <Progress value={latestProgress} aria-label={`${latestProgress}% completo`} />
        <p className="text-sm font-medium text-right mt-1">{latestProgress}%</p>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => onEdit(activity)}>
           Editar
        </Button>
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
  const { activities, setActivities } = useDataContext();
  const currentUserId = 'user-appraisee-1'; // Hardcoded for now
  const userActivities = activities.filter(a => a.userId === currentUserId);

  const [isActivityFormOpen, setActivityFormOpen] = React.useState(false);
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
    handleCloseForms();
  };

  const handleOpenActivityForm = (activity: Activity | null) => {
    setSelectedActivity(activity);
    setActivityFormOpen(true);
  }

  const handleCloseForms = () => {
    setActivityFormOpen(false);
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
                    onEdit={handleOpenActivityForm}
                    onDelete={handleDeleteActivity}
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
                              {format(activity.startDate, "MMMM 'de' yyyy", { locale: ptBR })}
                            </TableCell>
                            <TableCell>
                              <Badge>Concluído</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon" onClick={() => handleOpenActivityForm(activity)}>
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

        <Dialog open={isActivityFormOpen} onOpenChange={setActivityFormOpen}>
          {isActivityFormOpen && ( // Render only when open to re-mount and fetch correct state
            <ActivityForm
              activity={selectedActivity}
              onSave={handleSaveActivity}
              onClose={handleCloseForms}
              currentUserId={currentUserId}
            />
          )}
        </Dialog>
        
      </div>
    </>
  );
}
