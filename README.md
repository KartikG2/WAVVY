# WAVVY Video Conferencing Application

## Project Description
WAVVY is a modern video conferencing application that allows users to connect and collaborate remotely through high-quality video and audio. The application is designed with user experience in mind, ensuring a seamless experience for meetings, webinars, and group collaborations.

## Features
- High-definition video and audio calls
- Screen sharing capabilities
- Chat functionality during calls
- User-friendly interface
- Supports up to 100 participants in a single call
- Recording feature for meetings
- Virtual background options

## Tech Stack
- **Frontend:** React, Redux, HTML, CSS
- **Backend:** Node.js, Express
- **Database:** MongoDB
- **Real-time Communication:** WebRTC, Socket.io
- **Deployment:** Docker, Kubernetes

## Prerequisites
- Node.js (14.x or higher)
- MongoDB (local or cloud instance)
- Basic understanding of JavaScript and web development

## Installation Instructions
1. Clone the repository:
   ```bash
   git clone https://github.com/KartikG2/WAVVY.git
   cd WAVVY
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Setup environment variables:
   Create a `.env` file based on the `.env.example` to configure database connections and other settings.
4. Start the application:
   ```bash
   npm start
   ```

## Setup
To set up the application, ensure that you have MongoDB running and accessible. Update the connection string in the `.env` file as needed.

## Project Structure
- `client/`: Contains the frontend code (React application)
- `server/`: Contains the backend code (Node.js and Express)
- `docker/`: Contains Dockerfiles and configurations for containerization

## Deployment Information
To deploy the application, follow these steps:
1. Build the Docker images:
   ```bash
   docker-compose build
   ```
2. Start the services:
   ```bash
   docker-compose up -d
   ```
3. Navigate to your domain or IP address to access the application.

For more detailed deployment options, refer to the `docker/` directory documentation.

## Conclusion
WAVVY serves as a robust solution for modern video conferencing needs, promoting collaboration and productivity. Join us in enhancing virtual interactions!