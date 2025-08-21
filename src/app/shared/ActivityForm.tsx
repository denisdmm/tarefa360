
"use client";

import * as React from "react";
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Trash2, PlusCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Activity, ProgressEntry } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const ActivityForm = ({
  activity,
  onSave,
  onClose,
  onAddProgress,
  currentUserId,
  isReadOnly = false,
}: {
  activity?: Activity | null;
  onSave: (activity: Activity) => Promise<void>;
  onClose: () => void;
  onAddProgress: (activity: Activity) => void;
  currentUserId: string;
  isReadOnly?: boolean;
}) => {
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [startDate, setStartDate] = React.useState('');
  const [dateError, setDateError] = React.useState<string | null>(null);
  const [progressHistory, setProgressHistory] = React.useState<ProgressEntry[]>([]);
  
  const { toast } = useToast();
  
  const validateStartDate = (dateString: string) => {
    if (!dateString) {
        setDateError("A data de início é obrigatória.");
        return;
    }
    setDateError(null);
  };

  const isSaveDisabled = React.useMemo(() => {
    if (isReadOnly) return true;
    if (!title.trim() || !startDate || dateError) return true;
    return false;
  }, [title, startDate, dateError, isReadOnly]);


  React.useEffect(() => {
    if (activity) {
      setTitle(activity.title || "");
      setDescription(activity.description || "");
      setStartDate(activity.startDate ? format(new Date(activity.startDate as any), 'yyyy-MM-dd') : '');
      setProgressHistory(activity.progressHistory || []);
    } else {
      // For new activities
      setTitle("");
      setDescription("");
      setStartDate('');
      setProgressHistory([]);
      setDateError(null);
    }
  }, [activity]);
  
  const handleRemoveProgress = (year: number, month: number) => {
    if(isReadOnly) return;
    const newHistory = progressHistory.filter(p => !(p.year === year && p.month === month));
    setProgressHistory(newHistory);
  }
  
  const handleAddProgressClick = () => {
    if (isReadOnly) return;
    
    // We create a temporary activity object to pass to the progress modal
    const currentActivityState: Activity = {
        id: activity?.id || '', // id will be empty for new activities
        title,
        description,
        startDate: new Date(startDate),
        progressHistory,
        userId: currentUserId,
    };
    onAddProgress(currentActivityState);
  }

  const handleSaveClick = async () => {
     if (isSaveDisabled) {
        toast({
            variant: "destructive",
            title: "Formulário Inválido",
            description: "Por favor, preencha todos os campos obrigatórios e corrija os erros.",
        });
        return;
    }
    
    const parts = startDate.split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const dateWithOffset = new Date(year, month, day);

    const updatedActivity: Activity = {
      id: activity?.id || `act-${Date.now()}`,
      title,
      description,
      startDate: dateWithOffset,
      progressHistory: progressHistory,
      userId: currentUserId,
    };
    await onSave(updatedActivity);
  }
  
  const sortedProgressHistory = [...progressHistory].sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.month - a.month;
  });

  return (
    <DialogContent className="sm:max-w-[625px]">
      <DialogHeader>
        <DialogTitle>{activity ? (isReadOnly ? "Visualizar Atividade" : "Editar Atividade") : "Criar Nova Atividade"}</DialogTitle>
        <DialogDescription>
          {isReadOnly 
            ? "Visualize os detalhes e o progresso da sua atividade."
            : activity
            ? "Atualize os detalhes e o progresso da sua atividade."
            : "Registre uma nova atividade para o período de avaliação atual."}
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-6 py-4 max-h-[70vh] overflow-y-auto pr-4">
        {/* Activity Details */}
        <div className="space-y-4">
            <h3 className="font-semibold text-lg">Detalhes da Atividade</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="md:text-right">Título</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="col-span-1 md:col-span-3" readOnly={isReadOnly} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 items-start gap-4">
                <Label htmlFor="description" className="md:text-right mt-2">Descrição</Label>
                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-1 md:col-span-3" readOnly={isReadOnly} />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-4 items-start gap-4">
                <Label htmlFor="start-date" className="md:text-right pt-2">Data de Início</Label>
                <div className="col-span-1 md:col-span-3">
                    <Input
                        id="start-date"
                        type="date"
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                        onBlur={e => validateStartDate(e.target.value)}
                        className={cn(dateError && "border-destructive")}
                        readOnly={isReadOnly}
                    />
                    {dateError && <p className="text-sm text-destructive mt-1">{dateError}</p>}
                </div>
            </div>
        </div>

        <Separator />
        
        {/* Progress History */}
        <div className="space-y-4">
             <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg">Histórico de Progresso</h3>
                {!isReadOnly && (
                    <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleAddProgressClick}
                    >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Adicionar Progresso
                    </Button>
                )}
            </div>
            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Período</TableHead>
                            <TableHead>Progresso</TableHead>
                            <TableHead className="hidden sm:table-cell">Comentário</TableHead>
                            {!isReadOnly && <TableHead className="text-right"></TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedProgressHistory.length > 0 ? sortedProgressHistory.map(p => (
                            <TableRow key={`${p.year}-${p.month}`}>
                                <TableCell className="font-medium">
                                    {format(new Date(p.year, p.month - 1), "MMM yyyy", { locale: ptBR })}
                                </TableCell>
                                <TableCell>{p.percentage}%</TableCell>
                                <TableCell className="text-muted-foreground hidden sm:table-cell">{p.comment}</TableCell>
                                {!isReadOnly && (
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => handleRemoveProgress(p.year, p.month)}>
                                        <Trash2 className="h-4 w-4 text-destructive"/>
                                    </Button>
                                </TableCell>
                                )}
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={isReadOnly ? 3 : 4} className="h-24 text-center">Nenhum progresso registrado.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Card>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Fechar</Button>
        {!isReadOnly && <Button onClick={handleSaveClick} disabled={isSaveDisabled}>Salvar Atividade</Button>}
      </DialogFooter>
    </DialogContent>
  );
};
