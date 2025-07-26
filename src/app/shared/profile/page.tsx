
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { useRouter } from "next/navigation";


export default function ProfilePage({ loggedInUserId }: { loggedInUserId: string }) {
  const { users, setUsers } = useDataContext();
  const { toast } = useToast();
  const router = useRouter();
  
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  const [name, setName] = React.useState('');
  const [nomeDeGuerra, setNomeDeGuerra] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');

  React.useEffect(() => {
    const user = users.find(u => u.id === loggedInUserId);
    if (user) {
      setCurrentUser(user);
      setName(user.name);
      setNomeDeGuerra(user.nomeDeGuerra);
      setEmail(user.email);
      setAvatarPreview(user.avatarUrl); // Initialize preview with current avatar
    }
  }, [loggedInUserId, users]);

  const translateRole = (role: User['role']) => {
    const roles: Record<User['role'], string> = {
      admin: 'Administrador',
      appraiser: 'Avaliador',
      appraisee: 'Avaliado',
    };
    return roles[role] || role;
  }

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'image/png' && file.type !== 'image/jpeg') {
        toast({
          variant: "destructive",
          title: "Formato Inválido",
          description: "Por favor, selecione um arquivo PNG ou JPG.",
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };


  const handleUpdateProfile = () => {
    if (!currentUser) return;
    
    const updatedUsers = users.map(u => 
      u.id === currentUser.id 
        ? { ...u, name, nomeDeGuerra, email, avatarUrl: avatarPreview || u.avatarUrl }
        : u
    );
    setUsers(updatedUsers);

    toast({
      title: "Perfil Atualizado",
      description: "Suas informações foram atualizadas com sucesso.",
    });
  };

  const handleUpdatePassword = () => {
    if (!currentUser) return;

    // Check if the current password matches (only if it's not the first login)
    if (!currentUser.forcePasswordChange && currentPassword !== currentUser.password) {
       toast({
        variant: "destructive",
        title: "Senha Atual Incorreta",
        description: "A senha atual informada não confere.",
      });
      return;
    }
    
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
    
    const updatedUsers = users.map(u => 
      u.id === currentUser.id 
        ? { ...u, password: newPassword, forcePasswordChange: false }
        : u
    );
    setUsers(updatedUsers);
    
    toast({
      title: "Senha Atualizada",
      description: "Sua senha foi alterada com sucesso. Agora você pode ir para o painel.",
    });
    
    // Clear password fields
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  if (!currentUser) {
    return <div className="p-6">Usuário não encontrado.</div>;
  }
  
  const handleGoToDashboard = () => {
    router.push(`/${currentUser.role}/dashboard`);
  }


  return (
    <div className="flex flex-col h-full">
      <header className="bg-card border-b p-2 md:p-4">
        <h1 className="text-3xl font-bold font-headline">Meu Perfil</h1>
        <p className="text-muted-foreground">
          Gerencie suas informações pessoais e de acesso.
        </p>
      </header>
      <main className="flex-1 p-2 md:p-6 overflow-auto space-y-6">
        {currentUser.forcePasswordChange && (
            <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Ação Necessária: Altere sua Senha</AlertTitle>
                <AlertDescription>
                    Este é seu primeiro acesso. Por favor, cadastre uma nova senha abaixo para continuar. Sua senha atual é o seu CPF.
                </AlertDescription>
            </Alert>
        )}

        {!currentUser.forcePasswordChange && (
             <div className="flex justify-end">
                <Button onClick={handleGoToDashboard}>Ir para o Painel</Button>
            </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
            <CardDescription>
              Atualize seus dados cadastrais. O CPF não pode ser alterado.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center md:flex-row md:items-start gap-6 mb-6">
                <div className="flex flex-col items-center gap-4">
                    <Avatar className="h-24 w-24">
                        <AvatarImage src={avatarPreview || undefined} alt={currentUser.name} />
                        <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()}>Alterar Avatar</Button>
                    <Input 
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept="image/png, image/jpeg"
                        onChange={handleAvatarChange}
                    />
                     <p className="text-xs text-muted-foreground text-center">
                        PNG, JPG (200x200px)
                    </p>
                </div>
                <div className="w-full space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="cpf">CPF (Login)</Label>
                          <Input id="cpf" value={currentUser.cpf} disabled />
                        </div>
                         <div className="space-y-2">
                          <Label htmlFor="role">Perfil de Acesso</Label>
                          <Input id="role" value={translateRole(currentUser.role)} disabled  />
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="postoGrad">Posto/Grad.</Label>
                            <Input id="postoGrad" value={currentUser.postoGrad} disabled />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="nomeDeGuerra">Nome de Guerra</Label>
                            <Input id="nomeDeGuerra" value={nomeDeGuerra} onChange={(e) => setNomeDeGuerra(e.target.value)} />
                        </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome Completo</Label>
                      <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                </div>
            </div>
             <div className="flex justify-end pt-2 border-t">
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
                placeholder={currentUser.forcePasswordChange ? "Digite seu CPF" : "Digite sua senha atual"}
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
