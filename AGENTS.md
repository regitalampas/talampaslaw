# AGENTS.md

## WHY
Use this file to onboard coding agents quickly to the law-firm website project.  
Keep this file short and only include guidance that applies to most tasks.

## WHAT (update these from your project)
- Project: `TalampasLaw`
- Legal firm name: `The Law Firm of Talampas & Associates`
- Primary goal:
  - Consultation booking and lead generation
- Audience:
  - Individual clients (individuals, families, institutions) seeking legal representation in the Philippines
- Deployment target:
  - Not specified (typically static-hosted sites)

## HOW (fill in these project details)
- Tech stack:
  - Frontend: plain `HTML/CSS/JS`
  - Styling: custom CSS with `Domine` headings, `Roboto` body
  - Colors: `#390d2f` (primary maroon), `#c9a84c` (gold), `#ef6c11` (CTA orange), `#faf8f5` (off-white)
  - Backend: none currently
- Build/test workflow:
  - Package manager: none
  - Build command: none
  - Dev command: open `index.html` directly or Live Server in VS Code
  - Test/lint command: none
- Jurisdiction:
  - Philippines; primarily Quezon City and Metro Manila
- Repo layout:
  - Direct edits are currently done against plain files; CMS is not in place yet.

## Personal project details (to complete next)
Use these fields to help an agent respond with the right voice, legal terminology, and UI/marketing constraints.
- Firm/brand name:
  - The Law Firm of Talampas & Associates
- Physical office location:
  - Unit 202 Philippine College of Surgeons, 992 EDSA, Brgy. Sto. Cristo beside SM North EDSA Annex Bldg 1105, Quezon City, Philippines
- Jurisdiction(s) served:
  - Philippines; primarily Quezon City and Metro Manila
- Practice areas (priority order):
  - Family Law
  - Corporate Law
  - Labor Law
  - Cybercrime Law
  - Environmental Law
  - Civil Law, Arbitration & ADR, Banking & Insurance, Intellectual Property, Taxation, Immigration, Mining, Real Estate, Product Liability
- Attorney names/credentials:
  - Atty. Ruben C. Talampas Jr. — Managing Partner
  - Atty. Clarolyn Jane A. Capellan — Associate Lawyer
  - Atty. Jan Aldrin E. Afos — Associate Lawyer
  - Atty. Louella O. Janda — Associate Lawyer
  - Atty. Geelleanne L. Ubalde — Associate Lawyer
- Brand tone:
  - Professional, trustworthy, approachable, faith-driven, community-focused
- Contact details:
  - Primary phone: 289620069
  - Email: talampasandassociates@yahoo.com
  - Business hours: 9 AM to 5 PM (PST, UTC+8)
- Conversion goals:
  - Primary CTAs: "Book a Consultation" (hero and practice areas), "Contact Us" (navbar)
- Privacy/ethics constraints:
  - IBP (Integrated Bar of the Philippines) Code of Professional Responsibility (Canon 3 advertising rules, no improper advertising)
  - Client testimonials require IBP compliance review and written consent
- Key integrations:
  - None required now; CMS to be decided when blog section is built

## Required disclaimers (must not be modified without explicit approval)
- Attorney-client disclaimer (must appear in footer of every page):  
  `The information on this website is for general informational purposes only and does not constitute legal advice. Visiting this website or contacting the firm does not create an attorney-client relationship.`
- Results disclaimer (for outcome/representation content):  
  `Past results do not guarantee similar outcomes. Every case is unique and results may vary.`
- Jurisdictional notice:  
  `The Law Firm of Talampas & Associates is authorized to practice law in the Philippines only.`

## Prohibited or constrained language
- Do not use:
  - outcome guarantees (`guaranteed to win`, `assured results`, `100% success rate`)
  - unverified superlatives (`best`, `number one`, `top-rated`)
  - specialization claims (`specialist`, `expert`) — prefer `experienced in` / `focused on`
  - misleading fee promises (`cheapest`, `lowest rates guaranteed`)
  - pressure/urgency tactics
  - language implying attorney-client relationship from website visit
- Always keep mission/brand references aligned:
  - Tagline: `Professionalism. Integrity. Excellence.`
  - Mission: faith-driven, 18 years of experience, fighting for individuals, families, and institutions
  - Vision: equitable legal solutions for all

## Agent operating rules
- Follow existing code style; don’t invent new style rules here.
- Prefer existing deterministic tooling (formatter/linter/tests) over manual style fixes.
- If you add temporary files for diagnostics, remove them before finishing.
- Ask before editing legal disclaimers, attorney bios, contact details, or marketing/legal copy.
- Do not alter contact details and disclaimer text without explicit firm approval.
- Do not store secrets in this repository (API keys, tokens, credentials).

## Progressive disclosure
If this file gets too long, move task-specific guidance into separate docs such as:
- `agent_docs/build_and_deploy.md`
- `agent_docs/cms_and_content.md`
- `agent_docs/design_system.md`
