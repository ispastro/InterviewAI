"""
Test WebSocket Error Handling Fix
Verifies that the "WebSocket is not connected" bug is resolved
"""
import asyncio
import pytest
from fastapi.testclient import TestClient
from fastapi.websockets import WebSocket
from unittest.mock import Mock, AsyncMock, patch
from app.modules.websocket.connection_manager import ConnectionManager, SessionStatus, MessageType
from app.modules.websocket.routes import handle_websocket_message
import json


def test_connection_manager_send_message_to_nonexistent_session():
    """Test that sending to non-existent session doesn't crash"""
    manager = ConnectionManager()
    
    # This should not raise an exception
    asyncio.run(manager.send_message("fake-session-id", {"type": "test", "data": {}}))
    print("✅ Test 1 passed: send_message handles non-existent session gracefully")


def test_connection_manager_send_error_to_nonexistent_session():
    """Test that sending error to non-existent session doesn't crash"""
    manager = ConnectionManager()
    
    # This should not raise an exception
    asyncio.run(manager.send_error("fake-session-id", "Test error", "TEST_ERROR"))
    print("✅ Test 2 passed: send_error handles non-existent session gracefully")


@pytest.mark.asyncio
async def test_send_message_with_closed_websocket():
    """Test that sending to closed WebSocket doesn't crash"""
    manager = ConnectionManager()
    
    # Create a mock WebSocket that's closed
    mock_websocket = Mock(spec=WebSocket)
    mock_websocket.client_state = Mock()
    mock_websocket.client_state.value = 3  # CLOSED state
    mock_websocket.send_text = AsyncMock(side_effect=RuntimeError("WebSocket is not connected"))
    
    # Manually add to active connections
    session_id = "test-session-123"
    manager.active_connections[session_id] = mock_websocket
    
    # This should not raise an exception
    await manager.send_message(session_id, {"type": "test", "data": {}})
    
    # Session should be removed from active connections
    assert session_id not in manager.active_connections
    print("✅ Test 3 passed: send_message handles closed WebSocket gracefully")


@pytest.mark.asyncio
async def test_send_message_with_runtime_error():
    """Test that RuntimeError during send is handled"""
    manager = ConnectionManager()
    
    # Create a mock WebSocket that raises RuntimeError
    mock_websocket = Mock(spec=WebSocket)
    mock_websocket.client_state = Mock()
    mock_websocket.client_state.value = 1  # OPEN state
    mock_websocket.send_text = AsyncMock(side_effect=RuntimeError("WebSocket is not connected. Need to call 'accept' first."))
    
    # Manually add to active connections
    session_id = "test-session-456"
    manager.active_connections[session_id] = mock_websocket
    
    # This should not raise an exception
    await manager.send_message(session_id, {"type": "test", "data": {}})
    
    # Session should be removed from active connections
    assert session_id not in manager.active_connections
    print("✅ Test 4 passed: RuntimeError during send is caught and handled")


@pytest.mark.asyncio
async def test_handle_websocket_message_with_invalid_session():
    """Test that message handler doesn't crash with invalid session"""
    from app.modules.websocket.connection_manager import connection_manager
    
    # Mock database session
    mock_db = AsyncMock()
    
    # Try to handle message for non-existent session
    message = {
        "type": "start_interview",
        "data": {}
    }
    
    # This should not raise an exception
    await handle_websocket_message("non-existent-session", message, mock_db)
    print("✅ Test 5 passed: Message handler handles non-existent session gracefully")


@pytest.mark.asyncio
async def test_error_handling_cascade():
    """Test that errors during error handling don't cause cascading failures"""
    manager = ConnectionManager()
    
    # Create a mock WebSocket that always fails
    mock_websocket = Mock(spec=WebSocket)
    mock_websocket.client_state = Mock()
    mock_websocket.client_state.value = 1  # OPEN state
    mock_websocket.send_text = AsyncMock(side_effect=Exception("Connection lost"))
    
    # Manually add to active connections
    session_id = "test-session-789"
    manager.active_connections[session_id] = mock_websocket
    
    # Try to send error (which will fail)
    await manager.send_error(session_id, "Original error", "TEST_ERROR")
    
    # Session should be cleaned up
    assert session_id not in manager.active_connections
    print("✅ Test 6 passed: Error handling doesn't cause cascading failures")


def run_all_tests():
    """Run all tests"""
    print("\n" + "="*60)
    print("Testing WebSocket Error Handling Fix")
    print("="*60 + "\n")
    
    # Run synchronous tests
    test_connection_manager_send_message_to_nonexistent_session()
    test_connection_manager_send_error_to_nonexistent_session()
    
    # Run async tests
    asyncio.run(test_send_message_with_closed_websocket())
    asyncio.run(test_send_message_with_runtime_error())
    asyncio.run(test_handle_websocket_message_with_invalid_session())
    asyncio.run(test_error_handling_cascade())
    
    print("\n" + "="*60)
    print("✅ ALL TESTS PASSED - Bug is fixed!")
    print("="*60 + "\n")


if __name__ == "__main__":
    run_all_tests()
