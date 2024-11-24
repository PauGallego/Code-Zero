"use client";

import React, { useRef, useState, useEffect } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

const EventTriggerComponent: React.FC = () => {
  const baseUrl = "https://hackeps-poke-backend.azurewebsites.net/events/";

  const videoRef = useRef<HTMLVideoElement>(null);
  const [zoneId, setZoneId] = useState<string>("");
  const [manualZoneId, setManualZoneId] = useState<string>(""); // For manual entry
  const [responseMessage, setResponseMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);

  useEffect(() => {
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
      await codeReader.decodeFromVideoDevice(
        undefined, // Default camera
        videoRef.current,
        (result, error) => {
          if (result) {
            const text = result.getText();
            console.log("QR Scan Result (raw):", text);

            const extractedZoneId = text.split("/").pop(); // Extract last segment
            if (extractedZoneId && extractedZoneId.length > 0) {
              console.log("Extracted Zone ID:", extractedZoneId);
              setZoneId(extractedZoneId);

              stopScanner();
            } else {
              console.warn("QR code does not contain a valid Zone ID. Keep scanning...");
              setError("Invalid QR code format. Could not extract a Zone ID.");
              setZoneId("");
            }
          }

          if (error) {
            console.warn("No QR code detected. Keep scanning...");
          }
        }
      );
    } catch (err: any) {
      console.error("Error initializing scanner:", err);
      setError(err.message || "An error occurred while accessing the camera.");
      setIsScanning(false);
    }
  };

  const stopScanner = () => {
    if (videoRef.current) {
      const stream = videoRef.current.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
        console.log("Scanner stopped.");
      }
    }
    setIsScanning(false);
  };

  const triggerEvent = async (inputZoneId: string) => {
    if (!inputZoneId) {
      setError("Zone ID is required.");
      return;
    }

    const teamId = localStorage.getItem("teamId");
    if (!teamId) {
      setError("Team ID not found. Please log in.");
      return;
    }

    const url = `${baseUrl}${inputZoneId}`;
    const body = {
      team_id: teamId,
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (response.status === 200) {
        const data = await response.json();
        console.log("Pokémon captured:", data);

        const storedZones = JSON.parse(localStorage.getItem("zones") || "[]");
        if (!storedZones.includes(inputZoneId)) {
          storedZones.push(inputZoneId);
          localStorage.setItem("zones", JSON.stringify(storedZones));
        }

        setResponseMessage("Zona capturada exitosamente y guardada.");
      } else if (response.status === 400) {
        setResponseMessage("No se capturó ningún Pokémon en esta zona.");
      } else {
        setResponseMessage(`Error al capturar zona. Status: ${response.status}`);
      }
    } catch (err: any) {
      console.error("Error occurred during POST request:", err);
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: "20px", border: "1px solid #ccc", borderRadius: "10px" }}>
      {!zoneId && isScanning && (
        <div style={{ marginBottom: "20px" }}>
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
        </div>
      )}
      {!zoneId && !isScanning && (
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
            marginBottom: "20px",
          }}
        >
          Abrir cámara
        </button>
      )}
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="ID de la zona manualmente"
          value={manualZoneId}
          onChange={(e) => setManualZoneId(e.target.value)}
          style={{
            padding: "10px",
            fontSize: "16px",
            border: "1px solid #ccc",
            borderRadius: "5px",
            width: "100%",
          }}
        />
        <button
          onClick={() => triggerEvent(manualZoneId)}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            cursor: "pointer",
            border: "none",
            borderRadius: "5px",
            backgroundColor: "#28a745",
            marginTop: "10px",
            width: "100%",
          }}
        >
          Añadir zona manualmente
        </button>
      </div>
      {zoneId && (
        <>
          <p>
            <strong>Zone ID:</strong> {zoneId}
          </p>
          <button
            onClick={() => triggerEvent(zoneId)}
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
          >
            Capturar y añadir zona QR
          </button>
        </>
      )}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      {responseMessage && (
        <p
          style={{
            color: responseMessage.includes("exitosamente")
              ? "green"
              : responseMessage.includes("No se capturó")
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
