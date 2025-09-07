"use client"

import { useQuery, useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"
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

export function useClientsRealtime() {
  // Real-time query - automatically updates when data changes
  const clients = useQuery(api.api.getClients, {}) || []
  
  // Mutations for create, update, delete
  const createClientMutation = useMutation(api.api.createClient)
  const updateClientMutation = useMutation(api.api.updateClient)
  const deleteClientMutation = useMutation(api.api.deleteClient)

  // Create a new client
  const createClient = async (clientData: CreateClientData): Promise<Client> => {
    try {
      const result = await createClientMutation(clientData)
      return result
    } catch (error) {
      console.error('Error creating client:', error)
      throw error
    }
  }

  // Update an existing client
  const updateClient = async (clientId: string, updates: UpdateClientData): Promise<Client> => {
    try {
      const result = await updateClientMutation({
        clientId: clientId as unknown as any, // Convex will validate the ID format
        ...updates,
      })
      return result
    } catch (error) {
      console.error('Error updating client:', error)
      throw error
    }
  }

  // Delete a client
  const deleteClient = async (clientId: string): Promise<void> => {
    try {
      await deleteClientMutation({
        clientId: clientId as unknown as any, // Convex will validate the ID format
      })
    } catch (error) {
      console.error('Error deleting client:', error)
      throw error
    }
  }

  return {
    clients,
    isLoading: clients === undefined, // Convex returns undefined while loading
    error: null, // Convex handles errors automatically through React error boundaries
    createClient,
    updateClient,
    deleteClient,
    refetch: () => {}, // Not needed with real-time updates
  }
}