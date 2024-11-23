"use client";

import React, { useRef, useState, useEffect } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

const EventTriggerComponent: React.FC = () => {
  const baseUrl = "https://hackeps-poke-backend.azurewebsites.net/events/";
  const teamId = "63bf06cf-e720-4134-9252-f195668c6048"; // Team ID fijo

  const videoRef = useRef<HTMLVideoElement>(null);
  const [zoneId, setZoneId] = useState<string>("");
  const [responseMessage, setResponseMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [stream, setStream] = useState<MediaStream | null>(null); // Guarda el MediaStream para detenerlo

  useEffect(() => {
    // Inicia el escáner una vez que el videoRef esté disponible
    if (isScanning && videoRef.current) {
      startScanner();
    }
  }, [isScanning, videoRef]);

  const startScanner = async () => {
    setError(null);
  
    const codeReader = new BrowserMultiFormatReader();
    try {
      if (!videoRef.current) {
        setError("Video element not found. Unable to start scanner.");
        return;
      }
  
      console.log("Initializing scanner...");
      const resultStream = await codeReader.decodeFromVideoDevice(
        undefined, // Selecciona la cámara predeterminada
        videoRef.current,
        (result, error) => {
          if (result) {
            const text = result.getText();
            console.log("QR Scan Result (raw):", text);
  
            // Extraer el último segmento de la URL como Zone ID
            const extractedZoneId = text.split('/').pop(); // Obtiene el último segmento
            if (extractedZoneId && extractedZoneId.length > 0) {
              console.log("Extracted Zone ID:", extractedZoneId);
              setZoneId(extractedZoneId);
  
              // Detener el escáner solo si el Zone ID es válido
              stopScanner();
              setIsScanning(false);
            } else {
              console.warn("QR code does not contain a valid Zone ID. Keep scanning...");
              setError("Invalid QR code format. Could not extract a Zone ID.");
              setZoneId(""); // Reset Zone ID
            }
          }
  
          if (error) {
            console.warn("No QR code detected. Keep scanning...");
            // No detener el escáner si hay errores menores
          }
        }
      );
  
      // Guarda el MediaStream
      setStream(resultStream);
    } catch (err: any) {
      console.error("Error initializing scanner:", err);
      setError(err.message || "An error occurred while accessing the camera.");
      setIsScanning(false);
    }
  };
  
  

  const stopScanner = () => {
    if (stream) {
      // Detén todos los tracks de video
      stream.getTracks().forEach((track) => track.stop());
      setStream(null); // Limpia el stream
      console.log("Scanner stopped.");
    }
  };

  const triggerEvent = async () => {
    console.log("Function Trigger Event called");

    if (!zoneId) {
      console.error("Zone ID is required, but not provided");
      setError("Zone ID is required.");
      return;
    }

    console.log("Zone ID provided:", zoneId);
    console.log("Base URL:", baseUrl);
    console.log("Team ID:", teamId);

    const url = `${baseUrl}${zoneId}`;
    const body = {
      team_id: teamId,
    };

    console.log("Constructed URL:", url);
    console.log("Request Body:", body);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      console.log("HTTP Response Status:", response.status);

      if (response.status === 200) {
        const data = await response.json();
        console.log("Pokémon captured:", data);
        setResponseMessage("Event triggered successfully! Pokémon captured!");
      } else if (response.status === 400) {
        console.warn("No Pokémon captured");
        setResponseMessage("No Pokémon captured in this zone.");
      } else {
        console.error("Capture error with status:", response.status);
        setResponseMessage(`Capture error! Status: ${response.status}`);
      }
    } catch (err: any) {
      console.error("Error occurred during POST request:", err);
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: "20px", border: "1px solid #ccc", borderRadius: "10px" }}>
      <h1>Trigger Event</h1>
      <div style={{ marginBottom: "20px" }}>
        {isScanning ? (
          <>
            <video
              ref={videoRef}
              style={{
                width: "100%",
                maxWidth: "500px",
                border: "1px solid #ddd",
                borderRadius: "10px",
              }}
              autoPlay
              muted
            />
            <button
              onClick={stopScanner}
              style={{
                padding: "10px 20px",
                fontSize: "16px",
                cursor: "pointer",
                border: "none",
                borderRadius: "5px",
                backgroundColor: "#dc3545",
                color: "#fff",
                marginTop: "10px",
              }}
            >
              Stop Camera
            </button>
          </>
        ) : (
          <button
            onClick={() => {
              setIsScanning(true);
              setError(null);
              setResponseMessage(null);
            }}
            style={{
              padding: "10px 20px",
              fontSize: "16px",
              cursor: "pointer",
              border: "none",
              borderRadius: "5px",
              backgroundColor: "#007bff",
              color: "#fff",
            }}
          >
            Open Camera
          </button>
        )}
      </div>
      {zoneId && (
        <p>
          <strong>Zone ID:</strong> {zoneId}
        </p>
      )}
      <button
        onClick={triggerEvent}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          cursor: "pointer",
          border: "none",
          borderRadius: "5px",
          backgroundColor: "#28a745",
          color: "#fff",
          marginTop: "10px",
        }}
        disabled={!zoneId}
      >
        Trigger Event
      </button>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      {responseMessage && (
        <p
          style={{
            color: responseMessage.includes("Pokémon captured")
              ? "green"
              : responseMessage.includes("No Pokémon")
              ? "orange"
              : "red",
          }}
        >
          {responseMessage}
        </p>
      )}
    </div>
  );
};

export default EventTriggerComponent;
