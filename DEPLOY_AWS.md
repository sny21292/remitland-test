# AWS Deployment Guide

## Option 1: EC2 Instance (Simplest)

### Step 1: Launch EC2 Instance
1. Go to AWS Console → EC2 → Launch Instance
2. Select **Ubuntu 22.04 LTS** (free tier eligible: t2.micro)
3. Security Group — open these ports:
   - 22 (SSH)
   - 80 (HTTP)
   - 3000 (Next.js)
   - 8000 (Laravel API)
   - 6001 (Socket.IO)
4. Download your key pair (.pem file)

### Step 2: SSH into EC2
```bash
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@your-ec2-ip
```

### Step 3: Install Docker
```bash
sudo apt update
sudo apt install -y docker.io docker-compose
sudo usermod -aG docker ubuntu
# Log out and back in for group change to take effect
exit
ssh -i your-key.pem ubuntu@your-ec2-ip
```

### Step 4: Clone and Deploy
```bash
git clone https://github.com/your-username/remitland.git
cd remitland

# Set environment variables
export SUPABASE_DB_HOST=db.your-project.supabase.co
export SUPABASE_DB_PORT=5432
export SUPABASE_DB_NAME=postgres
export SUPABASE_DB_USER=postgres
export SUPABASE_DB_PASSWORD=your-password

# Build and start all services
docker-compose up -d --build

# Run migrations and seed
docker-compose exec backend php artisan migrate:fresh --seed
```

### Step 5: Access the App
- Frontend: http://your-ec2-ip:3000
- API: http://your-ec2-ip:8000/api
- Socket.IO: ws://your-ec2-ip:6001

---

## Option 2: Without Docker (directly on EC2)

### Step 1: Install dependencies on EC2
```bash
sudo apt update
sudo apt install -y php8.2 php8.2-pgsql php8.2-redis php8.2-curl php8.2-xml php8.2-mbstring composer nodejs npm redis-server

# Install PM2 for process management
sudo npm install -g pm2
```

### Step 2: Clone and setup
```bash
git clone https://github.com/your-username/remitland.git
cd remitland

# Backend setup
cd remitland-backend
composer install
cp .env.example .env
php artisan key:generate
# Edit .env with your Supabase credentials
nano .env
php artisan migrate:fresh --seed
npm install  # for socket server deps

# Frontend setup
cd ../remitland-frontend
npm install
npm run build
```

### Step 3: Start services with PM2
```bash
# Start all services as background processes
pm2 start "php artisan serve --host=0.0.0.0 --port=8000" --name backend
pm2 start "node socket-server.cjs" --name socket --cwd /home/ubuntu/remitland/remitland-backend
pm2 start "npm start" --name frontend --cwd /home/ubuntu/remitland/remitland-frontend
pm2 start "php artisan queue:work --sleep=3 --tries=3" --name queue --cwd /home/ubuntu/remitland/remitland-backend

# Save PM2 config so it survives restarts
pm2 save
pm2 startup
```

### Step 4: (Optional) Set up Nginx reverse proxy
```bash
sudo apt install -y nginx

# Create Nginx config
sudo tee /etc/nginx/sites-available/remitland << 'EOF'
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Socket.IO
    location /socket.io {
        proxy_pass http://localhost:6001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/remitland /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx
```
