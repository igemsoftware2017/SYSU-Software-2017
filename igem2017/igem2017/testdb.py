# -*- coding: utf-8 -*-

from django.http import HttpResponse

from igem2017.sdin.pre_load_data import *


# 数据库操作
def testdb(request):
    print(os.getcwd())
    return HttpResponse("<p>数据添加成功！</p>")