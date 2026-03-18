# Changelog

## [1.4.0](https://github.com/haunguyendev/portfolio-v2/compare/v1.3.0...v1.4.0) (2026-03-18)


### Features

* **api,web:** add AI chatbot with RAG pipeline ([fcbbdf0](https://github.com/haunguyendev/portfolio-v2/commit/fcbbdf049767571e0727889009b19eac200e720e))
* **api,web:** add knowledge base management and fix embedding model ([5b6b0f5](https://github.com/haunguyendev/portfolio-v2/commit/5b6b0f5819e62d229499b6aea40d486aa3275743))

## [1.3.0](https://github.com/haunguyendev/portfolio-v2/compare/v1.2.0...v1.3.0) (2026-03-18)


### Features

* add certificate management with dashboard CRUD and portfolio display ([525fd1d](https://github.com/haunguyendev/portfolio-v2/commit/525fd1d86d28247141a2a103b04c678939bcabb4))
* **web:** show external link icon on certificate cards with credential URL ([64e085b](https://github.com/haunguyendev/portfolio-v2/commit/64e085b60c45f9bbbaa1dcb0e50bec1231920d68))


### Bug Fixes

* **api:** add certificates to allowed media serve prefixes ([8748269](https://github.com/haunguyendev/portfolio-v2/commit/87482694827213da2d51dae5d9212c690a16e69e))
* **api:** add certificates to allowed upload folders ([d244948](https://github.com/haunguyendev/portfolio-v2/commit/d244948a496e415d8ded2337ebf8c16217e5f0a8))
* **api:** auto-construct Coursera certificate image URL ([3f3ed6c](https://github.com/haunguyendev/portfolio-v2/commit/3f3ed6ce753f11226a50485338a121b3a6b08653))
* **api:** extract cert title from Coursera embedded JSON data ([363b779](https://github.com/haunguyendev/portfolio-v2/commit/363b7794b27969ddec51ee7b115d2667135ff508))
* **api:** extract completion date from Coursera grantedAt timestamps ([aede033](https://github.com/haunguyendev/portfolio-v2/commit/aede0337e034f0e387fa52535341ba8cd3cc2a4c))
* **api:** handle Coursera SPA share links in URL extractor ([37dbe91](https://github.com/haunguyendev/portfolio-v2/commit/37dbe91fc323a32010292fcaa529e6ee40620a23))
* **deploy:** pass GitHub OAuth env vars to web container ([6782e0a](https://github.com/haunguyendev/portfolio-v2/commit/6782e0ae5afd44c4994e3d0554ce205c34c2e23a))
* **web:** handle cert images correctly — Coursera URLs return HTML not images ([846cde5](https://github.com/haunguyendev/portfolio-v2/commit/846cde571d97b1ccaf485468f3c8eb4dbba5e38b))
* **web:** only show local images in certificate card thumbnails ([608a4fb](https://github.com/haunguyendev/portfolio-v2/commit/608a4fb1f8586b5fb0ee548d25e729c5c132cd93))
* **web:** proxy media images via Next.js rewrites to fix private IP blocking ([553afc3](https://github.com/haunguyendev/portfolio-v2/commit/553afc3abfa5bab1a5fa05cbe5915a4585c8f9d9))
* **web:** resolve project image 404s, diary mood crash, and mood input UX ([3fc2e38](https://github.com/haunguyendev/portfolio-v2/commit/3fc2e38320c4497d17498731c0866e0f77c8ef1f))

## [1.2.0](https://github.com/haunguyendev/portfolio-v2/compare/v1.1.1...v1.2.0) (2026-03-18)


### Features

* **auth:** replace email/password with GitHub OAuth login ([4d3bcb6](https://github.com/haunguyendev/portfolio-v2/commit/4d3bcb6e6bcb4c1a5842424790c9f53a54d95e91))

## [1.1.1](https://github.com/haunguyendev/portfolio-v2/compare/v1.1.0...v1.1.1) (2026-03-18)


### Bug Fixes

* add GHCR login to deploy step for private package pull ([824b777](https://github.com/haunguyendev/portfolio-v2/commit/824b777f4353e0dc7bb7265ff7a068fa48fc68d6))
* set correct file ownership for Next.js ISR cache writes ([8d58acd](https://github.com/haunguyendev/portfolio-v2/commit/8d58acd2c99652acc5318f91868b9b08331c072e))


### Performance Improvements

* optimize CI/CD with parallel conditional builds ([23961eb](https://github.com/haunguyendev/portfolio-v2/commit/23961eb2edc1fbd4d41b6c9b675651ecae7053aa))

## [1.1.0](https://github.com/haunguyendev/portfolio-v2/compare/v1.0.0...v1.1.0) (2026-03-17)


### Features

* add Docker containerization and CI/CD pipeline ([3e2ff03](https://github.com/haunguyendev/portfolio-v2/commit/3e2ff0362459972100a8891723fef1c6f64669ef))

## 1.0.0 (2026-03-17)


### Features

* add admin dashboard, TipTap editor, Better Auth, and GraphQL client ([d80665b](https://github.com/haunguyendev/portfolio-v2/commit/d80665b726c822082381776c09052496404e0cf9))
* add animated life-source-code terminal with char-by-char typing ([87bed09](https://github.com/haunguyendev/portfolio-v2/commit/87bed0999bb4a2c109003fc3619d0478e244266f))
* add animated page title transition on navigation ([b8b4dce](https://github.com/haunguyendev/portfolio-v2/commit/b8b4dce529889d589815047fb49dd91385d4e00e))
* add Better Auth integration, admin login page, and proxy guard ([5c740fa](https://github.com/haunguyendev/portfolio-v2/commit/5c740faf4068b4712226bdb681a7d0ae4b4309e6))
* add blog and diary system with MDX powered by Velite ([577d2f1](https://github.com/haunguyendev/portfolio-v2/commit/577d2f15c526b297adf707b8a0923fc29986f0ee))
* add contact section with animated CTA and latest blog placeholder ([91acc9f](https://github.com/haunguyendev/portfolio-v2/commit/91acc9fd7a60d587cdb86c1e8ac8fe13d899fa8c))
* add diary page placeholder and update navigation ([a528d58](https://github.com/haunguyendev/portfolio-v2/commit/a528d58092182156acc660dd6a09b3cfe0f475ea))
* add GitHub stats section and fix username to haunguyendev ([6899fe4](https://github.com/haunguyendev/portfolio-v2/commit/6899fe4c1a0f1d7e6977762f8622e1815b254f2e))
* add GraphQL API with posts, projects, categories, tags, series modules ([b74b51a](https://github.com/haunguyendev/portfolio-v2/commit/b74b51a74423d840b9fbd23db745af6900e6abad))
* add hover lift and image zoom to project cards ([46a9cd4](https://github.com/haunguyendev/portfolio-v2/commit/46a9cd483e20eed983a3a64c3de8b025ef4a32c3))
* add latest blog section with coming soon placeholder ([b621726](https://github.com/haunguyendev/portfolio-v2/commit/b621726f26aa342eb5d032553df5d3d58526cdf5))
* add logo and favicon with dark/light theme support ([7be0227](https://github.com/haunguyendev/portfolio-v2/commit/7be02278fb8cff9fa209a3f4f0d2d7d00a4b067e))
* add MySQL, SQL Server, Cloudflare, macOS to tech stack ([e537dfd](https://github.com/haunguyendev/portfolio-v2/commit/e537dfdec88d0b6e8a4113c6b586771ec67a7557))
* add NestJS API with Prisma, JWT auth guard, and PostgreSQL setup ([232dc21](https://github.com/haunguyendev/portfolio-v2/commit/232dc2113083e8ad40a6b9fa1c66d1ea7d07fc9a))
* add project category badges and mock company/freelance projects ([90366d3](https://github.com/haunguyendev/portfolio-v2/commit/90366d3b28e59873d3b840aba6cf76e1464e8e14))
* add project metadata fields (role, team size, impact, dates) ([9e14cdb](https://github.com/haunguyendev/portfolio-v2/commit/9e14cdbd5c6e61f93c6ffd1d21ce12fa94488714))
* add project timeline dates to project cards ([f0442d1](https://github.com/haunguyendev/portfolio-v2/commit/f0442d1836c757b28b61f41b2505657ff63945d0))
* add role, team size, and impact metadata to project cards ([6c47d6f](https://github.com/haunguyendev/portfolio-v2/commit/6c47d6fc47a8234b0b23c8c37da70b2684be08e8))
* add rotating titles with glow effect and location to hero ([e36781a](https://github.com/haunguyendev/portfolio-v2/commit/e36781a4d4da3a5d057697754036691226fa4371))
* add secret keyboard portal to admin dashboard ([90140cb](https://github.com/haunguyendev/portfolio-v2/commit/90140cb11172000d9a349d24ebe5d72d12a49e16))
* add seed script and MDX-to-TipTap converter ([d5564e7](https://github.com/haunguyendev/portfolio-v2/commit/d5564e7fc8f9772cb4ffb2dd599f365aef4ba600))
* add self-hosted image upload with MinIO ([c67288e](https://github.com/haunguyendev/portfolio-v2/commit/c67288e70dcdac98dd045b35ccd56ec50d06b633))
* add SEO metadata, dark mode polish, and lint fixes ([b0050d2](https://github.com/haunguyendev/portfolio-v2/commit/b0050d2872f63d2b83c1388f3afc89797c206ba4))
* add theme switching (light/dark/system) and command palette ([f3f2a44](https://github.com/haunguyendev/portfolio-v2/commit/f3f2a4440066fc0bed5bfa240afb4e31a7fd9e8f))
* add typewriter animation to hero section name ([171fe7c](https://github.com/haunguyendev/portfolio-v2/commit/171fe7c923abb4e4a2ad05f044b5ef04421d9552))
* implement Phase 1 portfolio MVP ([58928bb](https://github.com/haunguyendev/portfolio-v2/commit/58928bb9f7411a729160bdc690bcdc44ac3afae4))
* initial commit ([984f1b1](https://github.com/haunguyendev/portfolio-v2/commit/984f1b126e8d979854671b40ac4db69109c746db))
* migrate to Turborepo monorepo structure ([3c26223](https://github.com/haunguyendev/portfolio-v2/commit/3c26223aa868eed6b64ae3db9bd581b9afab04f5))
* redesign about bio section with photo, social links, and resume download ([07fcd95](https://github.com/haunguyendev/portfolio-v2/commit/07fcd95b902b97481caa141d9d1bbdec232a627d))
* redesign about preview with bento grid and tabbed tech stack ([fd3e0ee](https://github.com/haunguyendev/portfolio-v2/commit/fd3e0ee71cd3700d2e85aa970f1de46e2a7220db))
* redesign footer with multi-column nav like nelsonlai.dev ([e073f5f](https://github.com/haunguyendev/portfolio-v2/commit/e073f5fef671ef83fef208b1692c33b41a2e5496))
* refactor public pages to fetch from GraphQL API with TipTap renderer ([b0c5f78](https://github.com/haunguyendev/portfolio-v2/commit/b0c5f783a4ae67bf9d106426b7fea190479c5cf7))
* upgrade about page skills with tabbed icons and authentic bio copy ([4754927](https://github.com/haunguyendev/portfolio-v2/commit/47549279c1440560ae62ab2ac910ceebdba60251))


### Bug Fixes

* move login page outside admin layout, fix buttonVariants in server components ([c1ac050](https://github.com/haunguyendev/portfolio-v2/commit/c1ac0504e04eacdeae98108ebc1700150cfaf9fb))
* replace JWT auth with session token strategy for Better Auth compat ([414ae6e](https://github.com/haunguyendev/portfolio-v2/commit/414ae6e73971c4b68aa715f0bdcba451dd6517f4))
* resolve hydration issues and optimize component rendering ([4a6cb17](https://github.com/haunguyendev/portfolio-v2/commit/4a6cb174237531c503abddf8a5733fe4f354b294))
* resolve hydration mismatch and update hero/avatar images ([221ef7b](https://github.com/haunguyendev/portfolio-v2/commit/221ef7b6fa4d12d82df3012984555566e24a2a22))
* resolve test blockers — auth guard, lint config, JSX in try/catch ([840832e](https://github.com/haunguyendev/portfolio-v2/commit/840832e82b311bf2987eefb1a5258cc51a8ca832))
* switch logo between light and dark themes ([5356a12](https://github.com/haunguyendev/portfolio-v2/commit/5356a121dd385fa3219dc1543a7f4609960e5764))
* update experience data with actual company and university info ([9e304b5](https://github.com/haunguyendev/portfolio-v2/commit/9e304b50fce06fec5ab94751bb07b9cc401fa2b6))
* update FPT Software internship with real project details ([dc377bd](https://github.com/haunguyendev/portfolio-v2/commit/dc377bd15bc105ada9f42ef1f0dc7a3fc73d5850))


### Performance Improvements

* lazy-load CommandMenu and TechStackTabs, remove react-icons barrel import ([78a7de9](https://github.com/haunguyendev/portfolio-v2/commit/78a7de9fcf7bad4941b461df684f5f725d818d4a))
