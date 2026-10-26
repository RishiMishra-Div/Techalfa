# TechAlfa Community Platform

The application is split into two npm workspaces:

- `frontend/`: React 19, React Router, and Vite website.
- `backend/`: Node.js and Express API, MongoDB persistence through Mongoose, and SMTP email through Nodemailer.

## Install dependencies

Run this from the project root:

```sh
npm install
```

## Run locally

Copy `backend/.env.example` to `backend/.env` and set the MongoDB and SMTP values. Copy `frontend/.env.example` to `frontend/.env`; the default API proxy is already set for local development.

Start the API and website in separate terminals from the project root:

```sh
npm run dev:backend
npm run dev:frontend
```

The frontend is served at the Vite URL, normally `http://localhost:5173`. The backend API defaults to `http://localhost:3001`. The local Vite proxy forwards `/api` calls to the backend.

## Admin panel

The public site footer links to `/admin/login`. The panel uses an HTTP-only session cookie and stores events, opportunities, resources, registrations, messages, and site settings in MongoDB. Admins can add, replace, or remove event, opportunity, and resource thumbnails while creating or editing those records. Thumbnail images (PNG, JPEG, or WebP, up to 4 MB) are stored in MongoDB and served through the public media endpoint. There are no default admin credentials.

1. Copy `backend/.env.example` to `backend/.env` and set `MONGODB_URI`.
2. Run `npm run admin:hash --workspace @techalfa/backend`, enter a password of at least 12 characters, and copy the printed `ADMIN_PASSWORD_HASH` into `backend/.env`.
3. Set `ADMIN_EMAIL` and a random `ADMIN_SESSION_SECRET` of at least 32 characters in `backend/.env`.
4. Start the backend and frontend with the commands above, then visit `/admin/login`.

The admin API is organized under `backend/src/routes`; session validation is in `backend/src/auth` and `backend/src/middleware`; database connection handling is in `backend/src/services`; and each collection has its own model. `backend/src/index.js` only starts the server, while the existing public form API lives in `backend/src/app.js`.

## Student portal

Students can open `/student` or choose **Student Portal** from the site navigation. After signing in, a person menu stays available when they return to the public website, with dashboard, profile, settings, and sign-out links. The student dashboard separates upcoming registrations from past events; its Events section contains only events that student registered for. Students can update their private profile and change their password in Settings. Passwords are hashed with bcrypt; session JWTs are held in an HTTP-only cookie and are never stored in browser local storage. Event signups are saved in MongoDB with a unique registration ID. The portal sends an account confirmation email and event registration confirmations using the SMTP settings above. Set `STUDENT_JWT_SECRET` to a private random value of at least 32 bytes. If SMTP is unavailable, the account or event registration remains saved and the portal reports the email delivery issue.

## MongoDB

The backend uses MongoDB through Mongoose. It stores community registrations in `community_registrations`, student accounts in `students`, student event signups in `studenteventregistrations`, contact form messages in `contact_messages`, and partnership enquiries in `partner_inquiries`, all in the database named by `MONGODB_URI`. For local MongoDB, the example URI is `mongodb://127.0.0.1:27017/techalfa`. For MongoDB Atlas, use the connection string from the Atlas project and keep its credentials only in `backend/.env` or the deployment's secret environment variables.

Each document contains the submitted fields, consent, timestamps, a request ID used to avoid duplicate submissions, and an email delivery status (`pending`, `sent`, or `failed`). The backend saves a valid submission before sending it through SMTP. It reports success only after SMTP accepts the email. If email delivery fails, the record remains stored with a failed status so the submission is not silently lost.

## Environment settings

Backend settings are listed in `backend/.env.example`:

- `MONGODB_URI`: local MongoDB or Atlas connection string.
- `STUDENT_JWT_SECRET`: random secret of at least 32 bytes used to sign student session JWTs.
- `HR_EMAIL`: recipient of community registration notifications.
- `CONTACT_EMAIL`: recipient of contact messages (defaults to `techalfa2026@gmail.com`).
- `PARTNERS_EMAIL`: recipient of partnership enquiries (defaults to `CONTACT_EMAIL`).
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, and optional `SMTP_FROM`: email provider settings.
- `FRONTEND_ORIGINS`: comma-separated browser origins allowed to call the API.
- `SERVER_PORT`, `HOST`, and `TRUST_PROXY_HOPS`: optional server settings.

Frontend settings are in `frontend/.env.example`:

- `VITE_API_BASE_URL`: leave blank in development to use Vite's proxy; set to the backend origin when frontend and backend are deployed separately.
- `VITE_API_PROXY_TARGET`: local backend URL used by Vite's development proxy.

Never commit `.env` files or put database or SMTP credentials in frontend code.

## Build and run

```sh
npm run build
npm start
```

Build the frontend before deploying it to a static host. Deploy the backend separately with its environment variables. Set `VITE_API_BASE_URL` to the deployed API origin (for example, the Render service URL without a trailing slash) in the frontend deployment environment, then rebuild/redeploy the frontend. Add the frontend origin (for example, `https://techalfa-sand.vercel.app`) to `FRONTEND_ORIGINS` on the backend. Production admin session cookies use `SameSite=None; Secure` so they can be sent between the separately hosted frontend and backend.

## Content notes

The events and three available images come from the existing project. The images are event artwork, not documentary event photos. The UI includes About, Events, TechAlfa 2.0, Team, Opportunities, Community, Gallery, Resources, Partners, Contact, Privacy and Terms pages. Team profiles, approved logo and photos, official social/invite links, authentic gallery media, confirmed TechAlfa 2.0 schedule and registration details, and the CFS reference still need to be supplied before those can be shown as real information. Homepage figures and sample testimonials are clearly marked as placeholders.
