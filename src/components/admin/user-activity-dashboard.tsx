'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Activity, 
  TrendingUp, 
  Users, 
  Clock, 
  AlertCircle, 
  Shield, 
  FileText, 
  LogIn,
  LogOut,
  Eye,
  Edit,
  RefreshCw,
  Download
} from 'lucide-react'

interface AuditLog {
  id: string
  userId: string
  userEmail: string
  userName: string
  action: string
  resource: string
  timestamp: string
  details: string
  ipAddress?: string
  userAgent?: string
  severity: 'low' | 'medium' | 'high' | 'critical'
}

interface ActivityStats {
  totalActions: number
  activeUsers: number
  criticalActions: number
  loginAttempts: number
  failedLogins: number
  dataExports: number
  recentActivity: AuditLog[]
}

export function UserActivityDashboard() {
  const [timeFilter, setTimeFilter] = useState('24h')
  const [selectedUser, setSelectedUser] = useState<string>('all')
  const [actionFilter, setActionFilter] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(false)

  // Mock data - replace with actual API calls
  const [activityStats, setActivityStats] = useState<ActivityStats>({
    totalActions: 1247,
    activeUsers: 23,
    criticalActions: 3,
    loginAttempts: 156,
    failedLogins: 7,
    dataExports: 12,
    recentActivity: [
      {
        id: '1',
        userId: 'user1',
        userEmail: 'john.doe@example.com',
        userName: 'John Doe',
        action: 'LOGIN',
        resource: 'System',
        timestamp: '2024-01-20T10:30:00Z',
        details: 'Successful login',
        ipAddress: '192.168.1.1',
        severity: 'low'
      },
      {
        id: '2',
        userId: 'user2',
        userEmail: 'jane.smith@example.com',
        userName: 'Jane Smith',
        action: 'CREATE_BEHAVIOR_INCIDENT',
        resource: 'Behavior Module',
        timestamp: '2024-01-20T10:25:00Z',
        details: 'Created behavior incident for client Tavonga',
        ipAddress: '192.168.1.2',
        severity: 'medium'
      },
      {
        id: '3',
        userId: 'user3',
        userEmail: 'admin@example.com',
        userName: 'System Admin',
        action: 'APPROVE_USER',
        resource: 'User Management',
        timestamp: '2024-01-20T10:20:00Z',
        details: 'Approved user registration for mike.wilson@example.com',
        ipAddress: '192.168.1.3',
        severity: 'high'
      },
      {
        id: '4',
        userId: 'user4',
        userEmail: 'support@example.com',
        userName: 'Support Worker',
        action: 'EXPORT_DATA',
        resource: 'Reports',
        timestamp: '2024-01-20T10:15:00Z',
        details: 'Exported behavior report for last 30 days',
        ipAddress: '192.168.1.4',
        severity: 'critical'
      },
      {
        id: '5',
        userId: 'user1',
        userEmail: 'john.doe@example.com',
        userName: 'John Doe',
        action: 'FAILED_LOGIN',
        resource: 'System',
        timestamp: '2024-01-20T09:45:00Z',
        details: 'Failed login attempt - incorrect password',
        ipAddress: '192.168.1.1',
        severity: 'medium'
      }
    ]
  })

  const handleRefresh = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
  }

  const handleExportLogs = () => {
    // Simulate export functionality
    const csvData = activityStats.recentActivity.map(log => 
      `${log.timestamp},${log.userName},${log.action},${log.resource},${log.details},${log.severity}`
    ).join('\n')
    
    const headers = 'Timestamp,User,Action,Resource,Details,Severity\n'
    const csvContent = headers + csvData
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `user_activity_${timeFilter}_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const getSeverityBadge = (severity: string) => {
    const variants = {
      low: { variant: 'outline' as const, className: 'bg-gray-100 text-gray-700' },
      medium: { variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-800' },
      high: { variant: 'default' as const, className: 'bg-orange-100 text-orange-800' },
      critical: { variant: 'destructive' as const, className: 'bg-red-100 text-red-800' }
    }
    
    const config = variants[severity as keyof typeof variants] || variants.low
    
    return (
      <Badge variant={config.variant} className={config.className}>
        {severity.toUpperCase()}
      </Badge>
    )
  }

  const getActionIcon = (action: string) => {
    const icons = {
      'LOGIN': LogIn,
      'LOGOUT': LogOut,
      'FAILED_LOGIN': AlertCircle,
      'CREATE_BEHAVIOR_INCIDENT': FileText,
      'EDIT_BEHAVIOR_INCIDENT': Edit,
      'VIEW_CLIENT_DATA': Eye,
      'EXPORT_DATA': Download,
      'APPROVE_USER': Shield,
      'default': Activity
    }
    
    const IconComponent = icons[action as keyof typeof icons] || icons.default
    return <IconComponent className="w-4 h-4" />
  }

  const filteredActivity = activityStats.recentActivity.filter(log => {
    if (selectedUser !== 'all' && log.userId !== selectedUser) return false
    if (actionFilter !== 'all' && log.action !== actionFilter) return false
    return true
  })

  const uniqueActions = [...new Set(activityStats.recentActivity.map(log => log.action))]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">User Activity Dashboard</h2>
          <p className="text-gray-600">Monitor user actions and system security</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleExportLogs}>
            <Download className="w-4 h-4 mr-2" />
            Export Logs
          </Button>
          <Button onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Actions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activityStats.totalActions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+12% from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activityStats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">Last {timeFilter}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Actions</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{activityStats.criticalActions}</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Login Attempts</CardTitle>
            <LogIn className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activityStats.loginAttempts}</div>
            <p className="text-xs text-muted-foreground">Success rate: 95.5%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Logins</CardTitle>
            <Shield className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{activityStats.failedLogins}</div>
            <p className="text-xs text-muted-foreground">Security alerts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Exports</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activityStats.dataExports}</div>
            <p className="text-xs text-muted-foreground">Compliance tracking</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="recent" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recent">Recent Activity</TabsTrigger>
          <TabsTrigger value="security">Security Events</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <Select value={timeFilter} onValueChange={setTimeFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">Last Hour</SelectItem>
                    <SelectItem value="24h">Last 24 Hours</SelectItem>
                    <SelectItem value="7d">Last 7 Days</SelectItem>
                    <SelectItem value="30d">Last 30 Days</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Users" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    {[...new Set(activityStats.recentActivity.map(log => `${log.userId}:${log.userName}`))].map(user => {
                      const [id, name] = user.split(':')
                      return (
                        <SelectItem key={id} value={id}>{name}</SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>

                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Actions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    {uniqueActions.map(action => (
                      <SelectItem key={action} value={action}>
                        {action.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex items-center text-sm text-gray-600">
                  Showing {filteredActivity.length} of {activityStats.recentActivity.length} entries
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Table */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
              <CardDescription>Real-time user activity and system events</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>IP Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredActivity.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm">
                        {new Date(log.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-sm">{log.userName}</div>
                          <div className="text-xs text-gray-500">{log.userEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getActionIcon(log.action)}
                          <span className="text-sm">{log.action.replace('_', ' ')}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{log.resource}</TableCell>
                      <TableCell className="text-sm max-w-xs truncate">{log.details}</TableCell>
                      <TableCell>{getSeverityBadge(log.severity)}</TableCell>
                      <TableCell className="text-sm font-mono">{log.ipAddress}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Security Events
              </CardTitle>
              <CardDescription>
                Failed login attempts, unauthorized access, and security alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Security Events</h3>
                <p className="text-sm">Security-related activity logs will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Compliance Logs
              </CardTitle>
              <CardDescription>
                Data exports, privacy access, and regulatory compliance tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Compliance Logs</h3>
                <p className="text-sm">Compliance and audit logs will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}