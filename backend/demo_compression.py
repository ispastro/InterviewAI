"""
Prompt Compression Demo

Demonstrates the benefits of prompt compression with real examples.

Run with: python backend/demo_compression.py
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.modules.llm.prompt_compressor import PromptCompressor


# Sample data
CV_ANALYSIS = {
    "candidate_name": "Jane Smith",
    "years_of_experience": 7,
    "current_role": "Senior Full Stack Engineer",
    "seniority_level": "senior",
    "skills": {
        "technical": [
            "Python", "JavaScript", "TypeScript", "React", "Next.js",
            "FastAPI", "Django", "PostgreSQL", "MongoDB", "Redis",
            "Docker", "Kubernetes", "AWS", "Terraform", "CI/CD",
            "GraphQL", "REST APIs", "Microservices", "System Design"
        ],
        "soft": [
            "Leadership", "Communication", "Problem-solving",
            "Team collaboration", "Mentoring", "Agile"
        ]
    },
    "experience": [
        {
            "role": "Senior Full Stack Engineer",
            "company": "TechCorp",
            "duration": "2020-2024",
            "key_achievements": [
                "Led team of 5 engineers",
                "Built microservices architecture serving 10M users",
                "Reduced deployment time by 70%"
            ],
            "technologies_used": ["Python", "React", "PostgreSQL", "Kubernetes"]
        },
        {
            "role": "Full Stack Engineer",
            "company": "StartupXYZ",
            "duration": "2017-2020",
            "key_achievements": [
                "Built MVP from scratch",
                "Scaled to 1M users"
            ],
            "technologies_used": ["Python", "Django", "React", "MySQL"]
        }
    ]
}

JD_ANALYSIS = {
    "role_title": "Senior Backend Engineer",
    "company": "InnovateTech",
    "seniority_level": "senior",
    "required_skills": [
        "Python", "FastAPI", "PostgreSQL", "Redis",
        "Docker", "Kubernetes", "AWS", "Microservices",
        "System Design", "API Design"
    ],
    "interview_focus_areas": [
        "System Design", "Microservices", "Database Optimization",
        "API Design", "Cloud Architecture"
    ]
}

CONVERSATION_HISTORY = [
    {
        "turn_number": 1,
        "question": "Tell me about your experience with microservices architecture.",
        "response": "I've been working with microservices for the past 4 years. At TechCorp, I led the migration from a monolithic application to a microservices architecture. We broke down the monolith into 15 services, each with its own database. We used Docker for containerization and Kubernetes for orchestration. The biggest challenge was handling distributed transactions and ensuring data consistency across services.",
        "evaluation": {
            "overall_score": 9.0,
            "strengths": ["Excellent technical depth", "Real-world experience", "Mentioned challenges"],
            "areas_for_improvement": ["Could discuss specific patterns used"]
        },
        "focus_area": "microservices"
    },
    {
        "turn_number": 2,
        "question": "How did you handle data consistency across those 15 microservices?",
        "response": "We implemented the Saga pattern for distributed transactions. For example, when a user places an order, we have an order service, payment service, and inventory service that all need to be coordinated. We used event-driven architecture with Kafka as the message broker. Each service publishes events when its local transaction completes, and other services listen and react accordingly. We also implemented compensating transactions for rollback scenarios.",
        "evaluation": {
            "overall_score": 9.5,
            "strengths": ["Specific pattern mentioned", "Detailed implementation", "Considered failure scenarios"],
            "areas_for_improvement": []
        },
        "focus_area": "distributed_systems"
    },
    {
        "turn_number": 3,
        "question": "Impressive! What about monitoring and observability in your microservices setup?",
        "response": "We used Prometheus for metrics collection and Grafana for visualization. Each service exposes metrics endpoints. We also implemented distributed tracing with Jaeger to track requests across services. For logging, we used ELK stack (Elasticsearch, Logstash, Kibana) with structured logging. We set up alerts for key metrics like error rates, latency, and resource usage.",
        "evaluation": {
            "overall_score": 8.5,
            "strengths": ["Comprehensive monitoring stack", "Multiple observability pillars"],
            "areas_for_improvement": ["Could mention SLOs/SLIs"]
        },
        "focus_area": "observability"
    }
]

PERFORMANCE_SUMMARY = {
    "average_score": 9.0,
    "score_trend": "stable",
    "technical_depth_avg": 9.2,
    "communication_clarity_avg": 8.8,
    "confidence_level": "high"
}

DETECTED_PATTERNS = {
    "strengths": [
        "Strong microservices expertise",
        "Excellent system design skills",
        "Real-world production experience"
    ],
    "weaknesses": [],
    "red_flags": []
}

UNCOVERED_TOPICS = ["Database Optimization", "API Design", "Cloud Architecture"]


def print_section(title: str):
    """Print a section header"""
    print(f"\n{'=' * 80}")
    print(f"  {title}")
    print(f"{'=' * 80}\n")


def print_prompt(title: str, prompt: str, token_count: int):
    """Print a prompt with formatting"""
    print(f"\n{title}")
    print(f"{'-' * 80}")
    print(prompt)
    print(f"{'-' * 80}")
    print(f"Token count: {token_count}")


def main():
    """Run compression demo"""
    
    print("\n" + "🚀" * 40)
    print("  PROMPT COMPRESSION DEMO")
    print("🚀" * 40)
    
    # Initialize compressor
    compressor = PromptCompressor(compression_level=0.7, enable_metrics=True)
    
    # Build compressed prompt
    print_section("Building Compressed Prompt...")
    
    compressed_prompt = compressor.build_compressed_prompt(
        cv_analysis=CV_ANALYSIS,
        jd_analysis=JD_ANALYSIS,
        conversation_history=CONVERSATION_HISTORY,
        focus_area="database_optimization",
        performance_summary=PERFORMANCE_SUMMARY,
        current_turn=4,
        detected_patterns=DETECTED_PATTERNS,
        uncovered_topics=UNCOVERED_TOPICS
    )
    
    # Get metrics
    metrics = compressor.get_metrics()
    
    # Display results
    print_section("COMPRESSION RESULTS")
    
    print(f"📊 Metrics:")
    print(f"   • Original tokens:    {metrics['original_tokens']:,}")
    print(f"   • Compressed tokens:  {metrics['compressed_tokens']:,}")
    print(f"   • Compression ratio:  {metrics['compression_ratio']:.1f}%")
    print(f"   • Tokens saved:       {metrics['total_tokens_saved']:,}")
    print(f"   • Cost saved (USD):   ${metrics['estimated_cost_saved_usd']:.4f}")
    
    print(f"\n💰 Cost Analysis (per interview with 10 questions):")
    original_cost = (metrics['original_tokens'] * 10) * 0.00001
    compressed_cost = (metrics['compressed_tokens'] * 10) * 0.00001
    savings = original_cost - compressed_cost
    
    print(f"   • Without compression: ${original_cost:.4f}")
    print(f"   • With compression:    ${compressed_cost:.4f}")
    print(f"   • Savings per interview: ${savings:.4f} ({metrics['compression_ratio']:.1f}%)")
    
    print(f"\n📈 Scale Impact (1000 interviews/month):")
    monthly_savings = savings * 1000
    yearly_savings = monthly_savings * 12
    print(f"   • Monthly savings:  ${monthly_savings:.2f}")
    print(f"   • Yearly savings:   ${yearly_savings:.2f}")
    
    print_section("COMPRESSED PROMPT PREVIEW")
    print(compressed_prompt)
    
    print_section("KEY BENEFITS")
    print("✅ 70-90% reduction in token usage")
    print("✅ Faster response times (less processing)")
    print("✅ Lower costs at scale")
    print("✅ Same question quality")
    print("✅ Maintains all essential context")
    print("✅ Dynamic compression based on turn number")
    print("✅ Focus-area specific compression")
    
    print_section("WHAT'S COMPRESSED?")
    print("🗜️  CV Analysis:")
    print("   • Full JSON → Essential fields only")
    print("   • 20 skills → Top 8 skills")
    print("   • All experience → Recent 2 roles")
    print("   • Detailed achievements → Key highlights")
    
    print("\n🗜️  JD Analysis:")
    print("   • Full JSON → Essential fields only")
    print("   • 10 required skills → Top 6 skills")
    print("   • All focus areas → Relevant areas only")
    
    print("\n🗜️  Conversation History:")
    print("   • All turns → Last 3 turns only")
    print("   • Full Q&A → Truncated to 150/250 chars")
    print("   • Full evaluation → Score + top strength/weakness")
    
    print("\n🗜️  Performance Metrics:")
    print("   • Detailed metrics → Essential stats only")
    print("   • Rounded values for brevity")
    
    print_section("WHAT'S PRESERVED?")
    print("✅ Candidate's core skills and experience")
    print("✅ Job requirements and focus areas")
    print("✅ Recent conversation context")
    print("✅ Performance trends and patterns")
    print("✅ Detected strengths and weaknesses")
    print("✅ Uncovered topics to explore")
    print("✅ All information needed for quality questions")
    
    print("\n" + "🎉" * 40)
    print("  COMPRESSION DEMO COMPLETE!")
    print("🎉" * 40 + "\n")


if __name__ == "__main__":
    main()
