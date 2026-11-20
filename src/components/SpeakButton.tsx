import { motion } from 'motion/react';
import { canSpeak, speak } from '../lib/speech';
import { IconSpeaker } from './Icons';

export function SpeakButton({ text, size = 'big' }: { text: string; size?: 'big' | 'small' }) {
  if (!canSpeak()) return null;
  return (
    <motion.button
      type="button"
      className={size === 'big' ? 'icon-btn speak-btn' : 'icon-btn'}
      whileTap={{ scale: 0.88 }}
      onClick={() => speak(text)}
      aria-label={`Ouvir: ${text}`}
    >
      <IconSpeaker />
    </motion.button>
  );
}
