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

from sdin.views import main_views
from sdin.views import test_views
from sdin.views import design_views

urlpatterns = [
    url(r'^admin/', admin.site.urls),
    url(r'^$', main_views.index),
    url(r'^index$', main_views.index),
    url(r'^search$', main_views.search),
    url(r'^detail$', main_views.detail),
    url(r'^interest$', main_views.interest),
    url(r'^register$', main_views.register),
    url(r'^design$', main_views.design),
    url(r'^testdb$', test_views.testdb),
] + \
[
    # API urls
    url(r'api/query_parts$', design_views.query_part),
]
