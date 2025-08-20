
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
    }, [fetchData, setLoggedInUser]);
    
    
    const handleSetUsers = async (newUsers: User[]) => {
        setUsersState(newUsers); 
        try {
            const batch = writeBatch(db);
            const existingUserIds = new Set(users.map(u => u.id));

            for (const user of newUsers) {
                if (user.id === 'user-admin-local') continue; // Skip seeding user from local state

                const { id, ...data } = user;
                const docRef = id.startsWith('user-') ? doc(collection(db, 'users')) : doc(db, 'users', id);

                batch.set(docRef, sanitizeDataForFirestore(data), { merge: true });
                existingUserIds.delete(id);
            }

             // Delete users that are no longer in the list
            existingUserIds.forEach(idToDelete => {
                if (idToDelete !== 'user-admin-local') {
                    batch.delete(doc(db, 'users', idToDelete));
                }
            });

            await batch.commit();
            await fetchData(); 
        } catch (error) {
            console.error("Error batch updating users:", error);
            toast({ variant: 'destructive', title: "Erro ao Salvar Usuários" });
            fetchData();
        }
    };

    const handleSetActivities = async (newActivities: Activity[]) => {
        setActivitiesState(newActivities);
        try {
            const batch = writeBatch(db);
            const existingActivityIds = new Set(activities.map(a => a.id));

            for(const activity of newActivities) {
                const { id, ...data } = activity;
                const docRef = id.startsWith('act-') ? doc(collection(db, 'activities')) : doc(db, 'activities', id);
                batch.set(docRef, sanitizeDataForFirestore(data), { merge: true });
                existingActivityIds.delete(id);
            }

            existingActivityIds.forEach(idToDelete => {
                 batch.delete(doc(db, 'activities', idToDelete));
            });

            await batch.commit();
            await fetchData();
        } catch (error) {
            console.error("Error batch updating activities:", error);
            toast({ variant: 'destructive', title: "Erro ao Salvar Atividades" });
            fetchData();
        }
    };
    
    const handleSetEvaluationPeriods = async (newPeriods: EvaluationPeriod[]) => {
        setEvaluationPeriodsState(newPeriods);
         try {
            const batch = writeBatch(db);
            const existingPeriodIds = new Set(evaluationPeriods.map(p => p.id));

            for(const period of newPeriods) {
                const { id, ...data } = period;
                const docRef = id.startsWith('period-') ? doc(collection(db, 'evaluationPeriods')) : doc(db, 'evaluationPeriods', id);
                batch.set(docRef, sanitizeDataForFirestore(data), { merge: true });
                existingPeriodIds.delete(id);
            }

            existingPeriodIds.forEach(idToDelete => {
                 batch.delete(doc(db, 'evaluationPeriods', idToDelete));
            });

            await batch.commit();
            await fetchData();
        } catch (error) {
            console.error("Error batch updating periods:", error);
            toast({ variant: 'destructive', title: "Erro ao Salvar Períodos" });
            fetchData();
        }
    };
    
    const handleSetAssociations = async (newAssociations: Association[]) => {
        setAssociationsState(newAssociations);
         try {
            const batch = writeBatch(db);
            const existingAssocIds = new Set(associations.map(a => a.id));

            for(const assoc of newAssociations) {
                const { id, ...data } = assoc;
                const docRef = id.startsWith('assoc-') ? doc(collection(db, 'associations')) : doc(db, 'associations', id);
                batch.set(docRef, sanitizeDataForFirestore(data), { merge: true });
                existingAssocIds.delete(id);
            }

            existingAssocIds.forEach(idToDelete => {
                 batch.delete(doc(db, 'associations', idToDelete));
            });

            await batch.commit();
            await fetchData();
        } catch (error) {
            console.error("Error batch updating associations:", error);
            toast({ variant: 'destructive', title: "Erro ao Salvar Associações" });
            fetchData();
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
