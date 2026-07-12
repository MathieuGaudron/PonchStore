import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { PanierProvider } from './context/PanierContext'
import RoutePrivee from './components/RoutePrivee'
import Connexion from './pages/Connexion'
import MotDePasseOublie from './pages/MotDePasseOublie'
import Reinitialisation from './pages/Reinitialisation'
import CreerUtilisateur from './pages/CreerUtilisateur'
import Catalogue from './pages/Catalogue'
import FicheProduit from './pages/FicheProduit'
import Panier from './pages/Panier'
import CommandeDetail from './pages/CommandeDetail'
import MonCompte from './pages/MonCompte'
import PreparationCommandes from './pages/PreparationCommandes'
import GestionProduits from './pages/GestionProduits'
import GestionStock from './pages/GestionStock'
import TableauBord from './pages/TableauBord'

function App() {
  return (
    <AuthProvider>
      <PanierProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/connexion" element={<Connexion />} />
            <Route path="/mot-de-passe-oublie" element={<MotDePasseOublie />} />
            <Route path="/reinitialisation" element={<Reinitialisation />} />
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
              path="/compte"
              element={
                <RoutePrivee>
                  <MonCompte />
                </RoutePrivee>
              }
            />
            <Route
              path="/tableau-bord"
              element={
                <RoutePrivee roles={['STAFF']}>
                  <TableauBord />
                </RoutePrivee>
              }
            />
            <Route
              path="/preparation"
              element={
                <RoutePrivee roles={['STAFF']}>
                  <PreparationCommandes />
                </RoutePrivee>
              }
            />
            <Route
              path="/stock"
              element={
                <RoutePrivee roles={['STAFF']}>
                  <GestionStock />
                </RoutePrivee>
              }
            />
            <Route
              path="/admin/produits"
              element={
                <RoutePrivee roles={['ADMIN']}>
                  <GestionProduits />
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
