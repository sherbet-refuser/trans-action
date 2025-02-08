FROM node:23
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["/bin/bash", "-c", "if [ \"$NODE_ENV\" = \"production\" ]; then npm run build && npm install -g serve && serve -s build; else npm start; fi"]
