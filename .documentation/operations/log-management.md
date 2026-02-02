# Log Management & Disk Space Guide for MamirriApp

## 🎯 Overview

This guide explains the complete log management and disk space monitoring setup for MamirriApp production deployments. Following these practices will prevent disk space issues and keep your logs organized.

---

## 📊 Current Setup

### What Gets Logged?

Your app generates several types of logs:

1. **Application Logs** (from your custom logger)
   - Page views, API calls, user actions (INFO level)
   - Warnings and errors (WARN/ERROR level)
   - Written to stdout → captured by Docker

2. **Docker Container Logs**
   - Each container (server, client, postgres, minio, redis) generates logs
   - Stored in `/var/lib/docker/containers/<container-id>/`
   - Can grow large without rotation

3. **System Logs**
   - Systemd journal (if using systemd)
   - Nginx/Caddy web server logs
   - System-level events

### Log Rotation Configuration

All containers in `docker-compose.prod.yml` now have log rotation:

```yaml
logging:
  driver: 'json-file'
  options:
    max-size: '50m' # Max size per log file
    max-file: '3' # Keep only 3 files
```

**Total log space per container:**

- Server: 150MB max (50MB × 3 files)
- Client: 60MB max (20MB × 3 files)
- PostgreSQL: 60MB max (20MB × 3 files)
- MinIO: 60MB max (20MB × 3 files)
- Redis: 60MB max (20MB × 3 files)

**Maximum total Docker logs:** ~390MB

---

## 🚀 Quick Start (Production)

### Step 1: Set Production Log Level

Edit your production `.env` file:

```bash
# Reduce from INFO to WARN for production
LOG_LEVEL=warn

# Or even stricter:
# LOG_LEVEL=error
```

**Why?**

- INFO logs: ~1000 logs/day per user
- WARN logs: ~10-50 logs/day per user
- ERROR logs: ~0-5 logs/day per user

For MVP with 10 users:

- INFO: 10,000 logs/day = 3.6GB/year
- WARN: 500 logs/day = 180MB/year
- ERROR: 50 logs/day = 18MB/year

### Step 2: Deploy with Log Rotation

Logs are now automatically rotated by Docker. Just deploy:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Step 3: Setup Automated Cleanup

Run the cleanup script manually first to test:

```bash
sudo ./scripts/cleanup-logs.sh
```

Then add to crontab for daily cleanup:

```bash
# Edit crontab
sudo crontab -e

# Add this line for daily cleanup at 3 AM
0 3 * * * /path/to/mamirri-app/scripts/cleanup-logs.sh >> /var/log/mamirri/cleanup.log 2>&1
```

### Step 4: Setup Disk Monitoring

Add to crontab for hourly monitoring:

```bash
# Check disk space every hour
0 * * * * /path/to/mamirri-app/scripts/monitor-disk.sh >> /var/log/mamirri/monitor.log 2>&1
```

---

## 📁 Scripts Reference

### 1. cleanup-logs.sh

**Purpose:** Removes old logs and rotates large files

**What it does:**

- Rotates Docker container logs >50MB
- Deletes backup logs older than 7 days
- Vacuums systemd journal
- Prunes unused Docker data (if disk >80%)
- Reports freed space

**Usage:**

```bash
# Manual run
sudo ./scripts/cleanup-logs.sh

# Automated (crontab)
0 3 * * * /path/to/mamirri-app/scripts/cleanup-logs.sh
```

**Configuration:**
Edit the script to change:

- `RETENTION_DAYS=7` (how long to keep logs)
- `MIN_FREE_SPACE_GB=5` (minimum free space warning)

### 2. monitor-disk.sh

**Purpose:** Monitors disk space and alerts on high usage

**What it does:**

- Checks disk usage every hour
- Sends alerts at 80% (warning) and 90% (critical)
- Reports Docker disk usage
- Shows largest directories
- Auto-runs cleanup at 90%

**Usage:**

```bash
# Manual run
sudo ./scripts/monitor-disk.sh

# Automated (crontab)
0 * * * * /path/to/mamirri-app/scripts/monitor-disk.sh
```

**Configuration:**
Edit the script to set:

- `WARNING_THRESHOLD=80` (warning %)
- `CRITICAL_THRESHOLD=90` (critical %)
- `EMAIL_ALERT="your@email.com"` (for email alerts)
- `SLACK_WEBHOOK="https://hooks.slack.com/..."` (for Slack alerts)

---

## 🔧 Manual Log Management

### View Current Logs

```bash
# View server logs in real-time
docker logs -f physio_server

# View last 100 lines
docker logs --tail 100 physio_server

# View logs since 1 hour ago
docker logs --since 1h physio_server

# View all container logs
docker-compose -f docker-compose.prod.yml logs
```

### Check Log File Sizes

```bash
# See Docker container log sizes
sudo du -h /var/lib/docker/containers/*/local-logs/*.log | sort -h

# See total Docker log usage
sudo du -sh /var/lib/docker/containers/

# Check overall disk usage
df -h
```

### Clear Logs Manually

```bash
# Clear specific container log
sudo sh -c 'cat /dev/null > /var/lib/docker/containers/<container-id>/local-logs/container.log'

# Clear all container logs (DANGEROUS - use cleanup script instead!)
# sudo find /var/lib/docker/containers -name "*.log" -exec sh -c 'cat /dev/null > "{}"' \;
```

---

## 🚨 Troubleshooting

### Issue: "No space left on device"

**Symptoms:** App crashes, can't write to database

**Quick Fix:**

```bash
# 1. Check disk usage
df -h

# 2. Run emergency cleanup
sudo ./scripts/cleanup-logs.sh

# 3. Prune Docker aggressively
sudo docker system prune -a --volumes -f

# 4. Check again
df -h
```

**Long-term Fix:**

- Reduce LOG_LEVEL to 'warn' or 'error'
- Increase server disk size
- Run cleanup script daily

### Issue: "Disk usage at 95% but cleanup doesn't help"

**Investigate:**

```bash
# Find largest directories
sudo du -h / | sort -rh | head -20

# Check Docker volume sizes
sudo docker system df

# Check for core dumps
sudo find / -name "core.*" -type f -size +100M 2>/dev/null

# Check for large backup files
sudo ls -lh /var/backups/
```

### Issue: "Logs not rotating"

**Check:**

```bash
# Verify Docker logging driver
docker info | grep -i logging

# Check container log config
docker inspect physio_server | grep -A 5 LogConfig

# View actual log file
ls -lh /var/lib/docker/containers/$(docker inspect -f '{{.Id}}' physio_server)/local-logs/
```

---

## 📈 Monitoring Dashboard

### Create a Simple Status Script

Create `scripts/status.sh`:

```bash
#!/bin/bash
echo "=== MamirriApp Status ==="
echo "Disk Usage:"
df -h / | tail -1
echo ""
echo "Docker Containers:"
docker ps --format "table {{.Names}}\t{{.Status}}"
echo ""
echo "Container Log Sizes:"
du -h /var/lib/docker/containers/*/local-logs/*.log 2>/dev/null | sort -h | tail -5
echo ""
echo "Recent Errors (last hour):"
docker logs --since 1h physio_server 2>&1 | grep -i error | tail -5
```

Run with: `sudo ./scripts/status.sh`

---

## 💾 Recommended Server Specs

### Minimum (MVP Stage)

- **Disk:** 20GB SSD
- **RAM:** 1GB
- **CPU:** 1 core
- **Log space:** ~400MB (with rotation)

### Recommended (Growth Stage)

- **Disk:** 40GB SSD
- **RAM:** 2GB
- **CPU:** 2 cores
- **Log space:** ~1GB (with rotation)

### Log Retention Strategy

**For 20GB disk:**

- Docker logs: Auto-rotate at 50MB per container
- Application logs: Keep 7 days
- Backups: Keep 7 days
- System logs: Keep 7 days

**Expected usage:**

- Docker: ~400MB
- App data: ~1-2GB (database)
- Media storage: ~5-10GB (patient files)
- Free space: ~10GB buffer

---

## 🔐 Security & Privacy

### Log Sanitization

Your logger already sanitizes:

- ✅ Passwords
- ✅ Email addresses
- ✅ Phone numbers
- ✅ SSN/credit cards
- ✅ Authorization tokens

**Verify in production:**

```bash
# Check that sensitive data isn't in logs
docker logs physio_server | grep -i "password\|token\|secret" | head -5
# Should return nothing or only redacted values
```

### GDPR/Clinical Compliance

- Logs contain correlation IDs but NOT patient names
- Stack traces may show file paths (acceptable)
- Rotate logs regularly (7 days recommended)
- Access logs only via secure SSH

---

## 📚 Additional Resources

### Docker Logging Drivers

**json-file (default):**

- Good for small deployments
- Automatic rotation with our config
- Easy to read

**journald (systemd):**

- Better integration with Linux
- Automatic rotation
- View with `journalctl -u docker`

**syslog:**

- Send to external syslog server
- Good for centralized logging

Change in docker-compose:

```yaml
logging:
  driver: 'journald'
```

### External Log Aggregation (Future)

When you grow beyond MVP, consider:

- **Grafana Loki** (free, open source)
- **ELK Stack** (Elasticsearch + Logstash + Kibana)
- **Fluentd** (log collector)

These aggregate logs from multiple sources into a searchable dashboard.

---

## ✅ Checklist for Production Deployment

Before deploying to production:

- [ ] Set `LOG_LEVEL=warn` in production `.env`
- [ ] Verify Docker log rotation in docker-compose.prod.yml
- [ ] Setup `cleanup-logs.sh` in crontab (daily)
- [ ] Setup `monitor-disk.sh` in crontab (hourly)
- [ ] Test cleanup script manually
- [ ] Verify at least 10GB free disk space
- [ ] Check log sanitization (no passwords in logs)
- [ ] Document server SSH access for log checks
- [ ] Set up email/Slack alerts in monitor-disk.sh (optional)

---

## 🆘 Emergency Contacts

**If disk fills up:**

1. SSH to server
2. Run: `sudo ./scripts/cleanup-logs.sh`
3. Check: `df -h`
4. If still full: `sudo docker system prune -a --volumes -f`
5. Restart containers: `docker-compose -f docker-compose.prod.yml restart`

**If app is down:**

1. Check container status: `docker ps`
2. Check logs: `docker logs physio_server`
3. Check disk: `df -h`
4. Restart: `docker-compose -f docker-compose.prod.yml up -d`

---

## 📞 Need Help?

If you need to:

- Adjust log retention periods
- Add custom log filtering
- Setup centralized logging
- Troubleshoot disk issues

Check the scripts in `/scripts/` directory or review this guide.

---

**Last Updated:** 2026-02-02
**Version:** MVP Production Setup
