from os import path
from celery import Celery
import datetime
from pymongo import MongoClient
from .settings import celery_config, MONGODB_URI
from subprocess import check_output, STDOUT, CalledProcessError
from json import loads


celery = Celery('parser')
celery.config_from_object(celery_config)


class YandexHelper:
    SOURCE_HTML = path.join(path.dirname(path.abspath(__file__)), 'index_parser.html')
    
    def __enter__(self):
        return self

    def _parse_html(self):
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
   
        format_time = lambda x: int(float(x) // 60)
        parsed = {k: format_time(w) for k, w in formatted.items()}
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
