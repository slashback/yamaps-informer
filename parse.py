import json
import datetime
from pymongo import MongoClient
from pyvirtualdisplay import Display
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait # available since 2.4.0
from selenium.webdriver.support import expected_conditions as EC # available since 2.26.0

class YandexHelper:
    SOURCE_HTML = 'http://spacelab44.ru:8085/index_parser.html'
    def __init__(self):
        self.display = Display(visible=0, size=(800, 600))
        self.display.start()
        self.browser = webdriver.Firefox()
        self.browser.get(self.SOURCE_HTML)

    def __enter__(self):
        return self

    def _parse_html(self):
        bor_time = self.browser.find_element_by_id('bor-result').text
        you_time = self.browser.find_element_by_id('you-result').text
        per_time = self.browser.find_element_by_id('per-result').text
        vol_time = self.browser.find_element_by_id('vol-result').text
        return (bor_time, you_time, per_time, vol_time)

    def _format_data(self, bor_time, you_time, per_time, vol_time):
        format_time = lambda x: int(float(x) // 60)
        timestamp = datetime.datetime.now()
        routes_work = dict(
            timestamp=timestamp,
            bor=format_time(bor_time),
            you=format_time(you_time),
            per=format_time(per_time),
            direction='msk',
        )
        routes_home = dict(
            timestamp=timestamp,
            vol=format_time(vol_time),
            direction='home',
        )
        return (routes_work, routes_home)

    def _save(self, *items):
        client = MongoClient()
        db = client.routes
        routes = db['routes']
        for item in items:
            routes.insert(item)
        return items

    def get_routes(self):
        try:
            vol = WebDriverWait(self.browser, 10).until(EC.presence_of_element_located((By.ID, "vol-result")))
        finally:
            parsed_durations = self._parse_html()
            routes_work, routes_home = self._format_data(*parsed_durations)
            result = self._save(routes_work, routes_home)
            return result

    def __exit__(self, exception_type, exception_value, traceback):
        self.browser.quit()
        self.display.stop()



if __name__ == "__main__":
    with YandexHelper() as yah:
        result = yah.get_routes()
        print(result)
