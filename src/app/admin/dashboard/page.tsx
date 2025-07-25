
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
  users as mockUsers,
  evaluationPeriods as mockPeriods,
  associations,
} from "@/lib/mock-data";
import { Calendar, Edit, Link2, PlusCircle, Trash2, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import type { User, EvaluationPeriod, Role } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const UserFormModal = ({ user, onSave, users }: { user: User | null; onSave: (user: User) => void; users: User[] }) => {
  const [cpf, setCpf] = React.useState(user?.cpf || '');
  const [name, setName] = React.useState(user?.name || '');
  const [socialName, setSocialName] = React.useState(user?.socialName || '');
  const [email, setEmail] = React.useState(user?.email || '');
  const [sector, setSector] = React.useState(user?.sector || '');
  const [jobTitle, setJobTitle] = React.useState(user?.jobTitle || '');
  const [role, setRole] = React.useState(user?.role || 'appraisee');

  const { toast } = useToast();
  
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const onlyNumbers = e.target.value.replace(/[^0-9]/g, '');
    setCpf(onlyNumbers);
  };

  React.useEffect(() => {
    if (user) {
        setName(user.name || '');
        setSocialName(user.socialName || '');
        setEmail(user.email || '');
        setCpf(user.cpf || '');
        setSector(user.sector || '');
        setJobTitle(user.jobTitle || '');
        setRole(user.role || 'appraisee');
    }
  }, [user]);

  const handleSave = () => {
    if (!user) return;

    if (!cpf || cpf.length !== 11) {
        toast({
            variant: "destructive",
            title: "Erro de Validação",
            description: "O CPF deve conter 11 dígitos.",
        });
        return;
    }

    const isCpfTaken = users.some(u => u.cpf === cpf && u.id !== user.id);
    if (isCpfTaken) {
        toast({
            variant: "destructive",
            title: "CPF Duplicado",
            description: "Este CPF já está sendo utilizado por outro usuário.",
        });
        return;
    }
    const updatedUser: User = { 
        ...user, 
        cpf,
        name,
        socialName,
        email,
        sector,
        jobTitle,
        role,
    };
    onSave(updatedUser);
  };


  if (!user) return null;

  return (
    <DialogContent className="sm:max-w-[625px]">
      <DialogHeader>
        <DialogTitle>Editar Usuário</DialogTitle>
        <DialogDescription>
          Atualize os dados do usuário.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">
            Nome Completo
          </Label>
          <Input id="name" value={name} onChange={e => setName(e.target.value)} className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="socialName" className="text-right">
            Nome Social
          </Label>
          <Input id="socialName" value={socialName} onChange={e => setSocialName(e.target.value)} className="col-span-3" />
        </div>
         <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="cpf" className="text-right">
            CPF (Login)
          </Label>
          <Input id="cpf" value={cpf} onChange={handleCpfChange} className="col-span-3" placeholder="Apenas números" maxLength={11} />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="email" className="text-right">
            Email
          </Label>
          <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="col-span-3" />
        </div>
         <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="sector" className="text-right">
            Sigla do Setor
          </Label>
          <Input id="sector" value={sector} onChange={e => setSector(e.target.value)} className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="jobTitle" className="text-right">
            Função
          </Label>
          <Input id="jobTitle" value={jobTitle} onChange={e => setJobTitle(e.target.value)} className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="role" className="text-right">
            Perfil
          </Label>
          <Select value={role} onValueChange={value => setRole(value as User['role'])}>
            <SelectTrigger className="col-span-3">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Administrador</SelectItem>
              <SelectItem value="appraiser">Avaliador</SelectItem>
              <SelectItem value="appraisee">Avaliado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancelar</Button>
        </DialogClose>
        <DialogClose asChild>
          <Button onClick={handleSave}>Salvar Alterações</Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
};

const PeriodFormModal = ({
  period,
  onSave,
  periods,
  onClose,
}: {
  period: EvaluationPeriod | null;
  onSave: (period: EvaluationPeriod) => void;
  periods: EvaluationPeriod[];
  onClose: () => void;
}) => {
  const [name, setName] = React.useState('');
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');
  const [status, setStatus] = React.useState<'Ativo' | 'Inativo'>('Inativo');
  const { toast } = useToast();

  React.useEffect(() => {
    if (period) {
      setName(period.name);
      setStartDate(format(period.startDate, 'yyyy-MM-dd'));
      setEndDate(format(period.endDate, 'yyyy-MM-dd'));
      setStatus(period.status);
    } else {
      // Reset form for new period
      setName('');
      setStartDate('');
      setEndDate('');
      setStatus('Inativo');
    }
  }, [period]);

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
        const hasOtherActivePeriod = periods.some(p => p.status === 'Ativo' && p.id !== period?.id);
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
      startDate: new Date(startDate),
      endDate: new Date(endDate),
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
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="period-name" className="text-right">Nome</Label>
          <Input id="period-name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="start-date" className="text-right">Data de Início</Label>
          <Input id="start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="end-date" className="text-right">Data de Fim</Label>
          <Input id="end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="status" className="text-right">Status</Label>
          <Select value={status} onValueChange={(value: 'Ativo' | 'Inativo') => setStatus(value)}>
            <SelectTrigger className="col-span-3">
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
  const [users, setUsers] = React.useState<User[]>(mockUsers);
  const [evaluationPeriods, setEvaluationPeriods] = React.useState<EvaluationPeriod[]>(mockPeriods);
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const [selectedPeriod, setSelectedPeriod] = React.useState<EvaluationPeriod | null>(null);
  const [isUserModalOpen, setUserModalOpen] = React.useState(false);
  const [isPeriodModalOpen, setPeriodModalOpen] = React.useState(false);

  const { toast } = useToast();

  const handleSaveUser = (updatedUser: User) => {
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    toast({
        title: "Usuário Atualizado",
        description: "Os dados do usuário foram salvos com sucesso.",
    });
    setUserModalOpen(false);
  };
  
  const handleSavePeriod = (periodToSave: EvaluationPeriod) => {
    const isEditing = evaluationPeriods.some(p => p.id === periodToSave.id);
    if (isEditing) {
        setEvaluationPeriods(evaluationPeriods.map(p => p.id === periodToSave.id ? periodToSave : p));
        toast({ title: "Período Atualizado", description: "O período de avaliação foi atualizado." });
    } else {
        setEvaluationPeriods([periodToSave, ...evaluationPeriods]);
        toast({ title: "Período Criado", description: "O novo período de avaliação foi criado." });
    }
    setPeriodModalOpen(false);
    setSelectedPeriod(null);
  };

  const openUserModal = (user: User) => {
    setSelectedUser(user);
    setUserModalOpen(true);
  }

  const openPeriodModal = (period: EvaluationPeriod | null) => {
    setSelectedPeriod(period);
    setPeriodModalOpen(true);
  }

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
        <UserFormModal user={selectedUser} onSave={handleSaveUser} users={users} />
      </Dialog>
      <Dialog open={isPeriodModalOpen} onOpenChange={setPeriodModalOpen}>
        <PeriodFormModal 
            period={selectedPeriod} 
            onSave={handleSavePeriod} 
            periods={evaluationPeriods} 
            onClose={() => {
                setPeriodModalOpen(false);
                setSelectedPeriod(null);
            }} 
        />
      </Dialog>
      
      <div className="flex flex-col h-full">
        <header className="bg-card border-b p-4">
          <h1 className="text-3xl font-bold font-headline">Painel do Administrador</h1>
          <p className="text-muted-foreground">Gerencie todo o ecossistema de avaliação.</p>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Tabs defaultValue="accounts">
            <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 mb-6">
              <TabsTrigger value="accounts"><Users className="mr-2" /> Contas</TabsTrigger>
              <TabsTrigger value="periods"><Calendar className="mr-2" /> Períodos de Avaliação</TabsTrigger>
              <TabsTrigger value="associations"><Link2 className="mr-2" /> Associações</TabsTrigger>
            </TabsList>
            
            <TabsContent value="accounts">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Contas de Usuário</CardTitle>
                      <CardDescription>Crie, visualize e gerencie todas as contas de usuário.</CardDescription>
                    </div>
                    <Button><PlusCircle className="mr-2 h-4 w-4" />Criar Conta</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome Social</TableHead>
                        <TableHead>CPF</TableHead>
                        <TableHead>Setor</TableHead>
                        <TableHead>Função</TableHead>
                        <TableHead>Perfil</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.socialName}</TableCell>
                          <TableCell>{user.cpf}</TableCell>
                          <TableCell>{user.sector}</TableCell>
                          <TableCell>{user.jobTitle}</TableCell>
                          <TableCell><Badge variant="secondary">{translateRole(user.role)}</Badge></TableCell>
                          <TableCell className="text-right">
                              <Button variant="ghost" size="icon" onClick={() => openUserModal(user)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
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
                <CardHeader>
                   <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>Períodos de Avaliação</CardTitle>
                        <CardDescription>Defina e gerencie os ciclos de avaliação.</CardDescription>
                      </div>
                      <Button onClick={() => openPeriodModal(null)}><PlusCircle className="mr-2 h-4 w-4" />Novo Período</Button>
                   </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome do Período</TableHead>
                        <TableHead>Data de Início</TableHead>
                        <TableHead>Data de Fim</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {evaluationPeriods.map((period) => (
                        <TableRow key={period.id}>
                          <TableCell>{period.name}</TableCell>
                          <TableCell>{format(period.startDate, 'dd/MM/yyyy')}</TableCell>
                          <TableCell>{format(period.endDate, 'dd/MM/yyyy')}</TableCell>
                          <TableCell>
                            <Badge variant={period.status === 'Ativo' ? 'default' : 'outline'}>{period.status}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                             <Button variant="ghost" size="icon" onClick={() => openPeriodModal(period)}><Edit className="h-4 w-4" /></Button>
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
                              <Select>
                                  <SelectTrigger id="appraisee-select"><SelectValue placeholder="Selecione um avaliado" /></SelectTrigger>
                                  <SelectContent>
                                      {users.filter(u => u.role === 'appraisee').map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                                  </SelectContent>
                              </Select>
                           </div>
                           <div>
                              <Label htmlFor="appraiser-select">Avaliador</Label>
                              <Select>
                                  <SelectTrigger id="appraiser-select"><SelectValue placeholder="Selecione um avaliador" /></SelectTrigger>
                                  <SelectContent>
                                      {users.filter(u => u.role === 'appraiser').map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                                  </SelectContent>
                              </Select>
                           </div>
                           <div className="flex items-end">
                              <Button className="w-full md:w-auto"><Link2 className="mr-2 h-4 w-4"/>Associar</Button>
                           </div>
                      </div>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Avaliado</TableHead>
                        <TableHead>Avaliador</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {associations.map((assoc) => (
                        <TableRow key={assoc.id}>
                          <TableCell>{getUsernameById(assoc.appraiseeId)}</TableCell>
                          <TableCell>{getUsernameById(assoc.appraiserId)}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
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
