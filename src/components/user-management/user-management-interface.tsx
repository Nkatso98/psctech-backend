import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, UserPlus, UserCheck, UserX } from 'lucide-react';

export function UserManagementInterface() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Management
          </CardTitle>
          <CardDescription>
            Manage users, roles, and permissions across the institution
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Add New User
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Manage Roles
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <UserX className="h-4 w-4" />
              User Status
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
