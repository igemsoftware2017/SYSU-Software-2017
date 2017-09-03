# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from django.shortcuts import render, redirect

from sdin.forms import *
from sdin.models import *

from django.db.models import Model
from django.contrib import messages
from django.db import IntegrityError

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
                    messages.error("Password error!")
                else:
                    request.session['user'] = user
                    messages.success("Login successfully!")
            except Model.DoesNotExist:
                messages.error("Email Not registered!")
            except:
                messages.error(Err)
        else:
            messages.error(Inv)

    return render(request, 'index.html')

def search(request):
    if request.method == "POST":
        form = RegisterForm(request.POST)
        if form.is_valid():
            try:
                User.objects.create(email = form.cleaned_data["email"],
                        password = form.cleaned_data["password"],
                        org = form.cleaned_data["org"],
                        igem = form.cleaned_data["igem"]
                        )
                messages.success("Register successfully!")
            except IntegrityError:
                messages.error("Email already exists!")
            except:
                messages.error(Err)
        else:
            messages.error(Inv)

    return render(request, 'search.html')

def interest(request):
    return render(request, 'interest.html')

def detail(request):
    return render(request, 'detail.html')

def register(request):
    return render(request, 'register.html')
