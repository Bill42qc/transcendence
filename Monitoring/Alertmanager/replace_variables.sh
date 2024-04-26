#!/bin/bash

# Alertmanager YAML file path
alertmanager_file="/config/alertmanager.yml"

sed -i "s|ALERTING_TARGET|${ALERTING_TARGET}|g" $alertmanager_file
sed -i "s|ALERTING_EMAIL|${ALERTING_EMAIL}|g" $alertmanager_file
sed -i "s|ALERTING_PASSWORD|${ALERTING_PASSWORD}|g" $alertmanager_file

echo "Variables replaced in $alertmanager_file"

/usr/local/bin/alertmanager/alertmanager --config.file=/config/alertmanager.yml --web.config.file=/config/web-config.yml --log.level=debug