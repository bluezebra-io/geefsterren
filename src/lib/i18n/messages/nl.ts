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

  marketing: {
    heroTitle: 'Geef feedback. Help jouw lokale bedrijf verbeteren.',
    heroBody:
      'Scan de code die je kreeg, beantwoord een paar korte vragen, en het bedrijf weet wat er beter kan. Het kost ongeveer een minuut.',
    heroCta: 'Bekijk hoe het werkt',
    forBusinesses: 'Voor bedrijven',
    signInLink: 'Inloggen',
    stepsTitle: 'Zo helpt jouw feedback',
    step1Title: 'Deel je ervaring',
    step1Body: 'Een paar korte vragen over wat je bestelde of waar je was.',
    step2Title: 'Feedback wordt inzicht',
    step2Body: 'Antwoorden van alle gasten worden samengevoegd tot thema’s, niet losse meningen.',
    step3Title: 'Het bedrijf verbetert',
    step3Body: 'De vestiging ziet wat terugkeert en bepaalt wat er als eerste verandert.',
    step4Title: 'Resultaat wordt zichtbaar',
    step4Body: 'Verbeteringen worden gepubliceerd, zodat je ziet wat jouw feedback veranderde.',
    privateTitle: 'Standaard privé',
    privateBody:
      'Je feedback gaat naar het bedrijf, niet naar het internet. Je antwoordt eerlijk omdat het een gesprek is, geen optreden.',
    adaptiveTitle: 'Vragen die meebewegen',
    adaptiveBody:
      'Wie een goede ervaring had, krijgt geen kruisverhoor. Bij een lagere score volgen korte, gerichte vragen.',
    reviewsTitle: 'Reviews, eerst verdiend',
    reviewsBody:
      'Een bedrijf vraagt pas om Google-reviews als de eigen resultaten goed genoeg zijn. Daarna krijgt iedere gast dezelfde uitnodiging.',
    businessTitle: 'Wil je weten wat jouw gasten echt ervaren?',
    businessBody:
      'Gestructureerde feedback per vestiging, thema’s in plaats van losse reviews, en een helder moment om openbare reviews te gaan verzamelen.',
  },
};
