# Generated by Django 4.1.3 on 2022-11-17 17:31

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('workouts', '0002_fitelementtype'),
    ]

    operations = [
        migrations.AlterField(
            model_name='fitelementtype',
            name='calories',
            field=models.IntegerField(null=True),
        ),
        migrations.AlterField(
            model_name='fitelementtype',
            name='korean_name',
            field=models.CharField(max_length=120, null=True),
        ),
        migrations.AlterField(
            model_name='fitelementtype',
            name='name',
            field=models.CharField(max_length=120, null=True),
        ),
    ]
