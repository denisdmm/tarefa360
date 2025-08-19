
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
                await addDoc(usersRef, adminData);
            } catch (error) {
                console.error("Error seeding admin user:", error);
            }
        } else {
            console.log('Admin user found, ensuring password is correct...');
            try {
                const adminDoc = adminSnapshot.docs[0];
                await setDoc(doc(db, 'users', adminDoc.id), adminData, { merge: true });
            } catch (error) {
                 console.error("Error updating admin user password:", error);
            }
        }
    };
    
    const seedEvaluationPeriods = async (existingPeriods: EvaluationPeriod[]) => {
        const currentYear = new Date().getFullYear();
        const periodName = `Avaliação Anual ${currentYear}`;

        const currentPeriodExists = existingPeriods.some(p => p.name === periodName);

        if (!currentPeriodExists) {
            console.log(`Evaluation period for ${currentYear} not found. Seeding...`);
            try {
                const batch = writeBatch(db);

                // Deactivate all existing periods
                existingPeriods.forEach(p => {
                    const periodRef = doc(db, 'evaluationPeriods', p.id);
                    batch.update(periodRef, { status: 'Inativo' });
                });

                // Create the new active period
                const newPeriodData: Omit<EvaluationPeriod, 'id'> = {
                    name: periodName,
                    startDate: new Date(currentYear - 1, 10, 1), // November 1st of previous year
                    endDate: new Date(currentYear, 9, 31),     // October 31st of current year
                    status: 'Ativo',
                };
                const newPeriodRef = doc(collection(db, 'evaluationPeriods'));
                batch.set(newPeriodRef, newPeriodData);
                
                await batch.commit();
                console.log(`Default evaluation period '${periodName}' seeded and activated.`);
                
                // Force a refetch to get the latest data including the new period
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
            const remoteUsers = usersList.filter(u => u.cpf !== defaultAdminUser.cpf);
            const adminUserFromDb = usersList.find(u => u.cpf === defaultAdminUser.cpf);
            setUsersState([ ...remoteUsers, adminUserFromDb || defaultAdminUser ]);
            
            const activitiesList = activitiesSnapshot.docs.map(doc => ({ id: doc.id, ...convertTimestamps(doc.data()) } as Activity));
            setActivitiesState(activitiesList);

            const periodsList = periodsSnapshot.docs.map(doc => ({ id: doc.id, ...convertTimestamps(doc.data()) } as EvaluationPeriod));
            setEvaluationPeriodsState(periodsList);
            
            await seedEvaluationPeriods(periodsList);
            
            const associationsList = associationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Association));
            setAssociationsState(associationsList);

        } catch (error) {
            console.error("Error fetching data from Firestore: ", error);
            toast({ variant: 'destructive', title: "Erro de Conexão", description: "Não foi possível carregar os dados. Algumas funcionalidades podem estar indisponíveis." });
            setConnectionError(true);
            setUsersState([defaultAdminUser]);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchData();
    }, []);
    
    
    const handleSetUsers = async (newUsers: User[]) => {
        setUsersState(newUsers); 
        try {
            const batch = writeBatch(db);
            newUsers.forEach(user => {
                const { id, ...data } = user;
                if (id !== 'user-admin-local' && !id.startsWith('user-')) { 
                    const docRef = doc(db, 'users', id);
                    batch.set(docRef, data, { merge: true });
                }
            });
            const newDbUsers = newUsers.filter(u => !users.some(ou => ou.id === u.id));
            for(const newUser of newDbUsers) {
                const { id, ...data } = newUser;
                await addDoc(collection(db, 'users'), data);
            }
            const deletedUserIds = users.filter(u => !newUsers.some(nu => nu.id === u.id)).map(u => u.id);
            for(const userId of deletedUserIds) {
                batch.delete(doc(db, 'users', userId));
            }

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
            for(const activity of newActivities) {
                const { id, ...data } = activity;
                const docRef = doc(db, 'activities', id.startsWith('act-') ? doc(collection(db, 'activities')).id : id);
                batch.set(docRef, data, { merge: true });
            }
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
            for(const period of newPeriods) {
                const { id, ...data } = period;
                const docRef = doc(db, 'evaluationPeriods', id.startsWith('period-') ? doc(collection(db, 'evaluationPeriods')).id : id);
                batch.set(docRef, data, { merge: true });
            }
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
            for(const assoc of newAssociations) {
                const { id, ...data } = assoc;
                const docRef = doc(db, 'associations', id.startsWith('assoc-') ? doc(collection(db, 'associations')).id : id);
                batch.set(docRef, data, { merge: true });
            }
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

    