
#from django.contrib import admin
from django.urls import include, path
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.shortcuts import redirect
from django.conf.urls import (handler404, handler500)

handler404 = 'simulate.views.NotFoundError'
handler500 = 'simulate.views.ServerDiedMoment'

urlpatterns = [
    path('simulate/', include('simulate.urls')),
    #path('admin/', admin.site.urls),
    path('', lambda req: redirect('simulate/')),
]
urlpatterns += staticfiles_urlpatterns()
