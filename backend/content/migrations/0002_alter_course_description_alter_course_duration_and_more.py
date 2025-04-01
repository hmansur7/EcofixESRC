# Generated by Django 5.1.3 on 2025-01-14 00:17

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('content', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='course',
            name='description',
            field=models.CharField(max_length=250),
        ),
        migrations.AlterField(
            model_name='course',
            name='duration',
            field=models.CharField(max_length=7),
        ),
        migrations.AlterField(
            model_name='course',
            name='level',
            field=models.CharField(choices=[('Beginner', 'Beginner'), ('Intermediate', 'Intermediate'), ('Advanced', 'Advanced')], default='Beginner', max_length=12),
        ),
        migrations.AlterField(
            model_name='course',
            name='prerequisites',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
        migrations.AlterField(
            model_name='course',
            name='title',
            field=models.CharField(db_index=True, max_length=35, unique=True),
        ),
        migrations.AlterField(
            model_name='lesson',
            name='title',
            field=models.CharField(max_length=255, unique=True),
        ),
    ]
