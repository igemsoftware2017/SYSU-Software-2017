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

