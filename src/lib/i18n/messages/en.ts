/**
 * English messages. This is the source catalogue — `nl.ts` is typed against it,
 * so adding a key here without translating it is a type error rather than an
 * English string leaking into the Dutch UI.
 *
 * Copy follows the design system's tone rules: sentence case, no Title Case, no
 * exclamation marks, sentences under 20 words.
 */
export const en = {
  brand: {
    name: 'GeefSterren',
    tagline: 'Feedback that leads to improvement',
    poweredBy: 'Feedback powered by GeefSterren',
  },

  common: {
    save: 'Save',
    saving: 'Saving',
    cancel: 'Cancel',
    close: 'Close',
    edit: 'Edit',
    remove: 'Remove',
    add: 'Add',
    next: 'Next',
    back: 'Back',
    signIn: 'Sign in',
    signOut: 'Sign out',
    loading: 'Loading',
    readOnly: 'Read only',
    all: 'All',
    none: 'None',
    saved: 'Changes saved.',
    checkForm: 'Check the form and try again',
    somethingWentWrong: 'Something went wrong',
  },

  auth: {
    portalTitle: 'Feedback portal',
    signInTitle: 'Sign in',
    emailLabel: 'Email address',
    emailPlaceholder: 'you@restaurant.nl',
    sendLink: 'Send sign-in link',
    sending: 'Sending',
    checkEmailTitle: 'Check your email',
    checkEmailBody:
      'If an account exists for {email}, a sign-in link is on its way. The link expires shortly for security.',
    inviteOnly:
      'Portal accounts are created by invitation. Ask your organization administrator if you do not have one yet.',
    errorTitle: 'Could not sign you in',
    errorMissingCode: 'That link is incomplete. Request a new sign-in link and try again.',
    errorInvalidCode: 'That link has expired or has already been used. Request a new one.',
    errorGeneric: 'Something went wrong while signing you in.',
    passwordLabel: 'Password',
    signInWithPassword: 'Sign in',
    orMagicLink: 'Rather not use a password?',
    sendLinkInstead: 'Email me a sign-in link',
    credentialsError: 'That email address and password do not match an account',
    backToSignIn: 'Back to sign in',
  },

  nav: {
    overview: 'Overview',
    locations: 'Locations',
    feedback: 'Feedback',
    campaigns: 'Campaigns',
    reviewReadiness: 'Google invitation',
    qrCodes: 'QR codes',
    analyses: 'AI analysis',
    users: 'Users',
    settings: 'Settings',
    platform: 'Platform',
    sectionMain: 'Overview',
    sectionManage: 'Manage',
    sectionAccount: 'Account',
  },

  roles: {
    platformAdmin: 'Platform administrator',
    platformSupport: 'Platform support',
    orgAdmin: 'Organization administrator',
    locationManager: 'Location manager',
    viewer: 'Viewer',
  },

  status: {
    active: 'Active',
    inactive: 'Inactive',
    archived: 'Archived',
    invited: 'Invited',
    suspended: 'Suspended',
  },

  overview: {
    title: 'Overview',
    subtitle: 'Feedback collection across your locations.',
    statLocations: 'Locations',
    statActiveLocations: 'Active locations',
    statMembers: 'Team members',
    locationsTitle: 'Locations',
    manage: 'Manage',
    noOrganization: 'No organization selected',
    noOrganizationBody: 'Platform staff can open a specific organization from the platform section.',
    notLinked:
      'Your account is not linked to an organization yet. Ask your administrator to complete the invitation.',
    metricsPending:
      'Response and score metrics appear here once the guest feedback flow is live.',
  },

  locations: {
    title: 'Locations',
    subtitle:
      'Every location collects feedback on its own, with its own campaigns, QR codes and Google invitation settings.',
    allLocations: 'All locations',
    empty: 'No locations yet',
    emptyBody: 'Add your first location to start collecting feedback.',
    addTitle: 'Add a location',
    settingsTitle: 'Location settings',
    name: 'Name',
    slug: 'Slug',
    slugHelp: 'Used internally and in exports. It is not part of any public URL.',
    timezone: 'Timezone',
    street: 'Street',
    city: 'City',
    externalReference: 'External reference',
    googleReviewUrl: 'Google review link',
    googleReviewUrlHelp:
      'Stored now, used only once the Google invitation is active for this location.',
    addAction: 'Add location',
    adding: 'Adding',
    feedbackTitle: 'Feedback',
    feedbackPending:
      'Response volume, score trend and category breakdown appear here once the guest flow is live.',
    notFound: 'Location not found',
  },

  readiness: {
    title: 'Google invitation',
    collectingTitle: 'Collecting private feedback',
    collectingBody:
      'This location collects private feedback only. No Google invitation is shown to guests.',
    /** Required copy. Do not soften: it is the promise the product is built on. */
    equalTreatment:
      'When active, the Google invitation is shown to every respondent, regardless of their individual score.',
  },

  users: {
    title: 'Users',
    subtitle:
      'Organization administrators reach every location. Location managers and viewers only reach the locations assigned to them.',
    teamTitle: 'Team',
    empty: 'No members yet',
    inviteTitle: 'Invite someone',
    inviteAction: 'Send invitation',
    inviteSent: 'Invitation sent.',
    role: 'Role',
    memberStatus: 'Status',
    locationAccess: 'Location access',
    allLocations: 'All locations',
    noLocations: 'No locations assigned',
    addLocationFirst: 'Add a location first.',
    orgAdminAllLocations: 'Organization administrators automatically reach every location.',
    invitedUser: 'Invited user',
    you: 'you',
    saveAccess: 'Save access',
    removeFromOrg: 'Remove from organization',
    readOnlyNotice: 'Only organization administrators can invite or change members.',
    roleViewer: 'Viewer — read only',
    roleLocationManager: 'Location manager',
    roleOrgAdmin: 'Organization administrator',
  },

  errors: {
    slugTaken: 'That slug is already used by another location',
    alreadyMember: 'That person is already a member of this organization',
    lastAdmin: 'An organization must keep at least one active administrator',
    noPermissionLocation: 'You do not have permission to edit this location',
    createLocation: 'Could not create the location',
    saveLocation: 'Could not save the location',
    invite: 'Could not invite this person',
    updateMembership: 'Could not update this membership',
    removeMembership: 'Could not remove this membership',
    locationAccess: 'Could not update location access',
    saveProfile: 'Could not save your profile',
    invalidRequest: 'Invalid request',
  },

  results: {
    title: 'Results per question',
    subtitle: 'What guests answered, per question, over the selected period.',
    basedOn: 'Based on {answered} of {total} responses',
    noAnswers: 'Nobody has answered this question yet',
    averageOfFive: 'average out of 5',
    writtenAnswers: '{count} written answers',
    distributionTitle: 'Score distribution',
    emptyTitle: 'No results yet',
    emptyBody: 'Results appear as soon as guests start answering the questionnaire.',
    statResponses: 'Responses',
    statAverage: 'Average score',
    statLowScores: 'Low scores',
    statCompletion: 'Completion',
    recentComments: 'Recent comments',
    noComments: 'No comments yet',
    questionnaire: 'Questionnaire',
    questionnaireNone: 'No questionnaire assigned',
    orgWide: 'Assigned to every location',
    locationOnly: 'Assigned to this location',
  },

  qr: {
    title: 'QR codes',
    subtitle: 'Print a QR code so guests can leave feedback. One code per place you put it.',
    listTitle: 'Existing codes',
    empty: 'No QR codes yet',
    emptyBody: 'Create one below, then download it as SVG for print or PNG for screens.',
    createTitle: 'Create a QR code',
    campaign: 'Campaign',
    sourceChannel: 'Where does it go?',
    label: 'Internal label',
    labelHelp: 'For your own reference, for example "Delivery box Leiden".',
    create: 'Create QR code',
    creating: 'Creating',
    downloadSvg: 'SVG',
    downloadPng: 'PNG',
    reissue: 'Reissue',
    reissueHint: 'This code predates encrypted storage. Reissue it to download it — the old code stops working.',
    createdTitle: 'QR code created',
    createdBody: 'Save these now. The code is stored encrypted and the plain value is not shown again.',
    tokenLabel: 'Review link',
    codeLabel: 'Feedback code',
    scans: 'scans',
    started: 'started',
    completed: 'completed',
    noCampaign: 'Create a campaign for this location first.',
    channelPackaging: 'Packaging',
    channelFlyer: 'Flyer',
    channelReceipt: 'Receipt',
    channelCounter: 'Counter',
    channelTable: 'Table card',
    channelEmail: 'Email',
    channelOther: 'Other',
  },

  guest: {
    intro: 'Your feedback helps {location} improve.',
    chips1: 'about a minute',
    chips2: 'a few short questions',
    chips3: 'send anonymously',
    ratingQuestion: 'How do you rate your experience?',
    ratingRequired: 'Choose a score to continue',
    veryPoor: 'Very poor',
    poor: 'Poor',
    fair: 'Fair',
    good: 'Good',
    excellent: 'Excellent',
    optionLabel: '{score} of {total} stars, {label}',
    scaleLow: '1 Very poor',
    scaleHigh: '5 Excellent',
    commentPlaceholder: 'For example: the delivery was quick, but the soup had cooled down.',
    optional: 'optional',
    send: 'Send feedback',
    sending: 'Sending',
    thanksTitle: 'Thank you for your feedback',
    thanksBody: 'Your answers go to {location}. They are combined with other guests\u2019 answers, so nothing is traceable to you.',
    thanksScore: 'Your score',
    close: 'Close',
    notFoundTitle: 'This code is not active',
    notFoundBody: 'The QR code or link is no longer valid. Ask at the business for a current one.',
    failedTitle: 'Sending did not work',
    failedBody: 'Something went wrong on our side. Try again in a moment.',
    charactersLeft: '{count} characters left',
  },

  platform: {
    title: 'Platform',
    subtitle: 'Every organization on the platform. Open one to work inside it.',
    organizations: 'Organizations',
    empty: 'No organizations yet',
    open: 'Open',
    current: 'Currently open',
    locations: 'locations',
    members: 'members',
    contextBanner: 'You are viewing {organization} as platform staff. You are not a member of this organization.',
    contextExit: 'Close participant',
    readOnlyHint: 'Platform support has read access only.',
    adminLink: 'Platform',
    pickOrganization: 'Choose an organization to get started.',
  },

  marketing: {
    // Hero
    heroEyebrow: 'Feedback for local businesses',
    heroNoCode: 'No code? Scan the QR code at the business.',

    // Hero phone mock — decorative, but it shows real product copy.
    mockLocationName: 'Restaurant De Haven',
    mockLocationMeta: 'Leiden · Delivery',
    mockRatingQuestion: 'How do you rate your experience?',
    mockScaleLow: '1 Very poor',
    mockScaleHigh: '5 Excellent',
    mockFollowUpQuestion: 'Where can we improve?',
    mockTopic1: 'Delivery time',
    mockTopic2: 'Temperature',
    mockTopic3: 'Taste',
    mockTopic4: 'Packaging',
    mockNext: 'Next',

    // Navigation
    navHowItWorks: 'How it works',
    navImprovements: 'Improvements',

    heroTitle: 'Give feedback. Help your local business improve.',
    heroBody:
      'Share in a few short steps how your visit, order or delivery went. Your experience shows a business what is going well and what could be better.',
    heroCta: 'See how it works',
    forBusinesses: 'For businesses',
    signInLink: 'Sign in',

    // Feedback code — the hero's primary action.
    codeLabel: 'Do you have a feedback code?',
    codePlaceholder: 'For example: HAVEN24',
    codeSubmit: 'Continue',
    codeHelp:
      'You will find the QR code or feedback code on the packaging, receipt, table card or flyer of the business.',
    /**
     * Fixed copy. The message never says why a code failed, so campaign
     * structure stays private.
     */
    codeError: 'This code is not valid or no longer active',

    stepsTitle: 'How your feedback helps',
    step1Title: 'Share your experience',
    step1Body: 'A few short questions about what you ordered or where you visited.',
    step2Title: 'Feedback becomes insight',
    step2Body: 'Answers from all guests are combined into themes, not single opinions.',
    step3Title: 'The business improves',
    step3Body: 'The location sees what recurs and decides what to change first.',
    step4Title: 'The result becomes visible',
    step4Body: 'Improvements are published, so you can see what your feedback changed.',

    // Section 3 — what changes because of customer feedback.
    changeEyebrow: 'What changes',
    changeTitle: 'This is what changes thanks to customer feedback',
    changeExample: 'Example · demonstration data',
    changeCaseTitle: 'Delivery restaurant, 84 responses',
    changeCaseHeard: 'What customers reported',
    changeCaseHeardBody:
      'Warm dishes sometimes cooled down too much during delivery, especially on longer routes.',
    changeCaseDid: 'What the location changed',
    changeCaseDidBody:
      'Since 14 July this location uses insulated packaging and hands over the warmest dishes last.',
    changeMetric1: 'Score for temperature',
    changeMetric1Note: 'Measured over 84 responses, 90 days before and after 14 July',
    changeMetric2: 'Orders on time',
    changeMetric2Note: 'Measured over 84 responses, 90 days before and after 14 July',
    changeMetric3: 'Responses with a complaint about packaging',
    changeMetric3Note: 'Measured over 84 responses, 90 days before and after 14 July',

    // Section 4 — businesses that listen.
    listeningTitle: 'Local businesses that listen',
    listeningBody: 'What customers asked for, and what changed as a result. No scores, no ranking.',
    listeningEmpty: 'No published improvements yet',
    listeningEmptyBody:
      'Businesses publish their improvements here once they have collected enough feedback.',

    // Section 5 — why your opinion matters.
    whyTitle: 'Why your opinion makes a difference',
    privateTitle: 'Private by default',
    privateBody:
      'Your feedback goes to the business, not to the internet. You answer honestly because it is a conversation, not a performance.',
    adaptiveTitle: 'Questions that adapt',
    adaptiveBody:
      'A guest who had a good time is not interrogated. A lower score opens short, specific questions about what happened.',
    reviewsTitle: 'Reviews, earned first',
    reviewsBody:
      'A business only starts asking for Google reviews once its own results are good enough. Then every guest gets the same invitation.',

    // Section 6 — what happens with your feedback.
    privacyTitle: 'What happens with your feedback?',
    privacyBody:
      'Your answers go to the business you visited. We combine responses into themes so that no single answer can be traced back to you.',
    privacyLinkPrivacy: 'Privacy statement',
    privacyLinkData: 'How we use data',
    privacyLinkContact: 'Contact',
    transparencyTitle: 'About these pages',
    transparency1: 'The figures come from feedback collected through GeefSterren.',
    transparency2: 'Responses are aggregated; individual answers are never shown publicly.',
    transparency3: 'The business decides which improvements it publishes.',
    transparency4:
      'GeefSterren does not independently audit businesses and does not verify every improvement.',
    faqTitle: 'Questions guests ask',
    faq1Q: 'Will my feedback be published?',
    faq1A:
      'No. Your answers go to the business. Only combined themes and improvements appear on a public page, never your individual response.',
    faq2Q: 'Do I have to leave my email address?',
    faq2A:
      'No. An email address is only asked when you want a reward or want to hear about improvements. You can always skip it.',
    faq3Q: 'Does a low score cost me anything?',
    faq3A:
      'No. A reward depends on completing the questionnaire, never on your score and never on posting a public review.',
    faq4Q: 'Am I obliged to leave a Google review?',
    faq4A:
      'No. When a business asks, it asks every guest the same way, and you can finish without doing it.',
    faq5Q: 'How long does it take?',
    faq5A: 'About a minute. Five short questions, and the comment field is optional.',

    // Section 7 — for businesses.
    businessTitle: 'Want to know what your guests really experience?',
    businessBody:
      'Structured feedback per location, themes instead of single reviews, and a clear moment to start collecting public reviews.',
  },
};

/**
 * Note the absence of `as const`: values must widen to `string`, otherwise each
 * message's type would be its own English literal and no translation could
 * satisfy it. Key completeness is still enforced, which is the property we
 * actually want.
 */
export type Messages = typeof en;
