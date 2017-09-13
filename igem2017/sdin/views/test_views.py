# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from django.shortcuts import render, redirect

import os
from sdin.models import *
from sdin.tools.pre_load_data import *

from django.http import HttpResponse


# Create your tests here.
def testdb(request):
    #print(os.getcwd()+os.sep+"sdin"+os.sep+"preload")
    pre_load_data(os.getcwd()+os.sep+"sdin"+os.sep+"preload")
    return HttpResponse("<p>数据添加成功！</p>")
