# views.py
from django.forms import ValidationError
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import ListAPIView, CreateAPIView, DestroyAPIView
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password
from django.shortcuts import get_object_or_404
from django.db import transaction
from .models import (
    CourseProgress,
    LessonProgress,
    Lesson,
    AppUser,
    Course,
    Event,
    Registrations,
    LessonResource,
    EmailVerificationToken
)
from .serializers import (
    CourseProgressSerializer,
    LessonSerializer,
    UserSerializer,
    CourseSerializer,
    EventSerializer,
    UserRegisteredEventsListSerializer,
    LessonResourceSerializer,
    LessonResourceBulkSerializer,
    EmailVerificationSerializer,
    ResendVerificationSerializer
)
from .permissions import IsAdmin
from django.core.mail import send_mail
from django.conf import settings
from django.core.validators import validate_email
from django.contrib.auth.password_validation import validate_password
import re

class UserViewSet(viewsets.ModelViewSet):
    queryset = AppUser.objects.all()
    serializer_class = UserSerializer

def send_verification_email(user, token):
    verification_url = f"{settings.FRONTEND_URL}/verify-email/{token}"
    
    send_mail(
        subject='Verify your email address',
        message=f"""
        Hi {user.name},
        
        Thank you for registering! Please verify your email address by clicking the link below:
        
        {verification_url}
        
        This link will expire in 24 hours.
        
        If you didn't request this, please ignore this email.
        """,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=False,
    )
    
class RegisterView(APIView):
    permission_classes = [AllowAny]

    def validate_name(self, name):
        if len(name.strip()) < 2:
            raise ValidationError("Name must be at least 2 characters long.")
        if len(name) > 50:
            raise ValidationError("Name must not exceed 50 characters.")
        if not re.match(r'^[a-zA-Z\s\-\']+$', name):
            raise ValidationError("Name can only contain letters, spaces, hyphens, and apostrophes.")
        return name.strip()

    def validate_password(self, password):
        if len(password) < 8:
            raise ValidationError("Password must be at least 8 characters long.")
        if not re.match(r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]', password):
            raise ValidationError(
                "Password must contain at least one uppercase letter, "
                "one lowercase letter, one number, and one special character."
            )
        return password

    def validate_email_domain(self, email):
        allowed_domains = ['torontomu.ca', 'gmail.com', 'outlook.com']  # Add your allowed domains
        domain = email.split('@')[1].lower()
        if domain not in allowed_domains:
            raise ValidationError(f"Please use an email address from one of these domains: {', '.join(allowed_domains)}")

    def post(self, request):
        data = request.data
        name = data.get('name', '').strip()
        email = data.get('email', '').strip()
        password = data.get('password', '')

        if not all([name, email, password]):
            return Response(
                {"error": "All fields are required!"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            try:
                self.validate_name(name)
            except ValidationError as e:
                return Response(
                    {"error": str(e.message)}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            try:
                validate_email(email)
                # Uncomment to enable domain validation
                # self.validate_email_domain(email)
            except ValidationError:
                return Response(
                    {"error": "Please enter a valid email address."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            if AppUser.objects.filter(email=email).exists():
                return Response(
                    {"error": "An account with this email already exists."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            try:
                self.validate_password(password)
            except ValidationError as e:
                return Response(
                    {"error": str(e.message)}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            with transaction.atomic():
                user = AppUser.objects.create(
                    name=name,
                    email=email,
                    password=make_password(password),
                    is_verified=False
                )
                
                verification = EmailVerificationToken.objects.create(user=user)
                
                try:
                    send_verification_email(user, verification.token)
                except Exception as e:
                    print(f"Failed to send verification email: {str(e)}")

                return Response({
                    "message": "Registration successful! Please check your email to verify your account.",
                    "email": user.email
                }, status=status.HTTP_201_CREATED)

        except Exception as e:
            print(f"Unexpected error during registration: {str(e)}")
            return Response(
                {"error": "An unexpected error occurred. Please try again later."}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
class VerifyEmailView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = EmailVerificationSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            verification = EmailVerificationToken.objects.get(
                token=serializer.validated_data['token']
            )
            
            if not verification.is_valid():
                return Response(
                    {'error': 'Invalid or expired token'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            user = verification.user
            user.is_verified = True
            user.save()

            verification.is_used = True
            verification.save()

            token, _ = Token.objects.get_or_create(user=user)

            return Response({
                'message': 'Email verified successfully',
                'token': token.key,
                'role': user.role
            })

        except EmailVerificationToken.DoesNotExist:
            return Response(
                {'error': 'Invalid token'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

class ResendVerificationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ResendVerificationSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email']
        try:
            user = AppUser.objects.get(email=email)
            
            if user.is_verified:
                return Response(
                    {'error': 'Email is already verified'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            verification = EmailVerificationToken.objects.create(user=user)
            
            send_verification_email(user, verification.token)

            return Response({'message': 'Verification email sent successfully'})

        except AppUser.DoesNotExist:
            return Response(
                {'error': 'User not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Get current and new password from request
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')

        # Validate input
        if not all([current_password, new_password]):
            return Response(
                {"error": "Both current and new password are required."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        user = request.user

        # Verify current password
        if not user.check_password(current_password):
            return Response(
                {"error": "Current password is incorrect."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate new password
        try:
            # Use Django's password validation
            validate_password(new_password, user)
            
            # Additional custom validation
            if len(new_password) < 8:
                raise ValidationError("Password must be at least 8 characters long.")
            
            if not any(c.isupper() for c in new_password):
                raise ValidationError("Password must contain at least one uppercase letter.")
            
            if not any(c.islower() for c in new_password):
                raise ValidationError("Password must contain at least one lowercase letter.")
            
            if not any(c.isdigit() for c in new_password):
                raise ValidationError("Password must contain at least one number.")
            
            if not any(not c.isalnum() for c in new_password):
                raise ValidationError("Password must contain at least one special character.")

            # Check if new password is same as current
            if current_password == new_password:
                return Response(
                    {"error": "New password must be different from current password."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Set new password
            user.set_password(new_password)
            user.save()

            return Response(
                {"message": "Password changed successfully."}, 
                status=status.HTTP_200_OK
            )

        except ValidationError as e:
            return Response(
                {"error": str(e) if hasattr(e, 'message') else e.messages[0]}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {"error": "An unexpected error occurred. Please try again."}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
                
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        if not all([email, password]):
            return Response(
                {"error": "Email and password are required."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = AppUser.objects.get(email=email)
            
            if not user.check_password(password):
                return Response(
                    {"error": "Incorrect password."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            if not user.is_verified:
                return Response({
                    "error": "Please verify your email before logging in.",
                    "needsVerification": True,
                    "email": user.email
                }, status=status.HTTP_403_FORBIDDEN)

            token, _ = Token.objects.get_or_create(user=user)

            return Response({
                "token": token.key,
                "role": user.role,
                "name": user.name,  
                "email": user.email  
            }, status=status.HTTP_200_OK)

        except AppUser.DoesNotExist:
            return Response(
                {"error": "No account found with this email address."}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated]

class UserEventsView(APIView):
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Event.objects.filter(registrations__user=self.request.user)
    
    def get(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)

class EventRegistrationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, event_id):
        event = get_object_or_404(Event, event_id=event_id)
        try:
            Registrations.objects.create(user=request.user, event=event)
            return Response({"message": "Successfully registered for event."}, 
                          status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class UserRegisteredEventsListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        registrations = Registrations.objects.filter(user=request.user)
        events = [registration.event for registration in registrations]
        serializer = UserRegisteredEventsListSerializer(events, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class UnregisterFromEventView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, event_id):
        registration = get_object_or_404(
            Registrations, user=request.user, event__event_id=event_id
        )
        registration.delete()
        return Response({"message": "Successfully unregistered from event."}, 
                      status=status.HTTP_200_OK)

class CourseLessonsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, course_id):
        lessons = Lesson.objects.filter(course_id=course_id).order_by('order')
        if not lessons.exists():
            return Response({"error": "No lessons found for this course."}, status=status.HTTP_404_NOT_FOUND)
        serializer = LessonSerializer(lessons, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

class UpdateLessonProgressView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, lesson_id):
        user = request.user
        lesson = get_object_or_404(Lesson, lesson_id=lesson_id)
        
        lesson_progress, _ = LessonProgress.objects.get_or_create(user=user, lesson=lesson)
        completed = request.data.get('completed', False)
        if not isinstance(completed, bool):
            return Response({"error": "Invalid value for 'completed'. Must be boolean."}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        lesson_progress.completed = completed
        lesson_progress.save()

        # Update course progress
        self.update_course_progress(user, lesson.course)
        return Response({"message": "Lesson progress updated successfully."}, 
                      status=status.HTTP_200_OK)

    def update_course_progress(self, user, course):
        lessons = Lesson.objects.filter(course=course)
        total_lessons = lessons.count()
        completed_lessons = LessonProgress.objects.filter(
            user=user, lesson__in=lessons, completed=True
        ).count()

        progress_percentage = (completed_lessons / total_lessons) * 100 if total_lessons > 0 else 0
        CourseProgress.objects.update_or_create(
            user=user, course=course,
            defaults={'progress_percentage': progress_percentage}
        )

class GetCourseProgressView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, course_id):
        course = get_object_or_404(Course, course_id=course_id)
        course_progress = get_object_or_404(CourseProgress, user=request.user, course=course)
        serializer = CourseProgressSerializer(course_progress)
        return Response(serializer.data, status=status.HTTP_200_OK)

class LessonResourcesView(ListAPIView):
    serializer_class = LessonResourceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        lesson_id = self.kwargs.get('lesson_id')
        return LessonResource.objects.filter(lesson_id=lesson_id).order_by('uploaded_at')

# Admin Views
class AdminUserListView(ListAPIView):
    permission_classes = [IsAdmin]
    queryset = AppUser.objects.all()
    serializer_class = UserSerializer

class AdminListCoursesView(ListAPIView):
    permission_classes = [IsAdmin]
    queryset = Course.objects.all()
    serializer_class = CourseSerializer

class AdminListEventsView(ListAPIView):
    permission_classes = [IsAdmin]
    queryset = Event.objects.all()
    serializer_class = EventSerializer

class AdminAddCourseView(CreateAPIView):
    permission_classes = [IsAdmin]
    queryset = Course.objects.all()
    serializer_class = CourseSerializer

class AdminRemoveCourseView(DestroyAPIView):
    permission_classes = [IsAdmin]
    queryset = Course.objects.all()
    lookup_field = 'id'

class AdminAddEventView(CreateAPIView):
    permission_classes = [IsAdmin]
    queryset = Event.objects.all()
    serializer_class = EventSerializer

class AdminRemoveEventView(DestroyAPIView):
    permission_classes = [IsAdmin]
    queryset = Event.objects.all()
    lookup_field = 'event_id'

class AdminEventRegistrationsView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request, event_id):
        event = get_object_or_404(Event, event_id=event_id)
        registrations = Registrations.objects.filter(event=event).select_related('user')
        users = [registration.user for registration in registrations]
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class AdminAddLessonView(CreateAPIView):
    permission_classes = [IsAdmin]
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer

    def perform_create(self, serializer):
        course_id = self.request.data.get("course")
        if not course_id:
            raise ValidationError({"error": "course is required."})
        
        course = get_object_or_404(Course, course_id=course_id)
        new_order = int(self.request.data.get('order'))

        affected_lessons = Lesson.objects.filter(
            course=course,
            order__gte=new_order
        ).order_by('order')

        if affected_lessons.exists():
            with transaction.atomic():
                for lesson in affected_lessons:
                    lesson.order += 1
                    lesson.save()
                
                serializer.save(course=course)
        else:
            serializer.save(course=course)

class AdminRemoveLessonView(DestroyAPIView):
    permission_classes = [IsAdmin]
    queryset = Lesson.objects.all()
    lookup_field = 'lesson_id'

    def perform_destroy(self, instance):
        course = instance.course
        deleted_order = instance.order

        with transaction.atomic():
            instance.delete()

            lessons_to_update = Lesson.objects.filter(
                course=course,
                order__gt=deleted_order
            ).order_by('order')

            for lesson in lessons_to_update:
                lesson.order -= 1
                lesson.save()

class AddLessonResourceView(CreateAPIView):
    permission_classes = [IsAdmin]
    serializer_class = LessonResourceBulkSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        resources = serializer.save()
        
        response_serializer = LessonResourceSerializer(resources, many=True)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

class DeleteLessonResourceView(DestroyAPIView):
    permission_classes = [IsAdmin]
    queryset = LessonResource.objects.all()
    lookup_field = 'id'