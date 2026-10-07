# AXAMP — We build proof.

The website for **AXAMP Private Limited**, a viral video marketing agency for real estate developers, consultants and brokers — and for hospitals, universities and personal brands.

The site shows real proof instead of claims: real videos, real campaign numbers and a clear path from first view to a booked call.

## Pages

| Page | What it shows |
| --- | --- |
| **Home** | Hero, the six kinds of proof (3D video rings), ad performance, the lead engine and a closing call to action |
| **Services** | Every service AXAMP offers, grouped into monthly and one-time work |
| **Packages** | Pricing plans |
| **About** | The story, the founder, the team and how AXAMP works |
| **Contact** | A step-by-step contact form that emails each lead to the team |

The home page can switch between industries — **Real Estate**, **Hospital** and **University** — and each one has its own proof videos.

## Built with

- [React 19](https://react.dev) and [Vite](https://vite.dev)
- [Tailwind CSS 4](https://tailwindcss.com) for styling
- [GSAP](https://gsap.com) with ScrollTrigger for scroll animations
- [Lenis](https://lenis.darkroom.engineering) for smooth scrolling
- [React Router](https://reactrouter.com) for pages
- [Resend](https://resend.com) for contact form emails
- [Lucide](https://lucide.dev) icons

## Run it on your computer

You need [Node.js](https://nodejs.org) 20 or newer.

```bash
# 1. Install the packages
npm install

# 2. Add your settings
cp .env.example .env
#    then open .env and add your Resend API key

# 3. Start the site
npm run dev
```

Then open the address it prints (usually http://localhost:5173).

### Other commands

```bash
npm run build     # build the site for production into dist/
npm run preview   # preview the production build
```

## Settings

The contact form needs these values in `.env` (locally) or in your hosting dashboard (in production):

| Name | Required | What it is |
| --- | --- | --- |
| `RESEND_API_KEY` | Yes | Your API key from Resend |
| `CONTACT_TO_EMAIL` | No | Where leads are sent. Separate several with commas. Default: `info@axamp.com` |
| `CONTACT_FROM_EMAIL` | No | The sender, e.g. `AXAMP Website <leads@yourdomain.com>`. Needs a domain verified in Resend |

`.env` is never committed. Use `.env.example` as the template.

## Project layout

```
api/
  contact.js        Sends contact form emails on Vercel and in `npm run dev`
public/
  api/contact.php   Sends contact form emails on Hostinger
  .htaccess         Page routing and security rules for Hostinger
  videos/           Self-hosted videos (see videos/README.txt)
  posters/          Cover images for the videos
  assets/           Team photos, logos and other images
src/
  pages/            One file per page
  components/       Sections and parts of the pages (Nav, Hero, Pillar, ...)
  data/             All the content — text, videos, prices, team
  lib/              Shared helpers (scrolling, navigation, animations)
  styles.css        Colours, fonts and global styles
```

## Changing the content

Most changes need no code — just edit the files in `src/data/`:

- **Proof videos** (real estate) — `src/data/work.js`
- **Hospital and university videos** — `src/data/hospital.js`, `src/data/university.js`
- **Services** — `src/data/services.js`
- **Prices** — `src/data/pricing.js`
- **Team and About page** — `src/data/about.js`
- **Phone, email and social links** — `src/data/site.js`

To add a new video, put the `.mp4` in `public/videos/`, a cover image in `public/posters/`, and list it in the right data file. `public/videos/README.txt` has the details.

## Deploying

### Hostinger (or any Apache / PHP host)

1. Make sure `.env` has your settings.
2. Run `npm run build`.
3. Upload everything inside `dist/` to `public_html`.

On these hosts the contact form is handled by `api/contact.php`. The build writes your settings into `dist/api/config.php`, and `.htaccess` stops anyone from opening that file in a browser. It is never committed to git.

### Vercel

Vercel builds with `npm run build`, serves `dist/`, and runs `api/contact.js` as a serverless function. Add the settings above in the Vercel dashboard before you deploy.

---

© AXAMP Private Limited. All rights reserved.
