
import type { User, Activity, EvaluationPeriod, Association } from './types';

export const users: User[] = [
  { id: 'user-admin-1', name: 'Usuário Admin', nomeDeGuerra: 'Admin', email: 'admin@tarefa360.com', role: 'admin', jobTitle: 'Administrador do Sistema', sector: 'TI', avatarUrl: 'https://placehold.co/100x100', cpf: '00000000000', postoGrad: 'Cel', status: 'Ativo', password: '00000000000', forcePasswordChange: true },
  { id: 'user-appraiser-1', name: 'Ana Pereira', nomeDeGuerra: 'Ana', email: 'ana.p@tarefa360.com', role: 'appraiser', jobTitle: 'Gerente Sênior', sector: 'Vendas', avatarUrl: 'https://placehold.co/100x100', cpf: '11111111111', postoGrad: 'Maj', status: 'Ativo', password: '11111111111', forcePasswordChange: true },
  { id: 'user-appraisee-1', name: 'Carlos Silva', nomeDeGuerra: 'Carlos', email: 'carlos.s@tarefa360.com', role: 'appraisee', jobTitle: 'Engenheiro de Software', sector: 'Engenharia', avatarUrl: 'https://placehold.co/100x100', cpf: '22222222222', postoGrad: 'Cap', status: 'Ativo', password: '22222222222', forcePasswordChange: true },
];

export const activities: Activity[] = [
  
];

export const evaluationPeriods: EvaluationPeriod[] = [
    // This will be populated dynamically by the DataContext
];

export const associations: Association[] = [
    { id: 'assoc-1', appraiseeId: 'user-appraisee-1', appraiserId: 'user-appraiser-1'},
];
