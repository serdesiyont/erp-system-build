# ERP System Build

A modern ERP web app for managing organizations, products, categories, customers, warehouses, inventory, purchasing, sales, production, and finance. See the live demo at https://erp-system-build.vercel.app/.

## Run locally

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Create a `.env` file with your database connection:

   ```bash
   DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DB
   ```

3. Migrate the database:

   ```bash
   pnpm run db:migrate
   ```

4. Start the dev server:

   ```bash
   pnpm run dev
   ```

Open http://localhost:3000 to use the app.
