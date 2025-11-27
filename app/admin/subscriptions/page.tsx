/**
 * Admin Subscriptions
 * 
 * Manage all subscriptions and billing.
 */

import { AdminHeader, StatsCard, StatsGrid, DataTable } from '@/components/admin';
import { Button } from '@/components/ui/button';
import { CreditCard, TrendingUp, Users, DollarSign } from 'lucide-react';

// Demo data
const subscriptions = [
  { id: 'sub_1', user: 'John Doe', email: 'john@example.com', plan: 'Pro', amount: '$29', status: 'Active', nextBilling: '2024-02-15', created: '2024-01-15' },
  { id: 'sub_2', user: 'Jane Smith', email: 'jane@example.com', plan: 'Enterprise', amount: '$99', status: 'Active', nextBilling: '2024-02-14', created: '2024-01-14' },
  { id: 'sub_3', user: 'Bob Wilson', email: 'bob@example.com', plan: 'Pro', amount: '$29', status: 'Cancelled', nextBilling: '-', created: '2024-01-10' },
  { id: 'sub_4', user: 'Alice Brown', email: 'alice@example.com', plan: 'Starter', amount: '$0', status: 'Active', nextBilling: '2024-02-12', created: '2024-01-12' },
  { id: 'sub_5', user: 'Charlie Davis', email: 'charlie@example.com', plan: 'Pro', amount: '$29', status: 'Past Due', nextBilling: '2024-01-20', created: '2024-01-05' },
  { id: 'sub_6', user: 'Diana Evans', email: 'diana@example.com', plan: 'Enterprise', amount: '$99', status: 'Active', nextBilling: '2024-02-10', created: '2024-01-10' },
];

const columns = [
  { key: 'user', header: 'Customer' },
  { key: 'email', header: 'Email' },
  { key: 'plan', header: 'Plan' },
  { key: 'amount', header: 'Amount' },
  {
    key: 'status',
    header: 'Status',
    render: (item: typeof subscriptions[0]) => (
      <span
        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
          item.status === 'Active'
            ? 'bg-green-500/10 text-green-500'
            : item.status === 'Cancelled'
            ? 'bg-gray-500/10 text-gray-500'
            : 'bg-yellow-500/10 text-yellow-500'
        }`}
      >
        {item.status}
      </span>
    ),
  },
  { key: 'nextBilling', header: 'Next Billing' },
];

export default function AdminSubscriptionsPage() {
  return (
    <div>
      <AdminHeader
        title="Subscriptions"
        subtitle="Manage subscriptions and billing."
        actions={
          <Button>View Stripe Dashboard</Button>
        }
      />

      <div className="p-6">
        {/* Stats */}
        <StatsGrid columns={4}>
          <StatsCard
            title="Monthly Revenue"
            value="$24,580"
            change={{ value: 12.5, trend: 'up' }}
            description="vs last month"
            icon={DollarSign}
          />
          <StatsCard
            title="Active Subscriptions"
            value="847"
            change={{ value: 8.2, trend: 'up' }}
            description="vs last month"
            icon={CreditCard}
          />
          <StatsCard
            title="Churn Rate"
            value="2.4%"
            change={{ value: -0.8, trend: 'up' }}
            description="vs last month"
            icon={TrendingUp}
          />
          <StatsCard
            title="Avg. Revenue/User"
            value="$29.02"
            change={{ value: 5.1, trend: 'up' }}
            description="vs last month"
            icon={Users}
          />
        </StatsGrid>

        {/* Subscriptions Table */}
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold">All Subscriptions</h2>
          <DataTable
            data={subscriptions}
            columns={columns}
            searchKey="user"
            searchPlaceholder="Search by customer name..."
            pageSize={10}
            actions={(item) => (
              <Button variant="ghost" size="sm">
                Manage
              </Button>
            )}
          />
        </div>
      </div>
    </div>
  );
}

