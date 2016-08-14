from pymongo import MongoClient
from os import environ

MONGODB_URI = environ.get('DB_PORT_27017_TCP_ADDR', 'localhost')


class Waypoint:
    def __init__(self, lat, lon):
        self.lat = lat
        self.lon = lon

    def export(self):
        return self.lat, self.lon


class Route:
    _fields = ('name', 'description', 'waypoints', '_id')

    def __init__(self, name, description=None, waypoints=None, _id=None):
        self.name = name
        self.description = description
        self.waypoints = waypoints or []
        self._id = _id

    def export(self):
        return dict(
            name=self.name,
            description=self.description,
            waypoints=[w.export() for w in self.waypoints],
            _id=self._id
        )


class Graph:
    _fields = ('name', 'description', 'routes', '_id')

    def __init__(self, name, description=None, routes=None, _id=None):
        self.name = name
        self.description = description
        self.routes = routes or []
        self._id = _id

    def export(self):
        return dict(
            name=self.name,
            description=self.description,
            routes=[r.export() for r in self.routes],
            _id=self._id
        )


class GraphMongoRepo:
    def __init__(self):
        client = MongoClient(MONGODB_URI)
        self.db = client.graphs

    def add(self, graph):
        self.db.insert(graph.export())

    def get(self, _id):
        graph = self.db.find_one({'_id': _id})
        