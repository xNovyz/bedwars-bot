#!/bin/sh
set -eu

cd "$(dirname "$0")"

IMAGE_NAME="${IMAGE_NAME:-bedwars-draft-bot}"
CONTAINER_NAME="${CONTAINER_NAME:-bedwars-bot}"

if [ -f env ]; then
  ENV_FILE=env
elif [ -f .env ]; then
  ENV_FILE=.env
else
  echo "Missing env file. Create 'env' or '.env' from .env.example" >&2
  exit 1
fi

echo "==> Pulling latest changes..."
git pull --ff-only

echo "==> Building image ${IMAGE_NAME}..."
docker build -t "${IMAGE_NAME}" .

echo "==> Restarting container ${CONTAINER_NAME}..."
docker rm -f "${CONTAINER_NAME}" >/dev/null 2>&1 || true
docker run -d \
  --name "${CONTAINER_NAME}" \
  --env-file "${ENV_FILE}" \
  --restart unless-stopped \
  "${IMAGE_NAME}"

echo "==> Done. Logs: docker logs -f ${CONTAINER_NAME}"
