from django.urls import path
from .views import 	RegisterView, LoginView, UserView, LogoutView, DeleteUserView, \
    				CallbackView, GetIntraLink, \
					UpdateUserView, UpdateAvatarView, AddFriendsView, FriendListView, \
					GenerateOTPView, VerifyOTPView, DisableOTPView, \
                    UpdateMatch, UpdateOnlineStatus

urlpatterns = [
	path('register/', RegisterView.as_view(), name="register"),
	path('login/', LoginView.as_view(), name='login'),
	path('user/', UserView.as_view(), name='user'), 
	path('logout/', LogoutView.as_view(), name='logout'),
	path('delete_user/', DeleteUserView.as_view(), name='delete_user'),
	path('update_user/', UpdateUserView.as_view(), name='update_user'),
	path('update_avatar/', UpdateAvatarView.as_view(), name='update_avatar'),
	path('get_intra_link/', GetIntraLink.as_view(), name='get_intra_link'),
	path('callback/', CallbackView.as_view(), name='callback'),
	path('add_friends/', AddFriendsView.as_view(), name='add_friends'),
	path('friend_list/', FriendListView.as_view(), name='friend_list'),
	path('generate_otp/', GenerateOTPView.as_view(), name='generate_otp'),
	path('verify_otp/', VerifyOTPView.as_view(), name='verify_otp'),
	path('disable_otp/', DisableOTPView.as_view(), name='disable_otp'),
    path('update_match/', UpdateMatch.as_view(), name='update_match'),
    path('update_online_status/', UpdateOnlineStatus.as_view(), name='update_online_status')
]