
import type { User, Activity, EvaluationPeriod, Association } from './types';

export const users: User[] = [
  { id: 'user-admin-1', name: 'Usuário Admin', socialName: 'Admin', email: 'admin@tarefa360.com', role: 'admin', jobTitle: 'Administrador do Sistema', sector: 'TI', avatarUrl: 'https://placehold.co/100x100', cpf: '00000000000' },
  { id: 'user-appraiser-1', name: 'Ana Pereira', socialName: 'Ana', email: 'ana.p@tarefa360.com', role: 'appraiser', jobTitle: 'Gerente Sênior', sector: 'Vendas', avatarUrl: 'https://placehold.co/100x100', cpf: '11111111111' },
  { id: 'user-appraisee-1', name: 'Carlos Silva', socialName: 'Carlos', email: 'carlos.s@tarefa360.com', role: 'appraisee', jobTitle: 'Engenheiro de Software', sector: 'Engenharia', avatarUrl: 'https://placehold.co/100x100', cpf: '22222222222' },
];

export const activities: Activity[] = [
  
];

export const evaluationPeriods: EvaluationPeriod[] = [
    // This will be populated dynamically by the DataContext
];

export const associations: Association[] = [
    { id: 'assoc-1', appraiseeId: 'user-appraisee-1', appraiserId: 'user-appraiser-1'}, // Carlos is evaluated by Ana
];
