
"use client";

import * as React from 'react';
import type { User, Activity, EvaluationPeriod, Association } from '@/lib/types';
import { 
    users as mockUsers, 
    activities as mockActivities, 
    evaluationPeriods as mockPeriods, 
    associations as mockAssociations 
} from '@/lib/mock-data';
import { getMonth, getYear } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

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
    const { toast } = useToast();

    React.useEffect(() => {
        const today = new Date();
        const currentYear = getYear(today);
        const currentMonth = getMonth(today); // 0-11 (Jan is 0, Nov is 10)
      
        let startYear, endYear;
        // If current month is Nov or Dec, the new cycle for the next year has started.
        if (currentMonth >= 10) { // In November (10) or December (11)
            startYear = currentYear;
            endYear = currentYear + 1;
        } else { // In January to October
            startYear = currentYear - 1;
            endYear = currentYear;
        }
    
        const periodName = `Avaliação ${startYear}/${endYear}`;
        const periodExists = evaluationPeriods.some(p => p.name === periodName);
      
        if (!periodExists) {
          const newPeriod: EvaluationPeriod = {
            id: `period-${Date.now()}`,
            name: periodName,
            startDate: new Date(startYear, 10, 1, 12, 0, 0), // Nov 1st
            endDate: new Date(endYear, 9, 31, 12, 0, 0), // Oct 31st
            status: 'Ativo',
          };
          
          const updatedPeriods = evaluationPeriods.map(p => ({ ...p, status: 'Inativo' as 'Inativo' }));
          
          setEvaluationPeriods(prevPeriods => [newPeriod, ...updatedPeriods]);
      
          toast({
            title: "Período de Avaliação Criado",
            description: `O período "${periodName}" foi criado e definido como ativo.`,
          });
        }
      // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []); // This effect runs once when the app loads
    
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

    