import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/*
 * Runs the serverless functions in /api (e.g. api/contact.js) during
 * `npm run dev` and `npm run preview`, the way Vercel runs them in
 * production: POST /api/contact → api/contact.js's default export,
 * with req.body parsed and Vercel-style res.status().json().
 */
function localApi() {
  const handle = async (req, res, next) => {
    const match = req.url?.match(/^\/api\/([\w-]+)\/?(?:\?.*)?$/)
    const file = match && path.resolve('api', `${match[1]}.js`)
    if (!file || !fs.existsSync(file)) return next()

    try {
      let raw = ''
      for await (const chunk of req) raw += chunk
      try {
        req.body = raw ? JSON.parse(raw) : {}
      } catch {
        req.body = raw
      }

      res.status = (code) => {
        res.statusCode = code
        return res
      }
      res.json = (data) => {
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify(data))
      }

      // Fresh import each time so edits to the function apply without a restart
      const mod = await import(`${pathToFileURL(file).href}?t=${Date.now()}`)
      await mod.default(req, res)
    } catch (err) {
      console.error(`[api] ${req.url} failed:`, err)
      if (!res.headersSent) {
        res.statusCode = 500
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ success: false, message: 'Server error' }))
      }
    }
  }

  return {
    name: 'local-api',
    configureServer: (server) => void server.middlewares.use(handle),
    configurePreviewServer: (server) => void server.middlewares.use(handle),
  }
}

/*
 * Hostinger runs PHP, not the /api/*.js functions: the live contact form
 * goes to public/api/contact.php, and this writes its settings from .env
 * into dist/api/config.php (outside the JS bundle; .htaccess blocks it).
 */
const MAILER_KEYS = ['RESEND_API_KEY', 'CONTACT_TO_EMAIL', 'CONTACT_FROM_EMAIL']
const phpString = (v) => `'${v.trim().replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`

function phpMailerConfig(env) {
  return {
    name: 'php-mailer-config',
    apply: 'build',
    generateBundle() {
      if (!env.RESEND_API_KEY) this.warn('RESEND_API_KEY is not set — the live contact form will not send')
      const entries = MAILER_KEYS.filter((k) => env[k]?.trim()).map((k) => `  '${k}' => ${phpString(env[k])},`)
      this.emitFile({
        type: 'asset',
        fileName: 'api/config.php',
        source: `<?php\n// Written by \`npm run build\` from .env — private, never share or commit.\nreturn [\n${entries.join('\n')}\n];\n`,
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  // Expose .env to the /api functions (server side only — not bundled into the site)
  const env = loadEnv(mode, process.cwd(), '')
  for (const [key, value] of Object.entries(env)) process.env[key] ??= value

  return {
    plugins: [react(), tailwindcss(), localApi(), phpMailerConfig(env)],
  }
})
