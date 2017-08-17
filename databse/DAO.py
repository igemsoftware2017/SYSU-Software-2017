import pymysql

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
