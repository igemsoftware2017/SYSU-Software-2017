# coding: utf-8

import pymysql
from .DataHelper import DataHelper
from server.iGEMOption import *
from .DatabaseHelper import *
"""
Database Access Object
数据库读写主要对象。
"""

class DAO:
    USER_NAME = 'root'
    PASSWORD = '123456'

    def __init__(self, db_name, username=USER_NAME, password=PASSWORD):
        DAO.create_db_if_not_exists(db_name, username, password)
        self.db_conn = pymysql.connect(
                             host="localhost",
                             user=username,
                             passwd=password,
                             db=db_name,
                             charset='utf8'
                        )

    def table_init(self):
        create_table_if_not_exists(
            self.db_conn,
            "parts",
            ["name","type","description"],
        )

    def get_data_helper(self, option_set):
        """
        获取选项的数据管理器
        :param option_set: 选项
        :return:
        """
        return  DataHelper(option_set, self.db_conn)

    def import_all_input_files(self, folder_path):
        helper = DataHelper(import_part, self.db_conn)
        #helper = DataHelper(import_all, self.db_conn)
        helper.import_input_files(folder_path)

    @staticmethod
    def create_db_if_not_exists(db_name, username, password):
        database = pymysql.connect(
                        host="localhost",
                        user=username,
                        passwd=password
                    )
        cursor = database.cursor()
        sql = 'CREATE DATABASE IF NOT EXISTS ' + db_name
        cursor.execute(sql)
        database.close()

    def close(self):
        """
        关闭数据库连接
        :return:
        """
        self.db_conn.close()

    @staticmethod
    def drop_db_if_exists(db_name, username, password):
        database = pymysql.connect(
            host="localhost",
            user=username,
            passwd=password
        )
        cursor = database.cursor()
        sql = 'DROP DATABASE IF  EXISTS ' + db_name
        cursor.execute(sql)
        database.close()
