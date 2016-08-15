from os import path
import datetime
from subprocess import check_output, STDOUT, CalledProcessError
from json import loads, dumps
from pymongo import MongoClient
from yami.settings import MONGODB_URI, STATIC_PARSER_PATH


class YandexHelper:
    SOURCE_HTML = path.join(STATIC_PARSER_PATH, 'index_parser.html')

    @staticmethod
    def _format_time(time_str):
        return int(float(time_str) // 60)

    def get_route_time(self, route):
        formatted = dict()
        route_json = dumps(route)
        grab_path = path.join(STATIC_PARSER_PATH, 'grab.js')
        print("Run phantomjs grab.js {} '{}'".format(self.SOURCE_HTML, route_json))
        for i in range(5):
            try:
                output = check_output(
                    ['phantomjs', grab_path, self.SOURCE_HTML, route_json],
                    stderr=STDOUT)
                formatted = loads(output.decode()[:-1])
                break
            except CalledProcessError as ex:
                print('Exception {}'.format(i))
                print(ex)

        parsed = self._format_time(formatted['time'])
        return parsed

    @staticmethod
    def _format_data(routes):
        timestamp = datetime.datetime.now()
        routes['timestamp'] = timestamp
        return routes

    @staticmethod
    def _save(item):
        client = MongoClient(MONGODB_URI)
        db = client.routes
        routes = db['routes']
        routes.insert(item)
        return item

    def get_routes(self):
        routes = dict()
        client = MongoClient(MONGODB_URI)
        db = client.routes
        route_items = db['routeItems']
        cursor = route_items.find()
        for route in cursor:
            print('Parsing {}'.format(route['name']))
            route_time = self.get_route_time(route['waypoints'])
            routes[route['name']] = route_time
        if not routes:
            print('No data')
            return False
        routes_res = self._format_data(routes)
        saved = self._save(routes_res)
        return saved
