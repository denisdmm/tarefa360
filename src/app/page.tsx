
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/logo";
import type { Role } from "@/lib/types";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const [role, setRole] = React.useState<Role | "">("");
  const [cpf, setCpf] = React.useState("");
  const router = useRouter();

  const handleLogin = () => {
    if (role) {
      // Here you would typically validate the CPF against the selected role
      router.push(`/${role}/dashboard`);
    }
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const onlyNumbers = e.target.value.replace(/[^0-9]/g, '');
    setCpf(onlyNumbers);
  };

  const isLoginDisabled = !role || (role !== 'admin' && cpf.length !== 11);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Logo className="h-8 w-8" />
          </div>
          <CardTitle className="font-headline text-3xl">Acompanhante Tarefa360</CardTitle>
          <CardDescription>
            Faça login para continuar para o seu painel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
             <div className="space-y-2">
              <Label htmlFor="role">Selecione sua Função</Label>
              <Select onValueChange={(value: Role) => setRole(value)} value={role}>
                <SelectTrigger id="role" className="w-full">
                  <SelectValue placeholder="Escolha uma função..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="appraiser">Avaliador</SelectItem>
                  <SelectItem value="appraisee">Avaliado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {role && role !== 'admin' && (
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF</Label>
                <Input 
                  id="cpf" 
                  placeholder="Digite seu CPF (apenas números)" 
                  value={cpf}
                  onChange={handleCpfChange}
                  maxLength={11}
                />
              </div>
            )}
            
            <Button onClick={handleLogin} disabled={isLoginDisabled} className="w-full">
              Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
