# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from django.shortcuts import render

def index(request):
    return render(request, 'index.html')

def search(request):
    return render(request, 'search.html')

def interest(request):
    return render(request, 'interest.html')

def detail(request):
    return render(request, 'detail.html')

def register(request):
    return render(request, 'register.html')
