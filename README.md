# CAPRICORN

## Nginx
```
sudo apt install nginx
```

```
sudo ufw allow 'Nginx Full'
```

```
sudo systemctl enable nginx
```

```
sudo nano /etc/nginx/sites-available/default
```

Add this, port 3000 is the port of node js

```
location /api {

        proxy_pass http://localhost:3000;
        
        proxy_http_version 1.1;
        
        proxy_set_header Upgrade $http_upgrade;
        
        proxy_set_header Connection 'upgrade';
        
        proxy_set_header Host $host;
        
        proxy_cache_bypass $http_upgrade;
        
    }
```
   
    
```
sudo systemctl reload nginx
```

## MongoDB
```
sudo apt-get install gnupg
```

```
curl -fsSL https://pgp.mongodb.com/server-6.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-6.0.gpg \
   --dearmor
```

```
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-6.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
```

```
sudo apt-get install -y mongodb-org=6.0.4 mongodb-org-database=6.0.4 mongodb-org-server=6.0.4 mongodb-org-mongos=6.0.4 mongodb-org-tools=6.0.4
```

```
sudo systemctl start mongod
```

```
sudo systemctl daemon-reload
```

```
sudo systemctl enable mongod
```

## Node.js by nvm

```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
```

```
source ~/.bashrc
```

```
nvm install lts/hydrogen
```

## Clone repo to /var/www/
