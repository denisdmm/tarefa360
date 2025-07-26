
"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDataContext } from "@/context/DataContext";
import { FileText } from "lucide-react";
import * as React from "react";
import type { User } from "@/lib/types";


export default function AppraiserDashboard() {
  const { users, associations } = useDataContext();
  const appraiserId = 'user-appraiser-1'; // Avaliador logado mockado
  const [appraisees, setAppraisees] = React.useState<User[]>([]);

  React.useEffect(() => {
      // Find associations for the current appraiser
      const myAppraiseeIds = associations
          .filter(assoc => assoc.appraiserId === appraiserId)
          .map(assoc => assoc.appraiseeId);

      // Find the user objects for those appraisee IDs
      const foundAppraisees = users.filter(user => myAppraiseeIds.includes(user.id));
      
      setAppraisees(foundAppraisees);

  }, [users, associations, appraiserId]);


  return (
     <div className="flex flex-col h-full">
      <header className="bg-card border-b p-4">
        <h1 className="text-3xl font-bold font-headline">Painel do Avaliador</h1>
        <p className="text-muted-foreground">Revise e monitore o progresso de seus avaliados.</p>
      </header>

      <main className="flex-1 p-4 md:p-6 overflow-auto">
        <Card>
          <CardHeader>
            <CardTitle>Meus Avaliados</CardTitle>
            <CardDescription>
              Uma lista de funcionários que você é responsável por avaliar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Funcionário</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Setor</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appraisees.length > 0 ? (
                  appraisees.map((appraisee) => (
                    <TableRow key={appraisee.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={appraisee.avatarUrl} alt={appraisee.name} />
                            <AvatarFallback>
                              {appraisee.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                              <span className="font-medium">{appraisee.name}</span>
                              <span className="text-sm text-muted-foreground">{appraisee.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{appraisee.jobTitle}</TableCell>
                      <TableCell>{appraisee.sector}</TableCell>
                      <TableCell className="text-right">
                        <Button asChild>
                          <Link href={`/appraiser/appraisee/${appraisee.id}`}>
                            <FileText className="mr-2 h-4 w-4" />
                            Ver Atividades
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">Você não possui avaliados.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
