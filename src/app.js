const express = require("express");
const cors = require("cors");
const { uuid, isUuid } = require("uuidv4");

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

const validateId = (request, response, next) => {
  const { id } = request.params;

  if (!isUuid(id)) {
    return response.status(400).send('ID is not valid');
  }

  return next();
}

const idIsOnList = (request, response, next) => {
  const { id } = request.params;

  const repositoryIndex = repositories.findIndex(repository => repository.id === id);

  if (repositoryIndex < 0) {
    return response.status(404).send('Repository not found');
  }

  request.params.repositoryIndex = repositoryIndex;
  request.params.repositoryFound = repositories[repositoryIndex];

  return next();
}

app.get("/repositories", (request, response) => {  
  return response.json(repositories);
});

app.post("/repositories", (request, response) => {
  const { 
    techs,
    title,
    url
  } = request.body;
  
  const repository = {
    id: uuid(),
    likes: 0,
    url,
    techs,
    title
  };

  repositories.push(repository);

  return response.json(repository);
});

app.put("/repositories/:id", validateId, idIsOnList, (request, response) => {
  const { id, repositoryIndex, repositoryFound: { likes } } = request.params;
  const { techs, title, url } = request.body;

  const updateRepositoryValues = {
    id,
    likes,
    techs,
    title,
    url
  };

  repositories[repositoryIndex] = updateRepositoryValues;

  return response.json(updateRepositoryValues);
});

app.delete("/repositories/:id", validateId, idIsOnList, (request, response) => {
  const { repositoryIndex } = request.params;

  repositories.splice(repositoryIndex, 1);

  return response.status(204).send();
});

app.post("/repositories/:id/like", validateId, idIsOnList, (request, response) => {
  const { repositoryIndex, repositoryFound } = request.params;

  const updateLikesValue = repositoryFound.likes + 1;
  
  repositories[repositoryIndex] = { ...repositoryFound, likes: updateLikesValue };

  return response.json({ likes: updateLikesValue });
});

module.exports = app;
