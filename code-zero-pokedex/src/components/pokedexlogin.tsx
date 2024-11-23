"use client";

import React, { useState } from "react";

const SaveTeamId: React.FC = () => {
  const [teamId, setTeamId] = useState<string>(""); // Estado para el ID del equipo
  const [error, setError] = useState<string | null>(null); // Estado para errores

  // Manejar cambios en el input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTeamId(value); // Actualizar el estado
  };

  // Validar y guardar el Team ID
  const handleSaveTeamId = async () => {
    if (!teamId) {
      setError("Please enter a Team ID.");
      return;
    }

    // Imprimir el valor del teamId antes de la solicitud
    console.log("Team ID introduced:", teamId);

    // URL completa (reemplaza 'http://example.com' con tu URL base si es necesario)
    const endpoint = `https://hackeps-poke-backend.azurewebsites.net/teams/${teamId}`;

    console.log("Haciendo request a:", endpoint);

    try {
      const response = await fetch(endpoint);

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log("Respuesta recibida:", data);

      // Guardar en localStorage si todo fue exitoso
      localStorage.setItem("teamid", teamId);
      setError(null); // Limpiar el error
      alert("Team ID saved to LocalStorage!");
    } catch (err: any) {
      console.error("Error en la solicitud:", err);
      setError("Invalid Team ID. Could not save to LocalStorage.");
    }
  };

  // Eliminar el Team ID de localStorage
  const handleRemoveTeamId = () => {
    localStorage.removeItem("teamid");
    setTeamId(""); // Limpiar el input
    setError(null); // Limpiar errores
  };

  // Obtener el valor almacenado en localStorage
  const storedTeamId = localStorage.getItem("teamid") || "";

  return (
    <div>
      <h1>Save Team ID</h1>
      <input
        type="text"
        value={teamId || storedTeamId} // Mostrar el valor almacenado o el actual
        onChange={handleInputChange}
        placeholder="Enter Team ID"
      />
      <p>Team ID stored in LocalStorage: {storedTeamId}</p>

      {/* Mostrar error si existe */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Botón para guardar el Team ID */}
      <button onClick={handleSaveTeamId}>Save Team ID</button>

      {/* Botón para eliminar el Team ID */}
      <button onClick={handleRemoveTeamId}>Remove Team ID</button>
    </div>
  );
};

export default SaveTeamId;
