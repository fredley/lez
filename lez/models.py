from django.contrib.auth.models import User
from django.db import models


class List(models.Model):
  user = models.ForeignKey(User, on_delete=models.CASCADE)
  title = models.CharField(max_length=150)

  modified = models.DateTimeField(auto_now=True)
  created = models.DateTimeField(auto_now_add=True)


class ListItem(models.Model):
  list = models.ForeignKey(List, on_delete=models.CASCADE)
  value = models.CharField(max_length=150)

  modified = models.DateTimeField(auto_now=True)
  created = models.DateTimeField(auto_now_add=True)
