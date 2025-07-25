"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
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
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/logo";
import type { Role } from "@/lib/types";

export default function LoginPage() {
  const [role, setRole] = React.useState<Role | "">("");
  const router = useRouter();

  const handleLogin = () => {
    if (role) {
      router.push(`/${role}/dashboard`);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Logo className="h-8 w-8" />
          </div>
          <CardTitle className="font-headline text-3xl">Tarefa360 Companion</CardTitle>
          <CardDescription>
            Sign in to continue to your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role">Select Your Role</Label>
              <Select onValueChange={(value: Role) => setRole(value)} value={role}>
                <SelectTrigger id="role" className="w-full">
                  <SelectValue placeholder="Choose a role..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="appraiser">Appraiser</SelectItem>
                  <SelectItem value="appraisee">Appraisee</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleLogin} disabled={!role} className="w-full">
              Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
