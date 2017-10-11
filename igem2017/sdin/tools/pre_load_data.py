# -*- coding: utf-8 -*-

"""
preload parts,works and circuits data into database
"""
from django.db.transaction import atomic

from ..models import *
import os
import csv
import json

# load parts data
def get_parts_type(filename):
    if "other_DNA" in filename:
        return str("other_DNA")
    elif "_" in filename:
        return "%s" % filename[0 : filename.index("_")]
    else:
        return "%s" % filename[0 : filename.index(".")]

@atomic
def atomic_save(items):
    for i in items:
        i.save()

@atomic
def atomic_add(part_subparts):
    for p, sp in part_subparts:
        p.Subparts.add(*sp)

def load_parts(parts_floder_path):
    errors = 0

    print('Deleting all previous parts...')
    Parts.objects.all().delete()

    print('Adding parts...')
    parts = []
    for root, dirs, files in os.walk(parts_floder_path):
        for name in files:
            filepath = os.path.join(root,name)
            csv_reader = csv.reader(open(filepath, encoding='utf-8'))
            part_type = get_parts_type(name)
            print('  Loading %s...' % filepath)

            next(csv_reader)
            for row in csv_reader:
                try:
                    parts.append(Parts(
                        Name = row[0],
                        Description = row[1],
                        Type = row[2],
                        Safety = row[4],
                        Sequence  = row[5]
                    ))
                except:
                    errors += 1
                    pass
    print('Saving...')
    atomic_save(parts)
    print('Error: {0:6d}'.format(errors))

    errors = 0

    print('Adding subparts...')
    all_parts = {p.Name: p for p in Parts.objects.all()}
    part_subparts = []
    for root, dirs, files in os.walk(parts_floder_path):
        for name in files:
            filepath = os.path.join(root, name)
            csv_reader = csv.reader(open(filepath, encoding='utf-8'))
            print('  Loading %s...subpart' % filepath)

            next(csv_reader)
            for row in csv_reader:
                if len(row) > 3 and row[3] != "":
                    new_part = all_parts[row[0]]
                    for part_name in json.loads(row[3].replace('\'', '"')):
                        try:
                            subpart = all_parts[part_name]
                            part_subparts.append(SubParts(
                                parent = new_part,
                                child = subpart
                            ))
                        except:
                            errors += 1
                            pass
    print('Saving...')
    atomic_save(part_subparts)
    print('Error: {0:6d}'.format(errors))

#load works data
def load_works(works_floder_path):
    errors = 0

    print('Deleting all previous works...')
    Works.objects.all().delete()

    works = []
    for root, dirs, files in os.walk(works_floder_path):
        for name in files:
            if name == "Team_description.csv":
                continue
            filepath = os.path.join(root,name)
            csv_reader = csv.reader(open(filepath, encoding='utf-8'))
            print('  Loading %s...' % filepath)

            next(csv_reader)
            for row in csv_reader:
                try:
                    works.append(Works(
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
                    ))
                except:
                    errors += 1
                    pass
    print('Saving...')
    atomic_save(works)
    print('Error: {0:6d}'.format(errors))

    print('Loading Team_description...')
    works = []
    filepath = os.path.join(works_floder_path, "Team_description.csv")
    csv_reader = csv.reader(open(filepath, encoding='utf-8'))
    errors = 0
    next(csv_reader)
    for row in csv_reader:
        try:
            work = Works.objects.get(Teamname = row[0], Year = int(row[1]))
            work.SimpleDescription = row[2]
            work.Description = row[3]
            work.Keywords = row[4]
            work.Chassis = row[5]
            works.append(work)
        except:
            errors += 1
            pass
    print('Saving...')
    atomic_save(works)
    print('Error: {0:6d}'.format(errors))


def pre_load_data(currentpath):
    load_parts(os.path.join(currentpath, 'parts'))
    load_works(os.path.join(currentpath, 'works'))
