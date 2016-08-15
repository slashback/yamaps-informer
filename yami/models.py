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
