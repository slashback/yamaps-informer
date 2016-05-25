import tornado.ioloop
import tornado.web
import json
import os
import datetime
import time
from pymongo import MongoClient

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
        cursor = routes.find({'direction': 'msk'})
        for item in cursor:
            raw_data.append(item)
        data = dict(
            labels=[str(item['timestamp'].strftime('%H:%M')) for item in raw_data],
            bor=[item['bor'] for item in raw_data],
            you=[item['you'] for item in raw_data],
            per=[item['per'] for item in raw_data],

        )
        
        raw_home_data = []
        cursor_home = routes.find({'direction': 'home'})
        for item in cursor_home:
            raw_home_data.append(item)
        home_data = dict(
            labels=[str(item['timestamp'].strftime('%H:%M')) for item in raw_home_data],
            vol=[item['vol'] for item in raw_home_data],
        )

        res = json.dumps(dict(
            work=data,
            home=home_data,
        ))
        self.write(res)

if __name__ == "__main__":
    root = root = os.path.dirname(__file__)
    application = tornado.web.Application([
        (r"/api/", MainHandler),
        (r"/(.*)", tornado.web.StaticFileHandler, {"path": root, "default_filename": "index.html"}),
    ])
    application.listen(8085)
    tornado.ioloop.IOLoop.current().start()

