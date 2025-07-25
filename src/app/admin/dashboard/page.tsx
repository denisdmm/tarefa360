"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  users,
  evaluationPeriods,
  associations,
} from "@/lib/mock-data";
import { Calendar, Edit, Link2, PlusCircle, Trash2, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboard() {

  const getUsernameById = (id: string) => users.find(u => u.id === id)?.name || 'Unknown';

  return (
    <div className="flex flex-col h-full">
      <header className="bg-card border-b p-4">
        <h1 className="text-3xl font-bold font-headline">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage the entire evaluation ecosystem.</p>
      </header>

      <main className="flex-1 p-4 md:p-6 overflow-auto">
        <Tabs defaultValue="accounts">
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 mb-6">
            <TabsTrigger value="accounts"><Users className="mr-2" /> Accounts</TabsTrigger>
            <TabsTrigger value="periods"><Calendar className="mr-2" /> Evaluation Periods</TabsTrigger>
            <TabsTrigger value="associations"><Link2 className="mr-2" /> Associations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="accounts">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>User Accounts</CardTitle>
                    <CardDescription>Create, view, and manage all user accounts.</CardDescription>
                  </div>
                  <Button><PlusCircle className="mr-2 h-4 w-4" />Create Account</Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell><Badge variant="secondary" className="capitalize">{user.role}</Badge></TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="periods">
            <Card>
              <CardHeader>
                 <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Evaluation Periods</CardTitle>
                      <CardDescription>Define and manage evaluation cycles.</CardDescription>
                    </div>
                    <Button><PlusCircle className="mr-2 h-4 w-4" />New Period</Button>
                 </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Period Name</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {evaluationPeriods.map((period) => (
                      <TableRow key={period.id}>
                        <TableCell>{period.name}</TableCell>
                        <TableCell>{period.startDate.toLocaleDateString()}</TableCell>
                        <TableCell>{period.endDate.toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant={period.status === 'Active' ? 'default' : 'outline'}>{period.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                           <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="associations">
            <Card>
              <CardHeader>
                <CardTitle>Appraiser & Appraisee Associations</CardTitle>
                <CardDescription>Link appraisees to their respective appraisers.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border rounded-lg p-4 space-y-4 bg-muted/20">
                    <h3 className="font-semibold">Create New Association</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                         <div>
                            <Label htmlFor="appraisee-select">Appraisee</Label>
                            <Select>
                                <SelectTrigger id="appraisee-select"><SelectValue placeholder="Select an appraisee" /></SelectTrigger>
                                <SelectContent>
                                    {users.filter(u => u.role === 'appraisee').map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                         </div>
                         <div>
                            <Label htmlFor="appraiser-select">Appraiser</Label>
                            <Select>
                                <SelectTrigger id="appraiser-select"><SelectValue placeholder="Select an appraiser" /></SelectTrigger>
                                <SelectContent>
                                    {users.filter(u => u.role === 'appraiser').map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                         </div>
                         <div className="flex items-end">
                            <Button className="w-full md:w-auto"><Link2 className="mr-2 h-4 w-4"/>Associate</Button>
                         </div>
                    </div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Appraisee</TableHead>
                      <TableHead>Appraiser</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {associations.map((assoc) => (
                      <TableRow key={assoc.id}>
                        <TableCell>{getUsernameById(assoc.appraiseeId)}</TableCell>
                        <TableCell>{getUsernameById(assoc.appraiserId)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
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
