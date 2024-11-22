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
from .models import User, Courses, CourseProgress, Events, Lessons, LessonProgress
from .serializers import UserSerializer, CoursesSerializer, LessonProgressSerializer, CourseProgressSerializer, EventsSerializer, LessonsSerializer
from .permissions import IsAdmin  # Import the custom permission class

User = get_user_model()


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer


class CoursesViewSet(viewsets.ModelViewSet):
    queryset = Courses.objects.all()
    serializer_class = CoursesSerializer
    permission_classes = [IsAuthenticated]


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
    def post(self, request, lesson_id):
        user = request.user
        lesson = Lessons.objects.get(id=lesson_id)
        
        # Create or update the lesson progress for the user
        lesson_progress, created = LessonProgress.objects.get_or_create(user=user, lesson=lesson)
        lesson_progress.completed = request.data.get('completed', False)
        lesson_progress.save()
        
        # Update the course progress percentage
        self.update_course_progress(user, lesson.course)

        return Response({"message": "Progress updated successfully"}, status=status.HTTP_200_OK)

    def update_course_progress(self, user, course):
        # Get all lessons for this course
        lessons = Lessons.objects.filter(course=course)
        total_lessons = lessons.count()
        completed_lessons = LessonProgress.objects.filter(user=user, lesson__in=lessons, completed=True).count()
        
        # Calculate progress as percentage
        progress_percentage = (completed_lessons / total_lessons) * 100 if total_lessons > 0 else 0
        
        # Update or create course progress record
        course_progress, created = CourseProgress.objects.get_or_create(user=user, course=course)
        course_progress.progress_percentage = progress_percentage
        course_progress.save()

class GetCourseProgressView(APIView):
    def get(self, request, course_id):
        user = request.user
        try:
            course_progress = CourseProgress.objects.get(user=user, course_id=course_id)
            serializer = CourseProgressSerializer(course_progress)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except CourseProgress.DoesNotExist:
            return Response({"error": "Progress not found"}, status=status.HTTP_404_NOT_FOUND)

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
