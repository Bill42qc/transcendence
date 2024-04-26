from django.test import TestCase
from django.contrib.auth import get_user_model

class UserCreationTest(TestCase):
	def test_create_user(self):
		User = get_user_model()
		user = User.objects.create_user('testuser', 'test@example.com', 'testpassword')
		self.assertEqual(User.objects.count(), 1)
		self.assertEqual(user.username, 'testuser')
		self.assertEqual(user.email, 'test@example.com')
		self.assertTrue(user.check_password('testpassword'))
