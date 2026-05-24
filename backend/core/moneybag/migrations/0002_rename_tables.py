from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('moneybag', '0001_initial'),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
                ALTER TABLE IF EXISTS core_user RENAME TO moneybag_user;
                ALTER TABLE IF EXISTS core_user_groups RENAME TO moneybag_user_groups;
                ALTER TABLE IF EXISTS core_user_user_permissions RENAME TO moneybag_user_user_permissions;
                ALTER TABLE IF EXISTS core_wallet RENAME TO moneybag_wallet;
                ALTER TABLE IF EXISTS core_transaction RENAME TO moneybag_transaction;
                ALTER TABLE IF EXISTS core_notification RENAME TO moneybag_notification;
            """,
            reverse_sql="""
                ALTER TABLE IF EXISTS moneybag_user RENAME TO core_user;
                ALTER TABLE IF EXISTS moneybag_user_groups RENAME TO core_user_groups;
                ALTER TABLE IF EXISTS moneybag_user_user_permissions RENAME TO core_user_user_permissions;
                ALTER TABLE IF EXISTS moneybag_wallet RENAME TO core_wallet;
                ALTER TABLE IF EXISTS moneybag_transaction RENAME TO core_transaction;
                ALTER TABLE IF EXISTS moneybag_notification RENAME TO core_notification;
            """,
        ),
    ]
