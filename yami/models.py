# pylint: disable=too-few-public-methods


class Route:
    _fields = ('name', 'description', 'waypoints', '_id')

    def __init__(self, name, description=None, waypoints=None, _id=None):
        self.name = name
        self.description = description
        self.waypoints = waypoints or []
        self._id = _id

    def to_dict(self):
        data = dict(
            name=self.name,
            description=self.description,
            waypoints=self.waypoints,
        )
        if self._id:
            data['_id'] = self._id
        return data


class Duration:
    def __init__(self, duration, route_id, timestamp):
        from yami.store import RouteStore
        self.duration = duration
        self.route_id = route_id
        self.timestamp = timestamp
        store = RouteStore()
        self.route = store.get(self.route_id)

    def __repr__(self):
        return 'Timestamp: {}, Route: {}, Duration: {}'.format(
            self.timestamp, self.route_id, self.duration
        )

    def to_dict(self):
        return dict(
            duration=self.duration,
            route_id=self.route_id,
            timestamp=self.timestamp,
        )
