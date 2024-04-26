from django.db import models
from django.contrib.auth.models import AbstractUser, Group, Permission

class User(AbstractUser):
    intra_id = models.IntegerField(null=True) 
    username = models.CharField(max_length=50, unique=True)
    email = models.TextField(unique=True)
    password = models.CharField(max_length=128)
    avatar = models.ImageField(upload_to='Client/static/Client/Assets/avatar', default="/static/Client/Assets/KippyLabImage.png")
    avatar_intra = models.TextField(default="")
    friends = models.ManyToManyField('self', related_name="friends", blank=True)
    is_active = models.BooleanField(default=False)
    otp_enabled = models.BooleanField(default=False)
    otp_verified = models.BooleanField(default=False)
    otp_base32 = models.CharField(max_length=255, null=True)
    otp_auth_url = models.CharField(max_length=255, null=True)

    REQUIRED_FIELDS = ['password']
    
    groups = models.ManyToManyField(
        Group,
        related_name='%(app_label)s_%(class)s_related',
    )

    user_permissions = models.ManyToManyField(
        Permission,
        related_name='%(app_label)s_%(class)s_related',
    )
    
    class Match(models.Model):
        user = models.ForeignKey('User', on_delete=models.CASCADE, related_name='matches')
        opponent = models.CharField(max_length=100)
        result = models.CharField(max_length=50)
        date = models.DateTimeField(auto_now_add=True)

        class Meta:
            ordering = ['-date']