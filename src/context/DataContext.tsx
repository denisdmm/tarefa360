
"use client";

import * as React from 'react';
import type { User, Activity, EvaluationPeriod, Association } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, addDoc, deleteDoc, updateDoc, Timestamp, writeBatch } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { users as mockUsers, activities as mockActivities, evaluationPeriods as mockEvaluationPeriods, associations as mockAssociations } from '@/lib/mock-data';


// Helper function to convert Firestore Timestamps to Dates
const convertTimestamps = (data: any) => {
    const newData: Partial<User & Activity & EvaluationPeriod> = { ...data };
    for (const key in newData) {
        if (newData[key as keyof typeof newData] instanceof Timestamp) {
            (newData as any)[key] = (newData[key as keyof typeof newData] as Timestamp).toDate();
        }
    }
    // Ensure password field is carried over if it exists
    if(data.password) {
        newData.password = data.password;
    }
    return newData;
};


interface DataContextProps {
    users: User[];
    setUsers: (users: User[]) => Promise<void>; // Simplified for optimistic updates
    addUser: (user: Omit<User, 'id'>) => Promise<void>;
    updateUser: (user: User) => Promise<void>;
    deleteUser: (userId: string) => Promise<void>;
    
    activities: Activity[];
    setActivities: (activities: Activity[]) => Promise<void>;
    addActivity: (activity: Omit<Activity, 'id'>) => Promise<void>;
    updateActivity: (activity: Activity) => Promise<void>;
    deleteActivity: (activityId: string) => Promise<void>;

    evaluationPeriods: EvaluationPeriod[];
    setEvaluationPeriods: (periods: EvaluationPeriod[]) => Promise<void>;
    addEvaluationPeriod: (period: Omit<EvaluationPeriod, 'id'>) => Promise<void>;
    updateEvaluationPeriod: (period: EvaluationPeriod) => Promise<void>;


    associations: Association[];
    setAssociations: (associations: Association[]) => Promise<void>;
    addAssociation: (association: Omit<Association, 'id'>) => Promise<void>;
    deleteAssociation: (associationId: string) => Promise<void>;

    loggedInUser: User | null;
    setLoggedInUser: React.Dispatch<React.SetStateAction<User | null>>;
    loading: boolean;
}

const DataContext = React.createContext<DataContextProps | undefined>(undefined);

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
    const [users, setUsersState] = React.useState<User[]>([]);
    const [activities, setActivitiesState] = React.useState<Activity[]>([]);
    const [evaluationPeriods, setEvaluationPeriodsState] = React.useState<EvaluationPeriod[]>([]);
    const [associations, setAssociationsState] = React.useState<Association[]>([]);
    const [loggedInUser, setLoggedInUser] = React.useState<User | null>(null);
    const [loading, setLoading] = React.useState(false);
    const { toast } = useToast();

    const seedDatabase = async () => {
        console.log("Firestore is empty, seeding database with mock data...");
        const batch = writeBatch(db);

        // Seed Users
        mockUsers.forEach(user => {
            const { id, ...userData } = user;
            const docRef = doc(db, "users", id);
            // Ensure password is included when seeding
            batch.set(docRef, { ...userData, password: user.password });
        });
        
        // Seed Activities
        mockActivities.forEach(activity => {
             const { id, ...activityData } = activity;
            const docRef = doc(db, "activities", id);
            batch.set(docRef, activityData);
        });
        
        // Seed Associations
        mockAssociations.forEach(association => {
             const { id, ...assocData } = association;
            const docRef = doc(db, "associations", id);
            batch.set(docRef, assocData);
        });

        // Seed Evaluation Periods
        mockEvaluationPeriods.forEach(period => {
            const { id, ...periodData } = period;
            const docRef = doc(db, "evaluationPeriods", id);
            batch.set(docRef, periodData);
        });

        await batch.commit();
        console.log("Database seeded successfully.");
        toast({ title: "Banco de Dados Populado", description: "Os dados de exemplo foram carregados no Firestore." });
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            // Check if seeding is needed
            const usersSnapshot = await getDocs(collection(db, "users"));
            if (usersSnapshot.empty) {
                await seedDatabase();
            }

            // Fetch all data again after potential seeding
            const [
                refetchedUsersSnapshot, 
                activitiesSnapshot, 
                periodsSnapshot, 
                associationsSnapshot
            ] = await Promise.all([
                getDocs(collection(db, "users")),
                getDocs(collection(db, "activities")),
                getDocs(collection(db, "evaluationPeriods")),
                getDocs(collection(db, "associations"))
            ]);
            
            const usersList = refetchedUsersSnapshot.docs.map(doc => ({ id: doc.id, ...convertTimestamps(doc.data()) } as User));
            setUsersState(usersList);
            
            const activitiesList = activitiesSnapshot.docs.map(doc => ({ id: doc.id, ...convertTimestamps(doc.data()) } as Activity));
            setActivitiesState(activitiesList);

            const periodsList = periodsSnapshot.docs.map(doc => ({ id: doc.id, ...convertTimestamps(doc.data()) } as EvaluationPeriod));
            setEvaluationPeriodsState(periodsList);
            
            const associationsList = associationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Association));
            setAssociationsState(associationsList);

        } catch (error: any) {
            console.error("Error fetching or seeding data from Firestore: ", error);
            toast({ variant: 'destructive', title: "Erro de Conexão", description: "Não foi possível carregar ou popular os dados." });
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        // Fetch data only if users list is empty
        if (users.length === 0) {
            fetchData();
        }
    }, []);
    
    // --- USERS ---
    const addUser = async (userData: Omit<User, 'id'>) => {
        try {
            const docRef = await addDoc(collection(db, "users"), userData);
            setUsersState(prev => [...prev, { id: docRef.id, ...userData }]);
        } catch (e) { console.error("Error adding user: ", e); }
    };
    const updateUser = async (user: User) => {
        const { id, ...userData } = user;
        try {
            await setDoc(doc(db, "users", id), userData, { merge: true });
            setUsersState(prev => prev.map(u => u.id === id ? user : u));
        } catch (e) { console.error("Error updating user: ", e); }
    };
    const deleteUser = async (userId: string) => {
        try {
            await deleteDoc(doc(db, "users", userId));
            setUsersState(prev => prev.filter(u => u.id !== userId));
        } catch(e) { console.error("Error deleting user: ", e); }
    };

    // --- ACTIVITIES ---
     const addActivity = async (activityData: Omit<Activity, 'id'>) => {
        try {
            const docRef = await addDoc(collection(db, "activities"), activityData);
            setActivitiesState(prev => [...prev, { id: docRef.id, ...activityData }]);
        } catch (e) { console.error("Error adding activity: ", e); }
    };
    const updateActivity = async (activity: Activity) => {
        const { id, ...activityData } = activity;
        try {
            await setDoc(doc(db, "activities", id), activityData, { merge: true });
            setActivitiesState(prev => prev.map(a => a.id === id ? activity : a));
        } catch (e) { console.error("Error updating activity: ", e); }
    };
    const deleteActivity = async (activityId: string) => {
         try {
            await deleteDoc(doc(db, "activities", activityId));
            setActivitiesState(prev => prev.filter(a => a.id !== activityId));
        } catch(e) { console.error("Error deleting activity: ", e); }
    };


    // --- EVALUATION PERIODS ---
    const addEvaluationPeriod = async (periodData: Omit<EvaluationPeriod, 'id'>) => {
        try {
            const docRef = await addDoc(collection(db, "evaluationPeriods"), periodData);
            setEvaluationPeriodsState(prev => [...prev, { id: docRef.id, ...periodData }]);
        } catch (e) { console.error("Error adding period: ", e); }
    };
    const updateEvaluationPeriod = async (period: EvaluationPeriod) => {
        const { id, ...periodData } = period;
        try {
            await setDoc(doc(db, "evaluationPeriods", id), periodData, { merge: true });
            setEvaluationPeriodsState(prev => prev.map(p => p.id === id ? period : p));
        } catch (e) { console.error("Error updating period: ", e); }
    };

    // --- ASSOCIATIONS ---
    const addAssociation = async (associationData: Omit<Association, 'id'>) => {
         try {
            const docRef = await addDoc(collection(db, "associations"), associationData);
            setAssociationsState(prev => [...prev, { id: docRef.id, ...associationData }]);
        } catch (e) { console.error("Error adding association: ", e); }
    };
     const deleteAssociation = async (associationId: string) => {
         try {
            await deleteDoc(doc(db, "associations", associationId));
            setAssociationsState(prev => prev.filter(a => a.id !== associationId));
        } catch(e) { console.error("Error deleting association: ", e); }
    };


    const contextValue = {
        users,
        setUsers: async (users: User[]) => { 
            setUsersState(users);
            // This function is now more for optimistic UI updates.
            // The individual functions below handle Firestore writes.
        },
        addUser, updateUser, deleteUser,
        
        activities,
        setActivities: async (activities: Activity[]) => { setActivitiesState(activities); },
        addActivity, updateActivity, deleteActivity,

        evaluationPeriods,
        setEvaluationPeriods: async (periods: EvaluationPeriod[]) => { setEvaluationPeriodsState(periods); },
        addEvaluationPeriod, updateEvaluationPeriod,
        
        associations,
        setAssociations: async (associations: Association[]) => { setAssociationsState(associations); },
        addAssociation, deleteAssociation,

        loggedInUser,
        setLoggedInUser,
        loading,
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
