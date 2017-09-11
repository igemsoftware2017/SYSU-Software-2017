# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models

# Create your models here.

class User(models.Model):
    email = models.CharField(max_length = 32, unique = True)
    password = models.CharField(max_length = 32)
    org = models.CharField(max_length = 100)
    igem = models.CharField(max_length = 100)
    
    def password_check(self, pwd):
        return self.password == pwd
    
    def __str__(self):
        return "email: %s\norg: %s" % self.email, self.org
