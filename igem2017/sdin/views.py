# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from django.shortcuts import render, redirect

from sdin.forms import *
from sdin.models import *

from django.db.models import Model
from django.contrib import messages
from django.db import IntegrityError
from django.core.exceptions import ObjectDoesNotExist

Err = "Something wrong!"
Inv = "Invalid form!"

def index(request):
    if request.method == "POST":
        form = LoginForm(request.POST)
        if form.is_valid():
            email = form.cleaned_data['email']
            password = form.cleaned_data['password']
            try:
                user = User.objects.get(email = email)
                if user.password_check(password):
                    request.session['user'] = {
                        'email': user.email,
                        'igem': user.igem,
                        'org': user.org
                    }
                    messages.success(request, "Login successfully!")    
                else:
                    messages.error(request, "Password error!")
            except ObjectDoesNotExist:
                messages.error(request, "Email Not registered!")
            except:
                messages.error(request, Err)
        else:
            messages.error(request, Inv)

    return render(request, 'index.html')

def search(request):
    return render(request, 'search.html')

def interest(request):
    return render(request, 'interest.html')

def detail(request):
    return render(request, 'detail.html')

def register(request):
    if request.method == "POST":
        form = RegisterForm(request.POST)
        if form.is_valid():
            try:
                User.objects.create(email = form.cleaned_data["email"],
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
