import tornado.ioloop
import tornado.web
from collections import defaultdict
import json
import os
import datetime
import time
from pymongo import MongoClient

MONGODB_URI = os.environ.get('DB_PORT_27017_TCP_ADDR', 'localhost')


def json_serial(obj):
    """JSON serializer for objects not serializable by default json code"""

    if isinstance(obj, datetime.datetime):
        serial = obj.isoformat()
        return serial
    raise TypeError("Type not serializable")


class StaticHandler(tornado.web.RequestHandler):
    def get(self):
        self.render("index_parser.html", data={})

class RouteHandler(tornado.web.RequestHandler):
    def post(self):
        print('OK')
        routeData = json.loads(self.get_argument('routeData'))
        client = MongoClient(MONGODB_URI)
        db = client.routes
        routes = db['routeItems']


        routes.insert(routeData)
        print(routeData)


class MainHandler(tornado.web.RequestHandler):
    def get(self):
        raw_data = []
        client = MongoClient(MONGODB_URI)
        db = client.routes
        routes = db['routes']
        from_midnight = datetime.datetime.combine(datetime.datetime.now().date(), datetime.time(0))
        cursor = routes.find({'timestamp': {'$gt': from_midnight}}, {'_id': 0})
        data = defaultdict(list)
        labels = []
        for item in cursor:
            print(item)
            for key, value in item.items():
                if key == "timestamp":
                    formatted = str(value.strftime('%H:%M'))
                    labels.append(formatted)
                else:
                    data[key].append(value)

        datasets = []
        for key, value in filter((lambda k: k != 'labels'), data.items()):
            datasets.append(
                dict(
                    name=key,
                    values=value,
                )
            )

        res = json.dumps(
            dict(
                labels=labels,
                data=datasets
            )
        )
        print(res)
        self.render("static/templates/index.html", data=res)

if __name__ == "__main__":
    application = tornado.web.Application([
        (r"/", MainHandler),
        (r"/route", RouteHandler),
        # (r"/routes", RoutesListHandler),
        (r'/(.*)', tornado.web.StaticFileHandler, {'path': '/opt/projects/yamaps-informer/src/static/templates'}),
    ])
    application.listen(8085)
    tornado.ioloop.IOLoop.current().start()
