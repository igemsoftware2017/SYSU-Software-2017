# -*- coding: utf-8 -*-

"""
preload parts,works and circuits data into database
"""
from django.db.transaction import atomic

from ..models import *
import os
import csv
import re

# load parts data
def get_parts_type(filename):
    if "other_DNA" in filename:
        return str("other_DNA")
    elif "_" in filename:
        return "%s" % filename[0 : filename.index("_")]
    else:
        return "%s" % filename[0 : filename.index(".")]

@atomic
def load_parts(parts_floder_path):
    Parts.objects.all().delete()
    for root, dirs, files in os.walk(parts_floder_path):
        for name in files:
            filepath = os.path.join(root,name)
            csv_reader = csv.reader(open(filepath, encoding='utf-8'))
            part_type = get_parts_type(name)
            print('  Loading %s...' % filepath)

            row_cnt = 0
            for row in csv_reader:
                row_cnt += 1
                if (row_cnt == 1):
                    continue
                else:
                    try:
                        new_part = Parts(
                            Name = row[0],
                            Description = row[1],
                            Type = row[2],
                            Safety = row[4],
                            Sequence  = row[5]
                        )
                        new_part.save();
                        if row[3] != "":
                            s = row[3]
                            s = re.split('[, ]', row[3][1:-1])
                            for part_name in s:
                                new_part.Subparts.add(part_name)
                    except:
                        pass

#load works data
@atomic
def load_works(works_floder_path):
    Works.objects.all().delete()
    for root, dirs, files in os.walk(works_floder_path):
        for name in files:
            filepath = os.path.join(root,name)
            csv_reader = csv.reader(open(filepath, encoding='utf-8'))
            print('  Loading %s...' % filepath)

            row_cnt = 0
            for row in csv_reader:
                row_cnt += 1
                if (row_cnt > 1):
                    try:
                        Works.objects.create(
                            TeamID = int(row[0]),
                            Teamname = row[1],
                            Region = row[2],
                            Country = row[3],
                            Track = row[4],
                            Section = row[5],
                            Size = int(row[6]),
                            Status = row[7],
                            Year = int(row[8]),
                            Wiki = row[9],
                            Medal = row[10],
                            Award = row[11],
                            Name = row[12],
                            Use_parts = row[13],
                        )
                    except:
                        pass


def pre_load_data(currentpath):
    parts_path = currentpath + os.sep + "parts"
    works_path = currentpath + os.sep + "works"
    load_parts(parts_path)
    load_works(works_path)
