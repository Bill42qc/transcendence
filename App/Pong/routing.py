from django.urls import path

from Pong import consumers

urlpatterns = [
    path("ws/pong", consumers.PongConsumer.as_asgi()),
]