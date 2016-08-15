from tornado import ioloop, web
from yami import settings
from yami.urls import url_handlers


if __name__ == "__main__":
    settings_app = dict(
        cookie_secret=settings.COOKIE_SECRET,
    )
    application = web.Application(url_handlers, **settings_app)
    application.listen(settings.HTTP_SERVER_PORT)
    ioloop.IOLoop.current().start()
