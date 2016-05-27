import tornado.ioloop
import tornado.web
from collections import defaultdict
import json
import os
import datetime
import time
from pymongo import MongoClient


def json_serial(obj):
    """JSON serializer for objects not serializable by default json code"""

    if isinstance(obj, datetime.datetime):
        serial = obj.isoformat()
        return serial
    raise TypeError ("Type not serializable")


class MainHandler(tornado.web.RequestHandler):
    def get(self):
        raw_data = [
            {
                'time': datetime.datetime.now(),
                'bor': '15',
                'you': '20',
                'per': '47',
                'nah': 'moskau',
            },
            {
                'time': datetime.datetime.now(),
                'bor': '17',
                'you': '22',
                'per': '50',
                'nah': 'moskau',
            },
            {
                'time': datetime.datetime.now(),
                'bor': '20',
                'you': '35',
                'per': '52',
                'nah': 'moskau',
            },
        ]

        raw_data = []
        client = MongoClient()
        db = client.routes
        routes = db['routes']
        cursor = routes.find({}, {'_id': 0})
        data = defaultdict(list)
        labels = []
        for item in cursor:

            print(item)
            for key, value in item.items():
                print('___{} {}'.format(key,value))
                if key == "timestamp":
                    formatted = str(value.strftime('%H:%M'))
                    labels.append(formatted)
                else:
                    data[key].append(value)
            raw_data.append(item)
        print(data)

        print('-------')
        datasets = []
        for key, value in filter((lambda k: k != 'labels'), data.items()):
            datasets.append(
                dict(
                    name=key,
                    values=value,
                )
            )
        # data = dict(
        #     labels=[str(item['timestamp'].strftime('%H:%M')) for item in raw_data],
        #     bor=[item['bor'] for item in raw_data],
        #     you=[item['you'] for item in raw_data],
        #     per=[item['per'] for item in raw_data],
        #
        # )

        raw_home_data = []

        res = json.dumps(
            dict(
                labels=labels,
                data=datasets
            )
        )
        print(res)
        self.write(res)

if __name__ == "__main__":
    root = root = os.path.dirname(__file__)
    application = tornado.web.Application([
        (r"/api/", MainHandler),
        (r"/(.*)", tornado.web.StaticFileHandler, {"path": root, "default_filename": "index.html"}),
    ])
    application.listen(8085)
    tornado.ioloop.IOLoop.current().start()
