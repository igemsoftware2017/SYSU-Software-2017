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
def interest(request):
    return render(request, 'interest.html')

def register(request):
    if request.method == "POST":
        form = RegisterForm(request.POST)
        if form.is_valid():
            try:
                User.objects.create_user(email = form.cleaned_data["email"],
                        password = form.cleaned_data["password"],
                        org = form.cleaned_data["org"],
                        igem = form.cleaned_data["igem"]
                        )
                messages.success(request, "Register successfully!")
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
                        part.append({
                            'BBa': item,
                            'name': item,
                            'isFavourite': True})
                    except FavoriteParts.DoesNotExist:
                        part.append({
                            'BBa': item,
                            'name': item,
                            'isFavourite': False})

            except Parts.DoesNotExist:
                part.append({
                    'BBa': item,
                    'name': item,
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

        wk.ReadCount += 1
        wk.save()
        context = {
            'projectName': wk.Title,
            'year': wk.Year,
            'readCount': wk.ReadCount,
            'medal': wk.Medal,
            'rewards': Awards,
            'description': wk.SimpleDescription,
            'isFavourite': favorite,
            'images': Img,
            'designId': -1 if wk.Circuit is None else wk.Circuit.id,
            'part': part,
            'logo': wk.logo}

        return render(request, 'work.html', context)

    except Works.DoesNotExist:
        return HttpResponse("Work Does Not Exist!")

# TODO
search_url = 'http://6f24fb18.ngrok.io'
import requests
import json

uglyTable = {
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

def search_work(request):
    key = request.GET.get('q')
    year = request.GET.get('year')
    medal = request.GET.get('medal')
    track = request.GET.get('track')

    # TODO For test, ugly, will be changed later
    keys = key.split()
    key_dict = {}
    for i in keys:
        keyword_query = Keyword.objects.filter(name__contains = i)
        if keyword_query.count() > 0:
            x = keyword_query[0]
            key_dict = x.__dict__
            break
    
    res = requests.get(search_url + "?key=" + key)
    result = json.loads(res.text)
    parts = []
    works = []
    keywords = []
    if type(result) is dict:
        for item in result['parts']:
            try:
                p = Parts.objects.get(Name = item)
                if request.user.is_authenticated:
                    try:
                        FavoriteParts.objects.get(user = request.user, part = p)
                        favourite = True
                    except FavoriteParts.DoesNotExist:
                        favourite = False
                else:
                    favourite = False
                parts.append({
                    'name': p.Name,
                    'type': p.Type,
                    'id': p.id,
                    'isFavourite': favourite})
            except Parts.DoesNotExist:
                parts.append({
                    'name': item,
                    'type': 'unkown',
                    'id': -1,
                    'isFavourite': False})

        for item in result['teams']:
            try:
                s = item.split(' ')
                w = Works.objects.get(Teamname = s[0], Year = s[1])
                if request.user.is_authenticated:
                    try:
                        UserFavorite.objects.get(user = request.user, circuit = w.Circuit)
                        favourite = True
                    except UserFavorite.DoesNotExist:
                        favourite = False
                else:
                    favourite = False

                if year is not None and year != 'any' and w.Year != int(year):
                    continue
                if medal is not None and medal != 'any' and medal not in w.Medal:
                    continue
                if track is not None and track != 'any' and w.Track != uglyTable[track]:
                    continue

                awards = w.Award.split(';')
                while len(awards) > 0 and awards[-1] == '':
                    awards = awards[:-1]

                works.append({
                    'id': w.TeamID,
                    'year': w.Year,
                    'teamName': w.Teamname,
                    'projectName': w.Title,
                    'school': w.Teamname,
                    'medal': w.Medal,
                    'description': w.SimpleDescription[:200],
                    'chassis': w.Chassis,
                    'rewards': awards,
                    'isFavourite': favourite,
                    'logo': w.logo})
            except Works.DoesNotExist:
                works.append({
                    'id': -1,
                    'teamName': s[0],
                    'Year': s[1],
                    'isFavourite': False})

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
        'abstract': x.Abstract,
        'JIF': x.JIF,
        'logo': x.LogoURL,
        'circuitId': x.Circuit.id} for x in query]
    context = {
            'resultsCount': len(papers),
            'papers': papers}
    print(context)
    return render(request, 'search/paper.html', context)

def search_part(request):
    return render(request, 'search/part.html')

def paper(request):
    key = request.GET.get('id')
    try:
        paper = Papers.objects.get(pk = key)

        context = {
                'title': paper.Title,
                'DOI': paper.DOI,
                'abstract': paper.Abstract,
                'JIF': paper.JIF,
                'keywords': paper.Keywords,
                # TO ADD
                'designId': None,
                'part': {}}
        return render(request, 'paper.html', context)
    except Papers.DoesNotExist:
        return HttpResponse('Does not exist.')

def search_part(request):
    key = request.GET.get('q')
    query = Parts.objects.filter(Name__contains = key)
    parts = [{
        'id': x.id,
        'name': x.Name,
        'group': x.Group,
        'date': x.DATE,
        'description': x.Description,
        'type': x.Type,
        'releaseStatus': x.Release_status,
        'sampleStatus': x.Sample_status,
        'rating': x.Part_rating,
        'use': x.Use,
        'partResult': x.Part_results,
        'parameters': '???'
    } for x in query]
    context = {
            'resultsCount': len(parts),
            'parts': parts}
    return render(request, 'search/part.html', context)
