
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import type { Activity } from "@/lib/types";
import { Edit, PlusCircle, Trash2, CheckCircle, ListTodo } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useDataContext } from "@/context/DataContext";

const ActivityForm = ({
  activity,
  onSave,
  onClose,
}: {
  activity?: Activity | null;
  onSave: (activity: Activity) => void;
  onClose: () => void;
}) => {
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [month, setMonth] = React.useState("");
  const [percentage, setPercentage] = React.useState(0);
  
  React.useEffect(() => {
    setTitle(activity?.title || "");
    setDescription(activity?.description || "");
    setMonth(activity?.month || "");
    setPercentage(activity?.completionPercentage || 0);
  }, [activity]);


  const handleSubmit = () => {
    const newActivity: Activity = {
      id: activity?.id || `act-${Date.now()}`,
      title,
      description,
      month,
      completionPercentage: Number(percentage),
      userId: activity?.userId || 'user-appraisee-1',
    };
    onSave(newActivity);
    onClose();
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{activity ? "Editar Atividade" : "Criar Nova Atividade"}</DialogTitle>
        <DialogDescription>
          {activity
            ? "Atualize os detalhes da sua atividade."
            : "Registre uma nova atividade para o período de avaliação atual."}
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="title" className="text-right">Título</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="description" className="text-right">Descrição</Label>
          <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="month" className="text-right">Mês</Label>
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Selecione o mês" />
            </SelectTrigger>
            <SelectContent>
              {[ "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro" ].map(m => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="percentage" className="text-right">Conclusão</Label>
          <Input id="percentage" type="number" value={percentage} onChange={(e) => setPercentage(Number(e.target.value))} className="col-span-3" />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSubmit}>Salvar Atividade</Button>
      </DialogFooter>
    </>
  );
};


export default function AppraiseeDashboard() {
  const { toast } = useToast();
  const { activities, setActivities } = useDataContext();
  const userActivities = activities.filter(a => a.userId === 'user-appraisee-1');

  const [isFormOpen, setFormOpen] = React.useState(false);
  const [selectedActivity, setSelectedActivity] = React.useState<Activity | null>(null);

  const handleSaveActivity = (activity: Activity) => {
    const isEditing = activities.some(a => a.id === activity.id);
    if (isEditing) {
      setActivities(activities.map(a => a.id === activity.id ? activity : a));
      toast({ title: "Atividade Atualizada", description: "Sua atividade foi atualizada com sucesso." });
    } else {
      setActivities([activity, ...activities]);
      toast({ title: "Atividade Criada", description: "Sua nova atividade foi registrada." });
    }
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
    setActivities(activities.filter(a => a.id !== activityId));
    toast({ variant: 'destructive', title: "Atividade Excluída", description: "A atividade foi removida." });
  };
  
  const inProgressActivities = userActivities.filter(a => a.completionPercentage < 100);
  const completedActivities = userActivities.filter(a => a.completionPercentage === 100);

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
                    {inProgressActivities.map((activity) => (
                      <Card key={activity.id} className="flex flex-col">
                        <CardHeader>
                          <CardTitle>{activity.title}</CardTitle>
                          <CardDescription>{activity.month}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                          <p className="text-sm text-muted-foreground mb-4">{activity.description}</p>
                          <Progress value={activity.completionPercentage} aria-label={`${activity.completionPercentage}% completo`} />
                          <p className="text-sm font-medium text-right mt-1">{activity.completionPercentage}%</p>
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
                    ))}
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
                                    <TableHead>Mês</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {completedActivities.length > 0 ? (
                                    completedActivities.map(activity => (
                                        <TableRow key={activity.id}>
                                            <TableCell className="font-medium">{activity.title}</TableCell>
                                            <TableCell>{activity.month}</TableCell>
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
            <DialogContent className="sm:max-w-[625px]">
                <ActivityForm 
                    activity={selectedActivity} 
                    onSave={handleSaveActivity} 
                    onClose={handleCloseForm}
                />
            </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
