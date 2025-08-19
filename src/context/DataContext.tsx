
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
    
    const seedEvaluationPeriods = async () => {
        const currentYear = new Date().getFullYear();
        const periodName = `FAG+${currentYear}`;
        
        const periodsRef = collection(db, "evaluationPeriods");
        const allPeriodsSnapshot = await getDocs(periodsRef);
        const existingPeriods = allPeriodsSnapshot.docs.map(d => d.data() as EvaluationPeriod);

        const currentPeriodExists = existingPeriods.some(p => p.name === periodName);

        if (!currentPeriodExists) {
            console.log(`Evaluation period for ${periodName} not found. Seeding...`);
            try {
                const batch = writeBatch(db);

                // Deactivate all existing periods
                allPeriodsSnapshot.forEach(pDoc => {
                    const periodData = pDoc.data();
                    if (periodData.status === 'Ativo') {
                        const periodRef = doc(db, 'evaluationPeriods', pDoc.id);
                        batch.update(periodRef, { status: 'Inativo' });
                    }
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
                toast({
                    title: "Período de Avaliação Criado",
                    description: `O período '${periodName}' foi criado e ativado para o ano corrente.`,
                });
                
                // Force a refetch to get the latest data including the new period
                return true; // Indicate that a change was made

            } catch (error) {
                console.error("Error seeding evaluation periods:", error);
                toast({
                    variant: "destructive",
                    title: "Falha ao Criar Período",
                    description: "Não foi possível criar o período de avaliação automaticamente."
                });
            }
        }
        return false; // No change was made
    };

    const fetchData = async () => {
        setLoading(true);
        setConnectionError(false);
        try {
            await seedAdminUser(); 
            const wasPeriodCreated = await seedEvaluationPeriods();
            
            // If a new period was created, we must refetch to get the updated list
            if (wasPeriodCreated) {
                await fetchData();
                return; // Exit current execution to avoid race conditions
            }


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
            
            const associationsList = associationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Association));
            setAssociationsState(associationsList);

        } catch (error) {
            console.error("Error fetching data from Firestore: ", error);
            toast({ variant: 'destructive', title: "Erro de Conexão", description: "Não foi possível carregar os dados. Algumas funcionalidades podem estar indisponíveis." });
            setConnectionError(true);
            // Fallback to local admin user if connection fails
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
            const existingUserIds = new Set(users.map(u => u.id));

            for (const user of newUsers) {
                const { id, ...data } = user;
                let docRef;

                if (id && (id.startsWith('user-') && id !== 'user-admin-local')) {
                     // It's a new user, create a new doc ref
                    docRef = doc(collection(db, 'users'));
                } else if (id !== 'user-admin-local') {
                    // It's an existing user
                    docRef = doc(db, 'users', id);
                } else {
                    continue; // Skip local admin user
                }

                batch.set(docRef, data, { merge: true });
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
                batch.set(docRef, data, { merge: true });
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
                batch.set(docRef, data, { merge: true });
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
                batch.set(docRef, data, { merge: true });
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

    