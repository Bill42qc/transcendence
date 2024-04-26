from django.urls import path, re_path
from Auth.views import 	RegisterView, LoginView, UserView, LogoutView, DeleteUserView, UpdateUserView, \
						CallbackView, GetIntraLink, \
                        UpdateAvatarView, AddFriendView, FriendListView, \
						GenerateOTPView, VerifyOTPView, DisableOTPView, \
                        UpdateMatch, UpdateOnlineStatus
from . import views

urlpatterns = [
	path('', views.index, name='index'),
	path('api/register/', RegisterView.as_view(), name='register'),
	path('api/login/', LoginView.as_view(), name='login'),
	path('api/user/', UserView.as_view(), name='user'),
	path('api/logout/', LogoutView.as_view(), name='logout'),
	path('api/delete_user/', DeleteUserView.as_view(), name='delete_user'),
	path('api/update_user/', UpdateUserView.as_view(), name='update_user'),
	path('api/callback/', CallbackView.as_view(), name='callback'),
	path('api/update_avatar/', UpdateAvatarView.as_view(), name='update_avatar'),
    path('api/add_friends/', AddFriendView.as_view(), name='add_friends'),
	path('api/friend_list/', FriendListView.as_view(), name='friend_list'),
	path('api/generate_otp/', GenerateOTPView.as_view(), name='generate_otp'),
	path('api/verify_otp/', VerifyOTPView.as_view(), name='verify_otp'),
	path('api/disable_otp/', DisableOTPView.as_view(), name='disable_otp'),
    path('api/update_match/', UpdateMatch.as_view(), name='update_match'),
    path('api/get_intra_link/', GetIntraLink.as_view(), name='get_intra_link'),
    path('api/update_online_status/', UpdateOnlineStatus.as_view(), name='update_online_status'),
	re_path(r'^.*$', views.index, name='index'),
]