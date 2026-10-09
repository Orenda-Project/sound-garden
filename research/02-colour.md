# 02 - Colour research and proposed palette

Scope: Sound Garden, a free no-login English reading site for children and adults, worldwide, often on cheap phones in bright sun.
Evidence grades: **A** primary study or peer-reviewed review, **B** expert guideline or standard, **C** blog, vendor page or practice.
Date of research: 2026-10-09. Search tooling was flaky (several queries timed out); items I could not verify are marked "not verified" and nothing is invented.

## Decisions (read first)

- **Owed: live test.** No user test has been done; Kamal's playtest with his children (plus an adult learner, a colour-blind participant, a cheap phone in sun) is a build-phase gate. Everything below is research and design, not user evidence.
- **Muted inside a lesson text area, saturated outside it** (2.2b). The lesson screen gets one saturated element outside the text area: a sky header band with a bright progress bar.
- **One primary action colour.** Hero green `#4CB82B` with dark ink `#12330F` is the single primary button on every screen. Secondary actions are cream with a sky outline and sky text. Charcoal `#2B2A26` is text only, never a button.
- **Hero buttons are outlined on the full perimeter** in `#2F7D32` (4.75:1 against cream), with a thicker bottom edge for the 3D feel.
- **Right/wrong/reward:** teal check, brown-orange wobble (never red), gold with dark outline. Icon plus word plus sound, never colour alone.
- **Default ground is cream; switcher offers peach and blue-grey.** Green text uses `--leaf-text #2A7230`.

## 1. Findings by area

### 1.1 Colour, children's learning and attention

| Finding | Evidence | Grade | What it means for us |
|---|---|---|---|
| Kindergarteners in a lab classroom were more distracted, spent more time off task and learned less when walls were highly decorated than when bare. Fisher, Godwin, Seltman 2014, Psychological Science. DOI 10.1177/0956797614533801. Abstract via Crossref. | Experiment with random manipulation of the visual environment | A | The strongest result in this file. It is about visual clutter, not hue. The garden art must stay quiet around letters. Keep a calm ground, put colour on the thing being learned. |
| Red cues evoke avoidance motivation and impaired performance on achievement tasks. Elliot et al. 2007, J Exp Psychol: General. https://psycnet.apa.org/doi/10.1037/0096-3445.136.1.154 (cited 526 times per Crossref). Follow-up: Elliot & Maier 2014, Annual Review of Psychology, DOI 10.1146/annurev-psych-010213-115035. | Several lab experiments, adult and teen samples | A, but contested. Effects are small, context-bound and replication has been mixed (my reading of the literature, not re-verified here). | Do not use red as the "wrong" colour or on test-like screens. Cheap to follow, low risk if the effect turns out weaker. |
| Red improved detail-oriented tasks, blue improved creative tasks; red induced avoidance, blue approach. Mehta & Zhu 2009, Science. https://www.science.org/doi/10.1126/science.1169144 (n = 69, 208, 118 adults). | Experiments | A, contested | Supports a blue/teal "calm focus" tone for reading and a warm tone only for small highlights. Not strong enough to drive big design bets. |
| Review: colour can aid attention and memory, effects depend on context and task. Dzulkifli & Mustafar 2013, Malaysian J Med Sci. https://pubmed.ncbi.nlm.nih.gov/23983571/ | Narrative review | A/B | Colour as a cue (one colour = one meaning) is the defensible use. Decorative colour has no solid learning benefit. |
| Pop-psychology claims ("yellow boosts memory", "green calms kids") | Found only on blogs | C, rejected | Not used as design reasons anywhere below. |

Adult learner comfort: I found no primary study specific to adult literacy learners and colour. What exists is general readability (1.2 and 1.3) and the point that adults on a children's-looking site may feel patronised. Palette answer: a calm garden, not a cartoon candy shop. **The point that a children's-looking site may patronise adults is grade C inference (my reasoning, no study found).**

### 1.2 Beginning readers and dyslexia

| Finding | Source | Grade |
|---|---|---|
| Use cream or a soft pastel, not white ("White can appear too dazzling"). Dark text on a light, not white, background. "Avoid green and red/pink as these are difficult for colour-blind individuals." Some readers have their own colour preference. | British Dyslexia Association Style Guide (text read directly from the PDF): http://www.thedyslexia-spldtrust.org.uk/media/downloads/69-bda-style-guide-april14.pdf | B |
| Warm backgrounds (peach, orange, yellow) significantly improved reading performance, with benefit for readers with and without dyslexia, and possibly more with dyslexia. Rello & Bigham 2017, ACM ASSETS. https://dl.acm.org/doi/abs/10.1145/3132525.3132546 | Single peer-reviewed study. What I read: the ACM abstract snippet (peach, orange, yellow improved reading performance; readers with and without dyslexia benefit, possibly more with dyslexia) and the Crossref record, DOI 10.1145/3132525.3132546. The full paper (sample size, effect size, method) is NOT read. | **B-pending** (was A; upgrade to A only after the full text is read) |
| Coloured overlays and filters for visual stress: early positive studies (Wilkins et al. 1995, J Res Reading, DOI 10.1111/j.1467-9817.1995.tb00064.x) but the claim is disputed (title "A rose-tinted cure: the myth of coloured overlays and dyslexia", 2019, DOI 10.64628/ab.th6gwm3sq; contents not read). | Crossref metadata | A/C, contested |
| Letter colouring in phonics apps | I found no controlled evidence. Practice only. | C |

Design consequences:
- Default background is a warm off-white (cream), never `#FFFFFF`. Consistent with BDA and Rello & Bigham.
- Offer a small background switcher (cream, pale peach, pale blue-grey). BDA says preferences vary and overlay evidence is contested, so choice beats a single "correct" tint. This costs almost nothing.
- Do not colour individual letters by sound or by vowel/consonant. No evidence, and it fights colour-blind safety and the "one colour = one meaning" rule. Use size, weight and position to mark the target grapheme (bold plus a thick underline in primary green).

### 1.3 WCAG 2.2 and game UIs

Read from W3C Understanding SC 1.4.3 (https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), grade B:
- Text at least **4.5:1**; large text (18 pt, or 14 pt bold) at least **3:1**. Values must not be rounded up (4.499 fails).
- SC 1.4.11 Non-text contrast (https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html): UI components and graphics needed to understand content need **3:1**. The page confirms that icon glyphs count as non-text.
- SC 1.4.1 Use of colour (from my knowledge of WCAG, not re-fetched): colour must not be the only cue.

How game UIs fail and pass: Duolingo's signature Feather Green `#58CC02` gives white text only **2.09:1** and white on its Cardinal red `#FF4B4B` only **3.30:1** (computed below). Its body text Eel `#4B4B4B` on white is 8.72:1. So the gamey accents carry shape, size and 3D shadow, while text uses neutrals. We adopt the lesson but go further: every text pair in our palette passes 4.5:1.

### 1.4 Competitor and reference palettes (real values where I could get them)

| Product | Values | Source | Grade / note |
|---|---|---|---|
| Duolingo | Feather Green `#58CC02`, Mask Green `#89E219`, Eel `#4B4B4B`, Snow `#FFFFFF`; UI set Macaw `#1CB0F6` (info), Cardinal `#FF4B4B` (error), Bee `#FFC800` (reward), Fox `#FF9600`, Beetle `#CE82FF`, Humpback `#2B70C9`, Wolf `#777777`, Hare `#AFAFAF`, Swan `#E5E5E5`, Polar `#F7F7F7` | https://brandpalettes.com/duolingo-colors/ ; https://github.com/virgiliojr94/duolingo-ux-reference/blob/master/references/color.md | C (fan reference, not Duolingo-published) |
| Teach Your Monster | Most frequent hex on homepage CSS: `#ffffff`, `#6dcdf3`, `#1a8dc8`, `#2A3475`, `#00c4ea`, `#2995d5`, `#ef6596`, `#7e64ab`, `#094d31` | https://www.teachyourmonster.org/ (page source, counted) | C. Sky blues plus navy, pink and purple accents. |
| Khan Academy (brand; Kids not separately found) | Green `#14BF96`, navy `#0A2A66` | https://colorcodehub.com/brand/khan-academy | C |
| Forest (focus app) | Deep forest greens `#114836`, `#19634b`, `#0b372b`; cream `#fdf9ec`, `#f4ead0`; lime `#e7ff6a`, mint `#47ebb3`, terracotta `#c2553c` | https://www.forestapp.cc (page source, counted) | C. Closest cousin to our idea: cream ground plus forest greens. |
| Reading Eggs | Not verified. `readingeggs.com` returned "Page Not Found"; brandfetch pages were blocked, only site chrome came back. | | not verified |
| Finch | Not verified. Homepage had no extractable hex. | | not verified |
| Animal Crossing | Not verified. No reliable official palette found. | | not verified |
| Khan Academy Kids | Not verified separately (see Khan Academy). | | not verified |

Pattern across the verified ones: a single bright green or blue hero, warm cream or pale-blue ground, one warm accent for reward. Ours follows the same pattern but pushes the hero darker so text passes WCAG.

### 1.5 Cultural meanings (grade C throughout)

Sources are secondary colour-guide blogs (for example https://www.colorpickerweb.com/cultural-color-meanings/, https://colorfyi.com/blog/color-and-culture/), which I could only skim before the fetch yielded no usable text. The notes below are general cross-cultural knowledge, hedged, and used only to avoid risk, never as a reason to chase a "positive" meaning.

| Colour | Risk or meaning by region | Decision |
|---|---|---|
| Red | Luck and celebration in East Asia and South Asia (weddings); danger or error in much of the West; mourning or struggle associations in some parts of Africa; passion in Latin America | Meaning is split, and Elliot 2007 argues against it. Never the "wrong" colour. |
| White | Mourning in East Asia and parts of South Asia; purity elsewhere | Not used as the ground. Cream suits BDA anyway. |
| Black | Mourning in most regions | Text only, never a large decorative field in light mode. |
| Purple | Mourning or religious associations in parts of Latin America and Thailand | Skip as a feedback colour. |
| Green | Strongly positive in Islamic cultures (Middle East, South Asia); Pan-African flag colour; nature everywhere | Safe primary, fits the garden. |
| Yellow/gold | Sacred or auspicious in South Asia and Buddhist East and Southeast Asia; caution in the West | Fine for reward. |
| Blue | Mostly neutral to positive; protective in the Middle East | Safe secondary. |
| Orange/saffron | Sacred in Hindu and Buddhist contexts, which is positive, though politically loaded in places | Used as a muted brown-orange for "try again", not saffron. |

### 1.6 Sunlight and low-end OLED (grade C)

Sources are display-vendor engineering pages (for example https://www.vartechsystems.com/articles/designing-operator-interfaces-bright-outdoor-conditions, https://riverdi.com/blog/sunlight-readable-displays-the-most-important-parameters-of-outdoor-lcd-displays-you-need-to-know). The shared point: ambient light reflecting off the screen adds to the black level, so effective contrast falls and mid-tone, mid-lightness colours wash out first. I found no controlled study on cheap phones; the rest is engineering inference.

Design consequences:
- Light mode is the default (outdoor use), with body text well above the minimum. Ours is 13.32:1, not 4.5:1.
- Meaning must survive washout: colour plus icon plus position or motion plus text, never colour alone.
- Avoid mid-lightness tints for state backgrounds carrying small text. Our tints are very light with dark text.
- Dark mode is an option (night, battery on OLED). Its ground is `#111814`, near-black, not `#000000`. Reason (practice, unverified on target devices): pure black next to bright text causes smearing on slow OLED panels and very high glare contrast. Test on a real cheap OLED before promising this.

### 1.7 Feedback and reward in learning games

Peer-reviewed sources exist and were located; none of them is about colour. Titles, journals and DOIs were verified through Crossref. **I did not read the abstracts or papers in this session; the findings below are my recollection of their conclusions and must be re-checked before they drive a decision.**

| Source | Recollected finding | Grade |
|---|---|---|
| Hattie & Timperley 2007, Review of Educational Research, DOI 10.3102/003465430298487 (cited 9667 times) | Feedback helps most when it is about the task and the process, and least when it is praise aimed at the person | A (recollection) |
| Wouters et al. 2013, J Educational Psychology, DOI 10.1037/a0031311 (meta-analysis of serious games) | Serious games beat conventional instruction on learning and retention but not on motivation; they work better over multiple sessions and mixed with other instruction | A (recollection) |
| Sailer & Homner 2019, Educational Psychology Review, DOI 10.1007/s10648-019-09498-w (gamification meta-analysis) | Small positive effects on cognitive, motivational and behavioural outcomes | A (recollection) |
| Deci, Koestner & Ryan 1999, Psychological Bulletin, DOI 10.1037/0033-2909.125.6.627 | Expected tangible rewards undermine intrinsic motivation; verbal praise tends to enhance it | A (recollection) |

Design consequences (inference, grade C): feedback copy names the sound and the word ("sh as in ship"), not "Great job!"; rewards are small, tied to the thing learned (a flower per sound) and not tangible prizes; reward screens stay brief. **No primary evidence was found on which colour or colour intensity makes feedback or rewards work better in learning games.** The right/wrong/reward hues are therefore chosen on accessibility and cultural-risk grounds only.

## 2. PROPOSED palette

Garden-themed, warm-neutral ground, one deep leaf green, one sky blue, three feedback accents that do not depend on red/green discrimination.

### 2.1 Light (default)

| Token | Hex | Role | Rationale |
|---|---|---|---|
| `--bg` | `#FBF6EA` | page ground | cream, not white: BDA, Rello & Bigham; Forest uses a similar cream `#fdf9ec` |
| `--card` | `#FFFCF4` | cards, lesson surface | slightly lighter than ground; still not pure white |
| `--tint` | `#EFE7D2` | chips, soil-like panels | warm neutral |
| `--text` | `#2B2A26` | body, letters | dark warm grey, not pure black (Duolingo does the same with Eel) |
| `--muted` | `#5B574E` | secondary text | still above 6:1 |
| `--border` | `#8A8372` | control outlines, focus | passes 3:1 non-text |
| **primary** `--leaf` | `#2F7D32` | main buttons, progress, target grapheme underline | green positive in Islamic, African and many other cultures (1.5); calm; deep enough for white label text (Duolingo's `#58CC02` only gets 2.09:1) |
| **secondary** `--sky` | `#1F6FB2` | links, info, secondary buttons | blue approach/calm tone (Mehta & Zhu, contested), culturally safe |
| accent **right** `--right` | `#0F766E` | correct answer | teal, not green: keeps "right" distinct from "wrong" orange under red-green colour blindness and from primary actions; always with a check icon and "Yes" text |
| accent **wrong** `--wrong` | `#A84A07` | try again | brown-orange, not red (Elliot 2007; red meanings split across cultures; BDA warns about red/green). Always a "wobble" icon and the words "Try again", never an X |
| accent **reward** `--sun` | `#F5B301` | stars, seeds, flowers earned | warm gold, auspicious in South Asia and East Asia, standard reward colour (Duolingo Bee `#FFC800`). Needs a dark outline, see table |
| tint right / wrong / sky | `#DDF1EE` / `#FBE9D6` / `#DCEEF9` | answer-state and info backgrounds | very light so dark text passes |

### 2.2 Dark variant

| Token | Hex |
|---|---|
| `--bg` | `#111814` |
| `--card` | `#1A231D` |
| `--text` | `#EDE8DA` |
| `--muted` | `#B4AFA0` |
| `--border` | `#7C8578` |
| `--leaf` (primary) | `#8BD48B`, button label `#0E1A10` |
| `--sky` (secondary) | `#7DBEF2` |
| `--right` | `#5FD0C5` |
| `--wrong` | `#F0A35E` |
| `--sun` (reward) | `#FFD04D`, label `#2B2A26` |

### 2.2b Saturated "hero" version, and the rule: muted inside a lesson, saturated outside

Critic feedback: the muted set alone does not feel like a game. Fix: keep the muted set above as the **calm lesson surface** and add a saturated set for home, garden and reward screens.

**Rule: muted inside a lesson, saturated outside.** The lesson screen (letters, options, feedback sheet) uses cream ground, `--text` letters and the muted tokens only (Fisher 2014: nothing lively competing with the letters). Home, garden and reward screens may use the hero colours, sky and hill gradients and big shapes. Hero colours never sit behind running text.

Three hero candidates, tested (WCAG ratios computed in Python, label text on the hero fill):

| Candidate | Fill | Label | Label ratio | White label (for comparison) | Fill vs cream ground | Outline colour (full perimeter, thicker at the bottom) | Edge vs cream |
|---|---|---|---|---|---|---|---|
| **A leaf-bright (chosen primary hero)** | `#4CB82B` | `#12330F` | 5.44:1 PASS | 2.56:1 FAIL | 2.38:1 | `#2F7D32` | 4.75:1 PASS |
| B sun-yellow | `#FFC21A` | `#2B2A26` | 8.88:1 PASS | 1.62:1 FAIL | 1.50:1 | `#9A6700` | 4.51:1 PASS |
| C sky-blue | `#2FA8F2` | `#2B2A26` | 5.48:1 PASS | 2.62:1 FAIL | 2.43:1 | `#1F6FB2` | 4.90:1 PASS |
| (ref) Duolingo green | `#58CC02` | `#12330F` | 6.67:1 PASS | 2.09:1 FAIL | 1.94:1 | n/a | n/a |

Findings: every saturated fill needs a **dark label** (white fails on all, as on Duolingo green). None of the fills reaches 3:1 against the cream ground on its own, so each hero button is **outlined on the full perimeter** (3 px, bottom edge 6 px) in its dark shade (all pass 3:1 against cream, last column) plus the label as the identifier. B (sun) is a poor main hero because it is the reward colour and is lightest (1.50:1 vs cream); keep it for reward screens, where it is the full-screen ground (dark text 7.75 to 10.18:1 across the gradient). C (sky) works as the home sky band and secondary hero. **Decision: A is the primary hero (it is the garden), B the reward ground, C the sky.** 

New tokens: `--hero #4CB82B`, `--hero-edge #2F7D32`, `--hero-ink #12330F`, `--sun-hero #FFC21A`, `--sun-edge #9A6700`, sky band `#BFE6FA` (dark text 10.89:1), hill `#CDEFA8` (dark text 11.29:1, `#1E5C24` text on it 6.32:1). Dark mode keeps its existing set; saturated screens in dark mode are not designed yet.

**Hero button outline `#2F7D32`, ratio against every ground it sits on (computed):** cream `#FBF6EA` 4.75:1, card `#FFFCF4` 5.00:1, right tint `#DDF1EE` 4.36:1, wrong tint `#FBE9D6` 4.32:1, sky band end `#BFE6FA` 3.88:1, sky band top `#8ED2F5` 3.09:1, reward gold `#FFC21A` 3.17:1 (all at or above 3:1). The reward ground therefore ends at `#FFC21A`, not `#F5B301` (outline 2.76:1, would fail). The hero fill itself against the sky band is only 1.55:1, so the outline carries the shape. Secondary button: sky `#1F6FB2` outline and text on card, text 5.15:1; outline against gold `#FFC21A` 3.27:1.

**Action hierarchy:** one primary per screen (hero green, dark ink), one optional secondary (cream, sky outline). Charcoal is a text colour only; the earlier charcoal "See my garden" button on the reward screen is gone. Lesson buttons (Continue, Try again) are now hero green too, so the primary looks the same in and out of lessons; the lesson stays calm because the text area, option cards and feedback sheet are still cream and tinted.

**Lesson header:** a sky band (`#8ED2F5` to `#BFE6FA`) behind back arrow and progress bar, bar fill hero green in a cream track with a `#2F7D32` outline (track vs band is carried by the outline, 3.09 to 3.88:1). Everything below it is cream.

### 2.2c Mockup: judge the feel, not only the table

Static HTML: `research/mockups/colour.html`. Screenshots at 390x844 (Playwright/Chromium, all under 200 KB):

| Screen | File | Mode |
|---|---|---|
| Home garden | `research/shots/colour/01-home-garden.png` | saturated |
| Lesson, wrong answer | `research/shots/colour/02-lesson-wrong.png` | calm |
| Lesson, correct answer | `research/shots/colour/03-lesson-correct.png` | calm |
| Reward | `research/shots/colour/04-reward.png` | saturated |

What I saw in them (re-screenshotted after the round-2 fixes): home and reward feel lively (sky, hills, gold ground, big flower); the lesson screens have a sky header band and bright progress bar above a quiet cream text area; every screen has one green hero button with a full outline; the wrong state reads as a gentle brown-orange "Try again" with a wobble icon and a hero "Try again" button. Weak spots I can see: the home screen has a large empty middle; the hero green is close in value to the hill, so on home the button relies on its dark label and edge; the mockup uses emoji-free simple SVG art, not final art; picture options in the lesson are text-only.

**Live user testing is NOT done and is still owed** (see Decisions). The mockup is a design artefact, not evidence. Needed: real children and adult learners, a cheap phone, outdoors, with a colour-blind participant (see section 4).

### 2.3 Open pairs now computed

| Pair | Ratio | Result | Consequence |
|---|---|---|---|
| `--right` #0F766E on `--leaf` #2F7D32 | **1.07:1** | FAIL, effectively invisible | `--right` must never be placed on a leaf-green fill. Correct feedback sits on `--right-tint` (4.66:1) or cream (5.08:1), never on a button. |
| `--right` on hero `#4CB82B` | 2.14:1 | FAIL | Same rule for the hero green. |
| `--right-tint` #DDF1EE on `--leaf` | 4.36:1 | FAIL for small text | Do not put tinted text on the leaf fill; white label (5.12:1) or hero ink (5.44:1 on the bright hero) only. |

Background switcher grounds (peach `#FBEBDD`, blue-grey `#EAF1F5`) against text and accents (cream shown for reference):

| Foreground | Need | Cream `#FBF6EA` | Peach `#FBEBDD` | Blue-grey `#EAF1F5` |
|---|---|---|---|---|
| `--text` #2B2A26 | 4.5 | 13.32 PASS | 12.33 PASS | 12.59 PASS |
| `--muted` #5B574E | 4.5 | 6.67 PASS | 6.18 PASS | 6.31 PASS |
| `--leaf` #2F7D32 as text | 4.5 | 4.75 PASS | **4.40 FAIL** | **4.49 FAIL** |
| `--leaf-text` #2A7230 as text | 4.5 | 5.49 PASS | 5.08 PASS | 5.19 PASS |
| `--sky` #1F6FB2 as text | 4.5 | 4.90 PASS | 4.54 PASS (tight) | 4.63 PASS |
| `--right` #0F766E | 4.5 | 5.08 PASS | 4.70 PASS | 4.80 PASS |
| `--wrong` #A84A07 | 4.5 | 5.34 PASS | 4.94 PASS | 5.04 PASS |
| `--border` #8A8372 (non-text) | 3 | 3.50 PASS | 3.24 PASS | 3.30 PASS |
| gold `#F5B301` alone (non-text) | 3 | 1.72 FAIL | 1.59 FAIL | 1.62 FAIL (dark outline needed, 12-13:1) |

Result: all three grounds work for text, `--right`, `--wrong`, `--sky` and borders. `--leaf` as **text** fails on peach and just fails on blue-grey, so add `--leaf-text #2A7230` (5.08 to 5.49:1 on all three; white label on it 5.92:1) and use it for any green text or links. Filled `--leaf` buttons with white labels are unaffected (5.12:1).

### 2.4 Contrast for the muted set, computed in Python (WCAG 2.x relative luminance; script kept in my scratch dir, formula is the standard sRGB one from the W3C page above)

Light mode

| Use | Pair | Ratio | Need | Result |
|---|---|---|---|---|
| body text | #2B2A26 on #FBF6EA | 13.32:1 | 4.5 | PASS |
| text on card | #2B2A26 on #FFFCF4 | 14.01:1 | 4.5 | PASS |
| text on tint | #2B2A26 on #EFE7D2 | 11.65:1 | 4.5 | PASS |
| secondary text | #5B574E on #FBF6EA | 6.67:1 | 4.5 | PASS |
| primary button label | #FFFFFF on #2F7D32 | 5.12:1 | 4.5 | PASS |
| primary as text/link | #2F7D32 on #FBF6EA | 4.75:1 | 4.5 | PASS |
| link / secondary text | #1F6FB2 on #FBF6EA | 4.90:1 | 4.5 | PASS |
| secondary button label | #FFFFFF on #1F6FB2 | 5.28:1 | 4.5 | PASS |
| right text | #0F766E on #FBF6EA | 5.08:1 | 4.5 | PASS |
| text on right tint | #2B2A26 on #DDF1EE | 12.24:1 | 4.5 | PASS |
| right on right tint | #0F766E on #DDF1EE | 4.66:1 | 4.5 | PASS |
| wrong text | #A84A07 on #FBF6EA | 5.34:1 | 4.5 | PASS |
| text on wrong tint | #2B2A26 on #FBE9D6 | 12.13:1 | 4.5 | PASS |
| wrong on wrong tint | #A84A07 on #FBE9D6 | 4.86:1 | 4.5 | PASS |
| label on reward | #2B2A26 on #F5B301 | 7.75:1 | 4.5 | PASS |
| text on sky tint | #2B2A26 on #DCEEF9 | 12.07:1 | 4.5 | PASS |
| control border (non-text) | #8A8372 on #FBF6EA | 3.50:1 | 3 | PASS |
| primary shape (non-text) | #2F7D32 on #FBF6EA | 4.75:1 | 3 | PASS |
| **reward gold alone (non-text)** | #F5B301 on #FBF6EA | **1.72:1** | 3 | **FAIL by itself** |
| reward gold with outline | #2B2A26 outline on #FBF6EA | 13.32:1 | 3 | PASS |

The gold reward fails 3:1 against the cream ground by itself (1.72:1; against the card 1.81:1). It is therefore never used without a 2 px `--text` outline or a dark glyph on it. Gold is decoration plus label, never the only carrier of meaning. An earlier draft had `--wrong` at `#B45309`; its text on the wrong tint was 4.24:1 (FAIL), so I darkened it to `#A84A07` (now 4.86:1).

Dark mode

| Use | Pair | Ratio | Need | Result |
|---|---|---|---|---|
| body text | #EDE8DA on #111814 | 14.73:1 | 4.5 | PASS |
| text on card | #EDE8DA on #1A231D | 13.18:1 | 4.5 | PASS |
| secondary text | #B4AFA0 on #111814 | 8.23:1 | 4.5 | PASS |
| primary label | #0E1A10 on #8BD48B | 10.13:1 | 4.5 | PASS |
| primary as text | #8BD48B on #111814 | 10.21:1 | 4.5 | PASS |
| link | #7DBEF2 on #111814 | 9.03:1 | 4.5 | PASS |
| right | #5FD0C5 on #111814 | 9.72:1 | 4.5 | PASS |
| wrong | #F0A35E on #111814 | 8.68:1 | 4.5 | PASS |
| label on reward | #2B2A26 on #FFD04D | 9.84:1 | 4.5 | PASS |
| reward shape (non-text) | #FFD04D on #111814 | 12.35:1 | 3 | PASS |
| border (non-text) | #7C8578 on #111814 | 4.71:1 | 3 | PASS |

Reference points computed in the same script: Duolingo white on `#58CC02` 2.09:1, white on `#FF4B4B` 3.30:1, `#4B4B4B` on white 8.72:1.

### 2.5 Colour-blind check (Machado 2009 simulation, CIELAB distance, computed)

| Pair (light) | Normal | Protan | Deutan | Tritan |
|---|---|---|---|---|
| right teal vs wrong orange | 84.5 | 45.6 | 58.5 | 88.7 |
| right teal vs reward gold | 98.3 | 79.7 | 91.4 | 74.7 |
| primary green vs wrong orange | 77.8 | **11.4** | **22.3** | 86.8 |
| naive green `#2E7D32` vs red `#C62828` (the usual choice) | 100.8 | **18.9** | **15.8** | n/a |

Right vs wrong stays far apart in all three types (above 45). Primary green vs wrong orange nearly collapses for protan and deutan, so the two must never be the only difference on one screen: "right" uses teal, "wrong" always carries its own icon and words. The usual green/red pairing collapses to about 16 to 19, which supports rejecting it.

### 2.6 Usage rules (so colour never carries meaning alone)
1. Right: teal plus check icon plus the word "Yes", plus a rising sound. Wrong: orange plus wobble icon plus "Try again", plus a soft tone. Never a red X, never a buzzer.
2. Max 3 hues on any lesson screen. Letters and words always `--text` on `--card`, nothing decorative behind them (Fisher 2014).
3. Target grapheme: bold plus 3 px `--leaf` underline, not a colour fill.
4. Garden art uses the same hues at lower saturation, behind or beside the lesson card, never behind the text.
5. Background switcher: cream (default), peach `#FBEBDD` (Rello & Bigham warm), pale blue-grey `#EAF1F5`. All three verified in 2.3 (use `--leaf-text` for green text).
6. Muted inside the lesson text area, saturated outside it (2.2b). `--right` never on a leaf fill (2.3).
7. One primary action colour (hero green); charcoal is text only; hero buttons carry a full-perimeter outline.

## 3. Three rejected palettes

1. **Duolingo-style bright green and red on white** (`#58CC02`, `#FF4B4B`, `#FFFFFF`). Rejected: white label on the green is 2.09:1 and on the red 3.30:1, so it fails WCAG for text; green/red feedback collapses for colour-blind users (15.8 to 18.9 in simulation); white ground is "dazzling" per BDA; red as wrong adds avoidance (Elliot 2007) and split cultural meaning. It works for Duolingo only because text is neutral and the buttons are huge with shadows.
2. **Pastel candy kid palette** (pink, lilac, mint on white, in the Teach Your Monster / "cute" direction). Rejected on grade C reasoning only (inference, not measured): pastels have low contrast and wash out first in sunlight (1.6); purple and pink carry mourning or gender baggage in some regions (1.5); it may patronise adult learners (grade C inference, no study found; the 'half the audience' share is also an assumption, not data); pastels washing out in sunlight is grade C engineering inference (1.6); no evidence for benefit (1.1).
3. **Strongly tinted warm ground (peach or yellow) as the single default, plus neon-on-black dark-first night garden.** Rejected as defaults: a deep peach or yellow ground lowers contrast for every other colour and dyslexia preference varies (BDA), overlay evidence is contested (1.2); a dark-first neon look is the worst case for bright sunlight and removes the dark-on-light reading BDA recommends. Both survive as options: the peach tint inside the background switcher, and the dark variant in 2.2.

## 4. Open items and honest gaps
- Reading Eggs, Finch, Animal Crossing and Khan Academy Kids palettes were not extractable. I did not guess.
- Rello & Bigham: only the abstract snippet and Crossref record were read, so the study is graded B-pending; sample size and effect size are not stated here.
- Cultural table is secondary-source and general knowledge (grade C); worth a native-speaker review for the first target languages.
- Sunlight and OLED claims are engineering reasoning, not measured on cheap phones. Test `#111814` vs `#000000` on a real low-end OLED outdoors before fixing the dark ground.
- **Live user test still owed** (children, adult learners, colour-blind participant, cheap phone in sun). The mockup and ratios are not a substitute.
- Saturated screens in dark mode are not designed or tested.
