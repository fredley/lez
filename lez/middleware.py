from django.shortcuts import redirect
from django.core.exceptions import MiddlewareNotUsed

class ForceSecureMiddleware(object):
  """Middleware that redirects http to https traffic."""

  def __init__(self):
    if settings.DEBUG:
      raise MiddlewareNotUsed

  def process_request(self, request):
    if not request.is_secure():
      return redirect("https://" + request.get_host() + request.get_full_path())
