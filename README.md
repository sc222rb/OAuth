# OAuth2 Access Delegation System for GitLab + Consuming REST and GraphQL APIs

This project is a server-side rendered web application that implements a three-legged OAuth2 flow, enabling users to log in with their GitLab accounts and access various pieces of information from their GitLab profiles. This application　showcases a custom implementation of OAuth2 without relying on external libraries for OAuth support.

## Features

OAuth2 Authentication: Users can securely log in to the application using their GitLab accounts hosted at gitlab.lnu.se.  

User Profile Information: After logging in, users can view their basic GitLab profile information.  

Recent GitLab Activities: The application fetches and displays the 101 most recent activities from the user's GitLab account.  

Group and Project Details: Users can view details about the first three projects within each of their first five GitLab groups, including information on the latest commits.

## Technical Overview
This project is built using a server-side rendering approach with no external OAuth libraries, providing a deep dive into the OAuth2 flow and RESTful/GraphQL API consumption.  

Key Components:  
OAuth2 Flow Implementation: Handles the OAuth2 process, including obtaining authorization codes and exchanging them for access tokens.  

REST API Integration: Retrieves the user's profile information and recent activities using GitLab's REST API.  

GraphQL API Integration: Fetches detailed information about groups, projects, and commits using GitLab's GraphQL API.

Design Considerations:  

Custom OAuth Implementation: The OAuth2 flow is implemented manually, without relying on pre-built OAuth packages, providing a better understanding of the process.  

Code Structure: The code is structured to be modular, making it easier to extend and maintain.  

Security: OAuth2 best practices are followed to ensure secure handling of tokens and user data.

## Deployment

The application can be accessed at the following link:
[OAuth](https://cscloud8-80.lnu.se/oauth/) 
