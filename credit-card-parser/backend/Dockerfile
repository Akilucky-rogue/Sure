FROM node:20-bullseye-slim

# Install poppler (pdftoppm) and tesseract for PDF->image and OCR
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    poppler-utils \
    tesseract-ocr \
    ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

# copy package manifests first for better caching
COPY package.json package-lock.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000
CMD ["node", "server.js"]
