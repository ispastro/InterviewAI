"""
Tests for Prompt Compression Module

Run with: python -m pytest backend/tests/test_prompt_compression.py -v
"""

import pytest
from app.modules.llm.prompt_compressor import PromptCompressor, get_compressor


# Sample test data
SAMPLE_CV_ANALYSIS = {
    "candidate_name": "John Doe",
    "years_of_experience": 5,
    "current_role": "Senior Backend Engineer",
    "seniority_level": "senior",
    "skills": {
        "technical": [
            "Python", "FastAPI", "Django", "Flask", "PostgreSQL",
            "Redis", "Docker", "Kubernetes", "AWS", "Terraform",
            "JavaScript", "React", "Node.js", "MongoDB", "GraphQL"
        ],
        "soft": ["Leadership", "Communication", "Problem-solving"]
    },
    "experience": [
        {
            "role": "Senior Backend Engineer",
            "company": "TechCorp Inc",
            "duration": "2020-2024",
            "key_achievements": [
                "Led migration of monolith to microservices",
                "Reduced API latency by 60%"
            ],
            "technologies_used": ["Python", "FastAPI", "PostgreSQL", "Redis", "Docker"]
        },
        {
            "role": "Backend Engineer",
            "company": "StartupXYZ",
            "duration": "2018-2020",
            "key_achievements": ["Built REST API from scratch"],
            "technologies_used": ["Python", "Django", "MySQL"]
        }
    ]
}

SAMPLE_JD_ANALYSIS = {
    "role_title": "Senior Backend Engineer",
    "company": "TechStartup",
    "seniority_level": "senior",
    "required_skills": [
        "Python", "FastAPI", "PostgreSQL", "Redis",
        "Docker", "Kubernetes", "AWS", "Microservices"
    ],
    "interview_focus_areas": [
        "System Design", "API Design", "Database Optimization"
    ]
}

SAMPLE_CONVERSATION_HISTORY = [
    {
        "turn_number": 1,
        "question": "Tell me about your experience with Python async/await.",
        "response": "I've used it extensively in my last project where we built a web scraper that needed to fetch data from 100+ APIs concurrently. I used asyncio with aiohttp to make non-blocking requests.",
        "evaluation": {
            "overall_score": 8.5,
            "strengths": ["Good technical depth", "Specific example"],
            "areas_for_improvement": ["Could mention error handling"]
        },
        "focus_area": "async_programming"
    },
    {
        "turn_number": 2,
        "question": "How would you design a distributed task queue?",
        "response": "I would use Redis as the message broker with a pub/sub pattern. Workers would subscribe to job queues and process tasks asynchronously.",
        "evaluation": {
            "overall_score": 7.5,
            "strengths": ["Clear architecture"],
            "areas_for_improvement": ["Missing reliability considerations"]
        },
        "focus_area": "system_design"
    }
]

SAMPLE_PERFORMANCE = {
    "average_score": 8.0,
    "score_trend": "improving",
    "technical_depth_avg": 8.2,
    "communication_clarity_avg": 7.8,
    "confidence_level": "high"
}


class TestPromptCompressor:
    """Test suite for PromptCompressor"""
    
    def test_initialization(self):
        """Test compressor initialization"""
        compressor = PromptCompressor(compression_level=0.7)
        assert compressor.compression_level == 0.7
        assert compressor.enable_metrics is True
        assert compressor.metrics is not None
    
    def test_cv_compression(self):
        """Test CV analysis compression"""
        compressor = PromptCompressor()
        
        compressed = compressor.compress_cv_analysis(
            SAMPLE_CV_ANALYSIS,
            focus_area="python",
            turn_number=1
        )
        
        # Check essential fields are present
        assert "years_exp" in compressed
        assert "seniority" in compressed
        assert "skills" in compressed
        
        # Check compression (should have fewer skills than original)
        assert len(compressed["skills"]) <= 12
        assert len(compressed["skills"]) < len(SAMPLE_CV_ANALYSIS["skills"]["technical"])
    
    def test_jd_compression(self):
        """Test JD analysis compression"""
        compressor = PromptCompressor()
        
        compressed = compressor.compress_jd_analysis(
            SAMPLE_JD_ANALYSIS,
            focus_area="system_design",
            turn_number=1
        )
        
        # Check essential fields
        assert "role" in compressed
        assert "seniority" in compressed
        assert "required" in compressed
        
        # Check compression
        assert len(compressed["required"]) <= 8
    
    def test_history_compression(self):
        """Test conversation history compression"""
        compressor = PromptCompressor()
        
        compressed = compressor.compress_conversation_history(
            SAMPLE_CONVERSATION_HISTORY,
            max_turns=3
        )
        
        # Check structure
        assert len(compressed) <= 3
        assert all("q" in turn for turn in compressed)
        assert all("a" in turn for turn in compressed)
        assert all("score" in turn for turn in compressed)
        
        # Check truncation
        for turn in compressed:
            assert len(turn["q"]) <= 150
            assert len(turn["a"]) <= 250
    
    def test_performance_compression(self):
        """Test performance summary compression"""
        compressor = PromptCompressor()
        
        compressed = compressor.compress_performance_summary(SAMPLE_PERFORMANCE)
        
        # Check essential metrics
        assert "avg" in compressed
        assert "trend" in compressed
        assert "tech" in compressed
        assert "comm" in compressed
        assert "conf" in compressed
        
        # Check values are rounded
        assert isinstance(compressed["avg"], float)
        assert compressed["avg"] == 8.0
    
    def test_full_prompt_compression(self):
        """Test full prompt building with compression"""
        compressor = PromptCompressor(compression_level=0.7, enable_metrics=True)
        
        prompt = compressor.build_compressed_prompt(
            cv_analysis=SAMPLE_CV_ANALYSIS,
            jd_analysis=SAMPLE_JD_ANALYSIS,
            conversation_history=SAMPLE_CONVERSATION_HISTORY,
            focus_area="system_design",
            performance_summary=SAMPLE_PERFORMANCE,
            current_turn=3,
            detected_patterns={
                "strengths": ["Strong Python skills", "Good system design"],
                "weaknesses": ["Needs more depth in Kubernetes"],
                "red_flags": []
            },
            uncovered_topics=["Database Optimization", "API Design"]
        )
        
        # Check prompt is a string
        assert isinstance(prompt, str)
        assert len(prompt) > 0
        
        # Check key sections are present
        assert "CANDIDATE:" in prompt
        assert "ROLE:" in prompt
        assert "PERFORMANCE:" in prompt
        assert "RECENT:" in prompt
        assert "FOCUS:" in prompt
        
        # Check metrics were tracked
        metrics = compressor.get_metrics()
        assert metrics["enabled"] is True
        assert metrics["total_calls"] == 1
        assert metrics["compression_ratio"] > 0
    
    def test_compression_ratio(self):
        """Test that compression actually reduces token count"""
        compressor = PromptCompressor(compression_level=0.7, enable_metrics=True)
        
        prompt = compressor.build_compressed_prompt(
            cv_analysis=SAMPLE_CV_ANALYSIS,
            jd_analysis=SAMPLE_JD_ANALYSIS,
            conversation_history=SAMPLE_CONVERSATION_HISTORY,
            focus_area="python",
            performance_summary=SAMPLE_PERFORMANCE,
            current_turn=1
        )
        
        metrics = compressor.get_metrics()
        
        # Check compression is significant (should be > 40%)
        assert metrics["compression_ratio"] > 40
        assert metrics["compressed_tokens"] < metrics["original_tokens"]
        
        # Check token savings
        assert metrics["total_tokens_saved"] > 0
        
        print(f"\n✅ Compression Test Results:")
        print(f"   Original tokens: {metrics['original_tokens']}")
        print(f"   Compressed tokens: {metrics['compressed_tokens']}")
        print(f"   Compression ratio: {metrics['compression_ratio']:.1f}%")
        print(f"   Tokens saved: {metrics['total_tokens_saved']}")
        print(f"   Estimated cost saved: ${metrics['estimated_cost_saved_usd']:.4f}")
    
    def test_dynamic_compression_by_turn(self):
        """Test that compression increases with turn number"""
        compressor = PromptCompressor()
        
        # Early turn (turn 1)
        compressed_early = compressor.compress_cv_analysis(
            SAMPLE_CV_ANALYSIS,
            turn_number=1
        )
        
        # Late turn (turn 8)
        compressed_late = compressor.compress_cv_analysis(
            SAMPLE_CV_ANALYSIS,
            turn_number=8
        )
        
        # Late turns should have fewer items
        assert len(compressed_late.get("skills", [])) <= len(compressed_early.get("skills", []))
    
    def test_focus_based_compression(self):
        """Test that focus area affects compression"""
        compressor = PromptCompressor()
        
        # With focus area
        compressed_with_focus = compressor.compress_cv_analysis(
            SAMPLE_CV_ANALYSIS,
            focus_area="python"
        )
        
        # Without focus area
        compressed_without_focus = compressor.compress_cv_analysis(
            SAMPLE_CV_ANALYSIS,
            focus_area=None
        )
        
        # With focus should have additional context
        if "focus_context" in compressed_with_focus:
            assert len(compressed_with_focus["focus_context"]) > 0
    
    def test_metrics_tracking(self):
        """Test metrics tracking across multiple calls"""
        compressor = PromptCompressor(enable_metrics=True)
        
        # Make multiple calls
        for i in range(5):
            compressor.build_compressed_prompt(
                cv_analysis=SAMPLE_CV_ANALYSIS,
                jd_analysis=SAMPLE_JD_ANALYSIS,
                conversation_history=SAMPLE_CONVERSATION_HISTORY,
                focus_area="python",
                performance_summary=SAMPLE_PERFORMANCE,
                current_turn=i + 1
            )
        
        metrics = compressor.get_metrics()
        
        # Check metrics accumulated
        assert metrics["total_calls"] == 5
        assert metrics["original_tokens"] > 0
        assert metrics["compressed_tokens"] > 0
        assert len(metrics["recent_compressions"]) == 5
    
    def test_singleton_pattern(self):
        """Test get_compressor singleton"""
        compressor1 = get_compressor()
        compressor2 = get_compressor()
        
        # Should be the same instance
        assert compressor1 is compressor2
    
    def test_empty_inputs(self):
        """Test handling of empty inputs"""
        compressor = PromptCompressor()
        
        # Empty CV
        compressed_cv = compressor.compress_cv_analysis({})
        assert compressed_cv == {}
        
        # Empty JD
        compressed_jd = compressor.compress_jd_analysis({})
        assert compressed_jd == {}
        
        # Empty history
        compressed_history = compressor.compress_conversation_history([])
        assert compressed_history == []
        
        # Empty performance
        compressed_perf = compressor.compress_performance_summary({})
        assert compressed_perf == {}


if __name__ == "__main__":
    # Run tests
    pytest.main([__file__, "-v", "--tb=short"])
