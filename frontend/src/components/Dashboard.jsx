import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  TicketIcon, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Users,
  ArrowRight
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getStats } from '@/api/client'
import { STATUS_CONFIG, PRIORITY_CONFIG, CATEGORY_CONFIG } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'

function StatCard({ title, value, description, icon: Icon, variant }) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    yellow: 'text-yellow-600 bg-yellow-100',
    green: 'text-green-600 bg-green-100',
    gray: 'text-gray-600 bg-gray-100',
    red: 'text-red-600 bg-red-100',
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-lg ${colorClasses[variant] || colorClasses.gray}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getStats()
        setStats(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [])

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Dashboard</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const openTickets = (stats.status.new || 0) + (stats.status.in_progress || 0)

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your support tickets</p>
        </div>
        <Button asChild>
          <Link to="/tickets">
            View All Tickets
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="New Tickets"
          value={stats.status.new || 0}
          description="Awaiting triage"
          icon={TicketIcon}
          variant="blue"
        />
        <StatCard
          title="In Progress"
          value={stats.status.in_progress || 0}
          description="Being worked on"
          icon={Clock}
          variant="yellow"
        />
        <StatCard
          title="Resolved"
          value={stats.status.resolved || 0}
          description="Pending closure"
          icon={CheckCircle}
          variant="green"
        />
        <StatCard
          title="Unassigned"
          value={stats.unassignedCount || 0}
          description="Need assignment"
          icon={AlertTriangle}
          variant="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Priority Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Open by Priority</CardTitle>
            <CardDescription>Active tickets grouped by priority</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(PRIORITY_CONFIG).map(([key, config]) => {
                const count = stats.priority[key] || 0
                return (
                  <div key={key} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${config.color}`} />
                      <span className="text-sm font-medium">{config.label}</span>
                    </div>
                    <Badge variant={key}>{count}</Badge>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Open by Category</CardTitle>
            <CardDescription>Active tickets grouped by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
                const count = stats.category[key] || 0
                return (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{config.label}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Team Workload */}
        <Card>
          <CardHeader>
            <CardTitle>Team Workload</CardTitle>
            <CardDescription>Assigned tickets per team member</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.teamWorkload.map(member => (
                <div key={member.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <span className="text-sm font-medium">{member.name}</span>
                  </div>
                  <Badge variant="outline">{member.assigned_tickets}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tickets */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Tickets</CardTitle>
            <CardDescription>Latest tickets in the system</CardDescription>
          </div>
          <Button variant="ghost" asChild>
            <Link to="/tickets">View All</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {stats.recentTickets.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No tickets yet. Create your first ticket to get started.
            </p>
          ) : (
            <div className="space-y-4">
              {stats.recentTickets.map(ticket => (
                <Link
                  key={ticket.id}
                  to={`/tickets/${ticket.id}`}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-medium">{ticket.title}</p>
                      <p className="text-sm text-muted-foreground">
                        #{ticket.id} opened by {ticket.reporter_name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={ticket.priority}>{PRIORITY_CONFIG[ticket.priority]?.label}</Badge>
                    <Badge variant={ticket.status}>{STATUS_CONFIG[ticket.status]?.label}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
