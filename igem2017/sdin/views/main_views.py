# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from django.shortcuts import render, redirect

from sdin.forms import *
from sdin.models import *

from django.contrib import messages
from django.db import IntegrityError
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth import authenticate, login, logout

from django.contrib.auth.decorators import login_required

from django.http import JsonResponse, HttpResponse

import traceback
import json

Err = "Something wrong!"
Inv = "Invalid form!"

def index(request):
    return render(request, 'index.html')

def login_view(request):
    if request.method == "POST":
        # Login action
        form = LoginForm(request.POST)
        if form.is_valid():
            email = form.cleaned_data['email']
            password = form.cleaned_data['password']
            user = authenticate(username = email, password = password)
            if user is not None:
                login(request, user)
                messages.success(request, "Login successfully!")
                next_url = request.POST.get('next')
                if next_url:
                    return redirect(next_url)
                else:
                    return redirect('/')
            else:
                messages.error(request, "Invalid Login!")
        else:
            messages.error(request, Inv)
        return render(request, 'login.html')
    elif request.method == 'GET':
        return render(request, 'login.html')

@login_required
def logout_view(request):
    logout(request)
    return redirect('/index')

@login_required
def interest_view(request):
    return render(request, 'interest.html')

def register(request):
    if request.method == "POST":
        form = RegisterForm(request.POST)
        if form.is_valid():
            try:
                user = User.objects.create_user(email = form.cleaned_data["email"],
                        password = form.cleaned_data["password"],
                        org = form.cleaned_data["org"],
                        igem = form.cleaned_data["igem"]
                        )
                login(request, user)
                messages.success(request, "Register successfully!")
                return redirect('/interest')
            except IntegrityError:
                messages.error(request, "Email already exists!")
            except:
                messages.error(request, Err)
        else:
            messages.error(request, Inv)

    return render(request, 'register.html')

def work(request):
    try:
        wk = Works.objects.get(TeamID = request.GET.get('id'))
        use_parts = wk.Use_parts.split(';')
        part = []
        for item in use_parts:
            try:
                pt = Parts.objects.get(Name = item)
                if request.user.is_authenticated:
                    try:
                        FavoriteParts.objects.get(user = request.user, part = pt)
                        favor = True
                    except FavoriteParts.DoesNotExist:
                        favor = False
                else:
                    favor = False

                part.append({
                    'id': pt.id,
                    'BBa': item,
                    'name': pt.secondName,
                    'isFavourite': favor})


            except Parts.DoesNotExist:
                part.append({
                    'id': request.GET.get('id'),
                    'BBa': item,
                    'name': pt.secondName,
                    'isFavourite': False})
        if request.user.is_authenticated:
            try:
                UserFavorite.objects.get(user = request.user, circuit = wk.Circuit)
                favorite = True
            except UserFavorite.DoesNotExist:
                favorite = False
        else:
            favorite = False

        if wk.Img.all().count() == 0:
            Img = [wk.DefaultImg]
        else:
            Img = [i.URL for i in wk.Img.all()]

        Awards = wk.Award.split(';')
        while len(Awards) > 0 and Awards[-1] == '':
            Awards = Awards[: -1]

        relatedTeams = Trelation.objects.filter(first = wk)
        relatedTeams = list(map(lambda rt: {
            'teamName': rt.second.Teamname,
            'projectName': rt.second.Title,
            'year': rt.second.Year,
            'id': rt.second.TeamID
        }, relatedTeams))

        keywords = TeamKeyword.objects.filter(Team = wk)
        keywords = list(map(lambda tk: [tk.keyword, tk.score], keywords))
        keywords.sort(key = lambda tk: -tk[1])
        keywords = list(map(lambda tk: tk[0], keywords))[:5]

        wk.ReadCount += 1
        wk.save()
        context = {
            'projectName': wk.Title,
            'teamName': wk.Teamname,
            'year': wk.Year,
            'readCount': wk.ReadCount,
            'medal': wk.Medal,
            'rewards': Awards,
            'description': wk.Description,
            'isFavourite': favorite,
            'images': Img,
            'designId': -1 if wk.Circuit is None else wk.Circuit.id,
            'part': part,
            'logo': wk.logo,
            'keywords': keywords,
            'relatedTeams': relatedTeams
        }

        return render(request, 'work.html', context)

    except Works.DoesNotExist:
        return HttpResponse("Work Does Not Exist!")

search_url = 'http://sdin.sysusoftware.info:10086'
import requests
import json

trackTable = {
    'artDesign': 'Art & Design',
    'diagnostics': 'Diagnostics',
    'energy': 'Energy',
    'environment': 'Environment',
    'foodEnergy': 'Food & Energy',
    'foodAndNutrition': 'Food and Nutrition',
    'foundationalAdvance': 'Foundational Advance',
    'hardware': 'Hardware',
    'healthMedicine': 'Health & Medicine',
    'highSchool': 'High School',
    'informationProcessing': 'Information Processing',
    'manufacturing': 'Manufacturing',
    'measurement': 'Measurement',
    'newApplication': 'New Application',
    'software': 'Software',
    'therapeutics': 'Therapeutics'}

def _get_work(w, request):
    if request.user.is_authenticated:
        try:
            UserFavorite.objects.get(user = request.user, circuit = w.Circuit)
            favourite = True
        except UserFavorite.DoesNotExist:
            favourite = False
    else:
        favourite = False

    awards = w.Award.split(';')
    while len(awards) > 0 and awards[-1] == '':
        awards = awards[:-1]

    return {
        'id': w.TeamID,
        'year': w.Year,
        'teamName': w.Teamname,
        'projectName': w.Title,
        'school': w.Teamname,
        'medal': w.Medal,
        'description': w.SimpleDescription,
        'chassis': w.Chassis,
        'rewards': awards,
        'isFavourite': favourite,
        'logo': w.logo,
        'IEF': w.IEF
    }

def safety_level(s):
        try:
            return {
                1: 'Low risk',
                2: 'Moderate risk',
                3: 'High risk'
            }[s]
        except KeyError:
            return 'Unknown risk'

def _get_part(p, request):
    if request.user.is_authenticated:
        try:
            FavoriteParts.objects.get(user = request.user, part = p)
            favourite = True
        except FavoriteParts.DoesNotExist:
            favourite = False
    else:
        favourite = False
    return {
        'id': p.id,
        'name': p.Name,
        'group': p.Group,
        'date': p.DATE,
        'description': p.Description,
        'type': p.Type,
        'releaseStatus': p.Release_status,
        'sampleStatus': p.Sample_status,
        'rating': p.Part_rating,
        'use': p.Use,
        'partResult': p.Part_results,
        'safety': safety_level(p.Safety),
        'isFavorite': favourite
    }

def search_work(request):
    key = request.GET.get('q')
    lkey = key.lower()

    year = request.GET.get('year')
    if year == None:
        year = 'any'
    medal = request.GET.get('medal')
    if medal == None:
        medal = 'any'
    track = request.GET.get('track')
    if track == None:
        track = 'any'
    if track != 'any':
        track = trackTable[track]

    keys = key.split()
    true_keys = []

    key_dict = {}
    q = Keyword.objects.all()
    d = list(filter(lambda x: x.name.lower() in lkey, q))
    for i in d:
        if 'name' not in key_dict or len(key_dict['name']) < len(i.name):
            key_dict = i.__dict__

    for i in keys:
        keyword_query = Keyword.objects.filter(name__contains = i)
        filter_key = False
        for j in keyword_query:
            if j._type == 'year' and (year == 'any' or year == j.name):
                year = j.name
                filter_key = True
            elif j._type == 'track' and (track == 'any' or track == j.name):
                track = j.name
                filter_key = True
            elif j._type == 'medal' and (medal == 'any' or medal == j.name):
                medal = j.name
                filter_key = True

        if not filter_key:
            true_keys.append(i)

    if 'link' in key_dict:
        key_dict['link'] = json.loads(key_dict['link'])

    parts = []
    works = []
    keywords = []

    if '_type' in key_dict and (key_dict['_type'] == 'team name' or key_dict['_type'] == 'special prizes'):
        _data = json.loads(key_dict['suggestedProject'])
        for d in _data:
            try:
                w = Works.objects.get(Year = d[1][0:4], Teamname = d[1][5:])
                works.append(_get_work(w, request))
            except:
                pass
        _data = json.loads(key_dict['suggestedPart'])
        for d in _data:
            try:
                w = Parts.objects.get(Name = d[1])
                parts.append(_get_part(w, request))
            except:
                pass


    key = ''.join(map(lambda x: str(x) + ' ', true_keys))
    if len(key) > 0:
        key = key[:-1]
    key = key.lower()

    if request.user.is_authenticated and request.user.interest != 'None':
        interest = json.dumps(json.loads(request.user.interest)['interest'])
    else:
        interest = '[]'
    res = requests.get(search_url + "?key=" + key + "&interest=" + interest)
    try:
        result = json.loads(res.text)
    except:
        result = res.text

    if len(true_keys) == 0:
        q = Works.objects.all().order_by('-IEF')
        if year != 'any':
            q = q.filter(Year = year)
        if medal != 'any':
            q = q.filter(Medal = medal)
        if track != 'any':
            q = q.filter(Track = track)

        for w in q:
            works.append(_get_work(w, request))

    if type(result) is dict:
        if parts == []:
            for item in result['parts']:
                try:
                    p = Parts.objects.get(Name = item)
                    parts.append(_get_part(p, request))

                except Parts.DoesNotExist:
                    pass

        if works == []:
            for item in result['teams']:
                try:
                    s = item.split(' ')
                    w = Works.objects.get(Teamname = s[0], Year = s[1])

                    if year is not None and year != 'any' and w.Year != int(year):
                        continue
                    if medal is not None and medal != 'any' and w.Medal != medal:
                        continue
                    if track is not None and track != 'any' and w.Track != track:
                        continue

                    works.append(_get_work(w, request))

                except Works.DoesNotExist:
                    pass

        keywords = result['keyWords']

    context = {
        'works': works,
        'parts': parts,
        'keywords': keywords,
        'resultsCount': len(works),
        'additional': key_dict}
    return render(request, 'search/work.html', context)

def search_paper(request):
    key = request.GET.get('q')
    query = Papers.objects.filter(Title__contains = key)
    papers = [{
        'id': x.id,
        'title': x.Title,
        'author': x.Authors,
        'DOI': x.DOI,
        'abstract': x.Abstract if len(x.Abstract) <= 120 else x.Abstract[:117] + '...',
        'JIF': x.JIF,
        'logo': x.LogoURL,
        'circuitId': x.Circuit.id} for x in query]
    context = {
            'resultsCount': len(papers),
            'papers': papers}
    print(context)
    return render(request, 'search/paper.html', context)

def search_part(request):
    key = request.GET.get('q')
    lkey = key.lower()

    year = request.GET.get('year')
    if year == None:
        year = 'any'
    medal = request.GET.get('medal')
    if medal == None:
        medal = 'any'
    track = request.GET.get('track')
    if track == None:
        track = 'any'
    if track != 'any':
        track = trackTable[track]

    keys = key.split()
    true_keys = []

    key_dict = {}
    q = Keyword.objects.all()
    d = list(filter(lambda x: x.name.lower() in lkey, q))
    for i in d:
        if 'name' not in key_dict or len(key_dict['name']) < len(i.name):
            key_dict = i.__dict__

    for i in keys:
        keyword_query = Keyword.objects.filter(name__contains = i)
        filter_key = False
        for j in keyword_query:
            if j._type == 'year' and (year == 'any' or year == j.name):
                year = j.name
                filter_key = True
            elif j._type == 'track' and (track == 'any' or track == j.name):
                track = j.name
                filter_key = True
            elif j._type == 'medal' and (medal == 'any' or medal == j.name):
                medal = j.name
                filter_key = True

        if not filter_key:
            true_keys.append(i)

    if 'link' in key_dict:
        key_dict['link'] = json.loads(key_dict['link'])

    parts = []
    works = []
    keywords = []

    if '_type' in key_dict and (key_dict['_type'] == 'team name' or key_dict['_type'] == 'special prizes'):
        _data = json.loads(key_dict['suggestedProject'])
        for d in _data:
            try:
                w = Works.objects.get(Year = d[1][0:4], Teamname = d[1][5:])
                works.append(_get_work(w, request))
            except:
                pass
        _data = json.loads(key_dict['suggestedPart'])
        for d in _data:
            try:
                w = Parts.objects.get(Name = d[1])
                parts.append(_get_part(w, request))
            except:
                pass

    key = ''.join(map(lambda x: str(x) + ' ', true_keys))
    if len(key) > 0:
        key = key[:-1]
    key = key.lower()

    if request.user.is_authenticated and request.user.interest != 'None':
        interest = json.dumps(json.loads(request.user.interest)['interest'])
    else:
        interest = '[]'
    res = requests.get(search_url + "?key=" + key + "&interest=" + interest)
    try:
        result = json.loads(res.text)
    except:
        result = res.text

    if len(true_keys) == 0:
        q = Works.objects.all().order_by('-IEF')
        if year != 'any':
            q = q.filter(Year = year)
        if medal != 'any':
            q = q.filter(Medal = medal)
        if track != 'any':
            q = q.filter(Track = track)

        for w in q:
            works.append(_get_work(w, request))

    if type(result) is dict:
        if parts == []:
            for item in result['parts']:
                try:
                    p = Parts.objects.get(Name = item)
                    parts.append(_get_part(p, request))

                except Parts.DoesNotExist:
                    pass

        if works == []:
            for item in result['teams']:
                try:
                    s = item.split(' ')
                    w = Works.objects.get(Teamname = s[0], Year = s[1])

                    if year is not None and year != 'any' and w.Year != int(year):
                        continue
                    if medal is not None and medal != 'any' and w.Medal != medal:
                        continue
                    if track is not None and track != 'any' and w.Track != track:
                        continue

                    works.append(_get_work(w, request))

                except Works.DoesNotExist:
                    pass

        keywords = result['keyWords']

    context = {
        'works': works,
        'parts': parts,
        'keywords': keywords,
        'resultsCount': len(parts),
        'additional': key_dict}
    return render(request, 'search/part.html', context)

def search_paper(request):
    key = request.GET.get('q')
    query = Papers.objects.filter(Title__contains = key)
    papers = [{
        'id': x.id,
        'title': x.Title,
        'author': x.Authors,
        'DOI': x.DOI,
        'abstract': x.Abstract if len(x.Abstract) <= 120 else x.Abstract[:117] + '...',
        'JIF': x.JIF,
        'logo': x.LogoURL,
        'circuitId': x.Circuit.id} for x in query]
    context = {
            'resultsCount': len(papers),
            'papers': papers}
    print(context)
    return render(request, 'search/paper.html', context)
    return render(request, 'search/part.html', context)


def paper(request):
    key = request.GET.get('id')
    try:
        paper = Papers.objects.get(pk = key)

        parts_query = CircuitParts.objects.filter(Circuit = paper.Circuit)
        part = []
        for q in parts_query:
            try:
                pt = q.Part
                if request.user.is_authenticated:
                    try:
                        FavoriteParts.objects.get(user = request.user, part = pt)
                        part.append({
                            'id': pt.id,
                            'BBa': pt.Name,
                            'name': pt.secondName,
                            'isFavourite': True})
                    except FavoriteParts.DoesNotExist:
                        part.append({
                            'id': pt.id,
                            'BBa': pt.Name,
                            'name': pt.secondName,
                            'isFavourite': False})

            except Parts.DoesNotExist:
                part.append({
                    'id': pt.id,
                    'BBa': pt.Name,
                    'name': pt.secondName,
                    'isFavourite': False})
        if request.user.is_authenticated:
            try:
                UserFavorite.objects.get(user = request.user, circuit = paper.Circuit)
                favorite = True
            except UserFavorite.DoesNotExist:
                favorite = False
        else:
            favorite = False

        context = {
            'title': paper.Title,
            'DOI': paper.DOI,
            'authors': paper.Authors.split(','),
            'abstract': paper.Abstract,
            'JIF': paper.JIF,
            'keywords': paper.Keywords,
            'designId': paper.Circuit.id,
            'articleURL': paper.ArticleURL,
            'copyright': paper.Copyright,
            'part': part
        }
        return render(request, 'paper.html', context)
    except Papers.DoesNotExist:
        return HttpResponse('Does not exist.')


@login_required
def interest(request):
    '''
    GET /api/interest (get user interests)
    return:
        interest: ['xxx', 'xxx']


    POST /api/interest (set user interests)
        interest: ['xxx', 'xxx']
    return:
        success: true of false
    '''
    try:
        if request.method == 'POST':
            request.user.interest = request.POST['data']
            request.user.save()
            return JsonResponse({
                'success': True})
        else:
            interests = request.user.interest
            if interests == 'None':
                interests = []
            else:
                interests = json.loads(interests)['interest']
            return JsonResponse({
                'success': True,
                'interest': interests})
    except:
        traceback.print_exc()
        return JsonResponse({
            'success': False})

import json
with open('sdin/tools/preload/others/daotu.json') as f:
    daotu = json.load(f)

def keywords(request):
    '''
    GET /keywords
    '''
    return JsonResponse(daotu)
