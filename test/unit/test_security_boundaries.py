"""Offline security regressions; test-only routing never enables private crawls."""
import contextlib
import http.server
import importlib.util
import io
import json
from pathlib import Path
import socket
import sys
import threading
import unittest
import urllib.error
import urllib.request
from unittest.mock import patch, MagicMock

ROOT = Path(__file__).resolve().parents[2]
CMS = ROOT / 'seo/seo-analysis/scripts'
sys.path.insert(0, str(CMS))

def load(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module

checker = load('security_checker', ROOT/'seo/broken-link-checker/scripts/checker.py')
calendar = load('security_calendar', ROOT/'scripts/notfair-content-calendar.py')
helpers = [load('security_'+p.stem, p) for p in [CMS/n for n in (
    'preflight_wordpress.py','fetch_wordpress_content.py','preflight_strapi.py',
    'fetch_strapi_content.py','push_strapi_seo.py')]]

class PublicTransport(unittest.TestCase):
    def test_private_aliases_and_nonpublic_addresses_never_connect(self):
        for url in ['http://127.0.0.1/', 'http://2130706433/', 'http://0x7f000001/',
                    'http://[::1]/', 'http://[::ffff:127.0.0.1]/',
                    'http://169.254.169.254/', 'http://100.64.0.1/', 'http://224.0.0.1/']:
            with self.subTest(url=url), patch.object(checker.socket,'socket') as sock:
                status, reason=checker.check_url(url)
                self.assertIsNone(status)
                self.assertIn('non-public',reason)
                sock.assert_not_called()

    def test_all_dns_answers_validated_and_actual_connect_pinned(self):
        public=(socket.AF_INET,socket.SOCK_STREAM,6,'',('93.184.216.34',80))
        private=(socket.AF_INET,socket.SOCK_STREAM,6,'',('127.0.0.1',80))
        with patch.object(checker.socket,'getaddrinfo',return_value=[public,private]), patch.object(checker.socket,'socket') as sock:
            with self.assertRaises(urllib.error.URLError): checker._public_connection(('example.com',80))
            sock.assert_not_called()
        with patch.object(checker.socket,'getaddrinfo',return_value=[public]) as dns, patch.object(checker.socket,'socket') as sock:
            checker._public_connection(('example.com',80),timeout=3)
            dns.assert_called_once()
            sock.return_value.connect.assert_called_once_with(('93.184.216.34',80))

    def test_scheme_credentials_and_proxy_cannot_bypass(self):
        for url in ['file:///etc/hosts','ftp://example.com/a','http://user:pass@example.com/','http://example.com:99999/']:
            with self.subTest(url=url), self.assertRaises(urllib.error.URLError): checker.public_urlopen(url)
        with patch.object(checker.urllib.request,'build_opener') as build:
            checker.public_urlopen('https://example.com/')
            self.assertEqual(build.call_args.args[0].proxies,{})
        redirect=checker._PublicRedirectHandler()
        with self.assertRaises(urllib.error.URLError):
            redirect.redirect_request(urllib.request.Request('http://example.com/'),None,302,'',{},'ftp://example.com/')

    def test_redirects_recheck_destination_and_preserve_public_fetch(self):
        seen=[]
        class Handler(http.server.BaseHTTPRequestHandler):
            def do_HEAD(self):
                seen.append(self.path)
                self.send_response(302 if self.path=='/redirect' else 200)
                if self.path=='/redirect': self.send_header('Location','http://127.0.0.1:'+str(self.server.server_port)+'/forbidden')
                self.end_headers()
            def log_message(self,*args): pass
        with http.server.ThreadingHTTPServer(('127.0.0.1',0),Handler) as server:
            thread=threading.Thread(target=server.serve_forever,daemon=True);thread.start()
            port=server.server_port; real_dns=socket.getaddrinfo; real_socket=socket.socket
            def dns(host,*args,**kwargs):
                if host=='example.test': return [(socket.AF_INET,socket.SOCK_STREAM,6,'',('93.184.216.34',port))]
                return real_dns(host,*args,**kwargs)
            class TestSocket(real_socket):
                def connect(self,address):
                    if address[0]=='93.184.216.34': address=('127.0.0.1',address[1])
                    return super().connect(address)
            try:
                with patch.object(checker.socket,'getaddrinfo',side_effect=dns), patch.object(checker.socket,'socket',TestSocket):
                    self.assertEqual(checker.check_url(f'http://example.test:{port}/ok'),(200,None))
                    self.assertIsNone(checker.check_url(f'http://example.test:{port}/redirect')[0])
                    with contextlib.redirect_stderr(io.StringIO()): checker.crawl(f'http://127.0.0.1:{port}/',max_pages=1)
                self.assertEqual(seen,['/ok','/redirect'])
            finally: server.shutdown();thread.join()

class CmsRedirects(unittest.TestCase):
    def test_every_cms_get_preserves_same_origin_and_rejects_other_origin(self):
        seen=[]; foreign=[]
        class Target(http.server.BaseHTTPRequestHandler):
            def do_GET(self):
                foreign.append(self.headers.get('Authorization'));self.send_response(200);self.end_headers();self.wfile.write(b'{}')
            def log_message(self,*args): pass
        class Cms(http.server.BaseHTTPRequestHandler):
            def do_GET(self):
                if self.path.split('?')[0]=='/ok':
                    seen.append(self.headers.get('Authorization'));self.send_response(200);self.send_header('X-WP-Total','3');self.send_header('X-WP-TotalPages','2');self.end_headers();self.wfile.write(b'{}')
                else:
                    self.send_response(int(self.path.split('?')[0].rsplit('/',1)[-1]));self.send_header('Location',('/ok' if self.path.startswith('/same') else f'http://127.0.0.1:{other.server_port}/'));self.end_headers()
            def log_message(self,*args): pass
        with http.server.ThreadingHTTPServer(('127.0.0.1',0),Target) as other, http.server.ThreadingHTTPServer(('127.0.0.1',0),Cms) as server:
            threads=[threading.Thread(target=s.serve_forever,daemon=True) for s in [other,server]]
            for thread in threads: thread.start()
            base=f'http://127.0.0.1:{server.server_port}'
            try:
                for helper in helpers:
                    fn=getattr(helper,'wp_get',None) or helper.strapi_get
                    codes=[301,302,303,307]+([308] if hasattr(urllib.request.HTTPRedirectHandler,'http_error_308') else [])
                    for code in codes:
                        with self.subTest(helper=helper.__name__,code=code):
                            result=fn(base,'fixture-token',f'/same/{code}',params={},retries=1)
                            if isinstance(result,tuple): self.assertEqual(result,({},3,2))
                            with self.assertRaises((urllib.error.HTTPError,SystemExit)): fn(base,'fixture-token',f'/other/{code}',params={},retries=1)
                self.assertEqual(len(seen),5*len(codes));self.assertTrue(all(seen));self.assertEqual(foreign,[])
            finally:
                for s in [other,server]:s.shutdown()
                for thread in threads:thread.join()

    def test_origin_normalization_scheme_changes_and_put_behavior(self):
        from _http import SameOriginAuthRedirectHandler
        handler=SameOriginAuthRedirectHandler();req=urllib.request.Request('https://example.com/a',headers={'aUThorization':'fixture-token'})
        same=handler.redirect_request(req,None,302,'',{},'https://EXAMPLE.com:443/b')
        self.assertEqual(same.get_header('Authorization'),'fixture-token')
        for url in ['http://example.com/a','https://other.example/a','https://example.com:444/a','https://example.com:0/a','https://user@example.com/a']:
            with self.assertRaises(urllib.error.HTTPError):handler.redirect_request(req,None,302,'',{},url)
        with self.assertRaises(urllib.error.HTTPError):handler.redirect_request(urllib.request.Request('https://example.com/a',data=b'{}',method='PUT'),None,302,'',{},'https://example.com/b')

class CalendarEscaping(unittest.TestCase):
    def test_both_metadata_fields_are_text_for_every_json_type(self):
        for key in ['horizonWeeks','lookbackDays']:
            for value in ['<script>alert(1)</script>',{'x':'<img src=x onerror=alert(1)>'},['<svg onload=alert(1)>']]:
                page=calendar.render_page({'_path':'fixture.json','topics':[],key:value})
                self.assertNotIn('<script>alert(1)</script>',page)
                self.assertNotIn('<img src=x onerror=alert(1)>',page)
                self.assertNotIn('<svg onload=alert(1)>',page)
                self.assertIn('&lt;',page)
        self.assertIn('90d lookback · 12w horizon',calendar.render_page({'_path':'fixture.json','topics':[],'lookbackDays':90,'horizonWeeks':12}))

if __name__=='__main__': unittest.main()
