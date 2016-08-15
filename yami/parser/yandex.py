from os import path
import datetime
from subprocess import check_output, STDOUT, CalledProcessError
from json import loads, dumps
from pymongo import MongoClient
from yami import settings
from yami.store import RouteStore


class YandexHelper:

    @staticmethod
    def _format_time(time_str):
        return int(float(time_str) // 60)

    def get_route_time(self, route):
        formatted = dict()
        route_json = dumps(route)
        client_html_path = path.join(settings.STATIC_PARSER_PATH, 'index_parser.html')
        grab_path = path.join(settings.STATIC_PARSER_PATH, 'grab.js')
        print("Run phantomjs grab.js {} '{}'".format(client_html_path, route_json))
        for i in range(5):
            try:
                output = check_output(
                    ['phantomjs', grab_path, client_html_path, route_json],
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
        client = MongoClient(settings.MONGODB_URI)
        db = client.routes
        routes = db['routes']
        routes.insert(item)
        return item

    def get_routes(self):
        routes = dict()
        store = RouteStore()
        routes_list = store.get_all()
        for route in routes_list:
            print('Parsing {}'.format(route['name']))
            route_time = self.get_route_time(route['waypoints'])
            routes[route['name']] = route_time
        if not routes:
            print('No data')
            return False
        routes_res = self._format_data(routes)
        saved = self._save(routes_res)
        return saved
