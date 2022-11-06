from django.urls import path
from . import views

urlpatterns = [
    path('', views.general_group, name = "groups"),
    path('<int:group_id>/', views.group_detail, name = "group"),
    path('<int:group_id>/member/', views.group_member, name = "group_member")
]
