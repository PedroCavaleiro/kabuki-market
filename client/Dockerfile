FROM node:16 AS builder
ENV NODE_ENV=production

WORKDIR /sqtracker
COPY . .
RUN yarn install
RUN echo "{}" > /config.js
RUN ./node_modules/.bin/next build

FROM node:16-alpine
ENV NODE_ENV=production

LABEL org.opencontainers.image.source=https://github.com/PedroCavaleiro/kabuki-market/actions/new
WORKDIR /sqtracker/client
COPY --from=builder /kabuki-market/node_modules ./node_modules
COPY --from=builder /kabuki-market/public ./public
COPY --from=builder /kabuki-market/.next ./.next
COPY --from=builder /kabuki-market/next.config.js ./next.config.js
COPY --from=builder /kabuki-market/package.json ./package.json
EXPOSE 3000
CMD ["node_modules/.bin/next", "start", "-p", "3000"]
