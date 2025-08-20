
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Calendar, Edit, Link2, PlusCircle, Trash2, Users, AlertTriangle, KeyRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import type { User, EvaluationPeriod, Role, Association } from "@/lib/types";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useDataContext } from "@/context/DataContext";
import { UserFormModal, type UserFormData } from "./UserFormModal";
import { NewAppraiserFormModal } from "./NewAppraiserFormModal";
import { cn } from "@/lib/utils";


const PeriodFormModal = ({
  period,
  onSave,
  onClose,
}: {
  period: EvaluationPeriod | null;
  onSave: (period: EvaluationPeriod) => void;
  onClose: () => void;
}) => {
  const [name, setName] = React.useState('');
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');
  const [status, setStatus] = React.useState<'Ativo' | 'Inativo'>('Inativo');
  const { toast } = useToast();
  const { evaluationPeriods } = useDataContext();

  const resetForm = React.useCallback(() => {
      setName('');
      setStartDate('');
      setEndDate('');
      setStatus('Inativo');
  }, []);

  React.useEffect(() => {
    if (period) {
      setName(period.name);
      setStartDate(format(period.startDate, 'yyyy-MM-dd'));
      setEndDate(format(period.endDate, 'yyyy-MM-dd'));
      setStatus(period.status);
    } else {
      resetForm();
    }
  }, [period, resetForm]);

  const handleSave = () => {
    if (!name || !startDate || !endDate) {
      toast({
        variant: "destructive",
        title: "Campos Obrigatórios",
        description: "Preencha todos os campos para salvar o período.",
      });
      return;
    }
    
    // Validation: Only one active period allowed
    if (status === 'Ativo') {
        const hasOtherActivePeriod = evaluationPeriods.some(p => p.status === 'Ativo' && p.id !== period?.id);
        if (hasOtherActivePeriod) {
            toast({
                variant: "destructive",
                title: "Validação Falhou",
                description: "Já existe um período de avaliação ativo. Apenas um período pode estar ativo por vez.",
            });
            return;
        }
    }

    const savedPeriod: EvaluationPeriod = {
      id: period?.id || `period-${Date.now()}`,
      name,
      startDate: new Date(`${startDate}T12:00:00`),
      endDate: new Date(`${endDate}T12:00:00`),
      status,
    };
    onSave(savedPeriod);
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{period ? 'Editar Período' : 'Novo Período de Avaliação'}</DialogTitle>
        <DialogDescription>
          {period ? 'Atualize os detalhes do período.' : 'Crie um novo ciclo de avaliação.'}
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
          <Label htmlFor="period-name" className="md:text-right">Nome</Label>
          <Input id="period-name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-1 md:col-span-3" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
          <Label htmlFor="start-date" className="md:text-right">Data de Início</Label>
          <Input id="start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="col-span-1 md:col-span-3" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
          <Label htmlFor="end-date" className="md:text-right">Data de Fim</Label>
          <Input id="end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="col-span-1 md:col-span-3" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
          <Label htmlFor="status" className="md:text-right">Status</Label>
          <Select value={status} onValueChange={(value: 'Ativo' | 'Inativo') => setStatus(value)}>
            <SelectTrigger className="col-span-1 md:col-span-3">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Ativo">Ativo</SelectItem>
              <SelectItem value="Inativo">Inativo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
         <Button variant="outline" onClick={onClose}>Cancelar</Button>
         <Button onClick={handleSave}>Salvar</Button>
      </DialogFooter>
    </DialogContent>
  );
};


export default function AdminDashboard() {
  const { 
    users, 
    evaluationPeriods, 
    associations,
    connectionError,
    addUser,
    updateUser,
    deleteUser,
    addEvaluationPeriod,
    updateEvaluationPeriod,
    addAssociation,
    deleteAssociation,
   } = useDataContext();

  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const [selectedPeriod, setSelectedPeriod] = React.useState<EvaluationPeriod | null>(null);
  const [isUserModalOpen, setUserModalOpen] = React.useState(false);
  const [isPeriodModalOpen, setPeriodModalOpen] = React.useState(false);
  const [userModalMode, setUserModalMode] = React.useState<'create' | 'edit'>('create');
  
  const [selectedAppraisee, setSelectedAppraisee] = React.useState('');
  const [selectedAppraiser, setSelectedAppraiser] = React.useState('');
  
  const [isNewAppraiserModalOpen, setNewAppraiserModalOpen] = React.useState(false);
  const [newlyCreatedAppraiserId, setNewlyCreatedAppraiserId] = React.useState<string>('');


  const { toast } = useToast();

  const hasActivePeriod = React.useMemo(() => evaluationPeriods.some(p => p.status === 'Ativo'), [evaluationPeriods]);

  const handleSaveUser = async (formData: UserFormData) => {
      if (formData.mode === 'edit' && formData.user) {
        const updatedUserData: User = {
          ...formData.user,
          ...formData.data,
        };
        await updateUser(updatedUserData.id, updatedUserData);
        toast({
            title: "Usuário Atualizado",
            description: "Os dados foram salvos com sucesso.",
        });
      } else {
        // Create mode
        const newUser: Omit<User, 'id'> = {
          ...formData.data,
          avatarUrl: 'https://placehold.co/100x100' // Default avatar
        };

        const newUserId = await addUser(newUser as User);
        if(!newUserId) return;


        if (newUser.role === 'appraisee' && formData.appraiserId) {
            const newAssociation: Omit<Association, 'id'> = {
                appraiseeId: newUserId,
                appraiserId: formData.appraiserId,
            };
            await addAssociation(newAssociation);
            toast({
                title: "Usuário Criado e Associado",
                description: "A nova conta foi criada e vinculada ao avaliador.",
            });
        } else {
            toast({
                title: "Usuário Criado",
                description: `A nova conta de usuário foi criada com status ${newUser.status}.`,
            });
        }
      }
      setUserModalOpen(false);
  };
  
    const handleDeleteUser = async (userId: string) => {
        await deleteUser(userId);
        toast({
            variant: "destructive",
            title: "Usuário Excluído",
            description: "A conta do usuário foi removida permanentemente.",
        });
    };

    const handleResetPassword = async (userToReset: User) => {
        if (!userToReset.cpf || !userToReset.nomeDeGuerra) {
             toast({
                variant: "destructive",
                title: "Redefinição Falhou",
                description: "Não é possível redefinir a senha de um usuário sem CPF ou Nome de Guerra.",
            });
            return;
        }

        const newPassword = `${userToReset.cpf.substring(0, 4)}${userToReset.nomeDeGuerra}`;
        
        const updatedUserData: Partial<User> = {
            password: newPassword,
            forcePasswordChange: true,
        };

        await updateUser(userToReset.id, updatedUserData);

        toast({
            title: "Senha Redefinida",
            description: `A senha de ${userToReset.name} foi redefinida. O usuário precisará alterá-la no próximo login.`,
        });
    };

  const handleSavePeriod = async (periodToSave: EvaluationPeriod) => {
    const isEditing = evaluationPeriods.some(p => p.id === periodToSave.id);
    if (isEditing) {
        await updateEvaluationPeriod(periodToSave.id, periodToSave);
        toast({ title: "Período Atualizado", description: "O período de avaliação foi atualizado." });
    } else {
        await addEvaluationPeriod(periodToSave);
        toast({ title: "Período Criado", description: "O novo período de avaliação foi criado." });
    }
    setPeriodModalOpen(false);
    setSelectedPeriod(null);
  };

  const handleCreateAssociation = async () => {
    if (!selectedAppraisee || !selectedAppraiser) {
        toast({
            variant: "destructive",
            title: "Seleção Incompleta",
            description: "Por favor, selecione um avaliado e um avaliador.",
        });
        return;
    }
    
    const isAlreadyAssociated = associations.some(
        a => a.appraiseeId === selectedAppraisee && a.appraiserId === selectedAppraiser
    );

    if (isAlreadyAssociated) {
        toast({
            variant: "destructive",
            title: "Associação Existente",
            description: "Este avaliado já está associado a este avaliador.",
        });
        return;
    }


    const newAssociation: Omit<Association, 'id'> = {
        appraiseeId: selectedAppraisee,
        appraiserId: selectedAppraiser,
    };
    
    await addAssociation(newAssociation);

    toast({
        title: "Associação Criada",
        description: "O vínculo entre avaliado e avaliador foi criado com sucesso.",
    });

    // Reset fields
    setSelectedAppraisee('');
    setSelectedAppraiser('');
  };

  const handleTogglePeriodStatus = async (periodId: string) => {
    const periodToToggle = evaluationPeriods.find(p => p.id === periodId);
    if (!periodToToggle) return;

    const newStatus: EvaluationPeriod['status'] = periodToToggle.status === 'Ativo' ? 'Inativo' : 'Ativo';
    
    if (newStatus === 'Ativo') {
      const hasOtherActivePeriod = evaluationPeriods.some(
        p => p.status === 'Ativo' && p.id !== periodId
      );
      if (hasOtherActivePeriod) {
        toast({
          variant: "destructive",
          title: "Operação não permitida",
          description: "Já existe um período de avaliação ativo. Apenas um período pode estar ativo por vez.",
        });
        return;
      }
    }

    await updateEvaluationPeriod(periodId, { status: newStatus });
     toast({
      title: "Status Alterado",
      description: `O período "${periodToToggle.name}" agora está ${newStatus.toLowerCase()}.`,
    });
  };


  const openUserModal = (user: User | null, mode: 'create' | 'edit') => {
    setUserModalMode(mode);
    setSelectedUser(user);
    setUserModalOpen(true);
  }

  const openPeriodModal = (period: EvaluationPeriod | null) => {
    setSelectedPeriod(period);
    setPeriodModalOpen(true);
  }
  
  const handleSaveNewAppraiser = async (newUser: User) => {
    const newId = await addUser(newUser);
    if (newId) {
        setNewlyCreatedAppraiserId(newId);
    }
    toast({
      title: "Avaliador Criado",
      description: `O usuário ${newUser.name} foi criado com sucesso.`,
    });
  };

  const getUserDisplayById = (id: string) => {
    const user = users.find(u => u.id === id);
    if (!user) return 'Desconhecido';
    return `${user.postoGrad} ${user.nomeDeGuerra}`;
  };
  
  const getUsernameById = (id: string) => users.find(u => u.id === id)?.name || 'Desconhecido';
  
  const translateRole = (role: Role) => {
    const roles: Record<Role, string> = {
      admin: 'Administrador',
      appraiser: 'Avaliador',
      appraisee: 'Avaliado',
    };
    return roles[role] || role;
  }

  return (
    <>
      <Dialog open={isUserModalOpen} onOpenChange={setUserModalOpen}>
        <UserFormModal 
          mode={userModalMode}
          user={selectedUser} 
          users={users}
          onSave={handleSaveUser}
          onClose={() => setUserModalOpen(false)}
          onOpenNewAppraiserModal={() => setNewAppraiserModalOpen(true)}
          onAppraiserCreated={setNewlyCreatedAppraiserId}
        />
      </Dialog>
      <NewAppraiserFormModal 
        isOpen={isNewAppraiserModalOpen}
        onClose={() => setNewAppraiserModalOpen(false)}
        onSave={handleSaveNewAppraiser}
        existingUsers={users}
      />
      <Dialog open={isPeriodModalOpen} onOpenChange={(isOpen) => {
        if (!isOpen) {
            setSelectedPeriod(null);
        }
        setPeriodModalOpen(isOpen);
      }}>
        <PeriodFormModal 
            period={selectedPeriod} 
            onSave={handleSavePeriod} 
            onClose={() => {
                setPeriodModalOpen(false);
                setSelectedPeriod(null);
            }} 
        />
      </Dialog>
      
      <div className="flex flex-col h-full">
        <main className="flex-1 p-2 md:p-6 overflow-auto">
          {connectionError && (
             <Alert variant="destructive" className="mb-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Falha na Conexão com o Banco de Dados</AlertTitle>
                <AlertDescription>
                   Não foi possível carregar os dados mais recentes do Firestore. As informações exibidas podem estar desatualizadas ou incompletas. Verifique sua conexão com a internet.
                </AlertDescription>
            </Alert>
          )}

          {!hasActivePeriod && !connectionError && (
             <Alert variant="destructive" className="mb-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Nenhum Período de Avaliação Ativo</AlertTitle>
                <AlertDescription>
                   Não há um período de avaliação ativo para o ano corrente. Algumas funcionalidades, como o registro de novas atividades, podem estar desabilitadas. Por favor, crie ou ative um período na aba 'Períodos de Avaliação'.
                </AlertDescription>
            </Alert>
          )}


          <div className="mb-6">
            <h1 className="text-3xl font-bold font-headline">Painel do Administrador</h1>
            <p className="text-muted-foreground">Gerencie todo o ecossistema de avaliação.</p>
          </div>
          <Tabs defaultValue="accounts">
            <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 mb-6 h-auto">
              <TabsTrigger value="accounts" className="py-2"><Users className="mr-2" /> Contas</TabsTrigger>
              <TabsTrigger value="periods" className="py-2"><Calendar className="mr-2" /> Períodos de Avaliação</TabsTrigger>
              <TabsTrigger value="associations" className="py-2"><Link2 className="mr-2" /> Associações</TabsTrigger>
            </TabsList>
            
            <TabsContent value="accounts">
              <Card>
                <CardHeader className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <CardTitle>Contas de Usuário</CardTitle>
                    <CardDescription>Crie, visualize e gerencie todas as contas de usuário.</CardDescription>
                  </div>
                  <Button onClick={() => openUserModal(null, 'create')}>
                    <PlusCircle className="mr-2 h-4 w-4" />Criar Conta
                  </Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Posto/Grad. e Nome de Guerra</TableHead>
                        <TableHead className="hidden md:table-cell">CPF</TableHead>
                        <TableHead>Perfil</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-center">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.postoGrad} {user.nomeDeGuerra}</TableCell>
                          <TableCell className="hidden md:table-cell">{user.cpf || 'N/A'}</TableCell>
                          <TableCell><Badge variant="secondary">{translateRole(user.role)}</Badge></TableCell>
                           <TableCell>
                            <Badge className={cn(
                                user.status === 'Ativo' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            )}>
                                {user.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                              <Button variant="ghost" size="icon" onClick={() => openUserModal(user, 'edit')}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                      <Button variant="ghost" size="icon">
                                          <KeyRound className="h-4 w-4" />
                                      </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                      <AlertDialogHeader>
                                          <AlertDialogTitle>Confirmar Redefinição de Senha</AlertDialogTitle>
                                          <AlertDialogDescription>
                                              Tem certeza que deseja redefinir a senha para o usuário "{user.name}"? A nova senha será o padrão (4 primeiros dígitos do CPF + Nome de Guerra) e o usuário será forçado a alterá-la no próximo login.
                                          </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                          <AlertDialogAction onClick={() => handleResetPassword(user)}>Redefinir</AlertDialogAction>
                                      </AlertDialogFooter>
                                  </AlertDialogContent>
                              </AlertDialog>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Tem certeza que deseja excluir o usuário "{user.name}"? Esta ação não pode ser desfeita.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>Excluir</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="periods">
              <Card>
                <CardHeader className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                   <div>
                     <CardTitle>Períodos de Avaliação</CardTitle>
                     <CardDescription>Defina e gerencie os ciclos de avaliação.</CardDescription>
                   </div>
                   <Button onClick={() => openPeriodModal(null)}><PlusCircle className="mr-2 h-4 w-4" />Novo Período</Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome do Período</TableHead>
                        <TableHead className="hidden sm:table-cell">Data de Início</TableHead>
                        <TableHead className="hidden sm:table-cell">Data de Fim</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-center">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {evaluationPeriods.map((period) => (
                        <TableRow key={period.id}>
                          <TableCell>{period.name}</TableCell>
                          <TableCell className="hidden sm:table-cell">{format(period.startDate, "dd/MM/yyyy")}</TableCell>
                          <TableCell className="hidden sm:table-cell">{format(period.endDate, "dd/MM/yyyy")}</TableCell>
                          <TableCell>
                            <Button 
                              variant={period.status === 'Ativo' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => handleTogglePeriodStatus(period.id)}
                              className="w-24"
                            >
                                {period.status}
                            </Button>
                          </TableCell>
                          <TableCell className="text-center">
                              <Button variant="ghost" size="icon" onClick={() => openPeriodModal(period)}>
                                  <Edit className="h-4 w-4" />
                              </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="associations">
              <Card>
                <CardHeader>
                  <CardTitle>Associações de Avaliador e Avaliado</CardTitle>
                  <CardDescription>Vincule os avaliados aos seus respectivos avaliadores.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="border rounded-lg p-4 space-y-4 bg-muted/20">
                      <h3 className="font-semibold">Criar Nova Associação</h3>
                      <div className="grid md:grid-cols-3 gap-4">
                           <div>
                              <Label htmlFor="appraisee-select">Avaliado</Label>
                              <Select value={selectedAppraisee} onValueChange={setSelectedAppraisee}>
                                  <SelectTrigger id="appraisee-select"><SelectValue placeholder="Selecione um avaliado" /></SelectTrigger>
                                  <SelectContent>
                                      {users.filter(u => u.role === 'appraisee').map(u => <SelectItem key={u.id} value={u.id}>{u.postoGrad} {u.nomeDeGuerra}</SelectItem>)}
                                  </SelectContent>
                              </Select>
                           </div>
                           <div>
                              <Label htmlFor="appraiser-select">Avaliador</Label>
                              <Select value={selectedAppraiser} onValueChange={setSelectedAppraiser}>
                                  <SelectTrigger id="appraiser-select"><SelectValue placeholder="Selecione um avaliador" /></SelectTrigger>
                                  <SelectContent>
                                      {users.filter(u => u.role === 'appraiser').map(u => <SelectItem key={u.id} value={u.id}>{u.postoGrad} {u.nomeDeGuerra}</SelectItem>)}
                                  </SelectContent>
                              </Select>
                           </div>
                           <div className="flex items-end">
                              <Button className="w-full md:w-auto" onClick={handleCreateAssociation}><Link2 className="mr-2 h-4 w-4"/>Associar</Button>
                           </div>
                      </div>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Avaliado</TableHead>
                        <TableHead>Avaliador</TableHead>
                        <TableHead className="text-center">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {associations.map((assoc) => (
                        <TableRow key={assoc.id}>
                          <TableCell>{getUserDisplayById(assoc.appraiseeId)}</TableCell>
                          <TableCell>{getUserDisplayById(assoc.appraiserId)}</TableCell>
                          <TableCell className="text-center">
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Tem certeza que deseja excluir esta associação?
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => deleteAssociation(assoc.id)}>Excluir</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </>
  );
}
