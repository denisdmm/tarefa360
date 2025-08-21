
"use client";

import * as React from 'react';
import type { User, Activity, EvaluationPeriod, Association } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, addDoc, deleteDoc, updateDoc, Timestamp, query, where } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

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
    deleteActivity: (activityId: string) => Promise<void>;

    evaluationPeriods: EvaluationPeriod[];
    addEvaluationPeriod: (periodData: Omit<EvaluationPeriod, 'id'>) => Promise<string | null>;
    updateEvaluationPeriod: (periodId: string, periodData: Partial<EvaluationPeriod>) => Promise<void>;
    deleteEvaluationPeriod: (periodId: string) => Promise<void>;

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

    const seedAdminUser = async () => {
        const adminCpf = '00000000000';
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('cpf', '==', adminCpf));
        const adminSnapshot = await getDocs(q);

        if (adminSnapshot.empty) {
            console.log('Admin user not found, seeding...');
            const adminData: Omit<User, 'id'> = {
                name: 'Usuário Admin',
                nomeDeGuerra: 'Admin',
                email: 'admin@tarefa360.com',
                role: 'admin',
                jobTitle: 'Administrador do Sistema',
                sector: 'TI',
                avatarUrl: 'https://placehold.co/100x100',
                cpf: adminCpf,
                password: 'Admin1234', // Set a default password
                postoGrad: 'Cel',
                status: 'Ativo',
                forcePasswordChange: false, // Admin does not need to change password on first login
            };
            await addDoc(usersRef, adminData);
            console.log('Admin user seeded.');
        } else {
            console.log('Admin user found.');
        }
    };
    
    const fetchData = React.useCallback(async () => {
        setLoading(true);
        setConnectionError(false);
        try {
            await seedAdminUser(); 

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
            toast({ variant: 'destructive', title: "Erro de Conexão", description: "Não foi possível carregar os dados. Algumas funcionalidades podem estar indisponíveis." });
            setConnectionError(true);
        } finally {
            setLoading(false);
        }
    }, [toast]);

    React.useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- CRUD Functions ---

    // USERS
    const addUser = async (userData: Omit<User, 'id'>): Promise<string | null> => {
        try {
            const docRef = await addDoc(collection(db, 'users'), userData);
            await fetchData();
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
            await fetchData();
        } catch (error) {
            console.error("Error updating user:", error);
            toast({ variant: 'destructive', title: "Erro ao atualizar usuário" });
        }
    };

    const deleteUser = async (userId: string): Promise<void> => {
        try {
            await deleteDoc(doc(db, 'users', userId));
            // Also delete related associations
            const associationsToDelete = associations.filter(a => a.appraiseeId === userId || a.appraiserId === userId);
            for(const assoc of associationsToDelete) {
                await deleteDoc(doc(db, 'associations', assoc.id));
            }
            await fetchData();
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
            await fetchData();
            return docRef.id;
        } catch (error) {
            console.error("Error adding activity:", error);
            toast({ variant: 'destructive', title: "Erro ao adicionar atividade" });
            return null;
        }
    };

    const updateActivity = async (activityId: string, activityData: Partial<Activity>): Promise<void> => {
        try {
             const dataToUpdate: Partial<Activity> = { ...activityData };
            if (activityData.startDate) {
                dataToUpdate.startDate = Timestamp.fromDate(activityData.startDate as Date);
            }
            const activityRef = doc(db, 'activities', activityId);
            await updateDoc(activityRef, dataToUpdate);
            await fetchData();
        } catch (error) {
            console.error("Error updating activity:", error);
            toast({ variant: 'destructive', title: "Erro ao atualizar atividade" });
        }
    };
    
    const deleteActivity = async (activityId: string): Promise<void> => {
        try {
            await deleteDoc(doc(db, 'activities', activityId));
            await fetchData();
        } catch (error) {
            console.error("Error deleting activity:", error);
            toast({ variant: 'destructive', title: "Erro ao excluir atividade" });
        }
    };

    // EVALUATION PERIODS
    const addEvaluationPeriod = async (periodData: Omit<EvaluationPeriod, 'id'>): Promise<string | null> => {
        try {
            const dataToSave = {
                ...periodData,
                startDate: Timestamp.fromDate(periodData.startDate as Date),
                endDate: Timestamp.fromDate(periodData.endDate as Date),
            };
            const docRef = await addDoc(collection(db, 'evaluationPeriods'), dataToSave);
            await fetchData();
            return docRef.id;
        } catch (error) {
            console.error("Error adding period:", error);
            toast({ variant: 'destructive', title: "Erro ao adicionar período" });
            return null;
        }
    };

    const updateEvaluationPeriod = async (periodId: string, periodData: Partial<EvaluationPeriod>): Promise<void> => {
        try {
            const dataToUpdate: Partial<EvaluationPeriod> = { ...periodData };
            if (periodData.startDate) {
                dataToUpdate.startDate = Timestamp.fromDate(periodData.startDate as Date);
            }
            if (periodData.endDate) {
                dataToUpdate.endDate = Timestamp.fromDate(periodData.endDate as Date);
            }
            const periodRef = doc(db, 'evaluationPeriods', periodId);
            await updateDoc(periodRef, dataToUpdate);
            await fetchData();
        } catch (error) {
            console.error("Error updating period:", error);
            toast({ variant: 'destructive', title: "Erro ao atualizar período" });
        }
    };

    const deleteEvaluationPeriod = async (periodId: string): Promise<void> => {
        try {
            await deleteDoc(doc(db, 'evaluationPeriods', periodId));
            await fetchData();
        } catch (error) {
            console.error("Error deleting period:", error);
            toast({ variant: 'destructive', title: "Erro ao excluir período" });
        }
    };

    // ASSOCIATIONS
    const addAssociation = async (associationData: Omit<Association, 'id'>): Promise<string | null> => {
        try {
            const docRef = await addDoc(collection(db, 'associations'), associationData);
            await fetchData();
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
            await fetchData();
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

    