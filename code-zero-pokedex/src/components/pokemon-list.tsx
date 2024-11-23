'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { motion } from 'framer-motion'
import Image from 'next/image'

interface Pokemon {
  id: number
  name: string
  type: string
  level: number
  image: string
}

const mockPokemon: Pokemon[] = [
  { id: 1, name: 'Bulbasaur', type: 'Grass', level: 5, image: '/placeholder.svg?height=100&width=100' },
  { id: 2, name: 'Charmander', type: 'Fire', level: 5, image: '/placeholder.svg?height=100&width=100' },
  { id: 3, name: 'Squirtle', type: 'Water', level: 5, image: '/placeholder.svg?height=100&width=100' },
  { id: 4, name: 'Pikachu', type: 'Electric', level: 5, image: '/placeholder.svg?height=100&width=100' },
  { id: 5, name: 'Jigglypuff', type: 'Fairy', level: 5, image: '/placeholder.svg?height=100&width=100' },
  { id: 6, name: 'Meowth', type: 'Normal', level: 5, image: '/placeholder.svg?height=100&width=100' },
  { id: 7, name: 'Psyduck', type: 'Water', level: 5, image: '/placeholder.svg?height=100&width=100' },
  { id: 8, name: 'Geodude', type: 'Rock', level: 5, image: '/placeholder.svg?height=100&width=100' },
]

const typeColors: { [key: string]: string } = {
  Grass: 'bg-green-500',
  Fire: 'bg-red-500',
  Water: 'bg-blue-500',
  Electric: 'bg-yellow-500',
  Fairy: 'bg-pink-500',
  Normal: 'bg-gray-500',
  Rock: 'bg-stone-500',
}

interface PokemonListProps {
  view: 'list' | 'grid'
  searchQuery: string
}

export default function PokemonList({ view, searchQuery }: PokemonListProps) {
  const [sortBy, setSortBy] = useState('name')

  const filteredAndSortedPokemon = useMemo(() => {
    return mockPokemon
      .filter((pokemon) => pokemon.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name)
        if (sortBy === 'type') return a.type.localeCompare(b.type)
        if (sortBy === 'level') return b.level - a.level
        return 0
      })
  }, [searchQuery, sortBy])

  return (
    <div className="h-screen flex flex-col">
      <div className="mb-4 flex justify-end">
        <Select onValueChange={setSortBy} defaultValue={sortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="type">Type</SelectItem>
            <SelectItem value="level">Level</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex-grow overflow-y-auto">
        <div
          className={`grid gap-4 ${view === 'grid' ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4' : 'grid-cols-1'}`}
        >
          {filteredAndSortedPokemon.map((pokemon) => (
            <motion.div
              key={pokemon.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Card
                className={`overflow-hidden transition-shadow hover:shadow-lg ${typeColors[pokemon.type]} ${
                  view === 'list' ? 'flex items-center' : ''
                }`}
              >
                <CardHeader className={`p-4 ${view === 'list' ? 'flex-shrink-0 w-1/4' : ''}`}>
                  <CardTitle className="text-lg flex items-center justify-between text-white">
                    <span>{pokemon.name}</span>
                    <motion.div
                      className="w-6 h-6 rounded-full bg-gradient-to-b from-red-500 to-white relative overflow-hidden"
                      animate={{
                        rotate: 360,
                        y: [0, -2, 0],
                      }}
                      transition={{
                        rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
                        y: { duration: 0.5, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' },
                      }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-full h-[2px] bg-gray-800" />
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-3 h-3 bg-white border-2 border-gray-800 rounded-full" />
                      </div>
                    </motion.div>
                  </CardTitle>
                </CardHeader>
                <CardContent className={`p-4 ${view === 'list' ? 'flex-grow' : 'pt-0'}`}>
                  <div
                    className={`flex items-center ${
                      view === 'list' ? 'justify-between' : 'flex-col sm:flex-row'
                    } gap-4`}
                  >
                    <div className="relative">
                      <Image
                        src={pokemon.image}
                        alt={pokemon.name}
                        width={80}
                        height={80}
                        className="rounded-full bg-white p-2"
                      />
                      <div className="absolute bottom-0 right-0 bg-yellow-400 text-xs font-bold px-2 py-1 rounded-full">
                        Lv.{pokemon.level}
                      </div>
                    </div>
                    <div className="text-white">
                      <p className="text-sm font-semibold">Type: {pokemon.type}</p>
                      <p className="text-sm font-semibold">ID: #{pokemon.id.toString().padStart(3, '0')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
