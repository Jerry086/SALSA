# Release Instructions for Deploying SALSA Backend on AWS EC2

## Development and Testing

### Prerequisites

1. An AWS account with S3 and EC2 access.
2. A MongoDB Atlas account with a database cluster.

### Setting Up the Local Development Environment

1. Ensure Python3 and pip are installed on your local machine.
2. Clone the project repository to your local machine.
   ```
   git clone https://github.com/Jerry086/SALSA.git
   ```
3. Navigate to backend directory and create a Python virtual environment.
   ```
   python3 -m venv venv
   source venv/bin/activate
   ```
4. Download model parameters and install all required dependencies by running shell script.
   ```
    chmod +x setup.sh
    ./setup.sh
   ```
5. Create a `.env` file in the backend directory and add the following environment variables: (**Replace `<Your-...>` with your own values**)
   ```
    AWS_ACCESS_KEY_ID=<Your-AWS-Access-Key-ID>
    AWS_SECRET_ACCESS_KEY=<Your-AWS-Secret-Access-Key>
    AWS_REGION=<Your-AWS-Region>
    AWS_BUCKET_NAME=<Your-AWS-Bucket-Name>
    MONGO_URI=<Your-MongoDB-URI>
    MONGO_DB=<Your-MongoDB-Database-Name>
    MONGO_COLLECTION=<Your-MongoDB-Collection-Name>
   ```
6. Run the Flask application locally.
   ```
   python3 app.py
   ```
7. Access the Flask application at `http://localhost:5000`.

[//]: # "This anchor is for a direct link back to the development environment setup"
[setup-dev-env]: #setting-up-the-local-development-environment

## Release Process for SALSA Backend on Amazon EC2

### Launch and Connect to an EC2 instance

1. Choose an Amazon Machine Image (AMI) with Ubuntu Server 22.04 LTS.
2. Select `t2.medium` or higher instance type. (Free tier 't2.micro' instance may not have enough resources to run the application.)
3. Create a new security group. Set rules to allow SSH (port 22) and HTTP (port 80) access from anywhere (0.0.0.0/0, ::/0).
4. After the instance is launched, connect to it using SSH:

```
ssh -i /path/to/your-key.pem ubuntu@<Your-Instance-Public-DNS>
```

5. If you encounter permission issues with the key file, run the following command to change the permissions:

```
chmod 400 /path/to/your-key.pem
```

### Setting Up the Environment

1. Update the package list and install Python virtual environment package:

```
sudo apt-get update
sudo apt-get install python3-venv
```

2. Repeated steps 2-6 from the [Setting Up the Local Development Environment][setup-dev-env] section. Make sure the application run successfully on the EC2 instance.

### Use Systemd to Manage Gunicorn

1. Create a new Systemd service file for Gunicorn:

```
sudo nano /etc/systemd/system/salsa.service
```

2. Add the following configuration to the file:

```
[Unit]
Description=Gunicorn instance for SALSA app
After=network.target
[Service]
User=ubuntu
Group=www-data
WorkingDirectory=/home/ubuntu/SALSA/salsa-be
ExecStart=/home/ubuntu/SALSA/salsa-be/venv/bin/gunicorn -b localhost:8000 app:app
Restart=always
[Install]
WantedBy=multi-user.target
```

3. Start the Gunicorn service and enable it to start on boot:

```
sudo systemctl start salsa
sudo systemctl enable salsa
```

4. Check if the service is running: (expected output: `Hello, World!`)

```
curl http://localhost:8000
```

### Setting Up Nginx as a Reverse Proxy

1. Install Nginx:

```
sudo apt-get install nginx
```

2. Start the Nginx service and enable it to start on boot:

```
sudo systemctl start nginx
sudo systemctl enable nginx
```

3. Edit the default Nginx configuration file:

```
sudo nano /etc/nginx/sites-available/default
```

4. Add the following code at the top of the file (below the default comments):

```
upstream flasksalsa {
    server 127.0.0.1:8000;
}
```

5. Add a `proxy_pass` to flasksalsa at `location /`

```
location / {
    proxy_pass http://flasksalsa;
}
```

6. Restart Nginx to apply the changes:

```
sudo systemctl restart nginx
```

### Verifying the Deployment

Navigate to your EC2 instance's public DNS or IP address in a web browser. You should see the SALSA application running successfully.
