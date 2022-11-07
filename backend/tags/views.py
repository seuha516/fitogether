import json
from django.http import (
    HttpResponseBadRequest,
    JsonResponse,
)
from django.views.decorators.http import require_http_methods
from tags.models import Tag, TagClass


@require_http_methods(["GET", "POST"])
def tag_home(request):
    """
    GET : Get tag lists.
    POST : Create tag.
    """
    if request.method == "GET":
        tag_classes = TagClass.objects.all()
        tag_classes_serializable = list(tag_classes.values())

        for index, _ in enumerate(tag_classes_serializable):
            tag_classes_serializable[index]["tags"] = list(tag_classes[index].tags.values())
        response = JsonResponse(
            {
                "tags": tag_classes_serializable,
            },
            status=200,
        )
        return response
    else:  # POST
        try:
            data = json.loads(request.body.decode())

            tag_name = data["name"]
            class_id = data["classId"]
            parent_class = TagClass.objects.get(pk=class_id)
            created_tag = Tag.objects.create(tag_name=tag_name, tag_class=parent_class)
            return JsonResponse({
                "tags": {
                    "id" : created_tag.pk,
                    "name" : tag_name,
                    "color" : parent_class.color
                },
            }, status=201)
        except (KeyError, json.JSONDecodeError, TagClass.DoesNotExist):
            return HttpResponseBadRequest()


@require_http_methods(["POST"])
def tag_class(request):
    """
    POST : Create tag class.
    """
    try:
        data = json.loads(request.body.decode())

        class_name = data["name"]
        class_color = data["color"]
        TagClass.objects.create(class_name=class_name, color=class_color)
        return JsonResponse({"message": "Success!"}, status=201)
    except (KeyError, json.JSONDecodeError):
        return HttpResponseBadRequest()


@require_http_methods(["GET"])
def tag_search(request):
    """
    GET : Get searched tag lists.
    """
    query_args = {}
    query_args["class_name"] = request.GET.get("class", None)
    query_args["tag_name"] = request.GET.get("tag", None)

    tags = Tag.objects.all()

    if query_args["class_name"] or query_args["tag_name"]:
        # This is for searching tags.
        filter_args = {}
        filter_args["tag_name__icontains"] = query_args["tag_name"]
        filtered_tags = tags.filter(**filter_args)

        tags_serializable = list(
            filtered_tags.values()
        )  # id, created, updated, tag_name, tag_class_id
        for index, item in enumerate(tags_serializable):
            belong_class = TagClass.objects.get(pk=item["tag_class_id"])
            tags_serializable[index]["name"] = item["tag_name"]
            tags_serializable[index]["color"] = belong_class.color

            del tags_serializable[index]["tag_name"]
            del tags_serializable[index]["tag_class_id"]
        response = JsonResponse(
            {
                "tags": tags_serializable,
            },
            status=200,
        )
        return response
    else:
        return HttpResponseBadRequest()