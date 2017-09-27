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
    parts = {
        "1": {
            "ID": "1",
            "Name": "Plac",
            "Type": "promotor",
            "LibraryID": "Plac",
            "contain": ""
        },
        "2": {
            "ID": "2",
            "Name": "clts",
            "Type": "CDS",
            "LibraryID": "clts",
            "contain": ""
        },
        "3": {
            "ID": "3",
            "Name": "clts",
            "Type": "protein",
            "LibraryID": "clts",
            "contain": ""
        },
        "4": {
            "ID": "4",
            "Name": "IPTG",
            "Type": "material",
            "LibraryID": "IPTG",
            "contain": ""
        },
        "5": {
            "ID": "5",
            "Name": "Pr",
            "Type": "promotor",
            "LibraryID": "Pr",
            "contain": ""
        },
        "6": {
            "ID": "6",
            "Name": "lacl",
            "Type": "CDS",
            "LibraryID": "lacl",
            "contain": ""
        },
        "7": {
            "ID": "7",
            "Name": "llo",
            "Type": "CDS",
            "LibraryID": "llo",
            "contain": ""
        },
        "8": {
            "ID": "8",
            "Name": "inv",
            "Type": "CDS",
            "LibraryID": "inv",
            "contain": ""
        },
    "9": {
        "ID": "9",
        "Name": "phoP",
        "Type": "CDS",
        "LibraryID": "phoP",
        "contain": ""
    },
    "10": {
        "ID": "10",
        "Name": "phoQ",
        "Type": "CDS",
        "LibraryID": "phoQ",
        "contain": ""
    },
    "11": {
        "ID": "11",
        "Name": "GFP",
        "Type": "CDS",
        "LibraryID": "GFP",
        "contain": ""
    },
    "12": {
        "ID": "12",
        "Name": "phoQ",
        "Type": "protein",
        "LibraryID": "phoQ",
        "contain": ""
    },
    "13": {
        "ID": "13",
        "Name": "phoQ",
        "Type": "protein",
        "LibraryID": "phoQ",
        "contain": ""
    },
    "14": {
        "ID": "14",
        "Name": "phoP",
        "Type": "protein",
        "LibraryID": "phoP",
        "contain": ""
    },
    "15": {
        "ID": "15",
        "Name": "phoP",
        "Type": "protein",
        "LibraryID": "phoP",
        "contain": ""
    },
    "16": {
        "ID": "16",
        "Name": "PphoQ",
        "Type": "promotor",
        "LibraryID": "PphoQ",
        "contain": ""
    },
    "17": {
        "ID": "17",
        "Name": "cro",
        "Type": "CDS",
        "LibraryID": "cro",
        "contain": ""
    },
    "18": {
        "ID": "18",
        "Name": "tetR",
        "Type": "CDS",
        "LibraryID": "tetR",
        "contain": ""
    },
    "19": {
        "ID": "19",
        "Name": "CL",
        "Type": "CDS",
        "LibraryID": "CL",
        "contain": ""
    },
    "20": {
        "ID": "20",
        "Name": "CFP",
        "Type": "CDS",
        "LibraryID": "CFP",
        "contain": ""
    },
    "21": {
        "ID": "21",
        "Name": "cro",
        "Type": "protein",
        "LibraryID": "cro",
        "contain": ""
    },
    "22": {
        "ID": "22",
        "Name": "tetR",
        "Type": "protein",
        "LibraryID": "tetR",
        "contain": ""
    },
    "23": {
        "ID": "23",
        "Name": "CL",
        "Type": "protein",
        "LibraryID": "CL",
        "contain": ""
    },
    "24": {
        "ID": "24",
        "Name": "CFP",
        "Type": "protein",
        "LibraryID": "CFP",
        "contain": ""
    },
    "25": {
        "ID": "25",
        "Name": "ParaC",
        "Type": "promotor",
        "LibraryID": "ParaC",
        "contain": ""
    },
    "26": {
        "ID": "26",
        "Name": "tetR",
        "Type": "CDS",
        "LibraryID": "tetR",
        "contain": ""
    },
    "27": {
        "ID": "27",
        "Name": "cro-box",
        "Type": "CDS",
        "LibraryID": "cro-box",
        "contain": ""
    },
    "28": {
        "ID": "28",
        "Name": "p53",
        "Type": "CDS",
        "LibraryID": "p53",
        "contain": ""
    },
    "29": {
        "ID": "29",
        "Name": "YFP",
        "Type": "CDS",
        "LibraryID": "YFP",
        "contain": ""
    },
    "30": {
        "ID": "30",
        "Name": "Ptet",
        "Type": "promotor",
        "LibraryID": "Ptet",
        "contain": ""
    },
    "31": {
        "ID": "31",
        "Name": "AraC",
        "Type": "CDS",
        "LibraryID": "AraC",
        "contain": ""
    },
    "32": {
        "ID": "32",
        "Name": "tetR",
        "Type": "protein",
        "LibraryID": "tetR",
        "contain": ""
    },
    "33": {
        "ID": "33",
        "Name": "cro-box",
        "Type": "protein",
        "LibraryID": "cro-box",
        "contain": ""
    },
    "34": {
        "ID": "34",
        "Name": "p53",
        "Type": "protein",
        "LibraryID": "p53",
        "contain": ""
    },
    "35": {
        "ID": "35",
        "Name": "YFP",
        "Type": "protein",
        "LibraryID": "YFP",
        "contain": ""
    },
    "36": {
        "ID": "36",
        "Name": "AraC",
        "Type": "protein",
        "LibraryID": "AraC",
        "contain": ""
    },
    "37": {
        "ID": "37",
        "Name": "lacl",
        "Type": "protein",
        "LibraryID": "lacl",
        "contain": ""
    },
    "38": {
        "ID": "38",
        "Name": "llo",
        "Type": "protein",
        "LibraryID": "llo",
        "contain": ""
    },
    "39": {
        "ID": "39",
        "Name": "inv",
        "Type": "protein",
        "LibraryID": "inv",
        "contain": ""
    },
    "40": {
        "ID": "40",
        "Name": "GFP",
        "Type": "protein",
        "LibraryID": "GFP",
        "contain": ""
    },
    "41": {
        "ID": "41",
        "Name": "tetracycline",
        "Type": "material",
        "LibraryID": "tetracycline",
        "contain": ""
    },
    "42": {
        "ID": "42",
        "Name": "L-arabinose",
        "Type": "material",
        "LibraryID": "L-arabinose",
        "contain": ""
    },
    "43": {
        "ID": "43",
        "Name": "TetR inactivation",
        "Type": "material",
        "LibraryID": "TetR inactivation",
        "contain": ""
    },
    "44": {
        "ID": "44",
        "Name": "AraC-arabinose",
        "Type": "material",
        "LibraryID": "AraC-arabinose",
        "contain": ""
    }
    }

    device_num = [
        ['1','2'],
        ['5','6','7','8','9','10'],
        ['16','17','18','19','20'],
        ['25','26','27','28','29'],
        ['30','31']
    ]

    devices = {}
    from copy import deepcopy
    unique_parts = deepcopy(parts)
    for i, d in enumerate(device_num):
        tmp = {
            'deviceID': str(i),
            'parts': {},
            'X': i * 150 + 50,
            'Y': 100
        }
        for x in d:
            tmp['parts'][x] = parts[x]
            unique_parts.pop(x)
        devices[str(i)] = tmp
    lines = [
        {'source': '2', 'target': '3', 'type': 'promotion'},
        {'source': '6', 'target': '37', 'type': 'promotion'},
        {'source': '7', 'target': '38', 'type': 'promotion'},
        {'source': '8', 'target': '39', 'type': 'promotion'},
        {'source': '11', 'target': '40', 'type': 'promotion'},
        {'source': '9', 'target': '14', 'type': 'promotion'},
        {'source': '14', 'target': '15', 'type': 'promotion'},
        {'source': '10', 'target': '12', 'type': 'promotion'},
        {'source': '12', 'target': '13', 'type': 'promotion'},
        {'source': '13', 'target': '15', 'type': 'promotion'},
        {'source': '17', 'target': '21', 'type': 'promotion'},
        {'source': '18', 'target': '22', 'type': 'promotion'},
        {'source': '19', 'target': '23', 'type': 'promotion'},
        {'source': '20', 'target': '24', 'type': 'promotion'},
        {'source': '26', 'target': '32', 'type': 'promotion'},
        {'source': '27', 'target': '33', 'type': 'promotion'},
        {'source': '28', 'target': '34', 'type': 'promotion'},
        {'source': '29', 'target': '35', 'type': 'promotion'},
        {'source': '31', 'target': '36', 'type': 'promotion'},
        {'source': '15', 'target': '16', 'type': 'promotion'},
        {'source': '3', 'target': '5', 'type': 'inhibition'},
        {'source': '23', 'target': '5', 'type': 'inhibition'},
        {'source': '37', 'target': '2', 'type': 'inhibition'},
        {'source': '4', 'target': '37', 'type': 'inhibition'},
        {'source': '21', 'target': '25', 'type': 'inhibition'},
        {'source': '22', 'target': '30', 'type': 'inhibition'},
        {'source': '32', 'target': '30', 'type': 'inhibition'},
        {'source': '36', 'target': '25', 'type': 'inhibition'}
    ]

    return HttpResponse(json.dumps({
        'status': 1,
        'circuitID': 103,
        'Team': 'Warsaw',
        'devices': devices,
        'lines': lines,
        'parts': unique_parts
    }))
