'use client'

import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { motion } from 'framer-motion'
import Image from 'next/image'

interface Pokemon {
  id: string
  name: string
  image: string
  type: string
}

interface Team {
  id: string
  name: string
  pokemon: Pokemon[]
}

// Simulated API response
const fetchTeams = async (): Promise<Team[]> => {
  // In a real application, this would be an actual API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 'team1',
          name: 'Kanto Starters',
          pokemon: [
            { id: 'poke1', name: 'Bulbasaur', image: '/placeholder.svg?height=50&width=50', type: 'Grass' },
            { id: 'poke2', name: 'Charmander', image: '/placeholder.svg?height=50&width=50', type: 'Fire' },
            { id: 'poke3', name: 'Squirtle', image: '/placeholder.svg?height=50&width=50', type: 'Water' },
          ],
        },
        {
          id: 'team2',
          name: 'Electric Dream',
          pokemon: [
            { id: 'poke4', name: 'Pikachu', image: '/placeholder.svg?height=50&width=50', type: 'Electric' },
            { id: 'poke5', name: 'Jolteon', image: '/placeholder.svg?height=50&width=50', type: 'Electric' },
          ],
        },
        {
          id: 'team3',
          name: 'Psychic Power',
          pokemon: [
            { id: 'poke6', name: 'Abra', image: '/placeholder.svg?height=50&width=50', type: 'Psychic' },
            { id: 'poke7', name: 'Kadabra', image: '/placeholder.svg?height=50&width=50', type: 'Psychic' },
            { id: 'poke8', name: 'Alakazam', image: '/placeholder.svg?height=50&width=50', type: 'Psychic' },
          ],
        },
      ])
    }, 1000) // Simulate network delay
  })
}

const typeColors: { [key: string]: string } = {
  Electric: 'bg-yellow-500',
  Fire: 'bg-red-500',
  Grass: 'bg-green-500',
  Water: 'bg-blue-500',
  Psychic: 'bg-purple-500',
}

export default function TeamManagement() {
  const [teams, setTeams] = useState<Team[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadTeams = async () => {
      setIsLoading(true)
      try {
        const fetchedTeams = await fetchTeams()
        setTeams(fetchedTeams)
      } catch (error) {
        console.error('Failed to fetch teams:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadTeams()
  }, [])

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result

    if (!destination) return

    const sourceTeamIndex = teams.findIndex((team) => team.id === source.droppableId)
    const destTeamIndex = teams.findIndex((team) => team.id === destination.droppableId)

    const newTeams = [...teams]
    const [removed] = newTeams[sourceTeamIndex].pokemon.splice(source.index, 1)
    newTeams[destTeamIndex].pokemon.splice(destination.index, 0, removed)

    setTeams(newTeams)
  }

  const removePokemon = (teamId: string, pokemonId: string) => {
    setTeams(teams.map(team => {
      if (team.id === teamId) {
        return {
          ...team,
          pokemon: team.pokemon.filter(p => p.id !== pokemonId)
        }
      }
      return team
    }))
  }

  if (isLoading) {
    return <div className="text-center text-white text-2xl">Loading teams...</div>
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4 text-white">Team Management</h2>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team) => (
            <Card key={team.id} className="bg-gradient-to-br from-blue-500 to-purple-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium text-white">{team.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <Droppable droppableId={team.id}>
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="min-h-[100px]">
                      {team.pokemon.map((pokemon, index) => (
                        <Draggable key={pokemon.id} draggableId={pokemon.id} index={index}>
                          {(provided) => (
                            <motion.div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`${typeColors[pokemon.type] || 'bg-gray-500'} p-2 mb-2 rounded-md shadow-sm flex items-center justify-between`}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div className="flex items-center space-x-2">
                                <Image src={pokemon.image} alt={pokemon.name} width={32} height={32} className="rounded-full bg-white" />
                                <span className="text-white font-semibold">{pokemon.name}</span>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => removePokemon(team.id, pokemon.id)}
                                className="text-white hover:bg-red-600 rounded-full"
                              >
                                <X size={16} />
                              </Button>
                            </motion.div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </CardContent>
            </Card>
          ))}
        </div>
      </DragDropContext>
    </div>
  )
}

