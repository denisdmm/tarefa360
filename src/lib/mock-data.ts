
import type { User, Activity, EvaluationPeriod, Association } from './types';

export const users: User[] = [
  { id: 'user-admin-1', name: 'Usuário Admin', socialName: 'Admin', email: 'admin@tarefa360.com', role: 'admin', jobTitle: 'Administrador do Sistema', sector: 'TI', avatarUrl: 'https://placehold.co/100x100', cpf: '00000000000' },
  { id: 'user-appraiser-1', name: 'Ana Pereira', socialName: 'Ana', email: 'ana.p@tarefa360.com', role: 'appraiser', jobTitle: 'Gerente Sênior', sector: 'Vendas', avatarUrl: 'https://placehold.co/100x100', appraiseeIds: ['user-appraisee-1', 'user-appraisee-2'], cpf: '11111111111' },
  { id: 'user-appraiser-2', name: 'Roberto Lima', socialName: 'Roberto', email: 'roberto.l@tarefa360.com', role: 'appraiser', jobTitle: 'Líder de Projeto', sector: 'Engenharia', avatarUrl: 'https://placehold.co/100x100', appraiseeIds: ['user-appraisee-3'], cpf: '22222222222' },
  { id: 'user-appraisee-1', name: 'Carlos Silva', socialName: 'Carlos', email: 'carlos.s@tarefa360.com', role: 'appraisee', jobTitle: 'Engenheiro de Software', sector: 'Engenharia', avatarUrl: 'https://placehold.co/100x100', appraiserId: 'user-appraiser-1', cpf: '33333333333' },
  { id: 'user-appraisee-2', name: 'Juliana Costa', socialName: 'Ju', email: 'juliana.c@tarefa360.com', role: 'appraisee', jobTitle: 'Designer UX/UI', sector: 'Produto', avatarUrl: 'https://placehold.co/100x100', appraiserId: 'user-appraiser-1', cpf: '44444444444' },
  { id: 'user-appraisee-3', name: 'Fernando Martins', socialName: 'Fernando', email: 'fernando.m@tarefa360.com', role: 'appraisee', jobTitle: 'Analista de QA', sector: 'Engenharia', avatarUrl: 'https://placehold.co/100x100', appraiserId: 'user-appraiser-2', cpf: '55555555555' },
];

export const activities: Activity[] = [
  { id: 'act-1', userId: 'user-appraisee-1', title: 'Desenvolver novo módulo de autenticação', description: 'Implementar autenticação baseada em JWT para a API principal.', month: 'Janeiro', completionPercentage: 100 },
  { id: 'act-2', userId: 'user-appraisee-1', title: 'Refatorar esquema do banco de dados', description: 'Otimizar tabelas para performance e adicionar novos índices.', month: 'Fevereiro', completionPercentage: 75 },
  { id: 'act-3', userId: 'user-appraisee-1', title: 'Escrever documentação da API', description: 'Usar Swagger/OpenAPI para documentar todos os endpoints.', month: 'Março', completionPercentage: 40 },
  { id: 'act-4', userId: 'user-appraisee-2', title: 'Projetar nova interface do painel', description: 'Criar wireframes e mockups para o painel v2.', month: 'Janeiro', completionPercentage: 100 },
  { id: 'act-5', userId: 'user-appraisee-2', title: 'Conduzir sessões de pesquisa com usuários', description: 'Coletar feedback sobre o produto atual de usuários chave.', month: 'Fevereiro', completionPercentage: 90 },
  { id: 'act-6', userId: 'user-appraisee-3', title: 'Criar suíte de testes automatizados para pagamentos', description: 'Usar Selenium para construir testes E2E para o fluxo de pagamento.', month: 'Março', completionPercentage: 60 },
];

export const evaluationPeriods: EvaluationPeriod[] = [
    { id: 'period-1', name: 'Avaliação 2024', startDate: new Date('2024-01-01'), endDate: new Date('2024-11-30'), status: 'Ativo' },
    { id: 'period-2', name: 'Avaliação 2023', startDate: new Date('2023-01-01'), endDate: new Date('2023-11-30'), status: 'Inativo' },
];

export const associations: Association[] = [
    { id: 'assoc-1', appraiseeId: 'user-appraisee-1', appraiserId: 'user-appraiser-1'},
    { id: 'assoc-2', appraiseeId: 'user-appraisee-2', appraiserId: 'user-appraiser-1'},
    { id: 'assoc-3', appraiseeId: 'user-appraisee-3', appraiserId: 'user-appraiser-2'},
]
