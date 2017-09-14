# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import json
from django.http import HttpResponse
from sdin.models import *

def query_part(request):
    query_name = request.GET.get('name')
    # Params empty
    if query_name is None or len(query_name) == 0:
        return HttpResponse(json.dumps({
            'status': 0}))

    query_set = Parts.objects.filter(Name__contains = query_name)
    parts = [{'Name': x.Name, 'Description': x.Description, 'Type': x.Type} \
            for x in query_set]
    return HttpResponse(json.dumps({
            'status': 1,
            'parts': parts}))

