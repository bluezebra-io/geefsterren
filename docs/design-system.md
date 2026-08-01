# GeefSterren Design System

Feedback- en verbeterplatform voor horeca, bezorgrestaurants en franchise-operators.
Dit design system bevat de volledige merkidentiteit, de designtokens, de UI-primitives en
klik-door recreaties van de drie productoppervlakken.

Interactie met de gast is Nederlands; documentatie voor het team is Nederlands, de
codecommentaren zijn Engels.

---

## 1. Context

**Wat het product doet.** Een gast scant na een bezoek of bezorging een QR-code, vult in
één minuut een korte vragenlijst in, en het bedrijf ziet: reacties, scores per onderwerp,
trends, resultaten per vestiging, AI-samenvattingen met bronvermelding, concrete
verbetersuggesties, en of een vestiging klaar is om gasten om een Google-review te vragen
(*Review Acquisition Readiness*).

**Twee publieken, één taal.**

| | Gast | Ondernemer / operator |
|---|---|---|
| Wil weten | Wat wordt gevraagd, gaat dit ergens naartoe | Is dit betrouwbaar, is dit bruikbaar |
| Tijd | 2 seconden om te begrijpen, 1 minuut om te vullen | 5 minuten per ochtend |
| Toon | Warm, kort, neutraal | Zakelijk, feitelijk, met bewijs |
| Oppervlak | Mobiel, buiten, met één hand | Desktop portal, soms mobiel |

**Positionering.** Luisteren → begrijpen → verbeteren → betere reviews verdienen. In die
volgorde. Het product belooft nooit een hogere score, alleen een beter inzicht.

**Drie productoppervlakken** (elk met een UI kit in dit systeem):
1. **Publieke feedbackflow** — mobiel, QR-instap, co-branded met het restaurant.
2. **Business portal** — multi-vestiging dashboard, feedbackoverzicht, AI-analyse, QR-beheer.
3. **Publieke website** — geefsterren.nl: consumentenhomepage, openbare vestigingspagina per locatie, en de bedrijvenpagina.
Plus **drukwerk**: QR-sticker, A6-flyer, packaging insert, zwart-wit variant.

### Bronnen

Dit systeem is opgebouwd uit **één bron: de schriftelijke merkbriefing "Claude Design
Handoff: GeefSterren Brand Identity"** die in het gesprek is meegegeven (opdracht in 28
secties, inclusief evaluatiecriteria en verbodenlijst). Er was **geen codebase, geen Figma
en geen bestaand logo** beschikbaar.

Gevolg: elk merkelement in `assets/` is nieuw ontworpen voor deze opdracht op basis van de
briefing, niet gereproduceerd uit bestaand materiaal. Levert de klant later echte assets of
een codebase, dan gelden die als waarheid en moet dit systeem daarop worden bijgesteld.

Naamgeving: de briefing noemt merk `GeefSterren` en domein `geefsterre.nl`. Dit systeem
gebruikt consequent **GeefSterren / geefsterren.nl**; zie `guidelines/brand-strategy.md`
voor de afweging en het advies.

---

## 2. Content fundamentals

**Taal en persoon.** Nederlands. Naar de gast: **je/jij**, nooit u. Naar de ondernemer:
zakelijk maar persoonlijk, ook je/jij. "Wij" alleen als het restaurant spreekt
("Waar kunnen we verbeteren?"), niet als GeefSterren spreekt.

**Casing.** Zinsvorm (sentence case) voor koppen, labels en knoppen: "Geef je mening",
"Alle feedback", "Bekijk analyse". Nooit Title Case, nooit HOOFDLETTERS behalve in de
overline (12 px, `letter-spacing: .08em`).

**Lengte.** Koppen onder 8 woorden. Zinnen onder 20 woorden. Één idee per zin. Een
uitlegblok is maximaal drie zinnen; wat langer moet, is een link.

**Interpunctie.** Geen uitroeptekens. Geen emoji — nergens, ook niet in e-mail. Geen
ellipsen als spanningsopbouw. Punt aan het eind van een volledige zin, niet achter een
label. Middenpunt (`·`) als scheiding in metaregels: "Bezorgtijd · Temperatuur · vandaag 19:12".

**Getallen.** Nederlandse notatie: komma als decimaal (`4,3`), punt als duizendscheiding
(`1.248`), procenten heel (`68%`). Één decimaal voor scores, nooit twee. Elk getal dat een
conclusie draagt komt met zijn bron: "Gebaseerd op 48 reacties."

**Knoplabels.** Werkwoord + object, imperatief: "Verstuur feedback", "Download QR",
"Bekijk analyse", "Vestiging toevoegen". Nooit "Klik hier", "Verzenden" zonder object, of
"OK".

**Wel / niet — gast**

| Wel | Niet |
|---|---|
| Hoe was je ervaring? | Geef ons vijf sterren! |
| Waar kunnen we verbeteren? | Was alles geweldig? |
| Bedankt. Je feedback is ontvangen. | Oeps! Wat jammer! |
| Wil je nog iets toelichten? (optioneel) | Weet je het zeker? |

**Wel / niet — ondernemer**

| Wel | Niet |
|---|---|
| De bezorgtijd wordt vaker negatief beoordeeld dan vorige maand. | Boost je reputatie direct. |
| Deze conclusie is gebaseerd op 48 reacties. | AI heeft dé oplossing gevonden. |
| Deze vestiging verzamelt eerst interne feedback. | Onderdruk negatieve reviews. |

**Verboden framing.** Een lage score is data, geen fout: nooit rood-alarmtaal, nooit
schuldgevoel bij de gast, nooit "helaas". De Google-uitnodiging is nooit een garantie,
nooit een filter en nooit een verplichte laatste stap. AI-uitkomsten zijn advies
("voorgestelde acties"), nooit waarheid.

**Aanmelden voor verbeteringen.** De gast meldt zich aan per vestiging, niet voor GeefSterren.
De toestemmingsregel noemt altijd de naam van de vestiging, de frequentie wordt eerlijk benoemd
("meestal een paar keer per jaar") en de afmeldbelofte staat vóór de knop. Nooit een
voorgevinkt vakje, nooit een nieuwsbrief eraan vastgeplakt, nooit "en aanbiedingen".

**Verloting.** Een vestiging kan in plaats van een directe beloning een prijs verloten. Dan geldt:
één e-mailveld, twee losse vinkjes (meedoen / op de hoogte blijven), de trekkingsdatum staat erbij,
en het scherm zegt expliciet dat meedoen aan het invullen hangt — niet aan een review en niet aan
de hoogte van de score. De verloting staat op één scherm en nergens anders in het merk.

**Vaste formuleringen** (letterlijk aanhouden):
- `Hoe was je ervaring?` — de universele CTA op elk drukwerk.
- `Scan de QR-code en deel je mening in één minuut.`
- `Feedback mogelijk gemaakt door GeefSterren` — co-brandingregel op consumentoppervlakken.
- `Deze vestiging verzamelt eerst interne feedback. Zodra de ingestelde kwaliteitscriteria zijn behaald, kan de Google-uitnodiging voor alle respondenten worden geactiveerd.`
- Ratinglabels: `1 Zeer slecht · 2 Onvoldoende · 3 Redelijk · 4 Goed · 5 Uitstekend`.
- `Blijf op de hoogte van verbeteringen` — kop van de volg-aanmelding.
- `Maak kans op een prijs` — kop bij een verloting, alleen op het afsluitscherm van de gastenflow.
- `We mailen je alleen wanneer {vestiging} een verbetering doorvoert of het resultaat ervan meet.`
- `Er is iets veranderd waar jij feedback over gaf` — onderwerp en kop van de update-e-mail.

---

## 3. Visual foundations

**Merkidee.** *Feedback wordt zichtbare voortgang.* De ster is nooit decoratie: hij staat
voor een beoordeling, een doel of iets dat verdiend is.

**Merkteken — "De Feedbackster".** Een spraakbubbel met een uitgesneden ster, tail
linksonder. Eén pad met `fill-rule: evenodd`, dus in elke enkele kleur bruikbaar en
leesbaar vanaf 16 px. Varianten in `assets/`; regels in de kaarten onder *Brand*.

**Kleur.**
- **Amber** (`#F2A93B`) is de sterkleur en de actiekleur. Nooit bodytekst — als amber tekst
  moet zijn, is het `amber-700` (`#9E5D0A`, 4,80:1).
- **Ink** (`#142334`), warm donkerblauw: alle tekst, de portalsidebar, donkere vlakken.
- **Crème** (`#F9F5ED` achtergrond, `#FFFFFF` kaart, `#F1EBDF` gedempt): warme neutralen in
  plaats van grijs. Grijs komt in het systeem niet voor.
- **Gedempt groen** = behaalde voortgang. **Beheerste koraal** = urgentie. **Kalm blauw** =
  neutrale uitleg, nooit een actie.
- Maximaal twee achtergrondkleuren per scherm en **één amber accent per scherm**.
- Rating 1–5 heeft eigen kleuren, maar die zijn het derde signaal: vorm (gevuld/omlijnd),
  cijfer en Nederlands woord gaan voor.

**Typografie.** Twee families. **Plus Jakarta Sans** (500–800) voor display, koppen en het
woordmerk, met negatieve tracking (`-0.022em` display, `-0.012em` H2/H3). **DM Sans**
(400–700) voor bodytekst, UI, tabellen en elk getal — altijd `font-variant-numeric:
tabular-nums lining-nums`. 16 px is de mobiele bodemwaarde; 14 px alleen in dichte
portal-UI; 12 px alleen voor captions en overlines. Nederlandse samenstellingen mogen
afbreken over twee regels, nooit met ellipsis worden afgekapt.

**Achtergronden.** Egale warme vlakken. Geen fotografie als drager, geen patronen, geen
texturen, geen gradients — met één uitzondering: de amber CTA-band en de ink-secties op de
marketingsite zijn egale kleurvlakken (nog steeds geen gradient). Fotografie is optioneel
en documentair (echte keukens, verpakking, personeel dat feedback bekijkt); het systeem
werkt volledig zonder.

**Kaarten.** Wit oppervlak, 1 px `--color-border` (crème-300), radius 14, `--shadow-xs`.
Elke kaart moet ook werken *zonder* schaduw — rand en oppervlakcontrast doen het werk.
Varianten: `flat` (geen schaduw), `muted` (crème vlak), `brand` (amber-50 met amber-200
rand, maximaal één per scherm, voor de aanbevolen actie), `inverse` (ink).

**Randen en radii.** 1 px standaard, 2 px voor inputs en de ratingknoppen. Radius: 6 chips,
10 knoppen en inputs, 14 kaarten, 20 modals en telefoonschermen, 28 alleen drukwerk,
pill uitsluitend voor badges en de primaire CTA in de gastenflow.

**Schaduwen.** Ink op 6–10% opaciteit, dus warm, nooit neutraal grijs. Vier stappen
(xs/sm/md/lg) plus een focus-halo. Geen inner shadows behalve `--shadow-inset-top` op
amber vlakken. Geen gloed, geen gekleurde schaduw.

**Transparantie en blur.** Alleen twee plekken: de scrim onder een modal
(`rgba(14,27,40,.52)`) en de sticky marketingheader (`blur(10px)` op crème 86%). Nergens
anders glas-effecten.

**Animatie.** 80 ms press, 140 ms hover en kleur, 200 ms statuswissel, 320 ms entree.
Standaardeasing `cubic-bezier(.2,.8,.2,1)`. Eén uitzondering: de gekozen ster schaalt
eenmalig 6% met `cubic-bezier(.34,1.4,.64,1)`. Geen confetti, geen bewegende sterren, geen
stuiterende CTA's, geen paginatransities in de gastenflow. Alles respecteert
`prefers-reduced-motion`.

**Hover en press.** Hover = donkerder worden of een crème vlak krijgen, nooit opacity en
nooit verschuiven. Press = nog een stap donkerder plus het verlies van de schaduw;
ratingknoppen krimpen 3%. Kaarten die klikbaar zijn krijgen op hover een sterkere rand en
`--shadow-sm`, geen lift van meer dan 0 px.

**Focus.** 2 px ink outline met 2 px offset, plus op formulierelementen een 3 px amber halo
(`--shadow-focus`) — leesbaar in fel zonlicht. Nooit `outline: none`.

**Layout.** Portal: ink sidebar 256 px vast, cream contentgebied, contentbreedte 1120 px
(1320 px voor tabellen en KPI-rijen), pagina-padding 28 px, kaartafstand 20 px. Gast:
één kolom van maximaal 420 px, gutter 20 px, sticky actiegebied onderaan. Alles wat naast
elkaar staat is flex of grid met `gap` — nooit inline flow met marges.

**Beeldtoon.** Als er fotografie is: warm, natuurlijk licht, echte drukte, geen
overdreven glimlach, geen laptop-op-bureau, geen luxe restaurant als enige beeld. Geen
grain, geen zwart-wit, geen koele filters.

**Illustratie.** Geen illustratiebibliotheek en geen mascotte. Lege staten zijn één Lucide
icoon in een amber schijf van 112 px met een tekst die zegt wat er gaat gebeuren.

---

## 4. Iconography

**Lucide** (ISC-licentie) is de enige iconenfamilie: outline, ~1,75–2 px lijn, ronde
uiteinden. Er is geen icoonfont, geen sprite en geen tweede set. De padgeometrie komt uit de
Lucide UMD-bundle en wordt als **inline SVG** gerenderd, zodat de lijn altijd
`currentColor` volgt. `Icon` injecteert die bundle zelf bij eerste gebruik — een
consumerende pagina hoeft geen extra scripttag toe te voegen. Cross-origin CSS-masks
worden in sommige omgevingen geblokkeerd; daarom bewust geen mask-oplossing.

```jsx
<Icon name="message-square-quote" size={20} />
```

*Substitutie-melding:* er was geen bestaande iconenset in de bronnen. Lucide is gekozen
omdat de briefing er expliciet naar verwijst ("similar visual weight to Lucide icons") en
omdat het in React triviaal te implementeren is. Wil het team zelf iconen leveren, dan
hoeft alleen `LUCIDE_URL` / `STATIC_BASE` in `components/core/Icon.jsx` te wijzen naar de eigen set.

**Vaste productset** (gebruik deze namen, verzin geen synoniemen):

| Betekenis | Lucide-naam | Betekenis | Lucide-naam |
|---|---|---|---|
| Feedback | `message-square-quote` | Beloning | `gift` |
| Score / ster | `star` | Trend omhoog | `trending-up` |
| Vestiging | `map-pin` | Trend omlaag | `trending-down` |
| QR-code | `qr-code` | Dashboard | `layout-dashboard` |
| Campagne | `megaphone` | Filter | `filter` |
| Review-gereed | `badge-check` | Periode | `calendar-days` |
| AI-analyse | `sparkles` | Export | `download` |
| Bevestigd | `circle-check` | Instellingen | `settings` |
| Aandacht | `circle-alert` | Nog niet behaald | `circle-dashed` |

**Regels.** Iconen zijn nooit de enige drager van betekenis — altijd met label of tekst.
Geen emoji, geen unicode-symbolen als icoon, geen zelfgetekende SVG's. Merkgrafiek (het
merkteken en de ster) is de enige eigen vectorvorm en staat in `assets/`.

---

## 5. Assets

| Bestand | Gebruik |
|---|---|
| `assets/logo-mark.svg` | Merkteken, amber, ster uitgesneden |
| `assets/logo-mark-ink.svg` | Merkteken in ink (lichte achtergrond, één kleur) |
| `assets/logo-mark-cream.svg` | Merkteken op ink of foto |
| `assets/logo-mark-black.svg` / `-white.svg` | Één-kleur druk en knockout |
| `assets/logo-mark-duo.svg` / `-duo-dark.svg` | Twee-tonig, voor gebruik over fotografie |
| `assets/logo-mark-tile.svg` | App-tegel, ink veld met amber merkteken |
| `assets/logo-social.svg` | Social profile, 512 × 512 |
| `assets/favicon.svg` | Favicon 32 px, leesbaar op 16 px |
| `assets/star-plain.svg` / `-ink.svg` / `-empty.svg` | Ratingster, gevuld en omlijnd |
| `assets/qr-placeholder.svg` / `-bw.svg` | **Placeholder** — géén scanbare QR-code |
| `assets/star-path.md` | De gegenereerde padstrings (merkteken, ster) |

Het woordmerk is **geen SVG**: het is Plus Jakarta Sans 800 met `letter-spacing: -0.024em`,
gezet door de `Logo`-component. Zo blijft het scherp op elk formaat en hoeft er geen
outline-versie beheerd te worden. Voor drukwerk buiten de browser: zet het woordmerk in
Plus Jakarta Sans ExtraBold en converteer naar outlines in het DTP-bestand.

---

## 6. Components

Alle componenten zijn zelfstandige React-functies die alleen React importeren en stylen via
de CSS custom properties uit `styles.css`. Per map staat een `@dsCard`-kaart met de states.

**core** — `Icon` · `Button` · `IconButton` · `Badge` · `Tag` · `Card` · `Logo` (+ `PoweredBy`)
**forms** — `Field` · `Input` · `Textarea` · `Select` · `Checkbox` · `Radio` · `Switch` · `ChoiceChip`
**feedback** — `Star` · `RatingControl` · `StarRating` · `ScorePill` · `Alert` · `Toast` · `Dialog` · `ProgressSteps` · `EmptyState` · `Skeleton`
**data** — `StatCard` · `TrendChart` · `DistributionBars` · `DataTable` · `Tabs` · `ReadinessMeter`
**navigation** — `SidebarNav`
**website** — `FeedbackCodeInput` · `StatusBadge` · `ImprovementCard` · `ImprovementTimeline` · `BeforeAfter` · `PublicMetric` · `LocationCard` · `StepFlow` · `FollowUpdates` · `TransparencyBlock` · `ExampleLabel` · `FaqList`

`RatingControl` is de productsignatuur en het enige component dat een eigen animatiebudget
heeft. `ReadinessMeter` is het enige component dat een productregel uitlegt in plaats van
data te tonen — houd de tekst daar letterlijk aan.

### Intentional additions

Er was geen bronbibliotheek die de inventaris bepaalde, dus dit is een van de briefing
afgeleide standaardset (sectie 23 van de opdracht noemt de componentenlijst). Drie
toevoegingen buiten die lijst, met reden:

- **`Icon`** — wrapper om de Lucide-glyphs zodat kleur en maat overal gelijk zijn.
- **`Logo` / `PoweredBy`** — het co-brandingvoorschrift moet in code vastliggen, niet in een
  richtlijn die iemand vergeet.
- **`ScorePill`** en **`Star`** — losgetrokken uit `RatingControl` omdat lijsten, tabellen en
  filters een score moeten kunnen tonen zonder de interactieve control.
- **`FollowUpdates`** — de aanmelding waarmee een gast bericht krijgt als de vestiging een
  verbetering doorvoert. Dit is de enige plek waar het platform een e-mailadres vraagt, dus de
  regels eromheen (dubbele opt-in, expliciete toestemming, één doel, afmelden met één klik)
  staan in de component vast in plaats van in een richtlijn.

---

## 7. UI kits

| Kit | Bestanden | Wat je ziet |
|---|---|---|
| `ui_kits/feedback-flow/` | `index.html`, `PhoneFrame.jsx`, `FeedbackFlow.jsx` | Zes gastschermen in een telefoon: welkom, beoordeling, vervolgvragen, opmerking, beloning, afronding — met schakelaars voor Google-uitnodiging en beloning |
| `ui_kits/portal/` | `index.html`, `PortalShell.jsx`, `PortalDashboards.jsx`, `PortalFeedback.jsx`, `PortalAnalysis.jsx` | Organisatiedashboard, vestigingsdashboard, feedbackoverzicht, Google-uitnodiging (readiness), AI-analyse, QR-campagnes, mobiele weergave, instellingen |
| `ui_kits/website/` | `index.html`, `SiteChrome.jsx`, `HomePage.jsx`, `LocationPage.jsx`, `BusinessPage.jsx`, `MobileViews.jsx`, `update-email.html` | Consumentenhomepage, openbare vestigingspagina (`/vestiging/{slug}`), bedrijvenpagina, mobiele weergaven inclusief alle states van de feedbackcode, en de update-e-mail die aangemelde gasten ontvangen |
| `print/` | `qr-sticker.html`, `a6-flyer.html`, `packaging-insert.html`, `bw-variant.html` | 70 × 70 mm sticker, A6 flyer, 100 × 70 mm insert, één-kleur variant |

De kits zijn recreaties op millimeter- en pixelniveau, geen storybooks: ze bouwen op de
componenten hierboven en verzinnen geen nieuwe patronen.

---

## 8. Index

```
styles.css                 enige entry — alleen @import-regels
tokens/
  fonts.css                Google Fonts import (Plus Jakarta Sans + DM Sans)
  colors.css               ramps + semantische aliassen + rating + chartkleuren
  typography.css           families, schaal, gecomponeerde tekstrollen
  layout.css               spacing, radius, elevatie, motion, maten, z-index
  base.css                 elementdefaults, links, focus, reduced motion
components/
  controls.css             knoppen, inputs, keuzes
  surfaces.css             kaarten, badges, alerts, dialog, tabs, tabel, nav, states
  rating.css               rating, sterren, score, KPI, distributie, chart, readiness
  website.css              feedbackcode, status, before/after, improvement, tijdlijn, trust
  core/ forms/ feedback/ data/ navigation/     .jsx + .d.ts + .prompt.md + kaart
guidelines/
  brand-strategy.md        Stage 1–3: strategie, drie richtingen, keuze
  contrast.json            gemeten WCAG-ratio's (bron voor de contrastkaart)
  *.card.html              specimenkaarten: Brand, Colors, Type, Spacing, Motion,
                           Accessibility, Content
assets/                    merkteken, ster, favicon, social, QR-placeholder
ui_kits/                   feedback-flow, portal, marketing
print/                     sticker, flyer, insert, zwart-wit
thumbnail.html             projecttegel
SKILL.md                   Agent Skill entry point
```

---

## 9. Tailwind & shadcn/ui

Bij implementatie in Next.js + Tailwind + shadcn/ui: neem de tokens één-op-één over als
Tailwind CSS-variabelen en laat de shadcn-primitives ernaar wijzen.

```css
:root {
  --background: #F9F5ED;          /* cream-100 */
  --foreground: #142334;          /* ink-900  */
  --card: #FFFFFF;
  --card-foreground: #142334;
  --primary: #F2A93B;             /* amber-400 */
  --primary-foreground: #142334;  /* ink op amber — nooit wit */
  --secondary: #142334;
  --secondary-foreground: #FDFBF7;
  --muted: #F1EBDF;
  --muted-foreground: #4A6580;
  --accent: #FEF6E7;
  --accent-foreground: #9E5D0A;
  --destructive: #A8402F;
  --destructive-foreground: #FFFFFF;
  --success: #24704C;
  --warning: #C77A0F;
  --info: #2A6E92;
  --border: #E8E0D2;
  --input: #D8CDB9;
  --ring: #142334;
  --radius: 0.625rem;             /* 10px — knoppen en inputs */
}
```

Kaarten overschrijven `--radius` naar `0.875rem`, modals naar `1.25rem`. Charts: Recharts
met `--color-chart-1..4`, `--color-chart-grid` en `--color-chart-axis`; geen legenda als één
serie volstaat. Iconen: `lucide-react`. Niets in dit systeem vraagt om custom rendering,
canvas of fragiele CSS-effecten — de eigenheid zit in kleur, typografie, layout, de
rating-interactie en het merkteken.

---

## 10. Accessibility

WCAG 2.2 AA is een acceptatie-eis, geen streven. Gemeten ratio's staan in
`guidelines/contrast.json` en op de kaart *Contrast table*. Verder:

- Raakvlakken minimaal 44 × 44 px, consumentacties 52 px.
- `RatingControl` is een `radiogroup`: pijltjes bewegen, Space/Enter kiest, elke optie heeft
  een label als "4 van 5 sterren, Goed".
- Elke grafiek heeft een `aria-label` met alle datapunten plus een tekstuele conclusie.
- Statussen dragen altijd een woord of icoon naast de kleur.
- Foutteksten hangen via `id` aan hun input en benoemen de oplossing.
- Tekst blijft leesbaar bij 200% zoom; niets is vastgezet op viewporthoogte.
- `prefers-reduced-motion` schakelt alle animatie uit, inclusief de skeleton-shimmer.
