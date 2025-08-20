
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/logo";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useDataContext } from "@/context/DataContext";
import type { EvaluationPeriod } from "@/lib/types";
import { collection, getDocs, writeBatch, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";


export default function LoginPage() {
  const [cpf, setCpf] = React.useState("");
  const [password, setPassword] = React.useState("");
  const router = useRouter();
  const { toast } = useToast();
  const { users, setLoggedInUser, fetchData } = useDataContext();


  const handleLogin = () => {
    const user = users.find((u) => u.cpf === cpf);

    if (user && user.password === password) {
      setLoggedInUser(user);
      
      if (user.forcePasswordChange) {
        toast({
          variant: "destructive",
          title: "Alteração de Senha Obrigatória",
          description: "Este é seu primeiro login. Por favor, altere sua senha.",
        });
        router.push(`/${user.role}/profile`);
      } else {
        router.push(`/${user.role}/dashboard`);
      }
    } else {
      toast({
        variant: "destructive",
        title: "Falha no Login",
        description: "CPF ou senha inválidos. Verifique os dados e tente novamente.",
      });
    }
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const onlyNumbers = e.target.value.replace(/[^0-9]/g, '');
    setCpf(onlyNumbers);
  };

  const isLoginDisabled = cpf.length !== 11 || password.length === 0;
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoginDisabled) {
      handleLogin();
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Logo className="h-8 w-8" />
          </div>
          <CardTitle className="font-headline text-3xl">Tarefa360</CardTitle>
          <CardDescription>
            Faça login com seu CPF e senha para continuar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input 
                id="cpf" 
                placeholder="Digite seu CPF (apenas números)" 
                value={cpf}
                onChange={handleCpfChange}
                maxLength={11}
                onKeyDown={handleKeyDown}
              />
            </div>
             <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input 
                id="password" 
                type="password"
                placeholder="Digite sua senha" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            
            <Button onClick={handleLogin} disabled={isLoginDisabled} className="w-full">
              Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
