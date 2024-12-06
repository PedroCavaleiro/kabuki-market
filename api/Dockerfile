FROM node:16
ENV NODE_ENV=production
LABEL org.opencontainers.image.source=https://github.com/PedroCavaleiro/kabuki-market
WORKDIR /kabuki-market/app
COPY . .
RUN yarn install
EXPOSE 3001
CMD yarn start
