# FROM node:18 AS build

# WORKDIR /app

# COPY package*.json ./
# RUN npm install
# COPY . .
# RUN npm run build

# FROM nginx:stable-alpine
# COPY --from=build /app/build /usr/share/nginx/html

# # COPY nginx.conf /etc/nginx/conf.d/default.conf


# EXPOSE 80

# CMD ["nginx", "-g", "daemon off;"]


# # FROM node:18

# # WORKDIR /app

# # COPY package*.json ./
# # RUN npm install

# # COPY . .

# # EXPOSE 3000

# # # ENV HOST 0.0.0.0

# # CMD ["npm", "start", "--", "--host", "0.0.0.0"]
# # # CMD ["npm", "start"]

FROM node:18 AS build

WORKDIR /app

ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

COPY package*.json ./
RUN npm install
COPY . .

RUN echo "REACT_APP_API_URL during build: $REACT_APP_API_URL"
RUN REACT_APP_API_URL=$REACT_APP_API_URL npm run build

RUN echo "Contents of /app after build:"
RUN ls -la /app
RUN echo "Contents of /app/build after build:"
RUN ls -la /app/build

FROM nginx:stable-alpine

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx-working.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
