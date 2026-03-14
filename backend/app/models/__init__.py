"""
InterviewMe Models Package

This module imports all database models to ensure proper relationship
resolution and makes them available for import throughout the application.

Import order matters for SQLAlchemy relationships - base models first,
then models with foreign keys.
"""

# Import base models first
from app.models.user import User

# Import models with foreign keys
from app.models.interview import Interview, Turn, InterviewStatus, InterviewPhase
from app.models.feedback import Feedback

# Export all models for easy importing
__all__ = [
    "User",
    "Interview", 
    "Turn",
    "Feedback",
    "InterviewStatus",
    "InterviewPhase",
]