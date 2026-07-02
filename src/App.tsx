import { RouterProvider } from 'react-router-dom'
import { appRouter } from './app/routes'
import { AuthProvider } from './features/auth/AuthContext'
import { TawkToChat } from './shared/ui/TawkToChat'

function App() {
  return (
    <AuthProvider>
      <TawkToChat />
      <RouterProvider router={appRouter} />
    </AuthProvider>
  )
}

export default App
