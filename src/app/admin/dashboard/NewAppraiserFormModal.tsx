
"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@/lib/types";

interface NewAppraiserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newUser: User) => Promise<void>;
  existingUsers: User[];
}

export const NewAppraiserFormModal = ({ isOpen, onClose, onSave, existingUsers }: NewAppraiserFormModalProps) => {
  const [cpf, setCpf] = React.useState('');
  const [name, setName] = React.useState('');
  const [nomeDeGuerra, setNomeDeGuerra] = React.useState('');
  const [postoGrad, setPostoGrad] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [sector, setSector] = React.useState('');
  const [jobTitle, setJobTitle] = React.useState('');

  const { toast } = useToast();

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const onlyNumbers = e.target.value.replace(/[^0-9]/g, '');
    setCpf(onlyNumbers);
  };

  const resetForm = () => {
    setName('');
    setNomeDeGuerra('');
    setPostoGrad('');
    setEmail('');
    setCpf('');
    setSector('');
    setJobTitle('');
  };

  const handleSave = async () => {
    // --- Validation ---
    if (!name || !nomeDeGuerra) {
        toast({
            variant: "destructive",
            title: "Campos Obrigatórios",
            description: "Por favor, preencha pelo menos o Nome Completo e o Nome de Guerra.",
        });
        return;
    }
    
    const finalCpf = cpf || "99999999999";

    if (finalCpf.length !== 11) {
        toast({
            variant: "destructive",
            title: "Erro de Validação",
            description: "O CPF deve conter 11 dígitos.",
        });
        return;
    }

    const isCpfTaken = existingUsers.some(u => u.cpf === finalCpf);
    if (isCpfTaken) {
        toast({
            variant: "destructive",
            title: "CPF Duplicado",
            description: "Este CPF já está sendo utilizado por outro usuário.",
        });
        return;
    }

    const newPassword = `${finalCpf.substring(0, 4)}${nomeDeGuerra}`;
    const newUser: User = {
        id: `user-${Date.now()}`,
        cpf: finalCpf,
        name,
        nomeDeGuerra,
        postoGrad,
        email,
        sector,
        jobTitle,
        role: 'appraiser',
        password: newPassword, 
        forcePasswordChange: true,
        status: 'Ativo',
        avatarUrl: 'https://placehold.co/100x100' // Default avatar
    };
    
    await onSave(newUser);
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
            <DialogTitle>Cadastrar Novo Avaliador</DialogTitle>
            <DialogDescription>Preencha os dados do novo avaliador. Se o CPF não for informado, a conta será criada com o CPF padrão '99999999999'.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="md:text-right">
                Nome Completo
            </Label>
            <Input id="name" value={name} onChange={e => setName(e.target.value)} className="col-span-1 md:col-span-3" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
            <Label htmlFor="nomeDeGuerra" className="md:text-right">
                Nome de Guerra
            </Label>
            <Input id="nomeDeGuerra" value={nomeDeGuerra} onChange={e => setNomeDeGuerra(e.target.value)} className="col-span-1 md:col-span-3" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                <Label htmlFor="postoGrad" className="md:text-right">
                    Posto/Grad.
                </Label>
                <Input id="postoGrad" value={postoGrad} onChange={e => setPostoGrad(e.target.value)} className="col-span-1 md:col-span-3" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
            <Label htmlFor="cpf" className="md:text-right">
                CPF (Login)
            </Label>
            <Input id="cpf" value={cpf} onChange={handleCpfChange} className="col-span-1 md:col-span-3" placeholder="Opcional: Apenas números" maxLength={11} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="md:text-right">
                Email
            </Label>
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="col-span-1 md:col-span-3" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
            <Label htmlFor="sector" className="md:text-right">
                Sigla do Setor
            </Label>
            <Input id="sector" value={sector} onChange={e => setSector(e.target.value)} className="col-span-1 md:col-span-3" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
            <Label htmlFor="jobTitle" className="md:text-right">
                Função
            </Label>
            <Input id="jobTitle" value={jobTitle} onChange={e => setJobTitle(e.target.value)} className="col-span-1 md:col-span-3" />
            </div>
        </div>
        <DialogFooter>
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button onClick={handleSave}>Salvar Avaliador</Button>
        </DialogFooter>
        </DialogContent>
    </Dialog>
  );
};
