# content/authentication.py
from rest_framework.authentication import TokenAuthentication
from rest_framework.exceptions import AuthenticationFailed

class CookieTokenAuthentication(TokenAuthentication):
    keyword = 'Token'
    
    def authenticate(self, request):
        print("Request cookies:", request.COOKIES)  # Debug print
        print("Request headers:", request.headers)  # Debug print
        
        token = request.COOKIES.get('auth_token')
        print(f"Found token: {token}")  # Debug print
        
        if not token:
            return None

        try:
            result = self.authenticate_credentials(token)
            print(f"Authentication result: {result}")  # Debug print
            return result
        except Exception as e:
            print(f"Authentication error: {str(e)}")  # Debug print
            return None