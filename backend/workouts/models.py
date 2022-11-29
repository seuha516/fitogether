from django.db import models
from users.models import User
from tags.models import Tag
from django.contrib.postgres.fields import ArrayField


class FitElement(models.Model):
    """fit element definition"""

    TYPE_CHOICE = (('goal', 'goal'), ('log', 'log'))

    # Tag has all information about workout: name, calories, category
    workout_type = models.ForeignKey(Tag, on_delete=models.CASCADE, related_name="fit_element")

    type = models.CharField(max_length=4, choices=TYPE_CHOICE, null=False)  # goal / log

    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='fit_element')
    period = models.IntegerField(null=True)
    weight = models.IntegerField(null=True)
    rep = models.IntegerField(null=True)
    set = models.IntegerField(null=True)
    time = models.IntegerField(null=True)
    date = models.DateField(null=True)


class DailyLog(models.Model):
    """daily log definition"""

    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='daily_log')
    date = models.DateField(null=False)
    memo = models.TextField(null=True)
    fit_element = models.ManyToManyField(FitElement, blank=True)
    calories = models.FloatField(default=0, null=True)
    log_index = models.TextField(null=True)


class DailyLogImage(models.Model):
    """Daily Log Image definition"""
    image = models.CharField(max_length=255, null=False)
    daily_log = models.ForeignKey(DailyLog, related_name="images", on_delete=models.CASCADE)


class Routine(models.Model):
    """routine definition"""

    name = models.CharField(max_length=30, null=False)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='routine')
    fit_element = models.ManyToManyField(FitElement, blank=True)
    calories = models.IntegerField(null=True)
