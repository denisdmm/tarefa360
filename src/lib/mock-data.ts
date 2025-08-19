
import type { User, Activity, EvaluationPeriod, Association } from './types';

// This file is now a backup and can be used to seed the database.
// The application now fetches data from Firestore.

export const users: User[] = [
  { id: 'user-admin-1', name: 'Usuário Admin', nomeDeGuerra: 'Admin', email: 'admin@tarefa360.com', role: 'admin', jobTitle: 'Administrador do Sistema', sector: 'TI', avatarUrl: 'https://placehold.co/100x100', cpf: '00000000000', postoGrad: 'Cel', status: 'Ativo', password: 'admin', forcePasswordChange: false },
  { id: 'user-appraiser-1', name: 'Ana Pereira', nomeDeGuerra: 'Ana', email: 'ana.p@tarefa360.com', role: 'appraiser', jobTitle: 'Gerente Sênior', sector: 'Vendas', avatarUrl: 'https://placehold.co/100x100', cpf: '11111111111', postoGrad: 'Maj', status: 'Ativo', password: '1111', forcePasswordChange: true },
  { id: 'user-appraiser-2', name: 'Roberto Costa', nomeDeGuerra: 'Roberto', email: 'roberto.c@tarefa360.com', role: 'appraiser', jobTitle: 'Coordenador', sector: 'Operações', avatarUrl: 'https://placehold.co/100x100', cpf: '22222222222', postoGrad: 'Ten Cel', status: 'Ativo', password: '2222', forcePasswordChange: true },
  { id: 'user-appraisee-1', name: 'Carlos Silva', nomeDeGuerra: 'Carlos', email: 'carlos.s@tarefa360.com', role: 'appraisee', jobTitle: 'Engenheiro de Software', sector: 'Engenharia', avatarUrl: 'https://placehold.co/100x100', cpf: '33333333333', postoGrad: 'Cap', status: 'Ativo', password: '3333', forcePasswordChange: true },
];

export const activities: Activity[] = [
  
];

export const evaluationPeriods: EvaluationPeriod[] = [
    // This will be populated dynamically by the DataContext
];

export const associations: Association[] = [
    { id: 'assoc-1', appraiseeId: 'user-appraisee-1', appraiserId: 'user-appraiser-1'},
];
