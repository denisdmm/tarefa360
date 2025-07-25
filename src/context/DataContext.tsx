
"use client";

import * as React from 'react';
import type { User, Activity, EvaluationPeriod, Association } from '@/lib/types';
import { 
    users as mockUsers, 
    activities as mockActivities, 
    evaluationPeriods as mockPeriods, 
    associations as mockAssociations 
} from '@/lib/mock-data';

interface DataContextProps {
    users: User[];
    setUsers: React.Dispatch<React.SetStateAction<User[]>>;
    activities: Activity[];
    setActivities: React.Dispatch<React.SetStateAction<Activity[]>>;
    evaluationPeriods: EvaluationPeriod[];
    setEvaluationPeriods: React.Dispatch<React.SetStateAction<EvaluationPeriod[]>>;
    associations: Association[];
    setAssociations: React.Dispatch<React.SetStateAction<Association[]>>;
}

const DataContext = React.createContext<DataContextProps | undefined>(undefined);

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
    const [users, setUsers] = React.useState<User[]>(mockUsers);
    const [activities, setActivities] = React.useState<Activity[]>(mockActivities);
    const [evaluationPeriods, setEvaluationPeriods] = React.useState<EvaluationPeriod[]>(mockPeriods);
    const [associations, setAssociations] = React.useState<Association[]>(mockAssociations);
    
    return (
        <DataContext.Provider value={{
            users,
            setUsers,
            activities,
            setActivities,
            evaluationPeriods,
            setEvaluationPeriods,
            associations,
            setAssociations,
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useDataContext = () => {
    const context = React.useContext(DataContext);
    if (context === undefined) {
        throw new Error('useDataContext must be used within a DataProvider');
    }
    return context;
};
