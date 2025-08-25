
import { User } from './types';

// This file is now only used as a reference for creating the admin user in DataContext.
// The password here is irrelevant as it's immediately replaced by the hashed one in DataContext.
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
    password: 'will-be-overwritten',
    status: 'Ativo',
    forcePasswordChange: false,
  },
];

    