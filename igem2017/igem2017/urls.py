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
    url(r'^interest$', main_views.interest),
    url(r'^register$', main_views.register),
    url(r'^login', main_views.login_view),
    url(r'^logout$', main_views.logout_view),
    url(r'^design$', design_views.design),
    url(r'^work$', main_views.work),
    url(r'^search$', main_views.search),
] + \
[
    # API urls
    url(r'api/get_favorite$', design_views.get_favorite),
    url(r'api/tag_favorite$', design_views.tag_favorite),
    url(r'api/parts$', design_views.search_parts),
    url(r'api/part$', design_views.part),
    url(r'api/get_circuit$', design_views.get_circuit),
    url(r'api/get_saves$', design_views.get_saves),
    url(r'api/save_circuit$', design_views.save_circuit),
] + \
[
    # Test urls
    url(r'^testdb$', test_views.testdb),
    url(r'^get_circuit_test', test_views.get_circuit_test),
]
