
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import * as bcrypt from 'bcryptjs';
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
import type { User } from "@/lib/types";
import { collection, getDocs, query, where, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Eye, EyeOff } from "lucide-react";


export default function LoginPage() {
  const [cpf, setCpf] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { setLoggedInUser, ensureCurrentEvaluationPeriodExists } = useDataContext();

  const handleLogin = async () => {
    try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('cpf', '==', cpf));
        const userSnapshot = await getDocs(q);

        if (userSnapshot.empty) {
            toast({
                variant: "destructive",
                title: "Falha no Login",
                description: "CPF ou senha inválidos. Verifique os dados e tente novamente.",
            });
            return;
        }
        
        const userDoc = userSnapshot.docs[0];
        const userData = userDoc.data();
        
        // Firestore Timestamps need to be converted to Date objects
        const convertTimestamps = (data: any) => {
            const newData: { [key: string]: any } = { ...data };
            for (const key in newData) {
                if (newData[key] instanceof Timestamp) {
                    newData[key] = newData[key].toDate();
                }
            }
            return newData;
        };

        const user = { 
            id: userDoc.id, 
            ...convertTimestamps(userData) 
        } as User;
        
        const passwordMatches = user.password ? await bcrypt.compare(password, user.password) : false;

        if (user && passwordMatches) {
            setLoggedInUser(user);
            await ensureCurrentEvaluationPeriodExists();

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
    } catch (error) {
        console.error("Login error:", error);
        toast({
            variant: "destructive",
            title: "Erro Inesperado",
            description: "Ocorreu um erro durante o login. Tente novamente.",
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
             <div className="space-y-2 relative">
              <Label htmlFor="password">Senha</Label>
              <Input 
                id="password" 
                type={showPassword ? "text" : "password"}
                placeholder="Digite sua senha" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pr-10"
              />
               <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-7 h-7 w-7 text-muted-foreground hover:bg-transparent"
                  onClick={() => setShowPassword(prev => !prev)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  <span className="sr-only">{showPassword ? 'Ocultar senha' : 'Mostrar senha'}</span>
                </Button>
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

    
