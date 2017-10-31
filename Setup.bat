python3 -m pip install --upgrade pip
cd tools
python3 tools/ReqSetup.py
python3 tools/DbInit.py
cd ../
cd igem2017
python3 manage.py makemigrations sdin
python3 manage.py migrate 
python3 manage.py shell < init.py
cd ../

