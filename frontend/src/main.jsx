import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  MantineProvider,
  ColorSchemeScript,
  localStorageColorSchemeManager,
} from '@mantine/core'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css';
import './theme.css'
import { appTheme } from './theme'
import App from './App.jsx'
import './index.css'
import { Notifications } from '@mantine/notifications';

const COLOR_SCHEME_KEY = 'workflow-builder-color-scheme'
const colorSchemeManager = localStorageColorSchemeManager({ key: COLOR_SCHEME_KEY })

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ColorSchemeScript defaultColorScheme="dark" localStorageKey={COLOR_SCHEME_KEY} />
    <MantineProvider
      theme={appTheme}
      colorSchemeManager={colorSchemeManager}
      defaultColorScheme="dark"
    >
      <Notifications position="top-right" />
      <App />
    </MantineProvider>
  </React.StrictMode>,
)
