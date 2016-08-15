from tornado import web
from yami.handlers import MainHandler, RouteHandler, RoutesListHandler
from yami import settings

url_handlers = [
    (r"/", MainHandler),
    (r"/route", RouteHandler),
    (r"/routes", RoutesListHandler),
    (r'/(.*)', web.StaticFileHandler, {'path': settings.TEMPLATES_PATH}),
]
