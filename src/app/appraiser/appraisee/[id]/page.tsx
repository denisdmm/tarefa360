
"use client";

import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { activities, users } from "@/lib/mock-data";
import type { Activity, User } from "@/lib/types";
import { ArrowLeft, Filter, Printer } from "lucide-react";
import Link from 'next/link';
import { format } from 'date-fns';

export default function AppraiseeDetailView({ params }: { params: { id: string } }) {
  const [appraisee, setAppraisee] = React.useState<User | null>(null);
  const [filteredActivities, setFilteredActivities] = React.useState<Activity[]>([]);
  const [monthFilter, setMonthFilter] = React.useState('all');

  React.useEffect(() => {
    const foundUser = users.find(u => u.id === params.id) || null;
    setAppraisee(foundUser);
    const userActivities = activities.filter(a => a.userId === params.id);
    
    if (monthFilter === 'all') {
      setFilteredActivities(userActivities);
    } else {
      setFilteredActivities(userActivities.filter(a => a.month === monthFilter));
    }
  }, [params.id, monthFilter]);

  const handlePrint = () => {
    window.print();
  };

  if (!appraisee) {
    return <div className="p-6">Avaliado não encontrado.</div>;
  }
  
  const allMonths = [
    ...new Set(activities.filter(a => a.userId === params.id).map(a => a.month)),
  ];

  return (
    <>
      <div className="print:hidden flex flex-col h-full">
        <header className="bg-card border-b p-4">
          <div className="flex justify-between items-center">
            <div>
              <Button variant="ghost" asChild className="mb-2">
                 <Link href="/appraiser/dashboard">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao Painel
                 </Link>
              </Button>
              <h1 className="text-3xl font-bold font-headline">Relatório de Atividades</h1>
              <div className="flex items-center gap-2 mt-1">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={appraisee.avatarUrl} />
                  <AvatarFallback>{appraisee.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <p className="text-muted-foreground font-medium">{appraisee.name}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={monthFilter} onValueChange={setMonthFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrar por mês" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Meses</SelectItem>
                    {allMonths.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Gerar PDF
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Card>
            <CardHeader>
              <CardTitle>Visão Geral das Tarefas</CardTitle>
              <CardDescription>
                Lista detalhada de atividades realizadas durante o período de avaliação.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">Título</TableHead>
                    <TableHead>Mês</TableHead>
                    <TableHead className="w-[30%]">Conclusão</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredActivities.map(activity => (
                    <TableRow key={activity.id}>
                      <TableCell className="font-medium">{activity.title}</TableCell>
                      <TableCell>{activity.month}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={activity.completionPercentage} className="w-[80%]" />
                          <span>{activity.completionPercentage}%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                   {filteredActivities.length === 0 && (
                     <TableRow>
                       <TableCell colSpan={3} className="text-center h-24">Nenhuma atividade encontrada para o mês selecionado.</TableCell>
                     </TableRow>
                   )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </div>

      <div id="print-content" className="hidden print:block p-8 font-body">
         <div className="text-center mb-8">
            <h1 className="text-3xl font-bold font-headline">Tarefa360 - Relatório de Atividades</h1>
         </div>
         <div className="mb-6">
            <h2 className="text-xl font-semibold">Informações do Avaliado</h2>
            <p><strong>Nome:</strong> {appraisee.name}</p>
            <p><strong>Função:</strong> {appraisee.jobTitle}</p>
            <p><strong>Setor:</strong> {appraisee.sector}</p>
            <p><strong>Email:</strong> {appraisee.email}</p>
         </div>
         <h2 className="text-xl font-semibold mb-2">Atividades ({monthFilter === 'all' ? 'Todos' : monthFilter})</h2>
         <table className="w-full border-collapse border border-gray-400">
           <thead>
             <tr className="bg-gray-200">
               <th className="border border-gray-300 p-2 text-left">Título</th>
               <th className="border border-gray-300 p-2 text-left">Descrição</th>
               <th className="border border-gray-300 p-2 text-left">Mês</th>
               <th className="border border-gray-300 p-2 text-left">% de Conclusão</th>
             </tr>
           </thead>
           <tbody>
             {filteredActivities.map(activity => (
               <tr key={activity.id}>
                 <td className="border border-gray-300 p-2">{activity.title}</td>
                 <td className="border border-gray-300 p-2 text-sm">{activity.description}</td>
                 <td className="border border-gray-300 p-2">{activity.month}</td>
                 <td className="border border-gray-300 p-2 text-center">{activity.completionPercentage}%</td>
               </tr>
             ))}
           </tbody>
         </table>
         <style jsx global>{`
            @media print {
              body {
                background-color: white !important;
              }
            }
         `}</style>
      </div>
    </>
  );
}

    

    
