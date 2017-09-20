# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models

class Parts(models.Model):
    Name = models.CharField(max_length = 50, unique = True)
    Description = models.CharField(max_length = 100)
    Type = models.CharField(max_length = 20)
    Subpart = models.CharField(max_length = 500)
    Safety = models.CharField(max_length = 500)
    Sequence = models.TextField()

    def __str__(self):
        return "%s : %s" % self.Name, self.Description

class Circuit(models.Model):
    Name = models.CharField(max_length = 50, unique = True)
    Description = models.CharField(max_length = 100)

    def __str__(self):
        return "%s" % self.Name

class CircuitParts(models.Model):
    Part = models.foreignkey(

class CircuitLine(models.Model):
    Circuit = models.ForeignKey('Circuit', on_delete = models.CASCADE)
    Start = models.ForeignKey('Parts', on_delete = models.CASCADE)
    End = models.ForeignKey('Parts', on_delete = models.CASCADE, null = True)
    Type = models.CharField(max_length = 20)

    def __str__(self):
        return "%s" % self.Circuit.Name
