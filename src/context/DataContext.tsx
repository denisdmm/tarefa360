
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
                // Force refetch after seeding to get the new data reflected in the UI
                await fetchData();
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
            // Even if connection fails, ensure local admin is available
            setUsersState([defaultAdminUser]);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchData();
    }, []);
    
    
    // BATCH UPDATE FUNCTIONS (For UI optimistic updates and eventual DB write)
    
    const handleSetUsers = async (newUsers: User[]) => {
        setUsersState(newUsers); // Optimistic update
        try {
            const batch = writeBatch(db);
            newUsers.forEach(user => {
                const { id, ...data } = user;
                // Ensure local-only users are not written to DB without a proper ID
                if (id !== 'user-admin-local' && !id.startsWith('user-')) { 
                    const docRef = doc(db, 'users', id);
                    batch.set(docRef, data, { merge: true });
                }
            });
            // Handle user creation
            const newDbUsers = newUsers.filter(u => !users.some(ou => ou.id === u.id));
            for(const newUser of newDbUsers) {
                const { id, ...data } = newUser;
                const docRef = await addDoc(collection(db, 'users'), data);
                // We might need to update the local state with the new ID here
                // but for now, a refetch might be simpler. Let's stick to batch for updates.
            }
             // Handle deletions
            const deletedUserIds = users.filter(u => !newUsers.some(nu => nu.id === u.id)).map(u => u.id);
            for(const userId of deletedUserIds) {
                batch.delete(doc(db, 'users', userId));
            }

            await batch.commit();
            await fetchData(); // Refetch to ensure consistency
        } catch (error) {
            console.error("Error batch updating users:", error);
            toast({ variant: 'destructive', title: "Erro ao Salvar Usuários" });
            fetchData(); // Refetch to get consistent state
        }
    };

    const handleSetActivities = async (newActivities: Activity[]) => {
        setActivitiesState(newActivities);
        try {
            const batch = writeBatch(db);
            // Updates and creations
            for(const activity of newActivities) {
                const { id, ...data } = activity;
                const docRef = doc(db, 'activities', id.startsWith('act-') ? doc(collection(db, 'activities')).id : id);
                batch.set(docRef, data, { merge: true });
            }
             // Handle deletions
            const deletedActivityIds = activities.filter(a => !newActivities.some(na => na.id === a.id)).map(a => a.id);
            for(const activityId of deletedActivityIds) {
                batch.delete(doc(db, 'activities', activityId));
            }
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
            // Updates and creations
            for(const period of newPeriods) {
                const { id, ...data } = period;
                const docRef = doc(db, 'evaluationPeriods', id.startsWith('period-') ? doc(collection(db, 'evaluationPeriods')).id : id);
                batch.set(docRef, data, { merge: true });
            }
             // Handle deletions
            const deletedPeriodIds = evaluationPeriods.filter(p => !newPeriods.some(np => np.id === p.id)).map(p => p.id);
            for(const periodId of deletedPeriodIds) {
                batch.delete(doc(db, 'evaluationPeriods', periodId));
            }
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
            // Updates and creations
            for(const assoc of newAssociations) {
                const { id, ...data } = assoc;
                const docRef = doc(db, 'associations', id.startsWith('assoc-') ? doc(collection(db, 'associations')).id : id);
                batch.set(docRef, data, { merge: true });
            }
             // Handle deletions
            const deletedAssocIds = associations.filter(a => !newAssociations.some(na => na.id === a.id)).map(a => a.id);
            for(const assocId of deletedAssocIds) {
                batch.delete(doc(db, 'associations', assocId));
            }
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
