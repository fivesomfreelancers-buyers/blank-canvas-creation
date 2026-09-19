import type { DocsDictionary } from './types';

const fr: DocsDictionary = {
  dir: 'ltr',
  ui: {
    docsLabel: 'Documentation',
    home: 'Accueil',
    h1: 'Documentation FIVESOM',
    intro:
      'Des guides clairs, étape par étape, pour acheter des services, vendre en tant que freelance, gérer vos commandes et être payé sur FIVESOM. Choisissez un chapitre à gauche pour lire uniquement ce sujet.',
    metaTitle: 'Documentation FIVESOM — Guides pour acheteurs et freelances',
    metaDescription:
      'Documentation officielle FIVESOM : création de compte, profil freelance, publication de gigs, commande de services, paiements séquestrés, retraits, vérification, Blue Tick et support.',
    searchPlaceholder: 'Rechercher dans la documentation…',
    clearSearch: 'Effacer la recherche',
    browseHeading: 'Parcourir par chapitre',
    browseIntro: 'Commencez par un groupe, puis ouvrez le chapitre exact dont vous avez besoin.',
    noResults: 'Aucun chapitre de documentation ne correspond à votre recherche.',
    noResultsHint: 'Essayez un mot plus simple comme commande, paiement, gig, support ou vérification.',
    chaptersLabel: 'Chapitres',
    relatedLabel: 'Chapitres liés',
    nextChapter: 'Chapitre suivant',
    previousChapter: 'Chapitre précédent',
    backToDocs: 'Tous les chapitres',
    languageLabel: 'Langue',
    videoCaption: 'Cette vidéo tutoriel appartient à ce chapitre.',
    openMenu: 'Ouvrir les chapitres',
    closeMenu: 'Fermer les chapitres',
    needHelpTitle: 'Besoin d\u2019aide supplémentaire ?',
    needHelpBody: 'Si un chapitre ne répond pas à votre question, l\u2019équipe support de FIVESOM peut examiner directement votre compte ou votre commande.',
    needHelpCta: 'Contacter le support FIVESOM',
  },
  groups: {
    'getting-started': { title: 'Premiers pas', description: 'Ce qu\u2019est FIVESOM, comment ouvrir un compte et comment le protéger.' },
    freelancers: { title: 'Freelances', description: 'Créer un profil, publier des gigs, fixer vos prix et être payé.' },
    buyers: { title: 'Acheteurs', description: 'Trouver le bon freelance, commander en toute sécurité et évaluer la livraison.' },
    orders: { title: 'Commandes et livraison', description: 'Communication, livraison, révisions et litiges.' },
    payments: { title: 'Paiements et sécurité', description: 'Protection par séquestre, confidentialité et bonnes pratiques sur la marketplace.' },
    verification: { title: 'Vérification et VIP', description: 'Vérification d\u2019identité, le Blue Tick et l\u2019abonnement VIP.' },
    support: { title: 'Support', description: 'Comment contacter le support FIVESOM et quelles informations inclure.' },
  },
  chapters: {
    'getting-started': {
      title: 'Premiers pas avec FIVESOM',
      eyebrow: 'Présentation de la plateforme',
      summary: 'Comprenez ce qu\u2019est FIVESOM, à qui la plateforme s\u2019adresse et comment le travail avance en toute sécurité, de la découverte jusqu\u2019au versement du paiement.',
      ctaLabel: 'Découvrir comment fonctionne FIVESOM',
      sections: [
        {
          heading: 'Qu\u2019est-ce que FIVESOM ?',
          body: 'FIVESOM est une marketplace freelance pour clients et freelances qualifiés, avec un fort accent mis sur les talents africains et somaliens. Les acheteurs trouvent des services, les freelances publient des gigs, et chaque commande payée est suivie par la plateforme depuis les besoins exprimés jusqu\u2019à la livraison.',
        },
        {
          heading: 'Comment fonctionne la plateforme',
          bullets: [
            'Un acheteur trouve un gig ou un freelance et choisit un forfait de service.',
            'L\u2019acheteur paie via FIVESOM afin que la commande soit protégée par un séquestre.',
            'Le freelance reçoit les besoins, réalise le travail et soumet la livraison.',
            'L\u2019acheteur accepte la livraison, demande une révision, ou ouvre un litige si nécessaire.',
          ],
        },
        {
          heading: 'Et ensuite ?',
          body: 'Créez un compte, puis choisissez si vous souhaitez engager des freelances, vendre vos compétences, ou faire les deux depuis le même compte FIVESOM.',
        },
      ],
    },
    'creating-account': {
      title: 'Créer votre compte',
      eyebrow: 'Configuration du compte',
      summary: 'Créez un compte FIVESOM, choisissez votre rôle et préparez votre profil pour acheter ou vendre des services.',
      ctaLabel: 'Créer un compte',
      videoLabel: 'Tutoriel : créer un compte FIVESOM',
      sections: [
        {
          heading: 'De quoi s\u2019agit-il ?',
          body: 'Votre compte FIVESOM est l\u2019identité que vous utilisez pour acheter des gigs, publier des services, envoyer des messages, gérer vos commandes et recevoir les notifications de la plateforme.',
        },
        {
          heading: 'Étapes pour créer un compte',
          bullets: [
            'Ouvrez la page d\u2019inscription et poursuivez avec l\u2019option de connexion disponible.',
            'Choisissez d\u2019abord le rôle dont vous avez besoin : acheteur, freelance, ou passez à un autre rôle plus tard si nécessaire.',
            'Ajoutez votre nom, une photo de profil, votre localisation et une courte biographie pour que les autres utilisateurs sachent avec qui ils travaillent.',
            'Vérifiez les paramètres de votre compte et protégez bien vos identifiants de connexion.',
          ],
        },
        {
          heading: 'Et ensuite ?',
          body: 'Les acheteurs peuvent parcourir les services immédiatement. Les freelances doivent compléter leur profil avant de publier un gig afin de donner aux acheteurs une première impression professionnelle.',
        },
      ],
    },
    'account-security': {
      title: 'Compte et sécurité',
      eyebrow: 'Confidentialité et protection',
      summary: 'Protégez votre compte et comprenez quelles informations sont publiques, privées ou utilisées uniquement pour la sécurité de la plateforme.',
      ctaLabel: 'Lire la politique de confidentialité',
      sections: [
        {
          heading: 'Qu\u2019est-ce qui est protégé ?',
          body: 'FIVESOM sépare les informations de profil public des données privées liées au compte, aux paiements, aux commandes et à la vérification. Les fichiers sensibles, comme les documents d\u2019identité et les pièces jointes de commande, ne sont jamais affichés publiquement.',
        },
        {
          heading: 'Comment protéger votre compte',
          bullets: [
            'Utilisez le site officiel FIVESOM et ne partagez jamais votre session de connexion.',
            'Gardez les échanges de messages et de fichiers liés aux commandes à l\u2019intérieur de la plateforme.',
            'Ignorez toute demande de déplacer les paiements ou la livraison en dehors de FIVESOM.',
            'Signalez immédiatement les profils suspects, les faux portfolios ou les demandes de paiement douteuses.',
          ],
        },
        {
          heading: 'Et ensuite ?',
          body: 'Si vous remarquez une activité inhabituelle, contactez le support FIVESOM en indiquant l\u2019e-mail du compte, l\u2019identifiant de commande ou le lien du gig afin que l\u2019équipe puisse enquêter rapidement.',
        },
      ],
    },
    'freelancer-profile': {
      title: 'Profil freelance',
      eyebrow: 'Fondation du vendeur',
      summary: 'Construisez un profil qui présente clairement vos compétences, votre expérience, vos langues, vos outils, votre portfolio et vos signaux de confiance.',
      ctaLabel: 'Modifier votre profil freelance',
      sections: [
        {
          heading: 'Pourquoi le profil compte',
          body: 'Votre profil est le premier élément sur lequel les acheteurs jugent votre sérieux et votre fiabilité. Un profil complet aide les acheteurs à comprendre ce que vous faites avant même d\u2019ouvrir un gig.',
        },
        {
          heading: 'Ce qu\u2019il faut compléter',
          bullets: [
            'Utilisez une photo de profil nette et un nom d\u2019affichage professionnel.',
            'Rédigez un titre précis, par exemple Designer de logos de marque ou Développeur web React.',
            'Ajoutez une courte biographie expliquant qui vous aidez et quels résultats vous obtenez.',
            'Listez les compétences, langues, outils et exemples de portfolio pertinents qui prouvent la qualité de votre travail.',
          ],
        },
        {
          heading: 'Et ensuite ?',
          body: 'Une fois votre profil complet, créez un gig avec des forfaits clairs, des exemples, les besoins à demander à l\u2019acheteur et des attentes de livraison précises.',
        },
      ],
    },
    'creating-gig': {
      title: 'Créer un gig',
      eyebrow: 'Publication de service',
      summary: 'Transformez un service en une offre claire que les acheteurs peuvent comprendre, comparer, acheter et évaluer.',
      ctaLabel: 'Créer un gig',
      videoLabel: 'Tutoriel : créer un gig sur FIVESOM',
      sections: [
        {
          heading: 'Qu\u2019est-ce qu\u2019un gig ?',
          body: 'Un gig est un service freelance packagé. Il explique ce que vous proposez, à quelle catégorie il appartient, ce que chaque forfait inclut, ce que l\u2019acheteur doit fournir et combien de temps prend la livraison.',
        },
        {
          heading: 'Comment créer un bon gig',
          bullets: [
            'Choisissez la catégorie la plus précise et rédigez un titre de service spécifique.',
            'Expliquez le résultat obtenu par l\u2019acheteur, pas seulement la tâche que vous effectuez.',
            'Ajoutez des forfaits Basic, Standard et Premium avec des livrables clairs.',
            'Recueillez les besoins de l\u2019acheteur en amont afin de pouvoir démarrer sans délai.',
            'Utilisez des médias de portfolio qui montrent votre propre travail original.',
          ],
        },
        {
          heading: 'Et ensuite ?',
          body: 'Une fois publié, votre gig peut apparaître dans les résultats de recherche et les pages de catégorie. Gardez le titre, la miniature, les forfaits et le délai de livraison à jour pour que les acheteurs sachent exactement ce qu\u2019ils commandent.',
        },
      ],
    },
    'packages-pricing': {
      title: 'Forfaits et tarification des gigs',
      eyebrow: 'Basic, Standard, Premium',
      summary: 'Utilisez trois niveaux de forfaits pour rendre votre offre facile à comparer et plus simple à acheter pour les acheteurs.',
      sections: [
        {
          heading: 'Que sont les forfaits ?',
          body: 'Les forfaits sont les niveaux de tarification d\u2019un gig. Ils aident les acheteurs à choisir le niveau de service dont ils ont besoin sans devoir négocier chaque détail à partir de zéro.',
        },
        {
          heading: 'Comment structurer les forfaits',
          bullets: [
            'Le forfait Basic doit résoudre la version la plus simple du besoin de l\u2019acheteur.',
            'Le forfait Standard doit offrir le meilleur rapport qualité-prix pour la plupart des acheteurs.',
            'Le forfait Premium doit inclure la livraison la plus complète, un délai plus rapide ou des livrables supplémentaires.',
            'Chaque niveau doit indiquer clairement le délai de livraison, les éléments inclus, les révisions et les éventuelles limites.',
          ],
        },
        {
          heading: 'Et ensuite ?',
          body: 'Lorsqu\u2019un acheteur commande un forfait, son prix et ses livrables font partie intégrante du dossier de commande. Gardez les détails des forfaits réalistes afin d\u2019éviter plus facilement les litiges.',
        },
      ],
    },
    'earnings-fees': {
      title: 'Revenus et frais du freelance',
      eyebrow: 'Solde du portefeuille',
      summary: 'Comprenez comment les commandes terminées deviennent des revenus pour le freelance et comment les frais FIVESOM sont appliqués.',
      ctaLabel: 'Ouvrir votre portefeuille',
      sections: [
        {
          heading: 'Quand les freelances sont-ils payés ?',
          body: 'Les freelances gagnent de l\u2019argent lorsque l\u2019acheteur accepte la livraison. Avant cette acceptation, le paiement de l\u2019acheteur reste protégé en séquestre et n\u2019est pas disponible pour un retrait.',
        },
        {
          heading: 'Comment fonctionnent les frais',
          bullets: [
            'FIVESOM applique une commission de plateforme de 15 % sur les revenus du freelance lors du traitement des retraits.',
            'Le freelance reçoit les 85 % restants après déduction des frais de plateforme.',
            'Les soldes du portefeuille sont calculés par la plateforme et ne peuvent jamais être modifiés depuis le navigateur.',
            'La disponibilité des retraits dépend des commandes terminées et des demandes de retrait en attente.',
          ],
        },
        {
          heading: 'Et ensuite ?',
          body: 'Une fois les fonds disponibles dans votre portefeuille, demandez un retrait via les options de paiement prises en charge sur votre compte.',
        },
      ],
    },
    withdrawals: {
      title: 'Retraits',
      eyebrow: 'Versements',
      summary: 'Demandez un versement depuis votre portefeuille FIVESOM dès que des revenus éligibles sont disponibles.',
      ctaLabel: 'Ouvrir votre portefeuille',
      videoLabel: 'Tutoriel : retirer ses revenus FIVESOM',
      sections: [
        {
          heading: 'Qu\u2019est-ce qu\u2019un retrait ?',
          body: 'Un retrait est une demande de transfert des revenus disponibles de votre portefeuille FIVESOM vers un moyen de paiement pris en charge, y compris le mobile money local.',
        },
        {
          heading: 'Comment fonctionnent les retraits',
          bullets: [
            'Terminez des commandes et attendez que l\u2019acceptation de l\u2019acheteur libère les fonds vers votre portefeuille.',
            'Confirmez vos coordonnées de paiement avant de demander un retrait.',
            'Le montant minimum de retrait est de 20 $.',
            'FIVESOM examine et traite les demandes de retrait éligibles selon les règles de la plateforme.',
          ],
        },
        {
          heading: 'Et ensuite ?',
          body: 'Suivez le statut du retrait depuis votre portefeuille. Si une demande nécessite une vérification, le support peut vous demander des coordonnées de paiement mises à jour.',
        },
      ],
    },
    'finding-freelancers': {
      title: 'Trouver des freelances',
      eyebrow: 'Rechercher et comparer',
      summary: 'Trouvez le bon freelance grâce à la catégorie, aux détails du gig, aux avis, à la qualité du portfolio, au délai de livraison et à la communication.',
      ctaLabel: 'Explorer les services',
      sections: [
        {
          heading: 'Que peuvent rechercher les acheteurs ?',
          body: 'Les acheteurs peuvent parcourir FIVESOM par catégorie de service, mots-clés, profil de freelance, note, prix des forfaits et adéquation du délai de livraison.',
        },
        {
          heading: 'Comment bien choisir',
          bullets: [
            'Ouvrez le gig et lisez ce que chaque forfait inclut avant de commander.',
            'Vérifiez les exemples de portfolio, les avis, la note et les éventuels badges de vérification.',
            'Envoyez d\u2019abord un message au freelance pour les projets complexes, sur mesure ou urgents.',
            'Confirmez le format de livraison, le délai et les fichiers sources avant de payer.',
          ],
        },
        {
          heading: 'Et ensuite ?',
          body: 'Après avoir choisi un freelance, sélectionnez le forfait qui correspond à votre projet et poursuivez vers le paiement sécurisé.',
        },
      ],
    },
    'buying-gig': {
      title: 'Acheter un gig',
      eyebrow: 'Passer une commande',
      summary: 'Choisissez un forfait, payez en toute sécurité, soumettez vos besoins et suivez la commande depuis votre tableau de bord acheteur.',
      ctaLabel: 'Parcourir les gigs',
      videoLabel: 'Tutoriel : commander un service sur FIVESOM',
      sections: [
        {
          heading: 'Qu\u2019est-ce qu\u2019acheter un gig ?',
          body: 'Acheter un gig signifie sélectionner un forfait de service freelance et créer une commande via FIVESOM. La commande regroupe les détails du forfait, le statut du paiement, les besoins, les fichiers de livraison, les messages et les actions d\u2019évaluation.',
        },
        {
          heading: 'Comment passer une commande',
          bullets: [
            'Ouvrez le gig et comparez les forfaits Basic, Standard et Premium.',
            'Posez des questions avant de commander si votre projet est complexe.',
            'Payez via FIVESOM afin que la commande soit protégée par un séquestre.',
            'Soumettez les besoins dont le freelance a besoin pour commencer le travail.',
            'Suivez la progression depuis Mes commandes et gardez les messages sur la plateforme.',
          ],
        },
        {
          heading: 'Et ensuite ?',
          body: 'Une fois le paiement effectué et les besoins soumis, le freelance commence le travail et soumet la livraison depuis la page de la commande.',
        },
      ],
    },
    'order-requirements': {
      title: 'Besoins de la commande',
      eyebrow: 'Détails du projet',
      summary: 'Donnez au freelance les instructions, fichiers, références et objectifs nécessaires pour bien démarrer.',
      ctaLabel: 'Voir vos commandes',
      sections: [
        {
          heading: 'Que sont les besoins ?',
          body: 'Les besoins de la commande sont les instructions et fichiers que l\u2019acheteur soumet après le paiement. Ils indiquent au freelance ce qu\u2019il doit créer, dans quel format livrer et quels détails sont les plus importants.',
        },
        {
          heading: 'Ce qu\u2019il faut inclure',
          bullets: [
            'Un objectif de projet court et le livrable exact que vous attendez.',
            'Les noms de marque, couleurs, textes, fichiers, liens, dimensions ou notes techniques.',
            'Des exemples de ce que vous aimez et de ce que le freelance doit éviter.',
            'Une échéance claire si le projet dépend d\u2019une date de lancement ou d\u2019une campagne.',
          ],
        },
        {
          heading: 'Et ensuite ?',
          body: 'Une fois les besoins soumis, la commande passe en travail actif. Des besoins manquants retardent le freelance et repoussent la livraison.',
        },
      ],
    },
    'reviewing-delivery': {
      title: 'Examiner une livraison',
      eyebrow: 'Accepter, noter ou demander des modifications',
      summary: 'Vérifiez soigneusement le travail livré avant de l\u2019accepter, car l\u2019acceptation libère le paiement séquestré.',
      ctaLabel: 'Voir vos commandes',
      videoLabel: 'Tutoriel : acceptation de l\u2019acheteur et libération du paiement',
      sections: [
        {
          heading: 'Qu\u2019est-ce que l\u2019examen de la livraison ?',
          body: 'L\u2019examen de la livraison est le moment de décision pour l\u2019acheteur. Vous comparez le travail livré avec le forfait et les besoins exprimés, puis vous acceptez, demandez une révision ou ouvrez un litige.',
        },
        {
          heading: 'Comment examiner en toute sécurité',
          bullets: [
            'Ouvrez tous les fichiers et liens avant de cliquer sur Accepter la livraison.',
            'Comparez le travail avec les besoins que vous avez soumis.',
            'Utilisez les demandes de révision pour des changements clairs et réalisables.',
            'N\u2019ouvrez un litige que lorsque la livraison ne correspond pas à la commande et qu\u2019une révision ne peut pas résoudre le problème.',
          ],
        },
        {
          heading: 'Et ensuite ?',
          body: 'Lorsque vous acceptez la livraison, le paiement séquestré est libéré au freelance et vous pouvez laisser un avis de 1 à 5 étoiles avec un commentaire écrit.',
        },
      ],
    },
    'messaging-communication': {
      title: 'Messagerie et communication',
      eyebrow: 'Travailler ensemble clairement',
      summary: 'Utilisez la messagerie FIVESOM pour confirmer le périmètre, partager des fichiers, répondre aux questions et conserver un historique protégé du projet.',
      ctaLabel: 'Ouvrir votre messagerie',
      videoLabel: 'Tutoriel : messagerie FIVESOM',
      sections: [
        {
          heading: 'Pourquoi les messages sont importants',
          body: 'Une communication écrite claire évite la plupart des problèmes de commande. Les messages créent également un historique que le support peut consulter en cas d\u2019ouverture de litige.',
        },
        {
          heading: 'Bonnes pratiques',
          bullets: [
            'Confirmez le périmètre, le délai, les formats de fichiers et les attentes avant de commencer le travail.',
            'Gardez toutes les décisions importantes du projet dans le chat FIVESOM.',
            'N\u2019utilisez les pièces jointes et liens que lorsqu\u2019ils appuient la commande.',
            'Répondez rapidement et de façon professionnelle, surtout lorsque des révisions sont demandées.',
          ],
        },
        {
          heading: 'Et ensuite ?',
          body: 'Une fois que le freelance dispose des informations nécessaires, il termine le travail et soumet la livraison via la page de la commande.',
        },
      ],
    },
    'delivering-order': {
      title: 'Livrer une commande',
      eyebrow: 'Processus du freelance',
      summary: 'Soumettez le travail terminé via la page de la commande afin que l\u2019acheteur puisse l\u2019examiner et que le séquestre puisse être libéré après acceptation.',
      ctaLabel: 'Ouvrir vos commandes',
      videoLabel: 'Tutoriel : gérer et livrer des commandes sur FIVESOM',
      sections: [
        {
          heading: 'Qu\u2019est-ce qui compte comme une livraison ?',
          body: 'Une livraison correspond au travail terminé, au message, aux fichiers, liens ou instructions que le freelance soumet pour examen par l\u2019acheteur. Elle doit correspondre au forfait acheté et aux besoins de l\u2019acheteur.',
        },
        {
          heading: 'Comment livrer de façon professionnelle',
          bullets: [
            'Relisez les besoins d\u2019origine avant de soumettre les fichiers finaux.',
            'Téléversez les bons fichiers et expliquez ce qui est inclus dans le message de livraison.',
            'Mentionnez toute note d\u2019utilisation, format de fichier ou étape suivante dont l\u2019acheteur a besoin.',
            'Ne marquez jamais un travail inachevé comme livré simplement pour arrêter le compteur du délai.',
          ],
        },
        {
          heading: 'Et ensuite ?',
          body: 'L\u2019acheteur examine la livraison et peut l\u2019accepter, demander une révision, ou ouvrir un litige si le travail ne correspond pas à la commande.',
        },
      ],
    },
    revisions: {
      title: 'Révisions',
      eyebrow: 'Demander des modifications',
      summary: 'Utilisez les révisions pour demander des changements précis avant d\u2019accepter la livraison.',
      sections: [
        {
          heading: 'Qu\u2019est-ce qu\u2019une révision ?',
          body: 'Une révision est une demande adressée au freelance pour ajuster une livraison qui est proche du résultat attendu mais pas encore correcte. Elle doit rester dans le périmètre et les besoins d\u2019origine de la commande.',
        },
        {
          heading: 'Comment formuler une révision utile',
          bullets: [
            'Soyez précis sur ce qui doit changer et où se situe le problème.',
            'Joignez des captures d\u2019écran, horodatages, noms de fichiers ou exemples lorsque cela aide.',
            'Restez dans les limites du forfait que vous avez acheté.',
            'Évitez de demander un projet entièrement nouveau sous forme de révision.',
          ],
        },
        {
          heading: 'Et ensuite ?',
          body: 'Le freelance examine votre demande, met à jour le travail et soumet une nouvelle livraison pour un nouvel examen de votre part.',
        },
      ],
    },
    disputes: {
      title: 'Litiges',
      eyebrow: 'Quand une commande nécessite un examen',
      summary: 'Ouvrez un litige lorsque l\u2019acheteur et le freelance ne parviennent pas à résoudre un problème de commande par les messages ou les révisions.',
      videoLabel: 'Tutoriel : processus de litige FIVESOM',
      sections: [
        {
          heading: 'Qu\u2019est-ce qu\u2019un litige ?',
          body: 'Un litige demande au support FIVESOM d\u2019examiner une commande et de décider du résultat le plus juste, en se basant sur les détails de la commande, les messages, les fichiers et les preuves fournies par les deux parties.',
        },
        {
          heading: 'Comment fonctionnent les litiges',
          bullets: [
            'Chaque partie explique le problème depuis la page de la commande.',
            'Les deux parties peuvent fournir des messages, fichiers, captures d\u2019écran ou autres preuves liées à la commande.',
            'L\u2019équipe support examine le périmètre d\u2019origine et l\u2019historique de la livraison.',
            'Le résultat peut inclure des recommandations de révision, un traitement de remboursement ou une libération du paiement selon les preuves.',
          ],
        },
        {
          heading: 'Et ensuite ?',
          body: 'Les fonds restent protégés pendant l\u2019examen du litige. Restez professionnel dans la communication et répondez rapidement lorsque le support demande des précisions.',
        },
      ],
    },
    'escrow-payments': {
      title: 'Séquestre et paiements',
      eyebrow: 'Protection des paiements',
      summary: 'Découvrez comment FIVESOM conserve les fonds de l\u2019acheteur en toute sécurité jusqu\u2019à ce que le travail soit livré et accepté.',
      sections: [
        {
          heading: 'Qu\u2019est-ce que le séquestre ?',
          body: 'Le séquestre signifie que l\u2019acheteur paie via FIVESOM, mais que le freelance ne reçoit pas l\u2019argent immédiatement. Le paiement est conservé pendant que le travail est réalisé.',
        },
        {
          heading: 'Comment fonctionne la protection des paiements',
          bullets: [
            'L\u2019acheteur paie via une méthode de paiement FIVESOM approuvée.',
            'La commande devient active une fois le paiement confirmé.',
            'Le freelance livre le travail via la page de la commande.',
            'L\u2019acheteur accepte la livraison et le paiement est libéré vers le portefeuille du freelance.',
          ],
        },
        {
          heading: 'Et ensuite ?',
          body: 'Si la livraison ne correspond pas à la commande, l\u2019acheteur peut demander une révision ou ouvrir un litige avant d\u2019accepter.',
        },
      ],
    },
    'privacy-trust': {
      title: 'Confidentialité et confiance',
      eyebrow: 'Bonnes pratiques sur la marketplace',
      summary: 'Comprenez comment FIVESOM protège les données privées et ce que les utilisateurs doivent faire pour sécuriser leurs commandes.',
      ctaLabel: 'Lire les conditions d\u2019utilisation',
      sections: [
        {
          heading: 'Qu\u2019est-ce qui reste privé ?',
          body: 'Les détails privés du compte, les documents d\u2019identité, les registres de paiement, les pièces jointes de commande et les décisions internes de vérification ne font jamais partie des profils publics ou des pages de gigs.',
        },
        {
          heading: 'Comment les utilisateurs maintiennent la confiance',
          bullets: [
            'Utilisez un vrai travail de portfolio et des informations de profil honnêtes.',
            'Ne demandez jamais de paiement hors plateforme ni de coordonnées privées pour contourner FIVESOM.',
            'Signalez les faux comptes, les vols de travail, les messages abusifs ou les comportements de paiement suspects.',
            'N\u2019utilisez les litiges que pour de véritables problèmes de commande et fournissez des preuves claires.',
          ],
        },
        {
          heading: 'Et ensuite ?',
          body: 'Les signalements et litiges sont examinés par l\u2019équipe FIVESOM. Les comptes qui enfreignent les règles de la marketplace peuvent recevoir des avertissements, des restrictions ou être supprimés.',
        },
      ],
    },
    verification: {
      title: 'Vérification du compte',
      eyebrow: 'Badge vendeur vérifié',
      summary: 'Confirmez votre identité pour que les acheteurs sachent qu\u2019une personne réelle et contrôlée se trouve derrière vos gigs.',
      ctaLabel: 'Démarrer la vérification',
      videoLabel: 'Tutoriel : vérifier votre compte FIVESOM',
      sections: [
        {
          heading: 'Qu\u2019est-ce que la vérification ?',
          body: 'La vérification est un contrôle d\u2019identité. Vous soumettez un document d\u2019identité officiel depuis votre tableau de bord freelance, l\u2019équipe FIVESOM l\u2019examine, et un compte approuvé reçoit le badge vert « Verified » sur son profil et ses gigs.',
        },
        {
          heading: 'Comment se faire vérifier',
          bullets: [
            'Ouvrez la vérification depuis votre tableau de bord freelance et complétez d\u2019abord les détails de votre profil.',
            'Téléversez une photo nette d\u2019un document d\u2019identité accepté, comme un passeport, une carte d\u2019identité nationale ou un permis de conduire.',
            'Assurez-vous que le nom figurant sur le document correspond au nom de votre profil FIVESOM.',
            'Soumettez la demande et attendez l\u2019examen — les documents sont conservés de façon privée et vus uniquement par le personnel autorisé.',
          ],
        },
        {
          heading: 'Et ensuite ?',
          body: 'Si l\u2019examen aboutit, le badge « Verified » apparaît sur votre profil public. Si un élément n\u2019est pas clair, l\u2019équipe demande un nouveau document que vous pouvez soumettre à nouveau. La vérification n\u2019est pas la même chose que le Blue Tick.',
        },
      ],
    },
    'blue-tick': {
      title: 'Blue Tick',
      eyebrow: 'Attribué uniquement par FIVESOM',
      summary: 'Le Blue Tick (badge bleu) est le signal de confiance le plus élevé sur FIVESOM et n\u2019est accordé que par l\u2019équipe FIVESOM après examen.',
      ctaLabel: 'Ouvrir la demande de Blue Tick',
      sections: [
        {
          heading: 'Qu\u2019est-ce que le Blue Tick ?',
          body: 'Le Blue Tick distingue les freelances expérimentés et fiables. Il ne peut pas être acheté et n\u2019est pas automatique : l\u2019équipe FIVESOM examine chaque candidature et accorde le badge manuellement. Il est distinct du badge vert « Verified ».',
        },
        {
          heading: 'Éligibilité et candidature',
          bullets: [
            'Votre compte doit être âgé d\u2019au moins 100 jours, calculés à partir de votre véritable date d\u2019inscription.',
            'L\u2019éligibilité est calculée à partir de l\u2019activité réelle : commandes terminées, évaluations, revenus et qualité du profil.',
            'La candidature comporte trois étapes — informations professionnelles, informations d\u2019identité, et une vérification faciale ou par caméra.',
            'La progression est enregistrée au fur et à mesure, et les trois étapes doivent être complètes avant que la candidature puisse être soumise.',
          ],
        },
        {
          heading: 'Et ensuite ?',
          body: 'L\u2019équipe FIVESOM peut approuver, refuser ou demander des modifications. Les freelances approuvés affichent le Blue Tick sur toute la plateforme. Les documents et images faciales restent privés et ne sont utilisés que pour cet examen.',
        },
      ],
    },
    'vip-membership': {
      title: 'Abonnement VIP',
      eyebrow: 'Fonctionnalités de croissance',
      summary: 'Découvrez les fonctionnalités de visibilité VIP, les limites vendeur et comment l\u2019abonnement soutient les freelances les plus sérieux.',
      ctaLabel: 'Voir l\u2019abonnement VIP',
      sections: [
        {
          heading: 'Qu\u2019est-ce que le VIP ?',
          body: 'L\u2019abonnement VIP s\u2019adresse aux freelances qui souhaitent davantage de visibilité et d\u2019outils de croissance. Il complète une bonne qualité de travail ; il ne remplace pas les avis, la performance de livraison ou les règles de la marketplace.',
        },
        {
          heading: 'Comment utiliser le VIP de façon responsable',
          bullets: [
            'Maintenez une qualité de gig élevée avant de payer pour plus de visibilité.',
            'N\u2019utilisez la capacité supplémentaire de gigs que pour des services que vous pouvez livrer correctement.',
            'Maintenez des réponses rapides, des livraisons à temps et une communication claire avec les acheteurs.',
            'Évaluez votre performance avant de mettre à niveau ou de renouveler votre abonnement.',
          ],
        },
        {
          heading: 'Et ensuite ?',
          body: 'Consultez la page VIP pour comparer les options disponibles et vous assurer que le plan correspond à votre charge de travail freelance actuelle.',
        },
      ],
    },
    support: {
      title: 'Support FIVESOM',
      eyebrow: 'Aide et contact',
      summary: 'Trouvez des réponses, contactez le support et incluez les bonnes informations pour que l\u2019équipe puisse vous aider plus rapidement.',
      ctaLabel: 'Contacter le support',
      sections: [
        {
          heading: 'Quand contacter le support ?',
          body: 'Contactez le support FIVESOM pour les problèmes d\u2019accès au compte, les questions de paiement, les litiges de commande, les problèmes de vérification, les comportements suspects ou tout ce que la documentation ne couvre pas.',
        },
        {
          heading: 'Que faut-il inclure',
          bullets: [
            'Votre identifiant de commande, le lien du gig ou le lien de profil lorsque la question concerne une page précise.',
            'Une explication brève de ce qui s\u2019est passé et de ce que vous attendiez à la place.',
            'Des captures d\u2019écran ou fichiers uniquement lorsqu\u2019ils aident le support à comprendre le problème.',
            'Votre langue de réponse préférée si vous avez besoin d\u2019un support en somali, en arabe, en français ou en anglais.',
          ],
        },
        {
          heading: 'Et ensuite ?',
          body: 'Le support examine la demande, vérifie les registres du compte ou de la commande concernés, puis répond avec la prochaine action ou décision.',
        },
      ],
    },
  },
};

export default fr;
