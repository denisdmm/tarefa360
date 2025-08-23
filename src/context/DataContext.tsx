
"use client";

import * as React from 'react';
import type { User, Activity, EvaluationPeriod, Association } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, addDoc, deleteDoc, updateDoc, Timestamp, query, where, writeBatch } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { mockUsers } from '@/lib/mock-data';

// Helper function to convert Firestore Timestamps to Dates
const convertTimestamps = (data: any) => {
    const newData: { [key: string]: any } = { ...data };
    for (const key in newData) {
        if (newData[key] instanceof Timestamp) {
            newData[key] = newData[key].toDate();
        }
    }
    return newData;
};


interface DataContextProps {
    users: User[];
    addUser: (userData: Omit<User, 'id'>) => Promise<string | null>;
    updateUser: (userId: string, userData: Partial<User>) => Promise<void>;
    deleteUser: (userId: string) => Promise<void>;
    toggleUserStatus: (userId: string, newStatus: 'Ativo' | 'Inativo') => Promise<void>;

    activities: Activity[];
    addActivity: (activityData: Omit<Activity, 'id'>) => Promise<Activity | null>;
    updateActivity: (activityId: string, activityData: Partial<Activity>) => Promise<void>;
    deleteActivity: (activityId: string) => Promise<boolean>;

    evaluationPeriods: EvaluationPeriod[];
    addEvaluationPeriod: (periodData: Omit<EvaluationPeriod, 'id'>) => Promise<string | null>;
    updateEvaluationPeriod: (periodId: string, periodData: Partial<EvaluationPeriod>) => Promise<void>;
    deleteEvaluationPeriod: (periodId: string) => Promise<void>;
    ensureCurrentEvaluationPeriodExists: () => Promise<void>;

    associations: Association[];
    addAssociation: (associationData: Omit<Association, 'id'>) => Promise<string | null>;
    updateAssociation: (associationId: string, associationData: Partial<Association>) => Promise<void>;
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
            
        } catch (error) {
            console.error("Error fetching data from Firestore: ", error);
            toast({ variant: 'destructive', title: "Erro de Conexão", description: "Não foi possível carregar os dados. Verifique suas regras de segurança do Firestore." });
            setConnectionError(true);
        } finally {
            setLoading(false);
        }
    }, [toast]);
    
    // USERS
    const addUser = React.useCallback(async (userData: Omit<User, 'id'>): Promise<string | null> => {
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
    }, [toast]);

    const ensureAdminUserExists = React.useCallback(async () => {
        try {
             const usersRef = collection(db, 'users');
            const adminCpf = '00000000000';
            const q = query(usersRef, where('cpf', '==', adminCpf));
            const adminSnapshot = await getDocs(q);

            if (adminSnapshot.empty) {
                console.log("Admin user not found, creating one...");
                const adminData = mockUsers.find(u => u.cpf === adminCpf);
                if (adminData) {
                    await addDoc(collection(db, 'users'), adminData);
                    await fetchData(); // Refetch data after creating admin
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
    }, [toast, fetchData]);

    React.useEffect(() => {
        const initialize = async () => {
            await fetchData();
            await ensureAdminUserExists();
        };
        initialize();
    }, [fetchData, ensureAdminUserExists]);


    const updateUser = React.useCallback(async (userId: string, userData: Partial<User>): Promise<void> => {
        try {
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, userData);
            
            setUsersState(prev => prev.map(u => u.id === userId ? { ...u, ...userData } : u));
            
            if (loggedInUser?.id === userId) {
                setLoggedInUser(prev => prev ? { ...prev, ...userData } : null);
            }
        } catch (error) {
            console.error("Error updating user:", error);
            toast({ variant: 'destructive', title: "Erro ao atualizar usuário" });
        }
    }, [toast, loggedInUser?.id]);

     const toggleUserStatus = React.useCallback(async (userId: string, newStatus: 'Ativo' | 'Inativo'): Promise<void> => {
        try {
            await updateUser(userId, { status: newStatus });
        } catch (error) {
            console.error("Error toggling user status:", error);
            toast({ variant: 'destructive', title: "Erro ao alterar status" });
        }
    }, [updateUser, toast]);

    const deleteUser = React.useCallback(async (userId: string): Promise<void> => {
        try {
            const batch = writeBatch(db);

            const activitiesRef = collection(db, "activities");
            const userActivitiesQuery = query(activitiesRef, where("userId", "==", userId));
            const userActivitiesSnapshot = await getDocs(userActivitiesQuery);
            userActivitiesSnapshot.forEach(doc => {
                batch.delete(doc.ref);
            });

            const associationsRef = collection(db, "associations");
            const appraiseeQuery = query(associationsRef, where("appraiseeId", "==", userId));
            const appraiserQuery = query(associationsRef, where("appraiserId", "==", userId));
            const [appraiseeSnapshot, appraiserSnapshot] = await Promise.all([getDocs(appraiseeQuery), getDocs(appraiserQuery)]);
            appraiseeSnapshot.forEach(doc => batch.delete(doc.ref));
            appraiserSnapshot.forEach(doc => batch.delete(doc.ref));

            const userRef = doc(db, 'users', userId);
            batch.delete(userRef);

            await batch.commit();

            setUsersState(prev => prev.filter(u => u.id !== userId));
            setActivitiesState(prev => prev.filter(a => a.userId !== userId));
            setAssociationsState(prev => prev.filter(a => a.appraiseeId !== userId && a.appraiserId !== userId));

        } catch (error) {
            console.error("Error deleting user and their data:", error);
            toast({ variant: 'destructive', title: "Erro ao Excluir Usuário", description: "Não foi possível remover o usuário e seus dados." });
        }
    }, [toast]);
    
    // ACTIVITIES
    const addActivity = React.useCallback(async (activityData: Omit<Activity, 'id'>): Promise<Activity | null> => {
        try {
            const dataToSave = {
                ...activityData,
                startDate: Timestamp.fromDate(activityData.startDate as Date),
            };
            const docRef = await addDoc(collection(db, 'activities'), dataToSave);
            const newActivity = { 
                id: docRef.id, 
                ...activityData 
            } as Activity;
            setActivitiesState(prev => [...prev, newActivity]);
            return newActivity;
        } catch (error) {
            console.error("Error adding activity:", error);
            toast({ variant: 'destructive', title: "Erro ao adicionar atividade" });
            return null;
        }
    }, [toast]);

    const updateActivity = React.useCallback(async (activityId: string, activityData: Partial<Activity>): Promise<void> => {
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
            toast({ variant: 'destructive', title: "Erro ao atualizar atividade", description: error instanceof Error ? error.message : String(error) });
        }
    }, [toast]);
    
    const deleteActivity = React.useCallback(async (activityId: string): Promise<boolean> => {
        try {
            await deleteDoc(doc(db, "activities", activityId));
            setActivitiesState((prev) => prev.filter((a) => a.id !== activityId));
            return true;
        } catch (error) {
            console.error("Error deleting activity from Firestore:", error);
            toast({ variant: 'destructive', title: "Erro ao Excluir", description: "Não foi possível remover a atividade do banco de dados." });
            return false;
        }
    }, [toast]);

    // EVALUATION PERIODS
     const addEvaluationPeriod = React.useCallback(async (periodData: Omit<EvaluationPeriod, 'id'>): Promise<string | null> => {
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
    }, [toast]);

    const updateEvaluationPeriod = React.useCallback(async (periodId: string, periodData: Partial<EvaluationPeriod>): Promise<void> => {
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
            setEvaluationPeriodsState(prev => prev.map(p => p.id === periodId ? { ...p, ...periodData } : p));
        } catch (error) {
            console.error("Error updating period:", error);
            toast({ variant: 'destructive', title: "Erro ao atualizar período" });
        }
    }, [toast]);

    const deleteEvaluationPeriod = React.useCallback(async (periodId: string): Promise<void> => {
        try {
            await deleteDoc(doc(db, 'evaluationPeriods', periodId));
            setEvaluationPeriodsState(prev => prev.filter(p => p.id !== periodId));
        } catch (error) {
            console.error("Error deleting period:", error);
            toast({ variant: 'destructive', title: "Erro ao excluir período" });
        }
    }, [toast]);

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
    }, [toast, addEvaluationPeriod]);


    // ASSOCIATIONS
    const addAssociation = React.useCallback(async (associationData: Omit<Association, 'id'>): Promise<string | null> => {
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
    }, [toast]);
    
    const updateAssociation = React.useCallback(async (associationId: string, associationData: Partial<Association>): Promise<void> => {
        try {
            const associationRef = doc(db, 'associations', associationId);
            await updateDoc(associationRef, associationData);
            setAssociationsState(prev => prev.map(a => a.id === associationId ? { ...a, ...associationData } as Association : a));
        } catch (error) {
            console.error("Error updating association:", error);
            toast({ variant: 'destructive', title: "Erro ao atualizar associação" });
        }
    }, [toast]);

    const deleteAssociation = React.useCallback(async (associationId: string): Promise<void> => {
        try {
            await deleteDoc(doc(db, 'associations', associationId));
            setAssociationsState(prev => prev.filter(a => a.id !== associationId));
        } catch (error) {
            console.error("Error deleting association:", error);
            toast({ variant: 'destructive', title: "Erro ao excluir associação" });
        }
    }, [toast]);

    const contextValue: DataContextProps = {
        users,
        addUser,
        updateUser,
        deleteUser,
        toggleUserStatus,
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
        updateAssociation,
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

    