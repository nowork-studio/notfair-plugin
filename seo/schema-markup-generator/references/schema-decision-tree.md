# Schema Type Decision Tree

Guidelines for selecting the right schema types based on content, industry, and implementation priority.

---

## When to Use Which Schema

Check [Google's supported structured data gallery](https://developers.google.com/search/docs/appearance/structured-data/search-gallery)
for current features and eligibility rules. Schema.org types describe content.
Google eligibility is evaluated separately for each supported feature.

| Retired Google feature | Audit and generation guidance |
|------------------------|-------------------------------|
| [FAQ rich results](https://developers.google.com/search/updates#deprecating-the-faq-rich-result-feature), May 2026 | `FAQPage` remains a Schema.org type for visible publisher-authored questions and answers. |
| [HowTo rich results](https://developers.google.com/search/blog/2023/08/howto-faq-changes), September 2023 | `HowTo` remains a Schema.org type for visible instructions. |
| [Sitelinks search box](https://developers.google.com/search/blog/2024/10/sitelinks-search-box), November 2024 | `WebSite` markup for site names still applies. Existing `SearchAction` markup can be left in place if another consumer uses it. |

Omission of markup for these retired features is not a Google Search gap.
Validate explicitly requested semantic markup with the Schema.org Validator.
[Google's generative AI features require no special schema](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide).

| Your Content | Primary Schema | Add If Applicable | Rich Result Eligibility |
|-------------|---------------|-------------------|----------------------|
| Blog post / article | Article | VideoObject | Article enhancements where supported |
| Product page | Product | Review, Offer, AggregateRating | Product snippet with price/rating |
| Service page | Service | LocalBusiness | Check other supported types where applicable |
| How-to guide | Article if editorial, HowTo if requested for semantic use | VideoObject | Check Article or Video eligibility where applicable |
| FAQ page | FAQPage if requested for semantic use | BreadcrumbList | FAQ rich results retired |
| Recipe | Recipe | Video, AggregateRating | Recipe carousel |
| Event | Event | Offer, Organization | Event snippet with date/location |
| Video | VideoObject | Article | Video carousel, key moments |
| Local business | LocalBusiness | Review, OpeningHoursSpecification | Local pack, knowledge panel |
| Person/author | Person | Organization | Knowledge panel |
| Organization | Organization | ContactPoint, Logo | Knowledge panel |
| Course | Course | Organization | Check current gallery for supported course features |
| Job posting | JobPosting | Organization | Google for Jobs listing |
| Breadcrumb | BreadcrumbList | (Always add alongside other schema) | Breadcrumb trail in SERP |
| Software/App | SoftwareApplication | Review, Offer | App snippet |

---

## Industry-Specific Schema Recommendations

| Industry | Essential Schema | High-Value Additions |
|----------|-----------------|---------------------|
| E-commerce | Product, BreadcrumbList, Organization | AggregateRating, Review |
| SaaS | SoftwareApplication, Organization | VideoObject, Review |
| Local Services | LocalBusiness, Service | Review, Event |
| Publishing/Media | Article, Person, Organization | VideoObject |
| Education | Course, Organization | Event |
| Healthcare | MedicalWebPage, Organization | Physician, MedicalClinic |
| Real Estate | RealEstateListing, Organization | LocalBusiness |
| Restaurants | Restaurant, Menu | Review, Event |

---

## Schema Implementation Priority

| Priority | Schema Types | Why |
|----------|-------------|-----|
| P0 -- Site identity | Organization, WebSite, BreadcrumbList where applicable | Describe the site and navigation |
| P1 -- Content | Article, VideoObject where applicable | Assess the supported feature and its requirements |
| P2 -- Commercial | Product, Review, AggregateRating, Offer | Revenue-impacting rich results |
| P3 -- Authority | Person, SameAs, Speakable | E-E-A-T signals, AI citation |
| P4 -- Specialized | Industry-specific types | Niche rich results |

---

## Schema Validation Quick Reference

| Issue | Impact | Fix |
|-------|--------|-----|
| Missing required property | Schema ignored by Google | Add all required fields (check schema.org) |
| Invalid date format | Warning, may lose rich result | Use ISO 8601: "2026-02-11" |
| Incorrect @type | Schema misinterpreted | Match @type exactly to schema.org |
| Self-referencing sameAs | Warning | sameAs should link to EXTERNAL profiles |
| Missing image for Article | Loses article rich result | Add image property with valid URL |
| Review without itemReviewed | Review not connected | Nest review inside Product/Service/etc. |
