const queues = {
  dev: [],
  games: [],
  negocios: [],
  musica: [],
  filmes: []
};

function addToQueue(theme, user) {
  if (!queues[theme]) return null;

  if (queues[theme].length > 0) {
    const partner = queues[theme].shift();
    return { user, partner };
  }

  queues[theme].push(user);
  return null;
}

function removeFromQueue(theme, socketId) {
  if (!queues[theme]) return;
  queues[theme] = queues[theme].filter(u => u.socketId !== socketId);
}

module.exports = { addToQueue, removeFromQueue };
