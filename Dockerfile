# Static site — nginx serves the game directly (§10).
# No backend, no database, no build step.
FROM nginx:alpine

COPY . /usr/share/nginx/html

# Secrets and tooling must never reach the image: .env holds API keys and
# the generator is a build-time script, not something the served game calls.
RUN rm -rf /usr/share/nginx/html/.env \
           /usr/share/nginx/html/.claude \
           /usr/share/nginx/html/tools \
           /usr/share/nginx/html/Dockerfile \
           /usr/share/nginx/html/fly.toml \
           /usr/share/nginx/html/.dockerignore

EXPOSE 80
