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
            else:
                messages.error(request, "Invalid Login!")
        else:
            messages.error(request, Inv)
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

def detail(request):
    return render(request, 'detail.html')

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
                            'isFavourite' False})

            except Parts.DoesNotExist:
                part.append({
                    'BBa': item,
                    'name': item,
                    'isFavourite' False})
        try:
            UserFavorite.objects.get(user = request.user, circuit = wk.Circuit)
            favorite = True
        except UserFavorite.DoesNotExist:
            favorite = False

        return JsonResponse({
            'projectName': wk.Name,
            'year': wk.Year,
            'readCount': wk.ReadCount,
            'medal': wk.Medal,
            'rewards': wk.Award,
            'description': wk.Description,
            'isFavourite': favorite,
            'images': '???',
            'designId': '???',
            'part': part})

    except Works.DoesNotExist:
        return JsonResponse({
            'status': 0})
