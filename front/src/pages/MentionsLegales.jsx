import CadreLegal, { LigneLegale, SectionLegale } from '../components/CadreLegal'

export default function MentionsLegales() {
  return (
    <CadreLegal
      surtitre="Informations légales"
      titre="Mentions légales"
      miseAJour="16 août 2026"
    >
      <SectionLegale titre="Éditeur du site">
        <p>
          Le site Ponch'Store, accessible à l'adresse{' '}
          <span className="font-medium">https://ponchstore.fr</span>, est édité par :
        </p>

        <dl className="mt-5 border-t border-trait">
          <LigneLegale label="Raison sociale">PONCH'STORE</LigneLegale>
          <LigneLegale label="Forme juridique">
            Société par actions simplifiée (SAS)
          </LigneLegale>
          <LigneLegale label="Capital social">10 000 euros</LigneLegale>
          <LigneLegale label="Siège social">
            12 rue des Entrepôts, 94000 Créteil, France
          </LigneLegale>
          <LigneLegale label="RCS">Créteil 123 456 789</LigneLegale>
          <LigneLegale label="SIRET">123 456 789 00012</LigneLegale>
          <LigneLegale label="TVA intracommunautaire">FR 32 123 456 789</LigneLegale>
          <LigneLegale label="Téléphone">01 99 00 12 34</LigneLegale>
          <LigneLegale label="Email">contact@ponchstore.fr</LigneLegale>
          <LigneLegale label="Licence de vente d'alcool">
            Entrepositaire agréé auprès de la direction générale des douanes et droits indirects —
            numéro d'accise FR012345E0001
          </LigneLegale>
        </dl>
      </SectionLegale>

      <SectionLegale titre="Directeur de la publication">
        <p>
          Mathieu Gaudron, en qualité de Président.
        </p>
      </SectionLegale>

      <SectionLegale titre="Hébergement">
        <p>Le site est hébergé par :</p>

        <dl className="mt-5 border-t border-trait">
          <LigneLegale label="Hébergeur">OVH SAS (OVHcloud)</LigneLegale>
          <LigneLegale label="Adresse">2 rue Kellermann, 59100 Roubaix, France</LigneLegale>
          <LigneLegale label="Téléphone">1007</LigneLegale>
        </dl>
      </SectionLegale>

      <SectionLegale titre="Objet du site">
        <p>
          Ponch'Store est une plateforme de commande en ligne réservée aux professionnels de la
          restauration et des débits de boissons d'Île-de-France : bars, restaurants,
          établissements de nuit et revendeurs titulaires des autorisations nécessaires.
        </p>
        <p>
          Les commandes sont passées par carton ou par palette, réservées sur un créneau de
          retrait, et <strong className="font-medium">réglées sur place au moment du retrait</strong>.
          Aucun paiement n'est encaissé en ligne. Les prix affichés sont exprimés hors taxes ; la
          TVA applicable est ajoutée au récapitulatif de commande.
        </p>
        <p>
          L'accès au catalogue est restreint : les comptes professionnels sont créés par l'équipe
          Ponch'Store après vérification de la qualité de professionnel de l'acheteur. Il n'existe
          pas d'inscription libre.
        </p>
      </SectionLegale>

      <SectionLegale titre="Vente de boissons alcoolisées">
        <p>
          La vente de boissons alcoolisées est interdite aux mineurs de moins de 18 ans
          (article L. 3342-1 du code de la santé publique). Le site étant réservé aux acheteurs
          professionnels, l'accès au catalogue suppose la production des justificatifs
          correspondants lors de la création du compte.
        </p>
        <p className="text-brume">
          L'abus d'alcool est dangereux pour la santé, à consommer avec modération.
        </p>
      </SectionLegale>

      <SectionLegale titre="Propriété intellectuelle">
        <p>
          L'ensemble des éléments composant le site — structure, textes, identité visuelle,
          typographies, logiciels et bases de données — est protégé par le droit de la propriété
          intellectuelle et demeure la propriété de{' '}
          <span className="font-medium">PONCH'STORE</span> ou de ses partenaires.
        </p>
        <p>
          Toute reproduction, représentation, adaptation ou exploitation, totale ou partielle, par
          quelque procédé que ce soit, sans autorisation écrite préalable, est interdite.
        </p>
        <p>
          Les marques, dénominations et visuels des produits présentés au catalogue restent la
          propriété de leurs titulaires respectifs et sont reproduits à des fins de description
          commerciale.
        </p>
      </SectionLegale>

      <SectionLegale titre="Données personnelles">
        <p>
          Les données collectées lors de la création d'un compte et du passage des commandes — nom,
          prénom, adresse email, téléphone, nom et adresse de l'établissement, numéro SIRET — sont
          traitées pour la seule gestion de la relation commerciale : accès au catalogue, suivi des
          commandes, organisation des retraits et envoi des emails liés aux commandes.
        </p>
        <p>
          Conformément au règlement (UE) 2016/679 et à la loi « Informatique et Libertés », vous
          disposez d'un droit d'accès, de rectification, d'effacement, de limitation et
          d'opposition sur les données vous concernant. Ces droits s'exercent auprès de{' '}
          rgpd@ponchstore.fr.
        </p>
        <p>
          Vous pouvez également introduire une réclamation auprès de la CNIL (3 place de Fontenoy,
          TSA 80715, 75334 Paris Cedex 07 — cnil.fr).
        </p>
      </SectionLegale>

      <SectionLegale titre="Cookies et stockage local">
        <p>
          Le site n'utilise aucun cookie publicitaire ni aucun outil de mesure d'audience tiers.
          Le jeton d'authentification est conservé dans le stockage de session du navigateur
          pendant la durée de la connexion, et effacé à la déconnexion ou à la fermeture de
          l'onglet. Ce stockage est strictement nécessaire au fonctionnement du service et ne
          requiert pas de consentement préalable.
        </p>
      </SectionLegale>

      <SectionLegale titre="Responsabilité">
        <p>
          Les informations du catalogue — disponibilités, formats, tarifs — sont mises à jour
          régulièrement mais sont fournies à titre indicatif. Une réservation ne vaut confirmation
          qu'après validation par l'équipe Ponch'Store, et la disponibilité effective des produits
          est constatée au retrait.
        </p>
        <p>
          L'éditeur ne saurait être tenu pour responsable d'une interruption du service, d'une
          erreur d'affichage, ni des dommages résultant de l'utilisation du site ou de
          l'impossibilité d'y accéder.
        </p>
      </SectionLegale>

      <SectionLegale titre="Droit applicable">
        <p>
          Les présentes mentions légales sont soumises au droit français. Les relations
          commerciales étant établies entre professionnels, tout litige relatif à l'utilisation du
          site relèvera de la compétence exclusive des tribunaux du ressort de Créteil, à défaut
          de résolution amiable.
        </p>
      </SectionLegale>
    </CadreLegal>
  )
}
