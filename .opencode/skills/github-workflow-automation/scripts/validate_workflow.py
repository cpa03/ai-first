#!/usr/bin/env python3
"""
validate_workflow.py - Validate GitHub Actions workflows for syntax and best practices
"""

import argparse
import os
import re
import sys
import json

try:
    import yaml
except ImportError:
    print("PyYAML is required. Install with: pip install pyyaml")
    sys.exit(1)

def validate_yaml_syntax(filepath):
    """Validate workflow YAML syntax."""
    try:
        with open(filepath, 'r') as f:
            data = yaml.safe_load(f)
        return True, data, None
    except yaml.YAMLError as e:
        return False, None, f"YAML Syntax Error: {str(e)}"

def _has_key(data, key_str, bool_val):
    """Check if data has key, handling YAML 1.1 boolean parsing.
    
    In YAML 1.1, 'on' is a reserved word that gets parsed as boolean True.
    This helper checks for both the string key and its boolean equivalent.
    """
    return key_str in data or bool_val in data


def check_required_fields(data):
    """Check for required workflow fields."""
    errors = []

    if 'name' not in data:
        errors.append("Missing required field: 'name'")

    # YAML 1.1 parses 'on' as boolean True, so check for both
    if not _has_key(data, 'on', True):
        errors.append("Missing required field: 'on'")

    if 'jobs' not in data:
        errors.append("Missing required field: 'jobs'")

    return errors

def check_jobs_structure(data):
    """Check job structure and configuration."""
    errors = []
    warnings = []
    
    if 'jobs' not in data:
        return errors, warnings
    
    for job_name, job_config in data['jobs'].items():
        # Check runs-on
        if 'runs-on' not in job_config:
            errors.append(f"Job '{job_name}' missing 'runs-on'")
        
        # Check correct runner for OpenCode
        if job_config.get('runs-on') != 'ubuntu-24.04-arm':
            warnings.append(f"Job '{job_name}' uses '{job_config.get('runs-on')}' runner; consider 'ubuntu-24.04-arm' for OpenCode")
        
        # Check timeout
        if 'timeout-minutes' not in job_config:
            warnings.append(f"Job '{job_name}' missing 'timeout-minutes'")
        
        # Check steps
        if 'steps' not in job_config:
            errors.append(f"Job '{job_name}' missing 'steps'")
            continue
        
        # Check steps in job
        for step in job_config['steps']:
            if not ('uses' in step or 'run' in step):
                errors.append(f"Job '{job_name}' has step without 'uses' or 'run'")
    
    return errors, warnings

def check_opencode_usage(data):
    """Check OpenCode CLI usage patterns."""
    errors = []
    warnings = []
    has_opencode = False
    
    if 'jobs' not in data:
        return errors, warnings
    
    for job_name, job_config in data['jobs'].items():
        for step in job_config['steps']:
            # Check for OpenCode CLI usage
            if 'run' in step and 'opencode' in step.get('run', ''):
                has_opencode = True
                
                # Check for free model
                if 'opencode/kimi-k2.5-free' not in step['run']:
                    warnings.append(f"Job '{job_name}' step may not be using free OpenCode model")
                
            # Check for OpenCode GitHub action
            if 'uses' in step and 'opencode' in step['uses']:
                has_opencode = True
                
                # Check for model in env
                if 'model' not in step.get('with', {}):
                    warnings.append(f"Job '{job_name}' OpenCode action missing model parameter")
    
    if has_opencode:
        # Check for GITHUB_TOKEN
        jobs_have_token = False
        for job_config in data['jobs'].values():
            for step in job_config.get('steps', []):
                if 'env' in step and 'GITHUB_TOKEN' in step['env']:
                    jobs_have_token = True
                    break
            if jobs_have_token:
                break
        
        if not jobs_have_token:
            warnings.append("Workflow uses OpenCode but GITHUB_TOKEN may not be passed to all jobs")
    
    return errors, warnings

def check_permissions(data):
    """Check permissions configuration."""
    warnings = []
    
    if 'permissions' not in data:
        warnings.append("Workflow missing 'permissions' section; consider setting minimum required permissions")
    else:
        # Check for write-all
        if data['permissions'] == 'write-all':
            errors = ["'permissions: write-all' is not recommended; use specific permissions instead"]
            return errors, warnings
    
    return [], warnings

def check_concurrency(data):
    """Check concurrency settings."""
    warnings = []
    
    if 'concurrency' not in data:
        warnings.append("Workflow missing 'concurrency' section; consider adding queue management")
    else:
        if data['concurrency'].get('cancel-in-progress', True) and 'opencode' in str(data).lower():
            warnings.append("Workflow uses cancel-in-progress: true with OpenCode; consider false for long-running tasks")
    
    return warnings

def check_action_versions(data):
    """Check for pinned action versions."""
    warnings = []
    
    if 'jobs' not in data:
        return warnings
    
    for job_name, job_config in data['jobs'].items():
        for step in job_config['steps']:
            if 'uses' in step:
                action = step['uses']
                if not re.search(r'@[a-z0-9]+\.[a-z0-9]+\.[a-z0-9]+$', action):
                    warnings.append(f"Job '{job_name}' step uses unpinned action: {action}")
    
    return warnings

def check_secrets(data):
    """Check for potential secret exposure."""
    errors = []
    
    if 'jobs' not in data:
        return errors
    
    for job_name, job_config in data['jobs'].items():
        for step in job_config['steps']:
            if 'run' in step:
                run_content = step['run']
                # Check for echoed secrets
                if re.search(r'echo.*\$\{\{\s*secrets\.', run_content):
                    errors.append(f"Job '{job_name}' potentially logs secrets in 'echo' command")
    
    return errors

def check_triggers(data):
    """Check workflow triggers."""
    warnings = []

    # YAML 1.1 parses 'on' as boolean True, so check for both
    on_config = None
    if 'on' in data:
        on_config = data['on']
    elif True in data:
        on_config = data[True]
    else:
        return warnings

    if on_config is None:
        return warnings

    # Check for issue_comment trigger without proper filtering
    if 'issue_comment' in on_config:
        if 'types' not in on_config['issue_comment']:
            warnings.append("'issue_comment' trigger without 'types' filtering may trigger on all comment types")

    # Check for workflow_dispatch without inputs
    if 'workflow_dispatch' in on_config and not isinstance(on_config['workflow_dispatch'], dict):
        warnings.append("'workflow_dispatch' trigger without 'inputs' configuration")

    return warnings

def validate_workflow(filepath):
    """Main validation function."""
    errors = []
    warnings = []
    
    # Step 1: Validate YAML syntax
    is_valid_yaml, data, yaml_error = validate_yaml_syntax(filepath)
    if not is_valid_yaml:
        errors.append(yaml_error)
        return errors, warnings
    
    # Step 2: Check required fields
    errors.extend(check_required_fields(data))
    
    # Step 3: Check jobs structure
    job_errors, job_warnings = check_jobs_structure(data)
    errors.extend(job_errors)
    warnings.extend(job_warnings)
    
    # Step 4: Check OpenCode usage
    opencode_errors, opencode_warnings = check_opencode_usage(data)
    errors.extend(opencode_errors)
    warnings.extend(opencode_warnings)
    
    # Step 5: Check permissions
    perm_errors, perm_warnings = check_permissions(data)
    errors.extend(perm_errors)
    warnings.extend(perm_warnings)
    
    # Step 6: Check concurrency
    warnings.extend(check_concurrency(data))
    
    # Step 7: Check action version pinning
    warnings.extend(check_action_versions(data))
    
    # Step 8: Check for secret exposure
    errors.extend(check_secrets(data))
    
    # Step 9: Check triggers
    warnings.extend(check_triggers(data))
    
    return errors, warnings

def format_results(errors, warnings):
    """Format validation results."""
    results = []
    
    if not errors and not warnings:
        results.append("✅ Workflow is valid!")
        return results
    
    if errors:
        results.append(f"❌ Found {len(errors)} error(s):")
        for error in errors:
            results.append(f"   - {error}")
    
    if warnings:
        results.append(f"⚠️  Found {len(warnings)} warning(s):")
        for warning in warnings:
            results.append(f"   - {warning}")
    
    return results

def main():
    parser = argparse.ArgumentParser(description="Validate GitHub Actions workflows")
    parser.add_argument("workflow", help="Workflow file path")
    parser.add_argument("--strict", action="store_true", help="Treat warnings as errors")
    parser.add_argument("--json", action="store_true", help="Output results as JSON")
    
    args = parser.parse_args()
    
    # Check if file exists
    if not os.path.exists(args.workflow):
        print(f"Error: File '{args.workflow}' not found")
        sys.exit(1)
    
    # Validate workflow
    errors, warnings = validate_workflow(args.workflow)
    
    # Output results
    if args.json:
        output = {
            "valid": len(errors) == 0,
            "errors": errors,
            "warnings": warnings
        }
        print(json.dumps(output, indent=2))
    else:
        results = format_results(errors, warnings)
        for line in results:
            print(line)
    
    # Exit with appropriate code
    if args.strict:
        sys.exit(1 if (errors or warnings) else 0)
    else:
        sys.exit(1 if errors else 0)

if __name__ == "__main__":
    main()
