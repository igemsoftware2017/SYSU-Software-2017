﻿# -*- coding: utf-8 -*-

"""
preload parts,works and circuits data into database
"""
from django.db.transaction import atomic

from ..models import *
import os
import csv
import json
import traceback
import xlrd
from os.path import join

# load parts data
def get_parts_type(filename):
    l = filename.rindex("(")
    r = filename.rindex(")")
    return filename[l+1:r]

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
    Nameset = set()
    for root, dirs, files in os.walk(parts_floder_path):
        for name in files:
            if "info" in name or "safety" in name or "score" in name:
                continue
            filepath = os.path.join(root, name)
            csv_reader = csv.reader(open(filepath, "r", encoding='utf-8'))
            part_type = get_parts_type(name)
            print('  Loading %s...' % filepath)
            next(csv_reader)
            for row in csv_reader:
                try:
                    row[0] = row[0].strip()
                    if row[0] in Nameset:
                        continue
                    Nameset.add(row[0])
                    if row[0] == "BBa_K1899002":
                        row.pop(1)
                    row[13] = ";".join(list(set(row[13].strip().split(";"))))
                    if not row[2].isdigit():
                        row[2] = 0
                    if not row[3].isdigit():
                        row[3] = 0
                    parts.append(Parts(
                        Name = row[0], Description = row[1],
                        Length = int(row[2]), Type = part_type,
                        Part_rating = int(row[3]), Release_status = row[5],
                        Twins = row[6],Sample_status = row[7],
                        Part_results = row[8], Use = row[9],
                        Group = row[10], Author = row[11],
                        DATE =row[12], Distribution = row[13]
                    ))
                except Exception as err:
                    errors += 1
                    print(err)
                    pass
    print('Saving...')
    atomic_save(parts)
    print('Error: {0:6d}'.format(errors))
    all_parts = {p.Name: p for p in Parts.objects.all()}
    load_part_score_and_Safety(parts_floder_path, all_parts)
    load_part_info(parts_floder_path, all_parts)

def load_part_score_and_Safety(parts_floder_path, all_parts):
    files = ["part_score.csv", "part_safety.csv"]
    for name in files:
        parts = []
        filepath = join(parts_floder_path, name)
        reader = csv.reader(open(filepath, encoding='utf-8'))
        print('  Loading %s...' % filepath)
        errors = 0
        next(reader)
        for row in reader:
            part = all_parts[row[0]]
            try:
                if name == "part_score.csv":
                    part.Score = row[1]
                else:
                    part.Safety = row[1]
                parts.append(part)
            except:
                errors += 1
                pass
        print('Saving ...')
        atomic_save(parts)
        print('Error: {0:6d}'.format(errors))

def load_part_info(parts_floder_path, all_parts):
    files = ["partsinfo.csv", "other_DNA_info.csv"]
    part_subparts = []
    parts = []
    err1, err2 = 0, 0
    for name in files:
        filepath = join(parts_floder_path, name)
        reader = csv.reader(open(filepath, encoding='utf-8'))
        print('  Loading %s...' % filepath)
        next(reader)
        for row in reader:
            if row[0] not in all_parts:
                #print(row[0])
                continue
            part = all_parts[row[0]]
            try:
                part.Sequence = row[4]
                parts.append(part)
            except:
                err1 += 1
                pass
            if row[2] != "":
                for subname in json.loads(row[2].replace('\'', '"')):
                    try:
                        subname.replace("'", "")
                        if subname not in all_parts:
                           continue
                        subpart = all_parts[subname]
                        part_subparts.append(SubParts(
                                parent = part,
                                child = subpart
                        ))
                    except Exception as error:
                        #print(repr(error))
                        err2 += 1
                        pass
    print('Saving parts...')
    atomic_save(parts)
    print('Error: {0:6d}'.format(err1))
    print('Saving Subparts...')
    atomic_save(part_subparts)
    print('Error: {0:6d}'.format(err2))

#load works data
def load_works(works_floder_path):
    errors = 0

    print('Deleting all previous works...')
    Works.objects.all().delete()

    works = []
    for root, dirs, files in os.walk(works_floder_path):
        if "circuits" in root:
            continue
        for name in files:
            if name == "Team_description.csv" or "score" in name:
                continue
            filepath = os.path.join(root, name)
            csv_reader = csv.reader(open(filepath, encoding='utf-8'))
            print('  Loading %s...' % filepath)
            
            try:
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
                    except Exception as err1:
                        errors += 1
                        print(err1)
                        pass
            except Exception as err2:
                errors += 1
                print(err2)
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
            work = Works.objects.get(Teamname = row[0].strip(), Year = int(row[1]))
            work.SimpleDescription = row[2]
            work.Description = row[3]
            work.Keywords = row[4]
            work.Chassis = row[5]
            works.append(work)
        except Exception as err3:
            errors += 1
            print(err3)
            pass
    print('Saving...')
    atomic_save(works)
    print('Error: {0:6d}'.format(errors))

    print('Loading Team_IEF value...')
    works = []
    filepath = os.path.join(works_floder_path, "project_score.csv")
    csv_reader = csv.reader(open(filepath, encoding='utf-8'))
    errors = 0
    next(csv_reader)
    for row in csv_reader:
        try:
            work = Works.objects.get(TeamID = int(row[0]))
            work.IEF = row[3]
            works.append(work)
        except Exception as err4:
            errors += 1
            print(err4)
            pass
    print('Saving...')
    atomic_save(works)
    print('Error: {0:6d}'.format(errors))

def load_circuits(circuits_floder_path):
    Circuit.objects.all().delete()
    print("Delete all circuits")

    for root, dirs, files in os.walk(circuits_floder_path):
        for name in files:
            try:
                f = xlrd.open_workbook(os.path.join(root, name))
                for sheet in f.sheets():

                    try:
                        teamID = int(sheet.cell(1, 0).value)
                    except:
                        print(sheet.name)
                    teamName = sheet.cell(1, 1).value

                    try:
                        team = Works.objects.get(TeamID = teamID)
                    except Works.DoesNotExist:
                        team = Works.objects.create(
                                TeamID = teamID,
                                Teamname = teamName)

                    try:
                        circuit = Circuit.objects.create(Name = teamName + str(teamID), Description = "")
                    except:
                        continue
                    team.Circuit = circuit
                    team.save()

                    cids = {}                    
                    for i in range(0, sheet.nrows):
                        if 'b' in name:
                            if sheet.cell(i, 0).value == 'parts and others':
                                row = i + 2
                                while isinstance(sheet.cell(row, 0).value, float):
                                    try:
                                        p = Parts.objects.get(Name = sheet.cell(row, 1).value)
                                    except:
                                        p = Parts.objects.create(
                                                Name = sheet.cell(row, 1).value,
                                                Type = sheet.cell(row, 2).value)
                                    try:
                                        cp = CircuitParts.objects.create(
                                                Part = p,
                                                Circuit = circuit,
                                                X = sheet.cell(row, 4).value,
                                                Y = sheet.cell(row, 5).value)
                                    except:
                                        traceback.print_exc()
                                        print(name)
                                        print(sheet.name)
                                    cids[int(sheet.cell(row, 0).value)] = cp
                                    
                                    row += 1
                        else:
                            if sheet.cell(i, 0).value == 'parts and other':
                                
                                row = i + 2

                                while isinstance(sheet.cell(row, 0).value, float):
                                    try:
                                        p = Parts.objects.get(Name = sheet.cell(row, 1).value)
                                    except:
                                        p = Parts.objects.create(
                                                Name = sheet.cell(row, 1).value,
                                                Type = sheet.cell(row, 2).value)
                                    try:
                                        cp = CircuitParts.objects.create(
                                                Part = p,
                                                Circuit = circuit,
                                                X = sheet.cell(row, 5).value,
                                                Y = 0 if sheet.cell(row, 6).value == "" else sheet.cell(row, 6).value)
                                    except:
                                        traceback.print_exc()
                                        print(name)
                                        print(sheet.name)
                                    cids[int(sheet.cell(row, 0).value)] = cp

                                    row += 1

                        if sheet.cell(i, 0).value == 'devices':
                            row = i + 2
                            while isinstance(sheet.cell(row, 0).value, float):
                                cd = CircuitDevices.objects.create(
                                        Circuit = circuit)
                                s = sheet.cell(row, 1).value.split(',')
                                try:
                                    map(lambda x: cd.Subparts.add(cids[int(x)]), s)
                                except:
                                    pass
                                cd.save()
                                row += 1
                        if sheet.cell(i, 0).value == "promotion":
                            row = i + 1
                            while isinstance(sheet.cell(row, 0).value, float):
                                try:
                                    s = int(sheet.cell(row, 0).value)
                                    e = sheet.cell(row, 1).value
                                    if isinstance(e, float):
                                        CircuitLines.objects.create(
                                            Start = cids[s],
                                            End = cids[int(e)],
                                            Type = "promotion")
                                    else:
                                        e = e.split(',')
                                        for x in e:
                                            CircuitLines.objects.create(
                                                Start = cids[s],
                                                End = cids[int(x)],
                                                Type = "promotion")

                                except:
                                    traceback.print_exc()
                                    print(name)
                                    print(sheet.name)
                                row += 1
                        if sheet.cell(i, 0).value == "inhibition":
                            row = i + 1
                            while isinstance(sheet.cell(row, 0).value, float):
                                try:
                                    s = int(sheet.cell(row, 0).value)
                                    e = sheet.cell(row, 1).value
                                    if isinstance(e, float):
                                        CircuitLines.objects.create(
                                            Start = cids[s],
                                            End = cids[int(e)],
                                            Type = "inhibition")
                                    else:
                                        e = e.split(',')
                                        for x in e:
                                            CircuitLines.objects.create(
                                                Start = cids[s],
                                                End = cids[int(x)],
                                                Type = "inhibition")

                                except:
                                    traceback.print_exc()
                                    print(name)
                                    print(sheet.name)
                                row += 1


            except UnicodeDecodeError:
                pass
            except IndexError:
                pass
            except ValueError:
                traceback.print_exc()
                print(name)
            except:
                traceback.print_exc()
                print(name)


def pre_load_data(currentpath):
    load_parts(os.path.join(currentpath, 'parts'))
    load_works(os.path.join(currentpath, 'works'))
    load_circuits(os.path.join(currentpath, 'works/circuits'))
