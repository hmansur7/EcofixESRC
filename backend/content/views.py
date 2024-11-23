from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import ListAPIView, CreateAPIView, DestroyAPIView
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password
from django.contrib.auth import get_user_model
from .models import CourseProgress, LessonProgress, Lessons, User, Courses, Events, Registration
from .serializers import CourseProgressSerializer, LessonsSerializer, UserSerializer, CoursesSerializer, EventsSerializer, UserRegisteredEventsListSerializer
from .permissions import IsAdmin  # Import the custom permission class
from django.shortcuts import render, get_object_or_404, redirect
from django.contrib import messages
from .utils import calculate_course_progress

User = get_user_model()


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class CoursesViewSet(viewsets.ModelViewSet):
    queryset = Courses.objects.all()
    serializer_class = CoursesSerializer
    permission_classes = [IsAuthenticated]

class LessonsViewSet(viewsets.ModelViewSet):
    queryset = Lessons.objects.all()
    serializer_class = LessonsSerializer

class LessonsListView(APIView):
    def get(self, request, course_id):
        # Filter lessons by the provided course_id
        lessons = Lessons.objects.filter(course_id=course_id).order_by('order')
        serializer = LessonsSerializer(lessons, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class UpdateLessonProgressView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, lesson_id):
        user = request.user
        try:
            # Fetch the lesson
            lesson = Lessons.objects.get(lesson_id=lesson_id)
        except Lessons.DoesNotExist:
            return Response({"error": "Lesson not found."}, status=status.HTTP_404_NOT_FOUND)

        # Update or create lesson progress
        lesson_progress, _ = LessonProgress.objects.get_or_create(user=user, lesson=lesson)
        lesson_progress.completed = request.data.get('completed', False)
        lesson_progress.save()

        # Update course progress
        self.update_course_progress(user, lesson.course)

        return Response({"message": "Lesson progress updated successfully."}, status=status.HTTP_200_OK)

    def update_course_progress(self, user, course):
        # Get all lessons for this course
        lessons = Lessons.objects.filter(course=course)
        total_lessons = lessons.count()
        completed_lessons = LessonProgress.objects.filter(user=user, lesson__in=lessons, completed=True).count()

        # Calculate progress as a percentage
        progress_percentage = (completed_lessons / total_lessons) * 100 if total_lessons > 0 else 0

        # Update or create course progress record
        course_progress, _ = CourseProgress.objects.get_or_create(user=user, course=course)
        course_progress.progress_percentage = progress_percentage
        course_progress.save()

class GetCourseProgressView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, course_id):
        user = request.user
        try:
            course_progress = CourseProgress.objects.get(user=user, course_id=course_id)
            serializer = CourseProgressSerializer(course_progress)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except CourseProgress.DoesNotExist:
            return Response({"error": "Progress not found"}, status=status.HTTP_404_NOT_FOUND)

class CourseLessonsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, course_id, *args, **kwargs):
        lessons = Lessons.objects.filter(course_id=course_id)
        if not lessons.exists():
            return Response({"error": "No lessons found for this course."}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = LessonsSerializer(lessons, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class EventsViewSet(viewsets.ModelViewSet):
    queryset = Events.objects.all()
    serializer_class = EventsSerializer
    permission_classes = [IsAuthenticated]


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data
        name = data.get('name')
        email = data.get('email')
        password = data.get('password')

        if not name or not email or not password:
            return Response({"error": "All fields are required!"}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=email).exists():
            return Response({"error": "Email is already taken!"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.create_user(name=name, email=email, password=password)
            token, _ = Token.objects.get_or_create(user=user)
            return Response({"message": "User registered successfully!", "token": token.key}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": f"Registration failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class LoginView(APIView):
    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return Response({"error": "Email and password are required."}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(request, username=email, password=password)

        if user:
            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                "token": token.key,
                "role": user.role  # Include the user's role in the response
            }, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Invalid email or password."}, status=status.HTTP_400_BAD_REQUEST)


class EventListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        events = Events.objects.all()
        serializer = EventsSerializer(events, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class RegisterForEventView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, event_id):
        # Get the event object from the database
        event = Events.objects.filter(event_id=event_id).first()

        if not event:
            return Response({"error": "Event not found."}, status=status.HTTP_404_NOT_FOUND)

        # Check if the user is already registered for this event
        if Registration.objects.filter(user=request.user, event=event).exists():
            return Response({"error": "You are already registered for this event."}, status=status.HTTP_400_BAD_REQUEST)

        # Create the registration record
        registration = Registration.objects.create(user=request.user, event=event)

        # Return success response
        return Response({"message": "You have successfully registered for the event."}, status=status.HTTP_201_CREATED)

class UserRegisteredEventsListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        registered_events = Registration.objects.filter(user=request.user)
        events = [registration.event for registration in registered_events]
        serializer = UserRegisteredEventsListSerializer(events, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class UnregisterFromEventView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, event_id):
        try:
            # Find the registration for the user and event
            registration = Registration.objects.filter(user=request.user, event__event_id=event_id).first()

            if not registration:
                return Response({"error": "You are not registered for this event."}, status=status.HTTP_400_BAD_REQUEST)

            # Delete the registration
            registration.delete()
            return Response({"message": "You have successfully unregistered from the event."}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
# Admin Views
class AdminUserListView(ListAPIView):
    """
    Admin-only view to list all registered users.
    """
    permission_classes = [IsAdmin]
    queryset = User.objects.all()
    serializer_class = UserSerializer

class AdminListCoursesView(ListAPIView):
    permission_classes = [IsAdmin]
    queryset = Courses.objects.all()
    serializer_class = CoursesSerializer

class AdminListEventsView(ListAPIView):
    permission_classes = [IsAdmin]
    queryset = Events.objects.all()
    serializer_class = EventsSerializer

class AdminAddCourseView(CreateAPIView):
    """
    Admin-only view to add a course.
    """
    permission_classes = [IsAdmin]
    queryset = Courses.objects.all()
    serializer_class = CoursesSerializer


class AdminRemoveCourseView(DestroyAPIView):
    """
    Admin-only view to remove a course by course_id.
    """
    permission_classes = [IsAdmin]
    queryset = Courses.objects.all()
    serializer_class = CoursesSerializer
    lookup_field = 'course_id'  


class AdminAddEventView(CreateAPIView):
    """
    Admin-only view to add an event.
    """
    permission_classes = [IsAdmin]
    queryset = Events.objects.all()
    serializer_class = EventsSerializer


class AdminRemoveEventView(DestroyAPIView):
    """
    Admin-only view to remove an event by event_id.
    """
    permission_classes = [IsAdmin]
    queryset = Events.objects.all()
    serializer_class = EventsSerializer
    lookup_field = 'event_id'  

class AdminEventRegistrationsView(APIView):
    permission_classes = [IsAdmin]  # Ensure only admins can access

    def get(self, request, event_id, *args, **kwargs):
        # Check if the event exists
        event = Events.objects.filter(event_id=event_id).first()
        if not event:
            return Response({"error": "Event not found."}, status=status.HTTP_404_NOT_FOUND)

        # Get registrations for the event
        registrations = Registration.objects.filter(event=event).select_related('user')
        users = [registration.user for registration in registrations]

        # Serialize user data
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class AdminAddLessonView(CreateAPIView):
    """
    Admin-only view to add a lesson to a course.
    """
    permission_classes = [IsAdmin]
    queryset = Lessons.objects.all()
    serializer_class = LessonsSerializer

    def perform_create(self, serializer):
        course_id = self.request.data.get("course_id")
        course = get_object_or_404(Courses, course_id=course_id)
        serializer.save(course=course)


class AdminRemoveLessonView(DestroyAPIView):
    """
    Admin-only view to remove a lesson by lesson_id.
    """
    permission_classes = [IsAdmin]
    queryset = Lessons.objects.all()
    serializer_class = LessonsSerializer
    lookup_field = 'lesson_id'