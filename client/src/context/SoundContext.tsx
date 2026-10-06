import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";

interface SoundContextValue {
  isPlaying: boolean;
  startAmbient: () => void;
  stopAmbient: () => void;
  toggleAmbient: () => void;
  playSuccess: () => void;
}

const SoundContext = createContext<SoundContextValue | undefined>(undefined);

function createAmbientMusic(context: AudioContext) {
  const master = context.createGain();
  master.gain.value = 0.035;
  master.connect(context.destination);

  const notes = [55, 65.41, 73.42, 82.41];
  const oscillators = notes.map((frequency, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = index % 2 === 0 ? "sine" : "triangle";
    oscillator.frequency.value = frequency;
    gain.gain.value = index === 0 ? 0.45 : 0.18;

    oscillator.connect(gain);
    gain.connect(master);
    oscillator.start();

    return oscillator;
  });

  return {
    master,
    oscillators,
    timer: window.setInterval(() => {
      const time = context.currentTime;
      oscillators.forEach((oscillator, index) => {
        oscillator.detune.setTargetAtTime(
          index % 2 === 0 ? 4 : -4,
          time,
          2,
        );
      });
    }, 4000),
  };
}

function playClap(context: AudioContext) {
  const duration = 0.9;
  const bufferSize = Math.floor(context.sampleRate * duration);
  const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i += 1) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2.8);
  }

  [0, 0.12, 0.24, 0.36].forEach((offset, index) => {
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();

    source.buffer = buffer;
    filter.type = "bandpass";
    filter.frequency.value = 1100 + index * 180;
    filter.Q.value = 0.7;
    gain.gain.setValueAtTime(0.22, context.currentTime + offset);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      context.currentTime + offset + duration,
    );

    source.connect(filter);
    filter.connect(gain);
    gain.connect(context.destination);
    source.start(context.currentTime + offset);
  });
}

export function SoundProvider({ children }: { children: ReactNode }) {
  const contextRef = useRef<AudioContext | null>(null);
  const ambientRef = useRef<ReturnType<typeof createAmbientMusic> | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const getContext = useCallback(() => {
    if (!contextRef.current) {
      contextRef.current = new AudioContext();
    }

    return contextRef.current;
  }, []);

  const startAmbient = useCallback(() => {
    const context = getContext();

    if (context.state === "suspended") {
      void context.resume();
    }

    if (!ambientRef.current) {
      ambientRef.current = createAmbientMusic(context);
    }

    setIsPlaying(true);
  }, [getContext]);

  const stopAmbient = useCallback(() => {
    if (!ambientRef.current) {
      return;
    }

    ambientRef.current.oscillators.forEach((oscillator) => oscillator.stop());
    window.clearInterval(ambientRef.current.timer);
    ambientRef.current.master.disconnect();
    ambientRef.current = null;
    setIsPlaying(false);
  }, []);

  const toggleAmbient = useCallback(() => {
    if (isPlaying) {
      stopAmbient();
    } else {
      startAmbient();
    }
  }, [isPlaying, startAmbient, stopAmbient]);

  const playSuccess = useCallback(() => {
    const context = getContext();

    if (context.state === "suspended") {
      void context.resume();
    }

    playClap(context);
  }, [getContext]);

  return (
    <SoundContext.Provider
      value={{ isPlaying, startAmbient, stopAmbient, toggleAmbient, playSuccess }}
    >
      {children}
    </SoundContext.Provider>
  );
}

export function useSound() {
  const context = useContext(SoundContext);

  if (!context) {
    throw new Error("useSound must be used inside SoundProvider");
  }

  return context;
}
