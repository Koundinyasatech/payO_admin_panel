# Use official Node.js runtime as base image (Node version 20)
FROM node:20
 
 
# Set working directory inside the container
# All commands will run inside /app folder
WORKDIR /app
 
 
# Copy only package.json and package-lock.json into container
# This helps Docker cache dependencies (faster builds)
COPY package*.json ./
 
# Install all Node.js dependencies inside the container
RUN npm install
 
 
# Copy all remaining project files into the container
# (source code, routes, controllers, etc.)
COPY . .
 
 
# Inform Docker that the app will run on port 3000
# (this does NOT actually publish the port)
EXPOSE 3000
 
 
# Default command to run the application when container starts
# This runs: npm start
CMD ["npm", "start"]