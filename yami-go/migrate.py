# pylint: disable=C0111
import datetime
import psycopg2
from pymongo import MongoClient
from json import dumps
from os import environ

db_user = environ.get("PG_APP_USER")
db_pass = environ.get("PG_APP_PASS")

routes_id_mapping = {
    "57b0dd1a604677252980af82": 1,
    "57b19a9260467749fd1e3f2b": 2,
    "57b19a9260467749fd1e3f2c": 3,
    "57b19a9260467749fd1e3f2d": 4,
    "57b19a9260467749fd1e3f2e": 5,
    "57b19a9260467749fd1e3f2f": 6,
    "57d1b97f6046777ca11bbc20": 7,
    "5893736e75d3411b0b490fd3": 8,
    "5893755075d3411b0b490fd5": 9,
}

charts_id_mapping = {
    "57c42810adb6478b4130bbd5": 1,
    "57c42b9badb6478b4130bbd7": 2,
    "57d06a899b43f0d782091dec": 3,
}


def get_route_items():
    """foo"""
    client = MongoClient('localhost')
    _db = client.routes
    collection = _db['routeItems']
    cursor = collection.find({})
    return cursor

def get_chart_items():
    """foo"""
    client = MongoClient('localhost')
    _db = client.routes
    collection = _db['charts']
    cursor = collection.find({})
    return cursor

def get_durations_by_route_id(route_id):
    """foo"""
    client = MongoClient('localhost')
    _db = client.routes
    collection = _db['durations']
    days_ago = 7
    date_from = datetime.datetime.now() - datetime.timedelta(days=int(days_ago))
    date_from_midnight = datetime.datetime.combine(
        date_from.date(),
        datetime.time(0)
    )
    date_till = date_from_midnight + datetime.timedelta(days=1)
    query = {
        'route_id': route_id,
        # 'timestamp': {
        #     '$gt': date_from_midnight,
        #     '$lt': date_till,
        # }
    }
    print("count: {}".format(collection.count(query)))
    cursor = collection.find(query)
    return cursor

def add_route_item(conn, route_item):
    """foo"""
    cur = conn.cursor()
    query = """
        INSERT INTO routes (uid, name, description, waypoints) 
        VALUES (%s, %s, %s, %s) returning uid
    """
    waypoints = dumps(route_item["waypoints"])
    route_id = routes_id_mapping[str(route_item['_id'])]
    params = (route_id, route_item['name'], route_item['description'], waypoints)
    cur.execute(query, params)
    uid, = cur.fetchone()
    cur.close()
    return uid

def add_duration(conn, duration_item, route_item_id):
    """foo"""
    cur = conn.cursor()
    query = """
        INSERT INTO durations (route_id, check_time, duration) 
        VALUES (%s, %s, %s)
    """
    params = (route_item_id, duration_item['timestamp'], duration_item['duration'])
    cur.execute(query, params)
    cur.close()

def add_chart(conn, chart):
    """foo"""
    cur = conn.cursor()
    query = """
        INSERT INTO charts (uid, name) 
        VALUES (%s, %s)
    """
    params = (charts_id_mapping[str(chart['_id'])], chart['name'])
    cur.execute(query, params)
    cur.close()


def add_route_chart_relations(conn, chart):
    """foo"""
    for route_id in chart['routes']:
        cur = conn.cursor()
        query = """
            INSERT INTO chart_routes (chart_id, route_id) 
            VALUES (%s, %s)
        """
        params = (charts_id_mapping[str(chart['_id'])], routes_id_mapping[str(route_id)])
        cur.execute(query, params)
        cur.close()

def migrate_mongo_to_pg():
    """foo"""
    route_items = get_route_items()
    conn = psycopg2.connect("dbname=routes host=localhost user={} password={}".format(db_user, db_pass))
    conn.autocommit = True
    for route_item in route_items:
        route_id = str(route_item['_id'])
        print('Migrating route_id: {}'.format(route_id))
        inserted_routeid = add_route_item(conn, route_item)
        durations = get_durations_by_route_id(route_id)
        for duration_item in durations:
            add_duration(conn, duration_item, inserted_routeid)
    chart_items = get_chart_items()
    for chart in chart_items:
        add_chart(conn, chart)
        add_route_chart_relations(conn, chart)
    conn.close()

if __name__ == '__main__':
    migrate_mongo_to_pg()
