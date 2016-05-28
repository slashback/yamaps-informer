import json
import datetime
from pymongo import MongoClient
from pyvirtualdisplay import Display
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


class YandexHelper:
    SOURCE_HTML = 'http://localhost:8085/index_parser.html'
    def __init__(self):
        self.display = Display(visible=0, size=(800, 600))
        self.display.start()
        self.browser = webdriver.Firefox()
        self.browser.get(self.SOURCE_HTML)

    def __enter__(self):
        return self

    def _parse_html(self):
        results = self.browser.find_elements_by_class_name('results')
        format_time = lambda x: int(float(x) // 60)
        parsed = { item.get_attribute('id'): format_time(item.text) for item in results }
        return parsed

    def _format_data(self, routes):
        timestamp = datetime.datetime.now()
        routes['timestamp'] = timestamp
        return routes

    def _save(self, item):
        client = MongoClient()
        db = client.routes
        routes = db['routes']
        routes.insert(item)
        return item

    def get_routes(self):
        try:
            vol = WebDriverWait(self.browser, 10).until(EC.presence_of_element_located((By.ID, "results")))
        finally:
            parsed_durations = self._parse_html()
            routes = self._format_data(parsed_durations)
            result = self._save(routes)
            return result

    def __exit__(self, exception_type, exception_value, traceback):
        self.browser.quit()
        self.display.stop()


if __name__ == "__main__":
    with YandexHelper() as yah:
        result = yah.get_routes()
        print(result)
