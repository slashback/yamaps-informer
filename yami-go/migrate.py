# pylint: disable=C0111
import datetime
import psycopg2
from pymongo import MongoClient


def get_route_items():
    """foo"""
    client = MongoClient('localhost')
    _db = client.routes
    collection = _db['routeItems']
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
        'timestamp': {
            '$gt': date_from_midnight,
            '$lt': date_till,
        }
    }
    cursor = collection.find(query)
    return cursor

def add_route_item(route_item):
    """foo"""
    conn = psycopg2.connect("dbname=routes host=localhost user=postgres password=postgres")
    conn.autocommit = True
    cur = conn.cursor()
    query = """
        INSERT INTO routes (name, description, waypoints) 
        VALUES (%s, %s, %s) returning uid
    """
    params = (route_item['name'], route_item['description'], route_item['waypoints'])
    cur.execute(query, params)
    uid, = cur.fetchone()
    cur.close()
    conn.close()
    return uid

def add_duration(duration_item, route_item_id):
    """foo"""
    conn = psycopg2.connect("dbname=routes host=localhost user=postgres password=postgres")
    conn.autocommit = True
    cur = conn.cursor()
    query = """
        INSERT INTO durations (route_id, check_time, duration) 
        VALUES (%s, %s, %s)
    """
    params = (route_item_id, duration_item['timestamp'], duration_item['duration'])
    cur.execute(query, params)
    cur.close()
    conn.close()

def migrate_mongo_to_pg():
    """foo"""
    route_items = get_route_items()
    for route_item in route_items:
        route_id = str(route_item['_id'])
        print('Migrating route_id: {}'.format(route_id))
        inserted_routeid = add_route_item(route_item)
        durations = get_durations_by_route_id(route_id)
        for duration_item in durations:
            add_duration(duration_item, inserted_routeid)

if __name__ == '__main__':
    migrate_mongo_to_pg()
