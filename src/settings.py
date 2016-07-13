from os import environ
from celery.schedules import crontab


if environ.get('IN_DOCKER', None):
    MONGODB_HOST = 'db'
else:
    MONGODB_HOST = 'localhost'

MONGODB_URI = "mongodb://{}:27017".format(MONGODB_HOST)
CELERY_DB_NAME = 'celery_maps'

celery_config = dict(
    BROKER_URL="{}/{}".format(MONGODB_URI, CELERY_DB_NAME),
    CELERY_RESULT_BACKEND="mongodb",
    CELERYBEAT_SCHEDULE={
        'every-hour': {
            'task': 'parser.parse_routes',
            'schedule': crontab(minute='*/5', hour='3-19'),  # 6am-22pm MSK
        },
    },
)

