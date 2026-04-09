import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import bridge from '@vkontakte/vk-bridge'

// Инициализируем VK Mini App
const vkBridge = bridge.default || bridge
if (typeof vkBridge.send === 'function') {
  vkBridge.send('VKWebAppInit')
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
