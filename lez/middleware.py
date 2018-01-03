from django.shortcuts import redirect
from django.conf import settings
from django.core.exceptions import MiddlewareNotUsed

class ForceSecureMiddleware(object):
  """Middleware that redirects http to https traffic."""

  def process_request(self, request):
    if settings.DEBUG:
        return
    if not request.is_secure():
      return redirect("https://" + request.get_host() + request.get_full_path())
