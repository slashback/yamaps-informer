from os import path, environ
from celery import Celery
import json
import datetime
from pymongo import MongoClient
from pyvirtualdisplay import Display
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC



from celery.schedules import crontab

celery_config = dict(
    BROKER_URL = 'amqp://{user}:{password}@{hostname}/{vhost}/'.format(
        user='guest',
        password='guest',
        hostname=environ.get('AMQP_1_PORT_4369_TCP_ADDR', 'localhost'),
        vhost=environ.get('RABBIT_ENV_VHOST', '')),
    CELERY_RESULT_BACKEND = "amqp",
    CELERYBEAT_SCHEDULE = {
        'every-hour': {
            'task': 'parse.parse_routes',
            'schedule': crontab(minute='*', hour='*'),  # TODO: every hour
        },
    },
)

celery = Celery('parse')
celery.config_from_object(celery_config)

MONGODB_URI = environ.get('DB_PORT_27017_TCP_ADDR', 'localhost')


class YandexHelper:
    SOURCE_HTML = 'file://{}'.format(
        path.join(path.dirname(path.abspath(__file__)), 'index_parser.html')
    )

    def __init__(self):
        pass
        #self.display = Display(visible=0, size=(800, 600))
        #self.display.start()
        #print(self.display)
        #self.browser = webdriver.Firefox()
        #self.browser.get(self.SOURCE_HTML)
        # print(self.browser.page_source)

    def __enter__(self):
        return self

    def _parse_html(self):
        from subprocess import check_output, STDOUT
        from json import loads
        result = check_output(["/opt/projects/yamaps-informer/src/node_modules/phantomjs/bin/phantomjs", "test1.js"], stderr=STDOUT)
        formatted = loads(result.decode()[:-1])
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
        #try:
        #    vol = WebDriverWait(self.browser, 20).until(EC.presence_of_element_located((By.ID, "results")))
        #finally:
        routes = self._parse_html()
        if not routes:
            print('No data')
            return False
        routes_res = self._format_data(routes)
        result = self._save(routes_res)
        return result

    def __exit__(self, exception_type, exception_value, traceback):
        pass 
        #self.browser.quit()
        #self.display.stop()


if __name__ == "__main__":
    with YandexHelper() as yah:
        result = yah.get_routes()
        print(result)


@celery.task
def parse_routes():
    with YandexHelper() as yah:
        result = yah.get_routes()
        print(result)
