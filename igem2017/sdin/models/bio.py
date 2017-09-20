# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models

class Parts(models.Model):
    Name = models.CharField(max_length = 50, unique = True)
    Description = models.CharField(max_length = 100)
    Type = models.CharField(max_length = 20)
    Subparts = models.ManyToManyField('Parts')
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
    Part = models.ForeignKey('Parts', on_delete = models.CASCADE)
    Circuit = models.ForeignKey('Circuit', on_delete = models.CASCADE)
    X = models.IntegerField()
    Y = models.IntegerField()

    def __str__(self):
        return "%s of %s" % self.Part.Name, self.Circuit.Name

class CircuitLines(models.Model):
    Start = models.ForeignKey('CircuitParts', related_name = 'Start', on_delete = models.CASCADE)
    End = models.ForeignKey('CircuitParts', related_name = 'End', on_delete = models.CASCADE)
    Type = models.CharField(max_length = 20)

    def __str__(self):
        return "%s to %s of type %s" % self.Start.Part.Name, self.End.Part.Name, self.Type
