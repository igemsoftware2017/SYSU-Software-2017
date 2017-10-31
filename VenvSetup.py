# -*- coding: utf-8 -*-

import os
import sys
import json
import platform
from os.path import join


def loadconfig(filepath):
    print("loading config file...")
    try:
        with open(filepath, "r", encoding='utf-8') as load_f:
            data = json.load(load_f)
    except Exception as error:
        print(error)
        sys.exit(1)
    return data
    print("loading has finished.")

def start_venv(systemver):
    if systemver == "Windows":
        os.system("RD /S /Q .env")
    else:
        os.system("rm -rf .env")
    print("Creating virtual environment...")
    os.system("pip3 install virtualenv")
    os.system("python3 -m venv .env")
    if systemver == "Windows":
        os.system(".env\\Scripts\\activate")
    else:
        os.system("source .env/bin/activate")
    print("Virtual environment has been created.")


if __name__=="__main__":
    currentpath = os.getcwd()
    systemver = platform.system()
    start_venv(systemver)
