# PartBot

Base code for PartBot, a Bot on Pokémon Showdown.

Features:
At this point, there's way, way too many to list. Honestly just go through the code to find out.


### Setup

1. Clone the Git repository, or download the project and unzip it.
1. Open `config.js`. Enter the Bot prefix, Bot username, Bot password, Bot avatar, Bot status, Bot owner, and an array of rooms you'd like the Bot to join. Scroll down and add the IDs of the users that you would like to set in their respective ranks. For more details on ranks, read below.
1. Open your Terminal and enter the following:
```
npm install
npm run update-data
node bot.js
```


If all goes well, you should get a prompt notifying you of your Bot having connected.


#### Requirements
Node.js (> Node 14.0.0)



### Auth

Rank | Permissions
-----|------------
Locked | Limited access to help commands.
None | Standard access.
Gamma | Hangman and broadcasting access.
Beta | Moderation, Tour, and Game access.
Alpha | Control and Edit access.
Coder | Code, Maintainence access.
Admin | Complete access.


Auth | Rank
-----|-----
 \+ | Gamma
 \% | Beta
 \*, @, #, &, ~ | Alpha (~ is still supported for sideservers)


For room-specific authority, edit the ./data/DATA/roomauth.json file, and add the auth as a property of the room key (it already has an example).


### Structure
PartBot has the following structure:
1. `client.js` is responsible for handling the connection between the Bot and the server. You will almost never be needed to edit this.
2. `bot.js` is the main file. It contains references to all the other files and initiates the Bot. It also contains the PM handler.
3. `handlers/chat.js` handles messages sent in chat, and messages that start with the prefix are redirected to the command handler, whose code can be found in `commands.js`.
4. `handlers/discord.js` contains the Discord command handler.
5. `handlers/autores.js` and `discord_chat.js` handle the PS and Discord autores, respectively.
6. `global.js` instantiates all global variables, including data.
7. `handlers/battle.js` handles the battle interface, `handlers/router.js` handles the website, `handlers/schedule.js` has scheduled daily functions, `handlers/ticker.js` handles the internal ticker (a function which runs periodically every 20 seconds), `handlers/tours.js` handles tournament-related stuff.
8. Commands can be found in `commands/ROOM/COMMAND.js`, with ROOM being 'global' for global commands. PM commands, similarly, are all in `pmcommands`.
9. `pages` contains most of the HTML-related templates and pages for the website, while `public` files can be accessed from anywhere through `${websiteLink}/public/filepath`.
10. The `data` folder contains all the relevant data files required to run the Bot. It also contains the `tools.js` and `hotpatch.js` files, which are used to expose the utilities and hotpatching mechanisms.


### Globals
PartBot's code has a variety of global variables, all of which can be found from global.js. Commonly used ones include:
1. `toID`: The single most-used function in PartBot's code. Coverts a string input to its ID. (This was formerly known as toId, feel free to convert it to toID wherever you see it)
1. `unxa`: "Unexpected number of arguments."
1. `tools`: A global object with various useful functions. Go through ``./data/tools.js`` to view / edit them.
1. `data`: A global object that stores most of the data (Pokedex, moves, etc). Check the requires in ``./globals.js`` to view the individual sources, which are mostly in ``./data/DATA``.
1. `GAMES`: PartBot's Games module. You can find most of PartBot's games here; the module is in `data/GAMES`.
1. `Bot`: The PS client. The class is defined in ``client.js``, but the instance is global. Primary functions include ``Bot.say(roomid, text)`` and ``Bot.pm(userid, text)``. State is mostly stored under various keys in the main object, and room data can be found in ``Bot.rooms``. Most games are assigned to the ``Bot.rooms[roomid]`` object.


### Discord Setup
Once you've set up the configuration file, there are still a couple steps left to set up Discord. If you have ``token`` set to false, ignore these steps.
1. Open `config.js` and replace the string ``'ADMIN_ID'`` with your Discord ID.

(Yeah, that was it)

#### Quick Help:
- How do I get the token for my Bot?

  First, open the [Discord Developer Portal](https://discord.com/developers). If you haven't already done so, create an Application and set it up. After converting the application to a Bot, go to the Bot section and copy your token. This token grants access to your application, so keep it private.

- How do I get my Discord ID?

  Go to Discord settings and enable Developer Mode. Once enabled, right click your name and copy the ID.

- How do I invite my Bot to a server?

  You can only invite the Bot to servers in which you have the ``Manage Server`` permission. Open your application on the Discord Developer Portal, and go to OAuth2. In Scopes, select Bot, and scroll down to select the relevant permissions. After this, simply visit the link that pops up below Scopes. This link may be shared and used multiple times.


### Shop / Leaderboard
PartBot now supports separate leaderboards and shops. Even better, leaderboards can have any number of unique currencies.
Documentation for these will come soon. :sweat_smile:
 
 
#### To-do:

 - [ ] Add moderation / promotion commands.
 - [ ] Add CONTRIBUTING.md.
 - [ ] Add proper website navigation.
 - [ ] Resolve all unresolved TODO comments
 - [ ] Use MongoDB over origindb for more stuff
 
 ### Credits:
 PartMan - Lead Developer
 
 Ecuacion - client.js base

 Many thanks to the numerous people who helped me start out with this years ago.
