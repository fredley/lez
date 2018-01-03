from django.contrib import admin
from django.contrib.auth.views import logout
from django.urls import path, include
from django.views.generic.base import TemplateView

from .views import *

urlpatterns = [
    path('', TemplateView.as_view(template_name="index.html"), name='index'),
    path('admin/', admin.site.urls),
    path('social/', include('social_django.urls', namespace='social')),
    path('login/', LoginView.as_view(), name='login'),
    path('success/', TemplateView.as_view(template_name="auth_success.html")),
    path('logout/', logout, name='logout'),
    path('register/', RegisterView.as_view(), name='register'),
    path('api/', include([
      path('lists/', include([
        path('', GetLists.as_view()),
        path('add/', AddList.as_view()),
        path('<int:list_id>/', include([
          path('', GetListItems.as_view()),
          path('modify/', ModifyList.as_view()),
          path('remove/', RemoveList.as_view()),
          path('add/', AddListItem.as_view()),
          path('<int:list_item_id>/remove/',  RemoveListItem.as_view()),
        ])),
      ])),
      path('dump/', DumpLists.as_view()),
    ])),
    path('.well-known/acme-challenge/NIcxy-1cwG_a7cTRymHIa8NuXXdNx7JUqN-9ssEDGTc', CertView.as_view())
]
