import type { User, Activity, EvaluationPeriod, Association } from './types';

export const users: User[] = [
  { id: 'user-admin-1', name: 'Admin User', socialName: 'Admin', email: 'admin@tarefa360.com', role: 'admin', title: 'System Administrator', avatarUrl: 'https://placehold.co/100x100' },
  { id: 'user-appraiser-1', name: 'Ana Pereira', socialName: 'Ana', email: 'ana.p@tarefa360.com', role: 'appraiser', title: 'Senior Manager', avatarUrl: 'https://placehold.co/100x100', appraiseeIds: ['user-appraisee-1', 'user-appraisee-2'] },
  { id: 'user-appraiser-2', name: 'Roberto Lima', socialName: 'Roberto', email: 'roberto.l@tarefa360.com', role: 'appraiser', title: 'Project Lead', avatarUrl: 'https://placehold.co/100x100', appraiseeIds: ['user-appraisee-3'] },
  { id: 'user-appraisee-1', name: 'Carlos Silva', socialName: 'Carlos', email: 'carlos.s@tarefa360.com', role: 'appraisee', title: 'Software Engineer', avatarUrl: 'https://placehold.co/100x100', appraiserId: 'user-appraiser-1' },
  { id: 'user-appraisee-2', name: 'Juliana Costa', socialName: 'Ju', email: 'juliana.c@tarefa360.com', role: 'appraisee', title: 'UX/UI Designer', avatarUrl: 'https://placehold.co/100x100', appraiserId: 'user-appraiser-1' },
  { id: 'user-appraisee-3', name: 'Fernando Martins', socialName: 'Fernando', email: 'fernando.m@tarefa360.com', role: 'appraisee', title: 'QA Analyst', avatarUrl: 'https://placehold.co/100x100', appraiserId: 'user-appraiser-2' },
];

export const activities: Activity[] = [
  { id: 'act-1', userId: 'user-appraisee-1', title: 'Develop new authentication module', description: 'Implement JWT-based authentication for the main API.', month: 'January', completionPercentage: 100 },
  { id: 'act-2', userId: 'user-appraisee-1', title: 'Refactor database schema', description: 'Optimize tables for performance and add new indices.', month: 'February', completionPercentage: 75 },
  { id: 'act-3', userId: 'user-appraisee-1', title: 'Write API documentation', description: 'Use Swagger/OpenAPI to document all endpoints.', month: 'March', completionPercentage: 40 },
  { id: 'act-4', userId: 'user-appraisee-2', title: 'Design new dashboard interface', description: 'Create wireframes and mockups for the v2 dashboard.', month: 'January', completionPercentage: 100 },
  { id: 'act-5', userId: 'user-appraisee-2', title: 'Conduct user research sessions', description: 'Gather feedback on the current product from key users.', month: 'February', completionPercentage: 90 },
  { id: 'act-6', userId: 'user-appraisee-3', title: 'Create automated test suite for payments', description: 'Use Selenium to build E2E tests for the payment flow.', month: 'March', completionPercentage: 60 },
];

export const evaluationPeriods: EvaluationPeriod[] = [
    { id: 'period-1', name: 'Evaluation 2024', startDate: new Date('2024-01-01'), endDate: new Date('2024-11-30'), status: 'Active' },
    { id: 'period-2', name: 'Evaluation 2023', startDate: new Date('2023-01-01'), endDate: new Date('2023-11-30'), status: 'Inactive' },
];

export const associations: Association[] = [
    { id: 'assoc-1', appraiseeId: 'user-appraisee-1', appraiserId: 'user-appraiser-1'},
    { id: 'assoc-2', appraiseeId: 'user-appraisee-2', appraiserId: 'user-appraiser-1'},
    { id: 'assoc-3', appraiseeId: 'user-appraisee-3', appraiserId: 'user-appraiser-2'},
]
