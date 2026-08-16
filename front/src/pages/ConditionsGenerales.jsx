import { Link } from 'react-router-dom'
import CadreLegal, { ARemplir, SectionLegale } from '../components/CadreLegal'

export default function ConditionsGenerales() {
  return (
    <CadreLegal
      surtitre="Informations légales"
      titre="Conditions générales de vente"
      miseAJour="16 août 2026"
    >
      <SectionLegale titre="1. Objet et champ d'application">
        <p>
          Les présentes conditions générales de vente régissent les ventes conclues sur la
          plateforme Ponch'Store entre <ARemplir>dénomination sociale</ARemplir>, ci-après « le
          Vendeur », et ses clients professionnels, ci-après « le Client ».
        </p>
        <p>
          La plateforme est <strong className="font-medium">réservée aux professionnels</strong> :
          bars, restaurants, établissements de nuit et revendeurs titulaires des autorisations
          nécessaires à la vente de boissons alcoolisées. Aucune vente n'est consentie à un
          consommateur au sens du code de la consommation ; les dispositions relatives au droit de
          rétractation ne s'appliquent donc pas.
        </p>
        <p>
          Toute commande passée sur la plateforme emporte acceptation sans réserve des présentes
          conditions, qui prévalent sur les conditions d'achat du Client.
        </p>
      </SectionLegale>

      <SectionLegale titre="2. Compte client">
        <p>
          Il n'existe pas d'inscription libre. Les comptes sont créés par l'équipe Ponch'Store
          après vérification de la qualité de professionnel du Client, sur présentation des
          justificatifs correspondants (numéro SIRET, licence d'exploitation).
        </p>
        <p>
          Le Client est responsable de la confidentialité de ses identifiants et de toute commande
          passée depuis son compte. Il s'engage à maintenir ses informations à jour, notamment
          l'adresse email de contact, qui sert à l'envoi des confirmations de commande et des
          rappels de créneau.
        </p>
      </SectionLegale>

      <SectionLegale titre="3. Produits">
        <p>
          Les produits sont vendus par carton, dans le format indiqué sur chaque fiche produit.
          Les caractéristiques présentées au catalogue — contenance, marque, format de carton,
          visuels — sont fournies à titre indicatif et peuvent être modifiées par les fabricants
          sans que la responsabilité du Vendeur puisse être engagée.
        </p>
        <p>
          Les disponibilités affichées reflètent le stock au moment de la consultation. Elles ne
          valent pas engagement : la disponibilité effective est constatée à la préparation de la
          commande.
        </p>
      </SectionLegale>

      <SectionLegale titre="4. Prix">
        <p>
          Les prix sont exprimés <strong className="font-medium">en euros hors taxes</strong>. La
          TVA au taux en vigueur, soit 20 %, est ajoutée au récapitulatif de commande et fait
          l'objet d'une ligne distincte.
        </p>
        <p>
          Le tarif est dégressif : le prix au carton diminue par paliers en fonction du nombre de
          <strong className="font-medium"> palettes complètes</strong> commandées. La grille
          applicable est la suivante :
        </p>
        <ul className="ml-5 list-disc space-y-1">
          <li>moins de 5 palettes complètes : prix au carton du catalogue, sans remise ;</li>
          <li>
            de 5 à 9 palettes complètes : <strong className="font-medium">remise de 5 %</strong> sur
            le prix au carton du catalogue ;
          </li>
          <li>
            à partir de 10 palettes complètes :{' '}
            <strong className="font-medium">remise de 10 %</strong> sur le prix au carton du
            catalogue.
          </li>
        </ul>
        <p>
          Le nombre de palettes complètes s'apprécie produit par produit : seules les palettes
          entières sont comptées, le reliquat de cartons ne s'additionne pas d'un produit à
          l'autre. La remise est appliquée automatiquement au panier et reprise sur le
          récapitulatif de commande.
        </p>
        <p>
          Le prix retenu est toujours le plus avantageux pour le Client : si une quantité
          supérieure ouvre un palier plus favorable, c'est ce montant qui est facturé. Une commande
          proche d'un palier est ainsi facturée au prix de la quantité qui déclenche ce palier, sans
          que le Client ait à commander davantage.
        </p>
        <p>
          Les prix applicables sont ceux affichés au moment de la validation de la commande. Le
          Vendeur se réserve le droit de modifier ses tarifs à tout moment, sans effet sur les
          commandes déjà confirmées.
        </p>
      </SectionLegale>

      <SectionLegale titre="5. Commande et réservation">
        <p>
          Le Client compose son panier, sélectionne un créneau de retrait puis valide sa
          réservation. La validation vaut commande ferme.
        </p>
        <p>
          <strong className="font-medium">Le stock est bloqué dès la validation</strong> : les
          quantités réservées sont retirées du stock disponible et ne sont plus proposées aux
          autres clients.
        </p>
        <p>
          La commande suit ensuite les états suivants : en attente, en préparation, prête, puis
          récupérée. Le Client est informé par email de la confirmation de sa commande et reçoit
          un rappel la veille de son créneau de retrait.
        </p>
      </SectionLegale>

      <SectionLegale titre="6. Créneau de retrait">
        <p>
          Le retrait s'effectue sur le créneau réservé par le Client, à l'adresse{' '}
          <ARemplir>adresse du point de retrait</ARemplir>. Les créneaux disponibles sont ouverts
          par le Vendeur et leur capacité est limitée.
        </p>
        <p>
          Le Client se présente muni d'un justificatif d'identité et, le cas échéant, d'un mandat
          si le retrait est effectué par un tiers.
        </p>
        <p>
          En cas de retard ou d'absence au créneau réservé :{' '}
          <ARemplir>délai de garde de la commande, conditions de report, frais éventuels</ARemplir>.
        </p>
      </SectionLegale>

      <SectionLegale titre="7. Paiement">
        <p>
          <strong className="font-medium">
            Aucun paiement n'est encaissé en ligne.
          </strong>{' '}
          Le règlement s'effectue intégralement sur place, au moment du retrait de la commande.
        </p>
        <p>
          Moyens de paiement acceptés :{' '}
          <ARemplir>espèces, carte bancaire, chèque, virement…</ARemplir>. Conditions de paiement
          différé éventuellement consenties : <ARemplir>délais et plafonds accordés</ARemplir>.
        </p>
        <p>
          Conformément à l'article L. 441-10 du code de commerce, tout retard de paiement entraîne
          de plein droit des pénalités calculées au taux d'intérêt de la Banque centrale
          européenne majoré de 10 points, ainsi qu'une indemnité forfaitaire de recouvrement de
          40 euros.
        </p>
      </SectionLegale>

      <SectionLegale titre="8. Retrait et transfert des risques">
        <p>
          Le transfert des risques sur les marchandises s'opère à la remise physique des produits
          au Client, lors du retrait.
        </p>
        <p>
          Le Client est tenu de vérifier l'état et la conformité de sa commande au moment du
          retrait. Toute réserve doit être formulée immédiatement, en présence de l'équipe
          Ponch'Store.
        </p>
      </SectionLegale>

      <SectionLegale titre="9. Annulation">
        <p>
          Le Client peut annuler sa commande depuis son espace tant qu'elle n'a pas été marquée
          comme prête, c'est-à-dire aux états « en attente » et « en préparation ». L'annulation
          remet immédiatement les quantités concernées à disposition des autres clients.
        </p>
        <p>
          Une fois la commande prête, l'annulation n'est plus possible depuis la plateforme et
          doit faire l'objet d'une demande auprès du Vendeur.
        </p>
        <p>
          Le Vendeur peut annuler une commande en cas d'indisponibilité constatée, de doute sur la
          qualité de professionnel du Client, ou de manquement répété aux présentes conditions.
        </p>
      </SectionLegale>

      <SectionLegale titre="10. Réclamations et produits non conformes">
        <p>
          Toute réclamation portant sur un produit manquant, abîmé ou non conforme doit être
          adressée à <ARemplir>adresse email du service client</ARemplir> dans un délai de{' '}
          <ARemplir>délai en jours</ARemplir> à compter du retrait.
        </p>
        <p>
          Les produits doivent être conservés dans leur emballage d'origine et tenus à disposition
          du Vendeur. Après acceptation de la réclamation, le Vendeur procède au remplacement ou à
          l'avoir, à son choix.
        </p>
      </SectionLegale>

      <SectionLegale titre="11. Réserve de propriété">
        <p>
          Les marchandises demeurent la propriété du Vendeur jusqu'au paiement intégral de leur
          prix, nonobstant le transfert des risques opéré au retrait.
        </p>
      </SectionLegale>

      <SectionLegale titre="12. Vente de boissons alcoolisées">
        <p>
          La vente de boissons alcoolisées à des mineurs de moins de 18 ans est interdite (article
          L. 3342-1 du code de la santé publique). Le Client, en sa qualité de professionnel,
          garantit disposer des licences et autorisations nécessaires à la revente et s'engage à
          respecter la réglementation applicable à son activité.
        </p>
        <p className="text-brume">
          L'abus d'alcool est dangereux pour la santé, à consommer avec modération.
        </p>
      </SectionLegale>

      <SectionLegale titre="13. Responsabilité">
        <p>
          La responsabilité du Vendeur ne saurait être engagée en cas d'inexécution résultant d'un
          cas de force majeure, d'une rupture d'approvisionnement chez le fournisseur, ou d'une
          faute du Client.
        </p>
        <p>
          Le Vendeur ne peut être tenu responsable des dommages indirects tels que perte
          d'exploitation, perte de chiffre d'affaires ou atteinte à l'image.
        </p>
      </SectionLegale>

      <SectionLegale titre="14. Données personnelles">
        <p>
          Le traitement des données collectées dans le cadre de la relation commerciale est décrit
          dans la{' '}
          <Link
            to="/politique-de-confidentialite"
            className="text-graphite underline decoration-trait-fonce underline-offset-4 transition-colors hover:decoration-encre"
          >
            politique de confidentialité
          </Link>
          .
        </p>
      </SectionLegale>

      <SectionLegale titre="15. Droit applicable et juridiction">
        <p>
          Les présentes conditions sont soumises au droit français. Les relations étant établies
          entre professionnels, tout litige relève de la compétence exclusive des tribunaux du
          ressort de <ARemplir>ville du siège social</ARemplir>, à défaut de résolution amiable.
        </p>
      </SectionLegale>
    </CadreLegal>
  )
}
