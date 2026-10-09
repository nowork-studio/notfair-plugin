"""Local CMS transport: authenticated redirects stay within the configured origin."""
import urllib.error
import urllib.parse
import urllib.request


def _origin(url):
    parsed = urllib.parse.urlsplit(url)
    if parsed.scheme.lower() not in ("http", "https") or not parsed.hostname or parsed.username is not None or parsed.password is not None:
        raise ValueError("invalid authenticated redirect destination")
    port = parsed.port if parsed.port is not None else (443 if parsed.scheme.lower() == "https" else 80)
    return parsed.scheme.lower(), parsed.hostname.lower(), port


class SameOriginAuthRedirectHandler(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        if any(k.lower() == "authorization" for k, _ in req.header_items()):
            try:
                same_origin = _origin(req.full_url) == _origin(newurl)
            except ValueError:
                same_origin = False
            if not same_origin:
                raise urllib.error.HTTPError(req.full_url, code, "refusing authenticated cross-origin redirect", headers, fp)
        return super().redirect_request(req, fp, code, msg, headers, newurl)


def authenticated_urlopen(request, timeout=15):
    return urllib.request.build_opener(SameOriginAuthRedirectHandler()).open(request, timeout=timeout)
