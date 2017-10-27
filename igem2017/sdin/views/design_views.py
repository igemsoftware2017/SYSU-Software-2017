# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from django.shortcuts import render, redirect

import json
from django.http import HttpResponse, JsonResponse
from sdin.models import *

from sdin.tools.biode import CIR2ODE as cir2

from django.contrib.auth.decorators import login_required

from django.core.exceptions import ObjectDoesNotExist

import traceback

'''
All response contains a status in json
'status' : xxx
1 for success
0 for failed
'''


# Basic design views

@login_required
def design(request):
    return render(request, 'design.html')

# Favorites related views

@login_required
def get_favorite(request):
    '''
    GET method with no param
    return json:
        'circuits': [{
            'id': xxx,
            'Name': xxx,
            'Description': xxx,
            'Author': xxx(id)
        }]
    '''
    query_set = UserFavorite.objects.filter(user = request.user)
    favorites = [{
        'id': x.circuit.id,
        'Name': x.circuit.Name,
        'Description': x.circuit.Description,
        'Author': x.circuit.Author.id if x.circuit.Author != None else None
        } for x in query_set]
    return HttpResponse(json.dumps({
            'status': 1,
            'circuits': favorites}))

@login_required
def tag_favorite(request):
    '''
    POST method with json:
        'circuit_id': xxx, # id of circuit, make sure this circuit is saved
        'tag': 0 for cancel favorite, 1 for tag favorite
    return json:
        status: 0 or 1
    '''
    if request.method == 'POST':
        data = json.loads(request.POST['data'])
        try:
            circuit = Circuit.objects.get(pk = data['circuit_id'])
            if data['tag'] == 1:
                if not UserFavorite.objects.filter(user = request.user, circuit = circuit).exists():
                    UserFavorite.objects.create(circuit = circuit, user = request.user)
            else:
                UserFavorite.objects.get(user = request.user, circuit = circuit)
                UserFavorite.delete()
            return HttpResponse(json.dumps({
                'status': 1}))
        except:
            return HttpResponse(json.dumps({
                'status': 0}))

@login_required
def part_favorite(request):
    '''
    POST method with json:
        'part_id': xxx, # id of part
        'tag': 0 for cancel favorite, 1 for tag favorite
    return json:
        status: 0 or 1
    '''
    if request.method == 'POST':
        data = json.loads(request.POST['data'])
        try:
            part = Parts.objects.get(pk = data['part_id'])
            if data['tag'] == 1:
                if not FavoriteParts.objects.filter(user = request.user, part = part).exists():
                    FavoriteParts.objects.create(part = part, user = request.user)
            else:
                FavoriteParts.objects.get(user = request.user, part = part)
                FavoriteParts.delete()
            return HttpResponse(json.dumps({
                'status': 1}))
        except:
            return HttpResponse(json.dumps({
                'status': 0}))


# Part related views

def parts(request):
    '''
    GET method with param:
        name=xxx
    return json:
        'parts': [{
            'id': xxx,
            'name': xxx
        }]
    '''
    query_name = request.GET.get('name')
    # Params empty
    if query_name is None or len(query_name) == 0:
        return JsonResponse({ 'success': False })

    query_set = Parts.objects.filter(Name__contains = query_name)
    parts = [{
        'id': x.id,
        'name': x.Name} for x in query_set]

    return JsonResponse({
        'success': True,
        'parts': parts
    })

def part(request):
    '''
    GET method with param:
        id=xxx
    return json:
        part: {
            'id': xxx,
            'name': xxx,
            'description': xxx,
            'type': xxx,
            'subparts': [
                {
                    'id': xxx,
                    'name': xxx,
                    'description': xxx,
                    'type': xxx
                }
            ],
            'works': [{
                'year': xxx,
                'teamname': xxx,
                'id': xxx}]
        }
    '''
    if request.method == 'POST':
        try:
            data = json.loads(request.POST['data'])
            new_part = Parts.objects.create(
                Name = data['name'],
                Description = data['description'],
                Type = data['type']
            )
            for x in data['subparts']:
                SubParts.objects.create(
                    parent = new_part,
                    child = x
                )
            return JsonResponse({
                'success': True,
                'id': new_part.id
            })
        except:
            return JsonResponse({
                'success': False
            })

    else:
        try:
            query_id = request.GET.get('id')
            part = Parts.objects.get(pk = query_id)
            part_dict = {
                'id': part.id,
                'name': part.Name,
                'description': part.Description,
                'type': part.Type}
            sub_query = SubParts.objects.filter(parent = part)
            part_dict['subparts'] = [{
                'id': x.child.id,
                'name': x.child.Name,
                'description': x.child.Description,
                'type': x.child.Type} for x in sub_query]
            circuit_query = CircuitParts.objects.filter(Part = part).values('Circuit').distinct()
            def _work (x):
                circuit = Circuit.objects.get(pk = x['Circuit'])
                w = circuit.works_set.all()[0]
                return {
                        'year' : w.Year,
                        'teamname': w.Teamname,
                        'id': w.id
                    }
            part_dict['works'] = [_work(x) for x in circuit_query]

            part_dict['success'] = True
            return JsonResponse(part_dict)
        except:
            raise
            return JsonResponse({ 'success': False })

def interact(request):
    '''
    GET /api/interact?id=xxx:
    return json:
        parts:[{
            'id': xxx,
            'name': xxx,
            'type': xxx,
            'description': xxx,
            'interactType': xxx,
            'score': xxx
        },...]
    '''
    try:
        query_id = request.GET.get('id')
        part = Parts.objects.get(pk = query_id)
        query = PartsInteract.objects.filter(parent = part)
        parts = [
            {
                'id': x.child.id,
                'name': x.child.Name,
                'type': x.child.Type,
                'description': x.child.Description,
                'interactType': x.InteractType,
                'score': x.Score
            } for x in query]

        return JsonResponse({
                'parts': parts
            })
    except:
        raise
        return JsonResponse({ 'success': False })


# Circuit related views

def circuit(request):
    '''
    GET method with param:
        id=xxx
    return json:
        parts: [{
            'id': xxx, # id of part on Parts table
            'cid': xxx, # id for circuit, used in lines
            'Name': xxx,
            'Description': xxx,
            'Type': xxx,
            'X': xxx, # position in canvas
            'Y': xxx,}
        ],
        lines: [{
            'Start': xxx,    # part cid
            'End': xxx,  # part cid
            'Type': xxx, # connection type}
        ],
        devices: [
            {
                'subparts': [xx, xx, xx], # cid
                'x': xxx,
                'y': xxx
            }
        ],
        combines: {
            x: [x, x, x], # combines dict, x is cid
        }

    POST method with json:
    {
        parts: [{
            'id': xxx,
            'cid': xxx, # cid generated by yourself
            'X': xxx,
            'Y': xxx
        }],
        lines: [{
            'Start': xxx, # cid defined by yourself
            'End': xxx,
            'Type': xxx
        }],
        devices: [
            {
                'subparts': [xx, xx, xx], # cid
                'x': xxx,
                'y': xxx
            }
        ],
        combines: {
            x: [x, x, x] # see above api
        }
        circuit: {
            'id': xxx, # circuit id if it's already existing, -1 else
            'Name': xxx,
            'Description': xxx
        }
    }
    response with json:
    {
        status: 0 for error, 1 for success.
        circuit_id: xxx # id for saved circuit.
    }
    '''
    if request.method == 'GET':
        try:
            query_id = request.GET.get('id')
            parts_query = CircuitParts.objects.filter(Circuit = query_id)
            parts = [{'id': x.Part.id, 'cid': x.id, 'name': x.Part.Name,
                'description': x.Part.Description, 'type': x.Part.Type,
                'X': x.X, 'Y': x.Y} for x in parts_query]
            line_query = CircuitLines.objects.filter(Start__Circuit = query_id, \
                    End__Circuit = query_id)
            lines = [{'start': x.Start.id, 'end': x.End.id, 'type': x.Type} \
                    for x in line_query]
            devices_query = CircuitDevices.objects.filter(Circuit = query_id)
            devices = [{
                'subparts': [i.id for i in x.Subparts.all()],
                'X':x.X,
                'Y': x.Y} for x in devices_query]
            combines_query = CircuitCombines.objects.filter(Circuit = query_id)
            combines = {x.Father.id: [i.id for i in x.Sons.all()] for x in combines_query}
            return JsonResponse({
                'status': 1,
                'id': query_id,
                'parts': parts,
                'lines': lines,
                'devices': devices,
                'combines': combines})
        except:
            traceback.print_exc()
            return JsonResponse({
                'status': 0})
    elif request.method == 'POST':
        try:
            data = json.loads(request.POST['data'])
            if data['circuit']['id'] == -1:
                # new circuit
                circuit = Circuit.objects.create(
                        Name = data['circuit']['Name'],
                        Description = data['circuit']['Description'],
                        Author = request.user)
            else:
                # existing circuit
                circuit = Circuit.objects.get(pk = data['circuit']['id'])
                circuit.Name = data['circuit']['Name']
                circuit.Description = data['circuit']['Description']
                circuit.Author = request.user
                circuit.save()
                # delete existing circuit part
                for x in CircuitParts.objects.filter(Circuit = circuit):
                    x.delete()

            cids = {}
            for x in data['parts']:
                circuit_part = CircuitParts.objects.create(
                        Part = x['id'],
                        Circuit = circuit,
                        X = x['X'],
                        Y = x['Y'])
                cids[x['cid']] = circuit_part.id
            for x in data['lines']:
                CircuitLines.objects.create(
                        Start = cids[x['Start']],
                        End = cids[x['End']],
                        Type = x['Type'])
            for x in data['devices']:
                cd = CircuitDevices.objects.create(Circuit = circuit)
                for i in x['subparts']:
                    cd.Subparts.add(cids[i])
                cd.X = x['x']
                cd.Y = x['y']
                cd.save()
            for x in data['combines']:
                cd = CircuitCombines.objects.create(Circuit = circuit, Father = x)
                for i in data['combines'][x]:
                    cd.Sons.add(cids[i])
                cd.save()
            return JsonResponse({
                    'status': 1,
                    'circuit_id': circuit.id})
        except:
            return JsonResponse({
                'status': 0})
    else:
        return JsonResponse({
            'status': 0})

@login_required
def get_saves(request):
    '''
    GET method with no param
    return json:
        'circuits': [{
            'id': xxx,
            'Name': xxx,
            'Description': xxx,
            'Author': xxx(id)
        }]
    '''
    query_set = Circuit.objects.filter(Author = request.user)
    saves = [{
        'id': x.id,
        'Name': x.Name,
        'Description': x.Description,
        'Author': x.Author.id if x.Author != None else None
        } for x in query_set]
    return JsonResponse({
            'status': 1,
            'circuits': saves})


import numpy as np

def simulation(request):
    '''
    POST /api/simulation
    param:
        n * n list
    return:
        time: [] a list of time stamp of length m
        result: m * n list, result[m][n] means at time m, the concentration of
            n th material
    '''
    if request.method == 'POST':
        data = json.loads(request.POST['data'])
        time, result = cir2(data, np.zeros(len(data)))
        return JsonResponse({
            'status': 1,
            'time': time.tolist(),
            'result': result.tolist()
        })
    return 0
