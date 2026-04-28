sudo apt-get install -y curl
echo "curl installed"
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
echo "node source"
sudo apt-get install -y nodejs
echo "installed nodejs"
sudo npm install -g pm2
echo "pm2 installed"
sudo apt-get install -y mysql-server
echo "mysql server installed"
sudo apt-get install -y expect
echo "installed except"
sudo service mysql start
MYSQL_ROOT_PASSWORD='SenZ0pt@123'
  #MYSQL=$(grep 'temporary password' /var/log/mysqld.log | awk '{print $11}')
  SECURE_MYSQL=$(expect -c "
  set timeout 10
  spawn mysql_secure_installation
  
  expect \"Press y|Y for Yes, any other key for No:\"
  send \"y\r\"
  expect \"Please enter 0 = LOW, 1 = MEDIUM and 2 = STRONG:\"
  send \"1\r\"
  expect \"New password:\"
  send \"MYSQL_ROOT_PASSWORD\r\"
  expect \"Re-enter new password:\"
  send \"MYSQL_ROOT_PASSWORD\r\"
  expect \"Do you wish to continue with the password provided?\(Press y|Y for Yes, any other key for No) :\"
  send \"y\r\"
  expect \"Remove anonymous users?\(Press y\|Y for Yes, any other key for No) :\"
  send \"y\r\"
  expect \"Disallow root login remotely?\(Press y\|Y for Yes, any other key for No) :\"
  send \"y\r\"
  expect \"Remove test database and access to it?\(Press y\|Y for Yes, any other key for No) :\"
  send \"y\r\"
  expect \"Reload privilege tables now?\(Press y\|Y for Yes, any other key for No) :\"
  send \"y\r\"
  ")
  echo $SECURE_MYSQL
sudo mysql -e "ALTER USER root@localhost IDENTIFIED WITH mysql_native_password BY 'SenZ0pt@123'"
npm install
npm run database
sudo pm2 start app.js --name node-server
sudo pm2 start Apps/Scheduler/scheduler.js --name scheduler
sudo pm2 start Apps/Analytics/Analytics.js --name analytics
sudo pm2 start Apps/Gateway/Gateway.js --name gateway
sudo pm2 save
sudo pm2 startup ubuntu