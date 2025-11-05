import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from './routes'

declare const __BASE_PATH__: string | undefined

function App() {
  return (
    <BrowserRouter basename={typeof __BASE_PATH__ !== 'undefined' ? __BASE_PATH__ : '/'}>
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App