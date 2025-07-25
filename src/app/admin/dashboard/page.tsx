
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
  users,
  evaluationPeriods,
  associations,
} from "@/lib/mock-data";
import { Calendar, Edit, Link2, PlusCircle, Trash2, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import type { User } from "@/lib/types";
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

const UserFormModal = ({ user }: { user: User | null }) => {
  if (!user) return null;

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Editar Usuário</DialogTitle>
        <DialogDescription>
          Atualize os dados do usuário.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">
            Nome
          </Label>
          <Input id="name" defaultValue={user.name} className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="email" className="text-right">
            Email
          </Label>
          <Input id="email" defaultValue={user.email} className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="role" className="text-right">
            Função
          </Label>
          <Select defaultValue={user.role}>
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
        <Button>Salvar Alterações</Button>
      </DialogFooter>
    </DialogContent>
  );
};


export default function AdminDashboard() {
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  
  const getUsernameById = (id: string) => users.find(u => u.id === id)?.name || 'Desconhecido';

  return (
    <Dialog>
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
                        <TableHead>Nome</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Função</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell><Badge variant="secondary" className="capitalize">{user.role}</Badge></TableCell>
                          <TableCell className="text-right">
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => setSelectedUser(user)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
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
                      <Button><PlusCircle className="mr-2 h-4 w-4" />Novo Período</Button>
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
                          <TableCell>{period.startDate.toLocaleDateString()}</TableCell>
                          <TableCell>{period.endDate.toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge variant={period.status === 'Ativo' ? 'default' : 'outline'}>{period.status}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                             <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
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
      <UserFormModal user={selectedUser} />
    </Dialog>
  );
}
