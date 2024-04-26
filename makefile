.DEFAULT_GOAL	= compose
DOMAIN_NAME		= transcendence.42.fr
HOSTS_FILE		= /etc/hosts

NAME			= -p Transcendence

PDF				= https://cdn.intra.42.fr/pdf/pdf/114481/en.subject.pdf

pdf:
	$(shell open $(PDF))

configure-hosts:
	@if ! grep -q "$(DOMAIN_NAME)" "$(HOSTS_FILE)"; then \
		echo "Configuring hosts file for $(DOMAIN_NAME)"; \
		sudo sh -c 'echo "127.0.0.1 $(DOMAIN_NAME)" >> $(HOSTS_FILE)'; \
	fi

build:
	@echo "Building docker images"
	docker-compose build 
	@echo "Done"

run:
	@echo "Starting docker containers"
	docker-compose up
	@echo "Done"

down:
	docker-compose down

collectstatic:
	docker-compose exec web python manage.py collectstatic --no-input

run-local:
	python3 App/manage.py runserver

migrate:
	docker-compose exec web python3 manage.py makemigrations
	docker-compose exec web python3 manage.py migrate

createsuperuser:
	docker-compose exec web python3 manage.py createsuperuser

compose: build run

clean:
	@echo "Cleaning docker images"
	docker system prune -f
	docker volume prune -f
	@echo "Done"

stop:
	@echo "Stopping docker containers"
	docker stop $$(sudo docker ps -a -q)
	@echo "Done"

.PHONY: run migrate createsuperuser shell test