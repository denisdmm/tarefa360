
"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useDataContext } from "@/context/DataContext";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eye, FileText } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { User } from "@/lib/types";

// In a real app, this would come from an auth context.
const FAKE_LOGGED_IN_APPRAISER_ID = 'user-appraiser-1';

export default function AppraiserReports() {
  const router = useRouter();
  const { users, evaluationPeriods, associations } = useDataContext();
  const [appraiser, setAppraiser] = React.useState<User | null>(null);
  const [appraisees, setAppraisees] = React.useState<User[]>([]);

  React.useEffect(() => {
    const foundAppraiser = users.find(u => u.id === FAKE_LOGGED_IN_APPRAISER_ID);
    setAppraiser(foundAppraiser || null);

    if (foundAppraiser) {
        const myAppraiseeIds = associations
            .filter(assoc => assoc.appraiserId === foundAppraiser.id)
            .map(assoc => assoc.appraiseeId);
        
        const foundAppraisees = users.filter(u => myAppraiseeIds.includes(u.id));
        setAppraisees(foundAppraisees);
    }
  }, [users, associations]);
  
  const handleViewOwnReport = () => {
    // Appraiser views their own report, so they are the appraisee in this context
    if(appraiser) {
        router.push(`/appraiser/appraisee/${appraiser.id}`);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <header className="bg-card border-b p-4">
        <h1 className="text-3xl font-bold font-headline">Relatórios Gerenciais</h1>
        <p className="text-muted-foreground">
          Visualize ou imprima relatórios de avaliação.
        </p>
      </header>
      <main className="flex-1 p-4 md:p-6 overflow-auto">
        <Tabs defaultValue="appraisees">
          <TabsList className="mb-4">
            <TabsTrigger value="appraisees">Relatórios dos Avaliados</TabsTrigger>
            <TabsTrigger value="my-reports">Meus Relatórios</TabsTrigger>
          </TabsList>

          <TabsContent value="appraisees">
            <Card>
              <CardHeader>
                <CardTitle>Avaliados</CardTitle>
                <CardDescription>
                  Selecione um avaliado para ver seu relatório de atividades.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Funcionário</TableHead>
                      <TableHead className="hidden md:table-cell">Função</TableHead>
                      <TableHead className="hidden md:table-cell">Setor</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appraisees.map((appraisee) => (
                      <TableRow key={appraisee.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage
                                src={appraisee.avatarUrl}
                                alt={appraisee.name}
                              />
                              <AvatarFallback>
                                {appraisee.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="font-medium">{appraisee.name}</span>
                              <span className="text-sm text-muted-foreground">
                                {appraisee.email}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{appraisee.jobTitle}</TableCell>
                        <TableCell className="hidden md:table-cell">{appraisee.sector}</TableCell>
                        <TableCell className="text-right">
                          <Button asChild>
                            <Link href={`/appraiser/appraisee/${appraisee.id}`}>
                              <FileText className="mr-2 h-4 w-4" />
                              Ver Relatório
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {appraisees.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center h-24">Você não possui avaliados.</TableCell>
                        </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="my-reports">
            <Card>
              <CardHeader>
                <CardTitle>Meus Períodos de Avaliação</CardTitle>
                <CardDescription>
                  Selecione um período para ver seu próprio relatório de
                  atividades.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome do Período</TableHead>
                      <TableHead>Data de Início</TableHead>
                      <TableHead>Data de Fim</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {evaluationPeriods.map((period) => (
                      <TableRow key={period.id}>
                        <TableCell className="font-medium">
                          {period.name}
                        </TableCell>
                        <TableCell>
                          {format(period.startDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </TableCell>
                        <TableCell>
                          {format(period.endDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              period.status === "Ativo" ? "default" : "outline"
                            }
                          >
                            {period.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button onClick={() => handleViewOwnReport()}>
                            <Eye className="mr-2 h-4 w-4" />
                            Visualizar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                     {evaluationPeriods.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center h-24">Nenhum período de avaliação encontrado.</TableCell>
                        </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
