from django.urls import path
from . import views

app_name = "post"
urlpatterns = [
    path("", views.post_home, name="postHome"),
    path("<str:query_id>/", views.post_detail, name="postDetail"),
    path("<str:query_id>/func/", views.post_func, name="postFunc"),
    path("<str:query_id>/comment/", views.post_comment, name="postComment"),
]
