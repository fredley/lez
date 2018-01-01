from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.views import View

from .models import List, ListItem


class GetLists(LoginRequiredMixin, View):

  http_method_names = ['get']

  def get(self, request, *args, **kwargs):
    return JsonResponse({
      'lists': list(List.objects.filter(user=self.request.user).values('title', 'modified', 'id'))
    })


class GetListItems(LoginRequiredMixin, View):

  http_method_names = ['get']

  def get(self, request, list_id, *args, **kwargs):
    ls = get_object_or_404(List, pk=list_id, user=request.user)
    return JsonResponse({
      'values': list(ListItem.objects.filter(list=ls).values_list('value', 'id'))
    })


class AddListItem(LoginRequiredMixin, View):

  http_method_names = ['post']

  def post(self, request, list_id, *args, **kwargs):
    ls = get_object_or_404(List, pk=list_id, user=request.user)
    ListItem.objects.create(
      list=ls,
      value=kwargs['value']
    )
    return JsonResponse({'success': True})


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
