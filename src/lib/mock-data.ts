
import type { User, Activity, EvaluationPeriod, Association } from './types';

export const users: User[] = [
  { id: 'user-admin-1', name: 'Usuário Admin', socialName: 'Admin', email: 'admin@tarefa360.com', role: 'admin', jobTitle: 'Administrador do Sistema', sector: 'TI', avatarUrl: 'https://placehold.co/100x100', cpf: '00000000000' },
  { id: 'user-appraiser-1', name: 'Ana Pereira', socialName: 'Ana', email: 'ana.p@tarefa360.com', role: 'appraiser', jobTitle: 'Gerente Sênior', sector: 'Vendas', avatarUrl: 'https://placehold.co/100x100', cpf: '11111111111' },
  { id: 'user-appraiser-2', name: 'Roberto Lima', socialName: 'Roberto', email: 'roberto.l@tarefa360.com', role: 'appraiser', jobTitle: 'Líder de Projeto', sector: 'Engenharia', avatarUrl: 'https://placehold.co/100x100', cpf: '22222222222' },
  { id: 'user-appraisee-1', name: 'Carlos Silva', socialName: 'Carlos', email: 'carlos.s@tarefa360.com', role: 'appraisee', jobTitle: 'Engenheiro de Software', sector: 'Engenharia', avatarUrl: 'https://placehold.co/100x100', cpf: '33333333333' },
  { id: 'user-appraisee-2', name: 'Juliana Costa', socialName: 'Ju', email: 'juliana.c@tarefa360.com', role: 'appraisee', jobTitle: 'Designer UX/UI', sector: 'Produto', avatarUrl: 'https://placehold.co/100x100', cpf: '44444444444' },
  { id: 'user-appraisee-3', name: 'Fernando Martins', socialName: 'Fernando', email: 'fernando.m@tarefa360.com', role: 'appraisee', jobTitle: 'Analista de QA', sector: 'Engenharia', avatarUrl: 'https://placehold.co/100x100', cpf: '55555555555' },
];

export const activities: Activity[] = [
  { 
    id: 'act-1', 
    userId: 'user-appraisee-1', 
    title: 'Desenvolver novo módulo de autenticação', 
    description: 'Implementar autenticação baseada em JWT para a API principal.', 
    startDate: new Date(2023, 10, 15), // Nov 2023
    progressHistory: [
        { year: 2023, month: 11, percentage: 50, comment: "Iniciado." },
        { year: 2023, month: 12, percentage: 100, comment: "Finalizado e entregue." },
    ] 
  },
  { 
    id: 'act-2', 
    userId: 'user-appraisee-1', 
    title: 'Refatorar esquema do banco de dados', 
    description: 'Otimizar tabelas para performance e adicionar novos índices.', 
    startDate: new Date(2024, 1, 1), 
    progressHistory: [
        { year: 2024, month: 2, percentage: 30, comment: "Análise inicial concluída." },
        { year: 2024, month: 3, percentage: 75, comment: "Scripts de migração desenvolvidos." },
    ] 
  },
  { 
    id: 'act-3', 
    userId: 'user-appraisee-1', 
    title: 'Escrever documentação da API', 
    description: 'Usar Swagger/OpenAPI para documentar todos os endpoints.', 
    startDate: new Date(2024, 2, 1), 
    progressHistory: [
        { year: 2024, month: 3, percentage: 40, comment: "Endpoints de autenticação documentados." },
    ] 
  },
  { 
    id: 'act-4', 
    userId: 'user-appraisee-2', 
    title: 'Projetar nova interface do painel', 
    description: 'Criar wireframes e mockups para o painel v2.', 
    startDate: new Date(2023, 11, 10), // Dec 2023
    progressHistory: [
        { year: 2023, month: 12, percentage: 50, comment: "Pesquisa inicial." },
        { year: 2024, month: 1, percentage: 100, comment: "Wireframes aprovados e mockups entregues." },
    ] 
  },
  { 
    id: 'act-5', 
    userId: 'user-appraisee-2', 
    title: 'Conduzir sessões de pesquisa com usuários', 
    description: 'Coletar feedback sobre o produto atual de usuários chave.', 
    startDate: new Date(2024, 1, 5), 
    progressHistory: [
      { year: 2024, month: 2, percentage: 90, comment: "Sessões realizadas, aguardando análise final dos dados." },
    ]
  },
  { 
    id: 'act-6', 
    userId: 'user-appraisee-3', 
    title: 'Criar suíte de testes automatizados para pagamentos', 
    description: 'Usar Selenium para construir testes E2E para o fluxo de pagamento.', 
    startDate: new Date(2024, 2, 1),
    progressHistory: [
       { year: 2024, month: 3, percentage: 60, comment: "Estrutura do projeto de teste montada e primeiros cenários criados." },
    ] 
  },
  // Activity for the appraiser, so they can see their own reports
  {
    id: 'act-7',
    userId: 'user-appraiser-1',
    title: 'Planejamento Estratégico Q3',
    description: 'Definir metas e KPIs para o terceiro trimestre.',
    startDate: new Date(2024, 4, 20), // May 2024
    progressHistory: [
      { year: 2024, month: 5, percentage: 50, comment: "Coleta de dados iniciada." }
    ]
  }
];

export const evaluationPeriods: EvaluationPeriod[] = [
    // This will be populated dynamically by the DataContext
];

export const associations: Association[] = [
    { id: 'assoc-1', appraiseeId: 'user-appraisee-1', appraiserId: 'user-appraiser-2'}, // Carlos is evaluated by Roberto
    { id: 'assoc-2', appraiseeId: 'user-appraisee-2', appraiserId: 'user-appraiser-1'}, // Juliana is evaluated by Ana
    { id: 'assoc-3', appraiseeId: 'user-appraisee-3', appraiserId: 'user-appraiser-2'}, // Fernando is evaluated by Roberto
    { id: 'assoc-4', appraiseeId: 'user-appraiser-1', appraiserId: 'user-admin-1'},    // Ana is evaluated by Admin
    { id: 'assoc-5', appraiseeId: 'user-appraiser-2', appraiserId: 'user-admin-1'},    // Roberto is evaluated by Admin
];
