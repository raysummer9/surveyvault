import { RouterProvider } from 'react-router-dom'
import { appRouter } from './app/routes'
import { AuthProvider } from './features/auth/AuthContext'

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={appRouter} />
    </AuthProvider>
  )
}

export default App
