FROM node:10
# COPY package.json package-lock.json /app
WORKDIR /webrtc-backend
# COPY package.json .
# COPY *.lock .
# RUN npm --verbose install
# RUN npm install pm2
# COPY src .
# COPY node_modules .
# COPY public .
# COPY .env .
COPY . .
# RUN npm install pm2 -g
CMD ["npm", "start"]
# CMD ["pm2-runtime", "start", "src/server.js"]
EXPOSE 8090

# COPY --from=build-stage /app/build /backend/build
