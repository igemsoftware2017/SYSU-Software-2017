# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import json
from django.http import HttpResponse
from sdin.models import *

from django.contrib.auth.decorators import login_required

from django.core.exceptions import ObjectDoesNotExist

'''
All response contains a status in json
'status' : xxx
1 for success
0 for failed
'''

@login_required
def design(request):
    return render(request, 'design.html')

def search_part(request):
    '''
    GET method with param:
        name=xxx
    return json:
        'parts': {
        [
            'id': xxx,
            'Name': xxx,
            'Description': xxx,
            'Type': xxx
        ]}
    '''
    query_name = request.GET.get('name')
    # Params empty
    if query_name is None or len(query_name) == 0:
        return HttpResponse(json.dumps({
            'status': 0}))

    query_set = Parts.objects.filter(Name__contains = query_name)
    parts = [x.__dict__ for x in query_set]
    return HttpResponse(json.dumps({
            'status': 1,
            'parts': parts}))

@login_required
def get_favorite(request):
    '''
    GET method with no param
    return json:
        'circuits': {
        [
            'id': xxx,
            'Name': xxx,
            'Description': xxx
        ]}
    '''
    query_set = UserFavorite.objects.filter(user = request.user)
    favorites = [x.circuit.__dict__ for x in query_set]
    return HttpResponse(json.dumps({
            'status': 1,
            'circuits': favorites}))

def get_part(request):
    '''
    GET method with param:
        id=xxx
    return json:
        part: {
            'id': xxx,
            'Name': xxx,
            'Description': xxx,
            'Type': xxx
        }
    '''
    query_id = request.GET.get('id')
    try:
        part = Parts.objects.get(pk = query_id)
        return HttpResponse(json.dumps({
            'status': 1,
            'part': part.__dict__}))
    except:
        return HttpResponse(json.dumps({
            'status': 0}))

def get_circuit(request):
    '''
    GET method with param:
        id=xxx
    return json:
        relations: {[
            'Start': xxx,    //part id
            'End': xxx,  //part id, null if this is a single part
            'Type': xxx, //connection type
        ]}
    '''
    query_id = request.GET.get('id')
    try:
        query_set = CircuitLine.objects.filter(Circuit = query_id)
        relations = [x.__dict__ for x in query_set]
    except:
