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

from django.http import JsonResponse

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

def search(request):
    return render(request, 'search.html')

#@login_required
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
        context = {
            'projectName': wk.Title,
            'year': wk.Year,
            'readCount': wk.ReadCount,
            'medal': wk.Medal,
            'rewards': wk.Award,
            'description': wk.SimpleDescription,
            'isFavourite': favorite,
            'images': Img,
            'designId': -1 if wk.Circuit is None else wk.Circuit.id,
            'part': part}

        return render(request, 'work.html', context)

    except Works.DoesNotExist:
        return HttpResponse("Work Does Not Exist!")

# TODO
search_url = 'http://e8749c0f.ap.ngrok.io'
import requests
import json

def search(request):
    key = request.GET.get('q')
    res = requests.get(search_url + "?key=" + key)
    result = json.loads(res.text)
    parts = []
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

    works = []
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

            if w.Img.all().count() == 0:
                Img = w.DefaultImg
            else:
                Img = w.Img.all()[0].URL
            Awards = w.Award.split(';')
            while len(Awards) > 0 and Awards[-1] == '':
                Awards = Awards[:-1]
            works.append({
                'id': w.TeamID,
                'image': Img,
                'year': w.Year,
                'teamName': w.Teamname,
                'projectName': w.Title,
                # TODO
                'school': '???',
                'risk': '???',
                'medal': w.Medal,
                'description': w.SimpleDescription,
                'chassis': w.Chassis,
                'rewards': Awards,
                'isFavourite': favourite})
        except Works.DoesNotExist:
            works.append({
                'id': -1,
                'teamName': s[0],
                'Year': s[1],
                isFavourite: False})

    context = {
        'works': works,
        'parts': parts,
        'keywords': result['keyWords'],
        'resultsCount': len(works)}
    return render(request, 'search.html', context)
