# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models

class Keyword(models.Model):
    _type = models.CharField(max_length = 20)
    name = models.CharField(max_length = 200)
    description = models.TextField()
    link = models.TextField(null = True) # array
    picture = models.URLField(max_length = 1000, null = True)
    related = models.TextField(null = True) # array of keywords
    yearRelation = models.CharField(max_length = 1000) # dict of {1997: xxx, 2003: yyy}
    trackRelation = models.CharField(max_length = 1000) # dict
    medalRelation = models.CharField(max_length = 1000) # dict
    weightedRelated = models.TextField(null = True) # dict [[weight, key]]
    suggestedProject = models.TextField(null = True) # dict weighted
    suggestedPart = models.TextField(null = True) # dict weighted
