module.exports = {
  help: `Displays user's rank on leadboard for the given room. Syntax: ${prefix}rank (room), (username [optional])`,
  permissions: "none",
  commandFunction: function (Bot, by, args, client) {
    if (!args.length) {
      args = Object.keys(Bot.rooms).filter(
        (room) =>
          Bot.rooms[room].users.find((u) => toID(u) === toID(by)) &&
          Bot.rooms[room].lb
      );
      if (args.length !== 1) return Bot.pm(by, "Which room?");
    }
    const cargs = args.join("").split(",");
    const room = tools.getRoom(cargs.shift());
    if (!room) return Bot.pm(by, "Which room?");
    if (!Bot.rooms[room])
      return Bot.pm(by, "I'm not in that room! (does it even exist?)");
    const lb = Bot.rooms[room].lb;
    if (!lb) return Bot.pm(by, "Nope, no leaderboard there.");
    const data = Object.keys(lb.users).map((user) => [
      lb.users[user].name,
      ...lb.users[user].points,
    ]);
    if (!data.length) return Bot.pm(by, "Empty board. o.o");
    data.sort((a, b) => b[1] - a[1]);
    const usernameToFind = cargs[1] || toID(by.name);
    const rank = data.findIndex((entry) => entry[0] === usernameToFind);
    if (rank !== -1) {
      Bot.pm(by, `${usernameToFind} is ranked ${rank + 1} with ${lb.users[usernameToFind].points} points on ${room} room leaderboard`);
    } else {
      Bot.pm(by, `${usernameToFind} not found on ${room} room leaderboard`);
    }
    if (typeof html !== "string") return Bot.pm(by, "Something went wrong.");
    return Bot.sendHTML(by, "<center>" + html + "</center>");
  },
};
