FROM node:20-alpine AS build
WORKDIR /app

COPY package.json ./
COPY client/package.json client/package.json
COPY server/package.json server/package.json

RUN npm install
RUN npm --prefix client install
RUN npm --prefix server install

COPY . .
RUN npm run build

FROM node:20-alpine AS server
WORKDIR /app/server
COPY --from=build /app/server/package.json ./
COPY --from=build /app/server/node_modules ./node_modules
COPY --from=build /app/server/dist ./dist
ENV NODE_ENV=production
EXPOSE 5000
CMD ["npm", "start"]
