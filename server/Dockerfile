# base is bun and node image
FROM oven/bun:1

#work dir:
WORKDIR /app

#package.json, so that cache can happen
COPY package.json bun.lockb ./

# dependency install, don't change the lockfile so that versions can be same
RUN bun install --frozen-lockfile

# copy rest of the dir
COPY . .

# bun automatically exposes port 3000, net told. me but i will also expose 7231
EXPOSE 7231


# Start the server
CMD [ "bun", "start" ]