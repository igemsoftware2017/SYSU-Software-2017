"""igem2017 URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.11/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf.urls import url
from django.contrib import admin

from sdin import views as sdin_view
from sdin import tests as sdin_tests

urlpatterns = [
    url(r'^admin/', admin.site.urls),
    url(r'^$', sdin_view.index),
    url(r'^index$', sdin_view.index),
    url(r'^search$', sdin_view.search),
    url(r'^detail$', sdin_view.detail),
    url(r'^interest$', sdin_view.interest),
    url(r'^register$', sdin_view.register),
    url(r'^design$', sdin_view.design),
    url(r'^testdb$', sdin_tests.testdb),
]
