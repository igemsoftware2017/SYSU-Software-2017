# coding: utf-8

from server.database.DAO import DAO
from server.iGEMOption import *
import os

DAO.drop_db_if_exists(db_name='iGEM',username='root',password='123456')
current_path = os.getcwd()
dao = DAO(db_name='iGEM',username='root',password='123456')
dao.table_init()
dao.import_all_input_files(current_path + os.sep + "database" + os.sep + "preload")

dao.close()
