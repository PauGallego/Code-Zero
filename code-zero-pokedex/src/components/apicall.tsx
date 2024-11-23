"use client";

import React, { useEffect, useState } from "react";

const ApiCycleComponent: React.FC = () => {
  const teamUrl = "https://hackeps-poke-backend.azurewebsites.net/teams/";
  const pokemonUrl = "https://hackeps-poke-backend.azurewebsites.net/pokemons/";
  const teamId = "63bf06cf-e720-4134-9252-f195668c6048";

  const [teamData, setTeamData] = useState<any>(null);
  const [pokemonDetails, setPokemonDetails] = useState<any[]>([]);
  const [pokemonCounts, setPokemonCounts] = useState<{ [key: string]: number }>(
    {}
  );
  const [filteredPokemons, setFilteredPokemons] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showDuplicatesOnly, setShowDuplicatesOnly] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const specialImageUrl = "https://solsolete.es/files/product_images/2024/02/05/Patito%20ba%C3%B1o%20TOlo%C3%A7.jpg";

  const fetchTeamData = async () => {
    const url = `${teamUrl}${teamId}`;
    try {
      const response = await fetch(url, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log("Team data fetched successfully:", data);
      setTeamData(data);
    } catch (err: any) {
      console.error("Error fetching team data:", err.message);
      setError(err.message);
    }
  };

  const fetchPokemonDetails = async (pokemonId: string) => {
    const url = `${pokemonUrl}${pokemonId}`;
    try {
      const response = await fetch(url, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();

      // Check for Hackduck and assign the special image URL
      if (data.name === "Hackduck") {
        data.image = specialImageUrl;
      }

      console.log(`Pokemon data for ID ${pokemonId} fetched successfully:`, data);

      setPokemonDetails((prev) =>
        prev.find((pokemon) => pokemon.id === data.id)
          ? prev
          : [...prev, data]
      );
    } catch (err: any) {
      console.error(`Error fetching data for Pokemon ID ${pokemonId}:`, err.message);
    }
  };

  const evolvePokemon = async (pokemonId: string) => {
    const duplicates = teamData.captured_pokemons
      .filter((p: { pokemon_id: string }) => p.pokemon_id === pokemonId)
      .map((p: { id: string }) => p.id);

    if (duplicates.length < 3) {
      alert(`You need at least 3 duplicates to evolve Pokémon ${pokemonId}.`);
      return;
    }

    const url = `${pokemonUrl}${pokemonId}/evolve`;
    const payload = {
      pokemon_uuid_list: duplicates.slice(0, 3), // Take only 3 duplicates
      team_id: teamId,
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log(`Pokemon evolved successfully:`, data);
      alert(`Pokemon ${pokemonId} evolved successfully!`);
    } catch (err: any) {
      console.error(`Error evolving Pokémon with ID ${pokemonId}:`, err.message);
      alert(`Error evolving Pokémon ${pokemonId}. Please try again.`);
    }
  };

  const evolveAll = async () => {
    const evolvablePokemons = Object.entries(pokemonCounts)
      .filter(([pokemonId, count]) => count >= 3)
      .map(([pokemonId]) => pokemonId);

    if (evolvablePokemons.length === 0) {
      alert("No Pokémon available to evolve.");
      return;
    }

    for (const pokemonId of evolvablePokemons) {
      await evolvePokemon(pokemonId); // Sequentially evolve each Pokémon
    }

    alert("All eligible Pokémon have been evolved.");
    window.location.reload(); // Reload the page to reflect changes
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchTeamData();
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (teamData && teamData.captured_pokemons) {
      // Count the occurrences of each Pokémon ID
      const counts: { [key: string]: number } = {};
      teamData.captured_pokemons.forEach((pokemon: { pokemon_id: string }) => {
        counts[pokemon.pokemon_id] = (counts[pokemon.pokemon_id] || 0) + 1;
      });
      setPokemonCounts(counts);

      // Fetch details only once for each unique Pokémon ID
      const uniquePokemonIds = Object.keys(counts);
      uniquePokemonIds.forEach((pokemonId) => {
        fetchPokemonDetails(pokemonId);
      });
    }
  }, [teamData]);

  useEffect(() => {
    // Filter pokemons based on search query and duplicate filter
    const filtered = pokemonDetails.filter((pokemon) => {
      const isDuplicate = (pokemonCounts[pokemon.id] || 1) > 1;
      const matchesSearch = pokemon.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesSearch && (!showDuplicatesOnly || isDuplicate);
    });
    setFilteredPokemons(filtered);
  }, [searchQuery, showDuplicatesOnly, pokemonDetails, pokemonCounts]);

  return (
    <div>
      <h1>Team Info</h1>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      {teamData ? (
        <div>
          <h2>{teamData.name}</h2>
          <p>PVE Score: {teamData.pve_score}</p>
          <p>PVP Score: {teamData.pvp_score}</p>
          <p>Pokedex Score: {teamData.pokedex_score}</p>
        </div>
      ) : (
        <p>Loading team data...</p>
      )}
      <div style={{ marginTop: "20px", marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search Pokémon..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            padding: "10px",
            fontSize: "16px",
            marginRight: "10px",
            border: "1px solid #ccc",
            borderRadius: "5px",
          }}
        />
        <button
          onClick={() => setShowDuplicatesOnly((prev) => !prev)}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            cursor: "pointer",
            border: "none",
            borderRadius: "5px",
            backgroundColor: showDuplicatesOnly ? "#007bff" : "#ccc",
            color: "#fff",
            marginRight: "10px",
          }}
        >
          {showDuplicatesOnly ? "Show All" : "Show Duplicates Only"}
        </button>
        <button
          onClick={evolveAll}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            cursor: "pointer",
            border: "none",
            borderRadius: "5px",
            backgroundColor: "#28a745",
            color: "#fff",
          }}
        >
          Evolve All
        </button>
      </div>
      <h1>Captured Pokemons</h1>
      {filteredPokemons.length > 0 ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: "20px",
          }}
        >
          {filteredPokemons.map((pokemon, index) => (
            <div
              key={index}
              style={{
                border: "1px solid #ccc",
                borderRadius: "10px",
                padding: "10px",
                textAlign: "center",
                backgroundColor: "#f9f9f9",
              }}
            >
              <h3>{pokemon.name}</h3>
              {pokemon.image && (
                <img
                  src={pokemon.image}
                  alt={`Pokemon ${pokemon.name}`}
                  style={{ width: "100px", height: "100px", marginBottom: "10px" }}
                />
              )}
              <p>
                <strong>Count:</strong> {pokemonCounts[pokemon.id] || 1}
              </p>
              {pokemonCounts[pokemon.id] >= 3 && (
                <button
                  onClick={() => evolvePokemon(pokemon.id)}
                  style={{
                    padding: "5px 10px",
                    fontSize: "14px",
                    cursor: "pointer",
                    border: "none",
                    borderRadius: "5px",
                    backgroundColor: "#28a745",
                    color: "#fff",
                  }}
                >
                  Evolve
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p>Loading Pokémon details...</p>
      )}
    </div>
  );
};

export default ApiCycleComponent;
