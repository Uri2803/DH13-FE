import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from './routes'
import { ToastContainer } from "react-toastify";
declare const __BASE_PATH__: string | undefined

function App() {
  return (
    <BrowserRouter basename={typeof __BASE_PATH__ !== 'undefined' ? __BASE_PATH__ : '/'}>
       <ToastContainer position="top-right" autoClose={2500} />
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App