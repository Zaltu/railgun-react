# FROM node:alpine

# WORKDIR /opt/railgun_react
# EXPOSE 5174

# COPY ./railgun-react /opt/railgun_react

# RUN cd /opt/railgun_react && npm install

# CMD [ "npm", "run", "dev" ]

FROM node:alpine AS build

WORKDIR /opt/railgun_react
COPY ./railgun-react /opt/railgun_react

RUN cd /opt/railgun_react && npm install
RUN cd /opt/railgun_react && npm run build

FROM nginx
COPY --from=build /opt/railgun_react/dist /var/www/html/
COPY ./deploy/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx","-g","daemon off;"]
