FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --omit=dev

COPY . .

# Register slash commands, then keep the bot running
CMD ["sh", "-c", "node deploy-commands.js && node index.js"]
