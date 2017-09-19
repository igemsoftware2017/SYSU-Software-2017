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

Err = "Something wrong!"
Inv = "Invalid form!"

def index(request):
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

    return render(request, 'index.html')

@login_required
def logout_view(request):
    logout(request)
    return redirect('index')

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

def design(request):
    return render(request, 'design.html')
