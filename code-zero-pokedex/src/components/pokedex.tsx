'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QrCode, Mic, Search, Bot, List, Grid, LogOut, Sword, Map } from 'lucide-react';
import { motion } from 'framer-motion';
import RivalAnalysis from './rival-analysis';
import TeamManagement from './team-management';
import AIAssistant from './ai-assistant';
import VoiceRecognitionModal from './voicerecon';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export default function Pokedex() {
  const teamUrl = 'https://hackeps-poke-backend.azurewebsites.net/teams/';
  const pokemonUrl = 'https://hackeps-poke-backend.azurewebsites.net/pokemons/';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [teamId, setTeamId] = useState<string | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [inputTeamId, setInputTeamId] = useState('');
  const [teamData, setTeamData] = useState<any>(null);
  const [pokemonDetails, setPokemonDetails] = useState<any[]>([]);
  const [pokemonCounts, setPokemonCounts] = useState<{ [key: string]: number }>({});
  const [filteredPokemons, setFilteredPokemons] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('name');
  const [isScanning, setIsScanning] = useState(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('list');
  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);

  const [selectedPokemon, setSelectedPokemon] = useState<any | null>(null);
  const [isPokemonModalOpen, setIsPokemonModalOpen] = useState(false);

  const openPokemonModal = (pokemon: any) => {
    setSelectedPokemon(pokemon);
    setIsPokemonModalOpen(true);
  };

  const closePokemonModal = () => {
    setSelectedPokemon(null);
    setIsPokemonModalOpen(false);
  };

  const specialImageUrl =
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNTOGFBPoc4jlP9M1HrOe8AAQyzAy9NGVGZQ&s';
  const specialImageUrl2 =
    'https://canarddebain.com/cdn/shop/products/CanardPerroquetPirate-Lilalu02.png?v=1640250617';

  useEffect(() => {
    const storedTeamId = localStorage.getItem('teamId');
    if (storedTeamId) {
      setTeamId(storedTeamId);
    } else {
      setIsLoginModalOpen(true);
    }
  }, []);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async () => {
    if (inputTeamId.trim()) {
      try {
        const response = await fetch(`https://hackeps-poke-backend.azurewebsites.net/teams/${inputTeamId.trim()}`);
        if (!response.ok) {
          throw new Error('Team not found');
        }

        const teamData = await response.json(); // Optional: usar si necesitas datos del equipo
        console.log('Team data retrieved:', teamData);

        localStorage.setItem('teamId', inputTeamId.trim());
        setTeamId(inputTeamId.trim());
        setInputTeamId('');
        setIsLoginModalOpen(false);
        setErrorMessage(null); // Clear any previous errors
      } catch (error) {
        console.error('Error fetching team:', error);
        setErrorMessage('Team ID is invalid. Please try again.');
      }
    } else {
      setErrorMessage('Team ID cannot be empty.');
    }
  };


  const handleLogout = () => {
    localStorage.removeItem('teamId');
    window.location.reload();
  };

  const handleRecognize = (text: string) => {
    setRecognizedText(text);
    console.log('Recognized Text:', text);
  };

  const fetchTeamData = async () => {
    if (!teamId) return; // Prevent fetch if teamId is null
    try {
      const response = await fetch(`${teamUrl}${teamId}`);
      if (!response.ok) throw new Error(`Error fetching team: ${response.status}`);
      const data = await response.json();
      setTeamData(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPokemonDetails = async (pokemonId: string) => {
    try {
      const response = await fetch(`${pokemonUrl}${pokemonId}`);
      if (!response.ok) throw new Error(`Error fetching Pokémon: ${response.status}`);
      const data = await response.json();

      if (data.name === 'Cyberquack') {
        data.image = specialImageUrl;
      } else if (data.name === 'Hackduck') {
        data.image = specialImageUrl2;
      }

      setPokemonDetails((prev) =>
        prev.find((p) => p.id === data.id) ? prev : [...prev, data]
      );
    } catch (err) {
      console.error(err);
    }
  };

  const evolvePokemon = async (pokemonId: string) => {
    if (!teamData) return;

    const duplicates = teamData.captured_pokemons
      .filter((p: { pokemon_id: string }) => p.pokemon_id === pokemonId)
      .map((p: { id: string }) => p.id);

    if (duplicates.length < 3) {
      alert('You need at least 3 duplicates to evolve this Pokémon.');
      return;
    }

    try {
      const response = await fetch(`${pokemonUrl}${pokemonId}/evolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pokemon_uuid_list: duplicates.slice(0, 3),
          team_id: teamId,
        }),
      });

      if (!response.ok) throw new Error('Failed to evolve Pokémon.');
      alert('Pokémon evolved successfully.');
      fetchTeamData(); // Refresh the team data after evolution
    } catch (err) {
      console.error(err);
    }
  };

  const evolveAll = async () => {
    if (!teamData) return;

    const evolvablePokemons = pokemonDetails.filter((pokemon) => {
      const count = pokemonCounts[pokemon.id] || 0;
      return count >= 3 && pokemon.evolves_to;
    });

    for (const pokemon of evolvablePokemons) {
      await evolvePokemon(pokemon.id);
    }

    alert('Evolved all eligible Pokémon.');
  };

  useEffect(() => {
    if (teamId) {
      fetchTeamData();
    }
  }, [teamId]);

  useEffect(() => {
    if (teamData && teamData.captured_pokemons) {
      const counts: { [key: string]: number } = {};
      teamData.captured_pokemons.forEach((p: { pokemon_id: string }) => {
        counts[p.pokemon_id] = (counts[p.pokemon_id] || 0) + 1;
      });
      setPokemonCounts(counts);

      Object.keys(counts).forEach(fetchPokemonDetails);
    }
  }, [teamData]);

  useEffect(() => {
    const sorted = [...pokemonDetails].filter((pokemon) =>
      pokemon.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    sorted.sort((a, b) => {
      if (sortOrder === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortOrder === 'id') {
        return a.id - b.id;
      } else if (sortOrder === 'count') {
        return (pokemonCounts[b.id] || 0) - (pokemonCounts[a.id] || 0);
      } else if (sortOrder === 'type') {
        return (a.types?.[0]?.type?.name || '').localeCompare(b.types?.[0]?.type?.name || '');
      } else if (sortOrder === 'evolves') {
        return a.evolves_to ? -1 : 1;
      }
      return 0;
    });

    setFilteredPokemons(sorted);
  }, [searchQuery, sortOrder, pokemonDetails, pokemonCounts]);

  return (





    <Card className="w-full h-[90vh] max-w-4xl mx-auto bg-[#fffaf2] shadow-xl rounded-lg overflow-hidden">
      {/* Pokémon Details Modal */}
      <Dialog open={isPokemonModalOpen} onOpenChange={setIsPokemonModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedPokemon?.name}</DialogTitle>
            <DialogDescription>ID: {selectedPokemon?.id}</DialogDescription>
          </DialogHeader>
          {selectedPokemon && (
            <div>
              <img
                src={selectedPokemon.image}
                alt={selectedPokemon.name}
                className="w-full max-h-[200px] object-contain mb-4"
              />
              <p>
                <strong>Type:</strong>{' '}
                {selectedPokemon.types
                  ?.map((type: { type: { name: string } }) => type.type.name)
                  .join(', ') || 'Unknown'}
              </p>
              <p>
                <strong>Height:</strong> {selectedPokemon.height || 'Unknown'}
              </p>
              <p>
                <strong>Weight:</strong> {selectedPokemon.weight || 'Unknown'}
              </p>
              <p>
                <strong>Abilities:</strong>{' '}
                {selectedPokemon.abilities
                  ?.map((ability: { ability: { name: string } }) => ability.ability.name)
                  .join(', ') || 'Unknown'}
              </p>
              {selectedPokemon.evolves_to && (
                <p>
                  <strong>Evolves To:</strong>{' '}
                  {Array.isArray(selectedPokemon.evolves_to)
                    ? selectedPokemon.evolves_to.map((evolution: { name: string }) => evolution.name).join(', ')
                    : selectedPokemon.evolves_to?.name || 'None'}
                </p>
              )}
              <p>
                <strong>Captured Count:</strong> {pokemonCounts[selectedPokemon.id] || 0}
              </p>
              <p>
                <strong>Fun Fact:</strong> No hay fun fact
              </p>
            </div>
          )}
          <div className="mt-4 flex justify-end">
            <Button
              onClick={closePokemonModal}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>


      <Dialog open={isLoginModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Login</DialogTitle>
            <DialogDescription>Enter your Team ID to continue.</DialogDescription>
          </DialogHeader>
          <Input
            value={inputTeamId}
            onChange={(e) => setInputTeamId(e.target.value)}
            placeholder="Enter your Team ID"
          />
          {errorMessage && (
            <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
          )}
          <div className="flex justify-end mt-4">
            <Button onClick={handleLogin}>Login</Button>
          </div>
        </DialogContent>
      </Dialog>


      <AIAssistant isOpen={isAIAssistantOpen} onClose={() => setIsAIAssistantOpen(false)} />
      <CardContent className="p-6">
        <div className="flex flex-col items-center md:flex-row md:justify-between mb-4">
          <motion.h1
            className="text-4xl font-bold text-red-500 drop-shadow-lg mb-4 md:mb-0 text-center"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            Pokedex
          </motion.h1>
          <div className="flex items-center justify-center space-x-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsZoneModalOpen(true)}
              className="rounded-lg border-2 border-borderButtons hover:bg-yellow-100 bg-white/90"
            >
              <QrCode size={24} className="text-red-500" />
            </Button>

            <Dialog open={isZoneModalOpen} onOpenChange={setIsZoneModalOpen}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Zona QR</DialogTitle>
                  <DialogDescription>
                    Aquí puedes escanear un código QR o realizar alguna acción específica.
                  </DialogDescription>
                </DialogHeader>
                {/* Contenido adicional del modal aquí */}
                <div className="flex justify-end mt-4">
                  <Button
                    onClick={() => setIsZoneModalOpen(false)}
                    className="bg-red-500 text-white hover:bg-red-600"
                  >
                    Cerrar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsAIAssistantOpen(true)}
              className="rounded-lg border-2 border-borderButtons hover:bg-yellow-100 bg-white/90"
            >
              <Bot size={24} className="text-red-500" />
            </Button>

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

        <Tabs defaultValue="list" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="flex md:grid md:grid-cols-4 justify-between items-center w-full mb-4 bg-[#d7d7d7] h-[40px] md:h-[55px] p-2">
            <TabsTrigger
              value="list"
              className="flex items-center justify-center data-[state=active]:bg-red-500 data-[state=active]:text-white px-2 py-1 rounded-md"
            >
              <List size={24} className="md:mr-2" />
              <span className="hidden md:inline">List</span>
            </TabsTrigger>
            <TabsTrigger
              value="grid"
              className="flex items-center justify-center data-[state=active]:bg-blue-500 data-[state=active]:text-white px-2 py-1 rounded-md"
            >
              <Grid size={24} className="md:mr-2" />
              <span className="hidden md:inline">Grid</span>
            </TabsTrigger>
            <TabsTrigger
              value="team"
              className="flex items-center justify-center data-[state=active]:bg-green-500 data-[state=active]:text-white px-2 py-1 rounded-md"
            >
              <Map size={24} className="md:mr-2" />
              <span className="hidden md:inline">Zonas</span>
            </TabsTrigger>
            <TabsTrigger
              value="rival"
              className="flex items-center justify-center data-[state=active]:bg-yellow-500 data-[state=active]:text-white px-2 py-1 rounded-md"
            >
              <Sword size={24} className="md:mr-2" />
              <span className="hidden md:inline">Torneos</span>
            </TabsTrigger>
          </TabsList>

          {['list', 'grid'].includes(activeTab) && (
            <div className="mb-6">
              <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
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
              <div className="flex justify-center align-centerflex  items-center gap-4">
                <Button
                  variant="outline"

                  onClick={evolveAll}
                  className="rounded-lg border-2 border-green-500 hover:bg-green-100 bg-white/90 text-green-500 w-[100%] h-[80%] "
                >
                  Evolve All
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsModalOpen(true)}
                  className="rounded-lg border-2 border-borderButtons hover:bg-yellow-100 bg-white/90 "
                >
                  <Mic size={24} className="text-red-500" />
                </Button>
                <VoiceRecognitionModal
                  isOpen={isModalOpen}
                  onClose={() => setIsModalOpen(false)}
                  onRecognize={handleRecognize}
                />
              </div>
            </div>
          )}


          <TabsContent value="list">
            {activeTab === 'list' && (
              <div className="overflow-y-auto h-[60vh]">
                {filteredPokemons.map((pokemon) => (
                  <div
                    key={pokemon.id}
                    onClick={() => openPokemonModal(pokemon)}
                    className="p-4 bg-gray-100 rounded-lg mb-2 flex items-center justify-between hover:shadow-lg transition-shadow hover:border-2 hover:border-gray cursor-pointer"
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
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="grid">
            {activeTab === 'grid' && (
              <div className="grid grid-cols-2 gap-4 overflow-y-auto h-[58vh]">
                {filteredPokemons.map((pokemon) => (
                  <div
                    key={pokemon.id}
                    onClick={() => openPokemonModal(pokemon)}
                    className="p-4 bg-gray-100 rounded-lg flex items-center flex-col hover:shadow-lg transition-shadow cursor-pointer"
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
                        onClick={(e) => {
                          e.stopPropagation(); // Evitar que abra el modal al hacer clic en el botón.
                          evolvePokemon(pokemon.id);
                        }}
                        className="text-green-500 border-green-500 hover:bg-green-100 mt-2"
                      >
                        Evolve
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>


          <TabsContent value="team">
            {activeTab === 'team' && <TeamManagement />}
          </TabsContent>
          <TabsContent value="rival">
            {activeTab === 'rival' && <RivalAnalysis />}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );

}
