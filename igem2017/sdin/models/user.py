# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models
from django.contrib.auth.models import AbstractBaseUser

# Create your models here.

# User manager for User

from django.contrib.auth.base_user import BaseUserManager

class UserManager(BaseUserManager):
    
    def create_user(self, email, password, **other_fields):
        if not email:
            raise ValueError('The given email must be set')
        email = self.normalize_email(email)
        user = self.model(email = email, **other_fields)
        user.set_password(password)
        user.save()
        return user

class User(AbstractBaseUser):
    email = models.CharField(max_length = 32, unique = True)
    org = models.CharField(max_length = 100)
    igem = models.CharField(max_length = 100)
    is_active = models.BooleanField(default = True)

    objects = UserManager()

    # Fields
    USERNAME_FIELD = 'email'
    REQUIRED_FIELD = ['org', 'igem']

    def get_full_name():
        return "%s of %s" % self.email, self.org

    def get_short_name():
        return self.email
    
    def __str__(self):
        return "email: %s\norg: %s" % self.email, self.org

class Works(models.Model):
    TeamID = models.IntegerField(unique = True)
    Teamname = models.CharField(max_length = 30)
    Region = models.CharField(max_length = 30)
    Country = models.CharField(max_length = 30)
    Track = models.CharField(max_length = 30)
    Section = models.CharField(max_length = 30)
    Size = models.IntegerField()
    Status = models.CharField(max_length = 20)
    Year = models.IntegerField()
    Wiki = models.CharField(max_length = 100)
    Medal = models.CharField(max_length = 20)
    Award = models.CharField(max_length = 20)
    Name =  models.CharField(max_length = 50)
    Use_parts = models.CharField(max_length=500)

    def __str__(self):
        return "%s : %s" % str(self.TeamID), self.Teamname

