# Generated by Django 4.1.3 on 2022-11-24 21:17

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("tags", "0002_tag_tag_type"),
        ("workouts", "0001_initial"),
    ]

    operations = [
        migrations.DeleteModel(
            name="FitElementType",
        ),
        migrations.RemoveField(
            model_name="fitelement",
            name="category",
        ),
        migrations.AlterField(
            model_name="fitelement",
            name="workout_type",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="fit_element",
                to="tags.tag",
            ),
        ),
    ]