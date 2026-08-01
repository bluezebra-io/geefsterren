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

  marketing: {
    heroTitle: 'Give feedback. Help your local business improve.',
    heroBody:
      'Scan the code you received, answer a few short questions, and the business learns what to fix. It takes about a minute.',
    heroCta: 'See how it works',
    forBusinesses: 'For businesses',
    signInLink: 'Sign in',
    stepsTitle: 'How your feedback helps',
    step1Title: 'Share your experience',
    step1Body: 'A few short questions about what you ordered or where you visited.',
    step2Title: 'Feedback becomes insight',
    step2Body: 'Answers from all guests are combined into themes, not single opinions.',
    step3Title: 'The business improves',
    step3Body: 'The location sees what recurs and decides what to change first.',
    step4Title: 'The result becomes visible',
    step4Body: 'Improvements are published, so you can see what your feedback changed.',
    privateTitle: 'Private by default',
    privateBody:
      'Your feedback goes to the business, not to the internet. You answer honestly because it is a conversation, not a performance.',
    adaptiveTitle: 'Questions that adapt',
    adaptiveBody:
      'A guest who had a good time is not interrogated. A lower score opens short, specific questions about what happened.',
    reviewsTitle: 'Reviews, earned first',
    reviewsBody:
      'A business only starts asking for Google reviews once its own results are good enough. Then every guest gets the same invitation.',
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
