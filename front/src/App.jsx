import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { PanierProvider } from './context/PanierContext'
import RoutePrivee from './components/RoutePrivee'
import Accueil from './pages/Accueil'
import MentionsLegales from './pages/MentionsLegales'
import NonTrouve from './pages/NonTrouve'
import Connexion from './pages/Connexion'
import MotDePasseOublie from './pages/MotDePasseOublie'
import Reinitialisation from './pages/Reinitialisation'
import GestionUtilisateurs from './pages/GestionUtilisateurs'
import Catalogue from './pages/Catalogue'
import FicheProduit from './pages/FicheProduit'
import Panier from './pages/Panier'
import CommandeDetail from './pages/CommandeDetail'
import MonCompte from './pages/MonCompte'
import PreparationCommandes from './pages/PreparationCommandes'
import HistoriqueCommandes from './pages/HistoriqueCommandes'
import GestionProduits from './pages/GestionProduits'
import GestionCategories from './pages/GestionCategories'
import GestionCreneaux from './pages/GestionCreneaux'
import GestionStock from './pages/GestionStock'
import TableauBord from './pages/TableauBord'

function App() {
  return (
    <AuthProvider>
      <PanierProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Accueil />} />
            <Route path="/mentions-legales" element={<MentionsLegales />} />
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
              path="/historique-commandes"
              element={
                <RoutePrivee roles={['STAFF']}>
                  <HistoriqueCommandes />
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
              path="/admin/categories"
              element={
                <RoutePrivee roles={['ADMIN']}>
                  <GestionCategories />
                </RoutePrivee>
              }
            />
            <Route
              path="/admin/utilisateurs"
              element={
                <RoutePrivee roles={['ADMIN']}>
                  <GestionUtilisateurs />
                </RoutePrivee>
              }
            />
            <Route
              path="/admin/creneaux"
              element={
                <RoutePrivee roles={['STAFF']}>
                  <GestionCreneaux />
                </RoutePrivee>
              }
            />
            <Route path="*" element={<NonTrouve />} />
          </Routes>
        </BrowserRouter>
      </PanierProvider>
    </AuthProvider>
  )
}

export default App
