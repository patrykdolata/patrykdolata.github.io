# Feature: Deployment

## Standardized Spec

| Pole | Wartość |
|------|---------|
| **Milestone** | M1 (MVP) |
| **Priority** | CRITICAL |
| **Status** | ✅ Complete |
| **Goal** | Produkcyjny deployment (PL) z TLS, reverse proxy, monitoringiem i backup/DR |
| **Target** | Raspberry Pi 4B, Ubuntu 22.04 |

---

## Status Implementacji

| Komponent | Status | Uwagi |
|-----------|--------|-------|
| PostgreSQL 15 | ✅ | Skonfigurowane |
| Java 21 + Spring Boot | ✅ | Systemd service |
| Nginx reverse proxy | ✅ | Skonfigurowane |
| SSL (Let's Encrypt) | ✅ | Auto-renewal |
| UFW firewall | ✅ | 22, 80, 443 |
| Backup scripts | ✅ | Nightly cron |
| Monitoring (basic) | ⏳ | Prometheus/Grafana opcjonalnie |

## Overview
Deploy the Meet App to Raspberry Pi 4B with PostgreSQL, Nginx reverse proxy, SSL certificates, monitoring, and automated backups.

**Priority**: PRODUCTION REQUIREMENT | **Status**: 0% → 100%

## Milestone & Scope

- Milestone: M1 (MVP)
- Scope (M1):
  - Docker compose local test
  - Serwer prod: PostgreSQL + Spring Boot (systemd) + Nginx + SSL (Let's Encrypt)
  - Prosty monitoring (uptime/error logs)

## Acceptance Criteria (M1)

- Aplikacja dostępna online, endpointy zdrowe (health)
- Certyfikat SSL, reverse proxy działa
- Krótkie smoke testy na produkcji (login, create event, cancel, list)

## Business Value
- Application accessible to real users
- Production-ready infrastructure
- Secure HTTPS access
- Automated backups prevent data loss
- Monitoring ensures uptime

---

## Infrastructure

**Target Environment:**
- Device: Raspberry Pi 4B (4GB+ RAM recommended)
- OS: Ubuntu Server 22.04 LTS (ARM64)
- Database: PostgreSQL 15
- Web Server: Nginx
- SSL: Let's Encrypt (Certbot)
- Backend: Java 21 + Spring Boot
- Frontend: Flutter Web (or serve mobile APK)

---

## Phase 1: Raspberry Pi Setup (4h)

### 1.1 Install Ubuntu Server

1. Download Ubuntu Server 22.04 LTS ARM64
2. Flash to SD card using Raspberry Pi Imager
3. Boot and connect via SSH
4. Update system:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git vim htop
```

### 1.2 Configure Hostname and Network

```bash
# Set hostname
sudo hostnamectl set-hostname meetapp-server

# Configure static IP (optional)
sudo vim /etc/netplan/50-cloud-init.yaml

# Apply network config
sudo netplan apply
```

### 1.3 Setup Firewall

```bash
sudo apt install ufw
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## Phase 2: PostgreSQL Installation (3h)

### 2.1 Install PostgreSQL 15

```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

### 2.2 Create Database and User

```bash
sudo -u postgres psql

-- In PostgreSQL shell:
CREATE DATABASE meetapp;
CREATE USER meetapp_user WITH PASSWORD 'SecurePassword123!';
GRANT ALL PRIVILEGES ON DATABASE meetapp TO meetapp_user;
\q
```

### 2.3 Configure PostgreSQL

Edit `/etc/postgresql/15/main/postgresql.conf`:

```conf
# Performance tuning for Raspberry Pi 4 (4GB RAM)
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 4MB
min_wal_size = 1GB
max_wal_size = 4GB
max_connections = 100
```

Edit `/etc/postgresql/15/main/pg_hba.conf`:

```conf
# Allow local connections
local   all             all                                     peer
host    all             all             127.0.0.1/32            scram-sha-256
host    all             all             ::1/128                 scram-sha-256
```

Restart PostgreSQL:

```bash
sudo systemctl restart postgresql
```

### 2.4 Test Connection

```bash
psql -h localhost -U meetapp_user -d meetapp -W
```

---

## Phase 3: Java & Backend Deployment (8h)

### 3.1 Install Java 21

```bash
sudo apt install -y openjdk-21-jdk
java -version
```

### 3.2 Create Application User

```bash
sudo useradd -r -m -s /bin/bash meetapp
sudo mkdir -p /opt/meetapp
sudo chown meetapp:meetapp /opt/meetapp
```

### 3.3 Build Backend

```bash
cd meet-app-be
./mvnw clean package -DskipTests

# Copy JAR to server
scp target/meet-app-be-0.0.1-SNAPSHOT.jar pi@<raspberry-pi-ip>:/tmp/
```

On Raspberry Pi:

```bash
sudo mv /tmp/meet-app-be-0.0.1-SNAPSHOT.jar /opt/meetapp/meet-app.jar
sudo chown meetapp:meetapp /opt/meetapp/meet-app.jar
```

### 3.4 Create Application Configuration

**File**: `/opt/meetapp/application.properties`

```properties
# Server
server.port=8080

# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/meetapp
spring.datasource.username=meetapp_user
spring.datasource.password=SecurePassword123!

# JPA/Hibernate
spring.jpa.hibernate.ddl-auto=none
spring.jpa.show-sql=false

# Flyway
spring.flyway.enabled=true
spring.flyway.baseline-on-migrate=true

# JWT
jwt.secret=your-very-long-secret-key-at-least-256-bits-long
jwt.expiration=86400000
jwt.refresh-expiration=604800000

# CORS
cors.allowed-origins=https://yourdomain.com,http://localhost:3000

# Logging
logging.level.root=INFO
logging.level.pl.flutterowo.meetappbe=DEBUG
logging.file.name=/opt/meetapp/logs/application.log
```

### 3.5 Create Systemd Service

**File**: `/etc/systemd/system/meetapp.service`

```ini
[Unit]
Description=Meet App Backend
After=postgresql.service
Requires=postgresql.service

[Service]
Type=simple
User=meetapp
Group=meetapp
WorkingDirectory=/opt/meetapp
ExecStart=/usr/bin/java -jar \
    -Xms512m -Xmx1g \
    -Dspring.config.location=/opt/meetapp/application.properties \
    /opt/meetapp/meet-app.jar
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

### 3.6 Start Backend Service

```bash
sudo systemctl daemon-reload
sudo systemctl enable meetapp
sudo systemctl start meetapp
sudo systemctl status meetapp

# View logs
sudo journalctl -u meetapp -f
```

---

## Phase 4: Nginx Setup (4h)

### 4.1 Install Nginx

```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 4.2 Configure Nginx Reverse Proxy

**File**: `/etc/nginx/sites-available/meetapp`

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect HTTP to HTTPS (will be enabled after SSL setup)
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL certificates (to be generated)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Logging
    access_log /var/log/nginx/meetapp_access.log;
    error_log /var/log/nginx/meetapp_error.log;

    # API backend proxy
    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Swagger UI
    location /swagger-ui/ {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
    }

    # Frontend (if serving Flutter web build)
    location / {
        root /var/www/meetapp;
        try_files $uri $uri/ /index.html;
        expires 7d;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    gzip_min_length 1000;
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/meetapp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## Phase 5: SSL Certificate (3h)

### 5.1 Install Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 5.2 Obtain Certificate

```bash
# Stop nginx temporarily
sudo systemctl stop nginx

# Get certificate
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Start nginx
sudo systemctl start nginx
```

### 5.3 Setup Auto-Renewal

Certbot installs a systemd timer automatically. Verify:

```bash
sudo systemctl list-timers | grep certbot
```

Test renewal:

```bash
sudo certbot renew --dry-run
```

---

## Phase 6: Monitoring & Logging (5h)

### 6.1 Install Monitoring Tools

```bash
sudo apt install -y prometheus node-exporter grafana
```

### 6.2 Configure Prometheus

**File**: `/etc/prometheus/prometheus.yml`

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'node'
    static_configs:
      - targets: ['localhost:9100']
  
  - job_name: 'spring-boot'
    metrics_path: '/actuator/prometheus'
    static_configs:
      - targets: ['localhost:8080']
```

Enable Spring Boot Actuator in backend:

**pom.xml:**
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-registry-prometheus</artifactId>
</dependency>
```

**application.properties:**
```properties
management.endpoints.web.exposure.include=health,info,prometheus
management.metrics.export.prometheus.enabled=true
```

### 6.3 Setup Log Rotation

**File**: `/etc/logrotate.d/meetapp`

```conf
/opt/meetapp/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 meetapp meetapp
    sharedscripts
    postrotate
        systemctl reload meetapp > /dev/null 2>&1 || true
    endscript
}
```

### 6.4 Access Grafana

```bash
sudo systemctl enable grafana-server
sudo systemctl start grafana-server

# Access at http://<raspberry-pi-ip>:3000
# Default login: admin/admin
```

Add Prometheus data source in Grafana and create dashboards.

---

## Phase 7: Backup Strategy (5h)

### 7.1 Database Backup Script

**File**: `/opt/meetapp/scripts/backup-db.sh`

```bash
#!/bin/bash

BACKUP_DIR="/opt/meetapp/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/meetapp_$DATE.sql.gz"
RETENTION_DAYS=30

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Perform backup
pg_dump -h localhost -U meetapp_user -d meetapp | gzip > "$BACKUP_FILE"

# Delete old backups
find "$BACKUP_DIR" -name "meetapp_*.sql.gz" -mtime +$RETENTION_DAYS -delete

# Log result
if [ $? -eq 0 ]; then
    echo "$(date): Backup successful: $BACKUP_FILE" >> /var/log/meetapp-backup.log
else
    echo "$(date): Backup FAILED" >> /var/log/meetapp-backup.log
    exit 1
fi
```

Make executable:

```bash
chmod +x /opt/meetapp/scripts/backup-db.sh
```

### 7.2 Setup Automated Backup Cron

```bash
sudo crontab -e

# Add daily backup at 2 AM
0 2 * * * /opt/meetapp/scripts/backup-db.sh
```

### 7.3 Offsite Backup (Optional)

Use rsync to copy backups to remote server:

```bash
# In backup script, add:
rsync -avz /opt/meetapp/backups/ user@backup-server:/backups/meetapp/
```

Or use cloud storage:

```bash
# Install rclone
curl https://rclone.org/install.sh | sudo bash

# Configure cloud provider
rclone config

# Add to backup script:
rclone sync /opt/meetapp/backups/ remote:meetapp-backups/
```

---

## Phase 8: Frontend Deployment (3h)

### Option A: Flutter Web

```bash
cd meet-app-fe/app
flutter build web --release

# Copy to Nginx directory
sudo mkdir -p /var/www/meetapp
sudo cp -r build/web/* /var/www/meetapp/
sudo chown -R www-data:www-data /var/www/meetapp
```

### Option B: Mobile APK Distribution

```bash
# Build APK
flutter build apk --release

# Host on server
sudo mkdir -p /var/www/meetapp/downloads
sudo cp build/app/outputs/flutter-apk/app-release.apk /var/www/meetapp/downloads/meetapp.apk
```

Update Nginx config to serve downloads:

```nginx
location /downloads/ {
    alias /var/www/meetapp/downloads/;
    autoindex on;
}
```

---

## Phase 9: Health Checks & Alerts (2h)

### 9.1 Health Check Endpoint

Already available: `/actuator/health`

### 9.2 Setup Uptime Monitoring

Use external services:
- UptimeRobot (free)
- Pingdom
- StatusCake

Or self-hosted:

```bash
sudo apt install -y monit

# Configure monit
sudo vim /etc/monit/monitrc
```

**Monit config:**
```conf
check host meetapp with address localhost
    if failed port 8080 protocol http
        request "/actuator/health"
        with timeout 30 seconds
        for 2 cycles
    then alert
```

---

## Testing Checklist

- [ ] PostgreSQL accessible and secured
- [ ] Backend starts without errors
- [ ] Flyway migrations applied
- [ ] API accessible via Nginx
- [ ] HTTPS working with valid certificate
- [ ] All API endpoints responding
- [ ] Frontend served correctly
- [ ] Logs rotating properly
- [ ] Backups running daily
- [ ] Monitoring dashboards showing metrics
- [ ] Health checks passing
- [ ] Firewall rules correct
- [ ] Server survives reboot
- [ ] Performance acceptable

---

## Production Checklist

Before going live:

- [ ] Change all default passwords
- [ ] Generate new JWT secret (256+ bits)
- [ ] Configure CORS for production domain
- [ ] Setup SSL certificate
- [ ] Configure backups and test restore
- [ ] Setup monitoring and alerts
- [ ] Load test the application
- [ ] Review security (OWASP checklist)
- [ ] Document deployment process
- [ ] Create rollback plan
- [ ] Setup staging environment (optional)
- [ ] Configure rate limiting
- [ ] Setup CDN (optional)
- [ ] Verify GDPR compliance (if applicable)

---

## Maintenance

### Update Application

```bash
# Build new version
./mvnw clean package -DskipTests

# Stop service
sudo systemctl stop meetapp

# Backup current version
sudo cp /opt/meetapp/meet-app.jar /opt/meetapp/meet-app.jar.backup

# Deploy new version
sudo cp target/meet-app-be-0.0.1-SNAPSHOT.jar /opt/meetapp/meet-app.jar

# Start service
sudo systemctl start meetapp

# Monitor logs
sudo journalctl -u meetapp -f
```

### Restore Database

```bash
# Stop application
sudo systemctl stop meetapp

# Restore backup
gunzip -c /opt/meetapp/backups/meetapp_20250104_020000.sql.gz | \
    psql -h localhost -U meetapp_user -d meetapp

# Start application
sudo systemctl start meetapp
```

---

## Troubleshooting

**Application won't start:**
```bash
sudo journalctl -u meetapp -n 100
```

**Database connection issues:**
```bash
sudo -u postgres psql -c "SELECT * FROM pg_stat_activity;"
```

**Nginx errors:**
```bash
sudo nginx -t
tail -f /var/log/nginx/meetapp_error.log
```

**SSL certificate issues:**
```bash
sudo certbot certificates
sudo certbot renew --force-renewal
```

---

## Performance Optimization

1. **Enable connection pooling** (HikariCP - already in Spring Boot)
2. **Add Redis cache** for frequently accessed data
3. **Enable Nginx caching** for static assets
4. **Optimize database** with proper indexes
5. **Use CDN** for static content
6. **Enable HTTP/2** in Nginx (already enabled)
7. **Implement rate limiting** to prevent abuse
8. **Monitor and tune JVM** parameters

---

## Security Hardening

1. Keep system updated: `sudo apt update && sudo apt upgrade`
2. Use strong passwords
3. Disable root SSH login
4. Setup fail2ban for SSH protection
5. Regular security audits
6. Monitor logs for suspicious activity
7. Keep dependencies updated
8. Use secrets manager (Vault, AWS Secrets Manager)

---

## Acceptance Criteria

1. ✅ Application accessible via HTTPS
2. ✅ Database secure and backed up daily
3. ✅ Monitoring dashboards functional
4. ✅ Logs aggregated and rotated
5. ✅ SSL certificate auto-renewing
6. ✅ Backend restarts on failure
7. ✅ Performance acceptable (< 500ms API response)
8. ✅ Backup restoration tested
9. ✅ Documentation complete
10. ✅ Production checklist verified

---

## Cost Estimate

**One-time:**
- Raspberry Pi 4B (8GB): $75
- SD Card (128GB): $20
- Power supply: $10
- Case: $10
- **Total: ~$115**

**Monthly:**
- Electricity: ~$2
- Domain: ~$12/year ($1/month)
- **Total: ~$3/month**

---

## Notes for AI Agent

- Test deployment in staging first
- Document any deviations from this guide
- Keep passwords in secure password manager
- Setup automated monitoring alerts
- Create disaster recovery plan
- Consider containerization (Docker) for easier deployment
- For production, consider managed services (RDS, ElastiCache, etc.)
