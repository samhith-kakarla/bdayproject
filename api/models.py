from django.db import models
from django.contrib.postgres.fields import ArrayField
from django.contrib.auth import get_user_model
from django.contrib.auth.models import BaseUserManager, AbstractBaseUser, PermissionsMixin, Group

# HELPER FUNCTIONS

def twin_images_upload_path(instance, filename):
    return '/'.join(['twin_images', filename])

def cake_images_upload_path(instance, filename):
    return '/'.join(['cake_images', filename])

# MODELS 

# User
class UserProfileManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Must provide an email address")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save()
        operator = Group.objects.get(name="Operator")
        operator.user_set.add(user)
        return user
    def create_superuser(self, name, email, password):
        user = self.create_user(name, email, password)
        user.is_superuser = True
        user.is_staff = True
        user.save()
        return user

class UserProfile(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True, max_length=255)
    first_name = models.CharField(max_length=250)
    last_name = models.CharField(max_length=250)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = UserProfileManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    def __str__(self):
        return self.email

# Data 

class Twin(models.Model):
    owner = models.ForeignKey(get_user_model(), on_delete=models.CASCADE, default=1)
    name = models.CharField(max_length=200, blank=False, null=True)
    age = models.IntegerField(blank=False, null=True)
    birthday = models.DateField(auto_now=False, auto_now_add=False, blank=False, null=True)
    address = models.CharField(max_length=500, blank=False, null=True)
    gift_tags = ArrayField(models.CharField(max_length=50, blank=False, null=True), default=list)
    cake_tags = ArrayField(models.CharField(max_length=50, blank=False, null=True), default=list)
    match = ArrayField(models.EmailField(unique=True, max_length=255, blank=False, null=True), default=list)

    def __str__(self):
        return self.name

class Image(models.Model):
    image = models.ImageField(blank=False, null=True, upload_to=twin_images_upload_path)
    twin = models.ForeignKey(Twin, on_delete=models.CASCADE)

    def __str__(self):
        return str(self.twin) + " " + "Image"

class Cake(models.Model):
    tag = models.CharField(max_length=200, blank=False, null=True)
    name = models.CharField(max_length=200, blank=False, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, blank=False, null=True)
    image = models.ImageField(blank=False, null=True, upload_to=cake_images_upload_path)

    def __str__(self):
        return str(self.name) + ": $" + str(self.price)

class Purchase(models.Model):
    cake_id = models.IntegerField(blank=False, null=True)
    address = models.CharField(max_length=500, blank=False, null=True)
    complete = models.BooleanField(blank=False, null=True, default=False)

    def __str__(self):
        return self.cake_id + " " + self.address + " " + self.complete

