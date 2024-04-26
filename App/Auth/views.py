from django.shortcuts import render
from django.core.management import call_command
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import AuthenticationFailed, ValidationError
from Auth.serializers import UserSerializer, MatchSerializer
from Auth.models import User
import jwt, datetime, os, requests, pyotp, qrcode, base64
from io import BytesIO

class RegisterView(APIView):
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    def post(self, request):
        username = request.data['username']
        password = request.data['password']
        if username is None and password is None:
            raise AuthenticationFailed('Invalid username and password')
        
        user = User.objects.filter(username=username).first()
        if user is None:
            raise AuthenticationFailed('Username not found. Please register first.')
        
        if not user.check_password(password):
            raise AuthenticationFailed('Invalid username or password. Please try again.')
        
        if user.otp_enabled:
            otp_code = request.data.get('otpCode')
            if not otp_code:
                return Response({'message': 'OTP required'}, status=status.HTTP_400_BAD_REQUEST)
            
            totp = pyotp.TOTP(user.otp_base32)
            if not totp.verify(otp_code):
                raise AuthenticationFailed('Invalid 2FA code. Please try again.')
    
        user.is_active = True
        user.save()
        
        # Generate JWT token (payload, secret_key, algorithm)
        # The payload is the data that we want to store in the token
        # The exp key is the expiration time of the token
        # The iat key is the time the token was issued at  
        payload = {
            'id': user.id,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=60),
            'iat': datetime.datetime.utcnow()
        }
        secret_key = os.environ['SECRET_KEY']    
        token = jwt.encode(payload, secret_key, algorithm='HS256')
        response = Response()

        # Set the token in the cookie
        response.set_cookie(key='jwt', value=token, httponly=True) 
        response.data = {
            'jwt': token
        }

        return response
    
class UserView(APIView):
    def get(self, request):
        token = request.COOKIES.get('jwt')

        if not token:
            raise AuthenticationFailed('Unauthenticated')
        
        try:
            payload = jwt.decode(token, os.environ['SECRET_KEY'], algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Unauthenticated')
        
        user = User.objects.filter(id=payload['id']).first()
        serializer = UserSerializer(user)

        return Response(serializer.data)
    
class LogoutView(APIView):
    def post(self, request):
        token = request.COOKIES.get('jwt')

        if not token:
            raise AuthenticationFailed('Unauthenticated')
        
        try:
            payload = jwt.decode(token, os.environ['SECRET_KEY'], algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Unauthenticated')
        
        user = User.objects.filter(id=payload['id']).first()
        if not user:
            raise AuthenticationFailed('User not found')
        
        user.is_active = False
        user.save()

        response = Response()
        response.delete_cookie('jwt')
        response.data = {
            'message': 'success'
        }
        return response    

class DeleteUserView(APIView):
    def delete(self, request):
        token = request.COOKIES.get('jwt')

        if not token:
            raise AuthenticationFailed('Unauthenticated')
        
        try:
            payload = jwt.decode(token, os.environ['SECRET_KEY'], algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Unauthenticated')
        
        user = User.objects.filter(id=payload['id']).first()
        if not user:
            raise AuthenticationFailed('User not found')
        
        user.delete()
        
        response = Response({'message': 'Account deleted successfully'})
        response.delete_cookie('jwt')
        return response
    
class UpdateUserView(APIView):
    def put(self, request):
        token = request.COOKIES.get('jwt')

        if not token:
            raise AuthenticationFailed('Unauthenticated')
        
        try:
            payload = jwt.decode(token, os.environ['SECRET_KEY'], algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Unauthenticated')
        
        user = User.objects.filter(id=payload['id']).first()
        if not user:
            raise AuthenticationFailed('User not found')
        
        serializer = UserSerializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response(serializer.data)
    
def update_img():
    call_command('collectstatic', '--noinput')

class UpdateAvatarView(APIView):
    def post(self, request):
        token = request.COOKIES.get('jwt')

        if not token:
            raise AuthenticationFailed('Unauthenticated')
        
        try:
            payload = jwt.decode(token, os.environ['SECRET_KEY'], algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Unauthenticated')
        
        user = User.objects.filter(id=payload['id']).first()
        if not user:
            raise AuthenticationFailed('User not found')
        
        if 'avatar' in request.FILES:
            serializer = UserSerializer(user, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            update_img()
            return Response(serializer.data)
        else:
            raise AuthenticationFailed('No avatar found in request data')

class CallbackView(APIView):
    def post(self, request):
        code = request.data.get('code')
        if not code: 
            raise AuthenticationFailed('Error with the code')

        token_url = 'https://api.intra.42.fr/oauth/token'
        data = {
            'grant_type': 'authorization_code',
            'client_id': os.environ['CLIENT_ID'],
            'client_secret': os.environ['CLIENT_SECRET'],
            'code': code,
            'redirect_uri': os.environ['REDIRECT_URI']
        }
        response = requests.post(token_url, data=data)
        response_data = response.json()
        if 'error' in response_data:
            raise AuthenticationFailed('Error exchanging code for token')

        access_token = response_data['access_token']
        user_url = 'https://api.intra.42.fr/v2/me'
        headers = {
            'Authorization': f'Bearer {access_token}'
        }
        user_data = requests.get(user_url, headers=headers)
        user_data = user_data.json()

        intra_id = user_data['id']
        user, create = User.objects.get_or_create(intra_id=intra_id, defaults={
            'username': user_data['login'],
            'email': user_data['email'],
            'avatar_intra': user_data['image']['link']
        })
        if create:
            user.username = user_data['login']
            user.email = user_data['email']
            user.avatar_intra = user_data['image']['link']
            user.save()
        user.is_active = True
        user.save()
        
        payload = {
            'id': user.id,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=60),
            'iat': datetime.datetime.utcnow()
        }
        secret_key = os.environ['SECRET_KEY']
        token = jwt.encode(payload, secret_key, algorithm='HS256')

        response = Response()
        response.set_cookie(key='jwt', value=token, httponly=True)
        response.data = {
            'jwt_intra': token
        }
        return response
        
class AddFriendView(APIView):
    def post(self, request):
        token = request.COOKIES.get('jwt')

        if not token:
            raise AuthenticationFailed('Unauthenticated')
        
        try:
            payload = jwt.decode(token, os.environ['SECRET_KEY'], algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Unauthenticated')
        
        user = User.objects.filter(id=payload['id']).first()
        if not user:
            raise AuthenticationFailed('User not found or may not exist')
        
        friend_username = request.data.get('friends')
        user_username = user.username

        if user_username == friend_username:
            raise ValidationError('You cannot add yourself as a friend ... we are sorry if you have no firends ... ouch!')
        friend = User.objects.filter(username=friend_username).first()
        if not friend:
            raise AuthenticationFailed('Friend not found or may not exist')
        
        user.friends.add(friend)
        
        return Response({'message': 'Friend added successfully'})


class FriendListView(APIView):
    def get(self, request):
        token = request.COOKIES.get('jwt')

        if not token:
            raise AuthenticationFailed('Unauthenticated')
        
        try:
            payload = jwt.decode(token, os.environ['SECRET_KEY'], algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Unauthenticated')
        
        user = User.objects.filter(id=payload['id']).first()
        if not user:
            raise AuthenticationFailed('User not found or may not exist')
        
        friends = user.friends.all()
        serializer = UserSerializer(friends, many=True)
        update_img()
        return Response(serializer.data)
    
class GenerateOTPView(APIView):
    def post(self, request):
        token = request.COOKIES.get('jwt')

        if not token:
            raise AuthenticationFailed('Unauthenticated')
        
        try:
            payload = jwt.decode(token, os.environ['SECRET_KEY'], algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Unauthenticated')
        
        user = User.objects.filter(id=payload['id']).first()
        if not user:
            raise AuthenticationFailed('User not found or may not exist')
        
        totp = pyotp.TOTP(pyotp.random_base32())
        user.otp_base32 = totp.secret
        user.otp_auth_url = totp.provisioning_uri(user.username, issuer_name="KippyLab")
        user.otp_enabled = True
        user.save()
        
        # Generate QR code
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(user.otp_auth_url)
        qr.make(fit=True)

        # Create an in-memory buffer to store the QR code image
        buffer = BytesIO()
        img = qr.make_image(fill_color="black", back_color="white")
        img.save(buffer, format="PNG")
        qr_code_image = buffer.getvalue()

        # Convert the bytes buffer to base64 for sending over HTTP response
        
        qr_code_base64 = base64.b64encode(qr_code_image).decode("utf-8")
        
        return Response({
            'message': 'OTP enabled successfully',
            'base32': user.otp_base32,
            'otpauth_url': user.otp_auth_url,
            'qr_code_base64': qr_code_base64
        })

class VerifyOTPView(APIView):
     def post(self, request):
        token = request.COOKIES.get('jwt')

        if not token:
            raise AuthenticationFailed('Unauthenticated')
        
        try:
            payload = jwt.decode(token, os.environ['SECRET_KEY'], algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Unauthenticated')
        
        user = User.objects.filter(id=payload['id']).first()
        if not user:
            raise AuthenticationFailed('User not found or may not exist')
        
        totp = pyotp.TOTP(user.otp_base32)
        if not totp.verify(request.data.get('otpCode')):
            raise AuthenticationFailed('Invalid OTP')
        
        user.otp_enabled = True
        user.otp_verified = True
        user.save()
        
        return Response({'message': 'OTP verified successfully'})

class DisableOTPView(APIView):
    def post(self, request):
        token = request.COOKIES.get('jwt')

        if not token:
            raise AuthenticationFailed('Unauthenticated')
        
        try:
            payload = jwt.decode(token, os.environ['SECRET_KEY'], algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Unauthenticated')
        
        user = User.objects.filter(id=payload['id']).first()
        if not user:
            raise AuthenticationFailed('User not found or may not exist')
        
        totp = pyotp.TOTP(user.otp_base32)
        if not totp.verify(request.data.get('otpCode')):
            raise AuthenticationFailed('Invalid OTP')
        
        user.otp_enabled = False
        user.otp_verified = False
        user.save()
        
        return Response({'message': 'OTP disabled successfully'})
    
class UpdateMatch(APIView):
    def post(self, request):
        token = request.COOKIES.get('jwt')

        if not token:
            raise AuthenticationFailed('Unauthenticated')
        
        try:
            payload = jwt.decode(token, os.environ['SECRET_KEY'], algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Unauthenticated')
        
        user = User.objects.filter(id=payload['id']).first()
        if not user:
            raise AuthenticationFailed('User not found or may not exist')
        
        matchData = MatchSerializer(data=request.data)
        matchData.is_valid(raise_exception=True)
        matchData.save(user=user)

        return Response({'message': 'Match updated successfully'})

class GetIntraLink(APIView):
    def get(self, request):
        return Response({'intra_link': os.environ['INTRA_URL']})
    
class UpdateOnlineStatus(APIView):
    def put(self, request):
        token = request.COOKIES.get('jwt')

        if not token:
            raise AuthenticationFailed('Unauthenticated')
        
        try:
            payload = jwt.decode(token, os.environ['SECRET_KEY'], algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Unauthenticated')
        
        user = User.objects.filter(id=payload['id']).first()
        if not user:
            raise AuthenticationFailed('User not found or may not exist')
        print("User is active: ", user.is_active)
        if (user.is_active):
            user.is_active = False
        else:
            user.is_active = True
        user.save()
        
        return Response({'message': 'Online status updated successfully', 'is_active': user.is_active})

# Note: 
# Django's get_or_create method is a convenience method for looking up an object 
# with the given parameters or creating one if it doesn't exist.

# Here's a breakdown of what's happening:

# User.objects.get_or_create(username=username): 
# This is calling the get_or_create method on the User model's manager (objects).
# It's trying to get a User object where the username field is equal to the username variable that's passed in. 
# If a User object with that username doesn't exist, it creates one.

# user, create = ...: The get_or_create method returns a tuple of two elements. 
# The first element is the User object that was retrieved or created. 
# The second element is a boolean that is True if a new object was created and False if an existing object was retrieved. 
# By assigning the result to user, create, we're unpacking this tuple into two variables. 
# user will contain the User object, and create will contain the boolean.

# So, in summary, this line of code is either getting an existing User object with the given username or creating a new one 
# if it doesn't exist. It's also determining whether a new object was created or not.