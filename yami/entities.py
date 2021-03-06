# pylint: disable=too-few-public-methods

from pymongo import MongoClient
from yami import settings


class Waypoint:
    def __init__(self, lat, lon):
        self.lat = lat
        self.lon = lon

    def export(self):
        return self.lat, self.lon


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
        client = MongoClient(settings.MONGODB_URI)
        self.db = client.graphs

    def add(self, graph):
        self.db.insert(graph.export())

    def get(self, _id):
        graph = self.db.find_one({'_id': _id})
        return graph
