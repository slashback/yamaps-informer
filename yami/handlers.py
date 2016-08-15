# pylint: disable=abstract-method
from collections import defaultdict
import json
import datetime
from os import path
from pymongo import MongoClient
from tornado import web
from yami.settings import TEMPLATES_PATH, MONGODB_URI


class RouteHandler(web.RequestHandler):
    def post(self):
        print('OK')
        route_data = json.loads(self.get_argument('routeData'))
        client = MongoClient(MONGODB_URI)
        db = client.routes
        routes = db['routeItems']

        routes.insert(route_data)
        print(route_data)


class MainHandler(web.RequestHandler):
    def get(self):
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
        self.render(path.join(TEMPLATES_PATH, "index.html"), data=res)
