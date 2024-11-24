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

  const [captureDialogState, setCaptureDialogState] = useState({
    isOpen: false,
    message: "",
    success: false,
  });
  
  // Load zones from localStorage
  const getZonesFromLocalStorage = (): string[] => {
    return JSON.parse(localStorage.getItem("zones") || "[]");
  };

  // Add zone to localStorage if not exists
  const addZoneToLocalStorage = (zoneId: string) => {
    const localZones = getZonesFromLocalStorage();
    if (!localZones.includes(zoneId)) {
      localZones.push(zoneId);
      localStorage.setItem("zones", JSON.stringify(localZones));
    }
  };

  // Fetch Pokémon details
  const fetchPokemonDetails = async () => {
    try {
      const response = await fetch(pokemonUrl, { method: "GET" });
      if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
      const data = await response.json();
      setPokemonDetails(data);

      // Process Pokémon zones
      data.forEach((pokemon: any) => {
        pokemon.location_area_encounters.forEach((zoneId: string) => {
          addZoneToLocalStorage(zoneId); // Add zone to localStorage if not exists
        });
      });
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
      <h2 className="text-2xl font-bold mb-4">Zonas y Pokémons</h2>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
  
      {Object.keys(pokemonByLocation).length > 0 ? (
        <div className="overflow-y-auto max-h-screen px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(zonesData)
              .filter(([zoneId]) => getZonesFromLocalStorage().includes(zoneId)) // Show only zones in localStorage
              .sort((a, b) => a[1].localeCompare(b[1])) // Sort by zone name
              .map(([zoneId, zoneName]) => (
                <Button
                  key={zoneId}
                  onClick={() => handleOpenDialog(zoneId)}
                  className="w-full  bg-[var(--cards-background-modal)] hover:bg-blue-300  rounded-lg p-4"
                >
                  {zoneName || `Zone ${zoneId}`}
                </Button>
              ))}
            <div className="h-16 invisible"></div>
            <div className="h-16 invisible"></div>
            <div className="h-16 invisible"></div>
            <div className="h-16 invisible"></div>
          </div>
        </div>
      ) : (
        <p>Loading Pokémon details...</p>
      )}
  
      {selectedZone && (
        <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
          <DialogContent className="sm:max-w-[600px] bg-[var(--cards-background-modal)]">
            <DialogHeader>
              <DialogTitle>{zonesData[selectedZone] || `Zone ${selectedZone}`}</DialogTitle>
              <DialogDescription>Pokémons encontrados en esta zona:</DialogDescription>
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
                      <p><strong>Nombre:</strong> {pokemon.name}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-4 flex flex-col gap-4">
              <Button
                onClick={async () => {
                  const teamId = localStorage.getItem("teamId");
                  if (!teamId) {
                    setCaptureDialogState({
                      isOpen: true,
                      message: "Team ID not found. Please log in.",
                      success: false,
                    });
                    return;
                  }
  
                  try {
                    const response = await fetch(`${zoneUrl}${selectedZone}`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ team_id: teamId }),
                    });
  
                    if (response.status === 200) {
                      const data = await response.json();
                      setCaptureDialogState({
                        isOpen: true,
                        message: "Pokémon captured successfully!",
                        success: true,
                      });
                    } else {
                      setCaptureDialogState({
                        isOpen: true,
                        message: "No Pokémon captured in this zone.",
                        success: false,
                      });
                    }
                  } catch (err) {
                    setCaptureDialogState({
                      isOpen: true,
                      message: "An error occurred while trying to capture in this zone.",
                      success: false,
                    });
                    console.error(err);
                  }
                }}
                className="w-full bg-green-500   rounded-lg"
              >
                Área de aparición
              </Button>
              <Button
                onClick={handleCloseDialog}
                className="w-full bg-red-500  rounded-lg"
              >
                Cerrar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
  
      <Dialog
        open={captureDialogState.isOpen}
        onOpenChange={() =>
          setCaptureDialogState({ ...captureDialogState, isOpen: false })
        }
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {captureDialogState.success ? "Success!" : "Failed!"}
            </DialogTitle>
            <DialogDescription>{captureDialogState.message}</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end mt-4">
            <Button
              onClick={() =>
                setCaptureDialogState({ isOpen: false, message: "", success: false })
              }
              className="bg-blue-500 hover:bg-blue-600"
            >
              {captureDialogState.success ? "Recargar" : "Cerrar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
    
  
};

export default ApiCycleComponentZones;
