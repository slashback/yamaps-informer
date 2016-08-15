from os import path
import datetime
from subprocess import check_output, STDOUT, CalledProcessError
from json import loads, dumps
from yami import settings
from yami.store import RouteStore, DurationsStore
from yami.models import Duration


class YandexHelper:

    @staticmethod
    def _format_time(time_str):
        return int(float(time_str) // 60)

    def get_duration_by_route(self, route):
        formatted = dict()
        base_dir = settings.STATIC_PARSER_PATH
        grab_path = path.join(base_dir, 'grab.js')
        client_html_path = path.join(base_dir, 'index_parser.html')
        route_json = dumps(route)
        print("Run phantomjs grab.js {} '{}'".format(client_html_path, route_json))
        for i in range(5):
            try:
                output = check_output(
                    ['phantomjs', grab_path, client_html_path, route_json],
                    stderr=STDOUT
                )
                formatted = loads(output.decode()[:-1])
                break
            except CalledProcessError as ex:
                print('Exception {}'.format(i))
                print(ex)

        parsed = self._format_time(formatted['time'])
        return parsed

    def get_routes_durations(self):
        result = []
        r_store = RouteStore()
        routes_list = r_store.get_all()
        timestamp = datetime.datetime.now()

        for route in routes_list:
            print('Parsing {}'.format(route['name']))
            duration = self.get_duration_by_route(route['waypoints'])
            if not duration:
                print('No data')
                continue
            item = Duration(
                timestamp=timestamp,
                route_id=route['_id'],
                duration=duration,
            )
            d_store = DurationsStore()
            d_store.add(item)
            result.append(item)

        return result
