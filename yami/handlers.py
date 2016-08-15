# pylint: disable=abstract-method
from collections import defaultdict
import json
import datetime
from os import path
from pymongo import MongoClient
from tornado import web
from yami.models import Route
from yami.store import RouteStore
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


class MainHandler(BaseHandler):
    def get(self):
        client = MongoClient(settings.MONGODB_URI)
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
        self.render(path.join(settings.TEMPLATES_PATH, "index.html"), data=res)
