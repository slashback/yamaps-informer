from tornado import ioloop, web
from yami.settings import HTTP_SERVER_PORT
from yami.urls import url_handlers


if __name__ == "__main__":
    application = web.Application(url_handlers)
    application.listen(HTTP_SERVER_PORT)
    ioloop.IOLoop.current().start()
