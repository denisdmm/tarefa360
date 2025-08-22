
"use client";

import * as React from 'react';
import type { User, Activity, EvaluationPeriod, Association } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, addDoc, deleteDoc, updateDoc, Timestamp, query, where } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { mockUsers } from '@/lib/mock-data';

// Helper function to convert Firestore Timestamps to Dates
const convertTimestamps = (data: any) => {
    const newData: Partial<User & Activity & EvaluationPeriod> = { ...data };
    for (const key in newData) {
        if (newData[key as keyof typeof newData] instanceof Timestamp) {
            (newData as any)[key] = (newData[key as keyof typeof newData] as Timestamp).toDate();
        }
    }
    return newData;
};


interface DataContextProps {
    users: User[];
    addUser: (userData: Omit<User, 'id'>) => Promise<string | null>;
    updateUser: (userId: string, userData: Partial<User>) => Promise<void>;
    deleteUser: (userId: string) => Promise<void>;

    activities: Activity[];
    addActivity: (activityData: Omit<Activity, 'id'>) => Promise<string | null>;
    updateActivity: (activityId: string, activityData: Partial<Activity>) => Promise<void>;
    deleteActivity: (activityId: string) => Promise<boolean>;

    evaluationPeriods: EvaluationPeriod[];
    addEvaluationPeriod: (periodData: Omit<EvaluationPeriod, 'id'>) => Promise<string | null>;
    updateEvaluationPeriod: (periodId: string, periodData: Partial<EvaluationPeriod>) => Promise<void>;
    deleteEvaluationPeriod: (periodId: string) => Promise<void>;
    ensureCurrentEvaluationPeriodExists: () => Promise<void>;

    associations: Association[];
    addAssociation: (associationData: Omit<Association, 'id'>) => Promise<string | null>;
    deleteAssociation: (associationId: string) => Promise<void>;

    loggedInUser: User | null;
    setLoggedInUser: React.Dispatch<React.SetStateAction<User | null>>;
    loading: boolean;
    connectionError: boolean;
    fetchData: () => Promise<void>;
}

const DataContext = React.createContext<DataContextProps | undefined>(undefined);

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
    const [users, setUsersState] = React.useState<User[]>([]);
    const [activities, setActivitiesState] = React.useState<Activity[]>([]);
    const [evaluationPeriods, setEvaluationPeriodsState] = React.useState<EvaluationPeriod[]>([]);
    const [associations, setAssociationsState] = React.useState<Association[]>([]);
    const [loggedInUser, setLoggedInUser] = React.useState<User | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [connectionError, setConnectionError] = React.useState(false);
    const { toast } = useToast();

    const fetchData = React.useCallback(async () => {
        setLoading(true);
        setConnectionError(false);
        try {
            const [
                usersSnapshot, 
                activitiesSnapshot, 
                periodsSnapshot, 
                associationsSnapshot
            ] = await Promise.all([
                getDocs(collection(db, "users")),
                getDocs(collection(db, "activities")),
                getDocs(collection(db, "evaluationPeriods")),
                getDocs(collection(db, "associations"))
            ]);
            
            const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...convertTimestamps(doc.data()) } as User));
            setUsersState(usersList);
            
            const activitiesList = activitiesSnapshot.docs.map(doc => ({ id: doc.id, ...convertTimestamps(doc.data()) } as Activity));
            setActivitiesState(activitiesList);

            const periodsList = periodsSnapshot.docs.map(doc => ({ id: doc.id, ...convertTimestamps(doc.data()) } as EvaluationPeriod)).sort((a,b) => new Date(b.startDate as any).getTime() - new Date(a.startDate as any).getTime());
            setEvaluationPeriodsState(periodsList);
            
            const associationsList = associationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Association));
            setAssociationsState(associationsList);
            
            return { usersList, periodsList };
        } catch (error) {
            console.error("Error fetching data from Firestore: ", error);
            toast({ variant: 'destructive', title: "Erro de Conexão", description: "Não foi possível carregar os dados. Verifique suas regras de segurança do Firestore." });
            setConnectionError(true);
            return { usersList: [], periodsList: [] };
        } finally {
            setLoading(false);
        }
    }, [toast]);
    
    const ensureAdminUserExists = React.useCallback(async (currentUsers: User[]) => {
        try {
            const adminCpf = '00000000000';
            const adminExists = currentUsers.some(user => user.cpf === adminCpf);

            if (!adminExists) {
                console.log("Admin user not found, creating one...");
                const adminData = mockUsers.find(u => u.cpf === adminCpf);
                if (adminData) {
                    await addUser(adminData);
                }
            }
        } catch (error) {
            console.error("Error ensuring admin user exists:", error);
            toast({
                variant: "destructive",
                title: "Erro Crítico",
                description: "Não foi possível verificar ou criar o usuário administrador."
            });
        }
    }, [toast]);

    const addEvaluationPeriod = async (periodData: Omit<EvaluationPeriod, 'id'>): Promise<string | null> => {
        try {
            const dataToSave = {
                ...periodData,
                startDate: Timestamp.fromDate(periodData.startDate as Date),
                endDate: Timestamp.fromDate(periodData.endDate as Date),
            };
            const docRef = await addDoc(collection(db, 'evaluationPeriods'), dataToSave);
            const newPeriod = { id: docRef.id, ...periodData } as EvaluationPeriod;
            setEvaluationPeriodsState(prev => [...prev, newPeriod].sort((a,b) => new Date(b.startDate as any).getTime() - new Date(a.startDate as any).getTime()));
            return docRef.id;
        } catch (error) {
            console.error("Error adding period:", error);
            toast({ variant: 'destructive', title: "Erro ao adicionar período" });
            return null;
        }
    };
    
    const ensureCurrentEvaluationPeriodExists = React.useCallback(async () => {
        try {
            const now = new Date();
            const currentYear = now.getFullYear();
            const currentMonth = now.getMonth(); // 0-11

            const periodYear = (currentMonth >= 10) ? currentYear + 1 : currentYear; // >= 10 means Nov or Dec

            const startDate = new Date(periodYear - 1, 10, 1); // Nov 1st of previous year
            const endDate = new Date(periodYear, 9, 31);   // Oct 31st of current year

            const periodsRef = collection(db, "evaluationPeriods");
            const q = query(periodsRef, 
                where('startDate', '==', Timestamp.fromDate(startDate)),
                where('endDate', '==', Timestamp.fromDate(endDate))
            );

            const existingPeriodSnapshot = await getDocs(q);

            if (existingPeriodSnapshot.empty) {
                console.log(`Evaluation period for ${periodYear} not found, creating one...`);

                const newPeriodData = {
                    name: `Período de Avaliação ${periodYear}`,
                    startDate,
                    endDate,
                    status: 'Ativo' as 'Ativo' | 'Inativo',
                };
                
                await addEvaluationPeriod(newPeriodData);
            }
        } catch (error) {
             console.error("Error ensuring evaluation period exists:", error);
             toast({
                variant: "destructive",
                title: "Erro Crítico",
                description: "Não foi possível verificar ou criar o período de avaliação."
            });
        }
    }, [toast]);


    React.useEffect(() => {
        const initialize = async () => {
            const { usersList } = await fetchData();
            await ensureAdminUserExists(usersList);
        };
        initialize();
    }, [fetchData, ensureAdminUserExists]);

    // --- CRUD Functions ---

    // USERS
    const addUser = async (userData: Omit<User, 'id'>): Promise<string | null> => {
        try {
            const docRef = await addDoc(collection(db, 'users'), userData);
            const newUser = { id: docRef.id, ...userData } as User;
            setUsersState(prev => [...prev, newUser]);
            return docRef.id;
        } catch (error) {
            console.error("Error adding user:", error);
            toast({ variant: 'destructive', title: "Erro ao adicionar usuário" });
            return null;
        }
    };

    const updateUser = async (userId: string, userData: Partial<User>): Promise<void> => {
        try {
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, userData);
            const updatedUser = { id: userId, ...userData }
            setUsersState(prev => prev.map(u => u.id === userId ? { ...u, ...updatedUser } : u));
            if (loggedInUser?.id === userId) {
                setLoggedInUser(prev => prev ? { ...prev, ...updatedUser } : null);
            }
        } catch (error) {
            console.error("Error updating user:", error);
            toast({ variant: 'destructive', title: "Erro ao atualizar usuário" });
        }
    };

    const deleteUser = async (userId: string): Promise<void> => {
        try {
            await deleteDoc(doc(db, 'users', userId));
            setUsersState(prev => prev.filter(u => u.id !== userId));
            
            const associationsToDelete = associations.filter(a => a.appraiseeId === userId || a.appraiserId === userId);
            const deletePromises = associationsToDelete.map(assoc => deleteAssociation(assoc.id));
            await Promise.all(deletePromises);
        } catch (error) {
            console.error("Error deleting user:", error);
            toast({ variant: 'destructive', title: "Erro ao excluir usuário" });
        }
    };
    
    // ACTIVITIES
    const addActivity = async (activityData: Omit<Activity, 'id'>): Promise<string | null> => {
        try {
            const dataToSave = {
                ...activityData,
                startDate: Timestamp.fromDate(activityData.startDate as Date),
            };
            const docRef = await addDoc(collection(db, 'activities'), dataToSave);
            const newActivity = { id: docRef.id, ...activityData } as Activity;
            setActivitiesState(prev => [...prev, newActivity]);
            return docRef.id;
        } catch (error) {
            console.error("Error adding activity:", error);
            toast({ variant: 'destructive', title: "Erro ao adicionar atividade" });
            return null;
        }
    };

    const updateActivity = async (activityId: string, activityData: Partial<Activity>): Promise<void> => {
        try {
            const dataToUpdate: { [key: string]: any } = { ...activityData };
            if (activityData.startDate) {
                dataToUpdate.startDate = Timestamp.fromDate(activityData.startDate as Date);
            }
            const activityRef = doc(db, 'activities', activityId);
            await updateDoc(activityRef, dataToUpdate);
            const updatedActivity = { id: activityId, ...activityData };
            setActivitiesState(prev => prev.map(a => a.id === activityId ? { ...a, ...updatedActivity } : a));
        } catch (error) {
            console.error("Error updating activity:", error);
            toast({ variant: 'destructive', title: "Erro ao atualizar atividade" });
        }
    };
    
    const deleteActivity = async (activityId: string): Promise<boolean> => {
        try {
            await deleteDoc(doc(db, "activities", activityId));
            setActivitiesState((prev) => prev.filter((a) => a.id !== activityId));
            return true;
        } catch (error) {
            console.error("Error deleting activity from Firestore:", error);
            toast({ variant: 'destructive', title: "Erro ao Excluir", description: "Não foi possível remover a atividade do banco de dados." });
            return false;
        }
    };

    // EVALUATION PERIODS
    const updateEvaluationPeriod = async (periodId: string, periodData: Partial<EvaluationPeriod>): Promise<void> => {
        try {
            const dataToUpdate: { [key: string]: any } = { ...periodData };
            if (periodData.startDate) {
                dataToUpdate.startDate = Timestamp.fromDate(periodData.startDate as Date);
            }
            if (periodData.endDate) {
                dataToUpdate.endDate = Timestamp.fromDate(periodData.endDate as Date);
            }
            const periodRef = doc(db, 'evaluationPeriods', periodId);
            await updateDoc(periodRef, dataToUpdate);
            const updatedPeriod = { id: periodId, ...periodData };
            setEvaluationPeriodsState(prev => prev.map(p => p.id === periodId ? { ...p, ...updatedPeriod } : p));
        } catch (error) {
            console.error("Error updating period:", error);
            toast({ variant: 'destructive', title: "Erro ao atualizar período" });
        }
    };

    const deleteEvaluationPeriod = async (periodId: string): Promise<void> => {
        try {
            await deleteDoc(doc(db, 'evaluationPeriods', periodId));
            setEvaluationPeriodsState(prev => prev.filter(p => p.id !== periodId));
        } catch (error) {
            console.error("Error deleting period:", error);
            toast({ variant: 'destructive', title: "Erro ao excluir período" });
        }
    };

    // ASSOCIATIONS
    const addAssociation = async (associationData: Omit<Association, 'id'>): Promise<string | null> => {
        try {
            const docRef = await addDoc(collection(db, 'associations'), associationData);
            const newAssociation = { id: docRef.id, ...associationData } as Association;
            setAssociationsState(prev => [...prev, newAssociation]);
            return docRef.id;
        } catch (error) {
            console.error("Error adding association:", error);
            toast({ variant: 'destructive', title: "Erro ao adicionar associação" });
            return null;
        }
    };

    const deleteAssociation = async (associationId: string): Promise<void> => {
        try {
            await deleteDoc(doc(db, 'associations', associationId));
            setAssociationsState(prev => prev.filter(a => a.id !== associationId));
        } catch (error) {
            console.error("Error deleting association:", error);
            toast({ variant: 'destructive', title: "Erro ao excluir associação" });
        }
    };

    const contextValue: DataContextProps = {
        users,
        addUser,
        updateUser,
        deleteUser,
        activities,
        addActivity,
        updateActivity,
        deleteActivity,
        evaluationPeriods,
        addEvaluationPeriod,
        updateEvaluationPeriod,
        deleteEvaluationPeriod,
        ensureCurrentEvaluationPeriodExists,
        associations,
        addAssociation,
        deleteAssociation,
        loggedInUser,
        setLoggedInUser,
        loading,
        connectionError,
        fetchData,
    };
    
    return (
        <DataContext.Provider value={contextValue}>
            {children}
        </DataContext.Provider>
    );
};

export const useDataContext = (): DataContextProps => {
    const context = React.useContext(DataContext);
    if (context === undefined) {
        throw new Error('useDataContext must be used within a DataProvider');
    }
    return context;
};

    

    




    