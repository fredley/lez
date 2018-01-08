import uuid

from django.contrib.auth.models import User
from django.db import models


def get_token():
  return str(uuid.uuid4()).replace('-', '')


class AuthToken(models.Model):
  user = models.ForeignKey(User, on_delete=models.CASCADE)
  token = models.CharField(max_length=32, default=get_token)


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
