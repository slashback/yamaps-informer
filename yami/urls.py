from tornado import web
from yami.handlers import MainHandler, RouteHandler, RoutesListHandler, ChartListHandler
from yami import settings

url_handlers = [
    (r"/", MainHandler),
    (r"/route", RouteHandler),
    (r"/routes", RoutesListHandler),
    (r"/api/charts/(?P<days_ago>\w+)?", ChartListHandler),
    (r'/(.*)', web.StaticFileHandler, {'path': settings.TEMPLATES_PATH}),
]
