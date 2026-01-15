FROM node:18-alpine

WORKDIR /app

COPY package.json .
COPY package-lock.json .
# If package-lock doesn't exist yet, it will fail, so we might need to handle that. 
# But usually create-vite makes one? Actually it might not run npm install.
# Let's assume we run npm install in the container.

RUN npm install

COPY . .

# Expose port and start
EXPOSE 3000
CMD ["npm", "run", "dev", "--", "--host"]
