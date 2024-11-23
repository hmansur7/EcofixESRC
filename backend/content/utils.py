from .models import CourseProgress, LessonProgress

def calculate_course_progress(user, course):
    lessons = course.lessons.all()
    total_lessons = lessons.count()
    completed_lessons = LessonProgress.objects.filter(user=user, lesson__in=lessons, completed=True).count()

    progress_percentage = (completed_lessons / total_lessons) * 100 if total_lessons > 0 else 0

    course_progress, created = CourseProgress.objects.get_or_create(user=user, course=course)
    course_progress.progress_percentage = progress_percentage
    course_progress.save()
