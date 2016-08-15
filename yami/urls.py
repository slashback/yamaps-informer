from tornado import web
from yami.handlers import MainHandler, RouteHandler
from yami.settings import TEMPLATES_PATH

url_handlers = [
        (r"/", MainHandler),
        (r"/route", RouteHandler),
        (r'/(.*)', web.StaticFileHandler, {'path': TEMPLATES_PATH}),
    ]
