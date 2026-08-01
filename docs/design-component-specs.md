# GeefSterren — componentspecificaties

Per component: het propcontract (TypeScript) en de gebruiksnotitie. Dit is de spec waar je op
bouwt; de bijbehorende CSS staat in `components/*.css` en de maten in `README.md` hoofdstuk 4.

De referentie-implementaties in React en de draaiende prototypes staan in het GeefSterren
design-systeemproject zelf; in dit pakket zitten ze als zelfstandige HTML in `prototypes/`.


---

# core

## Icon

Single icon glyph from Lucide, tinted with currentColor — the only icon primitive in the system.

```jsx
<Icon name="message-square-quote" size={20} />
<Icon name="qr-code" size={24} label="QR-code" />
```

Notes
- Names are Lucide kebab-case names; see the Iconography section of readme.md for the product set.
- Colour comes from the parent (`color:`), never from a prop.
- Never use an icon as the only carrier of meaning; pair it with a label.

**Props**

```ts
export interface IconProps {
  /** Lucide icon name in kebab-case, e.g. "message-square-quote", "qr-code". */
  name: string;
  /** Rendered square size in px. 16 dense UI, 20 default, 24 headers. */
  size?: number;
  /** Accessible name. Omit for decorative icons (they get aria-hidden). */
  label?: string;
  className?: string;
  style?: React.CSSProperties;
}
export declare function Icon(props: IconProps): JSX.Element;
```

## Button

The action primitive. One primary button per view; everything else is secondary, outline or ghost.

```jsx
<Button variant="primary" size="lg" block pill>Geef je mening</Button>
<Button variant="outline" iconLeft="download">Download QR</Button>
```

Notes
- `primary` is amber with ink text (7.97:1) — never white text on amber.
- In the portal, `secondary` (ink) is the default confirm; amber is saved for the one action you actually want clicked.
- `pill` only in the consumer flow. Labels are imperative and short: "Verstuur feedback", not "Klik hier om te versturen".

**Props**

```ts
export interface ButtonProps {
  children?: React.ReactNode;
  /** primary = amber, the single most wanted action. secondary = ink, portal default.
   *  outline / ghost = supporting. danger = destructive only. on-dark = over ink surfaces. */
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "on-dark";
  /** md is 44px and the default. lg (52px) is for consumer-flow primary actions. */
  size?: "sm" | "md" | "lg";
  block?: boolean;
  /** Pill radius. Reserved for the consumer feedback flow. */
  pill?: boolean;
  iconLeft?: string;
  iconRight?: string;
  loading?: boolean;
  disabled?: boolean;
  href?: string;
  type?: "button" | "submit" | "reset";
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
}
export declare function Button(props: ButtonProps): JSX.Element;
```

## IconButton

Square 44px icon-only button for toolbars, table rows and dialog dismissal.

```jsx
<IconButton icon="x" label="Sluiten" />
<IconButton icon="ellipsis-vertical" label="Meer acties" variant="outline" />
```

Notes
- `label` is mandatory. Never hide a primary product state behind an icon-only control.
- `size="sm"` (36px) is desktop-only; keep 44px on touch surfaces.

**Props**

```ts
export interface IconButtonProps {
  /** Lucide icon name. */
  icon: string;
  /** Required — becomes both aria-label and tooltip. Icons never stand alone silently. */
  label: string;
  size?: "sm" | "md";
  variant?: "ghost" | "outline" | "on-dark";
  onClick?: (e: React.MouseEvent) => void;
  disabled?: boolean;
  className?: string;
}
export declare function IconButton(props: IconButtonProps): JSX.Element;
```

## Badge

Compact status label for campaign, location and readiness states.

```jsx
<Badge tone="success" dot>Actief</Badge>
<Badge tone="warning" icon="clock">Wachtend op data</Badge>
```

Notes
- Always carries a word. A coloured dot alone is not a state.
- Keep the vocabulary fixed per surface: Actief / Gepauzeerd / Concept / In opbouw.

**Props**

```ts
export interface BadgeProps {
  children?: React.ReactNode;
  /** Status tone. `brand` is amber and means "active campaign", not "good". */
  tone?: "neutral" | "brand" | "success" | "warning" | "error" | "info" | "outline";
  icon?: string;
  /** Leading dot instead of an icon. */
  dot?: boolean;
  size?: "sm" | "lg";
  className?: string;
}
export declare function Badge(props: BadgeProps): JSX.Element;
```

## Tag

Removable descriptor for themes, categories and active filters.

```jsx
<Tag icon="filter" onRemove={clear}>Bezorgtijd</Tag>
```

Notes
- Tag = content descriptor, Badge = state. Do not mix them in one row.

**Props**

```ts
export interface TagProps {
  children?: React.ReactNode;
  tone?: "neutral" | "brand";
  icon?: string;
  /** Renders the remove affordance. Used for active filters in the feedback overview. */
  onRemove?: () => void;
  className?: string;
}
export declare function Tag(props: TagProps): JSX.Element;
```

## Card

The container for everything in the portal: KPI blocks, charts, comment lists, panels.

```jsx
<Card title="Scoreverdeling" subtitle="Laatste 30 dagen" action={<IconButton icon="download" label="Export" />}>
  <DistributionBars counts={[2, 4, 9, 31, 62]} />
</Card>
```

Notes
- 14px radius, 1px cream border, whisper-thin shadow. Never stack a raised card inside a raised card.
- `tone="brand"` marks a single recommendation or next action — at most one per screen.

**Props**

```ts
export interface CardProps {
  children?: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Top-right slot: usually an IconButton or a small ghost Button. */
  action?: React.ReactNode;
  footer?: React.ReactNode;
  /** flat drops the shadow, muted/brand/inverse change the surface. */
  tone?: "default" | "flat" | "muted" | "brand" | "inverse";
  raised?: boolean;
  interactive?: boolean;
  /** Set false to lay out the body yourself (tables, charts, lists). */
  padded?: boolean;
  className?: string;
}
export declare function Card(props: CardProps): JSX.Element;
```

## Logo

The GeefSterren logo system, geometry inlined — no asset paths to resolve.

```jsx
<Logo variant="horizontal" size={32} />
<Logo variant="mark" size={24} tone="cream" />
<PoweredBy />
```

Notes
- Clear space equals the width of the bubble tail (mark size x 0.25) on all sides.
- Minimum sizes: mark 20px / 6mm, horizontal lockup 24px mark height / 18mm wide.
- In the consumer flow the restaurant leads; GeefSterren appears only as `<PoweredBy />`.
- Never re-colour the wordmark per customer, never outline it, never set it in another typeface.

**Props**

```ts
export interface LogoProps {
  /** horizontal = primary lockup. stacked = square placements. mark = icon only. wordmark = type only. */
  variant?: "horizontal" | "stacked" | "mark" | "wordmark";
  /** Height of the mark in px; the wordmark scales from it. Minimum 20 for the mark, 24 for lockups. */
  size?: number;
  /** brand = amber mark. ink = one-colour dark. cream = for ink surfaces. mono = inherits currentColor (print, fax, single-colour). */
  tone?: "brand" | "ink" | "cream" | "mono";
  /** Two-tone mark: amber bubble with an ink star instead of a knocked-out star. Use over photography. */
  duo?: boolean;
  className?: string;
}
export declare function Logo(props: LogoProps): JSX.Element;
export interface PoweredByProps { tone?: "muted" | "cream"; size?: number }
/** Co-branding line for consumer surfaces: "Feedback mogelijk gemaakt door GeefSterren". */
export declare function PoweredBy(props: PoweredByProps): JSX.Element;
```

---

# forms

## Field

Label + help + error wrapper around any form control. Every input in the system sits in one.

```jsx
<Field label="E-mailadres" htmlFor="email" optional help="Alleen gebruikt om je beloning te sturen.">
  <Input id="email" type="email" aria-describedby="email-help" />
</Field>
```

Notes
- Error text always names the fix ("Vul een geldig e-mailadres in"), never blames.
- Mark optional fields; assume the rest is required.

**Props**

```ts
export interface FieldProps {
  label?: React.ReactNode;
  /** id of the control inside — wires label, help text and error message together. */
  htmlFor?: string;
  /** Appends "(optioneel)". GeefSterren marks optional fields, never required ones. */
  optional?: boolean;
  help?: React.ReactNode;
  /** When set, help is replaced by the error and the control should get aria-invalid. */
  error?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}
export declare function Field(props: FieldProps): JSX.Element;
```

## Input

Single-line text input, 44px tall, white on cream.

```jsx
<Input icon="search" placeholder="Zoek in feedback" />
```

Notes
- Focus is a 2px ink border plus a 3px amber halo — visible in bright outdoor light.
- `size="sm"` is for dense portal toolbars only.

**Props**

```ts
export interface InputProps {
  /** Lucide name for a leading icon. Used for search and for e-mail/phone inputs. */
  icon?: string;
  size?: "sm" | "md";
  invalid?: boolean;
  type?: string;
  value?: string;
  placeholder?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  id?: string;
  className?: string;
}
export declare function Input(props: InputProps): JSX.Element;
```

## Textarea

Free-text field — the optional comment step in the consumer flow and internal notes in the portal.

```jsx
<Textarea placeholder="Bijvoorbeeld: de bezorging duurde langer dan verwacht" maxLength={500} showCount />
```

Notes
- Placeholders show an example answer, never an instruction.
- Never required in the consumer flow.

**Props**

```ts
export interface TextareaProps {
  value?: string;
  maxLength?: number;
  /** Shows "0 / 500" under the field. Only when a limit genuinely applies. */
  showCount?: boolean;
  invalid?: boolean;
  rows?: number;
  placeholder?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  id?: string;
  className?: string;
}
export declare function Textarea(props: TextareaProps): JSX.Element;
```

## Select

Native select with a GeefSterren chevron. Used for location, period and channel filters.

```jsx
<Select options={["Alle vestigingen", "Amsterdam Centrum", "Utrecht Oost"]} />
```

Notes
- Native on purpose: works on old phones and with screen readers out of the box.
- Filter selects show the widest option first ("Alle vestigingen") so the default reads as unfiltered.

**Props**

```ts
export interface SelectOption { value: string; label: string }
export interface SelectProps {
  options?: (SelectOption | string)[];
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  id?: string;
  disabled?: boolean;
  className?: string;
}
export declare function Select(props: SelectProps): JSX.Element;
```

## Checkbox

Multi-select control for portal settings and consent.

```jsx
<Checkbox label="Stuur mij een wekelijkse samenvatting" description="Elke maandag om 08:00." checked={on} onChange={toggle} />
```

Notes
- Row height is 44px including the label — the whole row is the target.
- In the consumer flow use ChoiceChip instead; checkboxes read as paperwork.

**Props**

```ts
export interface CheckboxProps {
  label: React.ReactNode;
  /** Second line in muted type — explain consequences, not the obvious. */
  description?: React.ReactNode;
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  name?: string;
  value?: string;
  className?: string;
}
export declare function Checkbox(props: CheckboxProps): JSX.Element;
```

## Radio

Single choice from a short list. In the portal: manual vs automatic review activation.

```jsx
<Radio name="mode" label="Automatisch activeren" description="Zodra alle criteria zijn behaald." checked />
<Radio name="mode" label="Handmatig activeren" />
```

Notes
- Two to four options. More than four becomes a Select.
- Always pre-select the safest default and say what it does.

**Props**

```ts
export interface RadioProps {
  label: React.ReactNode;
  description?: React.ReactNode;
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  /** Required — radios only make sense inside a named group. */
  name: string;
  value?: string;
  className?: string;
}
export declare function Radio(props: RadioProps): JSX.Element;
```

## Switch

Immediate on/off for a live setting — campaign active, Google invitation on.

```jsx
<Switch id="google" label="Google-uitnodiging actief" checked={on} onChange={toggle} />
```

Notes
- On is green (state achieved), not amber. Amber means "action".
- Switch = takes effect now. If it needs saving, use a Checkbox in a form.

**Props**

```ts
export interface SwitchProps {
  label?: React.ReactNode;
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  id?: string;
  className?: string;
}
export declare function Switch(props: SwitchProps): JSX.Element;
```

## ChoiceChip

The consumer flow answer control: tappable pill for "Waar kunnen we verbeteren?".

```jsx
<div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
  {["Bezorgtijd", "Temperatuur", "Smaak"].map(t => <ChoiceChip key={t} selected={picked.includes(t)} onClick={() => toggle(t)}>{t}</ChoiceChip>)}
</div>
```

Notes
- Selected state is ink fill + check mark: readable without colour vision.
- 44px minimum height. Lay chips out with flex-wrap and an 8px gap, never inline.

**Props**

```ts
export interface ChoiceChipProps {
  children?: React.ReactNode;
  selected?: boolean;
  /** Optional leading icon, replaced by a check mark when selected. */
  icon?: string;
  onClick?: () => void;
  className?: string;
}
export declare function ChoiceChip(props: ChoiceChipProps): JSX.Element;
```

---

# feedback

## Star

The star glyph itself. Use it directly only for decoration; ratings go through RatingControl or StarRating.

```jsx
<Star size={20} />
<Star filled={false} size={20} />
```

Notes
- Filled vs outlined is a shape difference on purpose: an empty star must be recognisable in greyscale.

**Props**

```ts
export declare const STAR_PATH: string;
export interface StarProps {
  /** false renders the outlined star — the shape difference is what carries meaning, not the colour. */
  filled?: boolean;
  size?: number;
  className?: string;
}
export declare function Star(props: StarProps): JSX.Element;
```

## RatingControl

The product signature: the 1-5 rating. Every rating in GeefSterren uses this component.

```jsx
<RatingControl size="lg" value={score} onChange={setScore} legend="Hoe beoordeel je jouw ervaring?" />
```

Notes
- Four signals per option: filled/outlined star shape, amber fill, the numeral, and the Dutch label. Colour alone never carries the score.
- Keyboard: it is a radiogroup; arrow keys move, Space/Enter selects. Targets are >=44px and stretch to the row width.
- A low score is neutral. Never react with "Oeps!" or ask the user to reconsider — follow up with a helpful question instead.
- Animation is one 6% scale step on the chosen star, 200ms, and nothing else.

**Props**

```ts
export interface RatingControlProps {
  /** 0 = nothing chosen yet. Never pre-select a score. */
  value?: number;
  onChange?: (value: number) => void;
  /** Dutch labels, 1..5. Default: Zeer slecht / Onvoldoende / Redelijk / Goed / Uitstekend. */
  labels?: string[];
  /** lg for the consumer rating screen, md for embedded questions, compact for portal previews. */
  size?: "compact" | "md" | "lg";
  /** Accessible group name — usually the question itself. */
  legend?: string;
  showCaption?: boolean;
  name?: string;
  className?: string;
}
export declare const RATING_LABELS: string[];
export declare function RatingControl(props: RatingControlProps): JSX.Element;
```

## StarRating

Read-only star row for lists, tables and KPI cards.

```jsx
<StarRating value={4.3} count={128} />
<StarRating value={2} size="sm" showValue={false} />
```

Notes
- Never interactive. If it can be clicked it must be a RatingControl.
- Decimal comma, one decimal: 4,3 — never 4.3 or 4,30.

**Props**

```ts
export interface StarRatingProps {
  /** Average or single score, e.g. 4.3. Rendered with a Dutch decimal comma. */
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  /** Shows the numeric value next to the stars. Keep true in data contexts. */
  showValue?: boolean;
  /** Response count, announced to screen readers. */
  count?: number;
  className?: string;
}
export declare function StarRating(props: StarRatingProps): JSX.Element;
```

## ScorePill

Score as a labelled pill: colour dot + numeral + word. The colour is the third signal, never the first.

```jsx
<ScorePill score={2} />
<ScorePill score={4.2} label="Gemiddeld" />
```

Notes
- Use in feedback rows and filters where a full star row would be noise.
- The dot carries a 1px dark border so it stays visible on white and on cream.

**Props**

```ts
export interface ScorePillProps {
  /** 1..5. Decimals are allowed for averages. */
  score: number;
  /** Overrides the default Dutch rating label. */
  label?: string;
  showLabel?: boolean;
  className?: string;
}
export declare function ScorePill(props: ScorePillProps): JSX.Element;
```

## Alert

Inline explanation attached to a screen or a form. The place where GeefSterren explains its own logic in plain language.

```jsx
<Alert tone="info" title="Nog geen Google-uitnodiging actief">
  Deze vestiging verzamelt eerst interne feedback.
</Alert>
```

Notes
- Icon + tone + a written sentence. Never a bare coloured strip.
- `warning` is amber-on-cream, `error` coral. Neither is used to describe a low customer score — a low score is data, not an error.

**Props**

```ts
export interface AlertProps {
  children?: React.ReactNode;
  tone?: "info" | "success" | "warning" | "error" | "neutral";
  title?: React.ReactNode;
  /** Override the default Lucide icon for the tone. */
  icon?: string;
  /** Inline action, usually a ghost Button. */
  action?: React.ReactNode;
  className?: string;
}
export declare function Alert(props: AlertProps): JSX.Element;
```

## Toast

Transient confirmation on an ink surface — QR downloaded, settings saved.

```jsx
<Toast title="QR-code gedownload" onDismiss={close}>sticker-amsterdam-centrum.pdf</Toast>
```

Notes
- Confirms something the user did. Never used to celebrate a customer score.
- Slides up 8px over 320ms once; no bounce, no confetti.

**Props**

```ts
export interface ToastProps {
  title?: React.ReactNode;
  children?: React.ReactNode;
  tone?: "success" | "error" | "brand" | "info";
  onDismiss?: () => void;
  className?: string;
}
export declare function Toast(props: ToastProps): JSX.Element;
```

## Dialog

Modal for a decision that needs confirming — activating public review invitations, deleting a campaign.

```jsx
<Dialog title="Google-uitnodiging activeren?" onClose={close}
  footer={<><Button variant="ghost" onClick={close}>Annuleren</Button><Button variant="secondary">Activeren</Button></>}>
  Alle respondenten krijgen vanaf nu dezelfde uitnodiging, ongeacht hun score.
</Dialog>
```

Notes
- Portal only; the consumer flow never opens a modal.
- State the consequence in the body, in one sentence, before the buttons.

**Props**

```ts
export interface DialogProps {
  open?: boolean;
  title?: React.ReactNode;
  children?: React.ReactNode;
  /** Right-aligned action row. Confirm last, cancel as a ghost Button. */
  footer?: React.ReactNode;
  onClose?: () => void;
  /** CSS max-width override; default 32rem. */
  width?: string | number;
  className?: string;
}
export declare function Dialog(props: DialogProps): JSX.Element;
```

## ProgressSteps

Slim progress bar for the consumer flow. Shows how short the questionnaire is.

```jsx
<ProgressSteps step={2} total={4} />
```

Notes
- 6px amber bar plus "2/4". Numbers matter more than the bar on a phone.
- Never show progress the user cannot finish; the optional comment step counts as a step.

**Props**

```ts
export interface ProgressStepsProps {
  /** Current step, 1-based. */
  step: number;
  total: number;
  /** Accessible label; defaults to "Stap x van y". */
  label?: string;
  className?: string;
}
export declare function ProgressSteps(props: ProgressStepsProps): JSX.Element;
```

## EmptyState

What a new location or a filtered list looks like before there is data.

```jsx
<EmptyState icon="qr-code" title="Nog geen reacties"
  action={<Button variant="primary" iconLeft="qr-code">QR-code maken</Button>}>
  Zodra gasten de QR-code scannen verschijnen hun reacties hier.
</EmptyState>
```

Notes
- Say what will happen, then offer the one action that makes it happen.
- No mascots, no illustrations of celebrating people. An icon in an amber disc is the whole art direction.

**Props**

```ts
export interface EmptyStateProps {
  /** Lucide icon inside the amber disc. */
  icon?: string;
  title?: React.ReactNode;
  children?: React.ReactNode;
  /** Usually one Button that starts the missing thing. */
  action?: React.ReactNode;
  className?: string;
}
export declare function EmptyState(props: EmptyStateProps): JSX.Element;
```

## Skeleton

Loading placeholder in cream tones — matches the surface it replaces.

```jsx
<Skeleton height={38} width={120} />
<Skeleton lines={3} />
```

Notes
- Mirror the real layout. A KPI card skeleton is a small label bar plus a big value bar.
- The shimmer stops under prefers-reduced-motion.

**Props**

```ts
export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  radius?: string | number;
  /** More than 1 renders a paragraph block; the last line is shortened. */
  lines?: number;
  className?: string;
  style?: React.CSSProperties;
}
export declare function Skeleton(props: SkeletonProps): JSX.Element;
```

---

# data

## StatCard

KPI block for the organisation and location dashboards.

```jsx
<StatCard label="Gemiddelde score" value="4,3" icon="star" delta="+0,2" deltaDirection="up"
  footnote="Op basis van 412 reacties in 30 dagen" />
```

Notes
- Numbers use DM Sans tabular figures and Dutch formatting: comma decimals, dot thousands.
- A delta without a period reference is meaningless — always fill the footnote.
- Four KPI cards per row maximum; five is dashboard clutter.

**Props**

```ts
export interface StatCardProps {
  label: React.ReactNode;
  /** The number itself, already formatted Dutch (4,3 / 1.248 / 68%). */
  value: React.ReactNode;
  unit?: React.ReactNode;
  icon?: string;
  /** Change vs the previous period, e.g. "+0,3". Always paired with a direction icon. */
  delta?: React.ReactNode;
  deltaDirection?: "up" | "down" | "flat";
  /** The evidence line: "Op basis van 48 reacties". */
  footnote?: React.ReactNode;
  children?: React.ReactNode;
  tone?: "default" | "flat" | "muted" | "brand";
  className?: string;
}
export declare function StatCard(props: StatCardProps): JSX.Element;
```

## TrendChart

The only line chart in the system: one amber series over a cream band.

```jsx
<TrendChart title="Gemiddelde score per week" min={1} max={5}
  data={[{label:"wk 18",value:3.9},{label:"wk 19",value:4.1},{label:"wk 20",value:4.3}]}
  note="De score stijgt sinds week 19, vooral door hogere waardering voor bezorgtijd." />
```

Notes
- The whole SVG carries an aria-label listing every point; charts are never image-only.
- The last point is an ink dot: "where you are now" without needing a legend.
- No 3D, no donuts, no dual axes. If two series are unavoidable, the second is ink, not a new hue.

**Props**

```ts
export interface TrendPoint { label: string; value: number }
export interface TrendChartProps {
  data?: TrendPoint[];
  /** Axis bounds. Score trends use 1..5; percentages 0..100. */
  min?: number;
  max?: number;
  height?: number;
  /** Plain-language title: "Gemiddelde score per week", not "Score trend analysis". */
  title?: React.ReactNode;
  /** One-sentence interpretation shown under the chart. */
  note?: React.ReactNode;
  unit?: string;
  /** Adds a text equivalent of the last data point for screen readers and print. */
  showTable?: boolean;
  className?: string;
}
export declare function TrendChart(props: TrendChartProps): JSX.Element;
```

## DistributionBars

Rating distribution, 5 at the top. The one chart that shows where the pain is.

```jsx
<DistributionBars counts={[3, 6, 18, 74, 121]} />
```

Notes
- Every row shows numeral + star + word + count + percentage. Colour is decoration on top of that.
- Order is always 5 to 1, so the eye lands on the best case first and the tail is visible below.

**Props**

```ts
export interface DistributionBarsProps {
  /** Response counts for scores 1..5, in that order. */
  counts?: number[];
  labels?: string[];
  /** Hide the Dutch words in tight layouts — the numeral and star stay. */
  showLabels?: boolean;
  className?: string;
}
export declare function DistributionBars(props: DistributionBarsProps): JSX.Element;
```

## DataTable

Table for locations, campaigns and feedback rows.

```jsx
<DataTable columns={[{key:"name",header:"Vestiging"},{key:"score",header:"Score",align:"right"}]} rows={rows} onRowClick={open} />
```

Notes
- Uppercase 12px headers on cream, 14px body, 16px cell padding. Row hover is a cream tint, not a border.
- Max 6 columns on desktop; on mobile the table becomes a card list, not a horizontal scroller.

**Props**

```ts
export interface DataColumn {
  key: string;
  header: React.ReactNode;
  width?: string | number;
  /** right-aligns and switches on tabular figures — use for every number column. */
  align?: "left" | "right";
  render?: (row: any) => React.ReactNode;
}
export interface DataTableProps {
  columns?: DataColumn[];
  rows?: any[];
  onRowClick?: (row: any) => void;
  /** Pagination or a summary line, rendered under the table inside the card. */
  footer?: React.ReactNode;
  className?: string;
}
export declare function DataTable(props: DataTableProps): JSX.Element;
```

## Tabs

Section switch inside a portal screen — Alle feedback / Met opmerking / Lage scores.

```jsx
<Tabs value={tab} onChange={setTab} tabs={[{id:"all",label:"Alle",count:412},{id:"low",label:"Lage scores",count:23}]} />
```

Notes
- The active tab is marked by a 3px amber underline plus ink text, never by colour alone.
- Counts belong in the tab; they tell the operator where to look first.

**Props**

```ts
export interface TabItem { id: string; label: React.ReactNode; count?: number }
export interface TabsProps {
  tabs?: (TabItem | string)[];
  value?: string;
  onChange?: (id: string) => void;
  className?: string;
}
export declare function Tabs(props: TabsProps): JSX.Element;
```

## ReadinessMeter

Review Acquisition Readiness, explained rather than implied: status, progress and every criterion with its measured value.

```jsx
<ReadinessMeter status="collecting" progress={75} window="laatste 60 dagen" mode="Automatisch"
  criteria={[{label:"Aantal reacties",value:48,target:50,met:false},{label:"Gemiddelde score",value:"4,3",target:"4,0",met:true}]} />
```

Notes
- Every criterion shows measured value AND threshold. Nothing about this feature is hidden.
- Never describe it as suppressing reviews. The wording is: first collect internal feedback, then invite every respondent equally.
- Amber fill while collecting, green when active. The icon (dashed circle vs check) repeats the state without colour.

**Props**

```ts
export interface ReadinessCriterion {
  label: string;
  /** Current measured value, formatted. */
  value: string | number;
  /** Configured threshold, formatted. */
  target: string | number;
  met: boolean;
}
export interface ReadinessMeterProps {
  status?: "collecting" | "active" | "paused";
  /** 0..100 — share of criteria met. */
  progress?: number;
  criteria?: ReadinessCriterion[];
  /** Measurement window in plain words, e.g. "laatste 60 dagen". */
  window?: string;
  /** "Automatisch" or "Handmatig". */
  mode?: string;
  className?: string;
}
export declare function ReadinessMeter(props: ReadinessMeterProps): JSX.Element;
```

---

# navigation

## SidebarNav

The portal sidebar: ink surface, cream labels, amber icon on the current page.

```jsx
<SidebarNav active="dashboard" onSelect={go} header={<Logo tone="cream" size={28} />}
  groups={[{items:[{id:"dashboard",label:"Dashboard",icon:"layout-dashboard"},{id:"feedback",label:"Feedback",icon:"message-square-quote",count:412}]}]} />
```

Notes
- Ink sidebar, cream content area: the only place the system inverts.
- Group titles are uppercase 12px at 50% cream. Keep to two groups; a third means the portal is doing too much.

**Props**

```ts
export interface NavItem { id: string; label: string; icon: string; count?: number }
export interface NavGroup { title?: string; items: NavItem[] }
export interface SidebarNavProps {
  groups?: NavGroup[];
  active?: string;
  onSelect?: (id: string) => void;
  /** Logo lockup slot, top of the sidebar. */
  header?: React.ReactNode;
  /** Account / location switcher slot, pinned to the bottom. */
  footer?: React.ReactNode;
  className?: string;
}
export declare function SidebarNav(props: SidebarNavProps): JSX.Element;
```

---

# website

## FeedbackCodeInput

The homepage primary action: enter the code printed next to the QR.

```jsx
<FeedbackCodeInput value={code} onChange={setCode} onSubmit={check} state={state} />
```

Notes
- 52px field, 20px bold tracked type — usable with one thumb.
- The error never reveals why a code failed ("niet geldig of niet meer actief"), so campaign structure stays private.
- Help text names the four physical places a code appears. Keep it; it is the difference between confusion and a scan.

**Props**

```ts
export interface FeedbackCodeInputProps {
  value?: string;
  /** Receives the uppercased value — codes are always shown uppercase. */
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  /** idle | loading | invalid | success. Drives the button and the message below the field. */
  state?: "idle" | "loading" | "invalid" | "success";
  placeholder?: string;
  label?: string;
  help?: string;
  error?: string;
  id?: string;
  className?: string;
}
export declare function FeedbackCodeInput(props: FeedbackCodeInputProps): JSX.Element;
```

## StatusBadge

Status of one improvement, on the public location page and in the portal.

```jsx
<StatusBadge status="measured" />
```

Notes
- Four states only, always the same Dutch words. Label first, icon second, colour third.
- Never celebratory. "Doorgevoerd" is normal operational work, not an achievement.

**Props**

```ts
export interface StatusBadgeProps {
  /** The four improvement states, in order: Gepland, In uitvoering, Doorgevoerd, Resultaat gemeten. */
  status?: "planned" | "progress" | "done" | "measured";
  /** Override the Dutch label. Only for edge cases; the vocabulary is meant to be fixed. */
  label?: string;
  className?: string;
}
export declare const IMPROVEMENT_STATUS: Record<string, { label: string; icon: string; cls: string }>;
export declare function StatusBadge(props: StatusBadgeProps): JSX.Element;
```

## ImprovementCard

One entry in the improvement log: problem, action, date, status, and — only when measured — a result.

```jsx
<ImprovementCard status="measured" title="Nieuwe warmhoudverpakking"
  problem="Klanten gaven aan dat warme gerechten soms te veel afkoelden tijdens bezorging."
  action="Sinds 14 juli gebruikt deze vestiging nieuwe isolerende verpakkingen."
  result="Na de aanpassing steeg de score voor temperatuur van 3,4 naar 4,2."
  date="Doorgevoerd op 14 juli 2026" />
```

Notes
- The two labelled blocks ("Wat klanten aangaven" / "Wat de vestiging deed") are fixed copy — they are what make the page readable as a loop instead of a brag.
- No result field until the data exists. An empty result is more trustworthy than a hopeful one.

**Props**

```ts
export interface ImprovementCardProps {
  title: React.ReactNode;
  /** What customers reported — the reason the change exists. */
  problem?: React.ReactNode;
  /** What the business actually changed, concretely. */
  action?: React.ReactNode;
  /** Implementation date in Dutch long form: "Sinds 14 juli 2026". */
  date?: React.ReactNode;
  status?: "planned" | "progress" | "done" | "measured";
  /** Measured outcome, phrased as sequence rather than causation. Omit until measured. */
  result?: React.ReactNode;
  className?: string;
}
export declare function ImprovementCard(props: ImprovementCardProps): JSX.Element;
```

## ImprovementTimeline

Chronological rail of what a location changed. Use next to, not instead of, ImprovementCard.

```jsx
<ImprovementTimeline items={[{title:"Kleiner bezorggebied op piekmomenten",status:"progress",date:"Sinds 1 augustus 2026"}]} />
```

Notes
- The dot repeats the status icon, so the rail is readable without colour.
- Keep entries operational and specific. "Betere service" is not an improvement.

**Props**

```ts
export interface TimelineItem {
  title: string;
  text?: string;
  /** Dutch date line: "14 juli 2026". */
  date?: string;
  status?: "planned" | "progress" | "done" | "measured";
}
export interface ImprovementTimelineProps {
  /** Newest first. Four to six entries; older ones move to an archive link. */
  items?: TimelineItem[];
  className?: string;
}
export declare function ImprovementTimeline(props: ImprovementTimelineProps): JSX.Element;
```

## BeforeAfter

The evidence unit of the public site: one metric, before and after an improvement.

```jsx
<BeforeAfter label="Bestellingen op tijd" from="71" to="89" unit="%" progress={89}
  note="Gemeten over 84 reacties, 90 dagen voor en na 14 juli" />
```

Notes
- The old value is struck through and muted; the new value is the large one. No arrows that scream growth.
- `note` is not optional in practice. A before/after without a period and a response count is a marketing claim.
- Never write causation ("de verpakking zorgde voor +24%"). Write sequence ("na de aanpassing verbeterde de score").

**Props**

```ts
export interface BeforeAfterProps {
  /** Plain-language metric name: "Bestellingen op tijd", "Score temperatuur". */
  label: React.ReactNode;
  /** Value before the change, already formatted Dutch. */
  from: string | number;
  /** Value after the change. */
  to: string | number;
  unit?: string;
  /** The context line that keeps it honest: period and response count. */
  note?: React.ReactNode;
  /** 0-100; renders a bar for the "after" value. Omit for score metrics. */
  progress?: number;
  className?: string;
}
export declare function BeforeAfter(props: BeforeAfterProps): JSX.Element;
```

## PublicMetric

Summary number on a public page. Never a star average as the single dominant metric.

```jsx
<PublicMetric icon="message-square-quote" value="84" label="reacties"
  context="In de afgelopen 90 dagen" />
```

Notes
- Public metrics lead with volume and improvement, not with score.
- No metric without its period and its base.

**Props**

```ts
export interface PublicMetricProps {
  value: React.ReactNode;
  label: React.ReactNode;
  /** Mandatory in practice: "Gebaseerd op 84 reacties · laatste 90 dagen". */
  context?: React.ReactNode;
  icon?: string;
  className?: string;
}
export declare function PublicMetric(props: PublicMetricProps): JSX.Element;
```

## LocationCard

A public improvement update from one business, used in the "Lokale bedrijven die luisteren" grid.

```jsx
<LocationCard name="Bakkerij Van Dijk" city="Leiden" href="#/vestiging/bakkerij-van-dijk"
  topic="Klanten vroegen om duidelijkere informatie over allergenen."
  change="De allergeneninformatie staat nu op de productkaartjes en de bestelpagina."
  date="Bijgewerkt op 22 juli 2026" />
```

Notes
- No score, no stars, no ranking. This grid is not a leaderboard.
- Two sentences: what customers asked, what changed. Anything longer belongs on the location page.

**Props**

```ts
export interface LocationCardProps {
  name: React.ReactNode;
  city?: React.ReactNode;
  /** Two letters in the avatar tile; derived from name when omitted. */
  initials?: string;
  /** What customers asked for, in their terms. */
  topic?: React.ReactNode;
  /** What changed as a result. */
  change?: React.ReactNode;
  date?: React.ReactNode;
  /** Renders the card as a link to /vestiging/{slug}. */
  href?: string;
  status?: "planned" | "progress" | "done" | "measured";
  className?: string;
}
export declare function LocationCard(props: LocationCardProps): JSX.Element;
```

## StepFlow

The Feedback → Inzicht → Verbetering → Resultaat progression. Three to six steps, never a process diagram.

```jsx
<StepFlow brandLast steps={[{title:"Deel je ervaring",icon:"message-square-quote",text:"..."}]} />
```

Notes
- Numbers are ink circles; only the payoff step may be amber.
- One sentence per step. If a step needs two, it is two steps.

**Props**

```ts
export interface FlowStep { title: string; text?: string; icon?: string }
export interface StepFlowProps {
  steps?: FlowStep[];
  /** Grid columns; defaults to one per step. Set 2 for mobile-ish layouts. */
  columns?: number;
  arrows?: boolean;
  /** Amber number on the final step — use when the last step is the payoff. */
  brandLast?: boolean;
  className?: string;
}
export declare function StepFlow(props: StepFlowProps): JSX.Element;
```

## FollowUpdates

Sign-up so a customer hears about improvements they helped cause. Closes the feedback loop.

```jsx
<FollowUpdates locationName="Restaurant De Haven" email={mail} onEmailChange={e => setMail(e.target.value)}
  consent={ok} onConsentChange={setOk} onSubmit={subscribe} state={state} />
```

Notes
- Double opt-in by default: submitting moves to `state="pending"`, which asks the user to confirm by mail.
- The consent checkbox is required and single-purpose. No pre-ticked box, no bundled newsletter, no "en aanbiedingen".
- Say the frequency honestly ("meestal een paar keer per jaar") and show the unsubscribe promise before the button, not after.
- With `raffle` it also runs the prize draw: one e-mail field, two separate consent checkboxes.
  Submitting needs at least one of them. Never bundle "meedoen met de verloting" and "houd mij op
  de hoogte" behind a single tick — they are different purposes.
- The raffle panel always states the draw date and that entry is unrelated to the score or to a
  public review. A prize is never the reason the brand exists; it is a footnote on one screen.
- Three places it belongs: the closing step of the feedback flow (with or without raffle), the public location page, and the improvements overview. Nowhere else.

**Props**

```ts
export interface FollowUpdatesProps {
  /** Name used in the copy and the consent line, e.g. "Restaurant De Haven". */
  locationName?: string;
  email?: string;
  onEmailChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit?: (email: string) => void;
  /** idle | loading | pending (double opt-in mail sent) | error. */
  state?: "idle" | "loading" | "pending" | "error";
  /** Explicit consent checkbox. Submitting is blocked until it is true. */
  consent?: boolean;
  onConsentChange?: (checked: boolean) => void;
  /** Optional prize draw. Adds a dashed prize panel and a SECOND, separate consent checkbox.
   *  One e-mail address, two purposes, two ticks — never one tick for both. */
  raffle?: { prize: string; drawDate?: string; entries?: string; terms?: string } | null;
  raffleConsent?: boolean;
  onRaffleConsentChange?: (checked: boolean) => void;
  /** Button label; change it when the raffle is the main reason to submit. */
  submitLabel?: string;
  /** brand = amber block (public pages). plain = white card. inverse = on ink surfaces. */
  tone?: "brand" | "plain" | "inverse";
  title?: string;
  id?: string;
  className?: string;
}
export declare function FollowUpdates(props: FollowUpdatesProps): JSX.Element;
```

## TransparencyBlock

The block that keeps the public pages credible: how the numbers were produced and what is not shown.

```jsx
<TransparencyBlock items={[
  {icon:"database",text:"De cijfers komen uit feedback die via GeefSterren is verzameld."},
  {icon:"users",text:"Reacties worden geaggregeerd; losse antwoorden worden niet openbaar getoond."}
]} />
```

Notes
- Never in the footer only. On the location page it sits directly under the data it explains.
- Say what GeefSterren does NOT do: no independent audit, no verification of every improvement.

**Props**

```ts
export interface TrustItem { text: React.ReactNode; icon?: string }
export interface TransparencyBlockProps {
  title?: React.ReactNode;
  /** Plain statements about how the data on this page came to be. */
  items?: (TrustItem | string)[];
  /** Links to privacy, data use and contact. */
  footer?: React.ReactNode;
  className?: string;
}
export declare function TransparencyBlock(props: TransparencyBlockProps): JSX.Element;
```

## ExampleLabel

Marks demonstration data. Required on every figure that is not a verified customer result.

```jsx
<ExampleLabel />
<ExampleLabel>Geanonimiseerde case</ExampleLabel>
```

Notes
- Dashed outline, no fill: it reads as a caveat, not as a badge of quality.
- Put it next to the heading of the block it applies to, not hidden in a footnote.

**Props**

```ts
export interface ExampleLabelProps {
  children?: React.ReactNode;
  icon?: string;
  className?: string;
}
export declare function ExampleLabel(props: ExampleLabelProps): JSX.Element;
```

## FaqList

Accordion for the questions consumers actually ask before giving feedback.

```jsx
<FaqList items={[{q:"Wordt mijn feedback openbaar?",a:"Nee. Je antwoorden gaan naar het bedrijf..."}]} />
```

Notes
- Questions in the consumer's words, answers under 40 words.
- Open the first item by default so the pattern is obvious without a click.

**Props**

```ts
export interface FaqItem { q: React.ReactNode; a: React.ReactNode }
export interface FaqListProps {
  items?: FaqItem[];
  /** Index open on load; -1 for all closed. The first answer is usually the trust question. */
  defaultOpen?: number;
  className?: string;
}
export declare function FaqList(props: FaqListProps): JSX.Element;
```
