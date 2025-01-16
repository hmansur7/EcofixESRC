# content/authentication.py
from rest_framework.authentication import TokenAuthentication
from rest_framework.exceptions import AuthenticationFailed

class CookieTokenAuthentication(TokenAuthentication):
    keyword = 'Token'
    
    def authenticate(self, request):
        token = request.COOKIES.get('auth_token')
        if not token:
            return None

        try:
            result = self.authenticate_credentials(token)
            return result
        except Exception as e:
            return None