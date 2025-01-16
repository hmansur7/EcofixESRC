# backend/content/views.py
import mimetypes
import os
import re
from wsgiref.util import FileWrapper
from django.core.files.storage import default_storage

from django.conf import settings
from django.contrib.auth.hashers import make_password
from django.contrib.auth.password_validation import validate_password
from django.core.mail import send_mail
from django.core.validators import validate_email
from django.core.exceptions import PermissionDenied
from django.db import transaction
from django.forms import ValidationError
from django.http import FileResponse, Http404
from django.shortcuts import get_object_or_404

from rest_framework import status, viewsets
from rest_framework.authtoken.models import Token
from rest_framework.generics import ListAPIView, CreateAPIView, DestroyAPIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from django.db.models import Q
from django.utils import timezone
from django.utils.dateparse import parse_datetime
from django.db.models import Max 

from .models import (
    AppUser,
    Course,
    CourseProgress,
    EmailVerificationToken,
    Event,
    Lesson,
    LessonProgress,
    LessonResource,
    Enrollment,
)
from .permissions import IsAdmin
from .serializers import (
    CourseProgressSerializer,
    CourseSerializer,
    EmailVerificationSerializer,
    EventSerializer,
    LessonResourceBulkSerializer,
    LessonResourceSerializer,
    LessonSerializer,
    ResendVerificationSerializer,
    UserSerializer,
    InstructorCourseSerializer,
)

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
        allowed_domains = ['torontomu.ca', 'gmail.com', 'outlook.com']  
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

            response = Response({
                'message': 'Email verified successfully',
                'role': user.role,
                'name': user.name,
                'email': user.email
            })

            response.set_cookie(
                'auth_token',
                token.key,
                max_age=60*60*24*7,    
                httponly=True,
                samesite='Lax',
                secure=False,           # False for development
                domain='127.0.0.1',
                path='/'
            )

            return response

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
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')

        if not all([current_password, new_password]):
            return Response(
                {"error": "Both current and new password are required."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        user = request.user

        if not user.check_password(current_password):
            return Response(
                {"error": "Current password is incorrect."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            validate_password(new_password, user)
            
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

            if current_password == new_password:
                return Response(
                    {"error": "New password must be different from current password."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

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
            
            response = Response({
                "role": user.role,
                "name": user.name,
                "email": user.email
            })

            response.set_cookie(
                'auth_token',
                token.key,
                domain='127.0.0.1',        
                path='/',                  
                max_age=60*60*24*7,        
                httponly=True,
                samesite='Lax',
                secure=False               # Set to True in production
            )

            response.set_cookie(
                'persistent_auth',
                'true',
                max_age=60*60*24*7,    # 7 days
                httponly=True,
                samesite='Lax',
                secure=False,
                domain='127.0.0.1',
                path='/'
            )
            return response

        except AppUser.DoesNotExist:
            return Response(
                {"error": "No account found with this email address."}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.auth_token:
            request.user.auth_token.delete()
        
        response = Response({"message": "Successfully logged out."})
        response.delete_cookie(settings.COOKIE_NAME)
        
        return response
    
class CourseViewSet(viewsets.ModelViewSet):
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'admin':
            return Course.objects.all()
        
        now = timezone.now()
        return Course.objects.filter(
            Q(is_visible=True) &
            (
                (Q(visibility_start_date__isnull=True) & Q(visibility_end_date__isnull=True)) |
                (Q(visibility_start_date__lte=now) & Q(visibility_end_date__gte=now))
            )
        )

class EnrollCourseView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CourseSerializer
    
    def get_queryset(self):
        return Course.objects.filter(
            enrolled_users__user=self.request.user
        ).order_by('title')
    
    def post(self, request, course_id):
        try:
            course = get_object_or_404(Course, course_id=course_id)
            
            if Enrollment.objects.filter(user=request.user, course=course).exists():
                return Response(
                    {"error": "You are already enrolled in this course"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            enrollment = Enrollment.objects.create(
                user=request.user,
                course=course
            )
            
            CourseProgress.objects.create(
                user=request.user,
                course=course,
                progress_percentage=0.0
            )
            
            return Response(
                {"message": "Successfully enrolled in the course"},
                status=status.HTTP_201_CREATED
            )
            
        except Course.DoesNotExist:
            return Response(
                {"error": "Course not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class EnrolledCoursesView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CourseSerializer
    
    def get_queryset(self):
        now = timezone.now()
        return Course.objects.filter(
            enrolled_users__user=self.request.user
        ).filter(
            Q(is_visible=True) &
            (
                (Q(visibility_start_date__isnull=True) & Q(visibility_end_date__isnull=True)) |
                (Q(visibility_start_date__lte=now) & Q(visibility_end_date__gte=now))
            )
        ).order_by('title')

class AvailableCoursesView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CourseSerializer

    def get_queryset(self):
        now = timezone.now()
        enrolled_courses = Enrollment.objects.filter(
            user=self.request.user
        ).values_list('course_id', flat=True)
        
        queryset = Course.objects.filter(
            is_visible=True
        ).filter(
            Q(visibility_start_date__isnull=True, visibility_end_date__isnull=True) |
            Q(visibility_start_date__lte=now, visibility_end_date__gte=now)
        ).order_by('title')
        
        print("Available courses query:", queryset.query)
        print("Number of available courses:", queryset.count())
        
        return queryset
       
class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated]

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

class ResourcePreviewView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, resource_id):
        try:
            resource = LessonResource.objects.get(id=resource_id)
            
            if not resource.allow_preview:
                return Response(
                    {"error": "Preview not available for this resource"}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            file_path = resource.file.path
            content_type, _ = mimetypes.guess_type(file_path)
            
            if not content_type:
                content_type = 'application/octet-stream'
            
            response = FileResponse(
                FileWrapper(open(file_path, 'rb')),
                content_type=content_type
            )
            
            return response
            
        except LessonResource.DoesNotExist:
            raise Http404("Resource not found")
        except Exception as e:
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
class ResourceDownloadView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, resource_id):
        try:
            resource = get_object_or_404(LessonResource, id=resource_id)
            
            if not resource.file:
                return Response(
                    {"error": "No file associated with this resource"}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            
            file_path = resource.file.path
            
            if not os.path.exists(file_path):
                return Response(
                    {"error": "File not found"}, 
                    status=status.HTTP_404_NOT_FOUND
                )

            original_extension = os.path.splitext(resource.file.name)[1]
            download_filename = f"{resource.title}{original_extension}"
            
            download_filename = "".join(c for c in download_filename if c.isalnum() or c in (' ', '-', '_', '.'))
            
            file_handle = open(file_path, 'rb')
            response = FileResponse(file_handle)
            
            content_type, encoding = mimetypes.guess_type(file_path)
            if content_type:
                response['Content-Type'] = content_type
            
            response['Content-Disposition'] = f'attachment; filename="{download_filename}"'
            
            return response
            
        except Exception as e:
            print(f"Download error: {str(e)}")
            return Response(
                {"error": "Error downloading file"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
# Admin Views
class AdminUserListView(ListAPIView):
    permission_classes = [IsAdmin]
    queryset = AppUser.objects.all()
    serializer_class = UserSerializer

class AdminCourseViewSet(viewsets.ModelViewSet):
    serializer_class = InstructorCourseSerializer
    permission_classes = [IsAdmin]
    
    def get_queryset(self):
        return Course.objects.filter(instructor=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(instructor=self.request.user)
    
    def perform_update(self, serializer):
        if serializer.instance.instructor != self.request.user:
            raise PermissionDenied("You can only update your own courses.")
        serializer.save()
    
    def perform_destroy(self, instance):
        if instance.instructor != self.request.user:
            raise PermissionDenied("You can only delete your own courses.")
        instance.delete()

class AdminListCoursesView(ListAPIView):
    permission_classes = [IsAdmin]
    serializer_class = InstructorCourseSerializer
    
    def get_queryset(self):
        return Course.objects.filter(instructor=self.request.user)

class AdminListEventsView(ListAPIView):
    permission_classes = [IsAdmin]
    queryset = Event.objects.all()
    serializer_class = EventSerializer

class AdminAddCourseView(CreateAPIView):
    permission_classes = [IsAdmin]
    serializer_class = InstructorCourseSerializer
    
    def perform_create(self, serializer):
        serializer.save(instructor=self.request.user)

class AdminRemoveCourseView(DestroyAPIView):
    permission_classes = [IsAdmin]
    queryset = Course.objects.all()
    lookup_field = 'course_id'

    def get_queryset(self):
        return Course.objects.filter(instructor=self.request.user)

    def perform_destroy(self, instance):
        if instance.instructor != self.request.user:
            raise PermissionDenied("You can only delete your own courses.")
        
        with transaction.atomic():
            lessons = Lesson.objects.filter(course=instance)
            for lesson in lessons:
                resources = LessonResource.objects.filter(lesson=lesson)
                for resource in resources:
                    if resource.file:
                        file_path = os.path.join(settings.MEDIA_ROOT, str(resource.file))
                        if os.path.exists(file_path):
                            os.remove(file_path)  
                    resource.delete()
                
                lesson.delete() 
            instance.delete()  



class AdminUpdateCourseVisibilityView(APIView):
    permission_classes = [IsAdmin]
    
    def patch(self, request, course_id):
        try:
            course = get_object_or_404(Course, course_id=course_id)
            
            if course.instructor != request.user:
                raise PermissionDenied("You can only update your own courses.")
            
            is_visible = request.data.get('is_visible')
            start_date = request.data.get('visibility_start_date')
            end_date = request.data.get('visibility_end_date')
            
            if is_visible is not None:
                course.is_visible = is_visible
                
            course.visibility_start_date = parse_datetime(start_date) if start_date else None
            course.visibility_end_date = parse_datetime(end_date) if end_date else None
            
            course.save()
            serializer = CourseSerializer(course)
            return Response(serializer.data)
            
        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AdminUpdateCourseView(APIView):
    permission_classes = [IsAdmin]
    
    def patch(self, request, course_id):
        try:
            course = get_object_or_404(Course, course_id=course_id)
            
            if course.instructor != request.user:
                raise PermissionDenied("You can only update your own courses.")
            
            serializer = InstructorCourseSerializer(
                course,
                data=request.data,
                partial=True
            )
            
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
class AdminAddEventView(CreateAPIView):
    permission_classes = [IsAdmin]
    queryset = Event.objects.all()
    serializer_class = EventSerializer

class AdminRemoveEventView(DestroyAPIView):
    permission_classes = [IsAdmin]
    queryset = Event.objects.all()
    lookup_field = 'event_id'

class AdminAddLessonView(CreateAPIView):
    permission_classes = [IsAdmin]
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer

    def perform_create(self, serializer):
        course_id = self.request.data.get("course")
        if not course_id:
            raise ValidationError({"error": "course is required."})
        
        course = get_object_or_404(Course, course_id=course_id)
        requested_order = int(self.request.data.get('order'))

        highest_order = Lesson.objects.filter(course=course).aggregate(
            max_order=Max('order'))['max_order'] or 0

        new_order = max(1, min(requested_order, highest_order + 1))

        with transaction.atomic():
            affected_lessons = Lesson.objects.filter(
                course=course,
                order__gte=new_order
            ).order_by('-order')  

            for lesson in affected_lessons:
                lesson.order += 1
                lesson.save()
            
            serializer.save(course=course, order=new_order)

class AdminRemoveLessonView(DestroyAPIView):
    permission_classes = [IsAdmin]
    queryset = Lesson.objects.all()
    lookup_field = 'lesson_id'

    def perform_destroy(self, instance):
        course = instance.course
        deleted_order = instance.order

        with transaction.atomic():
            resources = LessonResource.objects.filter(lesson=instance)
            for resource in resources:
                if resource.file:
                    file_path = os.path.join(settings.MEDIA_ROOT, str(resource.file))
                    if os.path.exists(file_path):
                        os.remove(file_path)

            instance.delete()

            lessons_to_update = Lesson.objects.filter(
                course=course,
                order__gt=deleted_order
            ).order_by('order')

            for lesson in lessons_to_update:
                lesson.order -= 1
                lesson.save()

            all_lessons = Lesson.objects.filter(course=course).order_by('order')
            for index, lesson in enumerate(all_lessons, start=1):
                if lesson.order != index:
                    lesson.order = index
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

    def perform_destroy(self, instance):
        if instance.file:
            file_path = os.path.join(settings.MEDIA_ROOT, str(instance.file))
            if os.path.exists(file_path):
                os.remove(file_path)
            
        instance.delete()