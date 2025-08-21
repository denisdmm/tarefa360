
import { User, Activity, EvaluationPeriod, Association } from './types';
import { Timestamp } from 'firebase/firestore';

// --- USERS ---
export const mockUsers: Omit<User, 'id'>[] = [
  // Admin
  {
    cpf: '00000000000',
    name: 'Administrador do Sistema',
    nomeDeGuerra: 'Admin',
    postoGrad: 'Cel',
    email: 'admin@tarefa360.mil.br',
    role: 'admin',
    jobTitle: 'Administrador',
    sector: 'TI',
    avatarUrl: 'https://placehold.co/100x100',
    password: 'Admin1234',
    status: 'Ativo',
    forcePasswordChange: false,
  },
  // Appraisers
  {
    cpf: '11111111111',
    name: 'Ana Carolina Souza',
    nomeDeGuerra: 'Ana',
    postoGrad: 'Maj',
    email: 'ana.souza@tarefa360.mil.br',
    role: 'appraiser',
    jobTitle: 'Chefe de Seção',
    sector: 'S1',
    avatarUrl: 'https://placehold.co/100x100',
    password: 'User1234',
    status: 'Ativo',
    forcePasswordChange: false,
  },
  {
    cpf: '22222222222',
    name: 'Roberto Almeida',
    nomeDeGuerra: 'Roberto',
    postoGrad: 'Cap',
    email: 'roberto.almeida@tarefa360.mil.br',
    role: 'appraiser',
    jobTitle: 'Chefe de Subseção',
    sector: 'S2',
    avatarUrl: 'https://placehold.co/100x100',
    password: 'User1234',
    status: 'Ativo',
    forcePasswordChange: false,
  },
  // Appraisees
  {
    cpf: '33333333333',
    name: 'Carlos Pereira',
    nomeDeGuerra: 'Carlos',
    postoGrad: '1º Ten',
    email: 'carlos.pereira@tarefa360.mil.br',
    role: 'appraisee',
    jobTitle: 'Analista de Operações',
    sector: 'S3',
    avatarUrl: 'https://placehold.co/100x100',
    password: 'User1234',
    status: 'Ativo',
    forcePasswordChange: false,
  },
  {
    cpf: '44444444444',
    name: 'Mariana Costa',
    nomeDeGuerra: 'Mariana',
    postoGrad: '2º Ten',
    email: 'mariana.costa@tarefa360.mil.br',
    role: 'appraisee',
    jobTitle: 'Desenvolvedora',
    sector: 'TI',
    avatarUrl: 'https://placehold.co/100x100',
    password: 'User1234',
    status: 'Ativo',
    forcePasswordChange: false,
  },
  {
    cpf: '55555555555',
    name: 'Sgt Ferreira',
    nomeDeGuerra: 'Ferreira',
    postoGrad: '3º Sgt',
    email: 'sgt.ferreira@tarefa360.mil.br',
    role: 'appraisee',
    jobTitle: 'Auxiliar Administrativo',
    sector: 'S1',
    avatarUrl: 'https://placehold.co/100x100',
    password: 'User1234',
    status: 'Ativo',
    forcePasswordChange: false,
  },
   {
    cpf: '66666666666',
    name: 'Cabo Lima',
    nomeDeGuerra: 'Lima',
    postoGrad: 'Cb',
    email: 'cb.lima@tarefa360.mil.br',
    role: 'appraisee',
    jobTitle: 'Motorista',
    sector: 'GAR',
    avatarUrl: 'https://placehold.co/100x100',
    password: 'User1234',
    status: 'Inativo',
    forcePasswordChange: true,
  },
];

// --- EVALUATION PERIODS ---
export const mockEvaluationPeriods: Omit<EvaluationPeriod, 'id'>[] = [
  {
    name: 'FAG 2024 - 1º Semestre',
    startDate: Timestamp.fromDate(new Date('2024-01-01T12:00:00')),
    endDate: Timestamp.fromDate(new Date('2024-06-30T12:00:00')),
    status: 'Ativo',
  },
  {
    name: 'FAG 2023 - 2º Semestre',
    startDate: Timestamp.fromDate(new Date('2023-07-01T12:00:00')),
    endDate: Timestamp.fromDate(new Date('2023-12-31T12:00:00')),
    status: 'Inativo',
  },
];

// --- ACTIVITIES ---
// We need user IDs, which will be generated after users are added.
// So, we'll map them by CPF for now.
export const mockActivitiesData: { userCpf: string; activity: Omit<Activity, 'id' | 'userId'> }[] = [
  // Activities for Carlos Pereira (CPF 33333333333)
  {
    userCpf: '33333333333',
    activity: {
      title: 'Relatório Mensal de Operações',
      description: 'Coletar dados e compilar o relatório de operações do mês, incluindo estatísticas e análises.',
      startDate: Timestamp.fromDate(new Date('2024-02-01T12:00:00')),
      progressHistory: [
        { year: 2024, month: 2, percentage: 50, comment: 'Coleta de dados iniciada.' },
        { year: 2024, month: 3, percentage: 100, comment: 'Relatório finalizado e entregue.' },
      ],
    },
  },
  {
    userCpf: '33333333333',
    activity: {
      title: 'Planejamento de Exercício Tático',
      description: 'Desenvolver o plano de ação para o exercício "Operação Alvorada".',
      startDate: Timestamp.fromDate(new Date('2024-04-10T12:00:00')),
      progressHistory: [
        { year: 2024, month: 4, percentage: 30, comment: 'Fases iniciais do planejamento concluídas.' },
        { year: 2024, month: 5, percentage: 75, comment: 'Logística e recursos definidos.' },
      ],
    },
  },
  // Activities for Mariana Costa (CPF 44444444444)
  {
    userCpf: '44444444444',
    activity: {
      title: 'Desenvolvimento do Módulo de Autenticação',
      description: 'Implementar o novo sistema de autenticação usando OAuth 2.0 para a aplicação interna.',
      startDate: Timestamp.fromDate(new Date('2024-03-15T12:00:00')),
      progressHistory: [
        { year: 2024, month: 3, percentage: 20, comment: 'Estrutura inicial e dependências configuradas.' },
        { year: 2024, month: 4, percentage: 60, comment: 'Fluxo de autenticação principal implementado.' },
        { year: 2024, month: 5, percentage: 90, comment: 'Testes de integração em andamento.' },
      ],
    },
  },
  // Activities for Sgt Ferreira (CPF 55555555555)
  {
    userCpf: '55555555555',
    activity: {
      title: 'Organização do Arquivo da Seção',
      description: 'Digitalizar e categorizar todos os documentos do ano anterior.',
      startDate: Timestamp.fromDate(new Date('2024-01-20T12:00:00')),
      progressHistory: [
        { year: 2024, month: 1, percentage: 100, comment: 'Todos os documentos foram digitalizados e arquivados com sucesso.' },
      ],
    },
  },
];


// --- ASSOCIATIONS ---
// We'll map them by CPF as well.
export const mockAssociationsData: { appraiseeCpf: string; appraiserCpf: string }[] = [
    { appraiseeCpf: '33333333333', appraiserCpf: '11111111111' }, // Carlos -> Ana
    { appraiseeCpf: '44444444444', appraiserCpf: '22222222222' }, // Mariana -> Roberto
    { appraiseeCpf: '55555555555', appraiserCpf: '11111111111' }, // Ferreira -> Ana
    { appraiseeCpf: '66666666666', appraiserCpf: '22222222222' }, // Lima -> Roberto
];
