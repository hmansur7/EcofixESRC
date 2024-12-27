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
from .models import (
    CourseProgress,
    LessonProgress,
    Lesson,
    AppUser,
    Course,
    Event,
    Registrations,
    LessonResource
)
from .serializers import (
    CourseProgressSerializer,
    LessonSerializer,
    UserSerializer,
    CourseSerializer,
    EventSerializer,
    UserRegisteredEventsListSerializer,
    LessonResourceSerializer
)
from .permissions import IsAdmin

class UserViewSet(viewsets.ModelViewSet):
    queryset = AppUser.objects.all()
    serializer_class = UserSerializer

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

class ListLessonResourcesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        resources = LessonResource.objects.all()
        serializer = LessonResourceSerializer(resources, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data
        name = data.get('name')
        email = data.get('email')
        password = data.get('password')

        if not all([name, email, password]):
            return Response({"error": "All fields are required!"}, 
                          status=status.HTTP_400_BAD_REQUEST)

        if AppUser.objects.filter(email=email).exists():
            return Response({"error": "Email is already taken!"}, 
                          status=status.HTTP_400_BAD_REQUEST)

        try:
            user = AppUser.objects.create(
                name=name,
                email=email,
                password=make_password(password)
            )
            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                "message": "User registered successfully!",
                "token": token.key
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": f"Registration failed: {str(e)}"}, 
                          status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        if not all([email, password]):
            return Response({"error": "Email and password are required."}, 
                          status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(request, email=email, password=password)
        if user:
            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                "token": token.key,
                "role": user.role
            }, status=status.HTTP_200_OK)
        return Response({"error": "Invalid email or password."}, 
                      status=status.HTTP_400_BAD_REQUEST)

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
    lookup_field = 'id'

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
        serializer.save(course=course)

class AdminRemoveLessonView(DestroyAPIView):
    permission_classes = [IsAdmin]
    queryset = Lesson.objects.all()
    lookup_field = 'id'

class AddLessonResourceView(CreateAPIView):
    permission_classes = [IsAdmin]
    queryset = LessonResource.objects.all()
    serializer_class = LessonResourceSerializer

class DeleteLessonResourceView(DestroyAPIView):
    permission_classes = [IsAdmin]
    queryset = LessonResource.objects.all()
    lookup_field = 'id'