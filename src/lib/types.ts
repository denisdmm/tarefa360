
import { Timestamp } from "firebase/firestore";

export type Role = "admin" | "appraisee" | "appraiser";

export interface User {
  id: string;
  name: string;
  nomeDeGuerra: string;
  postoGrad: string;
  email: string;
  role: Role;
  jobTitle: string;
  sector: string;
  avatarUrl: string;
  cpf: string;
  password?: string;
  status?: 'Ativo' | 'Inativo';
  forcePasswordChange?: boolean;
}

export interface ProgressEntry {
  month: number; // 1-12
  year: number;
  percentage: number;
  comment: string;
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  startDate: Date | Timestamp;
  progressHistory: ProgressEntry[];
  userId: string;
}

export interface EvaluationPeriod {
  id:string;
  name: string;
  startDate: Date | Timestamp;
  endDate: Date | Timestamp;
  status: 'Ativo' | 'Inativo';
}

export interface Association {
    id: string;
    appraiseeId: string;
    appraiserId: string;
}
