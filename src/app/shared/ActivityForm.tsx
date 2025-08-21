
"use client";

import * as React from "react";
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { Activity, EvaluationPeriod, ProgressEntry } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { format, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Slider } from "@/components/ui/slider";

export const ActivityForm = ({
  activity,
  onSave,
  onClose,
  currentUserId,
  isReadOnly = false,
  activePeriod,
}: {
  activity?: Activity | null;
  onSave: (activity: Activity) => Promise<void>;
  onClose: () => void;
  currentUserId: string;
  isReadOnly?: boolean;
  activePeriod?: EvaluationPeriod;
}) => {
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [startDate, setStartDate] = React.useState('');
  const [dateError, setDateError] = React.useState<string | null>(null);
  const [progressHistory, setProgressHistory] = React.useState<ProgressEntry[]>([]);

  const [isAddingProgress, setIsAddingProgress] = React.useState(false);
  const [newProgress, setNewProgress] = React.useState<{date: string, percentage: number, comment: string} | null>(null);

  const { toast } = useToast();
  
  const validateStartDate = (dateString: string) => {
    // Only validate for new activities.
    if (activity) {
        setDateError(null);
        return;
    }
  
    if (!dateString) {
        setDateError("A data de início é obrigatória.");
        return;
    }

    // The input type="date" returns "YYYY-MM-DD".
    const parts = dateString.split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
    const day = parseInt(parts[2], 10);
    const parsedDate = new Date(year, month, day);

    if (isNaN(parsedDate.getTime())) {
        setDateError("Formato de data inválido.");
        return;
    }
    
    // Validation removed to allow start date before active period
    setDateError(null);
  };


  const isSaveDisabled = React.useMemo(() => {
    if (isReadOnly) return true;
    if (!title.trim() || !startDate || dateError) return true;
    if (isAddingProgress) return true; // Disable save if progress is being added
    
    return false;
  }, [title, startDate, dateError, isReadOnly, isAddingProgress]);


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

  const handleStartAddNewProgress = () => {
    const lastProgress = progressHistory.sort((a, b) => b.year - a.year || b.month - a.month)[0];
    setNewProgress({
        date: format(new Date(), 'yyyy-MM-dd'),
        percentage: lastProgress?.percentage || 0,
        comment: ""
    });
    setIsAddingProgress(true);
  }

  const handleSaveNewProgress = () => {
    if (!newProgress?.date) {
        toast({ variant: 'destructive', title: "Data Inválida", description: "Por favor, selecione uma data para o registro de progresso."});
        return;
    }
    
    // Parse date directly from string to avoid timezone issues
    const dateValue = newProgress.date; // "YYYY-MM-DD"
    const parts = dateValue.split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10); // 1-12

    const existingEntryIndex = progressHistory.findIndex(p => p.year === year && p.month === month);
    if(existingEntryIndex > -1) {
        toast({ variant: 'destructive', title: "Registro Duplicado", description: "Já existe um registro de progresso para este mês."});
        return;
    }

    setProgressHistory(prev => [...prev, {
        year,
        month,
        percentage: newProgress.percentage,
        comment: newProgress.comment
    }]);
    setIsAddingProgress(false);
    setNewProgress(null);
  };
  
  const handleRemoveProgress = (year: number, month: number) => {
    setProgressHistory(prev => prev.filter(p => !(p.year === year && p.month === month)));
  }


  const handleSubmit = async () => {
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
    onClose();
  };
  
  const sortedProgressHistory = [...progressHistory].sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.month - a.month;
  });

  const handlePercentageChange = (value: number) => {
    if (!newProgress) return;
    const newPercentage = Math.max(0, Math.min(100, value));
    setNewProgress({...newProgress, percentage: newPercentage});
  }

  const handleIncrementPercentage = (increment: number) => {
      if (!newProgress) return;
      handlePercentageChange(newProgress.percentage + increment);
  }

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
                        readOnly={isReadOnly || !!activity}
                    />
                    {dateError && <p className="text-sm text-destructive mt-1">{dateError}</p>}
                </div>
            </div>
        </div>

        <Separator />
        
        {/* Progress Registration */}
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                 <h3 className="font-semibold text-lg">Histórico de Progresso</h3>
                 {!isAddingProgress && !isReadOnly && (
                     <Button variant="outline" size="sm" onClick={handleStartAddNewProgress}>
                        <Plus className="mr-2 h-4 w-4" /> Adicionar
                     </Button>
                 )}
            </div>
            {isAddingProgress && newProgress && (
                <div className="p-4 border rounded-lg bg-muted/50 space-y-4">
                    <div className="flex justify-between items-center">
                        <h4 className="font-medium">Novo Registro de Progresso</h4>
                        <Button variant="ghost" size="icon" onClick={() => setIsAddingProgress(false)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                        <Label htmlFor="new-progress-date" className="md:text-right">Data</Label>
                        <Input 
                            id="new-progress-date" 
                            type="date"
                            value={newProgress.date} 
                            onChange={e => setNewProgress({...newProgress, date: e.target.value})}
                            className="col-span-1 md:col-span-3" 
                        />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                        <Label htmlFor="new-progress-percentage" className="md:text-right">Conclusão (%)</Label>
                        <div className="col-span-1 md:col-span-3 flex items-center gap-2">
                             <Input 
                                id="new-progress-percentage" 
                                type="number" 
                                min="0"
                                max="100"
                                value={newProgress.percentage} 
                                onChange={e => handlePercentageChange(parseInt(e.target.value) || 0)} 
                                className="w-20" 
                            />
                            <Slider
                                value={[newProgress.percentage]}
                                onValueChange={(value) => handlePercentageChange(value[0])}
                                max={100}
                                step={1}
                                className="flex-1"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                       <div className="md:col-start-2 col-span-1 md:col-span-3 flex flex-wrap gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleIncrementPercentage(5)}>+5%</Button>
                            <Button size="sm" variant="outline" onClick={() => handleIncrementPercentage(10)}>+10%</Button>
                            <Button size="sm" variant="outline" onClick={() => handleIncrementPercentage(25)}>+25%</Button>
                            <Button size="sm" variant="outline" onClick={() => handleIncrementPercentage(50)}>+50%</Button>
                       </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 items-start gap-4">
                        <Label htmlFor="new-progress-comment" className="md:text-right mt-2">Comentário</Label>
                        <Textarea 
                            id="new-progress-comment"
                            value={newProgress.comment}
                            onChange={e => setNewProgress({...newProgress, comment: e.target.value})}
                            className="col-span-1 md:col-span-3"
                        />
                    </div>
                    <div className="flex justify-end">
                        <Button onClick={handleSaveNewProgress}>Salvar Progresso</Button>
                    </div>
                </div>
            )}
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
        <DialogClose asChild><Button variant="outline" onClick={onClose}>Fechar</Button></DialogClose>
        {!isReadOnly && <Button onClick={handleSubmit} disabled={isSaveDisabled}>Salvar Atividade</Button>}
      </DialogFooter>
    </DialogContent>
  );
};
