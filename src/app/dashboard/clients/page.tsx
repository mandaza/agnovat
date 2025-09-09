"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { IconUsers, IconUserCheck, IconUserX, IconCalendar } from "@tabler/icons-react"
import { AddClientForm } from "@/components/clients/add-client-form"
import { ClientsTable } from "@/components/clients/clients-table"
import { useClientsRealtime } from "@/hooks/use-clients-realtime"
import { RoleGuard } from "@/components/role-guard"

export default function ClientsPage() {
  const { clients, isLoading } = useClientsRealtime()
  
  // Calculate overview statistics from real-time data
  const totalClients = clients.length
  const activeClients = clients.filter(client => client.isActive).length
  const inactiveClients = clients.filter(client => !client.isActive).length
  const recentClients = clients.filter(client => {
    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
    return new Date(client.createdAt) > oneMonthAgo
  }).length

  // No need for callback handlers with real-time updates

  return (
    <RoleGuard requiredRole="support_coordinator">
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            {/* Page Header */}
            <div className="px-4 lg:px-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Client Management</h1>
                  <p className="text-muted-foreground">
                    Manage client profiles and care information
                  </p>
                </div>
                <AddClientForm />
              </div>
            </div>

            {/* Clients Overview Cards */}
            <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
                  <IconUsers className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoading ? "..." : totalClients}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {totalClients > 0 ? `${totalClients} total clients` : "No clients registered"}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
                  <IconUserCheck className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoading ? "..." : activeClients}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {activeClients > 0 ? `${activeClients} active clients` : "No active clients"}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Inactive</CardTitle>
                  <IconUserX className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoading ? "..." : inactiveClients}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {inactiveClients > 0 ? `${inactiveClients} inactive clients` : "All clients active"}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">New This Month</CardTitle>
                  <IconCalendar className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoading ? "..." : recentClients}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {recentClients > 0 ? "New registrations" : "No new registrations"}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Area */}
            <div className="px-4 lg:px-6">
              <Card>
                <CardHeader>
                  <CardTitle>Client Profiles</CardTitle>
                  <CardDescription>
                    Manage client information, medical details, and care plans
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ClientsTable />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  )
}