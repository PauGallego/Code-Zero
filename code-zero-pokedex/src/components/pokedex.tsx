'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QrCode, Mic, Search, Users, BarChart2, Bot, List, Grid, LogOut, Sword, Map } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import RivalAnalysis from './rival-analysis';
import TeamManagement from './team-management';
import AIAssistant from './ai-assistant';
import VoiceRecognitionModal from './voicerecon';

export default function Pokedex() {
  const teamUrl = 'https://hackeps-poke-backend.azurewebsites.net/teams/';
  const pokemonUrl = 'https://hackeps-poke-backend.azurewebsites.net/pokemons/';
  const teamId = '63bf06cf-e720-4134-9252-f195668c6048';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');

  const handleRecognize = (text: string) => {
    setRecognizedText(text);
    console.log('Recognized Text:', text);
  };

  const toggleAIAssistant = () => {
    setIsAIAssistantOpen((prev) => !prev);
    console.log('AI Assistant toggled:', !isAIAssistantOpen);
  };

  const [teamData, setTeamData] = useState<any>(null);
  const [pokemonDetails, setPokemonDetails] = useState<any[]>([]);
  const [pokemonCounts, setPokemonCounts] = useState<{ [key: string]: number }>({});
  const [filteredPokemons, setFilteredPokemons] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('name'); // Default sort by name
  const [isScanning, setIsScanning] = useState(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('list');

  const specialImageUrl =
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNTOGFBPoc4jlP9M1HrOe8AAQyzAy9NGVGZQ&s';
  const specialImageUrl2 =
    'https://canarddebain.com/cdn/shop/products/CanardPerroquetPirate-Lilalu02.png?v=1640250617';

    if (localStorage.getItem('login') == null) {
  // Pedimos al usuario que introduzca su Team ID
  const teamId = prompt('Por favor, introduce tu Team ID para iniciar sesión:');
  if (teamId) {
    // Guardamos el Team ID en el localStorage como 'login'
    localStorage.setItem('login', teamId);
    location.reload(); // Recargamos la página para aplicar cambios
  } else {
    alert('Debes introducir un Team ID para continuar.');
  }
}

// Función para cerrar sesión
const handleLogout = () => {
  console.log('Logging out...');
  // Eliminamos el dato almacenado con la clave 'login'
  localStorage.removeItem('login');
  alert('¡Sesión cerrada!');
  location.reload(); // Recargamos la página para aplicar cambios
};
    

  const fetchTeamData = async () => {
    try {
      const response = await fetch(`${teamUrl}${teamId}`)
      if (!response.ok) throw new Error(`Error fetching team: ${response.status}`)
      const data = await response.json()
      setTeamData(data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchPokemonDetails = async (pokemonId: string) => {
    try {
      const response = await fetch(`${pokemonUrl}${pokemonId}`)
      if (!response.ok) throw new Error(`Error fetching Pokémon: ${response.status}`)
      const data = await response.json()

      // Add special images for specific Pokémon
      if (data.name === "Cyberquack") {
        data.image = specialImageUrl
      } else if (data.name === "Hackduck") {
        data.image = specialImageUrl2
      }

      setPokemonDetails((prev) =>
        prev.find((p) => p.id === data.id) ? prev : [...prev, data]
      )
    } catch (err) {
      console.error(err)
    }
  }

  const evolvePokemon = async (pokemonId: string) => {
    const duplicates = teamData.captured_pokemons
      .filter((p: { pokemon_id: string }) => p.pokemon_id === pokemonId)
      .map((p: { id: string }) => p.id)

    if (duplicates.length < 3) {
      alert('You need at least 3 duplicates to evolve this Pokémon.')
      return
    }

    try {
      const response = await fetch(`${pokemonUrl}${pokemonId}/evolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pokemon_uuid_list: duplicates.slice(0, 3),
          team_id: teamId,
        }),
      })

      if (!response.ok) throw new Error('Failed to evolve Pokémon.')
      alert('Pokémon evolved successfully.')
      fetchTeamData()
    } catch (err) {
      console.error(err)
    }
  }

  const evolveAll = async () => {
    const evolvablePokemons = pokemonDetails.filter((pokemon) => {
      const count = pokemonCounts[pokemon.id] || 0
      return count >= 3 && pokemon.evolves_to
    })

    for (const pokemon of evolvablePokemons) {
      await evolvePokemon(pokemon.id)
    }

    alert('Evolved all eligible Pokémon.')
  }

  useEffect(() => {
    fetchTeamData()
  }, [])

  useEffect(() => {
    if (teamData && teamData.captured_pokemons) {
      const counts: { [key: string]: number } = {}
      teamData.captured_pokemons.forEach((p: { pokemon_id: string }) => {
        counts[p.pokemon_id] = (counts[p.pokemon_id] || 0) + 1
      })
      setPokemonCounts(counts)

      Object.keys(counts).forEach(fetchPokemonDetails)
    }
  }, [teamData])

  useEffect(() => {
    const sorted = [...pokemonDetails].filter((pokemon) =>
      pokemon.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    // Sorting logic
    sorted.sort((a, b) => {
      if (sortOrder === 'name') {
        return a.name.localeCompare(b.name)
      } else if (sortOrder === 'id') {
        return a.id - b.id
      } else if (sortOrder === 'count') {
        return (pokemonCounts[b.id] || 0) - (pokemonCounts[a.id] || 0)
      } else if (sortOrder === 'type') {
        return (a.types?.[0]?.type?.name || '').localeCompare(b.types?.[0]?.type?.name || '')
      } else if (sortOrder === 'evolves') {
        return a.evolves_to ? -1 : 1
      }
      return 0
    })

    setFilteredPokemons(sorted)
  }, [searchQuery, sortOrder, pokemonDetails, pokemonCounts])

  return (
    <Card className="w-full h-[90vh] max-w-4xl mx-auto bg-[#fffaf2] shadow-xl rounded-lg overflow-hidden">
      <AIAssistant
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)} // Asegúrate de que esta función está correctamente definida
      />

      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <motion.h1
            className="text-4xl font-bold text-red-500 drop-shadow-lg"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            Pokédex
          </motion.h1>
          <div className="flex items-center space-x-4">
          
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsScanning(true)}
              className="rounded-lg border-2 border-borderButtons hover:bg-yellow-100 bg-white/90"
            >
              <QrCode size={24} className="text-red-500" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={() => toggleAIAssistant()}
              className="rounded-lg border-2 border-borderButtons hover:bg-yellow-100 bg-white/90"
            >
              <Bot size={24} className="text-red-500" />
            </Button>

            <Button
              variant="outline"
              onClick={() => setIsModalOpen(true)}
              className="rounded-lg border-2 border-borderButtons hover:bg-yellow-100 bg-white/90"
            >
              <Mic size={24} className="text-red-500" />
            </Button>

            {recognizedText && (
              <p className="mt-4 text-gray-700">
                Last Recognized Text: <strong>{recognizedText}</strong>
              </p>
            )}

            <VoiceRecognitionModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onRecognize={handleRecognize}
            />
              {/* Botón de Logout */}
              <Button
              variant="outline"
              size="icon"
              onClick={handleLogout}
              className="rounded-lg border-2 border-red-500 hover:bg-red-100 bg-white/90"
            >
              <LogOut size={24} className="text-red-500" />
            </Button>

          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center mb-6 gap-4">
        <div className="relative flex-1 w-full">
          <Input
            type="text"
            placeholder="Search Pokémon..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 bg-white/90"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-400" size={20} />
        </div>
        <Button
          variant="outline"
          size="lg"
          onClick={evolveAll}
          className="rounded-lg border-2 border-green-500 hover:bg-green-100 bg-white/90 text-green-500 w-full md:w-auto"
        >
          Evolve All
        </Button>
        <div className="w-full md:w-auto">
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 bg-white w-full md:w-auto"
          >
            <option value="name">Sort by Name</option>
            <option value="id">Sort by ID</option>
            <option value="count">Sort by Duplicates</option>
            <option value="type">Sort by Type</option>
            <option value="evolves">Sort by Evolvable</option>
          </select>
        </div>
      </div>


        <Tabs defaultValue="list" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-4 bg-[#d7d7d7] h-[55px] pl-[30px] pr-[30px]">
            <TabsTrigger value="list" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">
              <List size={16} className="mr-2" />
              List
            </TabsTrigger>
            <TabsTrigger value="grid" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              <Grid size={16} className="mr-2" />
              Grid
            </TabsTrigger>
            <TabsTrigger value="team" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
  <Map size={16} className="mr-2" />
  Zonas
</TabsTrigger>
<TabsTrigger value="rival" className="data-[state=active]:bg-yellow-500 data-[state=active]:text-white">
  <Sword size={16} className="mr-2" />
  Torneos
</TabsTrigger>

          </TabsList>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
             <TabsContent value="list">
              {activeTab === 'list' && (
                <div className="overflow-y-auto h-[60vh]">
                  {filteredPokemons.length > 0 ? (
                    <>
                      {filteredPokemons.map((pokemon) => (
                        <div
                          key={pokemon.id}
                          className="p-4 bg-gray-100 rounded-lg mb-2 flex items-center justify-between hover:shadow-lg transition-shadow hover:border-2 hover:border-gray"
                        >
                          <div className="flex items-center">
                            {pokemon.image && (
                              <img
                                src={pokemon.image}
                                alt={pokemon.name}
                                className="w-16 h-16 object-contain mr-4"
                              />
                            )}
                            <div>
                              <h2 className="text-lg font-bold">{pokemon.name}</h2>
                              <p>ID: {pokemon.id}</p>
                              <p>Count: {pokemonCounts[pokemon.id]}</p>
                            </div>
                          </div>
                          {pokemonCounts[pokemon.id] >= 3 && pokemon.evolves_to && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => evolvePokemon(pokemon.id)}
                              className="text-green-500 border-green-500 hover:bg-green-100"
                            >
                              Evolve
                            </Button>
                          )}
                        </div>
                      ))}
                      {/* Espaciadores invisibles */}
                      <div className="h-8"></div>
                      <div className="h-8"></div>
                      <div className="h-8"></div>
                  <div className="h-8"></div>
                    </>
                  ) : (
                    <p>No Pokémon found.</p>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="grid">
              {activeTab === 'grid' && (
                <div className="grid grid-cols-2 gap-4 overflow-y-auto h-[58vh]">
                  {filteredPokemons.map((pokemon) => (
                    <div
                      key={pokemon.id}
                      className="p-4 bg-gray-100 rounded-lg flex items-center flex-col hover:shadow-lg transition-shadow"
                    >
                      {pokemon.image && (
                        <img
                          src={pokemon.image}
                          alt={pokemon.name}
                          className="w-20 h-20 object-contain mb-2"
                        />
                      )}
                      <h2 className="text-lg font-bold">{pokemon.name}</h2>
                      <p>ID: {pokemon.id}</p>
                      <p>Count: {pokemonCounts[pokemon.id]}</p>
                      {pokemonCounts[pokemon.id] >= 3 && pokemon.evolves_to && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => evolvePokemon(pokemon.id)}
                          className="text-green-500 border-green-500 hover:bg-green-100 mt-2"
                        >
                          Evolve
                        </Button>
                      )}
                    </div>
                  ))}
                  {/* Espaciadores invisibles */}
                  <div className="h-8"></div>
                  <div className="h-8"></div>
                  <div className="h-8"></div>
                  <div className="h-8"></div>
                </div>
              )}
            </TabsContent>
           <div className="h-8"></div>
          <div className="h-8"></div>
          <div className="h-8"></div>

              <TabsContent value="team">
                {activeTab === 'team' && <TeamManagement />}
              </TabsContent>
              <TabsContent value="rival">
                {activeTab === 'rival' && <RivalAnalysis />}
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
        </CardContent>
      {isScanning && <div>QR Scanner Placeholder</div>}
      {isAIAssistantOpen && <div>AI Assistant Placeholder</div>}
    </Card>
  );
}
