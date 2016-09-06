# pylint: disable=abstract-method
import json
import datetime
from os import path
from tornado import web
from yami.models import Route, Chart
from yami.store import RouteStore, DurationsStore, ChartStore
from yami import settings
from yami.utils import basic_auth

HTTP_BAD_REQUEST_CODE = 400


def check_credentials(user, pwd):
    return user == settings.AUTH_MASTER_USER and \
           pwd == settings.AUTH_MASTER_PASS


class BaseHandler(web.RequestHandler):
    def get_current_user(self):
        return self.get_secure_cookie("user")


@basic_auth(check_credentials)
class RouteHandler(BaseHandler):
    def post(self):
        route_data = json.loads(self.get_argument('routeData'))
        name = route_data.get('name', '')
        description = route_data.get('description', '')
        waypoints = route_data.get('waypoints', [])
        if (
            name == '' or
            waypoints == []
        ):
            self.set_status(HTTP_BAD_REQUEST_CODE)
            self.finish("You should specify route and its name")

        print(route_data)
        route = Route(name=name, description=description, waypoints=waypoints)
        store = RouteStore()
        _id = store.add(route)
        print(_id)


@basic_auth(check_credentials)
class RoutesListHandler(BaseHandler):
    def get(self):
        store = RouteStore()
        routes_list = store.get_all()
        self.write(
            {'routes': routes_list}
        )


class ChartListHandler(BaseHandler):
    @staticmethod
    def exists(r_list, route_name, timestamp):
        for item in r_list:
            if item.route['name'] == route_name and item.timestamp == timestamp:
                return item.duration
        return None

    def get(self):
        store = ChartStore()
        chart_list = store.get_all()
        # self.write(
        #     {'routes': chart_list}
        # )
        # for chart in chart_list:
        #     print(chart)

        from_midnight = datetime.datetime.combine(
            datetime.datetime.now().date(),
            datetime.time(0)
        )
        store = DurationsStore()
        durations1 = store.get_by_date(date_from=from_midnight)
        for d in durations1:
            print('__{}'.format(d))

        chart_result = []
        for chart in chart_list:
            durations = list()
            for d in durations1:
                if d.route_id in chart['routes']:
                    durations.append(d)
                    # print('CHART {}, ROU {}'.format(chart['name'], d.route_id))

            labels = list(set([d.timestamp for d in durations]))
            labels.sort()
            result = dict(
                labels=[],
                data=[],
                name=chart['name'],
            )
            result['labels'] = labels

            print(labels)
            routes = list(set([d.route['name'] for d in durations]))
            print(routes)
            for route in routes:
                route_data = dict(
                    values=[],
                    name=route
                )
                for label in labels:
                    dur = self.exists(durations, route, label)
                    route_data['values'].append(dur)
                result['data'].append(route_data)
            result['labels'] = [str(l.strftime('%H:%M')) for l in result['labels']]
            print(result)
            chart_result.append(result)
            print('------------------------------------------------------------')
        self.write(
            {'chart_list': chart_result}
        )


class MainHandler(BaseHandler):
    @staticmethod
    def exists(r_list, route_name, timestamp):
        for item in r_list:
            if item.route['name'] == route_name and item.timestamp == timestamp:
                return item.duration
        return None

    def get(self):
        from_midnight = datetime.datetime.combine(
            datetime.datetime.now().date(),
            datetime.time(0)
        )
        store = DurationsStore()
        durations = store.get_by_date(date_from=from_midnight)
        labels = list(set([d.timestamp for d in durations]))
        labels.sort()
        result = dict(
            labels=[],
            data=[],
        )
        result['labels'] = labels

        print(labels)
        routes = list(set([d.route['name'] for d in durations]))
        print(routes)
        for route in routes:
            route_data = dict(
                values=[],
                name=route
            )
            for label in labels:
                dur = self.exists(durations, route, label)
                route_data['values'].append(dur)
            result['data'].append(route_data)
        result['labels'] = [str(l.strftime('%H:%M')) for l in result['labels']]
        print(result)

        res = json.dumps(result)
        self.render(path.join(settings.TEMPLATES_PATH, "index.html"), data=res)
