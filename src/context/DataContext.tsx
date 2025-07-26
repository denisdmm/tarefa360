
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
}

const DataContext = React.createContext<DataContextProps | undefined>(undefined);

const initializePeriods = (): EvaluationPeriod[] => {
    const today = new Date();
    const currentYear = getYear(today);
    const currentMonth = getMonth(today); // 0-11 (Jan is 0)
  
    let startYear, endYear;
    if (currentMonth >= 10) { // Nov (10) or Dec (11)
        startYear = currentYear;
        endYear = currentYear + 1;
    } else { // Jan to Oct
        startYear = currentYear - 1;
        endYear = currentYear;
    }

    const periodName = `Avaliação ${startYear}/${endYear}`;
    const periodExists = initialPeriods.some(p => p.name === periodName);
    
    if (!periodExists) {
        const newPeriod: EvaluationPeriod = {
            id: `period-${Date.now()}`,
            name: periodName,
            startDate: new Date(startYear, 10, 1, 12, 0, 0), // Nov 1st
            endDate: new Date(endYear, 9, 31, 12, 0, 0),   // Oct 31st
            status: 'Ativo',
        };
        
        const updatedPeriods = initialPeriods.map(p => ({ ...p, status: 'Inativo' as 'Inativo' }));
        return [newPeriod, ...updatedPeriods];
    }
    
    return initialPeriods;
};


export const DataProvider = ({ children }: { children: React.ReactNode }) => {
    const [users, setUsers] = React.useState<User[]>(() => initialUsers);
    const [activities, setActivities] = React.useState<Activity[]>(() => initialActivities);
    const [evaluationPeriods, setEvaluationPeriods] = React.useState<EvaluationPeriod[]>(initializePeriods);
    const [associations, setAssociations] = React.useState<Association[]>(() => initialAssociations);
    
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
