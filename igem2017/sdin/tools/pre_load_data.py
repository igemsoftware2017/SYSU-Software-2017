# -*- coding: utf-8 -*-

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
import sys
import time
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
def atomic_add(items):
    for a, b in items:
        a.add(b)

def load_parts(parts_floder_path):
    errors = 0
    print('Deleting all previous parts...')
    Parts.objects.all().delete()

    print('Adding parts...')
    parts = []
    Nameset = set()
    for root, dirs, files in os.walk(parts_floder_path):
        for name in files:
            if "info" in name or "safety" in name or "score" in name or "partsDescName" in name:
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
    load_part_secondName(parts_floder_path, all_parts)
    load_part_score_and_Safety(parts_floder_path, all_parts)
    load_part_info(parts_floder_path, all_parts)

def load_part_secondName(parts_floder_path, all_parts):
    filepath = join(parts_floder_path, 'partsDescName.csv')
    reader = csv.reader(open(filepath, encoding='utf-8'))
    print('  Loading %s...' % filepath)
    errors = 0
    parts = []
    next(reader)
    for row in reader:
        part = all_parts[row[0].strip()]
        try:
            part.secondName = row[1].strip()
            part.Description = row[2].strip()
            parts.append(part)
        except:
            errors += 1
            pass
    print('Saving ...')
    atomic_save(parts)
    print('Error: {0:6d}'.format(errors))

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

def load_partsInteration(folderpath):
    all_parts = {p.Name: p for p in Parts.objects.all()}
    errors = 0
    parts_interact = []
    for root, dirs, files in os.walk(folderpath):
        for name in files:
            filepath = os.path.join(root, name)
            print('  Loading %s...' % filepath)
            csv_reader = csv.reader(open(filepath, "r", encoding='utf-8'))
            for row in csv_reader:
                try:
                    parent_part = all_parts[row[0].strip()]
                    child_part = all_parts[row[1].strip()]
                    interactType = row[2].strip()
                    score = -1.0
                    if "Final-1.csv" in name:
                        score = float(row[3])
                    parts_interact.append(PartsInteract(
                        parent = parent_part,
                        child = child_part,
                        InteractType = interactType,
                        Score = score
                    ))
                except Exception as err:
                    errors += 1
                    print(err)
    print('Saving parts interaction...')
    atomic_save(parts_interact)
    print('Error: {0:6d}'.format(errors))

def load_partsParameter(folderpath):
    all_parts = {p.Name: p for p in Parts.objects.all()}
    errors = 0
    parts = []
    for root, dirs, files in os.walk(folderpath):
        for name in files:
            filepath = os.path.join(root, name)
            print('  Loading %s...' % filepath)
            csv_reader = csv.reader(open(filepath, "r", encoding='utf-8'))
            next(csv_reader)
            for row in csv_reader:
                try:
                    part = all_parts[row[0].strip()]
                    part.Parameter = row[1].strip()
                    parts.append(part)
                except Exception as err:
                    errors += 1
                    print(err)
    print('Saving parts Parameter...')
    atomic_save(parts)
    print('Error: {0:6d}'.format(errors))

#load works data
def load_works(works_floder_path):
    errors = 0
    print('Deleting all previous works...')
    Works.objects.all().delete()

    works = []
    filepath = os.path.join(works_floder_path, "team_list.csv")
    csv_reader = csv.reader(open(filepath, encoding='utf-8'))
    print('  Loading %s...' % filepath)          
    try:
        next(csv_reader)
        for row in csv_reader:
            try:
                row[1] = row[1].strip()
                works.append(Works(
                    TeamID = int(row[0]),
                    Teamname = row[1],
                    Region = row[2],
                    Country = row[3],
                    Track = row[4],
                    Size = int(row[5]),
                    Status = row[6],
                    Year = int(row[7]),
                    Wiki = row[8],
                    Section = row[9],
                    Medal = row[10].replace(' medal', ''),
                    Award = row[11],
                    Use_parts = row[12],
                    Title = row[13],
                    Description = row[14],
                    SimpleDescription = row[14]
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
    load_Team_description(works_floder_path)
    load_Team_IEF(works_floder_path)
    load_TeamImg(works_floder_path)
    load_Team_logo(works_floder_path)

def load_Team_description(works_floder_path):
    print('Loading Team_description...')
    works = []
    filepath = os.path.join(works_floder_path, "Team_description.csv")
    csv_reader = csv.reader(open(filepath, encoding='utf-8'))
    errors = 0
    next(csv_reader)
    for row in csv_reader:
        try:
            row[0] = row[0].strip()
            work = Works.objects.get(Teamname = row[0], Year = int(row[1]))
            work.SimpleDescription = row[2]
            work.Description = row[3]
            work.Keywords = row[4]
            work.Chassis = row[5]
            works.append(work)
        except Exception as err3:
            errors += 1
            print(row[0], row[1])
            #print(err3)
            pass
    print('Saving...')
    atomic_save(works)
    print('Error: {0:6d}'.format(errors))
    print('Loading Team_description2...')
    works = []
    filepath = os.path.join(works_floder_path, "Team_description2.csv")
    csv_reader = csv.reader(open(filepath, encoding='utf-8'))
    errors = 0
    next(csv_reader)
    for row in csv_reader:
        try:
            row[1] = row[1].strip()
            work = Works.objects.get(Teamname=row[1].strip(), Year = int(row[0]))
            work.SimpleDescription = row[2].strip()
            works.append(work)
        except Exception as err3:
            errors += 1
            print(row[0], row[1])
            print(row)
            print(err3)
            pass
    print('Saving...')
    atomic_save(works)
    print('Error: {0:6d}'.format(errors))

def load_Team_IEF(works_floder_path):
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
            print(row[0]," ",row[1]," ", row[2])
            print(err4)
            pass
    print('Saving...')
    atomic_save(works)
    print('Error: {0:6d}'.format(errors))

def load_Team_logo(folderpath):
    print('Loading Team_logo url...')
    filepath = join(folderpath,"team_logo.jl")
    file = open(filepath,"r",encoding="utf-8")
    lines = file.readlines()
    file.close()
    errors = 0
    works = []
    for x in lines:
        x = json.loads(x)
        if x["image"] is None or x["image"]=="" or x["image"] == "link" or x["Wiki"] == "http://2015.igem.org/Team:Beijing_HDFL":
            continue
        url = x["image"]
        if "http" not in x["image"]:
            header = x["Wiki"][0:x["Wiki"].rindex("/")]
            tail = x["image"][1:]
            url = join(header, tail)
        try:
            work = Works.objects.get(Wiki = x["Wiki"])
            work.logo = url
            works.append(work)
        except Exception as err:
            errors += 1
            #print(err)
    print('Saving...')
    atomic_save(works)
    print('Error: {0:6d}'.format(errors))

def load_TeamImg(folderpath):
    print('Deleting all previous TeamImg...')
    TeamImg.objects.all().delete()
    Imgs, errors = [], 0
    header = join("static", "img", "Team_img")
    filepath = os.path.join(folderpath, "TeamImg.csv")
    csv_reader = csv.reader(open(filepath, encoding='utf-8'))
    print('Loading %s...' % filepath)
    for row in csv_reader:
        try:
            Team = row[0].split(" ")[0]
            year = Team[0:Team.index("_")]
            Imgs.append(TeamImg(
                    Name = row[0],
                    URL =  join(header, year, row[0])
            ))
        except Exception as err:
            errors += 1
            #print(Team)
            #print(err)
            pass
    print('Saving...')
    atomic_save(Imgs)
    print('Error: {0:6d}'.format(errors))
    print('Making releationship between works and Teamimg ...')
    errors = 0
    csv_reader2 = csv.reader(open(filepath, encoding='utf-8'))
    Imgs = {p.Name: p for p in TeamImg.objects.all()}
    all_works = {str(p.Year)+"_"+p.Teamname: p for p in Works.objects.all()}
    cache = []
    for row in csv_reader2:
        try:
            Team = row[0].split(" ")[0]
            year = Team[0:Team.index("_")]
            cache.append([all_works[Team].Img, Imgs[row[0]]])
        except Exception as err:
            errors += 1
            #print(Team)
            #print(err)
            pass
    print('Saving...')
    atomic_add(cache)
    print('Error: {0:6d}'.format(errors))

def load_Trelation(folderpath):
    print('Deleting all previous Team relationships...')
    Trelation.objects.all().delete()
    all_works = {str(p.Year)+"_"+p.Teamname: p for p in Works.objects.all()}
    trelation = []
    errors = 0
    for root, dirs, files in os.walk(folderpath):
        for name in files:
            filepath = os.path.join(root, name)
            reader = csv.reader(open(filepath, "r", encoding='utf-8'))
            print('  Loading %s...' % filepath)
            cnt = 0
            team = []
            for row in reader:
                team.append(row)
                cnt += 1
                if cnt == 2:
                    break
            team_len = len(team[0])
            next(reader)
            next(reader)
            for row in reader:
                try:
                    firname = row[1].strip() + "_" + row[0].strip()
                    if firname not in all_works:
                        continue
                    fir = all_works[firname]
                    d = dict()
                    for i in range(2, team_len):
                        secname = team[1][i].strip() + "_" + team[0][i].strip()
                        if secname not in all_works:
                            continue
                        if firname == secname:
                            continue
                        d[i] = float(row[i])
                    d = sorted(d.items(), key=lambda x: x[1])
                    for i in range(2, 12):
                        secname = team[1][d[i][0]].strip() + "_" + team[0][d[i][0]].strip()
                        sec = all_works[secname]
                        trelation.append(Trelation(
                            first = fir,
                            second = sec,
                            score = d[i][1]
                        ))
                except Exception as err:
                    errors += 1
                    pass
    print('Saving...')
    atomic_save(trelation)
    print('Error: {0:6d}'.format(errors))

def load_Teamkeyword(folderpath):
    print("Deleting all previous Team and keywords' relationships...")
    TeamKeyword.objects.all().delete()
    all_works = {str(p.Year)+"_"+p.Teamname: p for p in Works.objects.all()}
    tk = []
    errors = 0
    for root, dirs, files in os.walk(folderpath):
        for name in files:
            filepath = os.path.join(root, name)
            reader = csv.reader(open(filepath, "r", encoding='utf-8'))
            print('  Loading %s...' % filepath)
            for row in reader:
                keyword = row
                break
            next(reader)
            for row in reader:
                try:
                    firname = row[1].strip() + "_" + row[0].strip()
                    if "Example" in firname:
                        continue
                    fir = all_works[firname]
                    for i in range(3,len(keyword)):
                        if float(row[i]) == 0:
                            continue
                        tk.append(TeamKeyword(
                            Team = fir,
                            keyword = keyword[i],
                            score = float(row[i])
                        ))
                except Exception as err:
                    errors += 1
                    pass
    print('Saving...')
    atomic_save(tk)
    print('Error: {0:6d}'.format(errors))

#load papers data
def load_papers(folderpath):
    errors = 0
    print('Deleting all previous papers...')
    Papers.objects.all().delete()
    papers = []
    filepath = os.path.join(folderpath, "paper.csv")
    csv_reader = csv.reader(open(filepath, encoding='utf-8'))
    print('  Loading %s...' % filepath)          
    try:
        next(csv_reader)
        for row in csv_reader:
            try:
                row[0] = row[0].strip()
                if "10.1016/j.jconrel.2010.11.016" in row[0]:
                    continue;
                if "10.1126/science.1216753" in row[0]:
                    continue;
                if "10.1126/science.1203535" in row[0]:
                    continue;
                if "10.1126/science.1192128" in row[0]:
                    continue;
                if "10.1126/science.1205527" in row[0]:
                    continue;
                papers.append(Papers(
                    DOI = row[0].strip(),
                    Title = row[1].strip(),
                    Journal = row[2].strip(),
                    JIF = float(row[3]),
                    ArticleURL = row[4],
                    LogoURL = row[5],
                    Abstract = row[6],
                    Keywords = row[7],
                    Authors = row[8]
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
    atomic_save(papers)
    print('Error: {0:6d}'.format(errors))
    load_paper_Copyright(folderpath)

def load_paper_Copyright(folderpath):
    errors = 0
    filepath = os.path.join(folderpath, "papercopyright.csv")
    reader = csv.reader(open(filepath))
    print('  Loading %s...' % filepath)          
    next(reader)
    papers = []
    for row in reader:
        try:
            paper = Papers.objects.get(DOI = row[0].strip())
            paper.Copyright = row[1].strip()
            papers.append(paper)
        except Exception as err:
            errors += 1
            print(err)
            pass
    print('Saving...')
    atomic_save(papers)
    print('Error: {0:6d}'.format(errors))

def load_circuits(circuits_floder_path, is_work = True, delete = False):
    if delete:
        Circuit.objects.all().delete()
        print("Delete all circuits")

    new_part_count = 0

    for root, dirs, files in os.walk(circuits_floder_path):
        for name in files:
            try:
                f = xlrd.open_workbook(os.path.join(root, name))
                for sheet in f.sheets():
                    if is_work:
                        try:
                            teamID = int(sheet.cell_value(1, 0))
                        except:
                            print(sheet.name)
                        teamName = sheet.cell_value(1, 1)

                        try:
                            team = Works.objects.get(TeamID = teamID)
                        except Works.DoesNotExist:
                            print(teamName + ' ID:' + str(teamID) + ' Not found!')
                            continue
                        try:
                            circuit = Circuit.objects.create(Name = teamName + str(teamID), Description = "")
                        except:
                            circuit = Circuit.objects.get(Name = teamName + str(teamID))
                    else:
                        DOI = sheet.cell_value(1, 0)
                        try:
                            team = Papers.objects.get(DOI = DOI)
                        except Papers.DoesNotExist:
                            print(DOI + ' Not found!')
                        try:
                            circuit = Circuit.objects.create(Name = DOI, Description = "")
                        except:
                            circuit = Circuit.objects.get(Name = DOI)


                    
                    team.Circuit = circuit
                    team.save()

                    cids = {}
                    for i in range(0, sheet.nrows):
                        if not is_work:
                            if sheet.cell_value(i, 0) == 'parts and others':
                                row = i + 2
                                while isinstance(sheet.cell_value(row, 0), float):
                                    name = sheet.cell_value(row, 3)
                                    if isinstance(name, float):
                                        name = sheet.cell_value(row, 1)
                                    if name != sheet.cell_value(row, 1) and name.find('BBa') != 0:
                                        name = 'BBa_' + name
                                    try:
                                        p = Parts.objects.get(Name = name)
                                    except:
                                        print(name + ' not found.')
                                        p = Parts.objects.create(
                                                Name = name,
                                                Type = sheet.cell_value(row, 2),
                                                Description = sheet.cell_value(row, 1))
                                        new_part_count += 1
                                    try:
                                        cp = CircuitParts.objects.create(
                                                Part = p,
                                                Circuit = circuit,
                                                X = sheet.cell_value(row, 3),
                                                Y = sheet.cell_value(row, 4) if sheet.cell_value(row, 5) != "" else 0)
                                    except:
                                        pass
                                        traceback.print_exc()
                                        print(name)
                                        print(sheet.name)
                                    cids[int(sheet.cell_value(row, 0))] = cp
                                    
                                    row += 1

                        elif 'b' in name:
                            if sheet.cell_value(i, 0) == 'parts and others':
                                row = i + 2
                                while isinstance(sheet.cell_value(row, 0), float):
                                    try:
                                        p = Parts.objects.get(Name = sheet.cell_value(row, 1))
                                    except:
                                        p = Parts.objects.create(
                                                Name = sheet.cell_value(row, 1),
                                                Type = sheet.cell_value(row, 2))
                                    try:
                                        cp = CircuitParts.objects.create(
                                                Part = p,
                                                Circuit = circuit,
                                                X = sheet.cell_value(row, 4),
                                                Y = sheet.cell_value(row, 5) if sheet.cell_value(row, 5) != "" else 0)
                                    except:
                                        pass
                                        traceback.print_exc()
                                        print(name)
                                        print(sheet.name)
                                    cids[int(sheet.cell_value(row, 0))] = cp
                                    
                                    row += 1
                        else:
                            if sheet.cell_value(i, 0) == 'parts and other':
                                row = i + 2
                                while isinstance(sheet.cell_value(row, 0), float):
                                    try:
                                        p = Parts.objects.get(Name = sheet.cell_value(row, 1))
                                    except:
                                        p = Parts.objects.create(
                                                Name = sheet.cell_value(row, 1),
                                                Type = sheet.cell_value(row, 2))
                                    try:
                                        cp = CircuitParts.objects.create(
                                                Part = p,
                                                Circuit = circuit,
                                                X = sheet.cell_value(row, 5),
                                                Y = 0 if sheet.cell_value(row, 6) == "" else sheet.cell_value(row, 6))
                                    except:
                                        pass
                                        traceback.print_exc()
                                        print(name)
                                        print(sheet.name)
                                    cids[int(sheet.cell_value(row, 0))] = cp
                                    row += 1

                        if sheet.cell_value(i, 0) == 'devices':
                            row = i + 2
                            while isinstance(sheet.cell_value(row, 0), float):
                                cd = CircuitDevices.objects.create(
                                        Circuit = circuit)
                                try:
                                    s = sheet.cell_value(row, 1).split(',')
                                except:
                                    s = [sheet.cell_value(row, 1)]
                                for x in s:
                                    if x != '':
                                        try:
                                            cd.Subparts.add(cids[int(x)])
                                        except KeyError:
                                            pass
                                cd.save()
                                row += 1
                        if sheet.cell_value(i, 0) == "promotion":
                            row = i + 1
                            while row < sheet.nrows and isinstance(sheet.cell_value(row, 0), float):
                                try:
                                    s = int(sheet.cell_value(row, 0))
                                    e = sheet.cell_value(row, 1)
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
                                    pass
                                row += 1
                        if sheet.cell_value(i, 0) == "inhibition":
                            row = i + 1
                            while row < sheet.nrows and isinstance(sheet.cell_value(row, 0), float):
                                try:
                                    s = int(sheet.cell_value(row, 0))
                                    e = sheet.cell_value(row, 1)
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
                                    pass
                                row += 1

                        if sheet.cell_value(i, 0) == "combine":
                            row = i + 1
                            while row < sheet.nrows and isinstance(sheet.cell_value(row, 0), float):
                                try:
                                    comb = []
                                    j = 0
                                    while j < sheet.ncols and isinstance(sheet.cell_value(row, j), float):
                                        comb.append(int(sheet.cell_value(row, j)))
                                        j += 1
                                    if len(comb) >= 2:
                                        cc = CircuitCombines.objects.create(
                                                Circuit = circuit,
                                                Father = cids[comb[-1]])
                                        for k in comb[0: -1]:
                                            cc.Sons.add(cids[k])
                                        cc.save()
                                    row += 1
                                except KeyError:
                                    pass
                                except:
                                    pass
                                    traceback.print_exc()
                                    print(name)
                                    print(sheet.name)
                                row += 1


            except:
                pass

    print('Total new part: ' + str(new_part_count))

def get_value(sheet):
    def inner(i, j):
        k = sheet.cell_value(i, j)
        if k == 'None' or k == '':
            return None
        return k
    return inner

def load_additional(path):
    Keyword.objects.all().delete()
    medalXls = xlrd.open_workbook(join(path, 'medal.xlsx')).sheets()
    explain = medalXls[0]
    val = get_value(explain)

    gm = Keyword.objects.create(name = 'gold',
            description = val(1,1),
            link = json.dumps(['http://' + val(1,2)]),
            picture = '/static/img/picture/' + val(1,3),
            _type = "medal")

    sm = Keyword.objects.create(name = 'silver',
            description = val(2,1),
            link = json.dumps(['http://' + val(2,2)]),
            picture = '/static/img/picture/' + val(2,3),
            _type = "medal")

    bm = Keyword.objects.create(name = 'bronze',
            description = val(3,1),
            link = json.dumps(['http://' + val(3,2)]),
            picture = '/static/img/picture/' + val(3,3),
            _type = "medal")

    net = medalXls[1]
    val = get_value(net)

    def f(i):
        return json.dumps([val(j, i) for j in range(1, 14)])

    gm.related = f(1)
    sm.related = f(2)
    bm.related = f(3)

    an = medalXls[2]
    val = get_value(an)

    def f(i):
        return json.dumps({int(val(0, j)): val(i, j) for j in range(1, 8)})

    gm.yearRelation = f(1)
    sm.yearRelation = f(2)
    bm.yearRelation = f(3)

    def f(i):
        return json.dumps({val(j, 0): val(j, i) for j in range(9, 25)})

    gm.trackRelation = f(3)
    sm.trackRelation = f(4)
    bm.trackRelation = f(5)

    gm.save()
    sm.save()
    bm.save()

    # keyword
    kw = xlrd.open_workbook(join(path, 'keywords.xlsx')).sheets()
    val = get_value(kw[0])
    val2 = get_value(kw[2])

    for i in range(1, 1027):
        Keyword.objects.create(name = val(i, 0),
                description = val(i, 1),
                link = json.dumps(['http://' + val(i, 2) if val(i, 2) is not None else 'None']),
                picture = 'http:' + val(i, 3) if val(i, 3) is not None else 'None',
                yearRelation = json.dumps([{int(val2(0, j)): val2(i, j) for j in range(1, 9)}]),
                trackRelation = json.dumps([{val2(0, j): val2(i, j) for j in range(11, 27)}]),
                _type = "keyword")

    sp = xlrd.open_workbook(join(path, 'special prizes.xlsx')).sheets()
    v = get_value(sp[0])
    v2 = get_value(sp[1])
    v3 = get_value(sp[2])

    for i in range(1, 8):
        Keyword.objects.create(name = v(i, 0),
                description = v(i, 1),
                link = json.dumps(['http://' + v(i, 2)]),
                picture = v(i, 3),
                weightedRelated = v2(i, 1),
                suggestedProject = v3(i, 1),
                suggestedPart = v3(i, 2),
                _type = "special prizes")

    tn = xlrd.open_workbook(join(path, 'team name.xlsx')).sheets()
    v = get_value(tn[0])
    v2 = get_value(tn[1])
    v3 = get_value(tn[2])

    for i in range(1, 612):
        Keyword.objects.create(name = v(i, 0),
                description = v(i, 1),
                link = v(i, 2),
                picture = v(i, 3),
                weightedRelated = v2(i, 1),
                suggestedProject = v3(i, 1),
                suggestedPart = v3(i, 2),
                _type = "team name")

    t = xlrd.open_workbook(join(path, 'track.xlsx')).sheets()
    v = get_value(t[0])
    v2 = get_value(t[1])
    v3 = get_value(t[2])
    
    for i in range(1, 17):
        Keyword.objects.create(name = v(i, 0),
                description = v(i, 1),
                link = json.dumps(['http://' + v(i, 2)]),
                picture = '/static/img/picture/' + v(i, 3),
                related = json.dumps([v2(j, i) for j in range(1, 30)]),
                yearRelation = json.dumps([{int(v3(0, j)): v3(i, j) for j in range(1, 9)}]),
                medalRelation = json.dumps([{v3(19, j): v3(i + 19, j) for j in range(3, 7)}]),
                _type = "track")

    t = xlrd.open_workbook(join(path, 'year.xlsx')).sheets()
    v = get_value(t[0])
    v2 = get_value(t[1])
    v3 = get_value(t[2])
    
    for i in range(1, 9):
        Keyword.objects.create(name = str(int(v(i, 0))),
                description = v(i, 1),
                link = json.dumps(['http://' + v(i, 2)]),
                picture = '/static/img/picture/' + v(i, 3),
                related = json.dumps([v2(j, i) for j in range(1, 31)]),
                trackRelation = json.dumps([{v3(j, 0): v3(j, i) for j in range(13, 29)}]),
                medalRelation = json.dumps([{v3(j, 0): v3(j, i) for j in range(1, 5)}]),
                _type = "year")


def final():
    for i in Works.objects.filter(Year__lte = 2008):
        i.delete()

    for work in Works.objects.filter(Circuit = None):
        parts = work.Use_parts.split(';')
        circuit = Circuit.objects.create(
                Name = work.Teamname + str(work.TeamID),
                Description = '')
        for i in range(len(parts)):
            try:
                part = Parts.objects.get(Name = parts[i])
                CircuitParts.objects.create(
                        Part = part,
                        Circuit = circuit,
                        X = (i * 100) % 800,
                        Y = ((i * 100) // 800) * 200)
            except:
                pass
        work.Circuit = circuit
        work.save()

def pre_load_data(currentpath, Imgpath):
    load_parts(os.path.join(currentpath, 'parts'))
    load_partsInteration(os.path.join(currentpath, 'partsinteract'))
    load_partsParameter(os.path.join(currentpath, 'partsParameter'))
    load_works(os.path.join(currentpath, 'works'))
    load_Trelation(os.path.join(currentpath, 'TeamRelation'))
    load_Teamkeyword(os.path.join(currentpath, 'TeamKeyword'))
    load_papers(os.path.join(currentpath, 'papers'))
    load_circuits(os.path.join(currentpath, 'works/circuits'), delete = True)
    load_circuits(os.path.join(currentpath, 'papers/circuits'), is_work = False)
    #load_circuits(os.path.join(currentpath, 'works/circuits2'))
    load_additional(os.path.join(currentpath, 'additional'))
    final()
