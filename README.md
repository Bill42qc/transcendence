Transcendence

Transcendence est un projet complet conçu pour fournir une infrastructure tout-en-un pour héberger une application web avec divers services intégrés. Ce projet utilise Docker Compose pour orchestrer les services nécessaires, y compris Nginx, PostgreSQL, Django avec Daphne pour le serveur ASGI, Grafana, et l'ELK stack pour la surveillance et la gestion des logs.
Fonctionnalités

*******
Pour voir le site déja compilé : https://42transcendence.kippylab.dev/

    Backend Django avec Daphne : Fournit une API RESTful pour gérer les utilisateurs et les historiques de matchs de pong.
    Nginx : Serveur web pour servir l'application web et gérer le trafic HTTP.
    PostgreSQL : Base de données relationnelle pour stocker les données.
    Grafana : Outil de surveillance pour visualiser les métriques des différents services.
    ELK Stack : Elasticsearch, Logstash, Kibana pour la gestion et la visualisation des logs.
    API de l'intra 42 : Compatible avec l'API de l'intra 42 pour l'intégration des utilisateurs.
    Jeu de Pong en ligne : Option pour jouer à des parties de pong en ligne via un serveur WebSocket en Python.
    Tournois locaux : Option pour participer à des tournois locaux de pong.
    IA progressive : Option pour jouer contre une IA progressive.

Prérequis

    Docker
    Docker Compose

Installation

    Clonez le dépôt :

bash

git clone https://github.com/Bill42qc/transcendence.git

    Accédez au répertoire du projet :

bash

cd transcendence

    Lancez Docker Compose pour démarrer les services :

bash

docker-compose up -d

Configuration

    Backend Django : Les configurations se trouvent dans backend/settings.py.
    Nginx : La configuration se trouve dans nginx/nginx.conf.
    Grafana : Accessible à http://localhost:3000 (utilisateur par défaut : admin, mot de passe : admin).
    ELK Stack : Accédez à Kibana via http://localhost:5601.

Utilisation
API REST

L'API REST est accessible à http://localhost/api/.
Jeu de Pong

    Accédez à http://localhost/pong pour jouer au jeu de pong en ligne.
    Rejoignez les tournois locaux et défiez l'IA progressive.



