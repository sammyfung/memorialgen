# Production Setup — Ubuntu + Nginx + HTTPS

This guide covers deploying Memorial Board as a full-stack server on Ubuntu, behind Nginx as a reverse proxy, with HTTPS via Let's Encrypt (recommended) or a self-signed certificate.

---

## Prerequisites

- Ubuntu 22.04 LTS (or 24.04)
- A domain name pointed at your server's IP (required for Let's Encrypt)
- Root or sudo access

---

## 1. Install Node.js 20

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v   # should print v20.x.x
```

---

## 2. Install Nginx

```bash
sudo apt-get install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

---

## 3. Install PM2 (process manager)

```bash
sudo npm install -g pm2
```

---

## 4. Deploy the Application

### Clone and install

```bash
cd /var/www
sudo git clone https://github.com/your-org/memorialgen.git memorial
sudo chown -R $USER:$USER /var/www/memorial
cd /var/www/memorial
npm install
```

### Configure environment

```bash
cp .env.example .env
nano .env
```

Minimum required variables:

```env
NUXT_ADMIN_PASSWORD=your-secure-admin-password
NUXT_SESSION_SECRET=a-random-32-character-string-here

# Optional: set a custom board title
NUXT_PUBLIC_SITE_TITLE=In Memory of ...
NUXT_PUBLIC_SITE_URL=https://memorial.example.com

# Prevent search engines from indexing (default: true)
# Set to false only if you want the site publicly indexed
NUXT_PUBLIC_NOINDEX=true

# Database — see "Database Setup" section below for all options
NUXT_DB_DIALECT=sqlite
NUXT_DB_URL=./data/memorial.db
```

---

## Database Setup

The app supports three database backends controlled by `NUXT_DB_DIALECT`. Choose one.

### Option A — SQLite (default, recommended for small deployments)

No extra installation needed. The database is a single file on disk.

```env
NUXT_DB_DIALECT=sqlite
NUXT_DB_URL=./data/memorial.db
```

Create the data directory and let the app initialise the schema on first start:

```bash
mkdir -p /var/www/memorial/data
```

The schema is created automatically via `CREATE TABLE IF NOT EXISTS` on startup. No manual migration step needed.

> **Backup:** simply copy `data/memorial.db` to a safe location.

---

### Option B — PostgreSQL

#### Install PostgreSQL

```bash
sudo apt-get install -y postgresql postgresql-contrib
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

#### Create a database and user

```bash
sudo -u postgres psql <<'SQL'
CREATE USER memorial WITH PASSWORD 'your-db-password';
CREATE DATABASE memorial_db OWNER memorial;
\q
SQL
```

#### Configure the app

```env
NUXT_DB_DIALECT=postgres
NUXT_DB_URL=postgresql://memorial:your-db-password@localhost:5432/memorial_db
```

#### Initialise the schema

```bash
cd /var/www/memorial
npm run db:push
```

> **Backup:** `pg_dump memorial_db > backup.sql`

---

### Option C — MariaDB / MySQL

#### Install MariaDB

```bash
sudo apt-get install -y mariadb-server
sudo systemctl enable mariadb
sudo systemctl start mariadb
sudo mariadb-secure-installation
```

#### Create a database and user

```bash
sudo mariadb <<'SQL'
CREATE DATABASE memorial_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'memorial'@'localhost' IDENTIFIED BY 'your-db-password';
GRANT ALL PRIVILEGES ON memorial_db.* TO 'memorial'@'localhost';
FLUSH PRIVILEGES;
EXIT;
SQL
```

#### Configure the app

```env
NUXT_DB_DIALECT=mariadb
NUXT_DB_URL=mysql://memorial:your-db-password@localhost:3306/memorial_db
```

#### Initialise the schema

```bash
cd /var/www/memorial
npm run db:push
```

> **Backup:** `mysqldump memorial_db > backup.sql`

---

### Create uploads directory

Regardless of database choice:

```bash
mkdir -p /var/www/memorial/public/uploads
```

### Build

```bash
npm run build
```

This runs `nuxt build` and the `postbuild` script that copies the native SQLite bindings.

---

## 5. Start the App with PM2

```bash
pm2 start /var/www/memorial/.output/server/index.mjs \
  --name memorial \
  --cwd /var/www/memorial \
  --env production

pm2 save
pm2 startup   # follow the printed command to enable auto-start on reboot
```

The app listens on port **3000** by default. To use a different port:

```bash
pm2 start /var/www/memorial/.output/server/index.mjs \
  --name memorial \
  --cwd /var/www/memorial \
  --env production \
  -- PORT=3001
```

Check it's running:

```bash
pm2 status
curl http://localhost:3000
```

---

## 6. Configure Nginx as Reverse Proxy

Create a site config:

```bash
sudo nano /etc/nginx/sites-available/memorial
```

Paste the following (HTTP only for now — HTTPS is added in step 7):

```nginx
server {
    listen 80;
    server_name memorial.example.com;   # <-- replace with your domain

    # Increase upload limit to match NUXT_UPLOAD_MAX_SIZE_MB (default 5 MB)
    client_max_body_size 10M;

    location / {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Serve uploaded images directly from disk (optional optimisation)
    location /uploads/ {
        alias /var/www/memorial/public/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable and reload:

```bash
sudo ln -s /etc/nginx/sites-available/memorial /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 7. Enable HTTPS

### Option A — Let's Encrypt (recommended for public sites)

Let's Encrypt provides free, trusted, auto-renewing certificates via Certbot.

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d memorial.example.com
```

Certbot will:
1. Obtain a certificate from Let's Encrypt
2. Automatically update your Nginx config to listen on 443 with SSL
3. Add a redirect from HTTP → HTTPS

Verify auto-renewal works:

```bash
sudo certbot renew --dry-run
```

Renewal runs automatically via a systemd timer (`certbot.timer`). No manual steps needed.

---

### Option B — Self-Signed Certificate (internal / dev use only)

> Self-signed certificates are **not trusted by browsers** and will show a security warning. Use this only for internal networks or local testing where you control the clients.

Generate a certificate valid for 10 years:

```bash
sudo mkdir -p /etc/nginx/ssl
sudo openssl req -x509 -nodes -days 3650 -newkey rsa:2048 \
  -keyout /etc/nginx/ssl/memorial.key \
  -out    /etc/nginx/ssl/memorial.crt \
  -subj "/CN=memorial.example.com/O=Memorial Board/C=HK"
```

Update `/etc/nginx/sites-available/memorial` to use the self-signed cert:

```nginx
server {
    listen 80;
    server_name memorial.example.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name memorial.example.com;

    ssl_certificate     /etc/nginx/ssl/memorial.crt;
    ssl_certificate_key /etc/nginx/ssl/memorial.key;

    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;

    client_max_body_size 10M;

    location / {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /uploads/ {
        alias /var/www/memorial/public/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## 8. Firewall

Allow HTTP, HTTPS, and SSH; block everything else:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

---

## 9. Updating the Application

```bash
cd /var/www/memorial
git pull
npm install
npm run build
pm2 restart memorial
```

---

## Troubleshooting

| Problem | Command |
|---|---|
| Check app logs | `pm2 logs memorial` |
| Check Nginx error log | `sudo tail -f /var/log/nginx/error.log` |
| Test Nginx config | `sudo nginx -t` |
| Restart app | `pm2 restart memorial` |
| Reload Nginx | `sudo systemctl reload nginx` |
| Check certificate expiry | `sudo certbot certificates` |

---

## File Locations Summary

| Item | Path |
|---|---|
| App root | `/var/www/memorial/` |
| Built output | `/var/www/memorial/.output/` |
| SQLite database | `/var/www/memorial/data/memorial.db` |
| Uploaded images | `/var/www/memorial/public/uploads/` |
| Environment config | `/var/www/memorial/.env` |
| Nginx site config | `/etc/nginx/sites-available/memorial` |
| Let's Encrypt certs | `/etc/letsencrypt/live/memorial.example.com/` |
| Self-signed certs | `/etc/nginx/ssl/` |
