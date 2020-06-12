const capitalizeFirst = (username) => {
  return username.charAt(0).toUpperCase() + username.slice(1);
};

module.exports = {
  capitalizeFirst,
};
