"use client"

import * as React from "react"
import {
  IconCamera,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconHelp,
  IconInnerShadowTop,
  IconReport,
  IconSearch,
  IconSettings,
  IconTarget,
  IconCalendar,
  IconAlertTriangle,
  IconNotes,
  IconUsers,
  IconShield,
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAuth } from "@clerk/nextjs"
import { Roles } from "../../types/globals"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { sessionClaims } = useAuth()
  const userRole = (sessionClaims?.metadata as { role?: string })?.role as Roles
  const isAdmin = userRole === 'admin'

  // Role-based navigation items
  const getRoleBasedNavItems = () => {
    const baseItems = [
      {
        title: "Goals Management",
        url: "/dashboard/goals",
        icon: IconTarget,
        roles: ['admin', 'support_coordinator', 'support_worker', 'behavior_practitioner', 'family']
      },
      {
        title: "Activities & Schedules",
        url: "/dashboard/activities",
        icon: IconCalendar,
        roles: ['admin', 'support_coordinator', 'support_worker', 'behavior_practitioner', 'family']
      },
      {
        title: "Behavior & Incidents",
        url: "/dashboard/behaviors",
        icon: IconAlertTriangle,
        roles: ['admin', 'support_coordinator', 'support_worker', 'behavior_practitioner']
      },
      {
        title: "Shift Notes",
        url: "/dashboard/shift-notes",
        icon: IconNotes,
        roles: ['admin', 'support_worker', 'behavior_practitioner']
      },
    ]

    // Add admin and coordinator specific items
    if (isAdmin || userRole === 'support_coordinator') {
      baseItems.unshift({
        title: "Client Management",
        url: "/dashboard/clients",
        icon: IconUsers,
        roles: ['admin', 'support_coordinator']
      })
    }

    // Add admin-specific items
    if (isAdmin) {
      baseItems.unshift({
        title: "User Approvals",
        url: "/dashboard/admin/user-approval",
        icon: IconUsers,
        roles: ['admin']
      })
      baseItems.unshift({
        title: "Admin Dashboard",
        url: "/dashboard/admin",
        icon: IconShield,
        roles: ['admin']
      })
    }

    // Filter items based on user role
    return baseItems.filter(item => 
      item.roles.includes(userRole) || item.roles.includes('admin')
    )
  }

  const data = {
    user: {
      name: "User", // We'll get this from session claims if needed
      email: "user@example.com", // We'll get this from session claims if needed
      avatar: "/avatars/default.jpg",
      role: userRole
    },
    navMain: getRoleBasedNavItems(),
    navClouds: [
      {
        title: "Capture",
        icon: IconCamera,
        isActive: true,
        url: "#",
        items: [
          {
            title: "Active Proposals",
            url: "#",
          },
          {
            title: "Archived",
            url: "#",
          },
        ],
      },
      {
        title: "Proposal",
        icon: IconFileDescription,
        url: "#",
        items: [
          {
            title: "Active Proposals",
            url: "#",
          },
          {
            title: "Archived",
            url: "#",
          },
        ],
      },
      {
        title: "Prompts",
        icon: IconFileAi,
        url: "#",
        items: [
          {
            title: "Active Proposals",
            url: "#",
          },
          {
            title: "Archived",
            url: "#",
          },
        ],
      },
    ],
    navSecondary: [
      {
        title: "Settings",
        url: "#",
        icon: IconSettings,
      },
      {
        title: "Get Help",
        url: "#",
        icon: IconHelp,
      },
      {
        title: "Search",
        url: "#",
        icon: IconSearch,
      },
    ],
    documents: [
      {
        name: "Data Library",
        url: "#",
        icon: IconDatabase,
      },
      {
        name: "Reports",
        url: "#",
        icon: IconReport,
      },
      {
        name: "Word Assistant",
        url: "#",
        icon: IconFileWord,
      },
    ],
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/dashboard">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Agnovat</span>
                {isAdmin && (
                  <IconShield className="!size-4 ml-2 text-red-500" title="Administrator" />
                )}
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
