'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QrCode, Mic, Search, Bot, List, Grid, LogOut, Sword, Map,  ComputerIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import RivalAnalysis from './rival-analysis';
import TeamManagement from './team-management';
import AIAssistant from './ai-assistant';
import VoiceRecognitionModal from './voicerecon';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import EventTriggerComponent from './zone';
import ThemeSwitch from './ThemeSwitch';
import axios from 'axios'
import Autofarmapp from './autofarm';

export default function Pokedex() {
  const teamUrl = 'https://hackeps-poke-backend.azurewebsites.net/teams/';
  const pokemonUrl = 'https://hackeps-poke-backend.azurewebsites.net/pokemons/';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [teamId, setTeamId] = useState<string | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [inputTeamId, setInputTeamId] = useState('');
  const [teamData, setTeamData] = useState<any>(null);
  const [pokemonDetails, setPokemonDetails] = useState<any[]>([]);
  const [pokemonCounts, setPokemonCounts] = useState<{ [key: string]: number }>({});
  const [filteredPokemons, setFilteredPokemons] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('name');
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('list');
  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);
  const [isZoneModalOpen2, setIsZoneModalOpen2] = useState(false);

  const [selectedPokemon, setSelectedPokemon] = useState<any | null>(null);
  const [isPokemonModalOpen, setIsPokemonModalOpen] = useState(false);
  const [funFact, setFunFact] = useState('');

  const openPokemonModal = (pokemon: any) => {
    setSelectedPokemon(pokemon);
    setIsPokemonModalOpen(true);
  };

  const closePokemonModal = () => {
    setSelectedPokemon(null);
    setIsPokemonModalOpen(false);
    setFunFact(''); // Reset fun fact
  };

  // Fetch fun fact from ChatGPT API when modal opens
  useEffect(() => {
    const fetchFunFact = async () => {
      if (selectedPokemon) {
        setFunFact('Cargando dato curioso...');
        try {
          const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
              model: 'gpt-4',
              messages: [
                {
                  role: 'system',
                  content:
                    "Imagínate que eres una Pokédex. No sabes qué son videojuegos; tus datos están escritos por entrenadores Pokémon.",
                },
                {
                  role: 'user',
                  content: `Dame un dato curioso en pocas líneas del Pokémon ${selectedPokemon.name}. Si no encuentras ninguno, escribe el mensaje "No se ha encontrado ningún dato curioso de este Pokémon aún". No pongas un "(nombre del Pokémon):" al inicio de la frase.`,
                },
              ],
              temperature: 0.7,
            },
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY_CHAT}`,
              },
            }
          );
          setFunFact(response.data.choices[0].message.content.trim());
        } catch (error) {
          console.error('Error fetching fun fact:', error);
          setFunFact('No se ha encontrado ningún dato curioso de este Pokémon aún.');
        }
      }
    };

    if (isPokemonModalOpen) {
      fetchFunFact();
    }
  }, [selectedPokemon, isPokemonModalOpen]);


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
    setRecognizedText(text); // Actualiza el estado con el texto reconocido
    setSearchQuery(text); // Establece el texto reconocido como el valor de búsqueda
    setIsModalOpen(false); // Cierra el modal de voz
    console.log('Recognized Text:', text); // Muestra el texto reconocido en la consola
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

      // Check and update local storage with zones
      const localStorageZones = JSON.parse(localStorage.getItem("zones") || "[]");
      const pokemonZones = data.location_area_encounters || [];

      pokemonZones.forEach((zoneId: string) => {
        if (!localStorageZones.includes(zoneId)) {
          localStorageZones.push(zoneId);
        }
      });

      localStorage.setItem("zones", JSON.stringify(localStorageZones));

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





    <Card className="w-full h-[90vh] max-w-4xl mx-auto  bg-[var(--background)] shadow-xl rounded-lg overflow-hidden">
      {/* Pokémon Details Modal */}
      <Dialog open={isPokemonModalOpen} onOpenChange={setIsPokemonModalOpen}>
        <DialogContent className="sm:max-w-[600px] bg-[var(--cards-background-modal)]">
          <DialogHeader>
            <DialogTitle>{selectedPokemon?.name}</DialogTitle>
            <DialogDescription>ID: {selectedPokemon?.id}</DialogDescription>
          </DialogHeader>
          {selectedPokemon && (
            <div>
              <img
                src={selectedPokemon.image}
                alt={selectedPokemon.name}
                className="w-full max-h-[200px] object-contain mb-4 border border-[var(--borde-items)]"
              />
              <p>
                <strong>Tipo:</strong>{' '}
                {selectedPokemon.types
                  ?.map((type: { type: { name: string } }) => type.type.name)
                  .join(', ') || 'Unknown'}
              </p>
              <p>
                <strong>Altura:</strong> {selectedPokemon.height || 'Unknown'}
              </p>
              <p>
                <strong>Peso:</strong> {selectedPokemon.weight || 'Unknown'}
              </p>
              <p>
                <strong>Habilidades:</strong>{' '}
                {selectedPokemon.abilities
                  ?.map((ability: { ability: { name: string } }) => ability.ability.name)
                  .join(', ') || 'Unknown'}
              </p>
              {selectedPokemon.evolves_to && (
                <p>
                  <strong>Evoluciona a:</strong>{' '}
                  {Array.isArray(selectedPokemon.evolves_to)
                    ? selectedPokemon.evolves_to.map((evolution: { name: string }) => evolution.name).join(', ')
                    : selectedPokemon.evolves_to?.name || 'None'}
                </p>
              )}
              <p>
                <strong>Cantidad capturados:</strong> {pokemonCounts[selectedPokemon.id] || 0}
              </p>
              <p>
                <strong>Fun Fact:</strong> {funFact}
              </p>
            </div>
          )}
          <div className="mt-4 flex justify-end">
            <Button
              onClick={closePokemonModal}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={isLoginModalOpen}>
  {isLoginModalOpen && (
    <div
      className="fixed inset-0 bg-cover bg-center z-40"
      style={{
        backgroundImage: "url('/pokeball.jpg')", // Ruta de la imagen en 'public'
      }}
    ></div>
  )}
  <DialogContent className="sm:max-w-[425px] bg-[var(--cards-background-modal)] z-50  mx-auto">
    <DialogHeader>
      <DialogTitle>Login</DialogTitle>
      <DialogDescription>Introduce tu ID de equipo</DialogDescription>
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
      <Button
        onClick={() => {
          handleLogin(); // Tu función de login
          setIsLoginModalOpen(false); // Cierra el modal al loguear
        }}
      >
        Login
      </Button>
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

            <ThemeSwitch />
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsZoneModalOpen2(true)} // Estado para abrir el modal
              className="rounded-lg border border-[var(--borde-items)] bg-[var(--cards-background-modal)]  hover:bg-yellow-100"
            >
              <ComputerIcon size={24} className="text-red-500" />
            </Button>

            <Dialog open={isZoneModalOpen2} onOpenChange={setIsZoneModalOpen2}>
              <DialogContent className="sm:max-w-[425px] bg-[var(--cards-background-modal)]">
                <DialogHeader>
                  <DialogTitle>AutoFarm</DialogTitle>
                  <DialogDescription>
                    Gestiona automáticamente las zonas guardadas.
                  </DialogDescription>
                </DialogHeader>
                <Autofarmapp /> {/* Se incluye el componente Autofarmapp */}
                <div className="flex justify-end mt-4">
                  <Button
                    onClick={() => setIsZoneModalOpen2(false)}
                    className="bg-red-500  hover:bg-red-600"
                  >
                    Cerrar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsZoneModalOpen(true)}
              className="rounded-lg border border-[var(--borde-items)] bg-[var(--cards-background-modal)] microfono hover:bg-yellow-100"
            >
              <QrCode size={24} className="text-red-500" />
            </Button>

            <Dialog open={isZoneModalOpen} onOpenChange={setIsZoneModalOpen}>
              <DialogContent className="sm:max-w-[425px] bg-[var(--cards-background-modal)]">
                <DialogHeader>
                  <DialogTitle>Zona QR</DialogTitle>
                  <DialogDescription>
                    Aquí puedes escanear un código QR o realizar alguna acción específica.
                  </DialogDescription>
                </DialogHeader>
                <EventTriggerComponent /> {/* Incluimos el componente del escáner QR */}
                <div className="flex justify-end mt-4">
                  <Button
                    onClick={() => setIsZoneModalOpen(false)}
                    className="bg-red-500  hover:bg-red-600"
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
              className="rounded-lg  border border-[var(--borde-items)] hover:bg-yellow-100 bg-[var(--cards-background-modal)]"
            >
              <Bot size={24} className="text-red-500" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={handleLogout}
              className="rounded-lg border-2 border-red-500 hover:bg-red-100 bg-[var(--cards-background-modal)]"
            >
              <LogOut size={24} className="text-red-500" />
            </Button>
          </div>
        </div>

        <Tabs defaultValue="list" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="flex md:grid md:grid-cols-4 border border-[var(--borde-items)] justify-between items-center w-full mb-4 bg-[var(--cards-background)] h-[40px] md:h-[55px] p-2">
            <TabsTrigger
              value="list"
              className="flex items-center justify-center data-[state=active]:bg-red-500  px-2 py-1 rounded-md"
            >
              <List size={24} className="md:mr-2" />
              <span className="hidden md:inline">Lista</span>
            </TabsTrigger>
            <TabsTrigger
              value="grid"
              className="flex items-center justify-center data-[state=active]:bg-blue-500  px-2 py-1 rounded-md"
            >
              <Grid size={24} className="md:mr-2" />
              <span className="hidden md:inline">Grid</span>
            </TabsTrigger>
            <TabsTrigger
              value="team"
              className="flex items-center justify-center data-[state=active]:bg-green-500 d px-2 py-1 rounded-md"
            >
              <Map size={24} className="md:mr-2" />
              <span className="hidden md:inline">Zonas</span>
            </TabsTrigger>
            <TabsTrigger
              value="rival"
              className="flex items-center justify-center data-[state=active]:bg-yellow-500  px-2 py-1 rounded-md"
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
                    placeholder={recognizedText}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-10 bg-[var(--cards-background)]"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-400" size={20} />
                </div>
                <div className="w-full md:w-auto">
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="border border-[var(--borde-items)]  rounded-lg px-4 py-2 bg-[var(--cards-background)] w-full md:w-auto"
                  >
                    <option value="name">Filtrar por nombre</option>
                    <option value="id">Filtrar por ID</option>
                    <option value="count">Filtrar por duplicados</option>
                    <option value="type">Filtrar por tipo</option>
                    <option value="evolves">Filtrar por evolucionables</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-center align-centerflex  items-center gap-4">
                <Button
                  variant="outline"

                  onClick={evolveAll}
                  className="rounded-lg p-1 text-lg border-2 border-green-500 hover:bg-green-300 hover:text-black bg-[var(--cards-background)] text-green-500 w-[100%] h-[80%] "
                >
                  Evolucionar todos
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsModalOpen(true)}
                  className="rounded-lg border-2 border-borderButtons hover:bg-yellow-100 bg-[var(--cards-background)] "
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
                    className="p-4 bg-[var(--cards-background)] rounded-lg mb-2 flex items-center justify-between hover:shadow-lg transition-shadow hover:border-2 hover:border-gray cursor-pointer"
                  >
                    <div className="flex items-center ">
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
                    className="p-4 bg-[var(--cards-background)] rounded-lg flex items-center flex-col hover:shadow-lg transition-shadow hover:border-2 hover:border-gray cursor-pointer"
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
