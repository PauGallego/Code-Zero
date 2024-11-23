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
  const [sortOrder, setSortOrder] = useState<string>("name");
  const [error, setError] = useState<string | null>(null);

  const specialImageUrl = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNTOGFBPoc4jlP9M1HrOe8AAQyzAy9NGVGZQ&s";

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
      setTeamData(data);
    } catch (err: any) {
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

      if (data.name === "Cyberquack") {
        data.image = specialImageUrl;
      }

      setPokemonDetails((prev) =>
        prev.find((pokemon) => pokemon.id === data.id)
          ? prev
          : [...prev, data]
      );
    } catch (err: any) {
      console.error(err.message);
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
      pokemon_uuid_list: duplicates.slice(0, 3), // Take the first 3 duplicates
      team_id: teamId,
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Failed to evolve Pokémon ${pokemonId}.`);
      }

      console.log(`Pokemon ${pokemonId} evolved successfully.`);
      alert(`Pokemon ${pokemonId} evolved successfully!`);

      // Refetch team data to update the list
      await fetchTeamData();
    } catch (err: any) {
      console.error(`Error evolving Pokémon ${pokemonId}:`, err.message);
      alert(`Error evolving Pokémon ${pokemonId}. Please try again.`);
    }
  };

  const evolveAll = async () => {
    if (!teamData || !teamData.captured_pokemons) {
      alert("No team data available.");
      return;
    }

    // Group captured Pokémon by their `pokemon_id` and count occurrences
    const duplicatesMap: { [key: string]: string[] } = {};
    teamData.captured_pokemons.forEach((pokemon: { id: string; pokemon_id: string }) => {
      if (!duplicatesMap[pokemon.pokemon_id]) {
        duplicatesMap[pokemon.pokemon_id] = [];
      }
      duplicatesMap[pokemon.pokemon_id].push(pokemon.id);
    });

    // Filter Pokémon that have at least 3 duplicates
    const evolvablePokemons = Object.entries(duplicatesMap).filter(
      ([pokemonId, ids]) =>
        ids.length >= 3 &&
        pokemonDetails.find((p) => p.id === pokemonId)?.can_evolve // Check if the Pokémon can evolve
    );

    if (evolvablePokemons.length === 0) {
      alert("No Pokémon available to evolve.");
      return;
    }

    for (const [pokemonId, ids] of evolvablePokemons) {
      const payload = {
        pokemon_uuid_list: ids.slice(0, 3), // Take the first 3 duplicates
        team_id: teamId,
      };

      try {
        const url = `${pokemonUrl}${pokemonId}/evolve`;
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`Failed to evolve Pokémon ${pokemonId}.`);
        }

        console.log(`Pokemon ${pokemonId} evolved successfully.`);
      } catch (err: any) {
        console.error(`Error evolving Pokémon ${pokemonId}:`, err.message);
      }
    }

    alert("All eligible Pokémon have been evolved.");

    // Refetch team data to update the list
    await fetchTeamData();
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchTeamData();
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (teamData && teamData.captured_pokemons) {
      const counts: { [key: string]: number } = {};
      teamData.captured_pokemons.forEach((pokemon: { pokemon_id: string }) => {
        counts[pokemon.pokemon_id] = (counts[pokemon.pokemon_id] || 0) + 1;
      });
      setPokemonCounts(counts);

      const uniquePokemonIds = Object.keys(counts);
      uniquePokemonIds.forEach((pokemonId) => {
        fetchPokemonDetails(pokemonId);
      });
    }
  }, [teamData]);

  useEffect(() => {
    const filtered = pokemonDetails.filter((pokemon) => {
      const isDuplicate = (pokemonCounts[pokemon.id] || 1) > 1;
      const matchesSearch = pokemon.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesSearch && (!showDuplicatesOnly || isDuplicate);
    });

    const sorted = filtered.sort((a, b) => {
      if (sortOrder === "count") {
        return (pokemonCounts[b.id] || 0) - (pokemonCounts[a.id] || 0);
      } else if (sortOrder === "type") {
        return (a.types[0]?.type.name || "").localeCompare(
          b.types[0]?.type.name || ""
        );
      } else if (sortOrder === "name") {
        return a.name.localeCompare(b.name);
      } else if (sortOrder === "id") {
        return a.id - b.id;
      }
      return 0;
    });

    setFilteredPokemons(sorted);
  }, [searchQuery, showDuplicatesOnly, pokemonDetails, pokemonCounts, sortOrder]);

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
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          style={{
            padding: "10px",
            fontSize: "16px",
            marginLeft: "10px",
            border: "1px solid #ccc",
            borderRadius: "5px",
          }}
        >
          <option value="name">Sort by Name</option>
          <option value="count">Sort by Count</option>
          <option value="type">Sort by Type</option>
          <option value="id">Sort by ID</option>
        </select>
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
            marginLeft: "10px",
          }}
        >
          Evolve All
        </button>
      </div>
      <h1>Captured Pokémons</h1>
      {filteredPokemons.length > 0 ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
            gap: "20px",
          }}
        >
          {filteredPokemons.map((pokemon, index) => (
            <div
              key={index}
              style={{
                border: "1px solid #ccc",
                borderRadius: "10px",
                padding: "20px",
                textAlign: "center",
                backgroundColor: "#f9f9f9",
              }}
            >
              <h3>{pokemon.name}</h3>
              {pokemon.image && (
                <img
                  src={pokemon.image}
                  alt={`Pokemon ${pokemon.name}`}
                  style={{
                    width: "150px",
                    height: "150px",
                    objectFit: "contain",
                  }}
                />
              )}
              <p>
                <strong>Count:</strong> {pokemonCounts[pokemon.id] || 1}
                <br />
                <strong>ID:</strong> {pokemon.id}
              </p>
              {pokemonCounts[pokemon.id] >= 3 && pokemon.evolves_to != null && (
                <button
                    style={{
                    padding: "10px 20px",
                    marginTop: "10px",
                    backgroundColor: "#28a745",
                    color: "#fff",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    }}
                    onClick={() => evolvePokemon(pokemon.id)}
                >
                    Evolve
                </button>
                )}
            </div>
          ))}
        </div>
      ) : (
        <p>No Pokémon found.</p>
      )}
    </div>
  );
};

export default ApiCycleComponent;
