"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { activities as mockActivities } from "@/lib/mock-data";
import type { Activity } from "@/lib/types";
import {
  Edit,
  PlusCircle,
  Trash2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ActivityForm = ({
  activity,
  onSave,
  onClose,
}: {
  activity?: Activity | null;
  onSave: (activity: Activity) => void;
  onClose: () => void;
}) => {
  const [title, setTitle] = React.useState(activity?.title || "");
  const [description, setDescription] = React.useState(
    activity?.description || ""
  );
  const [month, setMonth] = React.useState(activity?.month || "");
  const [percentage, setPercentage] = React.useState(
    activity?.completionPercentage || 0
  );

  const handleSubmit = () => {
    const newActivity: Activity = {
      id: activity?.id || `act-${Date.now()}`,
      title,
      description,
      month,
      completionPercentage: Number(percentage),
      userId: activity?.userId || 'user-appraisee-1',
    };
    onSave(newActivity);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{activity ? "Edit Activity" : "Create New Activity"}</DialogTitle>
        <DialogDescription>
          {activity
            ? "Update the details of your activity."
            : "Register a new activity for the current evaluation period."}
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="title" className="text-right">Title</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="description" className="text-right">Description</Label>
          <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="month" className="text-right">Month</Label>
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {[ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November" ].map(m => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="percentage" className="text-right">Completion</Label>
          <Input id="percentage" type="number" value={percentage} onChange={(e) => setPercentage(Number(e.target.value))} className="col-span-3" />
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
        <Button onClick={handleSubmit}>Save Activity</Button>
      </DialogFooter>
    </>
  );
};


export default function AppraiseeDashboard() {
  const { toast } = useToast();
  const [activities, setActivities] = React.useState<Activity[]>(mockActivities.filter(a => a.userId === 'user-appraisee-1'));
  const [isFormOpen, setFormOpen] = React.useState(false);
  const [selectedActivity, setSelectedActivity] = React.useState<Activity | null>(null);

  const handleSaveActivity = (activity: Activity) => {
    const isEditing = activities.some(a => a.id === activity.id);
    if (isEditing) {
      setActivities(activities.map(a => a.id === activity.id ? activity : a));
      toast({ title: "Activity Updated", description: "Your activity has been successfully updated." });
    } else {
      setActivities([activity, ...activities]);
      toast({ title: "Activity Created", description: "Your new activity has been registered." });
    }
    setFormOpen(false);
    setSelectedActivity(null);
  };

  const handleDeleteActivity = (activityId: string) => {
    setActivities(activities.filter(a => a.id !== activityId));
    toast({ variant: 'destructive', title: "Activity Deleted", description: "The activity has been removed." });
  };

  return (
    <Dialog open={isFormOpen} onOpenChange={setFormOpen}>
      <div className="flex flex-col h-full">
         <header className="bg-card border-b p-4">
           <div className="flex justify-between items-center">
             <div>
               <h1 className="text-3xl font-bold font-headline">My Activities</h1>
               <p className="text-muted-foreground">Manage your ongoing tasks and progress.</p>
             </div>
             <DialogTrigger asChild>
                <Button onClick={() => setSelectedActivity(null)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Register Activity
                </Button>
             </DialogTrigger>
           </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {activities.map((activity) => (
              <Card key={activity.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle>{activity.title}</CardTitle>
                  <CardDescription>{activity.month}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground mb-4">{activity.description}</p>
                  <Progress value={activity.completionPercentage} aria-label={`${activity.completionPercentage}% complete`} />
                  <p className="text-sm font-medium text-right mt-1">{activity.completionPercentage}%</p>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                   <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setSelectedActivity(activity)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </Button>
                   </DialogTrigger>
                   <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this activity.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteActivity(activity.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                   </AlertDialog>
                </CardFooter>
              </Card>
            ))}
          </div>
        </main>
        
        <DialogContent className="sm:max-w-[625px]">
            <ActivityForm 
                activity={selectedActivity} 
                onSave={handleSaveActivity} 
                onClose={() => {
                    setFormOpen(false);
                    setSelectedActivity(null);
                }}
            />
        </DialogContent>
      </div>
    </Dialog>
  );
}
