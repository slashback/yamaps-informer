from os import path, environ
from celery import Celery
import json
import datetime
from pymongo import MongoClient
from celery.schedules import crontab


celery_config = dict(
    BROKER_URL = "mongodb://db:27017/celery_maps",
    CELERY_RESULT_BACKEND = "mongodb",
    CELERYBEAT_SCHEDULE = {
        'every-hour': {
            'task': 'parser.parse_routes',
            'schedule': crontab(minute='*/5', hour='3-19'),  # 6am-22pm MSK
        },
    },
)

celery = Celery('parser')
celery.config_from_object(celery_config)

MONGODB_URI = environ.get('DB_PORT_27017_TCP_ADDR', 'localhost')


class YandexHelper:
    SOURCE_HTML = path.join(path.dirname(path.abspath(__file__)), 'index_parser.html')
    
    def __enter__(self):
        return self

    def _parse_html(self):
        from subprocess import check_output, STDOUT, CalledProcessError
        from json import loads
        formatted = dict()
        print('Trying to parse...')
        print('Run phantomjs grab.js {}'.format(self.SOURCE_HTML))
        for i in range(5):
            try:
                result = check_output(['phantomjs', "grab.js", self.SOURCE_HTML], stderr=STDOUT)
                formatted = loads(result.decode()[:-1])
                break
            except CalledProcessError as ex:
                print('Exception {}'.format(i))
                print(ex)
   
        print(formatted)
        format_time = lambda x: int(float(x) // 60)
        parsed = { k: format_time(w) for k,w in formatted.items() }
        print(parsed)
        return parsed

    def _format_data(self, routes):
        timestamp = datetime.datetime.now()
        routes['timestamp'] = timestamp
        return routes

    def _save(self, item):
        client = MongoClient(MONGODB_URI)
        db = client.routes
        routes = db['routes']
        print(item)
        routes.insert(item)
        return item

    def get_routes(self):
        routes = self._parse_html()
        if not routes:
            print('No data')
            return False
        routes_res = self._format_data(routes)
        result = self._save(routes_res)
        return result

    def __exit__(self, exception_type, exception_value, traceback):
        pass


if __name__ == "__main__":
    with YandexHelper() as yah:
        result = yah.get_routes()
        print(result)


@celery.task
def parse_routes():
    with YandexHelper() as yah:
        result = yah.get_routes()
        print(result)
