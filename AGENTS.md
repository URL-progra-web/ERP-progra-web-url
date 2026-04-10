# OpenCode Agents Configuration

This file defines rules and behaviors for OpenCode agents working on this project.
This project runs in docker, so try to run the commands with docker compose 

## Documentation & Code Search

When you need to search for documentation or code examples, use `context7` tools.

This helps ensure you have access to up-to-date, version-specific documentation and prevents hallucinated APIs.

### Examples:
- "How do I configure a Cloudflare Worker?" - use context7
- "Show me a Next.js middleware example" - use context7
- "Best practices for React hooks?" - use context7

## Project Structure

This is an ERP web application with:
- **Backend**: Python/Django based API
- **Frontend**: Web-based interface
- **Architecture**: Microservices with Docker support

## Coding Standards

- Follow existing code patterns in the project
- Keep commits focused and descriptive
- Test changes before committing
