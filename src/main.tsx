import { MotionConfig } from 'motion/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import { App } from './App';
import { installAudioUnlock } from './lib/sfx';
import './styles.css';

registerSW({ immediate: true });

// Mantém os efeitos sonoros funcionando depois de pausas do sistema (voz, microfone, segundo plano).
installAudioUnlock();

// Pede ao navegador para não apagar o progresso salvo quando faltar espaço.
navigator.storage?.persist?.().catch(() => undefined);

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <StrictMode>
      <MotionConfig reducedMotion="user">
        <App />
      </MotionConfig>
    </StrictMode>,
  );
}
