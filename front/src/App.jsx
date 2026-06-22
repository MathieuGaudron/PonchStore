import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import RoutePrivee from './components/RoutePrivee'
import Connexion from './pages/Connexion'
import CreerUtilisateur from './pages/CreerUtilisateur'
import Catalogue from './pages/Catalogue'
import FicheProduit from './pages/FicheProduit'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/connexion" element={<Connexion />} />
          <Route
            path="/catalogue"
            element={
              <RoutePrivee>
                <Catalogue />
              </RoutePrivee>
            }
          />
          <Route
            path="/catalogue/:id"
            element={
              <RoutePrivee>
                <FicheProduit />
              </RoutePrivee>
            }
          />
          <Route
            path="/admin/utilisateurs/nouveau"
            element={
              <RoutePrivee roles={['ADMIN']}>
                <CreerUtilisateur />
              </RoutePrivee>
            }
          />
          <Route path="/" element={<Navigate to="/catalogue" replace />} />
          <Route path="*" element={<Navigate to="/connexion" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
