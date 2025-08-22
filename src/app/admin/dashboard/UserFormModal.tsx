
"use client";

import * as React from "react";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { User, Role } from "@/lib/types";

export interface UserFormData {
  mode: 'create' | 'edit';
  user?: User | null;
  data: Partial<Omit<User, 'id' | 'avatarUrl'>>;
  appraiserId?: string | null;
}

interface UserFormModalProps {
  mode: 'create' | 'edit';
  user: User | null;
  users: User[];
  appraisers: User[];
  onSave: (formData: UserFormData) => Promise<void>;
  onClose: () => void;
  onOpenNewAppraiserModal: () => void;
  newlyCreatedAppraiserId?: string;
}

export const UserFormModal = ({ mode, user, users, appraisers, onSave, onClose, onOpenNewAppraiserModal, newlyCreatedAppraiserId }: UserFormModalProps) => {
  const [cpf, setCpf] = React.useState('');
  const [name, setName] = React.useState('');
  const [nomeDeGuerra, setNomeDeGuerra] = React.useState('');
  const [postoGrad, setPostoGrad] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [sector, setSector] = React.useState('');
  const [jobTitle, setJobTitle] = React.useState('');
  const [role, setRole] = React.useState<Role>('appraisee');
  const [status, setStatus] = React.useState<'Ativo' | 'Inativo'>('Ativo');
  const [selectedAppraiser, setSelectedAppraiser] = React.useState<string>('');

  const { toast } = useToast();

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const onlyNumbers = e.target.value.replace(/[^0-9]/g, '');
    setCpf(onlyNumbers);
  };
  
  const resetForm = React.useCallback(() => {
    setName('');
    setNomeDeGuerra('');
    setPostoGrad('');
    setEmail('');
    setCpf('');
    setSector('');
    setJobTitle('');
    setRole('appraisee');
    setStatus('Ativo');
    setSelectedAppraiser('');
  }, []);

  React.useEffect(() => {
    if (mode === 'edit' && user) {
        setName(user.name || '');
        setNomeDeGuerra(user.nomeDeGuerra || '');
        setPostoGrad(user.postoGrad || '');
        setEmail(user.email || '');
        setCpf(user.cpf || '');
        setSector(user.sector || '');
        setJobTitle(user.jobTitle || '');
        setRole(user.role || 'appraisee');
        setStatus(user.status || 'Inativo');
    } else {
        resetForm();
    }
  }, [user, mode, resetForm]);
  
  React.useEffect(() => {
    if(newlyCreatedAppraiserId) {
        setSelectedAppraiser(newlyCreatedAppraiserId);
    }
  }, [newlyCreatedAppraiserId]);

  const handleAppraiserChange = (value: string) => {
    if (value === 'new-appraiser') {
      onOpenNewAppraiserModal();
    } else {
      setSelectedAppraiser(value);
    }
  }

  const handleSave = async () => {
    // --- Validation ---
    if (!name || !nomeDeGuerra || !postoGrad || !email || !sector || !jobTitle) {
        toast({
            variant: "destructive",
            title: "Campos Obrigatórios",
            description: "Por favor, preencha todos os campos para criar ou editar o usuário.",
        });
        return;
    }
    
    if (cpf && cpf.length !== 11) {
        toast({
            variant: "destructive",
            title: "Erro de Validação",
            description: "Se preenchido, o CPF deve conter 11 dígitos.",
        });
        return;
    }

    if(cpf) {
        const isCpfTaken = users.some(u => u.cpf === cpf && u.id !== user?.id);
        if (isCpfTaken) {
            toast({
                variant: "destructive",
                title: "CPF Duplicado",
                description: "Este CPF já está sendo utilizado por outro usuário.",
            });
            return;
        }
    }


    if (role === 'appraisee' && mode === 'create' && !selectedAppraiser) {
       toast({
            variant: "destructive",
            title: "Avaliador Necessário",
            description: "É necessário selecionar um avaliador responsável para criar um usuário com perfil 'Avaliado'.",
        });
        return;
    }

    const finalStatus = cpf ? 'Ativo' : 'Inativo';
    const finalCpf = cpf || (mode === 'create' ? "99999999999" : "");
    
    let formData: UserFormData;

    if (mode === 'create') {
        const newPassword = finalCpf ? `${finalCpf.substring(0, 4)}${nomeDeGuerra}` : nomeDeGuerra;
        formData = {
            mode,
            user: null,
            data: {
                cpf: finalCpf,
                name,
                nomeDeGuerra,
                postoGrad,
                email,
                sector,
                jobTitle,
                role,
                status: finalCpf ? 'Ativo' : 'Inativo',
                password: newPassword,
                forcePasswordChange: true
            },
            appraiserId: role === 'appraisee' ? selectedAppraiser : null,
        }
    } else {
         formData = {
            mode,
            user,
            data: {
                cpf: finalCpf,
                name,
                nomeDeGuerra,
                postoGrad,
                email,
                sector,
                jobTitle,
                role,
                status: finalCpf ? 'Ativo' : 'Inativo',
            },
            appraiserId: role === 'appraisee' ? selectedAppraiser : null,
        };
    }
    
    await onSave(formData);
    if (mode === 'create') {
        resetForm();
    }
  };
  
  const title = mode === 'edit' ? 'Editar Usuário' : 'Criar Nova Conta';
  const description = mode === 'edit' 
    ? 'Atualize os dados do usuário. Para ativar uma conta inativa, basta preencher o CPF.' 
    : 'Preencha os dados para uma nova conta de usuário. Deixar o CPF em branco criará uma conta inativa com um CPF padrão.';

  return (
    <DialogContent className="sm:max-w-[625px]">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
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
        <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
          <Label htmlFor="role" className="md:text-right">
            Perfil
          </Label>
          <Select value={role} onValueChange={value => setRole(value as Role)}>
            <SelectTrigger className="col-span-1 md:col-span-3">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Administrador</SelectItem>
              <SelectItem value="appraiser">Avaliador</SelectItem>
              <SelectItem value="appraisee">Avaliado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {mode === 'create' && role === 'appraisee' && (
          <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
            <Label htmlFor="appraiser" className="md:text-right">
              Avaliador Responsável
            </Label>
            <Select value={selectedAppraiser} onValueChange={handleAppraiserChange}>
                <SelectTrigger className="col-span-1 md:col-span-3">
                <SelectValue placeholder="Selecione o avaliador" />
                </SelectTrigger>
                <SelectContent>
                  {appraisers.map(appraiser => (
                    <SelectItem key={appraiser.id} value={appraiser.id}>{appraiser.postoGrad} {appraiser.nomeDeGuerra}</SelectItem>
                  ))}
                   <SelectItem value="new-appraiser" className="text-primary focus:text-primary-foreground focus:bg-primary">
                    Cadastrar Novo Avaliador...
                  </SelectItem>
                </SelectContent>
            </Select>
          </div>
        )}
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave}>Salvar</Button>
      </DialogFooter>
    </DialogContent>
  );
};
