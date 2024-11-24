'use client';

import 'regenerator-runtime/runtime'; // Polyfill para funciones asincrónicas
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { useEffect, useState } from 'react';

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
  const { transcript, listening, resetTranscript } = useSpeechRecognition();
  const [unsupported, setUnsupported] = useState(false); // Para manejar compatibilidad
  const [micPermissionDenied, setMicPermissionDenied] = useState(false); // Permiso de micrófono

  // Solicitar permisos de micrófono
  const requestMicPermissions = async () => {
    try {
      console.log('Requesting microphone permissions...');
      await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('Microphone permissions granted.');
      return true;
    } catch (error) {
      console.error('Microphone permissions denied:', error);
      setMicPermissionDenied(true);
      return false;
    }
  };

  // Inicia el reconocimiento de voz
  const startListening = async () => {
    console.log('Attempting to start listening...');
    if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
      console.log('Speech recognition is not supported in this browser.');
      setUnsupported(true);
      return;
    }

    const hasPermissions = await requestMicPermissions();
    if (!hasPermissions) {
      console.log('Cannot start listening without microphone permissions.');
      return;
    }

    setUnsupported(false);
    setMicPermissionDenied(false);
    SpeechRecognition.startListening({ continuous: true, language: 'en-US' });
    console.log('Started listening...');
  };

  // Detiene el reconocimiento de voz
  const stopListening = () => {
    console.log('Stopping listening...');
    SpeechRecognition.stopListening();
    console.log('Stopped listening.');
    onRecognize(transcript);
  };

  useEffect(() => {
    if (listening) {
      console.log(`Listening... Transcript so far: ${transcript}`);
    }
  }, [transcript, listening]);

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
            <h2 className="text-xl font-bold mb-4">Voice Recognition</h2>
            <p className="mb-4">
              Click the button below and start speaking to recognize your voice.
            </p>
            <div className="flex flex-col items-center">
              <Button
                onClick={listening ? stopListening : startListening}
                className={`rounded-lg px-4 py-2 ${
                  listening ? 'bg-red-200' : 'bg-blue-500 text-white'
                }`}
              >
                {listening ? 'Listening...' : 'Start Recognition'}
              </Button>
              {unsupported && (
                <p className="text-red-500 mt-4">
                  Your browser does not support speech recognition.
                </p>
              )}
              {micPermissionDenied && (
                <p className="text-red-500 mt-4">
                  Microphone permissions are required to use this feature.
                </p>
              )}
              {transcript && (
                <p className="mt-4 text-gray-700 text-center">
                  Recognized Text: <strong>{transcript}</strong>
                </p>
              )}
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  resetTranscript();
                  onClose();
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VoiceRecognitionModal;
