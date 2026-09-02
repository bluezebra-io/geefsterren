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
    questionnaires: 'Vragenlijsten',
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
    criterionMet: 'criterium behaald',
    criterionUnmet: 'criterium nog niet behaald',
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
    temporary: 'Er ging iets mis aan onze kant. Probeer het over een moment opnieuw.',
    checkForm: 'Controleer het formulier en probeer het opnieuw',
    campaignCreate: 'De campagne kon niet worden aangemaakt',
    campaignStatus: 'De campagne kon niet worden gewijzigd',
    campaignQuestionnaireNotPublished: 'Kies een gepubliceerde vragenlijst',
    questionnaireCreate: 'De vragenlijst kon niet worden aangemaakt',
    questionAdd: 'De vraag kon niet worden toegevoegd',
    questionRemove: 'De vraag kon niet worden verwijderd',
    questionnairePublish: 'Deze versie kon niet worden gepubliceerd',
    questionnaireAssign: 'De toewijzing kon niet worden gewijzigd',
    questionnaireDraft: 'Er kon geen nieuw concept worden aangemaakt',
    qrCreate: 'De QR-code kon niet worden aangemaakt',
    qrRotate: 'De QR-code kon niet opnieuw worden uitgegeven',
    notFound: 'Dit item bestaat niet meer',
    noPermission: 'Je hebt hiervoor geen rechten',
    invalidRequest: 'Ongeldig verzoek',
  },

  results: {
    title: 'Resultaten per vraag',
    subtitle: 'Wat gasten hebben geantwoord, per vraag, over de gekozen periode.',
    basedOn: 'Op basis van {answered} van {total} reacties',
    noAnswers: 'Deze vraag is nog niet beantwoord',
    averageOfFive: 'gemiddeld van 5',
    writtenAnswers: '{count} geschreven antwoorden',
    distributionTitle: 'Scoreverdeling',
    emptyTitle: 'Nog geen resultaten',
    emptyBody: 'Resultaten verschijnen zodra gasten de vragenlijst gaan invullen.',
    statResponses: 'Reacties',
    statAverage: 'Gemiddelde score',
    statLowScores: 'Lage scores',
    statCompletion: 'Voltooiing',
    recentComments: 'Recente opmerkingen',
    noComments: 'Nog geen opmerkingen',
    questionnaire: 'Vragenlijst',
    questionnaireNone: 'Geen vragenlijst toegewezen',
    orgWide: 'Toegewezen aan alle vestigingen',
    locationOnly: 'Toegewezen aan deze vestiging',
  },

  qr: {
    title: 'QR-codes',
    subtitle: 'Print een QR-code zodat gasten feedback kunnen geven. Eén code per plek waar je hem neerlegt.',
    listTitle: 'Bestaande codes',
    empty: 'Nog geen QR-codes',
    emptyBody: 'Maak er hieronder een aan en download hem als SVG voor drukwerk of PNG voor beeldschermen.',
    createTitle: 'QR-code aanmaken',
    campaign: 'Campagne',
    sourceChannel: 'Waar komt hij te liggen?',
    label: 'Intern label',
    labelHelp: 'Voor je eigen administratie, bijvoorbeeld \u201cBezorgdoos Leiden\u201d.',
    create: 'QR-code aanmaken',
    creating: 'Bezig met aanmaken',
    downloadSvg: 'SVG',
    downloadPng: 'PNG',
    reissue: 'Opnieuw uitgeven',
    reissueHint: 'Deze code is van v\u00f3\u00f3r de versleutelde opslag. Geef hem opnieuw uit om te downloaden \u2014 de oude code werkt dan niet meer.',
    createdTitle: 'QR-code aangemaakt',
    createdBody: 'Bewaar dit nu. De code wordt versleuteld opgeslagen en de leesbare waarde wordt niet opnieuw getoond.',
    tokenLabel: 'Reviewlink',
    codeLabel: 'Feedbackcode',
    scans: 'scans',
    started: 'gestart',
    completed: 'voltooid',
    noCampaign: 'Maak eerst een campagne aan voor deze vestiging.',
    channelPackaging: 'Verpakking',
    channelFlyer: 'Flyer',
    channelReceipt: 'Kassabon',
    channelCounter: 'Balie',
    channelTable: 'Tafelkaart',
    channelEmail: 'E-mail',
    channelOther: 'Anders',
  },

  guest: {
    intro: 'Jouw feedback helpt {location} om te verbeteren.',
    chips1: 'ongeveer een minuut',
    chips2: 'een paar korte vragen',
    chips3: 'anoniem te versturen',
    ratingQuestion: 'Hoe beoordeel je jouw ervaring?',
    ratingRequired: 'Kies een score om verder te gaan',
    veryPoor: 'Zeer slecht',
    poor: 'Onvoldoende',
    fair: 'Redelijk',
    good: 'Goed',
    excellent: 'Uitstekend',
    optionLabel: '{score} van {total} sterren, {label}',
    scaleLow: '1 Zeer slecht',
    scaleHigh: '5 Uitstekend',
    commentPlaceholder: 'Bijvoorbeeld: de bezorging was snel, maar de soep was afgekoeld.',
    optional: 'optioneel',
    send: 'Verstuur feedback',
    sending: 'Bezig met versturen',
    thanksTitle: 'Bedankt voor je feedback',
    thanksBody: 'Je antwoorden gaan naar {location}. Ze worden samengevoegd met die van andere gasten, dus er is niets naar jou te herleiden.',
    thanksScore: 'Jouw score',
    close: 'Sluiten',
    notFoundTitle: 'Deze code is niet actief',
    notFoundBody: 'De QR-code of link is niet meer geldig. Vraag bij het bedrijf om een actuele code.',
    failedTitle: 'Versturen is niet gelukt',
    failedBody: 'Er ging iets mis aan onze kant. Probeer het over een moment opnieuw.',
    charactersLeft: 'nog {count} tekens',
  },

  questionnaires: {
    title: 'Vragenlijsten',
    subtitle: 'De vragen die gasten krijgen. Wijs er een toe aan alle vestigingen, of aan een selectie.',
    platformTemplate: 'Platformsjabloon',
    yours: 'Eigen vragenlijst',
    versions: 'Versies',
    version: 'Versie {number}',
    statusDraft: 'Concept',
    statusPublished: 'Gepubliceerd',
    statusArchived: 'Gearchiveerd',
    questionCount: '{count} vragen',
    assignedAll: 'Alle vestigingen',
    assignedSelected: '{count} vestigingen',
    assignedNone: 'Niet toegewezen',
    open: 'Openen',
    newDraft: 'Nieuw concept',
    createTitle: 'Nieuwe vragenlijst',
    name: 'Naam',
    description: 'Omschrijving',
    create: 'Aanmaken',
    creating: 'Bezig met aanmaken',
    empty: 'Nog geen vragenlijsten',
    emptyBody: 'Begin met het platformsjabloon, of maak je eigen lijst.',

    editTitle: 'Vragen',
    publishedNotice: 'Deze versie is gepubliceerd en kan niet meer wijzigen. Maak een nieuw concept om de vragen aan te passen.',
    platformNotice: 'Dit is een platformsjabloon. Maak een nieuw concept om er je eigen versie van te maken.',
    addQuestion: 'Vraag toevoegen',
    questionKey: 'Sleutel',
    questionKeyHelp: 'Wordt gebruikt in exports en voorwaarden. Na publiceren niet meer te wijzigen.',
    label: 'Vraag',
    helpText: 'Hulptekst',
    category: 'Categorie',
    questionType: 'Type',
    required: 'Verplicht',
    onlyBelowFive: 'Alleen stellen bij een score onder vijf',
    onlyBelowFiveHelp: 'Wie vijf sterren geeft, krijgt geen diagnostische vragen.',
    options: 'Antwoordopties',
    optionsHelp: 'E\u00e9n per regel. Alleen bij een keuzevraag.',
    add: 'Toevoegen',
    adding: 'Bezig met toevoegen',
    remove: 'Verwijderen',
    noQuestions: 'Nog geen vragen',
    noQuestionsBody: 'Voeg hieronder de eerste vraag toe.',
    publish: 'Publiceren',
    publishHint: 'Na publiceren staan de vragen vast, zodat oude antwoorden hun betekenis houden.',
    typeRating: 'Beoordeling 1 tot 5',
    typeSingle: 'E\u00e9n antwoord',
    typeMultiple: 'Meerdere antwoorden',
    typeBoolean: 'Ja of nee',
    typeShortText: 'Korte tekst',
    typeLongText: 'Lange tekst',

    assignTitle: 'Waar wordt dit gevraagd?',
    scopeAll: 'Alle vestigingen',
    scopeSelected: 'Alleen deze vestigingen',
    scopeNone: 'Voorlopig nergens',
    scopeAllHint: 'Een vestiging die je later toevoegt, erft dit automatisch.',
    saveAssignment: 'Opslaan',
    assignPublishFirst: 'Publiceer deze versie voordat je hem toewijst.',
  },

  campaigns: {
    title: 'Campagnes',
    subtitle: 'Een campagne is waar een QR-code naar wijst. Die bepaalt de vragenlijst en of er feedback wordt verzameld.',
    listTitle: 'Campagnes',
    empty: 'Nog geen campagnes',
    emptyBody: 'Maak er hieronder een aan en print daarna een QR-code.',
    createTitle: 'Nieuwe campagne',
    name: 'Naam',
    namePlaceholder: 'Bijvoorbeeld: Bezorging, of Zomerterras',
    questionnaire: 'Vragenlijst',
    assignedHint: 'Toegewezen aan deze vestiging',
    activateNow: 'Direct beginnen met verzamelen',
    create: 'Campagne aanmaken',
    creating: 'Bezig met aanmaken',
    statusDraft: 'Concept',
    statusActive: 'Actief',
    statusPaused: 'Gepauzeerd',
    statusCompleted: 'Afgerond',
    statusArchived: 'Gearchiveerd',
    activate: 'Activeren',
    pause: 'Pauzeren',
    complete: 'Afronden',
    qrCodes: '{count} QR-codes',
    responses: '{count} reacties',
    pausedHint: 'Een gepauzeerde campagne stopt nieuwe feedback. De QR-codes blijven gedrukt en werken weer zodra je activeert.',
    noQuestionnaire: 'Publiceer eerst een vragenlijst en maak daarna een campagne.',
    manageQr: 'QR-codes',
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
  chrome: {
    navForBusinesses: 'Voor bedrijven',
    ctaDemo: 'Plan een demo',

    footerTagline:
      'Feedbackplatform voor lokale bedrijven. Jouw ervaring helpt ze verbeteren.',
    footerGuests: 'Voor gasten',
    footerGuestsHowItWorks: 'Hoe het werkt',
    footerGuestsImprovements: 'Verbeteringen',
    footerGuestsCode: 'Feedbackcode invoeren',
    footerBusiness: 'Voor bedrijven',
    footerBusinessProduct: 'GeefSterren voor bedrijven',
    footerBusinessDemo: 'Plan een demo',
    footerBusinessSignIn: 'Inloggen',
    footerLegal: 'Juridisch',
    footerLegalPrivacy: 'Privacyverklaring',
    footerLegalData: 'Hoe gegevens worden gebruikt',
    footerLegalTerms: 'Voorwaarden',
    footerContact: 'Contact',
    footerContactForm: 'Contactformulier',
    footerContactEmail: 'support@geefsterren.nl',
    footerCopyright: '\u00a9 2026 GeefSterren B.V. \u00b7 geefsterren.nl',
    footerRegistration: 'KvK 00000000 \u00b7 Rotterdam',
  },

  howItWorks: {
    metaTitle: 'Hoe het werkt \u2014 GeefSterren',
    metaDescription:
      'In ongeveer een minuut feedback geven, zonder account en zonder app. Anoniem, tenzij je zelf anders kiest.',

    heroEyebrow: 'Voor gasten',
    heroTitle: 'In \u00e9\u00e9n minuut feedback die echt ergens heen gaat.',
    heroBody: 'Geen account, geen app. Anoniem \u2014 tenzij jij anders kiest.',
    heroCodeFound: 'Code gevonden \u2014 je gaat naar Restaurant De Haven.',
    heroCaption:
      'Geen code? Scan de QR-code op de verpakking, de bon of de tafelkaart.',

    stepsEyebrow: 'Zo werkt het',
    stepsTitle: 'Vier stappen, ongeveer een minuut',
    stepsBody: 'Van de QR-code op tafel tot het bericht dat er iets veranderd is.',
    step1Title: 'Scan de QR-code of voer je code in',
    step1Body:
      'Geen account, geen app. Je vindt de code op de verpakking, de bon of de tafelkaart. Ongeveer 10 seconden.',
    step2Title: 'Beantwoord een paar korte vragen',
    step2Body:
      'Een score, een paar onderwerpen en ruimte voor een toelichting als je die wilt geven. Ongeveer \u00e9\u00e9n minuut.',
    step3Title: 'Het bedrijf leest mee en gaat aan de slag',
    step3Body:
      'Je feedback komt binnen als thema\u2019s en trends, samen met andere reacties \u2014 niet als een lijst met afzenders.',
    step4Title: 'Volg wat er verandert',
    step4Body:
      'Optioneel. Meld je aan met je e-mailadres en je hoort het als de vestiging iets doorvoert. Dubbele opt-in, afmelden met \u00e9\u00e9n klik.',

    chainTitle: 'Wat gebeurt er met jouw feedback?',
    chainBody: 'De hele keten, zonder tussenstops die je niet ziet.',
    chain1Title: 'Rechtstreeks naar het bedrijf',
    chain1Body:
      'Jouw antwoorden gaan naar de vestiging waarvoor je de vragenlijst invult. Niet naar een openbaar profiel.',
    chain2Title: 'Samengevoegd tot thema\u2019s',
    chain2Body:
      'Het bedrijf ziet thema\u2019s en trends over alle reacties heen, niet een lijst met losse afzenders.',
    chain3Title: 'Vanaf 20 reacties openbaar',
    chain3Body:
      'Pas vanaf 20 reacties in een periode kan een vestiging geaggregeerde resultaten publiceren op de eigen verbeterpagina.',
    chainAlertTitle: 'GeefSterren is geen reviewsite',
    chainAlertBody:
      'Jouw tekst verschijnt nooit zomaar openbaar. Op openbare pagina\u2019s staan alleen samengevoegde cijfers en thema\u2019s.',

    anonymousTitle: 'Ben ik anoniem?',
    anonymousBody:
      'Het eerlijke antwoord in drie regels. Dit is precies hoe het werkt, niet mooier gemaakt.',
    anonymous1: 'Standaard ziet het bedrijf niet wie je bent.',
    anonymous2: 'Vul je zelf je naam in, dan ziet het bedrijf die.',
    anonymous3:
      'Alleen als je kans wilt maken op een beloning of updates wilt ontvangen, vragen we je e-mailadres. Dat gebruiken we uitsluitend daarvoor: nooit verkocht, geen spam.',
    anonymousLinkPrivacy: 'Privacyverklaring',
    anonymousLinkData: 'Hoe gegevens worden gebruikt',

    rewardsTitle: 'Over beloningen',
    rewardsBody:
      'Sommige bedrijven verbinden een beloning aan een feedbackcampagne. Het bedrijf bepaalt per campagne wat die beloning is.',
    rewardsEmphasis:
      'De beloning is voor het geven van feedback \u2014 niet voor een positieve score. Kritische feedback maakt evenveel kans.',
    rewardsTerms: 'De voorwaarden staan per campagne in de feedbackflow zelf.',
    rewardsNeverTitle: 'Wat een beloning nooit is',
    rewardsNever1: 'Een vergoeding voor een hoge score.',
    rewardsNever2: 'Een voorwaarde om de vragenlijst af te ronden.',
    rewardsNever3:
      'Iets waar je je e-mailadres voor moet achterlaten als je dat niet wilt.',

    whyTitle: 'Waarom zou je?',
    why1Title: 'Je punt wordt een verbeterpunt',
    why1Body:
      'Een opmerking die anders verdwijnt, komt hier terecht bij de mensen die er iets aan kunnen doen.',
    why2Title: 'Je ziet terug wat er veranderd is',
    why2Body:
      'Meld je aan en je krijgt bericht zodra de vestiging een verbetering doorvoert of het resultaat ervan meet.',
    why3Title: 'Je lokale zaak wordt beter',
    why3Body:
      'Waar je vaak komt, merk je het verschil het eerst: kortere wachttijd, warmere bezorging, een duidelijkere kaart.',
    whyCaseTitle: 'Restaurant De Haven, Leiden',
    whyCaseBody:
      'Gasten meldden dat bestellingen op drukke avonden te laat en te koud aankwamen. De vestiging paste de verpakking en de weekendbezetting aan.',
    whyCaseMetric1: 'Bestellingen op tijd',
    whyCaseMetric1Note: '84 reacties \u00b7 90 dagen voor en na 1 juli',
    whyCaseMetric2: 'Score temperatuur',
    whyCaseMetric2Note: '42 reacties na 14 juli \u00b7 schaal 1 tot 5',
    whyCaseFootnote:
      'Na de aanpassingen verbeterden deze scores. GeefSterren toont de volgorde van gebeurtenissen, geen bewezen oorzaak.',

    faqTitle: 'Veelgestelde vragen',
    faq1Q: 'Kan het bedrijf zien wie ik ben?',
    faq1A:
      'Nee, tenzij je zelf je naam invult. Standaard is je reactie anoniem voor het bedrijf. Alleen als je kans wilt maken op een beloning of updates wilt ontvangen vragen we je e-mailadres, en dat gebruiken we uitsluitend daarvoor.',
    faq2Q: 'Moet ik een account aanmaken?',
    faq2A:
      'Nee. De QR-code scannen of je feedbackcode invoeren is genoeg. Er is geen app en geen inlog.',
    faq3Q: 'Ik heb kritiek \u2014 krijgt iemand daar problemen mee?',
    faq3A:
      'Feedback komt geaggregeerd binnen: het bedrijf ziet thema\u2019s en trends, geen losse afzenders. Kritiek is precies waar het systeem voor bestaat; zonder die reacties weet een vestiging niet waar ze staat.',
    faq4Q: 'Waarom vraagt het bedrijf me soms daarna om een Google-review?',
    faq4A:
      'Alleen als het bedrijf aantoonbaar verbeterd heeft en de ingestelde kwaliteitscriteria zijn behaald. Iedere respondent krijgt dan dezelfde uitnodiging, ongeacht de score die je gaf. Die vraag staat volledig los van elke beloning.',
    faq5Q: 'Hoe meld ik me af van updates?',
    faq5A:
      'Elke mail heeft een afmeldlink. Afmelden gaat per direct en je hoeft geen reden op te geven.',

    ctaTitle: 'Hoe was je ervaring?',
    ctaBody:
      'Scan de QR-code van het bedrijf of voer je feedbackcode in. Het duurt ongeveer een minuut.',
    ctaLink: 'Bekijk wat er verandert dankzij klantfeedback',
  },
  improvements: {
    metaTitle: 'Verbeteringen \u2014 GeefSterren',
    metaDescription:
      'Vestigingen die openbaar laten zien wat ze met klantfeedback deden. Geen ranglijst en geen reviewsite.',

    heroEyebrow: 'Verbeteringen',
    heroTitle: 'Vestigingen die laten zien wat ze met feedback deden',
    heroBody:
      'Dit is een overzicht van vestigingen die openbaar laten zien wat ze met klantfeedback deden. Het is geen ranglijst en geen reviewsite \u2014 er is bewust geen sortering op score.',

    searchLabel: 'Zoek op plaats of naam',
    categoryAll: 'Alle',
    categoryDelivery: 'Bezorg',
    categoryRestaurant: 'Restaurant',
    categoryRetail: 'Retail',
    sortLabel: 'Sortering',
    statusProgress: 'In uitvoering',
    statusDone: 'Doorgevoerd',
    statusMeasured: 'Gemeten resultaat',
    sortRecent: 'Laatst bijgewerkt',
    sortName: 'Naam A\u2013Z',
    sortNote:
      'Gesorteerd op laatst bijgewerkt \u2014 dat beloont actieve bedrijven en is geen kwaliteitsoordeel.',
    resultCount: 'vestigingen',

    emptyTitle: 'We zijn net begonnen',
    emptyBody:
      'Deze bedrijven doen al mee \u2014 de eerste resultaten verschijnen zodra een vestiging 20 reacties heeft.',

    aboutTitle: 'Over deze pagina',
    about1:
      'De cijfers komen uit feedback die via GeefSterren bij deze vestigingen is verzameld.',
    about2:
      'Reacties worden samengevoegd. Losse antwoorden en persoonsgegevens worden niet openbaar getoond.',
    about3:
      'Elke vestiging kiest zelf welke doorgevoerde verbeteringen hier worden gepubliceerd.',
    about4:
      'GeefSterren controleert niet zelfstandig of een gepubliceerde verbetering is uitgevoerd.',
    about5: 'Een cijfer verschijnt pas bij minimaal 20 reacties in de gekozen periode.',

    noRankingTitle: 'Geen ranglijst',
    noRankingBody:
      'Vestigingen staan hier op volgorde van laatste update. Er is geen sortering op score en geen sterrengemiddelde op de kaarten.',
    ownFeedbackTitle: 'Zelf feedback geven?',
    ownFeedbackBody:
      'Dat kan alleen via de QR-code of feedbackcode van een vestiging. Zo weten we zeker dat de reactie bij een echt bezoek of een echte bestelling hoort.',
    ownFeedbackLink: 'Bekijk hoe het werkt',
  },

  forBusinesses: {
    metaTitle: 'Voor bedrijven \u2014 GeefSterren',
    metaDescription:
      'Doorlopend en vergelijkbaar zicht op de klantbeleving per vestiging. Gesprekken op basis van cijfers in plaats van meningen.',

    heroEyebrow: 'Voor formules en multi-vestiging',
    heroTitle:
      'Je formule is zo sterk als je zwakste vestiging \u2014 en je ziet pas te laat welke dat is.',
    heroBody:
      'Doorlopend en vergelijkbaar zicht op de klantbeleving per vestiging. Gesprekken met franchisenemers op basis van cijfers in plaats van meningen.',
    heroCtaSecondary: 'Bekijk hoe het werkt',
    heroCaption: '30 minuten, je ziet het werkende product met demonstratiedata.',
    heroPanelATitle: 'Formuledashboard \u00b7 12 vestigingen',
    heroPanelAStatResponses: 'Reacties',
    heroPanelAStatResponsesNote: '30 dagen',
    heroPanelAStatScore: 'Score',
    heroPanelAStatScoreNote: 'formule-breed',
    heroPanelAStatReady: 'Review-gereed',
    heroPanelAStatReadyNote: 'vestigingen',
    heroPanelADistribution: 'Scoreverdeling',
    heroPanelADistributionNote: '1.248 reacties \u00b7 30 dagen',
    heroPanelBTitle: 'Vestiging Leiden \u00b7 openbare verbeterpagina',
    heroPanelBMetric: 'Bestellingen op tijd',
    heroPanelBMetricNote: '84 reacties \u00b7 90 dagen',

    problemTitle: 'Losse reviews vertellen niet het hele verhaal',
    problemBody:
      'Openbare reviews zijn waardevol. Ze zijn alleen zelden bruikbaar om een formule op te sturen.',
    problem1Title: 'Te weinig, te extreem',
    problem1Body:
      'Per vestiging komen er te weinig reviews binnen, en ze komen vooral van gasten met een uitgesproken ervaring.',
    problem2Title: 'Mystery shopping is duur',
    problem2Body:
      'E\u00e9n bezoek per kwartaal kost veel en zegt iets over dat ene moment, niet over de week erna.',
    problem3Title: 'Je hoort het te laat',
    problem3Body:
      'Een probleem bereikt het hoofdkantoor meestal pas als het al een openbare 1-ster review is.',
    problem4Title: '\u201cDat herken ik niet\u201d',
    problem4Body:
      'Zonder dezelfde vragen per vestiging stranden gesprekken met franchisenemers in beleving tegen beleving.',
    problem5Title: 'E\u00e9n vestiging, alle merken',
    problem5Body: 'E\u00e9n zwakke vestiging kost merkvertrouwen dat alle vestigingen betalen.',

    tableTitle: 'Scores per vestiging',
    tableBody:
      'Alle vestigingen krijgen dezelfde vragen, dus de vergelijking gaat over hetzelfde. Zes van de twaalf vestigingen, gesorteerd op gemiddelde score.',
    tableColLocation: 'Vestiging',
    tableColResponses: 'Reacties',
    tableColScore: 'Gem. score',
    tableColDelivery: 'Bezorgtijd',
    tableColTemperature: 'Temperatuur',
    tableColDelta: 'T.o.v. formule',
    tableColReady: 'Review-gereed',
    tableDistributionTitle: 'Scoreverdeling bezorgtijd',
    tableDistributionNote: '510 reacties \u00b7 30 dagen \u00b7 formule-breed',
    tableAlertTitle: 'Geen ranglijst voor de gast',
    tableAlertBody:
      'Deze vergelijking is voor het hoofdkantoor en de franchisenemer. Op openbare pagina\u2019s staat geen sortering op score.',
    tableFootnote:
      'Scores op een schaal van 1 tot 5, gemeten over de laatste 30 dagen. Een score verschijnt pas bij minimaal 20 reacties in de periode.',

    flowTitle: 'Van feedback naar zichtbaar resultaat',
    flowBody:
      'Zes stappen, hier ingevuld voor een bezorgformule met twaalf vestigingen. De zesde zet je pas aan als een vestiging er klaar voor is.',
    flow1Title: 'Verzamel feedback per vestiging',
    flow1Body:
      'QR-codes per vestiging en per kanaal: bezorgdoos, bon, tafel of flyer. Twaalf vestigingen, dezelfde vragenlijst.',
    flow2Title: 'Begrijp patronen',
    flow2Body:
      'Scores per onderwerp, thema\u2019s en trends, altijd met het aantal reacties en de periode erbij.',
    flow3Title: 'Vergelijk vestigingen',
    flow3Body:
      'Zie welke vestiging afwijkt op welk onderwerp, en of het probleem lokaal is of formule-breed.',
    flow4Title: 'Voer verbeteringen door en meet',
    flow4Body:
      'Leg vast wat een vestiging aanpast en vergelijk de periode ervoor en erna op dezelfde vragen.',
    flow5Title: 'Maak verbetering zichtbaar',
    flow5Body:
      'Publiceer geselecteerde verbeteringen op de openbare vestigingspagina en informeer aangemelde gasten.',
    flow6Title: 'Activeer reviewuitnodigingen',
    flow6Body:
      'Zodra een vestiging de kwaliteitscriteria haalt, krijgt iedere respondent van die vestiging dezelfde uitnodiging.',

    readinessTitle: 'Eerst verbeteren, daarna reviews vragen',
    readinessBody1:
      'Elke vestiging heeft een eigen review-gereedheid. Het hoofdkantoor ziet in \u00e9\u00e9n oogopslag welke vestigingen klaar zijn om actief reviews te verzamelen en welke eerst moeten verbeteren.',
    readinessBody2:
      'Zodra de ingestelde kwaliteitscriteria zijn behaald, kan de uitnodiging voor een publieke review worden geactiveerd. Vanaf dat moment krijgt iedere respondent dezelfde mogelijkheid.',
    readinessPill1: 'Feedback verzamelen',
    readinessPill2: 'Verbeterpunten aanpakken',
    readinessPill3: 'Kwaliteitscriteria behalen',
    readinessPill4: 'Uitnodiging activeren',
    readinessNote:
      'De uitnodiging geldt voor alle respondenten tegelijk. Een individuele score bepaalt nooit of iemand de uitnodiging ziet \u2014 GeefSterren filtert geen klanten.',
    readinessPanelTitle: 'Review-gereedheid \u00b7 Leiden',
    readinessCriterion1: 'Aantal reacties',
    readinessCriterion2: 'Gemiddelde score',
    readinessCriterion3: 'Aandeel lage scores',
    readinessCriterion4: 'Voltooiingsgraad',
    readinessWindow: 'laatste 60 dagen',
    readinessMode: 'Automatisch',
    statusPanelTitle: 'Status per vestiging',
    statusInvitationActive: 'Uitnodiging actief',
    statusCollecting: 'Feedback verzamelen',
    statusImproveFirst: 'Eerst verbeteren',

    featuresTitle: 'Wat een formule ermee doet',
    feature1Title: 'Vestigingsvergelijking',
    feature1Body:
      'Alle vestigingen beantwoorden dezelfde vragen, dus de vergelijking gaat over hetzelfde. Inclusief aantal reacties per vestiging.',
    feature2Title: 'Trends per vestiging en formule-breed',
    feature2Body:
      'Zie of een probleem lokaal is of overal speelt, en of het na een ingreep de andere kant op beweegt.',
    feature3Title: 'AI-samenvattingen met bronvermelding',
    feature3Body:
      'Elke samenvatting noemt waarop hij gebaseerd is, bijvoorbeeld \u201cgebaseerd op 48 reacties\u201d. Voorgestelde acties zijn advies, geen conclusie.',
    feature4Title: 'Feedbackcampagnes met optionele beloning',
    feature4Body:
      'Per campagne kies je of er een beloning is en wat die is. De beloning hangt aan het invullen van de vragenlijst, aan niets anders.',
    feature5Title: 'Openbare verbeterpagina per vestiging',
    feature5Body:
      'Een lokaal vertrouwenssignaal: de vestiging laat zien wat er is aangepast en wat daarna gemeten is.',
    feature6Title: 'Rapportage per franchisenemer',
    feature6Body:
      'Elke franchisenemer krijgt dezelfde rapportage over dezelfde vragen. Het cijfergesprek zonder discussie over de meting.',

    newEyebrow: 'Waar de klantcases horen te staan',
    newTitle: 'GeefSterren is nieuw',
    newBody1:
      'We hebben nog geen klantcases. Daarom laten we in de demo het volledige werkende product zien met demonstratiedata, en publiceren we resultaten pas als ze echt en geverifieerd zijn.',
    newBody2: 'Alle cijfers en voorbeelden op deze site zijn om die reden gelabeld.',
    newRowVerified: 'Geverifieerde klantcase',
    newRowVerifiedNote: 'Nog niet beschikbaar',
    newRowExampleNote: 'Wat je nu op deze site ziet',
    newRowDemoNote: 'In de demo: het werkende product, met demonstratiedata',

    pricingTitle: 'Prijzen',
    pricingBody:
      'Een staffel op het aantal vestigingen. Vanaf-prijzen per vestiging per maand, degressief naarmate je meer vestigingen aansluit.',
    pricingPending: 'Bedragen nog te bevestigen',
    pricingPer: 'per vestiging per maand',
    pricingOnRequest: 'Op aanvraag',
    pricingContact: 'Neem contact op',
    tier1Name: 'Starter',
    tier1Range: '1 tot en met 3 vestigingen',
    tier1Feature1: 'Feedbackflow met QR per vestiging',
    tier1Feature2: 'Portal met scores, thema\u2019s en trends',
    tier1Feature3: 'E\u00e9n campagne tegelijk',
    tier2Name: 'Grow',
    tier2Range: '4 tot en met 15 vestigingen',
    tier2Feature1: 'Alles uit Starter',
    tier2Feature2: 'Vestigingsvergelijking op dezelfde vragen',
    tier2Feature3: 'Openbare verbeterpagina\u2019s',
    tier2Feature4: 'Rapportage per franchisenemer',
    tier3Name: 'Enterprise',
    tier3Range: 'Meer dan 15 vestigingen',
    tier3Feature1: 'Alles uit Grow',
    tier3Feature2: 'SSO en API-koppelingen',
    tier3Feature3: 'Formule-brede onboarding',
    tier3Feature4: 'SLA',
    pricingFootnote:
      'De genoemde bedragen zijn voorbeelden voor dit ontwerp en worden vervangen zodra de tarieven vaststaan.',

    faqTitle: 'Veelgestelde vragen',
    faq1Q: 'Hoe lang duurt implementatie per vestiging?',
    faq1A:
      'Dagen, geen maanden. Je stelt de campagne centraal in en de vestiging plaatst het QR-materiaal. Meestal zijn de eerste reacties er binnen een week.',
    faq2Q: 'Wat moeten franchisenemers zelf doen?',
    faq2A:
      'Het QR-materiaal plaatsen op de afgesproken plek. De formule beheert de vragenlijsten, campagnes en instellingen centraal.',
    faq3Q: 'Van wie is de data?',
    faq3A:
      'Van de formule. Vestigingen zien hun eigen resultaten; het hoofdkantoor ziet alle vestigingen en de vergelijking.',
    faq4Q: 'Voldoet dit aan de AVG?',
    faq4A:
      'Feedback is standaard anoniem voor het bedrijf. Een e-mailadres wordt alleen gevraagd als de gast daar zelf voor kiest, met dubbele opt-in en afmelden met \u00e9\u00e9n klik.',
    faq5Q: 'Kunnen we klein beginnen met een paar vestigingen?',
    faq5A:
      'Ja. Veel formules starten met drie tot vijf vestigingen en breiden uit als de vragenlijst en de campagne staan. In de demo laten we zien hoe die opzet eruitziet.',

    ctaTitle: 'In 30 minuten zie je het product zoals jouw formule het zou gebruiken',
    ctaBody:
      'Een werkend prototype met demonstratiedata, ingericht op het aantal vestigingen dat jij beheert.',
  },
};
