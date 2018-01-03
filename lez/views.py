import json

from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth import password_validation, authenticate, backends, login
from django.contrib.auth.models import User
from django.core.validators import EmailValidator
from django.http import JsonResponse, HttpResponse
from django.shortcuts import get_object_or_404
from django.views import View

from .models import List, ListItem

def get_lists(user):
  return list(List.objects.filter(user=user).values('title', 'modified', 'id'))

class GetLists(LoginRequiredMixin, View):

  http_method_names = ['get']

  def get(self, request, *args, **kwargs):
    return JsonResponse({
      'lists': get_lists(request.user)
    })


class AddList(LoginRequiredMixin, View):

  http_method_names = ['post']

  def post(self, request, *args, **kwargs):
    ls = List.objects.create(
      user=request.user,
      title=request.POST.get('title')
    )
    if request.POST.get('values'):
      for item in json.loads(request.POST.get('items')):
        ListItem.objects.create(
          list=ls,
          value=item
        )
    return JsonResponse({'success': True, 'id': ls.id})


class RemoveList(LoginRequiredMixin, View):

  http_method_names = ['post']

  def post(self, request, *args, **kwargs):
    list = get_object_or_404(List, pk=list_id, user=request.user)
    list.delete()
    return JsonResponse({'success': True})


class ModifyList(LoginRequiredMixin, View):

  http_method_names = ['post']

  def post(self, request, list_id, *args, **kwargs):
    print(list_id, request.user.email)
    list = get_object_or_404(List, pk=list_id, user=request.user)
    list.title = request.POST.get('title')
    list.save()
    return JsonResponse({'success': True})


class GetListItems(LoginRequiredMixin, View):

  http_method_names = ['get']

  def get(self, request, list_id, *args, **kwargs):
    ls = get_object_or_404(List, pk=list_id, user=request.user)
    return JsonResponse({
      'title': ls.title,
      'values': list(ListItem.objects.filter(list=ls).values('value', 'id'))
    })


class AddListItem(LoginRequiredMixin, View):

  http_method_names = ['post']

  def post(self, request, list_id, *args, **kwargs):
    ls = get_object_or_404(List, pk=list_id, user=request.user)
    item = ListItem.objects.create(
      list=ls,
      value=request.POST.get('value')
    )
    return JsonResponse({'success': True, 'id': item.id })


class RemoveListItem(LoginRequiredMixin, View):

  http_method_names = ['post']

  def post(self, request, list_item_id, *args, **kwargs):
    list_item = get_object_or_404(ListItem, pk=list_item_id, list__user=request.user)
    list_item.delete()
    return JsonResponse({'success': True})


class DumpLists(LoginRequiredMixin, View):

  http_method_names = ['get']

  def get(self, request, *args, **kwargs):
    response = {'lists': []}
    for ls in List.objects.filter(user=request.user):
      response['lists'].append({
        'title': ls.title,
        'items': list(ListItem.objects.filter(list=ls).values_list('value'))
      })
    return JsonResponse(response)


class RegisterView(View):

  http_method_names = ['post']

  def post(self, request, *args, **kwargs):
    email = request.POST.get('email')
    password = request.POST.get('password')
    response = {'success': True, 'errors': {
      'email': [],
      'password': [],
      'all': []
    }}

    if User.objects.filter(email=email).count() > 0:
      response['success'] = False
      response['errors']['email'].append('That email is already in use')

    try:
      EmailValidator()(email)
    except Exception as e:
      response['success'] = False
      response['errors']['email'].append('Please enter a valid email address')

    for validator in [
      password_validation.MinimumLengthValidator(min_length=8),
      password_validation.CommonPasswordValidator()
    ]:
      try:
        validator.validate(password)
      except Exception as e:
        response['success'] = False
        [response['errors']['password'].append(s) for s in e.messages]

    if response['success']:
      User.objects.create_user(username=email, email=email, password=password)
      user = authenticate(request, username=email, password=password)
      if user:
        login(request, user)
        response['lists'] = get_lists(user)
      else:
        response['success'] = False
        response['errors']['all'].append('Something strange went wrong.')

    return JsonResponse(response)


class LoginView(View):

  http_method_names = ['post']

  def post(self, request, *args, **kwargs):
    email = request.POST.get('email')
    password = request.POST.get('password')
    user = authenticate(request, username=email, password=password)
    if user and user.is_active:
      login(request, user)
      return JsonResponse({'success': True, 'lists': get_lists(user)})
    else:
      return JsonResponse({'success': False, 'errors': {'all': ['Invalid login.']}})

class CertView(View):

  def get(self, request, *args, **kwargs):
    return HttpResponse('NIcxy-1cwG_a7cTRymHIa8NuXXdNx7JUqN-9ssEDGTc.hOvDsUSfna6BRI3xzex5j1ryvvHXok6rdsdnBG7EOFE')
