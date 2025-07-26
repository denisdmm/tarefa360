
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
  // User 1: Carlos Silva
  { 
    id: 'act-1', 
    userId: 'user-appraisee-1', 
    title: 'Implementar CI/CD para o novo microsserviço', 
    description: 'Configurar pipeline de integração e entrega contínua no GitLab.', 
    startDate: new Date(2024, 8, 10), // Sep 10, 2024
    progressHistory: [
        { year: 2024, month: 9, percentage: 30, comment: "Análise de requisitos do pipeline." },
        { year: 2024, month: 10, percentage: 70, comment: "Scripts de build e teste implementados." },
        { year: 2025, month: 1, percentage: 90, comment: "Ambiente de staging configurado." },
        { year: 2025, month: 3, percentage: 100, comment: "Pipeline em produção e monitorado." },
    ] 
  },
  { 
    id: 'act-2', 
    userId: 'user-appraisee-1', 
    title: 'Otimização de Consultas do Banco de Dados', 
    description: 'Analisar e otimizar as consultas mais lentas da aplicação principal.', 
    startDate: new Date(2025, 0, 15), // Jan 15, 2025
    progressHistory: [
        { year: 2025, month: 1, percentage: 20, comment: "Relatório de performance gerado." },
        { year: 2025, month: 2, percentage: 60, comment: "Índices aplicados e primeiras otimizações." },
        { year: 2025, month: 4, percentage: 80, comment: "Refatoração das queries mais críticas." },
    ] 
  },
  {
    id: 'act-from-previous-period',
    userId: 'user-appraisee-1',
    title: 'Migração do Legado de Faturamento',
    description: 'Migrar o sistema antigo de faturamento para a nova plataforma.',
    startDate: new Date(2024, 5, 1), // Started in June 2024 (previous period)
    progressHistory: [
      { year: 2024, month: 6, percentage: 10, comment: "Mapeamento inicial do sistema legado." },
      { year: 2024, month: 8, percentage: 25, comment: "Prova de conceito da migração de dados." },
      // Progress within the new period
      { year: 2024, month: 11, percentage: 40, comment: "Desenvolvimento dos scripts de migração." },
      { year: 2025, month: 2, percentage: 55, comment: "Primeiro lote de dados migrado para ambiente de teste." },
    ]
  },

  // User 2: Juliana Costa
  { 
    id: 'act-4', 
    userId: 'user-appraisee-2', 
    title: 'Redesenho do Fluxo de Onboarding de Clientes', 
    description: 'Criar uma experiência de onboarding mais intuitiva e amigável.', 
    startDate: new Date(2024, 9, 5), // Oct 5, 2024
    progressHistory: [
        { year: 2024, month: 10, percentage: 40, comment: "Pesquisa com usuários e definição de personas." },
        { year: 2024, month: 12, percentage: 80, comment: "Wireframes e protótipo de baixa fidelidade aprovados." },
        { year: 2025, month: 2, percentage: 100, comment: "Protótipo de alta fidelidade entregue para desenvolvimento." },
    ] 
  },
  { 
    id: 'act-5', 
    userId: 'user-appraisee-2', 
    title: 'Criação do Design System v2', 
    description: 'Documentar e criar componentes reutilizáveis para a nova identidade visual.', 
    startDate: new Date(2025, 3, 1), // Apr 1, 2025
    progressHistory: [
      { year: 2025, month: 4, percentage: 25, comment: "Definição da paleta de cores e tipografia." },
      { year: 2025, month: 5, percentage: 50, comment: "Criação dos componentes base (botões, inputs)." },
      { year: 2025, month: 7, percentage: 75, comment: "Componentes complexos (modais, tabelas) em andamento." },
    ]
  },

  // User 3: Fernando Martins
  { 
    id: 'act-6', 
    userId: 'user-appraisee-3', 
    title: 'Implementar Testes de Carga na API', 
    description: 'Utilizar k6 para simular alta carga e identificar gargalos na API de pedidos.', 
    startDate: new Date(2024, 10, 20), // Nov 20, 2024
    progressHistory: [
       { year: 2024, month: 11, percentage: 50, comment: "Ambiente e scripts de teste configurados." },
       { year: 2025, month: 1, percentage: 100, comment: "Testes executados, relatório de gargalos entregue." },
    ] 
  },
  // Activity for the appraiser, so they can see their own reports
  {
    id: 'act-7',
    userId: 'user-appraiser-1',
    title: 'Revisão de Metas de Vendas 2025',
    description: 'Analisar resultados de 2024 e definir metas para a equipe de vendas para 2025.',
    startDate: new Date(2024, 11, 5), // Dec 5, 2024
    progressHistory: [
      { year: 2024, month: 12, percentage: 50, comment: "Análise dos dados históricos concluída." },
      { year: 2025, month: 1, percentage: 90, comment: "Proposta de metas apresentada à diretoria." }
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
