# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models
from django.contrib.auth.models import AbstractBaseUser

# Create your models here.

# User manager for User

from django.contrib.auth.base_user import BaseUserManager

from .bio import *
from os.path import join

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
    is_admin = models.BooleanField(default = False)
    interest = models.TextField(default="None")
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
    Teamname = models.CharField(max_length = 32)
    Region = models.CharField(max_length = 32)
    Country = models.CharField(max_length = 50)
    Track = models.CharField(max_length = 32)
    Section = models.CharField(max_length = 32)
    Size = models.IntegerField()
    Status = models.CharField(max_length = 32)
    Year = models.IntegerField()
    Wiki = models.URLField(max_length = 128)
    Section = models.CharField(max_length = 32)
    Medal = models.CharField(max_length = 128)
    Award = models.CharField(max_length = 512)
    Use_parts = models.TextField() 
    Title = models.CharField(max_length = 256)
    Description = models.TextField(default = "To be add")
    SimpleDescription = models.TextField(default = "To be add")
    Keywords = models.CharField(max_length = 200, default = "" )
    Chassis = models.CharField(max_length = 100, default = "None")
    IEF = models.FloatField(default=0.0)
    Circuit = models.ForeignKey('Circuit', on_delete = models.CASCADE, null = True)
    ReadCount = models.IntegerField(default = 0)
    """
    if there aren't Img existing, then use DefaultImg
    """
    DefaultImg = models.URLField(default = join("static", "img", "Team_img", "none.jpg"))
    Img = models.ManyToManyField('TeamImg')
    logo = models.URLField(default=join("static", "img", "Team_img", "none.jpg"))

    def __str__(self):
        return "%s : %s" % str(self.TeamID), self.Teamname

class TeamImg(models.Model):
    Name = models.CharField(max_length = 180, unique=True)
    URL = models.URLField(null = False)

class Papers(models.Model):
    DOI = models.CharField(max_length = 180, unique = True, default = "")
    Title = models.CharField(max_length = 200, default = "")
    Journal = models.CharField(max_length = 200, default = "")
    JIF = models.FloatField(default=0)
    ArticleURL = models.URLField(max_length = 500, null = False)
    LogoURL = models.URLField(max_length = 600, null = True)
    Abstract = models.TextField(default = "To be add")
    Keywords = models.TextField(default = "To be add")
    Authors = models.TextField(default = "To be add")
    Copyright = models.TextField(default ="To be add")
    ReadCount = models.IntegerField(default = 0)
    Circuit = models.ForeignKey('Circuit', on_delete = models.CASCADE, null = True)

    def __str__(self):
        return "%s : %s" % str(self.DOI), self.Title

class Trelation(models.Model):
    first =  models.ForeignKey('Works', related_name = 'first_work', on_delete = models.CASCADE)
    second = models.ForeignKey('Works', related_name = 'second_work', on_delete = models.CASCADE)
    score = models.FloatField(default=0)

class TeamKeyword(models.Model):
    Team =  models.ForeignKey('Works', related_name = 'Teamwork', on_delete = models.CASCADE)
    keyword = models.CharField(max_length = 100)
    score = models.FloatField(default=0)

class UserFavorite(models.Model):
    user = models.ForeignKey('User', on_delete = models.CASCADE)
    circuit = models.ForeignKey('Circuit', on_delete = models.CASCADE)

    def __str__(self):
        return "%s - %s" % self.user.name, self.circuit.Name

class FavoriteParts(models.Model):
    user = models.ForeignKey('User', on_delete = models.CASCADE)
    part = models.ForeignKey('Parts', on_delete = models.CASCADE)
