# Turso Database Configuration for Vercel
# Run these commands to set up a free Turso database

# 1. Install Turso CLI
# macOS: brew install tursodatabase/tap/turso
# Windows: scoop bucket add tursodatabase https://github.com/tursodatabase/scoop-bucket.git && scoop install turso
# Linux: curl -sSfL https://get.tur.so/install.sh | bash

# 2. Create account and database (FREE - up to 9GB)
turso auth signup
turso db create vive-plus-pro

# 3. Get your database URL
turso db show vive-plus-pro --url

# 4. Get your auth token
turso db tokens create vive-plus-pro

# 5. Update .env with:
# DATABASE_URL=libsql://your-db.turso.io
# DATABASE_AUTH_TOKEN=your-token

# 6. Push schema
bun run db:push

# 7. Seed programs
bun run db:seed
