#/bin/bash
python manage.py makemigrations  sdin
python manage.py migrate
python manage.py shell < init.py
