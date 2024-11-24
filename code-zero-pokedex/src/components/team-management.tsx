'use client';

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const ApiCycleComponentZones: React.FC = () => {
  const pokemonUrl = "https://hackeps-poke-backend.azurewebsites.net/pokemons";
  const zoneUrl = "https://hackeps-poke-backend.azurewebsites.net/zones/";

  const [pokemonDetails, setPokemonDetails] = useState<any[]>([]);
  const [zonesData, setZonesData] = useState<{ [key: string]: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch Pokémon details
  const fetchPokemonDetails = async () => {
    try {
      const response = await fetch(pokemonUrl, { method: "GET" });
      if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
      const data = await response.json();
      setPokemonDetails(data);
    } catch (err: any) {
      console.error("Error fetching Pokémon data:", err.message);
      setError(err.message);
    }
  };

  // Fetch Zone Name
  const fetchZoneName = async (zoneId: string) => {
    try {
      const response = await fetch(`${zoneUrl}${zoneId}`, { method: "GET" });
      if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
      const zoneData = await response.json();
      setZonesData((prevZones) => ({ ...prevZones, [zoneId]: zoneData.name }));
    } catch (err: any) {
      console.error(`Error fetching zone data for zone ID ${zoneId}:`, err.message);
    }
  };

  // Organize Pokémon by location
  const organizePokemonsByLocation = (pokemons: any[]) => {
    const locationMap: { [key: string]: any[] } = {};
    pokemons.forEach((pokemon) => {
      pokemon.location_area_encounters.forEach((zoneId: string) => {
        if (!zonesData[zoneId]) fetchZoneName(zoneId);
        if (!locationMap[zoneId]) locationMap[zoneId] = [];
        if (!locationMap[zoneId].some((p: any) => p.id === pokemon.id)) {
          locationMap[zoneId].push(pokemon);
        }
      });
    });
    return locationMap;
  };

  const pokemonByLocation = organizePokemonsByLocation(pokemonDetails);

  useEffect(() => {
    fetchPokemonDetails();
  }, []);

  const handleOpenDialog = (zoneId: string) => {
    setSelectedZone(zoneId);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setSelectedZone(null);
    setIsDialogOpen(false);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Zones and Pokémon</h2>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      {Object.keys(pokemonByLocation).length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(zonesData)
            .sort((a, b) => a[1].localeCompare(b[1])) // Sort by zone name
            .map(([zoneId, zoneName]) => (
              <Button
                key={zoneId}
                onClick={() => handleOpenDialog(zoneId)}
                className="w-full bg-blue-500 text-white rounded-lg p-4"
              >
                {zoneName || `Zone ${zoneId}`}
              </Button>
            ))}
        </div>
      ) : (
        <p>Loading Pokémon details...</p>
      )}

      {selectedZone && (
        <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{zonesData[selectedZone] || `Zone ${selectedZone}`}</DialogTitle>
              <DialogDescription>
                Pokémon found in this zone:
              </DialogDescription>
            </DialogHeader>
            <div className="overflow-y-auto h-[400px] space-y-4">
              <ul>
                {pokemonByLocation[selectedZone]?.map((pokemon: any) => (
                  <li key={pokemon.id} className="flex items-center gap-4">
                    <img
                      src={pokemon.image}
                      alt={pokemon.name}
                      className="w-16 h-16 object-contain"
                    />
                    <div>
                      <p><strong>ID:</strong> {pokemon.id}</p>
                      <p><strong>Name:</strong> {pokemon.name}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <Button
              onClick={handleCloseDialog}
              className="mt-4 w-full bg-red-500 text-white rounded-lg"
            >
              Close
            </Button>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ApiCycleComponentZones;
