
export type Role = "admin" | "appraisee" | "appraiser";

export interface User {
  id: string;
  name: string;
  socialName: string;
  email: string;
  role: Role;
  title: string;
  avatarUrl: string;
  cpf: string;
  appraiserId?: string;
  appraiseeIds?: string[];
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  month: string;
  completionPercentage: number;
  userId: string;
}

export interface EvaluationPeriod {
  id:string;
  name: string;
  startDate: Date;
  endDate: Date;
  status: 'Ativo' | 'Inativo';
}

export interface Association {
    id: string;
    appraiseeId: string;
    appraiserId: string;
}
