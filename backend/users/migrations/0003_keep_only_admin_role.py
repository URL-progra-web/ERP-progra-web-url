from django.db import migrations


def keep_only_admin_role(apps, schema_editor):
    Role = apps.get_model('users', 'Role')
    User = apps.get_model('users', 'User')

    admin_role, _ = Role.objects.get_or_create(
        name='ADMIN',
        defaults={'description': 'Administrator with full access'},
    )

    User.objects.exclude(role_id=admin_role.id).update(role_id=admin_role.id)
    Role.objects.exclude(id=admin_role.id).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0002_user_is_active'),
    ]

    operations = [
        migrations.RunPython(keep_only_admin_role, migrations.RunPython.noop),
    ]
