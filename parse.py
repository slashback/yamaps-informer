from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait # available since 2.4.0
from selenium.webdriver.support import expected_conditions as EC # available since 2.26.0
import json
import time
import datetime
from pymongo import MongoClient

from pyvirtualdisplay import Display


def get_route_time():
    display = Display(visible=0, size=(800, 600))
    display.start()

    browser = webdriver.Firefox()
    browser.get('http://spacelab44.ru:8085/index_parser.html')
    # print(browser.page_source)
    try:
        # bor = WebDriverWait(browser, 10).until(EC.presence_of_element_located((By.ID, "bor-result")))
        # you = WebDriverWait(browser, 10).until(EC.presence_of_element_located((By.ID, "you-result")))
        # per = WebDriverWait(browser, 10).until(EC.presence_of_element_located((By.ID, "per-result")))
        vol = WebDriverWait(browser, 10).until(EC.presence_of_element_located((By.ID, "vol-result")))
    finally:
        bor_time = browser.find_element_by_id('bor-result').text
        you_time = browser.find_element_by_id('you-result').text
        per_time = browser.find_element_by_id('per-result').text
        vol_time = browser.find_element_by_id('vol-result').text
        res_to_db = dict(
            timestamp=datetime.datetime.now(),
            bor=int(round(float(bor_time)))//60,
            you=int(round(float(you_time)))//60,
            per=int(round(float(per_time)))//60,
            direction='msk'
        )
        res_back_to_db = dict(
            timestamp=datetime.datetime.now(),
            vol=int(round(float(vol_time)))//60,
            direction='home'
        )
        client = MongoClient()
        db = client.routes
        routes = db['routes']
        routes.insert(res_to_db)
        routes.insert(res_back_to_db)
        
        browser.quit()
        display.stop()
    return (res_to_db, res_back_to_db)



if __name__ == "__main__":
    result = get_route_time()
    print(result)
