from yami.parser.yandex import YandexHelper


if __name__ == "__main__":
    yah = YandexHelper()
    result = yah.get_routes()
    print(result)
