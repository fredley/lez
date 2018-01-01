from django.contrib import admin
from django.contrib.auth.views import logout
from django.urls import path, include
from django.views.generic.base import TemplateView

from .views import GetLists, GetListItems, AddListItem, RemoveListItem, DumpLists

urlpatterns = [
    path('', TemplateView.as_view(template_name="index.html"), name='index'),
    path('admin/', admin.site.urls),
    path('', include('social_django.urls', namespace='social')),
    path('logout/', logout, name='logout'),
    path('api/', include([
      path('lists/', include([
        path('', GetLists.as_view()),
        path('<int:list_id>/', include([
          path('', GetListItems.as_view()),
          path('add/', AddListItem.as_view()),
          path('remove/', RemoveListItem.as_view()),
        ])),
      ])),
      path('dump/', DumpLists.as_view()),
    ]))
]
