# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from django.shortcuts import render, redirect

from sdin.forms import *
from sdin.models import *
from sdin.pre_load_data import *
import os

from django.contrib import messages
from django.db import IntegrityError
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth import authenticate, login, logout

from django.contrib.auth.decorators import login_required
from django.http import HttpResponse


from django.test import TestCase

# Create your tests here.
def testdb(request):
    #print(os.getcwd()+os.sep+"sdin"+os.sep+"preload")
    pre_load_data(os.getcwd()+os.sep+"sdin"+os.sep+"preload")
    return HttpResponse("<p>数据添加成功！</p>")