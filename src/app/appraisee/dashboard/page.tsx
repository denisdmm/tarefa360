
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
  DialogTrigger,
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
import { Edit, PlusCircle, Trash2, CheckCircle, ListTodo, CalendarIcon, Activity as ActivityIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useDataContext } from "@/context/DataContext";
import { format, getMonth, getYear, parse, isValid, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

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
  const [endDate, setEndDate] = React.useState<Date | undefined>();
  const [isStartDatePickerOpen, setStartDatePickerOpen] = React.useState(false);
  const [isEndDatePickerOpen, setEndDatePickerOpen] = React.useState(false);

  const { toast } = useToast();

  React.useEffect(() => {
    if (activity) {
      setTitle(activity.title || "");
      setDescription(activity.description || "");
      setStartDate(activity.startDate ? startOfDay(activity.startDate) : undefined);
      setEndDate(activity.endDate ? startOfDay(activity.endDate) : undefined);
    } else {
      setTitle("");
      setDescription("");
      setStartDate(startOfDay(new Date()));
      setEndDate(undefined);
    }
  }, [activity]);

  const handleDateChange = (date: Date | undefined, setter: (value: Date | undefined) => void) => {
    if (date) {
      setter(startOfDay(date));
    } else {
      setter(undefined);
    }
  };

  const handleSubmit = () => {
    if (!startDate || !endDate) {
      toast({
        variant: "destructive",
        title: "Data Inválida",
        description: "Por favor, insira datas de início e fim válidas.",
      });
      return;
    }
    if (endDate < startDate) {
      toast({
        variant: "destructive",
        title: "Data Inválida",
        description: "A data de fim não pode ser anterior à data de início.",
      });
      return;
    }

    const newActivity: Activity = {
      id: activity?.id || `act-${Date.now()}`,
      title,
      description,
      startDate,
      endDate,
      progressHistory: activity?.progressHistory || [],
      userId: currentUserId,
    };
    onSave(newActivity);
    onClose();
  };

  return (
    <DialogContent className="sm:max-w-[625px]">
      <DialogHeader>
        <DialogTitle>{activity ? "Editar Atividade" : "Criar Nova Atividade"}</DialogTitle>
        <DialogDescription>
          {activity
            ? "Atualize os detalhes da sua atividade."
            : "Registre uma nova atividade para o período de avaliação atual."}
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
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
            <Popover open={isStartDatePickerOpen} onOpenChange={setStartDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="col-span-3 justify-start font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, 'dd/MM/yyyy') : <span>Escolha uma data</span>}
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
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="end-date" className="text-right">Data de Fim</Label>
            <Popover open={isEndDatePickerOpen} onOpenChange={setEndDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="col-span-3 justify-start font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, 'dd/MM/yyyy') : <span>Escolha uma data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={(date) => {
                    handleDateChange(date, setEndDate);
                    setEndDatePickerOpen(false);
                  }}
                  disabled={{ before: startDate || new Date() }}
                  initialFocus
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
        <Button onClick={handleSubmit}>Salvar Atividade</Button>
      </DialogFooter>
    </DialogContent>
  );
};

const ProgressForm = ({
  activity,
  onSave,
  onClose,
}: {
  activity: Activity;
  onSave: (activity: Activity) => void;
  onClose: () => void;
}) => {
  const [progressHistory, setProgressHistory] = React.useState<ProgressEntry[]>([]);
  const [currentProgress, setCurrentProgress] = React.useState(0);
  const [currentComment, setCurrentComment] = React.useState("");

  const { toast } = useToast();
  const currentMonth = getMonth(new Date()) + 1;
  const currentYear = getYear(new Date());

  const canAddProgressForCurrentMonth = React.useMemo(() => {
    if (!activity.startDate || !activity.endDate) return false;
    const today = startOfDay(new Date());
    return today >= startOfDay(activity.startDate) && today <= startOfDay(activity.endDate);
  }, [activity.startDate, activity.endDate]);

  const hasProgressForCurrentMonth = React.useMemo(() => {
    return progressHistory.some(p => p.year === currentYear && p.month === currentMonth);
  }, [progressHistory, currentYear, currentMonth]);

  React.useEffect(() => {
    setProgressHistory(activity.progressHistory || []);
    const existingEntry = activity.progressHistory?.find(p => p.year === currentYear && p.month === currentMonth);
    if (existingEntry) {
      setCurrentProgress(existingEntry.percentage);
      setCurrentComment(existingEntry.comment);
    } else {
      setCurrentProgress(0);
      setCurrentComment("");
    }
  }, [activity, currentYear, currentMonth]);

  const handleSaveProgress = () => {
    if (!canAddProgressForCurrentMonth) {
      toast({
        variant: "destructive",
        title: "Ação não permitida",
        description: "Não é possível registrar progresso fora do período da atividade.",
      });
      return;
    }

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

    const updatedActivity = { ...activity, progressHistory: updatedHistory };
    onSave(updatedActivity);
    onClose();
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Registrar Progresso de Atividade</DialogTitle>
        <DialogDescription>
          Atualize o andamento de "{activity.title}" para o mês de {format(new Date(), 'MMMM', { locale: ptBR })}.
        </DialogDescription>
      </DialogHeader>
      <div className="py-4 space-y-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="current-progress" className="text-right">Conclusão (%)</Label>
          <Input
            id="current-progress"
            type="number"
            value={currentProgress}
            onChange={(e) => setCurrentProgress(Number(e.target.value))}
            min="0"
            max="100"
            disabled={!canAddProgressForCurrentMonth}
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
            disabled={!canAddProgressForCurrentMonth}
          />
        </div>
        {!canAddProgressForCurrentMonth && (
          <p className="text-center text-sm text-destructive">Não é possível registrar progresso para esta atividade no mês atual.</p>
        )}
      </div>
      <DialogFooter>
        <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
        <Button onClick={handleSaveProgress} disabled={!canAddProgressForCurrentMonth}>
          {hasProgressForCurrentMonth ? 'Atualizar Progresso' : 'Salvar Progresso'}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};


const ActivityCard = ({
  activity,
  onEdit,
  onSave,
  onDelete,
  latestProgress,
}: {
  activity: Activity;
  onEdit: (activity: Activity) => void;
  onSave: (activity: Activity) => void;
  onDelete: (activityId: string) => void;
  latestProgress: number;
}) => {
  const [isProgressFormOpen, setProgressFormOpen] = React.useState(false);

  return (
    <>
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>{activity.title}</CardTitle>
          <CardDescription>
            {format(activity.startDate, "MMMM 'de' yyyy", { locale: ptBR })} - {format(activity.endDate, "MMMM 'de' yyyy", { locale: ptBR })}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-sm text-muted-foreground mb-4">{activity.description}</p>
          <Progress value={latestProgress} aria-label={`${latestProgress}% completo`} />
          <p className="text-sm font-medium text-right mt-1">{latestProgress}%</p>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={() => setProgressFormOpen(true)}>
            <ActivityIcon className="mr-2 h-4 w-4" /> Registrar Progresso
          </Button>
          <Button variant="outline" size="sm" onClick={() => onEdit(activity)}>
            <Edit className="mr-2 h-4 w-4" /> Editar
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="mr-2 h-4 w-4" />
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

      <Dialog open={isProgressFormOpen} onOpenChange={setProgressFormOpen}>
        <ProgressForm
          activity={activity}
          onSave={onSave}
          onClose={() => setProgressFormOpen(false)}
        />
      </Dialog>
    </>
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
                    onSave={handleSaveActivity}
                    onDelete={handleDeleteActivity}
                    latestProgress={getLatestProgress(activity)}
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
                              {format(activity.startDate, "MMMM 'de' yyyy", { locale: ptBR })} - {format(activity.endDate, "MMMM 'de' yyyy", { locale: ptBR })}
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
