import type { Messages } from './en';

/**
 * Dutch messages.
 *
 * Typed as `Messages`, so a key added to `en.ts` and forgotten here is a
 * compile error rather than an English string surfacing in the Dutch UI.
 *
 * Tone rules from the design system, treated as functional requirements:
 * je/jij and never u, sentence case and never Title Case, sentences under 20
 * words, no exclamation marks, no emoji. Numbers Dutch: 4,3 · 1.248 · 68%.
 */
export const nl: Messages = {
  brand: {
    name: 'GeefSterren',
    tagline: 'Feedback die tot verbetering leidt',
    poweredBy: 'Feedback mogelijk gemaakt door GeefSterren',
  },

  common: {
    save: 'Opslaan',
    saving: 'Bezig met opslaan',
    cancel: 'Annuleren',
    close: 'Sluiten',
    edit: 'Bewerken',
    remove: 'Verwijderen',
    add: 'Toevoegen',
    next: 'Volgende',
    back: 'Terug',
    signIn: 'Inloggen',
    signOut: 'Uitloggen',
    loading: 'Laden',
    readOnly: 'Alleen lezen',
    all: 'Alle',
    none: 'Geen',
    saved: 'Wijzigingen opgeslagen.',
    checkForm: 'Controleer het formulier en probeer het opnieuw',
    somethingWentWrong: 'Er ging iets mis',
  },

  auth: {
    portalTitle: 'Feedbackportaal',
    signInTitle: 'Inloggen',
    emailLabel: 'E-mailadres',
    emailPlaceholder: 'jij@restaurant.nl',
    sendLink: 'Stuur inloglink',
    sending: 'Bezig met versturen',
    checkEmailTitle: 'Controleer je e-mail',
    checkEmailBody:
      'Als er een account bestaat voor {email}, is er een inloglink onderweg. De link verloopt snel om veiligheidsredenen.',
    inviteOnly:
      'Portaalaccounts worden op uitnodiging aangemaakt. Vraag je organisatiebeheerder als je er nog geen hebt.',
    errorTitle: 'Inloggen is niet gelukt',
    errorMissingCode: 'Deze link is onvolledig. Vraag een nieuwe inloglink aan.',
    errorInvalidCode: 'Deze link is verlopen of al gebruikt. Vraag een nieuwe aan.',
    errorGeneric: 'Er ging iets mis tijdens het inloggen.',
    passwordLabel: 'Wachtwoord',
    signInWithPassword: 'Inloggen',
    orMagicLink: 'Liever geen wachtwoord?',
    sendLinkInstead: 'Mail mij een inloglink',
    credentialsError: 'Dit e-mailadres en wachtwoord horen niet bij een account',
    backToSignIn: 'Terug naar inloggen',
  },

  nav: {
    overview: 'Overzicht',
    locations: 'Vestigingen',
    feedback: 'Feedback',
    campaigns: 'Campagnes',
    reviewReadiness: 'Google-uitnodiging',
    qrCodes: 'QR-codes',
    analyses: 'AI-analyse',
    users: 'Gebruikers',
    settings: 'Instellingen',
    platform: 'Platform',
    sectionMain: 'Overzicht',
    sectionManage: 'Beheer',
    sectionAccount: 'Account',
  },

  roles: {
    platformAdmin: 'Platformbeheerder',
    platformSupport: 'Platformondersteuning',
    orgAdmin: 'Organisatiebeheerder',
    locationManager: 'Vestigingsbeheerder',
    viewer: 'Meekijker',
  },

  status: {
    active: 'Actief',
    inactive: 'Inactief',
    archived: 'Gearchiveerd',
    invited: 'Uitgenodigd',
    suspended: 'Geblokkeerd',
  },

  overview: {
    title: 'Overzicht',
    subtitle: 'Feedback over al je vestigingen.',
    statLocations: 'Vestigingen',
    statActiveLocations: 'Actieve vestigingen',
    statMembers: 'Teamleden',
    locationsTitle: 'Vestigingen',
    manage: 'Beheren',
    noOrganization: 'Geen organisatie geselecteerd',
    noOrganizationBody: 'Platformmedewerkers openen een organisatie via het platformgedeelte.',
    notLinked:
      'Je account is nog niet gekoppeld aan een organisatie. Vraag je beheerder de uitnodiging af te ronden.',
    metricsPending:
      'Aantallen reacties en scores verschijnen hier zodra de gastenflow live is.',
  },

  locations: {
    title: 'Vestigingen',
    subtitle:
      'Elke vestiging verzamelt zelfstandig feedback, met eigen campagnes, QR-codes en instellingen voor de Google-uitnodiging.',
    allLocations: 'Alle vestigingen',
    empty: 'Nog geen vestigingen',
    emptyBody: 'Voeg je eerste vestiging toe om feedback te verzamelen.',
    addTitle: 'Vestiging toevoegen',
    settingsTitle: 'Vestigingsinstellingen',
    name: 'Naam',
    slug: 'Slug',
    slugHelp: 'Wordt intern en in exports gebruikt. Staat niet in een openbare URL.',
    timezone: 'Tijdzone',
    street: 'Straat',
    city: 'Plaats',
    externalReference: 'Externe referentie',
    googleReviewUrl: 'Google-reviewlink',
    googleReviewUrlHelp:
      'Wordt nu opgeslagen en pas gebruikt zodra de Google-uitnodiging actief is voor deze vestiging.',
    addAction: 'Vestiging toevoegen',
    adding: 'Bezig met toevoegen',
    feedbackTitle: 'Feedback',
    feedbackPending:
      'Aantal reacties, scoretrend en categorieën verschijnen hier zodra de gastenflow live is.',
    notFound: 'Vestiging niet gevonden',
  },

  readiness: {
    title: 'Google-uitnodiging',
    collectingTitle: 'Private feedback verzamelen',
    collectingBody:
      'Deze vestiging verzamelt alleen private feedback. Gasten zien geen Google-uitnodiging.',
    equalTreatment:
      'Als dit actief is, ziet iedere respondent de Google-uitnodiging, ongeacht de eigen score.',
  },

  users: {
    title: 'Gebruikers',
    subtitle:
      'Organisatiebeheerders zien alle vestigingen. Vestigingsbeheerders en meekijkers zien alleen de vestigingen die aan hen zijn toegewezen.',
    teamTitle: 'Team',
    empty: 'Nog geen teamleden',
    inviteTitle: 'Iemand uitnodigen',
    inviteAction: 'Uitnodiging versturen',
    inviteSent: 'Uitnodiging verstuurd.',
    role: 'Rol',
    memberStatus: 'Status',
    locationAccess: 'Toegang tot vestigingen',
    allLocations: 'Alle vestigingen',
    noLocations: 'Geen vestigingen toegewezen',
    addLocationFirst: 'Voeg eerst een vestiging toe.',
    orgAdminAllLocations: 'Organisatiebeheerders krijgen automatisch toegang tot alle vestigingen.',
    invitedUser: 'Uitgenodigde gebruiker',
    you: 'jij',
    saveAccess: 'Toegang opslaan',
    removeFromOrg: 'Uit organisatie verwijderen',
    readOnlyNotice: 'Alleen organisatiebeheerders kunnen teamleden uitnodigen of wijzigen.',
    roleViewer: 'Meekijker — alleen lezen',
    roleLocationManager: 'Vestigingsbeheerder',
    roleOrgAdmin: 'Organisatiebeheerder',
  },

  errors: {
    slugTaken: 'Deze slug is al in gebruik door een andere vestiging',
    alreadyMember: 'Deze persoon is al lid van deze organisatie',
    lastAdmin: 'Een organisatie moet minstens één actieve beheerder houden',
    noPermissionLocation: 'Je hebt geen rechten om deze vestiging te bewerken',
    createLocation: 'De vestiging kon niet worden aangemaakt',
    saveLocation: 'De vestiging kon niet worden opgeslagen',
    invite: 'Deze persoon kon niet worden uitgenodigd',
    updateMembership: 'Dit lidmaatschap kon niet worden bijgewerkt',
    removeMembership: 'Dit lidmaatschap kon niet worden verwijderd',
    locationAccess: 'De toegang tot vestigingen kon niet worden bijgewerkt',
    saveProfile: 'Je profiel kon niet worden opgeslagen',
    invalidRequest: 'Ongeldig verzoek',
  },

  platform: {
    title: 'Platform',
    subtitle: 'Alle organisaties op het platform. Open er een om erin te werken.',
    organizations: 'Organisaties',
    empty: 'Nog geen organisaties',
    open: 'Openen',
    current: 'Nu geopend',
    locations: 'vestigingen',
    members: 'teamleden',
    contextBanner: 'Je bekijkt {organization} als platformmedewerker. Je bent geen lid van deze organisatie.',
    contextExit: 'Deelnemer sluiten',
    readOnlyHint: 'Platformondersteuning heeft alleen leesrechten.',
    adminLink: 'Platform',
    pickOrganization: 'Kies een organisatie om te beginnen.',
  },

  marketing: {
    // Hero
    heroEyebrow: 'Feedback voor lokale bedrijven',
    heroNoCode: 'Geen code? Scan de QR-code van het bedrijf.',

    mockLocationName: 'Restaurant De Haven',
    mockLocationMeta: 'Leiden \u00b7 Bezorging',
    mockRatingQuestion: 'Hoe beoordeel je jouw ervaring?',
    mockScaleLow: '1 Zeer slecht',
    mockScaleHigh: '5 Uitstekend',
    mockFollowUpQuestion: 'Waar kunnen we verbeteren?',
    mockTopic1: 'Bezorgtijd',
    mockTopic2: 'Temperatuur',
    mockTopic3: 'Smaak',
    mockTopic4: 'Verpakking',
    mockNext: 'Volgende',

    navHowItWorks: 'Hoe het werkt',
    navImprovements: 'Verbeteringen',

    heroTitle: 'Geef feedback. Help jouw lokale bedrijf verbeteren.',
    heroBody:
      'Deel in een paar korte stappen hoe je bezoek, bestelling of bezorging is verlopen. Jouw ervaring laat een bedrijf zien wat goed gaat en wat beter kan.',
    heroCta: 'Bekijk hoe het werkt',
    forBusinesses: 'Voor bedrijven',
    signInLink: 'Inloggen',

    codeLabel: 'Heb je een feedbackcode?',
    codePlaceholder: 'Bijvoorbeeld: HAVEN24',
    codeSubmit: 'Doorgaan',
    codeHelp:
      'Je vindt de QR-code of feedbackcode op de verpakking, kassabon, tafelkaart of flyer van het bedrijf.',
    codeError: 'Deze code is niet geldig of niet meer actief',

    stepsTitle: 'Zo helpt jouw feedback',
    step1Title: 'Deel je ervaring',
    step1Body: 'Een paar korte vragen over wat je bestelde of waar je was.',
    step2Title: 'Feedback wordt inzicht',
    step2Body: 'Antwoorden van alle gasten worden samengevoegd tot thema\u2019s, niet losse meningen.',
    step3Title: 'Het bedrijf verbetert',
    step3Body: 'De vestiging ziet wat terugkeert en bepaalt wat er als eerste verandert.',
    step4Title: 'Resultaat wordt zichtbaar',
    step4Body: 'Verbeteringen worden gepubliceerd, zodat je ziet wat jouw feedback veranderde.',

    changeEyebrow: 'Wat er verandert',
    changeTitle: 'Dit verandert er dankzij klantfeedback',
    changeExample: 'Voorbeeld \u00b7 demonstratiedata',
    changeCaseTitle: 'Bezorgrestaurant, 84 reacties',
    changeCaseHeard: 'Wat klanten aangaven',
    changeCaseHeardBody:
      'Warme gerechten koelden tijdens de bezorging soms te veel af, vooral op langere routes.',
    changeCaseDid: 'Wat de vestiging deed',
    changeCaseDidBody:
      'Sinds 14 juli gebruikt deze vestiging isolerende verpakkingen en gaan de warmste gerechten als laatste mee.',
    changeMetric1: 'Score voor temperatuur',
    changeMetric1Note: 'Gemeten over 84 reacties, 90 dagen voor en na 14 juli',
    changeMetric2: 'Bestellingen op tijd',
    changeMetric2Note: 'Gemeten over 84 reacties, 90 dagen voor en na 14 juli',
    changeMetric3: 'Reacties met een klacht over verpakking',
    changeMetric3Note: 'Gemeten over 84 reacties, 90 dagen voor en na 14 juli',

    listeningTitle: 'Lokale bedrijven die luisteren',
    listeningBody:
      'Waar klanten om vroegen, en wat er daardoor veranderde. Geen scores, geen ranglijst.',
    listeningEmpty: 'Nog geen gepubliceerde verbeteringen',
    listeningEmptyBody:
      'Bedrijven publiceren hier hun verbeteringen zodra ze genoeg feedback hebben verzameld.',

    whyTitle: 'Waarom jouw mening verschil maakt',
    privateTitle: 'Standaard priv\u00e9',
    privateBody:
      'Je feedback gaat naar het bedrijf, niet naar het internet. Je antwoordt eerlijk omdat het een gesprek is, geen optreden.',
    adaptiveTitle: 'Vragen die meebewegen',
    adaptiveBody:
      'Wie een goede ervaring had, krijgt geen kruisverhoor. Bij een lagere score volgen korte, gerichte vragen.',
    reviewsTitle: 'Reviews, eerst verdiend',
    reviewsBody:
      'Een bedrijf vraagt pas om Google-reviews als de eigen resultaten goed genoeg zijn. Daarna krijgt iedere gast dezelfde uitnodiging.',

    privacyTitle: 'Wat gebeurt er met jouw feedback?',
    privacyBody:
      'Je antwoorden gaan naar het bedrijf waar je was. We voegen reacties samen tot thema\u2019s, zodat losse antwoorden niet naar jou te herleiden zijn.',
    privacyLinkPrivacy: 'Privacyverklaring',
    privacyLinkData: 'Hoe wij gegevens gebruiken',
    privacyLinkContact: 'Contact',
    transparencyTitle: 'Over deze pagina\u2019s',
    transparency1: 'De cijfers komen uit feedback die via GeefSterren is verzameld.',
    transparency2:
      'Reacties worden geaggregeerd; losse antwoorden worden nooit openbaar getoond.',
    transparency3: 'De vestiging bepaalt zelf welke verbeteringen zij publiceert.',
    transparency4:
      'GeefSterren controleert bedrijven niet zelfstandig en verifieert niet elke verbetering.',
    faqTitle: 'Vragen die gasten stellen',
    faq1Q: 'Wordt mijn feedback openbaar?',
    faq1A:
      'Nee. Je antwoorden gaan naar het bedrijf. Alleen samengevoegde thema\u2019s en verbeteringen komen op een openbare pagina, nooit jouw losse reactie.',
    faq2Q: 'Moet ik mijn e-mailadres achterlaten?',
    faq2A:
      'Nee. We vragen alleen om een e-mailadres als je een beloning wilt of updates wilt ontvangen. Je mag dat altijd overslaan.',
    faq3Q: 'Kost een lage score mij iets?',
    faq3A:
      'Nee. Een beloning hangt aan het invullen van de vragenlijst, nooit aan je score en nooit aan het plaatsen van een openbare review.',
    faq4Q: 'Ben ik verplicht een Google-review te plaatsen?',
    faq4A:
      'Nee. Als een bedrijf het vraagt, vraagt het dat aan iedere gast op dezelfde manier, en je kunt afronden zonder het te doen.',
    faq5Q: 'Hoe lang duurt het?',
    faq5A: 'Ongeveer een minuut. Vijf korte vragen, en het opmerkingenveld is optioneel.',

    businessTitle: 'Wil je weten wat klanten echt ervaren?',
    businessBody:
      'Gestructureerde feedback per vestiging, thema\u2019s in plaats van losse reviews, en een helder moment om openbare reviews te gaan verzamelen.',
  },
};
