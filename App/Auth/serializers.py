from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.contrib.auth.validators import UnicodeUsernameValidator
from .models import User
import re

class MatchSerializer(serializers.ModelSerializer):
    date = serializers.DateTimeField(format="%Y-%m-%d %H:%M", read_only=True)

    class Meta:
        model = User.Match
        fields = ['id', 'user', 'opponent', 'result', 'date']
        extra_kwargs = {
            'user': {'read_only': True},
        }

class UserSerializer(serializers.ModelSerializer):
    username_validator = UnicodeUsernameValidator()

    password_confirmation = serializers.CharField(write_only=True)
    
    matches = MatchSerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = ['id', 'intra_id', 'username', 'email', 'password', 'password_confirmation', 
                  'avatar', 'avatar_intra', 'is_active', 'matches', 'otp_enabled', 'otp_verified']
        
        extra_kwargs = {
            'password': {'write_only': True},
        }

    def validate(self, data):
        password = data.get('password')
        password_confirmation = data.get('password_confirmation')

        if password and password != password_confirmation:
            raise serializers.ValidationError("The passwords do not match.")

        if 'username' in data and data['username'] == password:
            raise serializers.ValidationError("Username and password must be different.")
        
        if 'avatar' in data:
            avatar = data['avatar']
            valid_extensions = ['png', 'jpg', 'jpeg', 'gif']
            ext = avatar.name.split('.')[-1]
            if ext.lower() not in valid_extensions:
                raise serializers.ValidationError('Unsupported file extension.')
            max_size = 5 * 1024 * 1024
            if avatar.size > max_size:
                raise serializers.ValidationError('File size too large. Size should not exceed 5MB.')
        return data

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists")
        
        min_length = 3
        max_length = 10
        if len(value) < min_length or len(value) > max_length:
            raise serializers.ValidationError(f"Username must be between {min_length} and {max_length} characters long")
        
        self.username_validator(value)

        return value

    def validate_password(self, value):
        try:
            validate_password(value)
        except ValidationError as e:
            raise serializers.ValidationError(str(e))
        return value
    
    def validate_email(self, value):
        if not re.match(r"[^@]+@[^@]+\.[^@]+", value):
            raise serializers.ValidationError("Invalid email format")
        return value

    def create(self, validated_data):
        validated_data.pop('password_confirmation', None)
        password = validated_data.pop('password')
        instance = self.Meta.model(**validated_data)
        if password is not None:
            instance.set_password(password)
        instance.save()
        return instance