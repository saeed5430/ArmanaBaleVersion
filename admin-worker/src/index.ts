import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { baleAdminAuthRoutes } from './bale/bale-admin-auth';
import { baleAdminRoutes } from './bale/bale-admin-routes';

type Bindings = {
  BALE_DB: D1Database;
  BALE_ORDER_BOT_TOKEN: string;
  JWT_SECRET: string;
  BASE_URL: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use('/api/*', cors({
  origin: [
    'https://scarfminiappbale-admin.pages.dev',
    'https://master.scarfminiappbale-admin.pages.dev',
    'http://localhost:3000',
    'http://localhost:5173',
  ],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

app.route('/api/bale-admin-auth', baleAdminAuthRoutes);
app.route('/api/bale-admin', baleAdminRoutes);

app.get('/api/health', (c) => c.json({ status: 'ok', service: 'scarf-bale-admin-api', timestamp: Date.now() }));

export default app;
