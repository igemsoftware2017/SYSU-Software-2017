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
    return HttpResponse(json.dumps({
        "circuitID":103,
        "Team":"Warsaw",
        "devices":{
            "0":{
                "deviceID":"0",
                "parts":[{
                    "ID":"1",
                    "name":"Plac",
                    "type":"promotor",
                    "LibraryID":"Plac",
                    "contain":""
                }, {
                    "ID":"2",
                    "name":"clts",
                    "type":"CDS",
                    "LibraryID":"clts",
                    "contain":""
                }],
                "X":1092.5000000000005,
                "Y":7.499999999999842
            },
            "1":{
                "deviceID":"1",
                "parts":[{
                    "ID":"5",
                    "name":"Pr",
                    "type":"promotor",
                    "LibraryID":"Pr",
                    "contain":""
                }, {
                    "ID":"6",
                    "name":"lacl",
                    "type":"CDS",
                    "LibraryID":"lacl",
                    "contain":""
                }, {
                    "ID":"7",
                    "name":"llo",
                    "type":"CDS",
                    "LibraryID":"llo",
                    "contain":""
                }, {
                    "ID":"8",
                    "name":"inv",
                    "type":"CDS",
                    "LibraryID":"inv",
                    "contain":""
                }, {
                    "ID":"9",
                    "name":"phoP",
                    "type":"CDS",
                    "LibraryID":"phoP",
                    "contain":""
                }, {
                    "ID":"10",
                    "name":"phoQ",
                    "type":"CDS",
                    "LibraryID":"phoQ",
                    "contain":""
                }],
                "X":1725.0000000000011,
                "Y":512.5000000000001
            }, "2":{
                "deviceID":"2",
                "parts":[{
                    "ID":"16",
                    "name":"PphoQ",
                    "type":"promotor",
                    "LibraryID":"PphoQ",
                    "contain":""
                }, {
                    "ID":"17",
                    "name":"cro",
                    "type":"CDS",
                    "LibraryID":"cro",
                    "contain":""
                }, {
                    "ID":"18",
                    "name":"tetR",
                    "type":"CDS",
                    "LibraryID":"tetR",
                    "contain":""
                }, {
                    "ID":"19",
                    "name":"CL",
                    "type":"CDS",
                    "LibraryID":"CL",
                    "contain":""
                }, {
                    "ID":"20",
                    "name":"CFP",
                    "type":"CDS",
                    "LibraryID":"CFP",
                    "contain":""
                }],
                "X":500,
                "Y":600
            }, "3":{
                "deviceID":"3",
                "parts":[{
                    "ID":"25",
                    "name":"ParaC",
                    "type":"promotor",
                    "LibraryID":"ParaC",
                    "contain":""
                }, {
                    "ID":"26",
                    "name":"tetR",
                    "type":"CDS",
                    "LibraryID":"tetR",
                    "contain":""
                }, {
                    "ID":"27",
                    "name":"cro-box",
                    "type":"CDS",
                    "LibraryID":"cro-box",
                    "contain":""
                }, {
                    "ID":"28",
                    "name":"p53",
                    "type":"CDS",
                    "LibraryID":"p53",
                    "contain":""
                }, {
                    "ID":"29",
                    "name":"YFP",
                    "type":"CDS",
                    "LibraryID":"YFP",
                    "contain":""
                }],
                "X":1090.0000000000007,
                "Y":885.0000000000001
            }, "4":{
                "deviceID":"4",
                "parts":[{
                    "ID":"30",
                    "name":"Ptet",
                    "type":"promotor",
                    "LibraryID":"Ptet",
                    "contain":""
                }, {
                    "ID":"31",
                    "name":"AraC",
                    "type":"CDS",
                    "LibraryID":"AraC",
                    "contain":""
                }],
                "X":560,
                "Y":1152.5000000000002
            }}, "lines":[{
                "source":"2",
                "target":"3",
                "type":"promotion"
            }, {
                "source":"6",
                "target":"37",
                "type":"promotion"
            }, {
                "source":"7",
                "target":"38",
                "type":"promotion"
            }, {
                "source":"8",
                "target":"39",
                "type":"promotion"
            }, {
                "source":"11",
                "target":"40",
                "type":"promotion"
            }, {
                "source":"9",
                "target":"14",
                "type":"promotion"
            }, {
                "source":"14",
                "target":"15",
                "type":"promotion"
            }, {
                "source":"10",
                "target":"12",
                "type":"promotion"
            }, {
                "source":"12",
                "target":"13",
                "type":"promotion"
            }, {
                "source":"13",
                "target":"15",
                "type":"promotion"
            }, {
                "source":"17",
                "target":"21",
                "type":"promotion"
            }, {
                "source":"18",
                "target":"22",
                "type":"promotion"
            }, {
                "source":"19",
                "target":"23",
                "type":"promotion"
            }, {
                "source":"20",
                "target":"24",
                "type":"promotion"
            }, {
                "source":"26",
                "target":"32",
                "type":"promotion"
            }, {
                "source":"27",
                "target":"33",
                "type":"promotion"
            }, {
                "source":"28",
                "target":"34",
                "type":"promotion"
            }, {
                "source":"29",
                "target":"35",
                "type":"promotion"
            }, {
                "source":"31",
                "target":"36",
                "type":"promotion"
            }, {
                "source":"15",
                "target":"16",
                "type":"promotion"
            }, {
                "source":"3",
                "target":"5",
                "type":"inhibition"
            }, {
                "source":"23",
                "target":"5",
                "type":"inhibition"
            }, {
                "source":"37",
                "target":"2",
                "type":"inhibition"
            }, {
                "source":"4",
                "target":"37",
                "type":"inhibition"
            }, {
                "source":"21",
                "target":"25",
                "type":"inhibition"
            }, {
                "source":"22",
                "target":"30",
                "type":"inhibition"
            }, {
                "source":"32",
                "target":"30",
                "type":"inhibition"
            }, {
                "source":"36",
                "target":"25",
                "type":"inhibition"
            }],"parts":[{
                "ID":"3",
                "name":"clts",
                "type":"protein",
                "LibraryID":"clts",
                "contain":"",
                "X":1202.500000000001,
                "Y":522.5000000000005
            }, {
                "ID":"4",
                "name":"IPTG",
                "type":"material",
                "LibraryID":"IPTG",
                "contain":"",
                "X":1840.0000000000016,
                "Y":-100.00000000000007
            }, {
                "ID":"11",
                "name":"GFP",
                "type":"CDS",
                "LibraryID":"GFP",
                "contain":"",
                "X":375.00000000000017,
                "Y":42.500000000000036
            }, {
                "ID":"12",
                "name":"phoQ",
                "type":"protein",
                "LibraryID":"phoQ",
                "contain":"",
                "X":2230.000000000002,
                "Y":265.0000000000002
            }, {
                "ID":"13",
                "name":"phoQ",
                "type":"protein",
                "LibraryID":"phoQ",
                "contain":"",
                "X":537.5000000000001,
                "Y":-127.50000000000011
            }, {
                "ID":"14",
                "name":"phoP",
                "type":"protein",
                "LibraryID":"phoP",
                "contain":"",
                "X":2112.500000000002,
                "Y":177.5000000000001
            }, {
                "ID":"15",
                "name":"phoP",
                "type":"protein",
                "LibraryID":"phoP",
                "contain":"",
                "X":537.5,
                "Y":172.50000000000017
            }, {
                "ID":"21",
                "name":"cro",
                "type":"protein",
                "LibraryID":"cro",
                "contain":"",
                "X":1125.0000000000005,
                "Y":477.50000000000045
            }, {
                "ID":"22",
                "name":"tetR",
                "type":"protein",
                "LibraryID":"tetR",
                "contain":"",
                "X":379.9999999999996,
                "Y":770.0000000000007
            }, {
                "ID":"23",
                "name":"CL",
                "type":"protein",
                "LibraryID":"CL",
                "contain":"",
                "X":1757.500000000001,
                "Y":1220.000000000001
            }, {
                "ID":"24",
                "name":"CFP",
                "type":"protein",
                "LibraryID":"CFP",
                "contain":"",
                "X":912.4999999999999,
                "Y":897.5000000000008
            }, {
                "ID":"32",
                "name":"tetR",
                "type":"protein",
                "LibraryID":"tetR",
                "contain":"",
                "X":1212.5,
                "Y":1337.5000000000014
            }, {
                "ID":"33",
                "name":"cro-box",
                "type":"protein",
                "LibraryID":"cro-box",
                "contain":"",
                "X":1310,
                "Y":675.0000000000006
            }, {
                "ID":"34",
                "name":"p53",
                "type":"protein",
                "LibraryID":"p53",
                "contain":"",
                "X":1407.5,
                "Y":687.5000000000007
            }, {
                "ID":"35",
                "name":"YFP",
                "type":"protein",
                "LibraryID":"YFP",
                "contain":"",
                "X":1497.5,
                "Y":680.0000000000006
            }, {
                "ID":"36",
                "name":"AraC",
                "type":"protein",
                "LibraryID":"AraC",
                "contain":"",
                "X":979.9999999999995,
                "Y":1165.0000000000011
            }, {
                "ID":"37",
                "name":"lacl",
                "type":"protein",
                "LibraryID":"lacl",
                "contain":"",
                "X":1842.5000000000002,
                "Y":85.0000000000001
            }, {
                "ID":"38",
                "name":"llo",
                "type":"protein",
                "LibraryID":"llo",
                "contain":"",
                "X":1937.5000000000002,
                "Y":340.00000000000034
            }, {
                "ID":"39",
                "name":"inv",
                "type":"protein",
                "LibraryID":"inv",
                "contain":"",
                "X":2022.5000000000002,
                "Y":337.5000000000003
            }, {
                "ID":"40",
                "name":"GFP",
                "type":"protein",
                "LibraryID":"GFP",
                "contain":"",
                "X":374.9999999999986,
                "Y":342.50000000000034
            }, {
                "ID":"41",
                "name":"tetracycline",
                "type":"material",
                "LibraryID":"tetracycline",
                "contain":"",
                "X":819.9999999999989,
                "Y":310.0000000000003
            }, {
                "ID":"42",
                "name":"L-arabinose",
                "type":"material",
                "LibraryID":"L-arabinose",
                "contain":"",
                "X":747.4999999999989,
                "Y":50.00000000000004
            }, {
                "ID":"43",
                "name":"TetR inactivation",
                "type":"material",
                "LibraryID":"TetR inactivation",
                "contain":"",
                "X":1004.9999999999989,
                "Y":297.5000000000003
            }, {
                "ID":"44",
                "name":"AraC-arabinose",
                "type":"material",
                "LibraryID":"AraC-arabinose",
                "contain":"",
                "X":919.9999999999986,
                "Y":0
            }]
        }))
