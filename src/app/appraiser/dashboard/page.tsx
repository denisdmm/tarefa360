
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
  const { users, associations, loggedInUser } = useDataContext();
  const [appraisees, setAppraisees] = React.useState<User[]>([]);

  React.useEffect(() => {
      if (!loggedInUser) return;
      // Find associations for the current appraiser
      const myAppraiseeIds = associations
          .filter(assoc => assoc.appraiserId === loggedInUser.id)
          .map(assoc => assoc.appraiseeId);

      // Find the user objects for those appraisee IDs
      const foundAppraisees = users.filter(user => myAppraiseeIds.includes(user.id));
      
      setAppraisees(foundAppraisees);

  }, [users, associations, loggedInUser]);

  if (!loggedInUser) {
    return <div>Carregando...</div>
  }

  return (
     <div className="flex flex-col h-full">
      <main className="flex-1 p-2 md:p-6 overflow-auto">
        <div className="mb-6">
            <h1 className="text-3xl font-bold font-headline">Painel do Avaliador</h1>
            <p className="text-muted-foreground">Revise e monitore o progresso de seus avaliados.</p>
        </div>
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
                  <TableHead className="hidden md:table-cell">Função</TableHead>
                  <TableHead className="hidden md:table-cell">Setor</TableHead>
                  <TableHead className="text-center">Ações</TableHead>
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
                              <span className="font-medium">{appraisee.postoGrad} {appraisee.nomeDeGuerra}</span>
                              <span className="text-sm text-muted-foreground truncate max-w-[150px] sm:max-w-none">{appraisee.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{appraisee.jobTitle}</TableCell>
                      <TableCell className="hidden md:table-cell">{appraisee.sector}</TableCell>
                      <TableCell className="text-center">
                        <Button asChild size="sm" className="w-10 sm:w-auto p-0 sm:px-3 sm:py-2">
                          <Link href={`/appraiser/appraisee/${appraisee.id}`}>
                            <FileText className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">Ver Atividades</span>
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
