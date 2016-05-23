from selenium import webdriver
import time

browser = webdriver.Firefox()
browser.get('file:///opt/projects/yamaps-informer/index.html')
time.sleep(3)
html = browser.page_source
print(html)
browser.quit()
