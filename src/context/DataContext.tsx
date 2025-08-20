
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

// Helper to remove 'undefined' fields before saving to Firestore
const sanitizeDataForFirestore = (data: any) => {
    const sanitizedData: { [key: string]: any } = {};
    Object.keys(data).forEach(key => {
        if (data[key] !== undefined) {
            sanitizedData[key] = data[key];
        }
    });
    return sanitizedData;
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
            await addDoc(usersRef, sanitizeDataForFirestore(adminData));
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

            const periodsList = periodsSnapshot.docs.map(doc => ({ id: doc.id, ...convertTimestamps(doc.data()) } as EvaluationPeriod)).sort((a,b) => b.startDate.getTime() - a.startDate.getTime());
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [toast]);

    React.useEffect(() => {
        fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // --- CRUD Functions ---

    // USERS
    const addUser = async (userData: Omit<User, 'id'>): Promise<string | null> => {
        try {
            const docRef = await addDoc(collection(db, 'users'), sanitizeDataForFirestore(userData));
            await fetchData();
            return docRef.id;
        } catch (error) {
            console.error("Error adding user:", error);
            toast({ variant: 'destructive', title: "Erro ao adicionar usuário" });
            return null;
        }
    };

    const updateUser = async (userId: string, userData: Partial<User>) => {
        try {
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, sanitizeDataForFirestore(userData));
            await fetchData();
        } catch (error) {
            console.error("Error updating user:", error);
            toast({ variant: 'destructive', title: "Erro ao atualizar usuário" });
        }
    };

    const deleteUser = async (userId: string) => {
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
            const docRef = await addDoc(collection(db, 'activities'), sanitizeDataForFirestore(activityData));
            await fetchData();
            return docRef.id;
        } catch (error) {
            console.error("Error adding activity:", error);
            toast({ variant: 'destructive', title: "Erro ao adicionar atividade" });
            return null;
        }
    };

    const updateActivity = async (activityId: string, activityData: Partial<Activity>) => {
        try {
            const activityRef = doc(db, 'activities', activityId);
            await updateDoc(activityRef, sanitizeDataForFirestore(activityData));
            await fetchData();
        } catch (error) {
            console.error("Error updating activity:", error);
            toast({ variant: 'destructive', title: "Erro ao atualizar atividade" });
        }
    };
    
    const deleteActivity = async (activityId: string) => {
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
            const docRef = await addDoc(collection(db, 'evaluationPeriods'), sanitizeDataForFirestore(periodData));
            await fetchData();
            return docRef.id;
        } catch (error) {
            console.error("Error adding period:", error);
            toast({ variant: 'destructive', title: "Erro ao adicionar período" });
            return null;
        }
    };

    const updateEvaluationPeriod = async (periodId: string, periodData: Partial<EvaluationPeriod>) => {
        try {
            const periodRef = doc(db, 'evaluationPeriods', periodId);
            await updateDoc(periodRef, sanitizeDataForFirestore(periodData));
            await fetchData();
        } catch (error) {
            console.error("Error updating period:", error);
            toast({ variant: 'destructive', title: "Erro ao atualizar período" });
        }
    };

    const deleteEvaluationPeriod = async (periodId: string) => {
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
            const docRef = await addDoc(collection(db, 'associations'), sanitizeDataForFirestore(associationData));
            await fetchData();
            return docRef.id;
        } catch (error) {
            console.error("Error adding association:", error);
            toast({ variant: 'destructive', title: "Erro ao adicionar associação" });
            return null;
        }
    };

    const deleteAssociation = async (associationId: string) => {
        try {
            await deleteDoc(doc(db, 'associations', associationId));
            await fetchData();
        } catch (error) {
            console.error("Error deleting association:", error);
            toast({ variant: 'destructive', title: "Erro ao excluir associação" });
        }
    };

    const contextValue = {
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

export const useDataContext = () => {
    const context = React.useContext(DataContext);
    if (context === undefined) {
        throw new Error('useDataContext must be used within a DataProvider');
    }
    return context;
};

    