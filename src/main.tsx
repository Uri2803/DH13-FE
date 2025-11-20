import { StrictMode } from 'react'
import './i18n'
import { createRoot } from 'react-dom/client'
 // TypeScript doesn't have typings for plain CSS side-effect imports in this project,
 // ignore the following import error.
 // @ts-ignore
import './index.css'
import App from './App'
import { AuthProvider } from './hooks/useAuth';
import "remixicon/fonts/remixicon.css";



createRoot(document.getElementById('root')!).render(
   <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)

