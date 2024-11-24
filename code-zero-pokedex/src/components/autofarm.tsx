"use client";

import React, { useState, useEffect, useRef } from "react";

const Autofarmapp: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [savedZones, setSavedZones] = useState<string[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const zones = JSON.parse(localStorage.getItem("zones") || "[]");
        setSavedZones(zones);
      } catch (error) {
        if (error instanceof Error) {
          console.error("Error reading zones from localStorage:", error.message);
        } else {
          console.error("Unknown error reading zones from localStorage.");
        }
        setLogs((prevLogs) => [...prevLogs, "Error al leer las zonas almacenadas."]);
      }
    }
  }, []);

  const urlBasePost = "https://hackeps-poke-backend.azurewebsites.net/events/";
  const urlBaseGet = "https://hackeps-poke-backend.azurewebsites.net/zones/";

  const getPayload = () => {
    const teamId = localStorage.getItem("teamId");
    if (!teamId) {
      throw new Error("Team ID not found in localStorage");
    }
    return { team_id: teamId };
  };

  const headers = {
    "Content-Type": "application/json",
  };

  const lastRequestTime = useRef<Record<string, number>>({});

  const addLog = (message: string) => {
    setLogs((prevLogs) => [...prevLogs, message]);
  };

  const obtenerCooldownPeriod = async (zoneId: string): Promise<number | null> => {
    const url = `${urlBaseGet}${zoneId}`;
    try {
      const response = await fetch(url, { headers });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      const cooldownPeriod = data.cooldown_period || 0;
      addLog(`Cooldown period para zona ${zoneId}: ${cooldownPeriod} segundos`);
      return cooldownPeriod;
    } catch (error) {
      if (error instanceof Error) {
        addLog(`Error al obtener cooldown_period para zona ${zoneId}: ${error.message}`);
      } else {
        addLog(`Unknown error al obtener cooldown_period para zona ${zoneId}`);
      }
      return null;
    }
  };

  const realizarRequest = async (zoneId: string): Promise<void> => {
    const url = `${urlBasePost}${zoneId}`;
    try {
      const payload = getPayload();
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const responseData = await response.json();
      addLog(`Request a zona ${zoneId} exitosa. Respuesta: ${JSON.stringify(responseData)}`);
    } catch (error) {
      if (error instanceof Error) {
        addLog(`Error al realizar la request a ${zoneId}: ${error.message}`);
      } else {
        addLog(`Unknown error al realizar la request a ${zoneId}`);
      }
    }
  };

  const main = async () => {
    const currentZones = [...savedZones];
    currentZones.forEach((zoneId) => {
      lastRequestTime.current[zoneId] = 0;
    });

    intervalRef.current = setInterval(async () => {
      const currentTime = Date.now() / 1000;

      for (const zoneId of currentZones) {
        const cooldownPeriod = await obtenerCooldownPeriod(zoneId);
        if (cooldownPeriod === null) {
          addLog(`Saltando zona ${zoneId} por error al obtener cooldown_period.`);
          continue;
        }

        const lastTime = lastRequestTime.current[zoneId];
        const elapsedTime = currentTime - lastTime;

        if (elapsedTime >= cooldownPeriod + 10) {
          addLog(`Enviando POST para la zona ${zoneId} (última solicitud hace ${elapsedTime.toFixed(2)} segundos)`);
          await realizarRequest(zoneId);
          lastRequestTime.current[zoneId] = Date.now() / 1000;
        } else {
          const remainingTime = (cooldownPeriod + 10) - elapsedTime;
          addLog(`Zona ${zoneId}: en cooldown, quedan ${remainingTime.toFixed(2)} segundos.`);
        }
      }
    }, 1000);
  };

  const handleStart = async () => {
    if (!isRunning) {
      try {
        setIsRunning(true);
        addLog("Iniciando el proceso...");
        await main();
      } catch (error) {
        if (error instanceof Error) {
          addLog(`Error al iniciar el proceso: ${error.message}`);
        } else {
          addLog("Unknown error al iniciar el proceso.");
        }
        setIsRunning(false);
      }
    } else {
      addLog("El proceso ya está en ejecución.");
    }
  };

  const handleStop = () => {
    if (isRunning && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setIsRunning(false);
      addLog("Proceso detenido.");
    } else {
      addLog("No hay un proceso en ejecución.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <button onClick={handleStart} disabled={isRunning}>
        {isRunning ? "En ejecución..." : "Iniciar"}
      </button>
      <button onClick={handleStop} disabled={!isRunning} style={{ marginLeft: "10px" }}>
        Detener
      </button>
      <div
        style={{
          marginTop: "20px",
          padding: "10px",
          height: "300px",
          overflowY: "scroll",
          border: "1px solid #ccc",
          backgroundColor: "#f9f9f9",
        }}
      >
        {logs.map((log, index) => (
          <div key={index}>{log}</div>
        ))}
      </div>
    </div>
  );
};

export default Autofarmapp;
