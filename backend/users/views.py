import os
import json
import bcrypt
import jwt
from django.views.decorators.http import require_http_methods
from django.http import HttpResponse, HttpResponseBadRequest, JsonResponse
from django.core.exceptions import PermissionDenied
from jwt.exceptions import ExpiredSignatureError
from .models import User

@require_http_methods(["POST"])
def signup(request):
    """
    회원가입
    """
    try:
        data = json.loads(request.body.decode())

        if (User.objects.filter(username=data['username'])).exists():
            return JsonResponse({"message": "이미 있는 유저네임입니다."}, status=409)
        if (User.objects.filter(nickname=data['nickname'])).exists():
            return JsonResponse({"message": "이미 있는 닉네임입니다."}, status=409)

        hashed_password = bcrypt.hashpw(data['password'].encode('utf-8'),
                                        bcrypt.gensalt()).decode('utf-8')
        User(
            username=data['username'],
            hashed_password=hashed_password,
            nickname=data['nickname'],
            gender=data['gender'],
            age=data['age'],
            height=data['height'],
            weight=data['weight'],
            image="profile_default.png",
            exp=0,
            level=1,
        ).save()

        token = jwt.encode({'username': data['username']},
                           os.environ.get("JWT_SECRET"),
                           os.environ.get("ALGORITHM"))
        response = JsonResponse({"username": data['username'],
                                 "nickname": data['nickname'],
                                 "image": 'profile_default.png'},
                                status=200)
        response.set_cookie('access_token',
                            token,
                            max_age=60 * 60 * 24 * 7,
                            samesite='None',
                            secure=True,
                            httponly=True)
        return response

    except (KeyError, json.JSONDecodeError):
        return HttpResponseBadRequest()

@require_http_methods(["POST"])
def login(request):
    """
    로그인
    """
    try:
        data = json.loads(request.body.decode())

        if data['username'] == "":
            return JsonResponse({"message": "유저네임을 입력하세요."}, status=400)
        if data['password'] == "":
            return JsonResponse({"message": "비밀번호를 입력하세요."}, status=400)
        if not (User.objects.filter(username=data['username'])).exists():
            return JsonResponse({"message": "존재하지 않는 ID입니다."}, status=401)

        user = User.objects.get(username=data['username'])
        if bcrypt.checkpw(data['password'].encode('utf-8'), user.hashed_password.encode('utf-8')):
            token = jwt.encode({'username': data['username']},
                               os.environ.get("JWT_SECRET"),
                               os.environ.get("ALGORITHM"))
            response = JsonResponse({"username": user.username,
                                     "nickname": user.nickname,
                                     "image": user.image},
                                    status=200)
            response.set_cookie('access_token',
                                token,
                                max_age=60 * 60 * 24 * 7,
                                samesite='None',
                                secure=True,
                                httponly=True)
            return response
        else:
            return JsonResponse({"message": "비밀번호가 틀렸습니다."}, status=401)

    except (KeyError, json.JSONDecodeError):
        return HttpResponseBadRequest()

@require_http_methods(["GET"])
def check(request):
    """
    자동 로그인을 위한 토큰 확인
    """
    try:
        access_token = request.COOKIES.get("access_token", None)
        if not access_token:
            raise PermissionDenied()

        payload = jwt.decode(
            access_token,
            os.environ.get("JWT_SECRET"),
            os.environ.get("ALGORITHM")
        )

        username = payload.get("username", None)
        if not username:
            raise PermissionDenied()

        User.objects.get(username=username)
        return HttpResponse(status=200)

    except (PermissionDenied, User.DoesNotExist):
        return JsonResponse({"message": "토큰이 올바르지 않습니다."}, status=401)

    except ExpiredSignatureError:
        return JsonResponse({"message": "토큰이 만료되었습니다."}, status=403)
