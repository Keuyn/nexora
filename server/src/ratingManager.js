const users = {};

function ensureUser(userId) {
  if (!users[userId]) {
    users[userId] = {
      rating: 5,
      votes: 0
    };
  }
}

function updateRating(userId, rating) {
  if (!users[userId]) return;

  const user = users[userId];

  user.rating =
    (user.rating * user.votes + rating) /
    (user.votes + 1);

  user.votes++;
}

function isBlocked(userId) {
  return users[userId] && users[userId].rating < 2;
}

module.exports = {
  ensureUser,
  updateRating,
  isBlocked
};
