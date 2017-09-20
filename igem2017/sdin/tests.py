# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from django.shortcuts import render, redirect

import os

from django.contrib import messages
from django.db import IntegrityError
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth import authenticate, login, logout

from django.contrib.auth.decorators import login_required
from django.http import HttpResponse


from django.test import TestCase
