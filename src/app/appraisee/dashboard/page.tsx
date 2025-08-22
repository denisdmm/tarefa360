
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
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
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
import type { Activity } from "@/lib/types";
import { Edit, PlusCircle, Trash2, CheckCircle, ListTodo, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useDataContext } from "@/context/DataContext";
import { format, add } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ActivityForm } from "@/app/shared/ActivityForm";


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
          Iniciada em {activity.startDate ? format(add(new Date(activity.startDate as any), {minutes: new Date(activity.startDate as any).getTimezoneOffset()}), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : 'Data não definida'}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground mb-4">{activity.description}</p>
        <Progress value={latestProgress} aria-label={`${latestProgress}% completo`} />
        <p className="text-sm font-medium text-right mt-1">{latestProgress}%</p>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => onEdit(activity)}>
            <Edit className="mr-2 h-4 w-4" />
            Editar/Progresso
        </Button>
        <Button variant="destructive" size="icon" title="Excluir a Atividade" onClick={() => onDelete(activity.id)}>
            <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};


export default function AppraiseeDashboard() {
  const { toast } = useToast();
  const { activities, loggedInUser, addActivity, updateActivity, deleteActivity } = useDataContext();
  
  const userActivities = loggedInUser ? activities.filter(a => a.userId === loggedInUser.id) : [];

  const [isActivityFormOpen, setActivityFormOpen] = React.useState(false);
  const [selectedActivity, setSelectedActivity] = React.useState<Activity | null>(null);
  const [isFormReadOnly, setIsFormReadOnly] = React.useState(false);

  const [isDeleteAlertOpen, setDeleteAlertOpen] = React.useState(false);
  const [activityToDeleteId, setActivityToDeleteId] = React.useState<string | null>(null);


  const getLatestProgress = (activity: Activity) => {
    const { progressHistory } = activity;
    if (!progressHistory || progressHistory.length === 0) return 0;
    const sortedHistory = [...progressHistory].sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });
    return sortedHistory[0].percentage;
  };
  

  const handleSaveActivity = async (activityData: Partial<Activity>) => {
    if (activityData.id) {
        // It's an update
        await updateActivity(activityData.id, activityData);
        toast({ title: "Atividade Atualizada", description: "Sua atividade foi atualizada com sucesso." });
    } else {
        // It's a creation
        if (!activityData.userId) { // Ensure userId is set
            toast({ variant: "destructive", title: "Erro", description: "ID do usuário não encontrado." });
            return;
        }
        await addActivity(activityData as Omit<Activity, 'id'>);
        toast({ title: "Atividade Criada", description: "Sua nova atividade foi registrada." });
    }
    handleCloseForms();
};
  
  const handleOpenActivityForm = (activity: Activity | null, readOnly = false) => {
    if (activity === null) {
      setSelectedActivity(null); 
    } else {
      setSelectedActivity(activity);
    }
    setIsFormReadOnly(readOnly);
    setActivityFormOpen(true);
  }

  const handleCloseForms = () => {
    setActivityFormOpen(false);
    setSelectedActivity(null);
    setIsFormReadOnly(false);
  }

  const handleDeleteRequest = (activityId: string) => {
    setActivityToDeleteId(activityId);
    setDeleteAlertOpen(true);
  };

  const confirmDelete = async () => {
    if (!activityToDeleteId) return;

    const success = await deleteActivity(activityToDeleteId);
    
    if (success) {
      toast({
        variant: "destructive",
        title: "Atividade Excluída",
        description: "A atividade foi removida permanentemente.",
      });
    }
    
    setActivityToDeleteId(null);
    setDeleteAlertOpen(false);
  };


  if (!loggedInUser) {
    return <div>Carregando...</div>
  }

  const inProgressActivities = userActivities.filter(a => getLatestProgress(a) < 100);
  const completedActivities = userActivities.filter(a => getLatestProgress(a) === 100);

  const activityToDelete = activityToDeleteId ? userActivities.find(a => a.id === activityToDeleteId) : null;

  return (
    <>
      <div className="flex flex-col h-full">
        <main className="flex-1 p-2 md:p-6 overflow-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h1 className="text-3xl font-bold font-headline">Minhas Atividades</h1>
              <p className="text-muted-foreground">Gerencie suas tarefas e progressos em andamento.</p>
            </div>
            <Button onClick={() => handleOpenActivityForm(null)} className="w-full md:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" />
              Registrar Atividade
            </Button>
          </div>

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
                    onDelete={handleDeleteRequest}
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
                        <TableHead className="hidden md:table-cell">Início</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-center">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {completedActivities.length > 0 ? (
                        completedActivities.map(activity => (
                          <TableRow key={activity.id}>
                            <TableCell className="font-medium">{activity.title}</TableCell>
                            <TableCell className="hidden md:table-cell">
                              {activity.startDate ? format(add(new Date(activity.startDate as any), {minutes: new Date(activity.startDate as any).getTimezoneOffset()}), "dd/MM/yyyy", { locale: ptBR }) : 'N/A'}
                            </TableCell>
                            <TableCell>
                              <Badge>Concluído</Badge>
                            </TableCell>
                            <TableCell className="text-center space-x-2">
                              <Button variant="ghost" size="icon" onClick={() => handleOpenActivityForm(activity, true)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                               <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteRequest(activity.id)}>
                                    <Trash2 className="h-4 w-4" />
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

        <Dialog open={isActivityFormOpen} onOpenChange={(isOpen) => {
            if (!isOpen) {
                handleCloseForms();
            } else {
                setActivityFormOpen(isOpen);
            }
        }}>
          {loggedInUser && isActivityFormOpen && (
           <ActivityForm
              key={selectedActivity?.id || 'new'}
              activity={selectedActivity}
              onSave={handleSaveActivity}
              onClose={handleCloseForms}
              currentUserId={loggedInUser.id}
              isReadOnly={isFormReadOnly}
            />
          )}
        </Dialog>

        <AlertDialog open={isDeleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. Isso excluirá permanentemente a atividade "{activityToDelete?.title}" e todo o seu histórico de progresso.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setDeleteAlertOpen(false)}>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => confirmDelete()}>
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        
      </div>
    </>
  );
}
