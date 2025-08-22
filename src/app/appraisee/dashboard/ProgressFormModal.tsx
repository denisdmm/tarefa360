
"use client";

import * as React from "react";
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { Activity, ProgressEntry } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Slider } from "@/components/ui/slider";

export const ProgressFormModal = ({
  activity,
  onSave,
  onClose,
}: {
  activity: Activity;
  onSave: (activity: Activity) => Promise<void>;
  onClose: () => void;
}) => {
  
  const [newProgress, setNewProgress] = React.useState<{date: string, percentage: number, comment: string} | null>(null);

  const { toast } = useToast();
  
  React.useEffect(() => {
    if (activity) {
        const lastProgress = activity.progressHistory && activity.progressHistory.length > 0 
            ? [...activity.progressHistory].sort((a, b) => b.year - a.year || b.month - a.month)[0]
            : null;

        setNewProgress({
            date: format(new Date(), 'yyyy-MM-dd'),
            percentage: lastProgress?.percentage || 0,
            comment: ""
        });
    }
  }, [activity]);


  const handleSaveProgress = async () => {
    if (!newProgress?.date) {
        toast({ variant: 'destructive', title: "Data Inválida", description: "Por favor, selecione uma data para o registro de progresso."});
        return;
    }
    
    // Parse date directly from string to avoid timezone issues
    const dateValue = newProgress.date; // "YYYY-MM-DD"
    const parts = dateValue.split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10); // 1-12

    const newProgressEntry: ProgressEntry = {
        year,
        month,
        percentage: newProgress.percentage,
        comment: newProgress.comment,
    };
    
    const updatedActivity: Activity = {
        ...activity,
        progressHistory: [...activity.progressHistory, newProgressEntry],
    };

    await onSave(updatedActivity);
    onClose();
  };

  const handlePercentageChange = (value: number) => {
    if (!newProgress) return;
    const newPercentage = Math.max(0, Math.min(100, value));
    setNewProgress({...newProgress, percentage: newPercentage});
  }

  const handleIncrementPercentage = (increment: number) => {
      if (!newProgress) return;
      handlePercentageChange(newProgress.percentage + increment);
  }
  
  if (!newProgress) return null;

  return (
    <DialogContent className="sm:max-w-[625px]">
      <DialogHeader>
        <DialogTitle>Registrar Progresso</DialogTitle>
        <DialogDescription>
          Adicione um novo registro de avanço para a atividade: <span className="font-semibold text-foreground">{activity.title}</span>
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-6 py-4 max-h-[70vh] overflow-y-auto pr-4">
        <div className="p-4 border rounded-lg bg-muted/50 space-y-4">
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
                    placeholder="Descreva o que foi feito neste mês..."
                />
            </div>
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild><Button variant="outline" onClick={onClose}>Cancelar</Button></DialogClose>
        <Button onClick={handleSaveProgress}>Salvar Progresso</Button>
      </DialogFooter>
    </DialogContent>
  );
};
