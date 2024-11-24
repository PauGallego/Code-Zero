"use client";

import "regenerator-runtime/runtime"; // Polyfill para funciones asincrónicas
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import Recorder from "recorder-js";
import axios from "axios";

type VoiceRecognitionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onRecognize: (text: string) => void;
};

const VoiceRecognitionModal: React.FC<VoiceRecognitionModalProps> = ({
  isOpen,
  onClose,
  onRecognize,
}) => {
  const [recorder, setRecorder] = useState<Recorder | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [micPermissionDenied, setMicPermissionDenied] = useState(false);

  // Solicitar permisos de micrófono y configurar Recorder.js
  const setupRecorder = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new (window.AudioContext || window.AudioContext)();
      const newRecorder = new Recorder(audioContext);
      await newRecorder.init(stream);
      setRecorder(newRecorder);
      setMicPermissionDenied(false);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Permisos de micrófono denegados:", error.message);
      } else {
        console.error("Error desconocido al acceder al micrófono:", error);
      }
      setMicPermissionDenied(true);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setupRecorder();
    }
  }, [isOpen]);

  // Inicia la grabación de audio
  const startRecording = async () => {
    if (!recorder) {
      console.error("El grabador no está inicializado.");
      return;
    }

    try {
      await recorder.start();
      setIsRecording(true);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error al iniciar la grabación:", error.message);
      } else {
        console.error("Error desconocido al iniciar la grabación:", error);
      }
    }
  };

  // Detiene la grabación y procesa el audio
  const stopRecording = async () => {
    if (!recorder) {
      console.error("El grabador no está inicializado.");
      return;
    }

    try {
      const { blob } = await recorder.stop();
      setAudioBlob(blob);
      console.log("Audio grabado:", blob);
      processAudio(blob);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error al detener la grabación:", error.message);
      } else {
        console.error("Error desconocido al detener la grabación:", error);
      }
    } finally {
      setIsRecording(false);
    }
  };

  // Procesa el audio grabado y lo envía a Whisper para transcripción
  const processAudio = async (blob: Blob) => {
    if (!blob) {
      console.error("No hay audio disponible para procesar.");
      return;
    }

    const formData = new FormData();
    formData.append("file", blob);
    formData.append("model", "whisper-1");
    formData.append("language", "es"); // Forzar a que Whisper transcriba en español

    setIsProcessing(true);

    try {
      const response = await axios.post(
        "https://api.openai.com/v1/audio/transcriptions",
        formData,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY_CHAT}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      let transcript = response.data.text;
      console.log("Respuesta de Whisper antes de limpiar:", transcript);

      // Limpiar caracteres no deseados
      transcript = transcript.replace(/[¿?!¡]/g, "");
      console.log("Respuesta de Whisper después de limpiar:", transcript);

      setTranscription(transcript);
      onRecognize(transcript); // Enviar el texto limpio al componente padre
      onClose(); // Cerrar el modal después de procesar
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error durante la transcripción:", error.response?.data || error.message);
        setTranscription(
          `Error al transcribir el audio. Detalles: ${error.response?.data?.error?.message || "Error desconocido"}`
        );
      } else {
        console.error("Error desconocido durante la transcripción:", error);
        setTranscription("Error desconocido al procesar el audio.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          <div className="bg-[var(--cards-background)] border border-6 rounded-lg shadow-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">Reconocimiento de Voz</h2>
            <p className="mb-4">Haz clic en el botón para iniciar o detener la grabación.</p>
            <div className="flex flex-col items-center">
              <Button
                onClick={isRecording ? stopRecording : startRecording}
                className={`rounded-lg px-4 py-2 ${
                  isRecording ? "bg-red-500 text-white" : "bg-blue-500 text-white"
                }`}
                disabled={isProcessing}
              >
                {isRecording ? "Detener Grabación" : "Iniciar Grabación"}
              </Button>
              {micPermissionDenied && (
                <p className="text-red-500 mt-4">
                  Se requieren permisos de micrófono para usar esta función.
                </p>
              )}
              {isProcessing && (
                <p className="text-gray-500 mt-4">Procesando el audio...</p>
              )}
              {transcription && (
                <p className="mt-4 text-gray-700 text-center">
                  Texto Transcrito: <strong>{transcription}</strong>
                </p>
              )}
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setTranscription("");
                  setAudioBlob(null);
                  onClose();
                }}
              >
                Cerrar
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VoiceRecognitionModal;
