from django.shortcuts import redirect
from django.conf import settings
from django.core.exceptions import MiddlewareNotUsed

class ForceSecureMiddleware:
  """Middleware that redirects http to https traffic."""

  def __init__(self, get_response):
    if settings.DEBUG:
      raise MiddlewareNotUsed
    self.get_response = get_response

  def __call__(self, request):
    if not request.is_secure():
      return redirect("https://" + request.get_host() + request.get_full_path())
    return self.get_response(request)
