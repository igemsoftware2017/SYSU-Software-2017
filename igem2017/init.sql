CREATE DATABASE django;
CREATE USER 'django'@'localhost' IDENTIFIED BY 'DjangoPass123!';
GRANT ALL PRIVILEGES ON django.* TO 'django'@'localhost';
