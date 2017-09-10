# -*- coding: utf-8 -*-

"""
preload parts,works and circuits data into database
"""
from sdin.models import *
import os
import csv

def get_parts_type(filename):
	if "other_DNA" in filename:
		return str("other_DNA")
	elif "_" in filename:
		return "%s" % filename[0 : filename.index("_")]
	else:
		return "%s" % filename[0 : filename.index(".")]


def load_parts(floder_path):
	 for root, dirs, files in os.walk(folder_path):
            for name in files:
                filepath = os.path.join(root, name)
                csv_reader = csv.reader(open(filepath), encoding='utf-8')
                part_type = get_parts_type(name)

                row_cnt = 0
                for row in csv_reader:
                	row_cnt += 1
                	if (row_cnt == 1):
                		name_idx = row.index("Name")
                		description_idx = row.index("Description")
                	else:
                		Parts.objects.create( 
                	    	name=row[name_idx], 
                			description=row[description_idx],
                			Type=part_type
                		)



def pre_load_data(currentpath):
	load_parts(currentpath +  os.sep + "parts")

if __name__ == '__main__':
	pre_load_data("C:\Users\freedom\Documents\GitHub\IGEM2017-SYSU.Software\igem2017\sdin\preload")