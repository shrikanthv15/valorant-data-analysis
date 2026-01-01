# Deploying Valorant Backend to AWS EC2

This guide details how to deploy your Flask backend to an AWS EC2 instance using Gunicorn and Nginx.

## Prerequisites
- AWS Account
- SSH Client (Terminal, PuTTY, etc.)
- Your code pushed to a Git repository (GitHub/GitLab)

## Step 1: Launch EC2 Instance
1. **Login to AWS Console** -> **EC2**.
2. **Launch Instance**.
   - **Name**: `valorant-backend`
   - **AMI**: Ubuntu Server 22.04 LTS (Free Tier Eligible)
   - **Instance Type**: t2.micro or t3.micro (Free Tier Eligible)
   - **Key Pair**: Create new (download the `.pem` file) or use existing.
   - **Network Settings**:
     - Allow SSH traffic from "My IP".
     - Allow HTTP traffic from the internet.
     - Allow HTTPS traffic from the internet.
3. **Launch Instance**.

## Step 2: Connect to Instance
Open your terminal where your key pair (`.pem`) is located:
```bash
chmod 400 your-key.pem
ssh -i "your-key.pem" ubuntu@<YOUR_EC2_PUBLIC_IP>
```

## Step 3: Server Setup
Update system and install dependencies:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install python3-pip python3-venv nginx git -y
```

## Step 4: Clone & Configure Application
Clone your repository (replace with your actual repo URL):
```bash
git clone https://github.com/yourusername/valorant-product.git
cd valorant-product/backend
```
*Note: If your repo is private, you may need to set up an SSH key or use a Personal Access Token.*

Set up virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install gunicorn
```

**Verify the CSV Data:**
Ensure your `data/` folder is present and contains the CSV files. The application will fail without them.

**Test Run:**
```bash
gunicorn --bind 0.0.0.0:5000 wsgi:app
```
- Visit `http://<YOUR_EC2_PUBLIC_IP>:5000` (You may need to open Port 5000 in your EC2 Security Group temporarily to test this directly).
- Press `Ctrl+C` to stop.

## Step 5: Configure Systemd (Keep App Running)
Create a service file:
```bash
sudo nano /etc/systemd/system/valorant.service
```

Paste the following (adjust paths if different):
```ini
[Unit]
Description=Gunicorn instance to serve Valorant Backend
After=network.target

[Service]
User=ubuntu
Group=www-data
WorkingDirectory=/home/ubuntu/valorant-product/backend
Environment="PATH=/home/ubuntu/valorant-product/backend/venv/bin"
ExecStart=/home/ubuntu/valorant-product/backend/venv/bin/gunicorn --workers 3 --bind unix:valorant.sock -m 007 wsgi:app

[Install]
WantedBy=multi-user.target
```
*Save (Ctrl+O, Enter) and Exit (Ctrl+X).*

Start and enable the service:
```bash
sudo systemctl start valorant
sudo systemctl enable valorant
```

## Step 6: Configure Nginx (Reverse Proxy)
Create site configuration:
```bash
sudo nano /etc/nginx/sites-available/valorant
```

Paste this:
```nginx
server {
    listen 80;
    server_name YOUR_EC2_PUBLIC_IP; # Or your domain name

    location / {
        include proxy_params;
        proxy_pass http://unix:/home/ubuntu/valorant-product/backend/valorant.sock;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/valorant /etc/nginx/sites-enabled
sudo rm /etc/nginx/sites-enabled/default
sudo systemctl restart nginx
```

## Step 7: Final Firewall Config
If you enabled `ufw` (firewall), allow Nginx:
```bash
sudo ufw allow 'Nginx Full'
```

## Verification
Visit `http://<YOUR_EC2_PUBLIC_IP>/api/matches` (or any valid endpoint) in your browser. You should see your JSON data.
