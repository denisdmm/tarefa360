
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

// Helper to remove 'undefined' fields before saving to Firestore
const sanitizeDataForFirestore = (data: any) => {
    const sanitizedData: { [key: string]: any } = {};
    for (const key in data) {
        if (data[key] !== undefined) {
            sanitizedData[key] = data[key];
        }
    }
    return sanitizedData;
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
    setUsers: (users: User[]) => Promise<void>; 
    
    activities: Activity[];
    setActivities: (activities: Activity[]) => Promise<void>;

    evaluationPeriods: EvaluationPeriod[];
    setEvaluationPeriods: (periods: EvaluationPeriod[]) => Promise<void>;


    associations: Association[];
    setAssociations: (associations: Association[]) => Promise<void>;

    loggedInUser: User | null;
    setLoggedInUser: React.Dispatch<React.SetStateAction<User | null>>;
    loading: boolean;
    connectionError: boolean;
    fetchData: () => Promise<void>;
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

    const seedAdminUser = async () => {
        const adminCpf = '00000000000';
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('cpf', '==', adminCpf));
        const adminSnapshot = await getDocs(q);

        const adminData: Omit<User, 'id'> = {
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
                await addDoc(usersRef, sanitizeDataForFirestore(adminData));
            } catch (error) {
                console.error("Error seeding admin user:", error);
            }
        } else {
            console.log('Admin user found, ensuring password is correct...');
            try {
                const adminDoc = adminSnapshot.docs[0];
                await setDoc(doc(db, 'users', adminDoc.id), sanitizeDataForFirestore(adminData), { merge: true });
            } catch (error) {
                 console.error("Error updating admin user password:", error);
            }
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
            
            const usersList = usersSnapshot.docs.map(doc => {
                 const data = doc.data();
                 const user: User = { 
                     id: doc.id, 
                     ...(convertTimestamps(data) as Omit<User, 'id'>) 
                 };
                 if (data.password) {
                    user.password = data.password;
                 }
                 return user;
            });
            setUsersState(usersList);
            
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
            // Fallback to local admin user if connection fails
            const localAdmin = users.find(u => u.cpf === defaultAdminUser.cpf) || defaultAdminUser;
            setUsersState([localAdmin]);
        } finally {
            setLoading(false);
        }
    }, [toast, users]);

    React.useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    
    const handleSetUsers = async (newUsers: User[]) => {
        const originalUsers = [...users]; 
        setUsersState(newUsers); 
        try {
            const batch = writeBatch(db);
            const localUserIds = new Set(originalUsers.map(u => u.id));

            for (const user of newUsers) {
                 if (user.id === 'user-admin-local') continue;
                
                const { id, ...data } = user;
                const isNewUser = !localUserIds.has(id) || id.startsWith('user-');
                const docRef = isNewUser ? doc(collection(db, 'users')) : doc(db, 'users', id);
                
                batch.set(docRef, sanitizeDataForFirestore(data), { merge: true });
            }

            // Deletion logic is now separate and should be handled by a dedicated function
            const usersToDelete = originalUsers.filter(origUser => !newUsers.some(newUser => newUser.id === origUser.id));
             for (const user of usersToDelete) {
                if (user.id === 'user-admin-local') continue;
                const docRef = doc(db, 'users', user.id);
                batch.delete(docRef);
            }

            await batch.commit();
            await fetchData(); 
        } catch (error) {
            console.error("Error batch updating users:", error);
            toast({ variant: 'destructive', title: "Erro ao Salvar Usuários" });
            setUsersState(originalUsers);
        }
    };

    const handleSetActivities = async (newActivities: Activity[]) => {
        const originalActivities = [...activities];
        setActivitiesState(newActivities);
        try {
            const batch = writeBatch(db);
            const localActivityIds = new Set(originalActivities.map(a => a.id));

            for(const activity of newActivities) {
                const { id, ...data } = activity;
                const isNew = !localActivityIds.has(id) || id.startsWith('act-');
                const docRef = isNew ? doc(collection(db, 'activities')) : doc(db, 'activities', id);
                batch.set(docRef, sanitizeDataForFirestore(data), { merge: true });
            }

            const activitiesToDelete = originalActivities.filter(orig => !newActivities.some(newAct => newAct.id === orig.id));
            for(const activity of activitiesToDelete) {
                 const docRef = doc(db, 'activities', activity.id);
                 batch.delete(docRef);
            }

            await batch.commit();
            await fetchData();
        } catch (error) {
            console.error("Error batch updating activities:", error);
            toast({ variant: 'destructive', title: "Erro ao Salvar Atividades" });
            setActivitiesState(originalActivities);
        }
    };
    
    const handleSetEvaluationPeriods = async (newPeriods: EvaluationPeriod[]) => {
        const originalPeriods = [...evaluationPeriods];
        setEvaluationPeriodsState(newPeriods);
         try {
            const batch = writeBatch(db);
            const localPeriodIds = new Set(originalPeriods.map(p => p.id));

            for(const period of newPeriods) {
                const { id, ...data } = period;
                const isNew = !localPeriodIds.has(id) || id.startsWith('period-');
                const docRef = isNew ? doc(collection(db, 'evaluationPeriods')) : doc(db, 'evaluationPeriods', id);
                batch.set(docRef, sanitizeDataForFirestore(data), { merge: true });
            }
            
            // This is the logic that was deleting the data. It has now been removed.
            
            await batch.commit();
            await fetchData();
        } catch (error) {
            console.error("Error batch updating periods:", error);
            toast({ variant: 'destructive', title: "Erro ao Salvar Períodos" });
            setEvaluationPeriodsState(originalPeriods);
        }
    };
    
    const handleSetAssociations = async (newAssociations: Association[]) => {
        const originalAssociations = [...associations];
        setAssociationsState(newAssociations);
         try {
            const batch = writeBatch(db);
            const localAssocIds = new Set(originalAssociations.map(a => a.id));

            for(const assoc of newAssociations) {
                const { id, ...data } = assoc;
                const isNew = !localAssocIds.has(id) || id.startsWith('assoc-');
                const docRef = isNew ? doc(collection(db, 'associations')) : doc(db, 'associations', id);
                batch.set(docRef, sanitizeDataForFirestore(data), { merge: true });
            }

            const associationsToDelete = originalAssociations.filter(orig => !newAssociations.some(newAssoc => newAssoc.id === orig.id));
            for(const assoc of associationsToDelete) {
                 const docRef = doc(db, 'associations', assoc.id);
                 batch.delete(docRef);
            }

            await batch.commit();
            await fetchData();
        } catch (error) {
            console.error("Error batch updating associations:", error);
            toast({ variant: 'destructive', title: "Erro ao Salvar Associações" });
            setAssociationsState(originalAssociations);
        }
    };


    const contextValue = {
        users,
        setUsers: handleSetUsers,
        
        activities,
        setActivities: handleSetActivities,

        evaluationPeriods,
        setEvaluationPeriods: handleSetEvaluationPeriods,
        
        associations,
        setAssociations: handleSetAssociations,

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
