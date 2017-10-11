"""
WSGI config for igem2017 project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/1.11/howto/deployment/wsgi/
"""

import os
import sys
from os.path import dirname, abspath
from django.core.wsgi import get_wsgi_application
PROJECT_DIR = dirname(dirname(abspath(__file__)))
sys.path.insert(0, PROJECT_DIR)
#os.environ.setdefault("DJANGO_SETTINGS_MODULE", "igem2017.settings")
os.environ['DJANGO_SETTINGS_MODULE'] = 'igem2017.settings'

application = get_wsgi_application()
