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
    questionnaires: 'Questionnaires',
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
    criterionMet: 'criterion met',
    criterionUnmet: 'criterion not yet met',
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
    temporary: 'Something went wrong on our side. Try again in a moment.',
    checkForm: 'Check the form and try again',
    campaignCreate: 'Could not create this campaign',
    campaignStatus: 'Could not change this campaign',
    campaignQuestionnaireNotPublished: 'Choose a published questionnaire',
    questionnaireCreate: 'Could not create this questionnaire',
    questionAdd: 'Could not add this question',
    questionRemove: 'Could not remove this question',
    questionnairePublish: 'Could not publish this version',
    questionnaireAssign: 'Could not change the assignment',
    questionnaireDraft: 'Could not create a new draft',
    qrCreate: 'Could not create this QR code',
    qrRotate: 'Could not reissue this QR code',
    notFound: 'That item no longer exists',
    noPermission: 'You do not have permission to do this',
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

  questionnaires: {
    title: 'Questionnaires',
    subtitle: 'The questions guests are asked. Assign one to every location, or to a selection.',
    platformTemplate: 'Platform template',
    yours: 'Your questionnaire',
    versions: 'Versions',
    version: 'Version {number}',
    statusDraft: 'Draft',
    statusPublished: 'Published',
    statusArchived: 'Archived',
    questionCount: '{count} questions',
    assignedAll: 'All locations',
    assignedSelected: '{count} locations',
    assignedNone: 'Not assigned',
    open: 'Open',
    newDraft: 'New draft',
    createTitle: 'New questionnaire',
    name: 'Name',
    description: 'Description',
    create: 'Create',
    creating: 'Creating',
    empty: 'No questionnaires yet',
    emptyBody: 'Start from the platform template, or create your own.',

    editTitle: 'Questions',
    publishedNotice: 'This version is published and can no longer be changed. Create a new draft to adjust the questions.',
    platformNotice: 'This is a platform template. Create a new draft to make your own version of it.',
    addQuestion: 'Add a question',
    questionKey: 'Key',
    questionKeyHelp: 'Used in exports and conditions. Cannot change after publishing.',
    label: 'Question',
    helpText: 'Help text',
    category: 'Category',
    questionType: 'Type',
    required: 'Required',
    onlyBelowFive: 'Only ask below five stars',
    onlyBelowFiveHelp: 'A five-star guest is not asked diagnostic questions.',
    options: 'Answer options',
    optionsHelp: 'One per line. Only for a choice question.',
    add: 'Add',
    adding: 'Adding',
    remove: 'Remove',
    noQuestions: 'No questions yet',
    noQuestionsBody: 'Add the first question below.',
    publish: 'Publish',
    publishHint: 'After publishing the questions are fixed, so historic answers keep their meaning.',
    typeRating: 'Rating 1 to 5',
    typeSingle: 'One answer',
    typeMultiple: 'Several answers',
    typeBoolean: 'Yes or no',
    typeShortText: 'Short text',
    typeLongText: 'Long text',

    assignTitle: 'Where is this asked?',
    scopeAll: 'Every location',
    scopeSelected: 'Only these locations',
    scopeNone: 'Nowhere for now',
    scopeAllHint: 'A location added later inherits it automatically.',
    saveAssignment: 'Save',
    assignPublishFirst: 'Publish this version before assigning it.',
  },

  campaigns: {
    title: 'Campaigns',
    subtitle: 'A campaign is what a QR code points at. It sets the questionnaire and whether feedback is being collected.',
    listTitle: 'Campaigns',
    empty: 'No campaigns yet',
    emptyBody: 'Create one below, then print a QR code for it.',
    createTitle: 'New campaign',
    name: 'Name',
    namePlaceholder: 'For example: Delivery, or Summer terrace',
    questionnaire: 'Questionnaire',
    assignedHint: 'Assigned to this location',
    activateNow: 'Start collecting straight away',
    create: 'Create campaign',
    creating: 'Creating',
    statusDraft: 'Draft',
    statusActive: 'Active',
    statusPaused: 'Paused',
    statusCompleted: 'Completed',
    statusArchived: 'Archived',
    activate: 'Activate',
    pause: 'Pause',
    complete: 'Complete',
    qrCodes: '{count} QR codes',
    responses: '{count} responses',
    pausedHint: 'A paused campaign stops new feedback. Its QR codes stay printed and start working again when you activate it.',
    noQuestionnaire: 'Publish a questionnaire first, then create a campaign.',
    manageQr: 'QR codes',
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
  /**
   * Public website chrome — the shared header and footer of the marketing
   * pages. Deliberately outside the public scope in `scope.ts`: the layout is
   * server-rendered, so none of this needs to cross into the browser bundle.
   */
  chrome: {
    navForBusinesses: 'For businesses',
    ctaDemo: 'Book a demo',

    footerTagline:
      'Feedback platform for local businesses. Your experience helps them improve.',
    footerGuests: 'For guests',
    footerGuestsHowItWorks: 'How it works',
    footerGuestsImprovements: 'Improvements',
    footerGuestsCode: 'Enter a feedback code',
    footerBusiness: 'For businesses',
    footerBusinessProduct: 'GeefSterren for businesses',
    footerBusinessDemo: 'Book a demo',
    footerBusinessSignIn: 'Sign in',
    footerLegal: 'Legal',
    footerLegalPrivacy: 'Privacy statement',
    footerLegalData: 'How data is used',
    footerLegalTerms: 'Terms',
    footerContact: 'Contact',
    footerContactForm: 'Contact form',
    footerContactEmail: 'support@geefsterren.nl',
    footerCopyright: '\u00a9 2026 GeefSterren B.V. \u00b7 geefsterren.nl',
    footerRegistration: 'KvK 00000000 \u00b7 Rotterdam',
  },

  /** Page 1 of the website handoff \u2014 `/hoe-het-werkt`. */
  howItWorks: {
    metaTitle: 'How it works \u2014 GeefSterren',
    metaDescription:
      'Feedback in about a minute, without an account or an app. Anonymous unless you choose otherwise.',

    heroEyebrow: 'For guests',
    heroTitle: 'Feedback in one minute that actually goes somewhere.',
    heroBody: 'No account, no app. Anonymous \u2014 unless you choose otherwise.',
    heroCodeFound: 'Code found \u2014 you are going to Restaurant De Haven.',
    heroCaption:
      'No code? Scan the QR code on the packaging, the receipt or the table card.',

    stepsEyebrow: 'How it works',
    stepsTitle: 'Four steps, about a minute',
    stepsBody: 'From the QR code on the table to the message that something changed.',
    step1Title: 'Scan the QR code or enter your code',
    step1Body:
      'No account, no app. You will find the code on the packaging, the receipt or the table card. About 10 seconds.',
    step2Title: 'Answer a few short questions',
    step2Body:
      'A score, a few topics and room for an explanation if you want to give one. About one minute.',
    step3Title: 'The business reads along and gets to work',
    step3Body:
      'Your feedback arrives as themes and trends, together with other responses \u2014 not as a list of senders.',
    step4Title: 'Follow what changes',
    step4Body:
      'Optional. Sign up with your email address and you will hear when the location makes a change. Double opt-in, one click to unsubscribe.',

    chainTitle: 'What happens to your feedback?',
    chainBody: 'The whole chain, without stops you cannot see.',
    chain1Title: 'Straight to the business',
    chain1Body:
      'Your answers go to the location whose questionnaire you fill in. Not to a public profile.',
    chain2Title: 'Combined into themes',
    chain2Body:
      'The business sees themes and trends across all responses, not a list of individual senders.',
    chain3Title: 'Public from 20 responses',
    chain3Body:
      'Only from 20 responses in a period can a location publish aggregated results on its own improvement page.',
    chainAlertTitle: 'GeefSterren is not a review site',
    chainAlertBody:
      'Your text never appears in public by itself. Public pages show only combined figures and themes.',

    anonymousTitle: 'Am I anonymous?',
    anonymousBody:
      'The honest answer in three lines. This is exactly how it works, not made prettier.',
    anonymous1: 'By default the business cannot see who you are.',
    anonymous2: 'If you enter your name yourself, the business sees it.',
    anonymous3:
      'Only if you want a chance at a reward or want to receive updates do we ask for your email address. We use it for that alone: never sold, no spam.',
    anonymousLinkPrivacy: 'Privacy statement',
    anonymousLinkData: 'How data is used',

    rewardsTitle: 'About rewards',
    rewardsBody:
      'Some businesses attach a reward to a feedback campaign. The business decides per campaign what that reward is.',
    rewardsEmphasis:
      'The reward is for giving feedback \u2014 not for a positive score. Critical feedback has an equal chance.',
    rewardsTerms: 'The terms are stated per campaign in the feedback flow itself.',
    rewardsNeverTitle: 'What a reward is never',
    rewardsNever1: 'Payment for a high score.',
    rewardsNever2: 'A condition for completing the questionnaire.',
    rewardsNever3:
      'Something you have to leave your email address for if you do not want to.',

    whyTitle: 'Why would you?',
    why1Title: 'Your point becomes an improvement',
    why1Body:
      'A remark that would otherwise disappear ends up with the people who can do something about it.',
    why2Title: 'You see what changed',
    why2Body:
      'Sign up and you get a message as soon as the location makes an improvement or measures its result.',
    why3Title: 'Your local business gets better',
    why3Body:
      'Where you come often, you notice the difference first: a shorter wait, warmer delivery, a clearer menu.',
    whyCaseTitle: 'Restaurant De Haven, Leiden',
    whyCaseBody:
      'Guests reported that orders arrived late and cold on busy evenings. The location changed the packaging and the weekend staffing.',
    whyCaseMetric1: 'Orders on time',
    whyCaseMetric1Note: '84 responses \u00b7 90 days before and after 1 July',
    whyCaseMetric2: 'Temperature score',
    whyCaseMetric2Note: '42 responses after 14 July \u00b7 scale 1 to 5',
    whyCaseFootnote:
      'These scores improved after the changes. GeefSterren shows the order of events, not a proven cause.',

    faqTitle: 'Frequently asked questions',
    faq1Q: 'Can the business see who I am?',
    faq1A:
      'No, unless you enter your name yourself. By default your response is anonymous to the business. Only if you want a chance at a reward or want to receive updates do we ask for your email address, and we use it for that alone.',
    faq2Q: 'Do I have to create an account?',
    faq2A:
      'No. Scanning the QR code or entering your feedback code is enough. There is no app and no login.',
    faq3Q: 'I have criticism \u2014 will anyone get in trouble for it?',
    faq3A:
      'Feedback arrives aggregated: the business sees themes and trends, not individual senders. Criticism is exactly what the system exists for; without those responses a location does not know where it stands.',
    faq4Q: 'Why does the business sometimes ask me for a Google review afterwards?',
    faq4A:
      'Only if the business has demonstrably improved and the configured quality criteria are met. Every respondent then gets the same invitation, regardless of the score you gave. That question is entirely separate from any reward.',
    faq5Q: 'How do I unsubscribe from updates?',
    faq5A:
      'Every email has an unsubscribe link. Unsubscribing takes effect immediately and you do not have to give a reason.',

    ctaTitle: 'How was your experience?',
    ctaBody:
      'Scan the QR code of the business or enter your feedback code. It takes about a minute.',
    ctaLink: 'See what changes thanks to customer feedback',
  },
  /** Page 2 of the website handoff \u2014 `/verbeteringen`. */
  improvements: {
    metaTitle: 'Improvements \u2014 GeefSterren',
    metaDescription:
      'Locations that publicly show what they did with customer feedback. Not a ranking and not a review site.',

    heroEyebrow: 'Improvements',
    heroTitle: 'Locations that show what they did with feedback',
    heroBody:
      'This is an overview of locations that publicly show what they did with customer feedback. It is not a ranking and not a review site \u2014 there is deliberately no sorting by score.',

    searchLabel: 'Search by town or name',
    categoryAll: 'All',
    categoryDelivery: 'Delivery',
    categoryRestaurant: 'Restaurant',
    categoryRetail: 'Retail',
    sortLabel: 'Sorting',
    statusProgress: 'In progress',
    statusDone: 'Carried out',
    statusMeasured: 'Measured result',
    sortRecent: 'Last updated',
    sortName: 'Name A\u2013Z',
    sortNote:
      'Sorted by last updated \u2014 that rewards active businesses and is not a judgement of quality.',
    resultCount: 'locations',

    emptyTitle: 'We have just started',
    emptyBody:
      'These businesses are already taking part \u2014 the first results appear once a location has 20 responses.',

    aboutTitle: 'About this page',
    about1: 'The figures come from feedback collected at these locations through GeefSterren.',
    about2:
      'Responses are combined. Individual answers and personal data are not shown publicly.',
    about3: 'Each location chooses which completed improvements are published here.',
    about4:
      'GeefSterren does not independently verify whether a published improvement was carried out.',
    about5: 'A figure appears only at a minimum of 20 responses in the chosen period.',

    noRankingTitle: 'No ranking',
    noRankingBody:
      'Locations are listed in order of their last update. There is no sorting by score and no star average on the cards.',
    ownFeedbackTitle: 'Want to give feedback yourself?',
    ownFeedbackBody:
      'That is only possible through the QR code or feedback code of a location. That way we know the response belongs to a real visit or a real order.',
    ownFeedbackLink: 'See how it works',
  },

  /** Page 3 of the website handoff \u2014 `/voor-bedrijven`. */
  forBusinesses: {
    metaTitle: 'For businesses \u2014 GeefSterren',
    metaDescription:
      'Continuous and comparable insight into the customer experience per location. Conversations based on figures instead of opinions.',

    heroEyebrow: 'For chains and multi-location',
    heroTitle:
      'Your chain is only as strong as your weakest location \u2014 and you find out too late which one that is.',
    heroBody:
      'Continuous and comparable insight into the customer experience per location. Conversations with franchisees based on figures instead of opinions.',
    heroCtaSecondary: 'See how it works',
    heroCaption: '30 minutes, you see the working product with demonstration data.',
    heroPanelATitle: 'Chain dashboard \u00b7 12 locations',
    heroPanelAStatResponses: 'Responses',
    heroPanelAStatResponsesNote: '30 days',
    heroPanelAStatScore: 'Score',
    heroPanelAStatScoreNote: 'chain-wide',
    heroPanelAStatReady: 'Review-ready',
    heroPanelAStatReadyNote: 'locations',
    heroPanelADistribution: 'Score distribution',
    heroPanelADistributionNote: '1.248 responses \u00b7 30 days',
    heroPanelBTitle: 'Leiden location \u00b7 public improvement page',
    heroPanelBMetric: 'Orders on time',
    heroPanelBMetricNote: '84 responses \u00b7 90 days',

    problemTitle: 'Individual reviews do not tell the whole story',
    problemBody:
      'Public reviews are valuable. They are just rarely usable for steering a chain.',
    problem1Title: 'Too few, too extreme',
    problem1Body:
      'Each location receives too few reviews, and they come mostly from guests with an outspoken experience.',
    problem2Title: 'Mystery shopping is expensive',
    problem2Body:
      'One visit per quarter costs a lot and says something about that single moment, not about the week after.',
    problem3Title: 'You hear about it too late',
    problem3Body:
      'A problem usually reaches head office only once it is already a public one-star review.',
    problem4Title: '\u201cThat is not what I see\u201d',
    problem4Body:
      'Without the same questions per location, conversations with franchisees get stuck in experience against experience.',
    problem5Title: 'One location, all brands',
    problem5Body: 'One weak location costs brand trust that every location pays for.',

    tableTitle: 'Scores per location',
    tableBody:
      'Every location gets the same questions, so the comparison is about the same thing. Six of the twelve locations, sorted by average score.',
    tableColLocation: 'Location',
    tableColResponses: 'Responses',
    tableColScore: 'Avg. score',
    tableColDelivery: 'Delivery time',
    tableColTemperature: 'Temperature',
    tableColDelta: 'vs. chain',
    tableColReady: 'Review-ready',
    tableDistributionTitle: 'Delivery time score distribution',
    tableDistributionNote: '510 responses \u00b7 30 days \u00b7 chain-wide',
    tableAlertTitle: 'No ranking for the guest',
    tableAlertBody:
      'This comparison is for head office and the franchisee. Public pages carry no sorting by score.',
    tableFootnote:
      'Scores on a scale of 1 to 5, measured over the last 30 days. A score appears only at a minimum of 20 responses in the period.',

    flowTitle: 'From feedback to visible result',
    flowBody:
      'Six steps, filled in here for a delivery chain with twelve locations. You switch the sixth on only once a location is ready for it.',
    flow1Title: 'Collect feedback per location',
    flow1Body:
      'QR codes per location and per channel: delivery box, receipt, table or flyer. Twelve locations, the same questionnaire.',
    flow2Title: 'Understand patterns',
    flow2Body:
      'Scores per topic, themes and trends, always with the number of responses and the period alongside.',
    flow3Title: 'Compare locations',
    flow3Body:
      'See which location deviates on which topic, and whether the problem is local or chain-wide.',
    flow4Title: 'Make improvements and measure',
    flow4Body:
      'Record what a location changes and compare the period before and after on the same questions.',
    flow5Title: 'Make improvement visible',
    flow5Body:
      'Publish selected improvements on the public location page and inform guests who signed up.',
    flow6Title: 'Activate review invitations',
    flow6Body:
      'Once a location meets the quality criteria, every respondent from that location gets the same invitation.',

    readinessTitle: 'Improve first, then ask for reviews',
    readinessBody1:
      'Every location has its own review readiness. Head office sees at a glance which locations are ready to actively collect reviews and which have to improve first.',
    readinessBody2:
      'Once the configured quality criteria are met, the invitation for a public review can be activated. From that moment every respondent gets the same opportunity.',
    readinessPill1: 'Collecting feedback',
    readinessPill2: 'Addressing improvement points',
    readinessPill3: 'Meeting quality criteria',
    readinessPill4: 'Activate invitation',
    readinessNote:
      'The invitation applies to all respondents at once. An individual score never determines whether someone sees the invitation \u2014 GeefSterren filters no customers.',
    readinessPanelTitle: 'Review readiness \u00b7 Leiden',
    readinessCriterion1: 'Number of responses',
    readinessCriterion2: 'Average score',
    readinessCriterion3: 'Share of low scores',
    readinessCriterion4: 'Completion rate',
    readinessWindow: 'last 60 days',
    readinessMode: 'Automatic',
    statusPanelTitle: 'Status per location',
    statusInvitationActive: 'Invitation active',
    statusCollecting: 'Collecting feedback',
    statusImproveFirst: 'Improve first',

    featuresTitle: 'What a chain does with it',
    feature1Title: 'Location comparison',
    feature1Body:
      'All locations answer the same questions, so the comparison is about the same thing. Including the number of responses per location.',
    feature2Title: 'Trends per location and chain-wide',
    feature2Body:
      'See whether a problem is local or everywhere, and whether it moves the other way after an intervention.',
    feature3Title: 'AI summaries with sources',
    feature3Body:
      'Every summary states what it is based on, for example \u201cbased on 48 responses\u201d. Suggested actions are advice, not a conclusion.',
    feature4Title: 'Feedback campaigns with an optional reward',
    feature4Body:
      'Per campaign you choose whether there is a reward and what it is. The reward is attached to completing the questionnaire, to nothing else.',
    feature5Title: 'Public improvement page per location',
    feature5Body:
      'A local trust signal: the location shows what was changed and what was measured afterwards.',
    feature6Title: 'Reporting per franchisee',
    feature6Body:
      'Every franchisee gets the same reporting on the same questions. The numbers conversation without a discussion about the measurement.',

    newEyebrow: 'Where the customer cases belong',
    newTitle: 'GeefSterren is new',
    newBody1:
      'We have no customer cases yet. That is why we show the full working product with demonstration data in the demo, and publish results only once they are real and verified.',
    newBody2: 'Every figure and example on this site is labelled for that reason.',
    newRowVerified: 'Verified customer case',
    newRowVerifiedNote: 'Not available yet',
    newRowExampleNote: 'What you see on this site now',
    newRowDemoNote: 'In the demo: the working product, with demonstration data',

    pricingTitle: 'Pricing',
    pricingBody:
      'A scale based on the number of locations. From-prices per location per month, decreasing as you connect more locations.',
    pricingPending: 'Amounts to be confirmed',
    pricingPer: 'per location per month',
    pricingOnRequest: 'On request',
    pricingContact: 'Get in touch',
    tier1Name: 'Starter',
    tier1Range: '1 to 3 locations',
    tier1Feature1: 'Feedback flow with QR per location',
    tier1Feature2: 'Portal with scores, themes and trends',
    tier1Feature3: 'One campaign at a time',
    tier2Name: 'Grow',
    tier2Range: '4 to 15 locations',
    tier2Feature1: 'Everything in Starter',
    tier2Feature2: 'Location comparison on the same questions',
    tier2Feature3: 'Public improvement pages',
    tier2Feature4: 'Reporting per franchisee',
    tier3Name: 'Enterprise',
    tier3Range: 'More than 15 locations',
    tier3Feature1: 'Everything in Grow',
    tier3Feature2: 'SSO and API connections',
    tier3Feature3: 'Chain-wide onboarding',
    tier3Feature4: 'SLA',
    pricingFootnote:
      'The amounts shown are examples for this design and will be replaced once the tariffs are settled.',

    faqTitle: 'Frequently asked questions',
    faq1Q: 'How long does implementation take per location?',
    faq1A:
      'Days, not months. You configure the campaign centrally and the location puts up the QR material. Usually the first responses arrive within a week.',
    faq2Q: 'What do franchisees have to do themselves?',
    faq2A:
      'Put up the QR material in the agreed place. The chain manages the questionnaires, campaigns and settings centrally.',
    faq3Q: 'Who owns the data?',
    faq3A:
      'The chain. Locations see their own results; head office sees all locations and the comparison.',
    faq4Q: 'Is this GDPR compliant?',
    faq4A:
      'Feedback is anonymous to the business by default. An email address is only asked for if the guest chooses to give one, with double opt-in and one click to unsubscribe.',
    faq5Q: 'Can we start small with a few locations?',
    faq5A:
      'Yes. Many chains start with three to five locations and expand once the questionnaire and the campaign are settled. In the demo we show what that setup looks like.',

    ctaTitle: 'In 30 minutes you see the product as your chain would use it',
    ctaBody:
      'A working prototype with demonstration data, set up for the number of locations you manage.',
  },
};

/**
 * Note the absence of `as const`: values must widen to `string`, otherwise each
 * message's type would be its own English literal and no translation could
 * satisfy it. Key completeness is still enforced, which is the property we
 * actually want.
 */
export type Messages = typeof en;
