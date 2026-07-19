# Graph Report - .  (2026-07-18)

## Corpus Check
- 174 files · ~83,643 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 804 nodes · 1351 edges · 66 communities (57 shown, 9 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 31 edges (avg confidence: 0.82)
- Token cost: 280,209 input · 0 output

## Community Hubs (Navigation)
- Server Routes & Validation Schemas
- Server Feature Controllers
- Server Runtime Dependencies
- Project Docs & Research Citations
- Server Dev Dependencies & Scripts
- Landing Page Sections
- Client Runtime Dependencies
- Client Auth Flow & Router Guards
- Onboarding UI Components
- Model API Schemas & Routes
- Client Dev Tooling
- Goals, Reports & Transactions Pages
- Categories/Goals Services & Errors
- Client Settings Page
- Client Dashboard Page
- Server App Bootstrap & Middleware
- Server-to-Model Integration
- Graphify Skill Documentation
- Server Auth Service & Mailer
- Client Topbar & Theme
- Model Profile & Archetype Scoring
- Alerts/Transactions Services
- Client Analysis Page
- Client Help & Static Pages
- Model i18n, Health & Sentiment
- Client App Layout & Sidebar
- Client Alerts Page & API Client
- Client Landing Layout & Nav
- DB Init Migration Schema
- Server Users Service
- Client Icon Sprite
- Model Purchase Impact Service
- Model Expense Prediction Service
- Server Env Config & Swagger
- Server Onboarding Service
- Model FastAPI Entrypoint
- Model Spending Pattern Service
- Server DB Seed Script
- Model Archetype Training Script
- Model Concern Classification Service
- Model Concern Training Script
- DB Onboarding Migration
- Graphify Clustering & Health Check
- Client Theme Config
- DB Score Snapshot Migration
- Graphify AST Extraction
- Favicon Brand Mark
- Hero Marketing Image

## God Nodes (most connected - your core abstractions)
1. `success()` - 53 edges
2. `useAuth()` - 33 edges
3. `useReveal()` - 25 edges
4. `fmtCurrency()` - 20 edges
5. `scripts` - 12 edges
6. `prisma` - 12 edges
7. `/graphify Pipeline` - 12 edges
8. `analyze()` - 11 edges
9. `Finmo Model Microservice` - 11 edges
10. `api` - 10 edges

## Surprising Connections (you probably didn't know these)
- `Zhu (2022) — Reddit Personal Finance Concerns` --semantically_similar_to--> `Zhu (2022) Empirical Thresholds (research_thresholds.json)`  [INFERRED] [semantically similar]
  doc/app.md → model/README.md
- `Zhu (2022) — Reddit Personal Finance Concerns` --semantically_similar_to--> `Zhu (2022) Study Reference (finmomodelia)`  [INFERRED] [semantically similar]
  doc/app.md → model.md
- `VADER Sentiment Analysis` --semantically_similar_to--> `BERT Multilingual Sentiment Model`  [INFERRED] [semantically similar]
  model.md → model/README.md
- `Zhu (2022) Study Reference (finmomodelia)` --semantically_similar_to--> `Zhu (2022) Empirical Thresholds (research_thresholds.json)`  [INFERRED] [semantically similar]
  model.md → model/README.md
- `Finmo Graphify CLAUDE.md Integration` --conceptually_related_to--> `/graphify Pipeline`  [INFERRED]
  CLAUDE.md → .claude/skills/graphify/SKILL.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Graphify Modular Reference Pipeline** — claude_skills_graphify_skill_graphify_pipeline, claude_skills_graphify_references_extraction_spec_node_id_format, claude_skills_graphify_references_update_incremental_update, claude_skills_graphify_references_query_traversal, claude_skills_graphify_references_hooks_commit_hook [INFERRED 0.85]
- **Finmo Model /analysis Endpoints** — model_readme_sentiment_service, model_readme_health_service, model_readme_patterns_service, model_readme_prediction_service, model_readme_purchase_service, model_readme_profile_service, model_readme_concerns_service [EXTRACTED 1.00]
- **Zhu (2022) Cross-Repo Citation Thread** — doc_app_zhu_2022, model_zhu_2022, model_readme_zhu_threshold [INFERRED 0.85]

## Communities (66 total, 9 thin omitted)

### Community 0 - "Server Routes & Validation Schemas"
Cohesion: 0.07
Nodes (44): router, router, router, concernSchema, financialHealthSchema, predictExpensesSchema, purchaseImpactSchema, sentimentSchema (+36 more)

### Community 1 - "Server Feature Controllers"
Cohesion: 0.07
Nodes (47): list(), markAllRead(), markRead(), unreadCount(), concerns(), financialHealth(), getLang(), predictExpenses() (+39 more)

### Community 2 - "Server Runtime Dependencies"
Cohesion: 0.04
Nodes (45): bcryptjs, bullmq, compression, cookie-parser, cors, dotenv, express, express-rate-limit (+37 more)

### Community 3 - "Project Docs & Research Citations"
Cohesion: 0.05
Nodes (43): Finmo Client HTML Entry, React+Vite Template, Agarwal & Modanwal (2025) — AI-Driven Personal Finance Assistants, Finmo Grado Proposal (Ficha Técnica), Gorai & Maurya (2025) — AI in Personal Finance Management, Manasa et al. (2025) — AI-Based Personal Finance Management System, Metodología Scrum, Objetivo General (+35 more)

### Community 4 - "Server Dev Dependencies & Scripts"
Cohesion: 0.05
Nodes (41): dotenv-cli, nodemon, pino-pretty, prisma, author, description, devDependencies, dotenv-cli (+33 more)

### Community 5 - "Landing Page Sections"
Cohesion: 0.13
Nodes (23): BenefitCard(), Benefits(), ICON_DATA, CTA(), DashboardPreview(), FeatureCard(), Features(), ICONS (+15 more)

### Community 6 - "Client Runtime Dependencies"
Cohesion: 0.06
Nodes (33): apexcharts, dependencies, apexcharts, i18next, i18next-browser-languagedetector, lucide-react, react, react-apexcharts (+25 more)

### Community 7 - "Client Auth Flow & Router Guards"
Cohesion: 0.13
Nodes (17): TabCuenta(), AuthButton(), AuthInput(), ForgotPasswordPage(), LoginPage(), PASSWORD_RULES, RegisterPage(), PASSWORD_RULES (+9 more)

### Community 8 - "Onboarding UI Components"
Cohesion: 0.13
Nodes (21): FormRow(), MoneyInput(), RadioGroup(), Select(), SliderInput(), StepButton(), OnboardingPage(), STEPS (+13 more)

### Community 9 - "Model API Schemas & Routes"
Cohesion: 0.16
Nodes (22): BaseModel, Enum, analyze_financial_health(), analyze_profile(), analyze_sentiment(), classify_concern(), predict_expenses(), AlertPriority (+14 more)

### Community 10 - "Client Dev Tooling"
Cohesion: 0.09
Nodes (23): devDependencies, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, tailwindcss, @tailwindcss/vite (+15 more)

### Community 11 - "Goals, Reports & Transactions Pages"
Cohesion: 0.14
Nodes (12): ContributeModal(), fmtDate(), GoalCard(), Goals(), MONTHLY_DATA, MONTHS, Reports(), fmtDate() (+4 more)

### Community 12 - "Categories/Goals Services & Errors"
Cohesion: 0.12
Nodes (4): ConflictError, ForbiddenError, NotFoundError, ValidationError

### Community 13 - "Client Settings Page"
Cohesion: 0.11
Nodes (10): EDUCATION_LEVELS, EMPLOYMENT_TYPES, FINANCIAL_GOALS, FIXED_EXPENSE_FIELDS, INCOME_SOURCES, Settings(), SPENDING_BEHAVIORS, STRESS_LABELS (+2 more)

### Community 14 - "Client Dashboard Page"
Cohesion: 0.16
Nodes (11): CanIBuyThis(), UncategorizedBanner(), WhatComesNext(), CategoriesCard(), Dashboard(), fmtDate(), getDateRange(), GoalsCard() (+3 more)

### Community 15 - "Server App Bootstrap & Middleware"
Cohesion: 0.18
Nodes (9): app, server, allowedOrigins, corsOptions, logger, authLimiter, generalLimiter, errorHandler() (+1 more)

### Community 16 - "Server-to-Model Integration"
Cohesion: 0.17
Nodes (9): modelClient, createAlert(), analyzeFinancialHealth(), analyzeProfile(), analyzeSpendingPattern(), predictExpenses(), toModelTransactions(), getSummary() (+1 more)

### Community 17 - "Graphify Skill Documentation"
Cohesion: 0.12
Nodes (17): Graphify Skill Trigger Reference, Finmo Graphify CLAUDE.md Integration, /graphify add, --watch Auto-Rebuild, Graphify Export Formats, Confidence Score Rubric, Node ID Format Rule, GitHub Clone & Cross-Repo Merge (+9 more)

### Community 18 - "Server Auth Service & Mailer"
Cohesion: 0.18
Nodes (10): sendMail(), transporter, refresh(), forgotPassword(), generateSecureToken(), generateTokens(), login(), refreshTokens() (+2 more)

### Community 19 - "Client Topbar & Theme"
Cohesion: 0.21
Nodes (9): ALERT_ICONS, NotificationBell(), timeAgo(), UserMenu(), TabPreferencias(), AuthLayout(), ThemeToggle(), ThemeContext (+1 more)

### Community 20 - "Model Profile & Archetype Scoring"
Cohesion: 0.20
Nodes (14): get_dict(), Return a nested dict for a dot-separated key.     Example: get_dict("profile.ar, ScoreBreakdown, analyze(), _classify_archetype(), _compute_score(), _day_of_week_spending(), _get_kmeans() (+6 more)

### Community 21 - "Alerts/Transactions Services"
Cohesion: 0.20
Nodes (4): prisma, listAlerts(), listTransactions(), getPaginationParams()

### Community 22 - "Client Analysis Page"
Cohesion: 0.14
Nodes (4): Analysis(), ARCHETYPE_GOAL, DAY_SHORT, MOOD_OPTIONS

### Community 23 - "Client Help & Static Pages"
Cohesion: 0.21
Nodes (7): FAQ_KEYS, Help(), CheckEmailPage(), HomePage(), PrivacyPage(), TermsPage(), router

### Community 24 - "Model i18n, Health & Sentiment"
Cohesion: 0.19
Nodes (10): get_list(), _load_locale(), Translate a dot-separated key.     Example: t("sentiment.rec_stress", "en"), Return a list for a dot-separated key., t(), FinancialHealthResponse, analyze(), analyze() (+2 more)

### Community 25 - "Client App Layout & Sidebar"
Cohesion: 0.20
Nodes (7): AppLayout(), AppSidebar(), BOTTOM_NAV, ICONS, PRIMARY_NAV, SidebarContent(), AppTopbar()

### Community 26 - "Client Alerts Page & API Client"
Cohesion: 0.21
Nodes (9): ALERT_ICONS, AlertCard(), Alerts(), PRIORITY_CONFIG, PRIORITY_MAP, timeAgo(), api, refreshTokens() (+1 more)

### Community 27 - "Client Landing Layout & Nav"
Cohesion: 0.33
Nodes (5): Footer(), Navbar(), LandingLayout(), LANGS, LangToggle()

### Community 28 - "DB Init Migration Schema"
Cohesion: 0.47
Nodes (8): `alerts`, `budgets`, `categories`, `goals`, `notifications`, `tokens`, `transactions`, `users`

### Community 30 - "Client Icon Sprite"
Cohesion: 0.52
Nodes (7): icons.svg (Icon Sprite Sheet), Bluesky Icon (butterfly logo), Discord Icon (game controller/mask logo), Documentation Icon (book/pages outline), GitHub Icon (Octocat logo), Social/Community Icon (person with star badge), X (Twitter) Icon

### Community 31 - "Model Purchase Impact Service"
Cohesion: 0.38
Nodes (6): analyze_purchase_impact(), PurchaseImpactRequest, PurchaseImpactResponse, analyze(), _monthly_payment(), Amortized monthly payment formula.

### Community 32 - "Model Expense Prediction Service"
Cohesion: 0.48
Nodes (6): analyze(), _day_of_week_features(), _month_index(), _month_key(), _next_month(), Count expenses per day-of-week for a given month.

### Community 33 - "Server Env Config & Swagger"
Cohesion: 0.29
Nodes (5): parsed, schema, options, setupSwagger(), swaggerSpec

### Community 34 - "Server Onboarding Service"
Cohesion: 0.52
Nodes (6): getOnboardingStatus(), saveStep1(), saveStep2(), saveStep3(), saveStep4(), skipOnboarding()

### Community 35 - "Model FastAPI Entrypoint"
Cohesion: 0.47
Nodes (4): FastAPI, _ensure_ml_models(), lifespan(), Train ML models if .joblib files don't exist yet.

### Community 36 - "Model Spending Pattern Service"
Cohesion: 0.40
Nodes (5): analyze_spending_pattern(), CategorySummary, SpendingPatternRequest, SpendingPatternResponse, analyze()

### Community 37 - "Server DB Seed Script"
Cohesion: 0.40
Nodes (5): DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES, main(), prisma, upsertDefaultCategory()

### Community 38 - "Model Archetype Training Script"
Cohesion: 0.50
Nodes (4): _generate_samples(), Train KMeans model for financial archetype classification.  Generates syntheti, Generate synthetic training data for each archetype., train()

### Community 39 - "Model Concern Classification Service"
Cohesion: 0.60
Nodes (4): analyze(), _keyword_classify(), _load_models(), Financial concern classifier using TF-IDF + LogisticRegression.  Classifies us

## Knowledge Gaps
- **165 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+160 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `success()` connect `Server Feature Controllers` to `Server Auth Service & Mailer`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **Why does `useAuth()` connect `Client Auth Flow & Router Guards` to `Onboarding UI Components`, `Goals, Reports & Transactions Pages`, `Client Settings Page`, `Client Dashboard Page`, `Client Topbar & Theme`, `Client Analysis Page`, `Client App Layout & Sidebar`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **Why does `prisma` connect `Alerts/Transactions Services` to `Server Routes & Validation Schemas`, `Server Onboarding Service`, `Categories/Goals Services & Errors`, `Server App Bootstrap & Middleware`, `Server-to-Model Integration`, `Server Auth Service & Mailer`, `Server Users Service`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _165 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Server Routes & Validation Schemas` be split into smaller, more focused modules?**
  _Cohesion score 0.06605222734254992 - nodes in this community are weakly interconnected._
- **Should `Server Feature Controllers` be split into smaller, more focused modules?**
  _Cohesion score 0.07393483709273183 - nodes in this community are weakly interconnected._
- **Should `Server Runtime Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.044444444444444446 - nodes in this community are weakly interconnected._