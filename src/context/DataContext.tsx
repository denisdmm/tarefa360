
"use client";

import * as React from 'react';
import type { User, Activity, EvaluationPeriod, Association } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, addDoc, deleteDoc, updateDoc, Timestamp, query, where, writeBatch } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { mockUsers, mockEvaluationPeriods, mockActivitiesData, mockAssociationsData } from '@/lib/mock-data';

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
    seedDatabase: () => Promise<void>;
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
            toast({ variant: 'destructive', title: "Erro de Conexão", description: "Não foi possível carregar os dados. Algumas funcionalidades podem estar indisponíveis." });
            setConnectionError(true);
        } finally {
            setLoading(false);
        }
    }, [toast]);
    
    React.useEffect(() => {
        fetchData();
    }, [fetchData]);

    const seedDatabase = async () => {
        const batch = writeBatch(db);

        // Clear existing data
        const collections = ["users", "activities", "evaluationPeriods", "associations"];
        for (const coll of collections) {
            const snapshot = await getDocs(collection(db, coll));
            snapshot.docs.forEach(doc => batch.delete(doc.ref));
        }
        await batch.commit(); // Commit the deletions first

        // Start a new batch for additions
        const addBatch = writeBatch(db);

        // Add users and create a CPF-to-ID map
        const cpfToIdMap: Record<string, string> = {};
        for (const userData of mockUsers) {
            const userRef = doc(collection(db, "users"));
            addBatch.set(userRef, userData);
            cpfToIdMap[userData.cpf] = userRef.id;
        }

        // Add evaluation periods
        mockEvaluationPeriods.forEach(periodData => {
            const periodRef = doc(collection(db, "evaluationPeriods"));
            addBatch.set(periodRef, periodData);
        });

        // Add activities using the CPF-to-ID map
        mockActivitiesData.forEach(({ userCpf, activity }) => {
            const userId = cpfToIdMap[userCpf];
            if (userId) {
                const activityRef = doc(collection(db, "activities"));
                addBatch.set(activityRef, { ...activity, userId });
            }
        });

        // Add associations using the CPF-to-ID map
        mockAssociationsData.forEach(({ appraiseeCpf, appraiserCpf }) => {
            const appraiseeId = cpfToIdMap[appraiseeCpf];
            const appraiserId = cpfToIdMap[appraiserCpf];
            if (appraiseeId && appraiserId) {
                const assocRef = doc(collection(db, "associations"));
                addBatch.set(assocRef, { appraiseeId, appraiserId });
            }
        });

        // Commit all additions
        await addBatch.commit();
        
        // Fetch the new data
        await fetchData();
    };

    // --- CRUD Functions ---

    // USERS
    const addUser = async (userData: Omit<User, 'id'>): Promise<string | null> => {
        try {
            const docRef = await addDoc(collection(db, 'users'), userData);
            const newUser = { id: docRef.id, ...userData };
            setUsersState(prev => [...prev, newUser as User]);
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
            setUsersState(prev => prev.map(u => u.id === userId ? { ...u, ...userData } : u));
            if (loggedInUser?.id === userId) {
                setLoggedInUser(prev => prev ? { ...prev, ...userData } : null);
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
            const newActivity = { id: docRef.id, ...activityData };
            setActivitiesState(prev => [...prev, newActivity as Activity]);
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
            setActivitiesState(prev => prev.map(a => a.id === activityId ? { ...a, ...activityData } : a));
        } catch (error) {
            console.error("Error updating activity:", error);
            toast({ variant: 'destructive', title: "Erro ao atualizar atividade" });
        }
    };
    
    const deleteActivity = async (activityId: string): Promise<void> => {
        try {
            await deleteDoc(doc(db, 'activities', activityId));
            setActivitiesState(prev => prev.filter(a => a.id !== activityId));
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
            const newPeriod = { id: docRef.id, ...periodData };
            setEvaluationPeriodsState(prev => [...prev, newPeriod as EvaluationPeriod].sort((a,b) => new Date(b.startDate as any).getTime() - new Date(a.startDate as any).getTime()));
            return docRef.id;
        } catch (error) {
            console.error("Error adding period:", error);
            toast({ variant: 'destructive', title: "Erro ao adicionar período" });
            return null;
        }
    };

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
            setEvaluationPeriodsState(prev => prev.map(p => p.id === periodId ? { ...p, ...periodData } : p));
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
            const newAssociation = { id: docRef.id, ...associationData };
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
        associations,
        addAssociation,
        deleteAssociation,
        loggedInUser,
        setLoggedInUser,
        loading,
        connectionError,
        fetchData,
        seedDatabase,
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
