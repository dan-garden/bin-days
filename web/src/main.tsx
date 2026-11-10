import '@fontsource-variable/outfit';
import '@mantine/core/styles.css';
import './styles.css';
import { createTheme, MantineProvider } from '@mantine/core';
import { MotionConfig } from 'motion/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.js';

const theme = createTheme({
  fontFamily: "'Outfit Variable', system-ui, sans-serif",
  headings: { fontFamily: "'Outfit Variable', system-ui, sans-serif", fontWeight: '700' },
  primaryColor: 'green',
  primaryShade: { light: 8, dark: 7 },
  defaultRadius: 'md',
});

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <StrictMode>
      <MantineProvider theme={theme} defaultColorScheme="auto">
        {/* Animations switch off for people who ask their system for reduced motion. */}
        <MotionConfig reducedMotion="user">
          <App />
        </MotionConfig>
      </MantineProvider>
    </StrictMode>,
  );
}
