/**
 * Admin Analytics
 * 
 * View detailed analytics and metrics for your application.
 */

import { AdminHeader, StatsCard, StatsGrid } from '@/components/admin';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  CreditCard, 
  TrendingUp, 
  Activity,
  Eye,
  MousePointer,
  Clock,
  ArrowUpRight
} from 'lucide-react';

// Demo chart placeholder component
function ChartPlaceholder({ title, height = '300px' }: { title: string; height?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="mb-4 font-semibold">{title}</h3>
      <div 
        className="flex items-center justify-center rounded-lg bg-secondary/50 text-muted-foreground"
        style={{ height }}
      >
        <p className="text-sm">Chart visualization goes here</p>
      </div>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  return (
    <div>
      <AdminHeader
        title="Analytics"
        subtitle="Track your application's performance and growth."
        actions={
          <div className="flex gap-2">
            <Button variant="outline">Last 7 days</Button>
            <Button>Export</Button>
          </div>
        }
      />

      <div className="p-6">
        {/* Overview Stats */}
        <StatsGrid columns={4}>
          <StatsCard
            title="Page Views"
            value="284,921"
            change={{ value: 15.3, trend: 'up' }}
            description="vs last period"
            icon={Eye}
          />
          <StatsCard
            title="Unique Visitors"
            value="48,294"
            change={{ value: 8.2, trend: 'up' }}
            description="vs last period"
            icon={Users}
          />
          <StatsCard
            title="Bounce Rate"
            value="32.4%"
            change={{ value: -5.1, trend: 'up' }}
            description="vs last period"
            icon={ArrowUpRight}
          />
          <StatsCard
            title="Avg. Session"
            value="4m 23s"
            change={{ value: 12.8, trend: 'up' }}
            description="vs last period"
            icon={Clock}
          />
        </StatsGrid>

        {/* Charts */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <ChartPlaceholder title="Revenue Over Time" height="300px" />
          <ChartPlaceholder title="User Growth" height="300px" />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <ChartPlaceholder title="Traffic Sources" height="250px" />
          <ChartPlaceholder title="Top Pages" height="250px" />
          <ChartPlaceholder title="Conversion Funnel" height="250px" />
        </div>

        {/* Engagement Stats */}
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold">Engagement Metrics</h2>
          <StatsGrid columns={4}>
            <StatsCard
              title="Click Rate"
              value="12.8%"
              change={{ value: 2.1, trend: 'up' }}
              icon={MousePointer}
            />
            <StatsCard
              title="Active Users"
              value="3,429"
              change={{ value: 5.4, trend: 'up' }}
              icon={Activity}
            />
            <StatsCard
              title="New Signups"
              value="847"
              change={{ value: 18.2, trend: 'up' }}
              icon={Users}
            />
            <StatsCard
              title="MRR"
              value="$24,580"
              change={{ value: 8.7, trend: 'up' }}
              icon={CreditCard}
            />
          </StatsGrid>
        </div>
      </div>
    </div>
  );
}

