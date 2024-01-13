/* #########################################################################
############################################################################
						Golpex API routers
############################################################################
######################################################################### */

/* =============================================================
						SETUP
============================================================= */

const express = require('express');
//const { JSDOM } = require('jsdom'); // todo : suppr
const fs = require('fs').promises;
const app = express();
const port = 3000;

const query = require('./query'); // ne sert que pour /music
const promptManager = require('./promptManager');


app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
	next();
});

/* =============================================================
						API METHODS
============================================================= */


async function readFileContent(path) {
	try {
		const content = await fs.readFile(path, 'utf8');
		return content;
	} catch (error) {
		console.error(`Erreur lors de la lecture du fichier : ${error.message}`);
		throw error; // Ou gérer l'erreur comme tu le souhaites
	}
}

// ----------------------------------------------------------
//						HOME
// Endpoint pour la politique de confidentialité
app.get('/', async(req, res) => {
	response = await readFileContent("./docs/home.html");
	res.send(response);
});

// ----------------------------------------------------------
//						PRIVACY
// Endpoint pour la politique de confidentialité
app.get('/privacy', async(req, res) => {
	response = await readFileContent("./docs/privacy.html");
	res.send(response);
});
// ----------------------------------------------------------
//						UPDATE
// Endpoint pour les mises à jour
app.get('/update', async (req, res) => {
	response = await readFileContent("./docs/update.html");
	res.send(response);
});

// ----------------------------------------------------------
//						TIME
// Endpoint pour obtenir le temps actuel
app.get('/time', (req, res) => {
	const currentTime = new Date().toTimeString();
	res.send(currentTime);
});

// ----------------------------------------------------------
//						MUSIC

app.get('/music', async (req, res) => {
	const prompt = req.query.prompt;

	// Vérifie si les paramètres context et prompt sont fournis
	if (!prompt) {
		return res.status(400).send("Le paramètre 'prompt' est requis.");
	}

	try {
		const audioBuffer = await query.promptT2M(prompt);
		//res.setHeader('Content-Type', 'audio/mpeg');
		//res.send(audioBuffer);
		res.send(Array.from(audioBuffer))
		
	} catch (error) {
		res.status(500).send(`Erreur modèle Text to Music : ${error.message}`);
	}
	
});

// ----------------------------------------------------------
//						ASK
app.get('/ask', async (req, res) => {
	let context = req.query.context;
	const prompt = req.query.prompt;

	// Vérifie si les paramètres context et prompt sont fournis
	if (!context || !prompt) {
		return res.status(400).send("Les paramètres 'context' et 'prompt' sont requis.");
	}

	const PRIVACY_DOC = await readFileContent("./docs/privacy.html");
	const UPDATE_DOC = await readFileContent("./docs/update.html");

	context = PRIVACY_DOC + "\n" + UPDATE_DOC + "\n" + context;


	const response = await TOOLS["initiate"](context, prompt);

	res.send(response);
});

//http://localhost:3000/initiate?context=monContexte&prompt=monPrompt


// ----------------------------------------------------------
//						IMPROVE
app.get('/improve', async (req, res) => {
	let context = req.query.context;
	const prompt = req.query.prompt;
	const response = req.query.response;

	// Vérifie si les paramètres context et prompt sont fournis
	if (!context || !prompt || !response) {
		return res.status(400).send("Les paramètres 'context', 'prompt' et 'response' sont requis.");
	}

	const PRIVACY_DOC = await readFileContent("./docs/privacy.html");
	const UPDATE_DOC = await readFileContent("./docs/update.html");

	context = PRIVACY_DOC + "\n" + UPDATE_DOC + "\n" + context;


	const improved_response = await TOOLS["improve"](context, prompt, response);

	res.send(improved_response);
});

//http://localhost:3000/improve?context=monContexte&prompt=monPrompt&response=maResponse

// ----------------------------------------------------------
//						IMPROVE
app.get('/selecter', async (req, res) => {
	let context = req.query.context;
	const request = req.query.request;
	const data = req.query.data;

	// Vérifie si les paramètres context et prompt sont fournis
	if (!context || !request || !data) {
		return res.status(400).send("Les paramètres 'context', 'request' et 'data' sont requis.");
	}

	const selectedlines = await TOOLS["selecter"](context, request, data);

	res.send(selectedlines);
});
// ----------------------------------------------------------
//						Prompt factory

/*
GPT >
	/build : {}
GolpexAPI >
	Instructions
User >
	Task
GPT >
	/build/get : Task
GolpexAPI >
	Step 1 Instructions
GPT > 
	/build/set : {"role" : STRING, "goal" : STRING, "format" : JSON}
GolpexAPI >
	Step 2 Instructions
GPT > 
	/build/set : {"role" : STRING, "goal" : STRING, "format" : JSON, "example" : JSON}
GolpexAPI >
	Step 3 Instructions
GPT > 
	/build/create : {"role" : STRING, "goal" : STRING, "format" : JSON, "example" : JSON}
GolpexAPI >
	Final Prompt + Step 4 Instructions
GPT >
	show results
User

*/
app.get('/GPT/build/', async (req, res) => {

	response = await readFileContent("./prompts/GPT/build/instructions.txt");
	res.send(response);
});

app.get('/GPT/build/get', async (req, res) => {

	const task = req.query.task;

	try {
		if (!task) {
			return res.status(400).send("Le paramètre 'task' est requis.");
		}

		response = await readFileContent("./prompts/GPT/build/get.txt");
		response = response.replace("[GOLPEX_VARIABLE:TASK]", task);

		res.send(response);
		
	} catch (error) {
		res.status(500).send(`Erreur serveur: ${error.message}`);
	}
});

app.get('/GPT/build/set', async (req, res) => {

	const json = req.query.json;

	if (!json) {
		return res.status(400).send("Le paramètre 'json' est requis.");
	}

	
	try {
		const data = JSON.parse(json);
		const { role, goal, format } = data;

		if (!role || !goal || !format) {
			return res.status(400).send("Les paramètres 'role', 'goal' et 'format' du fichier JSON sont requis.");
		}

		let response = await readFileContent("./prompts/GPT/build/set.txt");
		response = response.replace("[GOLPEX_VARIABLE:ROLE]", role);
		response = response.replace("[GOLPEX_VARIABLE:GOAL]", goal);
		response = response.replace("[GOLPEX_VARIABLE:FORMAT]", JSON.stringify(format));
		response = response.replace("[GOLPEX_VARIABLE:EXAMPLE]", jsonToHtml(format));

		res.send(response);

	} catch (error) {
		res.status(500).send(`Erreur serveur: ${error.message}`);
	}
});

function jsonToHtml(json, rootElement = 'Example') {
	let html = `<${rootElement}>`;

	for (const key in json) {
		if (json.hasOwnProperty(key)) {
			const value = json[key];

			if (typeof value === 'object') {
				// Appel récursif pour les objets imbriqués
				html += `<${key}>${jsonToHtml(value, '')}</${key}>`;
			} else {
				// Gérer les valeurs simples
				html += `<${key}>[GOLPEX_VARIABLE:${key}]</${key}>`;
			}
		}
	}

	html += `</${rootElement}>`;
	return html.replace('<>','');
}

app.get('/GPT/build/create', async (req, res) => {

	const json = req.query.json;
	try {
		const data = JSON.parse(json);
		const { role, goal, format, example } = data;

		if (!role || !goal || !format || !example) {
			return res.status(400).send("Les paramètres 'role', 'goal', 'format' et 'example' sont requis.");
		}

		

		let response = await readFileContent("./prompts/GPT/build/create.txt");
		response = response.replace("[GOLPEX_VARIABLE:ROLE]", role);
		response = response.replace("[GOLPEX_VARIABLE:GOAL]", goal);
		response = response.replace("[GOLPEX_VARIABLE:FORMAT]", JSON.stringify(format));
		response = response.replace("[GOLPEX_VARIABLE:EXAMPLE]", jsonToHtml(format));



		response = completeExampleNode(example, response);

		response = addResultNode(response, format);

		response = completeResultNode(example, response);
		//temp = response;

		//response = await readFileContent("./prompts/GPT/build/create2.txt");
		//response = response.replace("[GOLPEX_VARIABLE:PROMPT]", temp);

		res.send(response);

	} catch (error) {
		res.status(500).send(`Erreur serveur: ${error.message}`);
	}
});

function completeExampleNode(jsonSelectors, htmlPrompt) {


	let completedHtml = new promptManager.Prompt(htmlPrompt);

	for(let key in jsonSelectors){
		value = jsonSelectors[key];
		completedHtml.setNodeContent(key.toLowerCase(), value);
	}

	return completedHtml.toString();
}

function addResultNode(htmlPrompt, format){

	let completedHtml = new promptManager.Prompt(htmlPrompt);

	completedHtml.addNode("results", "golpex");
	completedHtml.addNodeContent("results", "[GOLPEX_VARIABLE:RESULTS]");

	return completedHtml.toString().replace("[GOLPEX_VARIABLE:RESULTS]", jsonToHtml(format, "result"));
}

function completeResultNode(jsonSelectors, htmlPrompt) {


	let completedHtml = new promptManager.Prompt(htmlPrompt);

	for(let key in jsonSelectors){
		
		key = key.replace('example >', 'result >').replace('Example >', 'result >')
		completedHtml.setNodeContent(key, "");
		completedHtml.addMarker(key.replace('result > ',''), key);
	}

	return completedHtml.toString();
}


// ----------------------------------------------------------
//						FORTRAN

app.get('/GPT/fortran/project/start', async (req, res) => {

	response = await readFileContent("./prompts/GPT/fortran/project/instructions.txt");
	res.send(response);
});

// ----------------------------------------------------------
//						ASK TINIA (chatbot)

app.get('/tinia/ask', async (req, res) => {
	const context = req.query.context;
	let conversation = req.query.conversation;

	// Vérifie si les paramètres context et prompt sont fournis
	if (!context || !conversation) {
		return res.status(400).send("Les paramètres 'context' et 'conversation' sont requis.");
	}

	try {
		conversation = JSON.parse(conversation);
		const response = await CHATBOT["tinia"](context, conversation);
		res.send(response);
	} catch (error) {
		res.status(500).send(`Erreur: ${error.message}`)
	}
});

app.post('/tinia/ask', async (req, res) => {
    const context = req.body.context;
    let conversation = req.body.conversation;

    // Vérifie si les paramètres context et conversation sont fournis
    if (!context || !conversation) {
        return res.status(400).send("Les paramètres 'context' et 'conversation' sont requis.");
    }

    try {
        conversation = JSON.parse(conversation);
        const response = await CHATBOT["tinia"](context, conversation);
        res.send(response);
    } catch (error) {
        res.status(500).send(`Erreur: ${error.message}`);
    }
});

	

/* =============================================================
						LISTEN
============================================================= */

app.listen(port, () => {
	console.log(`L'API est en écoute sur le port ${port}`);

	startDebug();
});

const TEST = `<message>
	<sender><marker variableName="sender"></marker></sender>
	<content>
		<modalities>
			<marker variableName="content"></marker>
		</modalities>
	</content>
</message>`

const TEST2 = `<message>
	<sender><marker variableName="sender"></marker></sender>
	<content>
		bonjour
	</content>
</message>`

async function startDebug(){
	console.log('================= START DEBUG =================');

	/*
	let prompt = new promptManager.Prompt(TEST);

	const options = {
			maxTokens: 100,
			maxLoop: 8
		};
	const stopList = ["</message>", "</sender>", "</content>", "</conversation>", "\n\n\n\n"];


	await prompt.genMarker('content', options, stopList, true)

	console.log("RESULT ::",prompt.toString());
	*/
	/*
	let message = {
		"sender" : "user",
		"content" : [
			{
				"modality" : "audio",
				"content" : {
					"type" : "speech",
					"voice" : "voice owner",
					"transcription" : "this is a transcription"
				}
			},
			{
				"modality" : "text",
				"content" : "bonjour texte"
			},
			{
				"modality" : "image",
				"content" : {
					"description" : "this is a description"
				}
			}
		]
	}
	let text = await promptManager.createMessage(message.sender, message.content)
	console.log(text)
	*/
	
	let convo = {
		"messages" : [
			{
				"sender" : "tinia",
				"content" : [
					{
						"modality" : "text",
						"content" : "Hi! How can I help you"
					}
				]
			},
			{
				"sender" : "user",
				"content" : [
					{
						"modality" : "text",
						"content" : "I m going to cook for my date who claims to be a picky eater. Can you recommend me a dish that s easy to cook?"
					}
				]
			},
			{
				"sender" : "tinia",
				"content" : [
					{
						"modality" : "text",
						"content" : "Cooking for a picky eater can be a bit like walking a culinary tightrope, huh? How about playing it safe with something like Chicken Alfredo Pasta? It's pretty straightforward, hard to go wrong with, and most picky eaters don't object to it. The creamy sauce and tender chicken over pasta is like the Switzerland of dinner dishes – neutral and likable by many! Plus, it's quick to whip up, leaving you more time to focus on your date rather than being chained to the stove. Would you like a simple recipe for it?"
					}
				]
			},
			{
				"sender" : "user",
				"content" : [
					{
						"modality" : "text",
						"content" : "Before that, show me what it looks like !"
					}
				]
			}
		]
	}
	/*
	let text = await promptManager.createConversation(convo)
	console.log(text)

	*/

	//let text = await CHATBOT['tinia']('', convo);
	//console.log(text)
}



/* #########################################################################
############################################################################
						Agents : Tools
############################################################################
######################################################################### */

/* =============================================================
						PROMPTS
============================================================= */

/* #########################################################################
############################################################################
						Agent Factory
############################################################################
######################################################################### */


const TOOLS = {

	initiate : async (context, request) => {
		let template = await readFileContent("./prompts/initiater.html");
		let prompt = new promptManager.Prompt(template);

		prompt.setMarker('context', context)
		prompt.setMarker('request', request)

		const options = {
			maxTokens: 100,
			maxLoop: 8
		};
		const stopList = ["</response>", "\n\n\n\n"];

		await prompt.genMarker('response', options, stopList)

		return prompt.getNodeContent('golpex > response');
	},

	improve : async (context, request, response) => {
		let template = await readFileContent("./prompts/improver.html");
		let prompt = new promptManager.Prompt(template);

		prompt.setMarker('context', context)
		prompt.setMarker('request', request)
		prompt.setMarker('response', response)

		const options = {
			maxTokens: 100,
			maxLoop: 8
		};
		const stopList = ["</improved_response>", "</ideas_for_upgrades>", "\n\n\n\n"];

		await prompt.genMarker('ideas_for_upgrades', options, stopList)
		await prompt.genMarker('improved_response', options, stopList)

		return prompt.getNodeContent('golpex > improved_response');
	},

	selecter : async (context, request, data) => {
		let template = await readFileContent("./prompts/selecter.html");
		let prompt = new promptManager.Prompt(template);

		prompt.setMarker('context', context);
		prompt.setMarker('request', request);

		//data = await readFileContent("./_debug/demo_1.py");

		prompt.formatTextAsLines(data, 'result > data');

		const options = {
			maxTokens: 50,
			maxLoop: 4
		};

		const stopList = ["</selectedlines>", "\n\n\n\n"];

		await prompt.genMarker('selectedLines', options, stopList);

		const arrayText = prompt.getNodeContent('golpex > results > result > selectedlines');
		const arrayLines = arrayText.slice(1, -1).split(',').map(n => Number(n.trim()));
		return arrayLines;
	},

}


/*
localhost:3000/tinia/ask?context=%22none%22&conversation={%20%22messages%22%20:%20[%20{%20%22sender%22%20:%20%22tinia%22,%20%22content%22%20:%20%22Hi!%20How%20can%20I%20help%20you%22%20},%20{%20%22sender%22%20:%20%22user%22,%20%22content%22%20:%20%22I%20m%20going%20to%20cook%20for%20my%20date%20who%20claims%20to%20be%20a%20picky%20eater.%20Can%20you%20recommend%20me%20a%20dish%20that%20s%20easy%20to%20cook?%22%20},%20{%20%22sender%22%20:%20%22tinia%22,%20%22content%22%20:%20%22Cooking%20for%20a%20picky%20eater%20can%20be%20a%20bit%20like%20walking%20a%20culinary%20tightrope,%20huh?%20How%20about%20playing%20it%20safe%20with%20something%20like%20Chicken%20Alfredo%20Pasta?%20It%27s%20pretty%20straightforward,%20hard%20to%20go%20wrong%20with,%20and%20most%20picky%20eaters%20don%27t%20object%20to%20it.%20The%20creamy%20sauce%20and%20tender%20chicken%20over%20pasta%20is%20like%20the%20Switzerland%20of%20dinner%20dishes%20%E2%80%93%20neutral%20and%20likable%20by%20many!%20Plus,%20it%27s%20quick%20to%20whip%20up,%20leaving%20you%20more%20time%20to%20focus%20on%20your%20date%20rather%20than%20being%20chained%20to%20the%20stove.%20Would%20you%20like%20a%20simple%20recipe%20for%20it?%22%20},%20{%20%22sender%22%20:%20%22user%22,%20%22content%22%20:%20%22Yes%20please,%20it%20would%20be%20great%20!%22%20}%20]%20}
*/


const CHATBOT = {

	tinia : async (context, conversation) => {
		let template = await readFileContent("./prompts/chat/tinia.html");
		let prompt = new promptManager.Prompt(template);

		prompt.setMarker('context', context);

		conversation = await promptManager.createConversation(prompt, conversation);
		prompt.setMarker('conversation', conversation, true);

		const options = {
			maxTokens: 100,
			maxLoop: 8
		};
		const stopList = ["</output>", "\n\n\n\n"];

		await prompt.genMarker('content', options, stopList, true);

		return prompt.getNodeHTML('golpex > result > output'); // convertir en messages json
	},
}
/*

localhost:3000/tinia/ask?context=Tinia is happy&conversation=
{
	"messages" : [
		{
			"sender" : "tinia",
			"content" : [
				{
					"modality" : "text",
					"content" : "Hi! How can I help you"
				}
			]
		},
		{
			"sender" : "user",
			"content" : [
				{
					"modality" : "text",
					"content" : "I m going to cook for my date who claims to be a picky eater. Can you recommend me a dish that s easy to cook?"
				}
			]
		},
		{
			"sender" : "tinia",
			"content" : [
				{
					"modality" : "text",
					"content" : "Cooking for a picky eater can be a bit like walking a culinary tightrope, huh? How about playing it safe with something like Chicken Alfredo Pasta? It's pretty straightforward, hard to go wrong with, and most picky eaters don't object to it. The creamy sauce and tender chicken over pasta is like the Switzerland of dinner dishes – neutral and likable by many! Plus, it's quick to whip up, leaving you more time to focus on your date rather than being chained to the stove. Would you like a simple recipe for it?"
				}
			]
		},
		{
			"sender" : "user",
			"content" : [
				{
					"modality" : "text",
					"content" : "Yes please, it would be great !"
				}
			]
		}
	]
}






{
	"messages" : [
		{
			"sender" : "tinia",
			"content" : "Hi! How can I help you"
		},
		{
			"sender" : "user",
			"content" : "I need help with a python function !!! I need a factorial function."
		}
	]
}
*/
