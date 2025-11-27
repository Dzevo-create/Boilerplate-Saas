/**
 * Admin Users Management
 * 
 * View and manage all users in the system.
 */

import { AdminHeader, DataTable } from '@/components/admin';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';

// Demo data - replace with real data from your database
const users = [
  { id: '1', name: 'John Doe', email: 'john@example.com', role: 'User', plan: 'Pro', credits: 850, status: 'Active', createdAt: '2024-01-15' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'Admin', plan: 'Enterprise', credits: 2500, status: 'Active', createdAt: '2024-01-14' },
  { id: '3', name: 'Bob Wilson', email: 'bob@example.com', role: 'User', plan: 'Starter', credits: 50, status: 'Active', createdAt: '2024-01-13' },
  { id: '4', name: 'Alice Brown', email: 'alice@example.com', role: 'User', plan: 'Pro', credits: 0, status: 'Inactive', createdAt: '2024-01-12' },
  { id: '5', name: 'Charlie Davis', email: 'charlie@example.com', role: 'User', plan: 'Starter', credits: 100, status: 'Active', createdAt: '2024-01-11' },
  { id: '6', name: 'Diana Evans', email: 'diana@example.com', role: 'User', plan: 'Pro', credits: 450, status: 'Active', createdAt: '2024-01-10' },
  { id: '7', name: 'Edward Fox', email: 'edward@example.com', role: 'User', plan: 'Enterprise', credits: 5000, status: 'Active', createdAt: '2024-01-09' },
  { id: '8', name: 'Fiona Green', email: 'fiona@example.com', role: 'User', plan: 'Starter', credits: 25, status: 'Suspended', createdAt: '2024-01-08' },
];

const columns = [
  { key: 'name', header: 'Name' },
  { key: 'email', header: 'Email' },
  {
    key: 'role',
    header: 'Role',
    render: (item: typeof users[0]) => (
      <span
        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
          item.role === 'Admin'
            ? 'bg-purple-500/10 text-purple-500'
            : 'bg-blue-500/10 text-blue-500'
        }`}
      >
        {item.role}
      </span>
    ),
  },
  { key: 'plan', header: 'Plan' },
  { key: 'credits', header: 'Credits' },
  {
    key: 'status',
    header: 'Status',
    render: (item: typeof users[0]) => (
      <span
        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
          item.status === 'Active'
            ? 'bg-green-500/10 text-green-500'
            : item.status === 'Inactive'
            ? 'bg-gray-500/10 text-gray-500'
            : 'bg-red-500/10 text-red-500'
        }`}
      >
        {item.status}
      </span>
    ),
  },
  { key: 'createdAt', header: 'Joined' },
];

export default function AdminUsersPage() {
  return (
    <div>
      <AdminHeader
        title="Users"
        subtitle="Manage all users in your application."
        actions={
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add User
          </Button>
        }
      />

      <div className="p-6">
        <DataTable
          data={users}
          columns={columns}
          searchKey="name"
          searchPlaceholder="Search users by name..."
          pageSize={10}
          actions={(item) => (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        />
      </div>
    </div>
  );
}

