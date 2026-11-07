# TemuTaxi

Landing page, taxi driver registration, driver rating and admin panel for a Yandex Go partner in Georgia. Built with Next.js, TypeORM and MySQL, in Georgian, English and Russian. Taxi only: delivery is not offered.

## Run it

```bash
npm install
cp .env.example .env              # then fill in the values
npm run db:migrate                # creates the database tables
npm run cars:update               # downloads the official car lists into the database
npm run admin:create -- admin     # creates an admin and prints a password once
npm run dev                       # http://localhost:3000
```

**With real keys in `.env`, a submitted form creates a real driver in the park, even on localhost.**

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run lint` | Code checks |
| `npm run db:migrate` | Applies new database migrations |
| `npm run admin:create -- <name>` | Creates an admin, or resets their password |
| `npm run cars:update` | Downloads the official Yandex car lists into the database (the admin panel has the same button) |

## Pages

| Address | Page |
|---|---|
| `/` | Redirects to `/ka`, or to the language saved by the switcher |
| `/ka`, `/en`, `/ru` | Landing page |
| `/ka/register` | Taxi driver registration |
| `/ka/tariffs` | Car checker and car lists per category (linked from the footer only) |
| `/ka/leaderboard` | Leaderboard: top drivers, full rules, and live search by name or full phone number (`/ka/rating` redirects here) |
| `/admin` | Admin panel: registrations |
| `/admin/rating` | Rating status, update, settings, texts, drivers, history |
| `/admin/privacy` | Privacy policy text |
| `/admin/seo` | Search engine settings |
| `/sitemap.xml`, `/robots.txt`, `/manifest.webmanifest` | For search engines and phones |
| `/admin/cars` | Car list city and download |
| `/admin/password` | Change password |
| `POST /api/contractor/registration` | Receives the form and creates the driver |
| `GET /api/cron/rating-sync` | Updates the rating if the schedule says so; needs `Authorization: Bearer <CRON_SECRET>` |

## Where things are

```
src/
├─ proxy.ts                 Language redirect
├─ app/
│  ├─ [lang]/               Public pages
│  ├─ admin/                Admin panel: login, (panel)/ with one folder per page, actions.ts
│  └─ api/                  Registration and cron endpoints
├─ components/
│  ├─ landing/              Landing page sections (Rating.tsx is the rating)
│  ├─ rating/               Parts shared by the landing section and the rating page
│  ├─ register/             Registration form and its parts
│  ├─ tariffs/              Tariffs page
│  ├─ admin/                Admin panel forms
│  └─ CarChecker.tsx        "Which tariff fits my car" tool
├─ db/
│  ├─ entities.ts           Database tables
│  ├─ data-source.ts        Database connection
│  └─ migrations/           Changes to the tables
├─ lib/
│  ├─ registration.ts         Form fields, tariff logic, request JSON
│  ├─ registration-schema.ts  Registration rules (Zod)
│  ├─ fleet.ts                Yandex Fleet API calls
│  ├─ registrations.ts        Saves applications to the database
│  ├─ cars.ts                 Reads the car list from the database
│  ├─ jobs.ts                 Rating update and car list download
│  ├─ privacy.ts              Privacy policy text
│  ├─ seo.ts, seo-schema.ts   Search engine settings and page metadata
│  ├─ auto-list.ts            Reads the Yandex Pro car lists
│  ├─ rating/                 Schedule, ranking, search, period, names, texts, settings rules
│  └─ admin/                  Login, sessions, passwords
├─ data/
│  ├─ car-classes.ts          Car list types and helpers (the list itself is in the database)
│  └─ tariffs.ts, car-colors.ts
├─ config/site.ts           Contact details (placeholders)
└─ i18n/                    All text, one file per language
```

## How the rating works

The database stores one summary row per driver and tariff in `rating_drivers`: driver id, full name, order count, and the time of the latest order. Individual orders and delivery tariffs are not stored.

1. **Update.** `lib/jobs.ts` downloads the period's completed orders from Yandex (`POST /v1/parks/orders/list`), counts them, and replaces the stored rows in one transaction. A failed download leaves the old rating in place. The update time goes in `rating_settings.last_sync_at` and is shown on the site.
2. **Ranking.** `lib/rating/ranking.ts` adds up the chosen tariffs from the stored rows. More orders rank higher, and ties follow the admin's choice.
3. **Display.** The landing page shows the short conditions and the top `landingCount` drivers. `/ka/leaderboard` shows the top `pageCount`, the full rules, and a search. Visitors never cause a call to Yandex.
4. **Off.** The landing section and the menu link are not rendered, `/ka/leaderboard` redirects to the landing page, and no updates run.

**Schedule.** The admin panel chooses every hour or each midnight in Georgia. `src/instrumentation.ts` checks once a minute inside the server, which works with `next start` and `next dev`. After a failure it tries again 15 minutes later. Changing the period starts an update straight away; until it finishes, the site shows a short notice rather than numbers from another period.

**Hosting without a permanent server (Vercel).** The timer does not run there. Set `CRON_SECRET` and have a scheduler call `/api/cron/rating-sync` every hour. It updates only when the schedule in the admin panel says so.

**Search** shows results while the driver types (a server action, `app/[lang]/leaderboard/actions.ts`). A full 9-digit phone number also works when Yandex provides phones (`POST /v1/parks/driver-profiles/list`, which needs its own permission on the API key; without it the update still succeeds and the admin panel says why). Phones are stored as the last 9 digits for search only and never sent to the browser. Name search works in Georgian, Latin and Russian letters, because Yandex holds the names in Latin letters. It matches the full name but shows the name only in the form chosen in the admin panel. Hidden drivers are not found.

The API key needs permission to read orders; otherwise Yandex answers 403, and the reason appears at the top of the admin panel.

## How a registration works

1. **In the browser**, `RegisterForm` checks the values with `validateRegistration` and shows errors.
2. **On the server**, `route.ts` checks the request shape (`parseRegistration`) and the same rules again.
3. `registrations.ts` saves the application to the database, so it is kept even if Yandex refuses it.
4. `fleet.ts` asks Yandex for the park's work rules and confirms `WORK_RULE_ID` is enabled.
5. `fleet.ts` sends the driver to Yandex, which does its own checks and creates the profile.

If registration fails, the form shows a general error and keeps the typed data. **The exact reason is shown beside the application in the admin panel.** The form keeps one id across retries, so a repeat cannot create a second driver.

## Where data lives

The rating summary, settings and texts, the privacy policy text, applications, the car lists, admins and job history are in MySQL. Pages read them in Server Components, so the browser makes no separate request for them: the data arrives with the page. Other interface text (`src/i18n/`), contact details (`src/config/site.ts`) and the hidden demo tariff prices (`src/data/tariffs.ts`) are still in code.

## SEO

Each public page's title, description, hiding from Google, the site address and verification codes are edited at `/admin/seo` and stored in `site_settings.seo`. Until the first save, the texts come from the dictionaries.

`lib/seo.ts` builds the metadata with canonical and language links. It uses `use cache`, so the tags are in `<head>` from the first byte; saving in the admin panel clears the cache. Sitemap and robots follow the same settings. A hidden site stays crawlable, because Google must be able to read its `noindex`.

Icons are in `src/app` (`icon.svg`, `favicon.ico`, `apple-icon.png`) and `public` (`icon-192.png`, `icon-512.png`, `og-*.png`).

## Changing the database

Add a new file in `src/db/migrations/`, add it to the `migrations` list in `src/db/data-source.ts`, update `src/db/entities.ts`, and run `npm run db:migrate`. Never edit a migration that has already run.

## Common changes

| To change | Edit |
|---|---|
| Rating on/off, update schedule, driver counts, tie order, conditions and rules, period, names, prizes | `/admin/rating` |
| Privacy policy text | `/admin/privacy` |
| Page titles and descriptions, sitemap, Search Console code | `/admin/seo` |
| Car list city | `/admin/cars` |
| A registration rule | `src/lib/registration-schema.ts` |
| What is sent to Yandex | `buildDriverProfile` in `src/lib/fleet.ts` |
| Any text | `src/i18n/dictionaries/`, in all three languages |
| Contact details | `src/config/site.ts` |
| Show the hidden Bonuses section | `SHOW_BONUSES` in `src/app/[lang]/page.tsx` |
| Show the hidden prices | `SHOW_PRICES` in `src/app/[lang]/tariffs/page.tsx` |
