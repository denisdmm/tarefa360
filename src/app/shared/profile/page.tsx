
"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDataContext } from "@/context/DataContext";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@/lib/types";

export default function ProfilePage({ loggedInUserId }: { loggedInUserId: string }) {
  const { users, setUsers } = useDataContext();
  const { toast } = useToast();
  
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  const [name, setName] = React.useState('');
  const [socialName, setSocialName] = React.useState('');
  const [email, setEmail] = React.useState('');

  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');

  React.useEffect(() => {
    const user = users.find(u => u.id === loggedInUserId);
    if (user) {
      setCurrentUser(user);
      setName(user.name);
      setSocialName(user.socialName);
      setEmail(user.email);
    }
  }, [loggedInUserId, users]);

  const handleUpdateProfile = () => {
    if (!currentUser) return;
    
    const updatedUsers = users.map(u => 
      u.id === currentUser.id 
        ? { ...u, name, socialName, email }
        : u
    );
    setUsers(updatedUsers);

    toast({
      title: "Perfil Atualizado",
      description: "Suas informações foram atualizadas com sucesso.",
    });
  };

  const handleUpdatePassword = () => {
    if (!newPassword || newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Erro na Senha",
        description: "A nova senha e a confirmação não correspondem.",
      });
      return;
    }
    
    if (newPassword.length < 6) {
        toast({
            variant: "destructive",
            title: "Senha Muito Curta",
            description: "A nova senha deve ter pelo menos 6 caracteres.",
        });
        return;
    }

    // In a real app, you would make an API call here to securely update the password.
    // For this mock, we'll just show a success message.
    
    toast({
      title: "Senha Atualizada",
      description: "Sua senha foi alterada com sucesso.",
    });
    
    // Clear password fields
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  if (!currentUser) {
    return <div className="p-6">Usuário não encontrado.</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <header className="bg-card border-b p-4">
        <h1 className="text-3xl font-bold font-headline">Meu Perfil</h1>
        <p className="text-muted-foreground">
          Gerencie suas informações pessoais e de acesso.
        </p>
      </header>
      <main className="flex-1 p-4 md:p-6 overflow-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
            <CardDescription>
              Atualize seus dados cadastrais. O CPF não pode ser alterado.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF (Login)</Label>
                  <Input id="cpf" value={currentUser.cpf} disabled />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="role">Perfil de Acesso</Label>
                  <Input id="role" value={currentUser.role} disabled  />
                </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="socialName">Nome Social</Label>
              <Input id="socialName" value={socialName} onChange={(e) => setSocialName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
             <div className="flex justify-end pt-2">
                <Button onClick={handleUpdateProfile}>Salvar Alterações</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alterar Senha</CardTitle>
            <CardDescription>
              Para sua segurança, escolha uma senha forte.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Senha Atual</Label>
              <Input 
                id="current-password" 
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">Nova Senha</Label>
              <Input 
                id="new-password" 
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
               />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
              <Input 
                id="confirm-password" 
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <div className="flex justify-end pt-2">
                <Button onClick={handleUpdatePassword}>Alterar Senha</Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
