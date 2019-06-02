FROM node:8

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm ci --only=production
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY .env .
COPY lib lib
COPY bot.js .

# Health check
HEALTHCHECK --interval=10s --timeout=2s --start-period=15s \  
    CMD ps aux | grep 'node bot.js' || exit 1

CMD [ "npm", "start" ]
