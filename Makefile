lint:
	pylint --rcfile .pylintrc yami
build_server:
	go build yami-go/server/serve.go
build_parser:
	go build yami-go/parser/parse.go
build_frontend:
	cd yami-frontend && npm run build
build: build_server build_parser build_frontend