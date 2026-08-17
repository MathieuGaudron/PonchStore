import CadreLegal, { LigneLegale, SectionLegale } from '../components/CadreLegal'

export default function PolitiqueConfidentialite() {
  return (
    <CadreLegal
      surtitre="Informations légales"
      titre="Politique de confidentialité"
      miseAJour="16 août 2026"
    >
      <SectionLegale titre="Responsable du traitement">
        <p>
          Les données collectées sur la plateforme Ponch'Store sont traitées par{' '}
          <span className="font-medium">PONCH'STORE</span>, dont le siège est situé 12 rue des
          Entrepôts, 94000 Créteil.
        </p>
        <p>
          Pour toute question relative à vos données, écrivez à rgpd@ponchstore.fr.
        </p>
      </SectionLegale>

      <SectionLegale titre="Données collectées">
        <p>
          Ponch'Store ne collecte que les données nécessaires à la gestion de la relation
          commerciale entre professionnels :
        </p>

        <dl className="mt-5 border-t border-trait">
          <LigneLegale label="Identité">Nom, prénom</LigneLegale>
          <LigneLegale label="Contact">Adresse email, numéro de téléphone</LigneLegale>
          <LigneLegale label="Établissement">
            Raison sociale, adresse de l'établissement, numéro SIRET
          </LigneLegale>
          <LigneLegale label="Compte">
            Rôle attribué, mot de passe (stocké sous forme chiffrée et non réversible)
          </LigneLegale>
          <LigneLegale label="Activité">
            Historique des commandes, quantités, créneaux de retrait réservés, commentaires laissés
            lors des commandes
          </LigneLegale>
        </dl>

        <p className="mt-5">
          Aucune donnée sensible au sens de l'article 9 du RGPD n'est collectée. Aucune donnée
          bancaire n'est traitée : le règlement s'effectue exclusivement sur place, au retrait.
        </p>
      </SectionLegale>

      <SectionLegale titre="Finalités et bases légales">
        <dl className="border-t border-trait">
          <LigneLegale label="Gestion des commandes">
            Exécution du contrat : création du compte, passage et suivi des commandes,
            organisation des retraits.
          </LigneLegale>
          <LigneLegale label="Emails de service">
            Exécution du contrat : confirmation de commande, rappel de créneau la veille du
            retrait, réinitialisation du mot de passe.
          </LigneLegale>
          <LigneLegale label="Vérification professionnelle">
            Obligation légale : contrôle de la qualité de professionnel préalable à l'ouverture
            d'un compte, réglementation applicable à la vente de boissons alcoolisées.
          </LigneLegale>
          <LigneLegale label="Obligations comptables">
            Obligation légale : conservation des pièces liées aux transactions.
          </LigneLegale>
        </dl>

        <p className="mt-5">
          Vos données ne sont utilisées à aucune fin de prospection commerciale, ne sont ni
          revendues ni cédées à des tiers, et ne font l'objet d'aucune décision automatisée ni
          d'aucun profilage.
        </p>
      </SectionLegale>

      <SectionLegale titre="Destinataires">
        <p>
          Les données sont accessibles aux seuls membres habilités de l'équipe Ponch'Store, dans
          la limite de ce que leur rôle exige : le personnel de préparation accède aux commandes
          et aux coordonnées nécessaires au retrait, l'administration accède à la gestion des
          comptes.
        </p>
        <p>
          Elles peuvent être communiquées à OVH SAS (hébergement du site et de la base de
          données) ainsi qu'au cabinet comptable du Vendeur, agissant en qualité de sous-traitants
          et tenus aux mêmes obligations de confidentialité. Aucune donnée n'est transférée hors
          de l'Union européenne.
        </p>
      </SectionLegale>

      <SectionLegale titre="Durée de conservation">
        <dl className="border-t border-trait">
          <LigneLegale label="Compte client">
            3 ans à compter du dernier contact
          </LigneLegale>
          <LigneLegale label="Commandes et factures">
            10 ans, conformément aux obligations comptables (article L. 123-22 du code de
            commerce)
          </LigneLegale>
          <LigneLegale label="Jeton de réinitialisation">1 heure</LigneLegale>
        </dl>
      </SectionLegale>

      <SectionLegale titre="Sécurité">
        <p>
          Les mots de passe sont stockés sous forme de condensats non réversibles : ils ne sont
          jamais consultables, y compris par l'équipe Ponch'Store. C'est pourquoi un changement de
          mot de passe passe systématiquement par un lien envoyé à votre adresse email.
        </p>
        <p>
          L'accès à la plateforme est protégé par une authentification à jeton dont la durée de
          validité est limitée. Les tentatives de connexion et les demandes de réinitialisation
          sont plafonnées afin de prévenir les attaques automatisées.
        </p>
      </SectionLegale>

      <SectionLegale titre="Cookies et stockage local">
        <p>
          La plateforme n'utilise aucun cookie publicitaire ni aucun outil de mesure d'audience
          tiers. Le jeton d'authentification est conservé dans le stockage de session du
          navigateur pendant la durée de la connexion, puis effacé à la déconnexion ou à la
          fermeture de l'onglet. Ce stockage étant strictement nécessaire au fonctionnement du
          service, il ne requiert pas de consentement préalable.
        </p>
      </SectionLegale>

      <SectionLegale titre="Vos droits">
        <p>
          Conformément au règlement (UE) 2016/679 et à la loi « Informatique et Libertés », vous
          disposez d'un droit d'accès, de rectification, d'effacement, de limitation, d'opposition
          et de portabilité sur les données vous concernant.
        </p>
        <p>
          Une partie de ces droits s'exerce directement depuis votre espace : la rubrique{' '}
          <span className="font-medium">Mon compte → Profil</span> permet de consulter et de
          corriger vos informations à tout moment.
        </p>
        <p>
          Pour les autres demandes — effacement, portabilité, opposition — écrivez à
          rgpd@ponchstore.fr. Une réponse vous sera
          apportée dans un délai d'un mois. L'effacement s'entend sous réserve des données que le
          Vendeur est légalement tenu de conserver, notamment les pièces comptables.
        </p>
        <p>
          Vous pouvez également introduire une réclamation auprès de la CNIL : 3 place de
          Fontenoy, TSA 80715, 75334 Paris Cedex 07 — cnil.fr.
        </p>
      </SectionLegale>
    </CadreLegal>
  )
}
