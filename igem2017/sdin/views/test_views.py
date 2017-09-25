# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from django.shortcuts import render, redirect

import os
from sdin.models import *
from sdin.tools.pre_load_data import *

from django.http import HttpResponse


import json

# Create your tests here.
def testdb(request):
    #print(os.getcwd())
    pre_load_data(os.getcwd()+os.sep+"sdin"+os.sep+"tools"+os.sep+"preload")
    return HttpResponse("<p>数据添加成功！</p>")

def get_circuit_test(request):
    parts = [{
            'id': 1,
            'cid': 1,
            'Name': "BBa_1111",
            'Description': 'Lorem',
            'Type': 'a',
            'X': 0,
            'Y': 0
        },{
            'id': 2,
            'cid': 2,
            'Name': "BBa_second",
            'Description': 'Ipsum',
            'Type': 'a',
            'X': 100,
            'Y': 100
        },{
            'id': 3,
            'cid': 4,
            'Name': "BBa_3rd",
            'Description': 'dolor',
            'Type': 'c',
            'X': -100,
            'Y': 200
        }]
    lines = [{
            'Start': 1,
            'End': 2,
            'Type': 'a',
        },{
            'Start': 2,
            'End': 4,
            'Type': 'b',
        },{
            'Start': 4,
            'End': 1,
            'Type': 'c',
        }]
    return HttpResponse(json.dumps({
            'status': 1,
            'parts': parts,
            'lines': lines}))
