"use client";

import React, { useEffect, useState } from "react";

const ApiCycleComponentZones: React.FC = () => {
  const pokemonUrl = "https://hackeps-poke-backend.azurewebsites.net/pokemons";
  const zoneUrl = "https://hackeps-poke-backend.azurewebsites.net/zones/"; // Base URL para obtener detalles de las zonas

  const [pokemonDetails, setPokemonDetails] = useState<any[]>([]);
  const [zonesData, setZonesData] = useState<{ [key: string]: string }>({});
  const [error, setError] = useState<string | null>(null);

  // Función para obtener los detalles del Pokémon
  const fetchPokemonDetails = async () => {
    try {
      const response = await fetch(pokemonUrl, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log("All Pokémon data fetched successfully:", data);
      setPokemonDetails(data);
    } catch (err: any) {
      console.error("Error fetching Pokémon data:", err.message);
      setError(err.message);
    }
  };

  // Función para obtener el nombre de la zona a partir del zone_id
  const fetchZoneName = async (zoneId: string) => {
    try {
      const response = await fetch(`${zoneUrl}${zoneId}`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const zoneData = await response.json();
      setZonesData((prevZones) => ({
        ...prevZones,
        [zoneId]: zoneData.name, // Almacenamos el nombre de la zona usando el ID de la zona
      }));
    } catch (err: any) {
      console.error(`Error fetching zone data for zone ID ${zoneId}:`, err.message);
    }
  };

  // Función para organizar los Pokémon según las zonas de encuentro
  const organizePokemonsByLocation = (pokemons: any[]) => {
    const locationMap: { [key: string]: any[] } = {};

    // Organizar Pokémon por sus zonas de encuentro
    pokemons.forEach((pokemon) => {
      pokemon.location_area_encounters.forEach((zoneId: string) => {
        // Si aún no hemos guardado el nombre de la zona, lo solicitamos
        if (!zonesData[zoneId]) {
          fetchZoneName(zoneId);
        }

        // Si no existe la zona en el mapa, la añadimos
        if (!locationMap[zoneId]) {
          locationMap[zoneId] = [];
        }

        // Añadir el Pokémon a la zona, asegurándonos de que no se repita en la misma zona
        if (!locationMap[zoneId].some((p: any) => p.id === pokemon.id)) {
          locationMap[zoneId].push(pokemon);
        }
      });
    });

    return locationMap;
  };

  // Organizar Pokémon por las zonas
  const pokemonByLocation = organizePokemonsByLocation(pokemonDetails);

  useEffect(() => {
    fetchPokemonDetails();
  }, []);

  return (
    <div>
      <h1>All Pokemons</h1>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      {Object.keys(pokemonByLocation).length > 0 ? (
        Object.keys(pokemonByLocation).map((zoneId, index) => (
          <div key={index}>
            <h2>
              Location: {zonesData[zoneId] || "Loading..."} {/* Mostramos el nombre de la zona, o "Loading..." si aún no se ha cargado */}
            </h2>
            <ul>
              {pokemonByLocation[zoneId].map((pokemon) => (
                <li key={pokemon.id}>
                  <p>
                    <strong>ID:</strong> {pokemon.id}
                  </p>
                  <p>
                    <strong>Name:</strong> {pokemon.name}
                  </p>
                  <img src={pokemon.image} alt={pokemon.name} />
                  <p><strong>Height:</strong> {pokemon.height} meters</p>
                  <p><strong>Weight:</strong> {pokemon.weight} kg</p>
                  <p><strong>Cries:</strong> {pokemon.cries}</p>
                  <h3>Abilities</h3>
                  <ul>
                    {pokemon.abilities.map((ability: any, index: number) => (
                      <li key={index}>
                        <strong>{ability.ability.name}</strong> (Hidden: {ability.is_hidden ? "Yes" : "No"})
                      </li>
                    ))}
                  </ul>

                  <h3>Types</h3>
                  <ul>
                    {pokemon.types.map((type: any, index: number) => (
                      <li key={index}>{type.type.name}</li>
                    ))}
                  </ul>

                  <h3>Moves</h3>
                  <ul>
                    {pokemon.moves.map((move: any, index: number) => (
                      <li key={index}>{move.name}</li>
                    ))}
                  </ul>

                  <h3>Stats</h3>
                  <ul>
                    {pokemon.stats.map((stat: any, index: number) => (
                      <li key={index}>
                        {stat.stat.name}: {stat.base_stat} (Effort: {stat.effort})
                      </li>
                    ))}
                  </ul>

                  {pokemon.evolves_to && (
                    <div>
                      <h3>Evolves To:</h3>
                      <p>{pokemon.evolves_to.name} (ID: {pokemon.evolves_to.id})</p>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))
      ) : (
        <p>Loading Pokémon details...</p>
      )}
    </div>
  );
};

export default ApiCycleComponentZones;
