"""FITogether URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve
from django.urls import re_path

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/image/', include('images.urls')),
    path('api/user/', include('users.urls')),
    path('api/chat/', include('chatrooms.urls')),
    path('api/post/', include('posts.urls', namespace="post")),
    path('api/comment/', include('comments.urls', namespace="comment")),
    path('api/tag/', include('tags.urls', namespace="tag")),
    path('api/information/', include('informations.urls', namespace="information")),
    path('api/fitelement/', include('workouts.urls')),
    path('api/group/', include('groups.urls')),
    path('api/notification/', include('notifications.urls')),
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root':settings.MEDIA_ROOT}),
]
