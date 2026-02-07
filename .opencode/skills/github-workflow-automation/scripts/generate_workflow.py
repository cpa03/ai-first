#!/usr/bin/env python3
"""
generate_workflow.py - Generate GitHub Actions workflows with OpenCode CLI
"""

import argparse
import json
import os
import sys

def generate_basic_workflow(name, trigger="push", branch="main", model="opencode/kimi-k2.5-free"):
    """Generate a basic workflow template."""
    workflow = {
        "name": name,
        "on": {trigger: {"branches": [branch]}},
        "jobs": {
            "opencode": {
                "runs-on": "ubuntu-24.04-arm",
                "timeout-minutes": 60,
                "steps": [
                    {"name": "Checkout Repository", "uses": "actions/checkout@v4", "with": {"fetch-depth": 0}},
                    {"name": "Install OpenCode CLI", "run": "curl -fsSL https://opencode.ai/install | bash"},
                    {"name": "Configure Git", "run": f'git config --global user.name "${{ github.actor }}"\ngit config --global user.email "${{ github.actor_id }}+${{ github.actor }}@users.noreply.github.com"'},
                    {"name": "Wait in Queue", "uses": "softprops/turnstyle@v2", "with": {"poll-interval-seconds": 30}, "env": {"GITHUB_TOKEN": "${{ secrets.GITHUB_TOKEN }}"}},
                    {"name": "Run OpenCode", "run": f'opencode run "Your task here" --model {model}'}
                ]
            }
        }
    }
    return workflow

def generate_pr_workflow(name, trigger="issue_comment", model="opencode/kimi-k2.5-free"):
    """Generate a pull request comment trigger workflow."""
    workflow = {
        "name": name,
        "on": {trigger: {"types": ["created"]}},
        "jobs": {
            "opencode": {
                "runs-on": "ubuntu-24.04-arm",
                "timeout-minutes": 60,
                "if": 'github.event_name == \'issue_comment\' && github.event.issue.pull_request',
                "steps": [
                    {"name": "Checkout Repository", "uses": "actions/checkout@v4", "with": {"fetch-depth": 0}},
                    {"name": "Install OpenCode CLI", "run": "curl -fsSL https://opencode.ai/install | bash"},
                    {"name": "Configure Git", "run": f'git config --global user.name "${{ github.actor }}"\ngit config --global user.email "${{ github.actor_id }}+${{ github.actor }}@users.noreply.github.com"'},
                    {"name": "Branch Management", "run": "git fetch --all\nif git branch -r | grep \"origin/agent-workspace\"; then\n  git checkout agent-workspace\n  git pull origin agent-workspace\nelse\n  git checkout -b agent-workspace\nfi"},
                    {"name": "Merge Main", "id": "merge", "continue-on-error": True, "run": "git merge origin/main"},
                    {"name": "Handle Conflicts", "if": "steps.merge.outcome == 'failure'", "run": "git merge --abort\nexit 1"},
                    {"name": "Wait in Queue", "uses": "softprops/turnstyle@v2", "with": {"poll-interval-seconds": 30}, "env": {"GITHUB_TOKEN": "${{ secrets.GITHUB_TOKEN }}"}},
                    {"name": "Run OpenCode", "run": f'opencode run "Process PR comment" --model {model}'}
                ]
            }
        }
    }
    return workflow

def generate_basic_opencode_workflow(name, model="opencode/kimi-k2.5-free"):
    """Generate the basic iterate.yml workflow template."""
    workflow = {
        "name": name,
        "on": {"workflow_dispatch": {"inputs": {"prompt": {"description": "Prompt for OpenCode", "required": True, "type": "string"}}}},
        "jobs": {
            "opencode": {
                "runs-on": "ubuntu-24.04-arm",
                "timeout-minutes": 60,
                "steps": [
                    {"name": "Checkout Repository", "uses": "actions/checkout@v4", "with": {"fetch-depth": 0}},
                    {"name": "Configure Git", "run": f'git config --global user.name "${{ github.actor }}"\ngit config --global user.email "${{ github.actor_id }}+${{ github.actor }}@users.noreply.github.com"'},
                    {"name": "Install OpenCode CLI", "uses": "anomalyco/opencode/github@latest", "with": {"model": model}, "env": {"ANTHROPIC_API_KEY": "${{ secrets.ANTHROPIC_API_KEY }}"}}
                ]
            }
        }
    }
    return workflow

def workflow_to_yaml(workflow):
    """Convert workflow dict to YAML string."""
    lines = []
    
    def add_line(line, indent=0):
        lines.append("  " * indent + line)
    
    add_line(f"\"{workflow['name']}\":")
    add_line(f"on:")
    
    # Handle 'on' section
    for event, details in workflow['on'].items():
        if isinstance(details, dict) and 'branches' in details:
            add_line(f"{event}:")
            add_line(f"branches:")
            for branch in details['branches']:
                add_line(f"- {branch}", indent=2)
        elif isinstance(details, dict) and 'inputs' in details:
            add_line(f"{event}:")
            add_line(f"inputs:")
            for input_name, input_details in details['inputs'].items():
                add_line(f"{input_name}:")
                for k, v in input_details.items():
                    add_line(f"{k}: {json.dumps(v) if isinstance(v, str) else v}", indent=3)
        elif isinstance(details, dict) and 'types' in details:
            add_line(f"{event}:")
            add_line(f"types:")
            for t in details['types']:
                add_line(f"- {t}", indent=2)
        else:
            add_line(f"{event}: {details}")
    
    # Handle concurrency
    add_line("")
    add_line("concurrency:")
    add_line("group: ${{ github.workflow }}")
    add_line("cancel-in-progress: false")
    
    # Handle jobs
    add_line("")
    add_line("jobs:")
    for job_name, job_details in workflow['jobs'].items():
        add_line(f"{job_name}:")
        add_line("runs-on: ubuntu-24.04-arm")
        if 'timeout-minutes' in job_details:
            add_line(f"timeout-minutes: {job_details['timeout-minutes']}")
        if 'if' in job_details:
            add_line(f"if: {job_details['if']}")
        add_line("steps:")
        
        for step in job_details['steps']:
            if 'uses' in step:
                add_line(f"- uses: {step['uses']}")
                if 'with' in step:
                    add_line("with:")
                    for k, v in step['with'].items():
                        add_line(f"{k}: {v}", indent=3)
                if 'env' in step:
                    add_line("env:")
                    for k, v in step['env'].items():
                        add_line(f"{k}: {v}", indent=3)
            elif 'run' in step:
                add_line(f"- name: {step['name']}")
                if 'continue-on-error' in step:
                    add_line("continue-on-error: true")
                if 'id' in step:
                    add_line(f"id: {step['id']}")
                add_line(f'run: |')
                for line in step['run'].split('\n'):
                    add_line(line, indent=3)
            add_line("")
    
    return '\n'.join(lines)

def main():
    parser = argparse.ArgumentParser(description="Generate GitHub Actions workflows with OpenCode CLI")
    parser.add_argument("type", choices=["basic", "pr", "opencode"], help="Type of workflow to generate")
    parser.add_argument("--name", "-n", default="OpenCode Task", help="Workflow name")
    parser.add_argument("--model", "-m", default="opencode/kimi-k2.5-free", help="OpenCode model to use")
    parser.add_argument("--output", "-o", default=".github/workflows/generated.yml", help="Output file path")
    
    args = parser.parse_args()
    
    if args.type == "basic":
        workflow = generate_basic_workflow(args.name, model=args.model)
    elif args.type == "pr":
        workflow = generate_pr_workflow(args.name, model=args.model)
    elif args.type == "opencode":
        workflow = generate_basic_opencode_workflow(args.name, model=args.model)
    
    yaml_content = workflow_to_yaml(workflow)
    
    # Create directory if it doesn't exist
    os.makedirs(os.path.dirname(args.output), exist_ok=True)
    
    # Write to file
    with open(args.output, 'w') as f:
        f.write(yaml_content)
    
    print(f"Workflow generated: {args.output}")
    print(f"Type: {args.type}")
    print(f"Model: {args.model}")

if __name__ == "__main__":
    main()
