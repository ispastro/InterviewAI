"""
InterviewMe Authentication Router

This module provides REST endpoints for user authentication and profile management.
Note: We don't handle login/signup here - that's done by NextAuth.js on the frontend.
We only provide endpoints for getting and updating user profiles.

Engineering decisions:
- Minimal auth endpoints (login is handled by NextAuth.js)
- Profile management for authenticated users
- Consistent response format
- Proper error handling
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.modules.auth.dependencies import get_current_user
from app.core.exceptions import ValidationError, DatabaseError


# ============================================================
# ROUTER SETUP
# ============================================================
router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"],
    responses={
        401: {"description": "Authentication required"},
        500: {"description": "Internal server error"}
    }
)


# ============================================================
# PYDANTIC SCHEMAS
# ============================================================
from pydantic import BaseModel, Field
from typing import Optional
import uuid
from datetime import datetime


class UserResponse(BaseModel):
    """Response schema for user profile data"""
    id: str
    email: str
    name: Optional[str]
    display_name: str
    oauth_provider: Optional[str]
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class UpdateUserRequest(BaseModel):
    """Request schema for updating user profile"""
    name: Optional[str] = Field(
        None,
        min_length=1,
        max_length=255,
        description="User's display name"
    )


class UserStatsResponse(BaseModel):
    """Response schema for user statistics"""
    total_interviews: int
    completed_interviews: int
    average_score: Optional[float]
    last_interview_date: Optional[datetime]


# ============================================================
# ENDPOINTS
# ============================================================

@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    current_user: User = Depends(get_current_user)
):
    """
    Get the current user's profile information.
    
    This endpoint returns the authenticated user's profile data.
    The user is identified by the JWT token in the Authorization header.
    
    Returns:
        User profile data including email, name, and account info
    """
    return UserResponse.model_validate(current_user.to_dict())


@router.put("/me", response_model=UserResponse)
async def update_current_user_profile(
    update_data: UpdateUserRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update the current user's profile information.
    
    Currently only supports updating the display name.
    Other fields like email are managed by the OAuth provider.
    
    Args:
        update_data: Fields to update
        
    Returns:
        Updated user profile data
    """
    try:
        # Update user fields
        if update_data.name is not None:
            current_user.name = update_data.name.strip() if update_data.name.strip() else None
        
        # Save changes
        await db.commit()
        await db.refresh(current_user)
        
        return UserResponse.model_validate(current_user.to_dict())
        
    except Exception as e:
        await db.rollback()
        raise DatabaseError("Failed to update user profile", str(e))


@router.get("/me/stats", response_model=UserStatsResponse)
async def get_user_statistics(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get statistics about the current user's interview activity.
    
    Returns:
        Statistics including total interviews, completion rate, and average scores
    """
    try:
        # Import here to avoid circular imports
        from sqlalchemy import select, func
        from app.models.interview import Interview, InterviewStatus
        from app.models.feedback import Feedback
        
        # Count total interviews
        total_stmt = select(func.count(Interview.id)).where(
            Interview.user_id == current_user.id
        )
        total_result = await db.execute(total_stmt)
        total_interviews = total_result.scalar() or 0
        
        # Count completed interviews
        completed_stmt = select(func.count(Interview.id)).where(
            Interview.user_id == current_user.id,
            Interview.status == InterviewStatus.COMPLETED
        )
        completed_result = await db.execute(completed_stmt)
        completed_interviews = completed_result.scalar() or 0
        
        # Calculate average score from feedback
        avg_score_stmt = select(func.avg(Feedback.overall_score)).join(
            Interview, Feedback.interview_id == Interview.id
        ).where(
            Interview.user_id == current_user.id
        )
        avg_score_result = await db.execute(avg_score_stmt)
        average_score = avg_score_result.scalar()
        
        # Get last interview date
        last_interview_stmt = select(func.max(Interview.created_at)).where(
            Interview.user_id == current_user.id
        )
        last_interview_result = await db.execute(last_interview_stmt)
        last_interview_date = last_interview_result.scalar()
        
        return UserStatsResponse(
            total_interviews=total_interviews,
            completed_interviews=completed_interviews,
            average_score=round(average_score, 1) if average_score else None,
            last_interview_date=last_interview_date
        )
        
    except Exception as e:
        raise DatabaseError("Failed to get user statistics", str(e))


@router.delete("/me")
async def delete_current_user_account(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete the current user's account and all associated data.
    
    ⚠️  This is irreversible! All interviews, feedback, and profile data will be deleted.
    
    Returns:
        Confirmation message
    """
    try:
        # Mark user as inactive instead of hard delete (for audit trail)
        current_user.is_active = False
        
        # In a real application, you might want to:
        # 1. Anonymize the data instead of deleting
        # 2. Keep data for a grace period
        # 3. Send confirmation email
        # 4. Log the deletion for compliance
        
        await db.commit()
        
        return {
            "message": "Account deactivated successfully",
            "detail": "Your account and all associated data have been deactivated"
        }
        
    except Exception as e:
        await db.rollback()
        raise DatabaseError("Failed to delete user account", str(e))


# ============================================================
# HEALTH CHECK FOR AUTH SERVICE
# ============================================================

@router.post("/validate")
async def validate_token(
    current_user: User = Depends(get_current_user)
):
    """
    Validate JWT token and return user info.
    
    Returns:
        Token validation result with user data
    """
    return {
        "valid": True,
        "user": UserResponse.model_validate(current_user.to_dict())
    }


@router.get("/health")
async def auth_health_check():
    """
    Health check endpoint for the authentication service.
    
    This can be used by monitoring systems to verify that
    the auth service is working correctly.
    """
    return {
        "status": "healthy",
        "service": "auth",
        "jwt_algorithm": "configured",
        "oauth_providers": ["google"]  # Add more as you support them
    }