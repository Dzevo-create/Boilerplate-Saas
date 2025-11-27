/**
 * Admin Dashboard
 * 
 * Main admin overview page with key metrics and recent activity.
 */

import { Users, CreditCard, TrendingUp, Activity } from 'lucide-react';
import { AdminHeader, StatsCard, StatsGrid, DataTable } from '@/components/admin';
import { Button } from '@/components/ui/button';

// Demo data - replace with real data from your database
const recentUsers = [
  { id: '1', name: 'John Doe', email: 'john@example.com', plan: 'Pro', status: 'Active', createdAt: '2024-01-15' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', plan: 'Starter', status: 'Active', createdAt: '2024-01-14' },
  { id: '3', name: 'Bob Wilson', email: 'bob@example.com', plan: 'Enterprise', status: 'Active', createdAt: '2024-01-13' },
  { id: '4', name: 'Alice Brown', email: 'alice@example.com', plan: 'Pro', status: 'Inactive', createdAt: '2024-01-12' },
  { id: '5', name: 'Charlie Davis', email: 'charlie@example.com', plan: 'Starter', status: 'Active', createdAt: '2024-01-11' },
];

const columns = [
  { key: 'name', header: 'Name' },
  { key: 'email', header: 'Email' },
  { key: 'plan', header: 'Plan' },
  {
    key: 'status',
    header: 'Status',
    render: (item: typeof recentUsers[0]) => (
      <span
        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
          item.status === 'Active'
            ? 'bg-green-500/10 text-green-500'
            : 'bg-red-500/10 text-red-500'
        }`}
      >
        {item.status}
      </span>
    ),
  },
  { key: 'createdAt', header: 'Joined' },
];

export default function AdminDashboard() {
  return (
    <div>
      <AdminHeader
        title="Dashboard"
        subtitle="Welcome back! Here's what's happening with your app."
        actions={
          <Button>Export Report</Button>
        }
      />

      <div className="p-6">
        {/* Stats Cards */}
        <StatsGrid columns={4}>
          <StatsCard
            title="Total Users"
            value="12,847"
            change={{ value: 12.5, trend: 'up' }}
            description="from last month"
            icon={Users}
          />
          <StatsCard
            title="Revenue"
            value="$48,294"
            change={{ value: 8.2, trend: 'up' }}
            description="from last month"
            icon={CreditCard}
          />
          <StatsCard
            title="Active Subscriptions"
            value="3,429"
            change={{ value: -2.4, trend: 'down' }}
            description="from last month"
            icon={TrendingUp}
          />
          <StatsCard
            title="Conversion Rate"
            value="4.28%"
            change={{ value: 0.8, trend: 'up' }}
            description="from last month"
            icon={Activity}
          />
        </StatsGrid>

        {/* Recent Users Table */}
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold">Recent Users</h2>
          <DataTable
            data={recentUsers}
            columns={columns}
            searchKey="name"
            searchPlaceholder="Search users..."
            pageSize={5}
            actions={(item) => (
              <Button variant="ghost" size="sm">
                View
              </Button>
            )}
          />
        </div>
      </div>
    </div>
  );
}

