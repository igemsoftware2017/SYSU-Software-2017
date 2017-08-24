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
"""


# 以下语句只需运行一次~ 将数据导入到数据库
dao.import_all_input_files('E:\\data\\')

dataHelper.prepare_input_files('D:\\data\\')

# 这里调用EpredCaller运行epred
# 另外Model和Rfile文件夹需要自行复制
os.system(
    r'java -jar xxx.jar -i D:\data\ -o D:\output\ -p-area all -p-duration annual -p-year 2016 -rr')

dataHelper.collect_output_files('D:\\output\\')

# 将数据库保存的输出文件导出到 D:\output_clone
dataHelper.export_output_files('D:\\output_clone\\')

dao.close()



"""