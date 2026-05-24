from django.contrib import admin
from .models import User, Wallet, Transaction, Notification

# Register your models here.
admin.site.register(User)
admin.site.register(Wallet)
admin.site.register(Transaction)
admin.site.register(Notification)
