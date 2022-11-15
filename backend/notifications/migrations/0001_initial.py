# Generated by Django 4.1.3 on 2022-11-14 23:43

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('users', '0003_user_updated_alter_user_created'),
    ]

    operations = [
        migrations.CreateModel(
            name='Notification',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
                ('category', models.CharField(max_length=255)),
                ('content', models.CharField(max_length=255)),
                ('image', models.CharField(max_length=255)),
                ('link', models.CharField(max_length=255)),
                ('username', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='users.user')),
            ],
            options={
                'abstract': False,
            },
        ),
    ]
