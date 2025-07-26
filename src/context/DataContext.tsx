
"use client";

import * as React from 'react';
import type { User, Activity, EvaluationPeriod, Association } from '@/lib/types';
import { 
    users as initialUsers, 
    activities as initialActivities, 
    evaluationPeriods as initialPeriods, 
    associations as initialAssociations 
} from '@/lib/mock-data';
import { getMonth, getYear } from 'date-fns';

interface DataContextProps {
    users: User[];
    setUsers: React.Dispatch<React.SetStateAction<User[]>>;
    activities: Activity[];
    setActivities: React.Dispatch<React.SetStateAction<Activity[]>>;
    evaluationPeriods: EvaluationPeriod[];
    setEvaluationPeriods: React.Dispatch<React.SetStateAction<EvaluationPeriod[]>>;
    associations: Association[];
    setAssociations: React.Dispatch<React.SetStateAction<Association[]>>;
    loggedInUser: User | null;
    setLoggedInUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const DataContext = React.createContext<DataContextProps | undefined>(undefined);

const initializePeriods = (): EvaluationPeriod[] => {
    // For the new mock data, we want the active period to be Nov 2024 - Oct 2025
    const startYear = 2024;
    const endYear = 2025;

    const periodName = `Avaliação ${startYear}/${endYear}`;
    const periodExists = initialPeriods.some(p => p.name === periodName);
    
    if (!periodExists) {
        const newPeriod: EvaluationPeriod = {
            id: `period-${Date.now()}`,
            name: periodName,
            startDate: new Date(startYear, 10, 1, 12, 0, 0), // Nov 1st, 2024
            endDate: new Date(endYear, 9, 31, 12, 0, 0),   // Oct 31st, 2025
            status: 'Ativo',
        };
        
        // Add a previous period for historical data context
        const previousPeriod: EvaluationPeriod = {
             id: `period-prev-${Date.now()}`,
             name: `Avaliação ${startYear - 1}/${endYear - 1}`,
             startDate: new Date(startYear - 1, 10, 1, 12, 0, 0), // Nov 1st, 2023
             endDate: new Date(endYear - 1, 9, 31, 12, 0, 0),   // Oct 31st, 2024
             status: 'Inativo',
        }

        const updatedPeriods = initialPeriods.map(p => ({ ...p, status: 'Inativo' as 'Inativo' }));
        return [newPeriod, previousPeriod, ...updatedPeriods];
    }
    
    // Ensure the correct period is active if it already exists
    return initialPeriods.map(p => ({
        ...p,
        status: p.name === periodName ? 'Ativo' : 'Inativo'
    }));
};


export const DataProvider = ({ children }: { children: React.ReactNode }) => {
    const [users, setUsers] = React.useState<User[]>(() => initialUsers);
    const [activities, setActivities] = React.useState<Activity[]>(() => initialActivities);
    const [evaluationPeriods, setEvaluationPeriods] = React.useState<EvaluationPeriod[]>(initializePeriods);
    const [associations, setAssociations] = React.useState<Association[]>(() => initialAssociations);
    const [loggedInUser, setLoggedInUser] = React.useState<User | null>(null);
    
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
            loggedInUser,
            setLoggedInUser,
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
