# Generated manually: create PostgreSQL schema for inventory app tables

from django.db import migrations


class Migration(migrations.Migration):

    initial = True
    dependencies = []

    operations = [
        migrations.RunSQL(
            sql='CREATE SCHEMA IF NOT EXISTS inventory;',
            reverse_sql='DROP SCHEMA IF EXISTS inventory CASCADE;',
        ),
    ]
