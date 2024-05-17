# CVRE Roster Website Backend

<img width="582" alt="CVRE Backend - WTF MS" src="https://github.com/16ajans/CVREbackend/assets/20099946/f9e729ed-ea6c-4db1-901a-b552750c8b8e">

## Local Environment Setup

0. Install [Node.js](https://nodejs.org/)(tested on v18.14.0) and git
1. Clone the repo and enter the newly created folder
2. Run `npm ci` to install Node dependencies from `package-lock.json`
3. Configure your `.env` file:
    1. Copy `example.env` to `.env`
    2. Fill in each environment variable (instructions below and/or contained in `example.env`)

## Discord OAuth2

This site piggybacks off the CVRE Discord server for user authentication and authorization.

# Setup

0. Create or select an application from the [Discord Developer Portal](https://discord.com/developers/applications)
1. Under that application's OAuth2 settings:
    1. Note the Client ID and Secret for storage in `.env`
    2. Set up at least one redirect URI with your hosting settings: `http(s)://<host>:<port>/auth/callback` (port can be omitted if running the default HTTP(S) port)

## Discord Bot

### Site Access

Once authenticated via OAuth2, the backend calls the Discord "CVRE Roster Integration" bot to read user roles and determine permissions.
Users with the designated roles have the following permissions:

- "admin": create, modify, and delete divisions, verify players, and manage any captain's teams and players
- "scoresaber": view the player ScoreSaber information provided by captains, intended for a streaming/logistics team
- "captain": create, modify, assign, and delete their own teams and players

While users can have any blend of roles, the "admin" role includes all permissions of the "captain" and "scoresaber" roles.

Corresponding Discord roles are designated by ID in `.env`. Role IDs can be found by enabling Developer Mode in Discord's Advanced settings.
Designating multiples roles is allowed only for the "captain" site role, separated by commas.

### Server Role Management

# Setup

## MongoDB Instance (Atlas)

## Process Manager (PM2)

## Reverse Proxy and TLS (Caddy)

The backend is configured to run only on HTTPS, but is not setup to serve HTTPS alone.
