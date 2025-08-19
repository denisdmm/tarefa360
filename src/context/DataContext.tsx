
"use client";

import * as React from 'react';
import type { User, Activity, EvaluationPeriod, Association } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, addDoc, deleteDoc, updateDoc, Timestamp, writeBatch, query, where } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

// Helper function to convert Firestore Timestamps to Dates
const convertTimestamps = (data: any) => {
    const newData: Partial<User & Activity & EvaluationPeriod & { password?: string }> = { ...data };
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

const defaultAdminUser: User = {
    id: 'user-admin-local',
    name: 'Usuário Admin',
    nomeDeGuerra: 'Admin',
    email: 'admin@tarefa360.com',
    role: 'admin',
    jobTitle: 'Administrador do Sistema',
    sector: 'TI',
    avatarUrl: 'https://placehold.co/100x100',
    cpf: '00000000000',
    postoGrad: 'Cel',
    status: 'Ativo',
    password: '1234',
    forcePasswordChange: false,
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
    connectionError: boolean;
}

const DataContext = React.createContext<DataContextProps | undefined>(undefined);

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
    const [users, setUsersState] = React.useState<User[]>([defaultAdminUser]);
    const [activities, setActivitiesState] = React.useState<Activity[]>([]);
    const [evaluationPeriods, setEvaluationPeriodsState] = React.useState<EvaluationPeriod[]>([]);
    const [associations, setAssociationsState] = React.useState<Association[]>([]);
    const [loggedInUser, setLoggedInUser] = React.useState<User | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [connectionError, setConnectionError] = React.useState(false);
    const { toast } = useToast();

    // Helper function to create or update the admin user to ensure correct password
    const seedAdminUser = async () => {
        const adminCpf = '00000000000';
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('cpf', '==', adminCpf));
        const adminSnapshot = await getDocs(q);

        const adminData: Omit<User, 'id'> & {password: string} = {
            name: 'Usuário Admin',
            nomeDeGuerra: 'Admin',
            email: 'admin@tarefa360.com',
            role: 'admin',
            jobTitle: 'Administrador do Sistema',
            sector: 'TI',
            avatarUrl: 'https://placehold.co/100x100',
            cpf: adminCpf,
            postoGrad: 'Cel',
            status: 'Ativo',
            password: '1234',
            forcePasswordChange: false,
        };

        if (adminSnapshot.empty) {
            console.log('Admin user not found, seeding...');
            try {
                await addDoc(usersRef, adminData);
            } catch (error) {
                console.error("Error seeding admin user:", error);
            }
        } else {
            console.log('Admin user found, ensuring password is correct...');
            try {
                const adminDoc = adminSnapshot.docs[0];
                // Force update password to ensure it's correct
                await setDoc(doc(db, 'users', adminDoc.id), adminData, { merge: true });
            } catch (error) {
                 console.error("Error updating admin user password:", error);
            }
        }
    };
    
    const seedEvaluationPeriods = async () => {
        const periodsRef = collection(db, 'evaluationPeriods');
        const currentYear = new Date().getFullYear();
        const periodName = `Avaliação Anual ${currentYear}`;
        
        const q = query(periodsRef, where('name', '==', periodName));
        const periodSnapshot = await getDocs(q);

        if (periodSnapshot.empty) {
            console.log(`Evaluation period for ${currentYear} not found, seeding...`);
            try {
                // Deactivate all other periods before creating a new active one
                const allPeriodsSnapshot = await getDocs(periodsRef);
                const batch = writeBatch(db);
                allPeriodsSnapshot.forEach(pDoc => {
                    const periodDocRef = doc(db, 'evaluationPeriods', pDoc.id);
                    batch.update(periodDocRef, { status: 'Inativo' });
                });
                await batch.commit();

                const newPeriod: Omit<EvaluationPeriod, 'id'> = {
                    name: periodName,
                    startDate: new Date(currentYear - 1, 10, 1), // November 1st of previous year
                    endDate: new Date(currentYear, 9, 31),     // October 31st of current year
                    status: 'Ativo',
                };
                await addDoc(periodsRef, newPeriod);
                console.log(`Default evaluation period '${periodName}' seeded.`);
            } catch (error) {
                console.error("Error seeding evaluation periods:", error);
            }
        }
    };


    const fetchData = async () => {
        setLoading(true);
        setConnectionError(false);
        try {
            await seedAdminUser(); // Ensure admin exists and password is correct
            await seedEvaluationPeriods(); // Ensure default periods exist

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
            
            const usersList = usersSnapshot.docs.map(doc => {
                 const data = doc.data();
                 const user: User = { 
                     id: doc.id, 
                     ...(convertTimestamps(data) as Omit<User, 'id'>) 
                 };
                 // Explicitly include password if it exists in the source data
                 if (data.password) {
                    user.password = data.password;
                 }
                 return user;
            });
            // Merge with local admin, preventing duplicates
            const remoteUsers = usersList.filter(u => u.cpf !== defaultAdminUser.cpf);
            const adminUserFromDb = usersList.find(u => u.cpf === defaultAdminUser.cpf);
            setUsersState([ ...remoteUsers, adminUserFromDb || defaultAdminUser ]);
            
            const activitiesList = activitiesSnapshot.docs.map(doc => ({ id: doc.id, ...convertTimestamps(doc.data()) } as Activity));
            setActivitiesState(activitiesList);

            const periodsList = periodsSnapshot.docs.map(doc => ({ id: doc.id, ...convertTimestamps(doc.data()) } as EvaluationPeriod));
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
    };

    React.useEffect(() => {
        fetchData();
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
            const batch = writeBatch(db);
            users.forEach(user => {
                const { id, ...data } = user;
                const docRef = doc(db, 'users', id);
                batch.set(docRef, data, { merge: true });
            });
            await batch.commit();
            setUsersState(users);
        },
        addUser, updateUser, deleteUser,
        
        activities,
        setActivities: async (activities: Activity[]) => { 
             const batch = writeBatch(db);
            activities.forEach(activity => {
                const { id, ...data } = activity;
                const docRef = doc(db, 'activities', id);
                batch.set(docRef, data, { merge: true });
            });
            await batch.commit();
            setActivitiesState(activities);
        },
        addActivity, updateActivity, deleteActivity,

        evaluationPeriods,
        setEvaluationPeriods: async (periods: EvaluationPeriod[]) => { 
            const batch = writeBatch(db);
            periods.forEach(period => {
                const { id, ...data } = period;
                const docRef = doc(db, 'evaluationPeriods', id);
                batch.set(docRef, data, { merge: true });
            });
            await batch.commit();
            setEvaluationPeriodsState(periods);
        },
        addEvaluationPeriod, updateEvaluationPeriod,
        
        associations,
        setAssociations: async (associations: Association[]) => { 
            const batch = writeBatch(db);
            associations.forEach(assoc => {
                const { id, ...data } = assoc;
                const docRef = doc(db, 'associations', id);
                batch.set(docRef, data, { merge: true });
            });
            await batch.commit();
            setAssociationsState(associations);
        },
        addAssociation, deleteAssociation,

        loggedInUser,
        setLoggedInUser,
        loading,
        connectionError,
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
