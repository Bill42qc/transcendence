#!/bin/bash

set -e

echo "=> Starting PostgreSQL ..."

# Run the PostgreSQL commands
sudo -u postgres psql -c "CREATE USER <username> WITH PASSWORD '<password>';"
sudo -u postgres psql -c "CREATE DATABASE django_todo OWNER <username>;"

echo "=> Done!"

# fi

exec mysqld