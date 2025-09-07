"use client"

import { useState, useEffect } from "react"
import { Client } from "../../types/database"

export type { Client }

interface CreateClientData {
  name: string
  dateOfBirth?: number
  guardianName?: string
  guardianContact?: string
  medicalInfo?: string
  carePlan?: string
  isActive: boolean
}

interface UpdateClientData {
  name?: string
  dateOfBirth?: number
  guardianName?: string
  guardianContact?: string
  medicalInfo?: string
  carePlan?: string
  isActive?: boolean
}

export function useClients() {
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch clients from API
  const fetchClients = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/api/clients')
      if (!response.ok) {
        throw new Error(`Failed to fetch clients: ${response.statusText}`)
      }
      
      const data = await response.json()
      if (data.success) {
        setClients(data.data || [])
      } else {
        throw new Error(data.error || 'Failed to fetch clients')
      }
    } catch (err) {
      console.error('Error fetching clients:', err)
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      setClients([])
    } finally {
      setIsLoading(false)
    }
  }

  // Create a new client
  const createClient = async (clientData: CreateClientData): Promise<Client> => {
    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clientData),
      })
      
      if (!response.ok) {
        throw new Error(`Failed to create client: ${response.statusText}`)
      }
      
      const data = await response.json()
      if (data.success) {
        // Refresh the clients list
        await fetchClients()
        return data.data
      } else {
        throw new Error(data.error || 'Failed to create client')
      }
    } catch (err) {
      console.error('Error creating client:', err)
      throw err
    }
  }

  // Update an existing client
  const updateClient = async (clientId: string, updates: UpdateClientData): Promise<Client> => {
    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })
      
      if (!response.ok) {
        throw new Error(`Failed to update client: ${response.statusText}`)
      }
      
      const data = await response.json()
      if (data.success) {
        // Refresh the clients list
        await fetchClients()
        return data.data
      } else {
        throw new Error(data.error || 'Failed to update client')
      }
    } catch (err) {
      console.error('Error updating client:', err)
      throw err
    }
  }

  // Delete a client
  const deleteClient = async (clientId: string): Promise<void> => {
    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error(`Failed to delete client: ${response.statusText}`)
      }
      
      const data = await response.json()
      if (data.success) {
        // Refresh the clients list
        await fetchClients()
      } else {
        throw new Error(data.error || 'Failed to delete client')
      }
    } catch (err) {
      console.error('Error deleting client:', err)
      throw err
    }
  }

  // Load clients on mount
  useEffect(() => {
    fetchClients()
  }, [])

  return {
    clients,
    isLoading,
    error,
    createClient,
    updateClient,
    deleteClient,
    refetch: fetchClients,
  }
}