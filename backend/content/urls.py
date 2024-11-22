from django.urls import path
from .views import RegisterView, LoginView, EventListView

urlpatterns = [
    path('api/users/register/', RegisterView.as_view(), name='register'),
    path('api/users/login/', LoginView.as_view(), name='login'),
    path('api/users/events/', EventListView.as_view(), name='event-list'),
]
