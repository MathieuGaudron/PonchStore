import CadreLegal, { ARemplir, LigneLegale, SectionLegale } from '../components/CadreLegal'

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
          <ARemplir>adresse du site en production</ARemplir>, est édité par :
        </p>

        <dl className="mt-5 border-t border-trait">
          <LigneLegale label="Raison sociale">
            <ARemplir>dénomination sociale</ARemplir>
          </LigneLegale>
          <LigneLegale label="Forme juridique">
            <ARemplir>SAS, SARL, EI…</ARemplir>
          </LigneLegale>
          <LigneLegale label="Capital social">
            <ARemplir>montant en euros</ARemplir>
          </LigneLegale>
          <LigneLegale label="Siège social">
            <ARemplir>adresse complète</ARemplir>
          </LigneLegale>
          <LigneLegale label="RCS">
            <ARemplir>ville d'immatriculation et numéro</ARemplir>
          </LigneLegale>
          <LigneLegale label="SIRET">
            <ARemplir>numéro à 14 chiffres</ARemplir>
          </LigneLegale>
          <LigneLegale label="TVA intracommunautaire">
            <ARemplir>numéro de TVA</ARemplir>
          </LigneLegale>
          <LigneLegale label="Téléphone">
            <ARemplir>numéro de contact</ARemplir>
          </LigneLegale>
          <LigneLegale label="Email">
            <ARemplir>adresse de contact</ARemplir>
          </LigneLegale>
          <LigneLegale label="Licence de vente d'alcool">
            <ARemplir>numéro de licence ou de déclaration en douane</ARemplir>
          </LigneLegale>
        </dl>
      </SectionLegale>

      <SectionLegale titre="Directeur de la publication">
        <p>
          <ARemplir>nom et prénom du représentant légal</ARemplir>, en qualité de{' '}
          <ARemplir>fonction</ARemplir>.
        </p>
      </SectionLegale>

      <SectionLegale titre="Hébergement">
        <p>Le site est hébergé par :</p>

        <dl className="mt-5 border-t border-trait">
          <LigneLegale label="Hébergeur">
            <ARemplir>nom de l'hébergeur</ARemplir>
          </LigneLegale>
          <LigneLegale label="Adresse">
            <ARemplir>adresse postale de l'hébergeur</ARemplir>
          </LigneLegale>
          <LigneLegale label="Téléphone">
            <ARemplir>numéro de l'hébergeur</ARemplir>
          </LigneLegale>
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
          <ARemplir>dénomination sociale</ARemplir> ou de ses partenaires.
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
          <ARemplir>adresse email du responsable de traitement</ARemplir>.
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
          site relèvera de la compétence exclusive des tribunaux du ressort de{' '}
          <ARemplir>ville du siège social</ARemplir>, à défaut de résolution amiable.
        </p>
      </SectionLegale>
    </CadreLegal>
  )
}
