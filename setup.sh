#!/bin/sh
echo "Seting up S-Din..."
python3 VenvSetup.py
.env/bin/python3 -m pip install --upgrade pip
cd tools
../.env/bin/pip install -r requirements.txt
../.env/bin/python3 DbInit.py
cd ../
cd igem2017
../.env/bin/python3 manage.py makemigrations sdin
../.env/bin/python3 manage.py migrate
../.env/bin/python3 manage.py shell < init.py
cd ../
echo "S-Din has successfully set up!"
echo "please run runserver.sh to start server"

