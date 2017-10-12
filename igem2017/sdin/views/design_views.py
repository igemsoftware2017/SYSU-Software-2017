# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from django.shortcuts import render, redirect

import json
from django.http import HttpResponse, JsonResponse
from sdin.models import *

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

# Part related views

def search_parts(request):
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
            ]

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
                'id': x.id,
                'name': x.Name,
                'description': x.Description,
                'type': x.Type} for x in sub_query]

            part_dict['success'] = True
            return JsonResponse(part_dict)
        except:
            raise
            return JsonResponse({ 'success': False })

# Circuit related views

def get_circuit(request):
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
        ]
        lines: [{
            'Start': xxx,    # part cid
            'End': xxx,  # part cid
            'Type': xxx, # connection type}
        ]
    '''
    try:
        query_id = request.GET.get('id')
        parts_query = CircuitParts.objects.filter(Circuit = query_id)
        parts = [{'id': x.Part.id, 'cid': x.id, 'Name': x.Part.Name,
            'Description': x.Part.Description, 'Type': x.Part.Type,
            'X': x.X, 'Y': x.Y} for x in parts_query]
        line_query = CircuitLines.objects.filter(Start__Circuit = query_id, \
                End__Circuit = query_id)
        lines = [{'Start': x.Start.id, 'End': x.End.id, 'Type': x.Type} \
                for x in line_query]
        return HttpResponse(json.dumps({
            'status': 1,
            'parts': parts,
            'lines': lines}))
    except:
        return HttpResponse(json.dumps({
            'status': 0}))

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
    return HttpResponse(json.dumps({
            'status': 1,
            'circuits': saves}))


@login_required
def save_circuit(request):
    '''
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
    if request.method == 'POST':
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
            return HttpResponse(json.dumps({
                    'status': 1,
                    'circuit_id': circuit.id}))
        except:
            return HttpResponse(json.dumps({
                'status': 0}))
    else:
        return HttpResponse(json.dumps({
            'status': 0}))
