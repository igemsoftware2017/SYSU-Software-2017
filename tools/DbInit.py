# -*- coding: utf-8 -*-

import pymysql
import json


def initDb(USER, PASSWORD):
    try:
        print("Connecting to database...")
        db_con = pymysql.connect(
            host="localhost",
            user=USER,
            passwd=PASSWORD
        )
    except:
        print("Connection is failed, check your root account in config.json")
    print("Successful connect to database")
    cursor = db_con.cursor()
    # drop previous database
    try:
        print("Drop previous database...")
        sql = 'DROP DATABASE IF EXISTS django'
        cursor.execute(sql)
    except Exception as Error:
        print(Error)

    # drop user
    try:
        print("Drop previous user for sdin...")
        sql = "DROP USER 'django'@'localhost'"
        cursor.execute(sql)
    except Exception as Error:
        print(Error)
    
    #create database for sdin
    try:
        print("Creating database for sdin...")
        sql = "CREATE DATABASE IF NOT EXISTS django"
        cursor.execute(sql)
    except Exception as Error:
        print(Error)

    #create user for sdin's database
    try:
        print("Creating user for sdin's database...")
        sql = "CREATE USER 'django'@'localhost' IDENTIFIED BY 'DjangoPass123!'"
        cursor.execute(sql)
    except Exception as Error:
        print(Error)
    
    #grant privileges to user
    try:
        print("Granting privileges to the user on sdin's database...")
        sql = "grant all privileges on django.* to django@localhost"
        cursor.execute(sql)
        cursor.execute("flush privileges")
    except Exception as Error:
        print(Error)
    print("Database has initialized!")
    return 1


if __name__ == "__main__":
    with open("config.json", "r", encoding='utf-8') as load_f:
	    cnf = json.load(load_f)
    flag = initDb(cnf["mysql_root_account"], cnf["mysql_root_password"])
