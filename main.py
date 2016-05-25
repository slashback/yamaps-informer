from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait # available since 2.4.0
from selenium.webdriver.support import expected_conditions as EC # available since 2.26.0
import json
import time
import datetime


from pyvirtualdisplay import Display


import tornado.ioloop
import tornado.web


def get_route_time():
    display = Display(visible=0, size=(800, 600))
    display.start()

    browser = webdriver.Firefox()
    browser.get('file:///opt/projects/yamaps-informer/index_parser.html')
    try:
        bor = WebDriverWait(browser, 10).until(EC.presence_of_element_located((By.ID, "bor-result")))
        you = WebDriverWait(browser, 10).until(EC.presence_of_element_located((By.ID, "you-result")))
        per = WebDriverWait(browser, 10).until(EC.presence_of_element_located((By.ID, "per-result")))

    finally:
        bor_time = browser.find_element_by_id('bor-result').text
        you_time = browser.find_element_by_id('you-result').text
        per_time = browser.find_element_by_id('per-result').text
        res_to_db = dict(
            timestamp=datetime.datetime.now(),
            bor=int(round(float(bor_time)))//60,
            you=int(round(float(you_time)))//60,
            per=int(round(float(per_time)))//60,
        )
        print(res_to_db)
        result = [
            dict(name='borisovka', drive_time=bor_time),
            dict(name='youbileynaya', drive_time=you_time),
            dict(name='perlovka', drive_time=per_time),
        ]
        browser.quit()
    return json.dumps(result)


class MainHandler(tornado.web.RequestHandler):
    def get(self):
        route_time = get_route_time()
        self.write(route_time)

if __name__ == "__main__":
    application = tornado.web.Application([
        (r"/", MainHandler),
    ])
    application.listen(8080)
    tornado.ioloop.IOLoop.current().start()
