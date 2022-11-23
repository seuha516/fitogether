from django.contrib import admin
from comments import admin as comment_admin
from posts.models import Post, PostImage


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    """Post admin definition"""

    list_display = (
        "pk",
        "author",
        "title",
        "created",
        "get_eff_like",
        "get_like_num",
        "get_dislike_num",
        "get_scrap_num",
    )

    inlines = (comment_admin.CommentInlineAdmin,)
    list_filter = admin.ModelAdmin.list_filter + ("author", "created")


@admin.register(PostImage)
class PostImageAdmin(admin.ModelAdmin):
    """Post Image admin definition"""

    list_display = ("pk", "image", "post")
