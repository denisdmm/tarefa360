
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
];

// --- EVALUATION PERIODS ---
export const mockEvaluationPeriods: Omit<EvaluationPeriod, 'id'>[] = [];

// --- ACTIVITIES ---
export const mockActivitiesData: { userCpf: string; activity: Omit<Activity, 'id' | 'userId'> }[] = [];


// --- ASSOCIATIONS ---
export const mockAssociationsData: { appraiseeCpf: string; appraiserCpf: string }[] = [];
