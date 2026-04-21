export const STATIC_AGENT_CONFIGS: Record<string, Record<string, unknown>> = {
  "breakdown-engine": {
    "name": "Breakdown Engine",
    "description": "AI-powered engine for breaking down clarified ideas into structured deliverables and tasks",
    "model": "gpt-4",
    "temperature": 0.3,
    "max_tokens": 4000,
    "estimation_model": "gpt-3.5-turbo",
    "dependency_threshold": 0.7,
    "prompts": {
      "idea_analysis": "You are an expert project analyst and systems architect. Analyze the following clarified idea and extract key components.\n\nConsider the user's responses to clarifying questions to understand context, constraints, and requirements.\n\nProvide a comprehensive analysis including:\n1. Main objectives (3-5 specific, measurable goals)\n2. Key deliverables (5-10 concrete outputs)  \n3. Technical complexity assessment (1-10 scale with factors)\n4. Estimated scope (size and duration)\n5. Risk factors with impact and probability\n6. Success criteria (measurable outcomes)\n\nFor each item, include a confidence score (0-1) indicating certainty.\n\nBe specific, realistic, and consider typical project constraints.\n",
      "task_decomposition": "You are an expert project manager with experience in agile and waterfall methodologies.\n\nBreak down the deliverable into specific, actionable tasks that can be completed by a single person or small team.\n\nEach task should:\n- Start with a strong action verb (Design, Develop, Test, Implement, etc.)\n- Be specific and measurable\n- Have a clear definition of done\n- Estimate between 1-40 hours\n- Identify required skills and expertise\n- Note logical dependencies on other tasks\n\nConsider the project complexity and team size when determining task granularity.\n",
      "dependency_analysis": "You are a project scheduling expert specializing in dependency management and critical path analysis.\n\nAnalyze the task list and identify:\n1. Finish-to-start dependencies (most common)\n2. Start-to-start dependencies (parallel work)\n3. Any circular dependencies that need resolution\n4. Critical path items that determine project duration\n5. Opportunities for parallel execution\n\nConsider technical dependencies, resource constraints, and logical workflow.\n",
      "estimation": "You are an experienced project estimator using multiple estimation techniques.\n\nProvide three-point estimates for each task:\n- Optimistic: Best case scenario (10% probability)\n- Most likely: Normal case (60% probability)  \n- Pessimistic: Worst case scenario (10% probability)\n\nConsider:\n- Task complexity and uncertainty\n- Team experience and skill level\n- Historical data from similar projects\n- Risk factors and external dependencies\n- Communication overhead\n- Testing and validation time\n\nUse PERT formula: (Optimistic + 4 × Most Likely + Pessimistic) ÷ 6\n"
    },
    "patterns": {
      "software_development": {
        "phases": [
          "Discovery",
          "Design",
          "Development",
          "Testing",
          "Deployment"
        ],
        "typical_deliverables": [
          "Requirements",
          "Architecture",
          "Code",
          "Tests",
          "Documentation"
        ],
        "task_complexity_factors": [
          "technical_complexity",
          "team_size",
          "integration_points"
        ]
      },
      "marketing_campaign": {
        "phases": [
          "Research",
          "Strategy",
          "Content Creation",
          "Launch",
          "Analysis"
        ],
        "typical_deliverables": [
          "Research Report",
          "Strategy Document",
          "Creative Assets",
          "Campaign Results"
        ],
        "task_complexity_factors": [
          "channel_complexity",
          "content_volume",
          "target_audience_size"
        ]
      },
      "product_launch": {
        "phases": [
          "Market Research",
          "Product Development",
          "Marketing",
          "Sales Prep",
          "Launch"
        ],
        "typical_deliverables": [
          "Market Analysis",
          "Product MVP",
          "Marketing Materials",
          "Sales Training"
        ],
        "task_complexity_factors": [
          "product_complexity",
          "market_competition",
          "sales_channels"
        ]
      }
    },
    "risk_matrix": {
      "probability_levels": {
        "very_low": 0.1,
        "low": 0.3,
        "medium": 0.5,
        "high": 0.7,
        "very_high": 0.9
      },
      "impact_levels": {
        "very_low": 1,
        "low": 2,
        "medium": 3,
        "high": 4,
        "very_high": 5
      }
    },
    "priority_weights": {
      "business_value": 0.4,
      "urgency": 0.2,
      "effort": 0.2,
      "dependencies": 0.1,
      "risk": 0.1
    },
    "estimation": {
      "default_team_velocity": 40,
      "buffer_percentage": 0.2,
      "max_task_hours": 40,
      "min_task_hours": 1
    },
    "confidence_thresholds": {
      "high": 0.8,
      "medium": 0.6,
      "low": 0.4
    }
  },
  "clarifier": {
    "name": "clarifier",
    "description": "AI agent responsible for clarifying user ideas and requirements",
    "model": "gpt-4",
    "temperature": 0.7,
    "max_tokens": 2000,
    "functions": [
      {
        "name": "clarify_idea",
        "description": "Clarify and expand on user's initial idea",
        "parameters": {
          "type": "object",
          "properties": {
            "idea": {
              "type": "string",
              "description": "Original user idea"
            },
            "questions": {
              "type": "array",
              "items": {
                "type": "string"
              },
              "description": "Questions to ask user for clarification"
            },
            "refined_idea": {
              "type": "string",
              "description": "Refined idea based on user responses"
            }
          }
        }
      },
      {
        "name": "generate_blueprint",
        "description": "Generate project blueprint from clarified idea",
        "parameters": {
          "type": "object",
          "properties": {
            "idea": {
              "type": "string",
              "description": "Clarified idea"
            },
            "components": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "name": "string",
                  "description": "string",
                  "priority": "string",
                  "estimate_hours": "number"
                }
              }
            }
          }
        }
      }
    ]
  }
};