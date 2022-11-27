from django.urls import path
from posts.views import post_home, post_detail, post_func, post_comment, post_main

app_name = "post"
urlpatterns = [
    path("", post_home, name="postHome"),
    path("<str:query_id>/", post_detail, name="postDetail"),
    path("<str:query_id>/comment/", post_comment, name="postComment"),
    path("<str:query_id>/func/", post_func, name="postFunc"),
    path("main/hot/", post_main, name="postMain")
]
