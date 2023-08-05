FROM debian:bookworm-slim

WORKDIR /obs-browser

RUN mkdir -p /obs-browser/dist

COPY ./docker/entry.sh /
COPY ./docker/tables.sql /obs-browser
COPY ./obs-ui /obs-browser
COPY ./dist /obs-browser/dist
COPY ./version.json /obs-browser/

RUN apt update && apt install -y sqlite3
RUN sqlite3 object-storage-browser.sqlite < tables.sql
RUN chmod +x obs-ui && chmod +x /entry.sh

ENV EXECUTEROOT=/obs-browser

ENTRYPOINT ["/entry.sh"]

CMD ["start"]
