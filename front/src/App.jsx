import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { PanierProvider } from './context/PanierContext'
import RoutePrivee from './components/RoutePrivee'
import Connexion from './pages/Connexion'
import CreerUtilisateur from './pages/CreerUtilisateur'
import Catalogue from './pages/Catalogue'
import FicheProduit from './pages/FicheProduit'
import Panier from './pages/Panier'
import CommandeDetail from './pages/CommandeDetail'

function App() {
  return (
    <AuthProvider>
      <PanierProvider>
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
              path="/panier"
              element={
                <RoutePrivee>
                  <Panier />
                </RoutePrivee>
              }
            />
            <Route
              path="/commande/:id"
              element={
                <RoutePrivee>
                  <CommandeDetail />
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
      </PanierProvider>
    </AuthProvider>
  )
}

export default App
