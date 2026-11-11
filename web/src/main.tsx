import '@fontsource-variable/outfit';
// Only the styles of the components the page uses, which is a fraction of the full stylesheet.
// A component that looks unstyled is missing its line here.
import '@mantine/core/styles/baseline.css';
import '@mantine/core/styles/default-css-variables.css';
import '@mantine/core/styles/global.css';
import '@mantine/core/styles/UnstyledButton.css';
import '@mantine/core/styles/Loader.css';
import '@mantine/core/styles/Button.css';
import '@mantine/core/styles/CloseButton.css';
import '@mantine/core/styles/ActionIcon.css';
import '@mantine/core/styles/Input.css';
import '@mantine/core/styles/Text.css';
import '@mantine/core/styles/Title.css';
import '@mantine/core/styles/Anchor.css';
import '@mantine/core/styles/Container.css';
import '@mantine/core/styles/Group.css';
import '@mantine/core/styles/Stack.css';
import '@mantine/core/styles/Paper.css';
import '@mantine/core/styles/Badge.css';
import '@mantine/core/styles/Skeleton.css';
import '@mantine/core/styles/Alert.css';
import '@mantine/core/styles/Breadcrumbs.css';
import '@mantine/core/styles/Popover.css';
import '@mantine/core/styles/Tooltip.css';
import '@mantine/core/styles/InlineInput.css';
import '@mantine/core/styles/Checkbox.css';
import './styles.css';
import { Anchor, createTheme, type MantineColorsTuple, MantineProvider } from '@mantine/core';
import { LazyMotion, MotionConfig } from 'motion/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.js';

/** Mantine's green, with darker top shades so white text on a button is easy to read. */
const brand: MantineColorsTuple = [
  '#ebfbee',
  '#d3f9d8',
  '#b2f2bb',
  '#8ce99a',
  '#69db7c',
  '#51cf66',
  '#37b24d',
  '#2b8a3e',
  '#237a36',
  '#1b5e2a',
];

const theme = createTheme({
  fontFamily: "'Outfit Variable', system-ui, sans-serif",
  headings: { fontFamily: "'Outfit Variable', system-ui, sans-serif", fontWeight: '700' },
  colors: { brand },
  primaryColor: 'brand',
  primaryShade: 8,
  defaultRadius: 'md',
  // Links are underlined, so they don't rely on colour alone to be recognised.
  components: { Anchor: Anchor.extend({ defaultProps: { underline: 'always' } }) },
});

const loadAnimation = () => import('./motion-features.js').then((features) => features.default);

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <StrictMode>
      <MantineProvider theme={theme} defaultColorScheme="auto">
        {/* The animation engine loads after the first paint, with only the features the page
            uses. Animations switch off for people who ask their system for reduced motion. */}
        <LazyMotion features={loadAnimation} strict>
          <MotionConfig reducedMotion="user">
            <App />
          </MotionConfig>
        </LazyMotion>
      </MantineProvider>
    </StrictMode>,
  );
}
