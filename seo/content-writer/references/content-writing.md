# Content Writing Guidelines — Google Best Practices

Reference for writing content that ranks. Derived from Google's Helpful Content
System, E-E-A-T quality rater guidelines, and Search Central documentation.

---

## Table of Contents

1. [E-E-A-T Framework](#e-e-a-t-framework)
2. [Helpful Content Signals](#helpful-content-signals)
3. [Blog Posts](#blog-posts)
4. [Title Hook Patterns](#title-hook-patterns)
5. [Images](#images)
6. [Landing Pages](#landing-pages)
7. [Search Intent Matching](#search-intent-matching)
8. [On-Page SEO Checklist](#on-page-seo-checklist)
9. [Anti-Patterns](#anti-patterns)

---

## E-E-A-T Framework

Google evaluates content on four axes:

### Experience
- Show first-hand experience — specific examples, scenarios, case studies
- Use language that reflects direct involvement ("we found", "in our testing")
- Reference real data, outcomes, or results

### Expertise
- Go beyond surface-level — cover edge cases only a practitioner would know
- Use precise terminology correctly but define it for the reader
- Link to authoritative sources for factual claims

### Authoritativeness
- Establish why this source is credible on this topic
- Include author bios with relevant credentials
- Build topical authority via internal linking to related content

### Trustworthiness
- Be transparent about limitations and conflicts of interest
- Cite sources for statistics and claims
- Keep content accurate and up to date

**YMYL topics** (health, finance, safety, legal) require the highest E-E-A-T bar.

### High-Stakes Factual & Compliance Topics
Some SEO topics are not legally YMYL but still create real-world risk if the
answer is wrong: travel requirements, government paperwork, animal welfare,
health certificates, military reimbursement, taxes/fees, regulated products, and
anything with official deadlines or eligibility rules.

For these topics, apply a compliance-quality gate before publishing:
- Link directly to the current official source for each rule-making body
  involved, such as government agencies, regulators, standards bodies, airlines,
  or program owners.
- Separate official requirements from professional planning advice. Do not use
  soft language like "may be required" for a normally mandatory step unless the
  official source actually defines meaningful exceptions.
- Name timing windows, exceptions, and scope boundaries explicitly. If guidance
  applies only to entry, import, export, one country, one state, or one program,
  do not generalize it to the reverse direction or adjacent workflows.
- Include a freshness caveat that tells readers to verify official guidance
  before booking, filing, buying, or traveling.
- If the page includes a calculator, estimator, or checklist, encode known rule
  adjustments and caveats in the tool itself, not only in surrounding prose.
- Treat unsourced compliance claims, ambiguous requirements, or missing official
  links as blockers, not polish items.

---

## Helpful Content Signals

### Content IS helpful when it:
- Has a clear, specific audience in mind
- Leaves the reader feeling they've learned enough to achieve their goal
- Provides original value — analysis, insight, research, not just compilation
- Has a satisfying amount of information (not thin, not padded)

### The "Last Click" Test
After reading, would the reader need to search again? If yes, the content isn't
done. The goal is to be the last click.

---

## Blog Posts

### When to Use
Informational and commercial-investigation intent: "how to", "what is", "best X",
"X vs Y", guides, tutorials, listicles, reviews.

### Structure
```
H1: Hook-driven title (one per page, includes primary keyword)
Featured image (above the fold, used as thumbnail + Open Graph)
Hook paragraph (breaks reader expectation, signals what's different)
Table of Contents (anchor links to every H2)
  H2: Major section (answer core question first — don't bury the lead)
    Inline image #1 (diagram, screenshot, comparison, or data viz)
    H3: Supporting detail
  H2: Practical examples / case studies
    Inline image #2
  H2: Common mistakes
    Inline image #3
  H2: FAQ (targets People Also Ask)
```

A serious blog post is ≥ 1000 words, ships with a hook-driven title, a table of
contents, a featured image, and at least 3 inline images. Posts below that bar
read like AI filler and don't earn the click.

### Writing Rules
1. **Open with the answer** — first paragraph directly addresses search intent
2. **Show experience** — specific examples, data, "we found that..." language
3. **Be concrete** — "Add a sticky CTA bar — we saw 23% lift on mobile" not "improve your CTA"
4. **Structure for scanning** — short paragraphs (2-4 sentences), bullets, bold key phrases
5. **Link internally** — 3-5 related pages, descriptive anchor text
6. **Cite sources** — link to data sources and authoritative references
7. **Write to completeness, not word count** — cover the topic fully, then stop

### Keyword Placement
- Title tag (front-loaded, < 60 chars)
- H1
- First 100 words
- 1-2 H2 headings naturally
- Meta description (120-160 chars)
- After that: synonyms and natural language — no stuffing

### Required Sections
1. **Featured image** — set above the fold, doubles as thumbnail + Open Graph
2. **Opening hook (2–4 sentences)** — break expectation. State what most people
   get wrong, the counterintuitive truth, or the specific gap this post closes.
   No "in today's digital landscape" throat-clearing
3. **Table of contents** — anchor links to every H2, rendered at the top
4. **Core content** — main answer with clear H2/H3 structure, ≥ 1000 words
5. **Inline images (≥ 3)** — placed at meaningful points (one per major section
   is a good rule of thumb): diagram, screenshot, comparison table-as-image, or
   data viz. No decorative stock
6. **Practical examples** — at least one real scenario with concrete numbers
7. **Common mistakes** — what people get wrong
8. **Next steps / CTA**
9. **FAQ** (3–5 questions targeting related searches)

### Metadata
- **Title tag:** < 60 chars, keyword front-loaded, includes value prop and hook
- **Meta description:** 120-160 chars, keyword + reason to click
- **URL slug:** short, readable, keyword-rich. `/blog/optimize-title-tags`
- **Structured data:** `Article` or `BlogPosting` with the article image where applicable.

---

## Title Hook Patterns

The bare keyword as a title ("Facebook SEO Optimization") loses to anything with
a hook in the same SERP. Pick one of these patterns. Keep ≤ 60 chars and keep
the primary keyword front-loaded.

### 1. Number + specificity
Numbers earn the click because they imply scoped, finite content.
- "7 Facebook SEO Tactics That Actually Move Pipeline"
- "Title Tag Optimization: 12 Patterns That Lift CTR 20%+"

### 2. Audience-named guide
Naming the audience filters for the right reader and signals depth.
- "Facebook SEO Optimization: A Guide for Performance Marketers"
- "Schema Markup for Ecommerce Product Pages"

### 3. Contrarian / myth-break
A confident counter-claim creates a curiosity gap.
- "Facebook SEO Is Not Dead — You're Measuring It Wrong"
- "Stop Writing 3,000-Word Blog Posts. Here's What Ranks Instead."

### 4. Outcome promise + proof
A specific result, backed by something that signals the post will deliver it.
- "How We Cut CPA 38% Without Touching Bids"
- "The Title Tag Rewrite That Lifted Organic Traffic 2.3x"

**What disqualifies a title:** vague modifiers ("ultimate", "complete"), the
keyword stated twice, ChatGPT-default formatting ("A Comprehensive Guide to…"),
or a hook so clickbait it overpromises what the body delivers.

---

## Images

Images aren't decoration — they're a quality signal Google uses (helpful
content with original imagery outranks text-only posts in most categories), an
engagement lever (reduces bounce, lifts dwell time), and an Open Graph asset
that determines whether the post gets clicked on social.

### Minimum bar for a blog post
- **1 featured/thumbnail image** — above the fold, also used as the Open Graph
  image and the post's `og:image` / `twitter:image` / structured-data `image`
- **≥ 3 inline images** placed in the body at meaningful points — one per major
  H2 is a good rhythm

### What counts as a real image
- **Diagrams** explaining a workflow, system, or relationship
- **Screenshots** of the tool / dashboard / SERP being discussed
- **Comparison visuals** (before/after, options side-by-side)
- **Data visualization** of a stat the post cites
- **Original illustration** that depicts something specific to the post

### What does NOT count
- Stock photos of "person at laptop", handshakes, abstract gradients
- Generic AI-generated "marketing hero" art with no informational content
- The same image used decoratively in every section

### Image generation
Use an appropriate image-generation capability available in the host or a
connected service, following its current instructions. Save the generated assets
to the user's chosen location. Do not assume an MCP supports image generation
from its name. If no suitable capability exists, provide detailed prompts and
clearly mark the assets as still needed.

### Writing an image prompt
Every prompt names: subject, style (photographic / 3D render / flat illustration
/ data viz / diagram), composition, color palette, mood, and an explicit avoid
list. Example:

> Featured image for a blog post on Facebook SEO optimization. Flat vector
> illustration, isometric perspective. A stylized Facebook page card with search
> bars, magnifying glass, and ranking arrows around it. Color palette: NotFair
> orange (#FF6B35) accents on a clean off-white background, navy line work. No
> stock-photo people, no generic laptop, no abstract gradients. Square 1200×1200.

### Image SEO
- File name: keyword-relevant, hyphen-separated. `facebook-seo-page-checklist.png`
- Alt text: descriptive of what the image shows, not keyword-stuffed
- Format: WebP or AVIF preferred; PNG for diagrams with hard edges
- Width: 1200px (featured), 800–1000px (inline), 2x for retina
- Lazy-load every image except the featured one

### Media and Asset Quality
- Use real, relevant visual assets for published pages when the topic benefits
  from illustration, inspection, or trust. Avoid purely decorative stock-like
  images that do not help the reader understand the product, place, process, or
  outcome.
- Validate generated image files after export. The file extension, MIME/file
  signature, dimensions, and metadata declarations must agree.
- Keep hero images reasonably sized for web delivery. Prefer WebP/AVIF photos at
  the displayed aspect ratio; oversized multi-megabyte source images are a
  technical UX issue, not just an asset issue.
- Open Graph image dimensions in metadata must match the actual asset.

---

## Landing Pages

### When to Use
Transactional and commercial intent: "buy", "pricing", "near me", "[service] in
[city]", "best [product] for [use case]".

### Core Principles
1. **Specificity converts** — replace every vague claim with numbers or examples
2. **Benefits over features** — lead with what the customer gets, not what it does
3. **Address objections directly** — price, trust, switching costs, "does it work?"
4. **One page, one job** — every element moves toward the CTA
5. **Social proof is mandatory** — testimonials, logos, stats, case studies

### Structure by Page Type

**Service page:**
```
H1: Service + Primary Benefit
Hero subhead + Primary CTA
H2: The Problem (show you understand their situation)
H2: How It Works (3-4 clear steps)
H2: Results (specific outcomes with numbers)
H2: Social Proof (testimonials, logos, case studies)
H2: Pricing (if applicable)
H2: FAQ (5-8 objection-handling questions)
Final CTA
```

**Product page:**
```
H1: Product + Key Benefit
Hero + CTA
H2: Features → Benefits (not just feature lists)
H2: How It Works
H2: Who It's For (specific use cases)
H2: Reviews / Social Proof
H2: Pricing
H2: FAQ
Final CTA
```

**Location page:**
```
H1: [Service] in [City]
Local value prop + CTA
H2: Local-specific content (NOT generic copy with city swapped)
H2: Why Choose Us in [City] (local presence, case studies)
H2: Service Areas
H2: FAQ (local-specific concerns)
CTA with local contact
```

### SEO for Landing Pages
- Lighter keyword density than blog posts
- Primary keyword in: title, H1, first paragraph, 1 H2, meta description
- 500-1500 words of genuine content (thin pages with just a headline + form don't rank)
- FAQ section serves dual purpose: conversion (objection handling) + SEO (long-tail queries)

### Metadata
- **Title tag:** "[Service/Product] — [Benefit] | [Brand]" (< 60 chars)
- **Meta description:** 120-160 chars, includes CTA ("Get started free", "See pricing")
- **URL slug:** `/[service-name]`, `/products/[product-name]`, `/[service]-[city]`
- **Structured data:** `Service`, `Product` with `Offer`, or `LocalBusiness`
  where it matches the page. Use the [schema decision tree](../../schema-markup-generator/references/schema-decision-tree.md).

---

## Search Intent Matching

| Intent | Keyword Signals | Content Type |
|--------|----------------|-------------|
| **Informational** | "how to", "what is", "guide" | Blog post, tutorial |
| **Commercial** | "best", "vs", "review", "top" | Comparison, listicle |
| **Transactional** | "buy", "price", "near me" | Landing/product page |
| **Navigational** | brand name, product name | Homepage, product page |

**How to verify:** search the keyword incognito, look at top 5 results. Match
that format — don't fight the SERP.

**Mismatch = won't rank:**
- Blog post targeting "buy [product]" → should be product page
- Product page targeting "how to [task]" → should be tutorial
- Generic page targeting "[service] in [city]" → should be location page

---

## On-Page SEO Checklist

### Must-Have
- [ ] Title tag with primary keyword, < 60 chars
- [ ] Meta description with keyword + CTA, 120-160 chars
- [ ] Single H1 with primary keyword
- [ ] Logical heading hierarchy (H1 → H2 → H3)
- [ ] Primary keyword in first 100 words naturally
- [ ] Internal links to 3-5 related pages
- [ ] Images have descriptive alt text
- [ ] Image file signatures, dimensions, and metadata match the published assets
- [ ] URL is short, readable, includes keyword slug
- [ ] Compliance-sensitive claims are backed by official sources and scoped correctly

### Should-Have
- [ ] Applicable structured data matches visible content
- [ ] External links to authoritative sources
- [ ] Author byline with credentials
- [ ] Last-updated date for evergreen content
- [ ] Open Graph + Twitter Card meta tags

### Required for blog posts (in addition to Must-Have)
- [ ] Hook-driven title — number, contrarian claim, named audience, or curiosity gap
- [ ] Table of contents at the top with working anchor links
- [ ] Featured/thumbnail image (also used as `og:image` / structured-data `image`)
- [ ] ≥ 3 inline images (diagram, screenshot, comparison, or data viz)
- [ ] ≥ 1000 words of substantive body content
- [ ] FAQ section with 3–5 questions targeting People Also Ask

---

## Anti-Patterns

### Content Anti-Patterns
- **Keyword stuffing** — use the keyword naturally; synonyms after the first few placements
- **Thin content** — pages under 300 words competing for hard terms
- **Content for content's sake** — topics with no real expertise behind them
- **Wall of text** — no headings, no lists, no visual breaks
- **Duplicate intent** — two pages targeting same keyword = cannibalization
- **Stale content** — outdated stats, deprecated methods, old pricing

### AI Content Anti-Patterns
Google doesn't penalize AI content per se — it penalizes unhelpful content.
Common AI failure modes:
- Generic summaries restating common knowledge
- Excessive hedging ("it depends", "many factors") without commitments
- Missing experience signals — no examples, data, or first-hand knowledge
- Perfect grammar, zero original insight

**Fix:** inject real data, specific examples, original analysis, concrete
recommendations. Make it something only someone with actual expertise could write.
