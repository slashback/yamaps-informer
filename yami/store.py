from copy import deepcopy
from pymongo import MongoClient
from bson.objectid import ObjectId
from yami import settings
from yami.models import Duration


class MongodbProvider:
    def __init__(self, collection):
        self.client = MongoClient(settings.MONGODB_URI)
        self.db = self.client.routes
        self.collection = self.db[collection]

    def get(self, _id):
        item = self.collection.find_one(
            {'_id': ObjectId(_id)}
        )
        return item

    def get_all(self):
        items = []
        for raw_item in self.collection.find():
            item = deepcopy(raw_item)
            item['_id'] = str(item['_id'])
            items.append(item)
        return items

    def add(self, item):
        result = self.collection.insert_one(item)
        return result.inserted_id

    def remove(self, _id):
        self.collection.delete_one({'_id': _id})

    def update(self, item_id, item):
        self.collection.update_one(
            {"_id": item_id},
            {"$set": item}
        )

    def get_by_date(self, field, date_from, date_till=None):
        items = []
        if date_till:
            query = {
                field: {
                    '$gt': date_from,
                    '$lt': date_till,
                }
            }
        else:
            query = {
                field: {
                    '$gt': date_from
                }
            }
        cursor = self.collection.find(query, {'_id': 0})
        for item in cursor:
            items.append(item)
        return items


class RouteStore:
    def __init__(self, provider=MongodbProvider):
        self.store_name = 'routeItems'
        self.provider = provider(self.store_name)

    def get(self, route_id):
        route = self.provider.get(route_id)
        return route

    def add(self, route):
        _id = self.provider.add(route.to_dict())
        return _id

    def remove(self, route_id):
        self.provider.remove(route_id)

    def update(self, route_id, route):
        self.provider.update(route_id, route)

    def get_all(self):
        routes = self.provider.get_all()
        return routes


class DurationsStore:
    def __init__(self, provider=MongodbProvider):
        self.store_name = 'durations'
        self.provider = provider(self.store_name)

    def get(self, duration_id):
        route = self.provider.get(duration_id)
        return route

    def add(self, duration):
        _id = self.provider.add(duration.to_dict())
        return _id

    def get_all(self):
        durations = self.provider.get_all()
        return durations

    def get_by_date(self, date_from, date_till=None):
        field = 'timestamp'
        durations = []
        raw_durations = self.provider.get_by_date(field, date_from, date_till)
        for duration_data in raw_durations:
            d = Duration(**duration_data)
            durations.append(d)
        return durations
