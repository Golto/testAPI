/* #########################################################################
############################################################################
						Golpex API routers
############################################################################
######################################################################### */

/* =============================================================
						SETUP
============================================================= */

const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

/* =============================================================
						API METHODS
============================================================= */

const PRIVACY_DOC = `<!DOCTYPE html>
<html lang="fr">
<head>
	<meta charset="UTF-8">
	<title>Politique de Confidentialité de Golpex API</title>
	<style>
		body {
			font-family: Arial, sans-serif;
			line-height: 1.6;
			margin: 0;
			padding: 0;
			background: #f4f4f4;
			color: #333;
		}
		.container {
			width: 80%;
			margin: auto;
			overflow: hidden;
			padding: 20px;
		}
		h1, h2 {
			color: #333;
		}
		p, ul {
			margin-bottom: 10px;
		}
	</style>
</head>
<body>
	<div class="container">
		<h1>Politique de confidentialité de Golpex API</h1>
		<h2>Introduction :</h2>
		<p>Golpex-API est un projet initié par Golto dont un des objectifs est de fournir des outils à la création d'agents autonomes.</p>
		<h2>Informations Collectées :</h2>
		<p>Golpex-API ne collectes pas les données émises par l'utilisateur à l'appel de l'API.</p>
		<h2>Utilisation des Données :</h2>
		<p>Aucune donnée utilisateur n'est stockée à l'appel de l'API.</p>
		<h2>Partage des Données :</h2>
		<p>Bien que les données ne soients pas stockées, Golpex-API utilise des modèles hébergés sur HuggingFace de certains tiers. Par conséquent, ce qui est fournit à l'API est susceptible d'être traité par un de ces modèles. Il est recommandé de consulter la politique de confidentialité concernant les modèles utilisés.</p>
		<h2>Sécurité des Données :</h2>
		<p>Aucune donnée utilisateur n'est stockée à l'appel de l'API.</p>
		<h2>Droits des Utilisateurs :</h2>
		<p>Aucune donnée utilisateur n'est stockée à l'appel de l'API.</p>
		<h2>Utilisation des Cookies :</h2>
		<p>Golpex-API n'utilise pas de cookies.</p>
		<h2>Modifications de la Politique de Confidentialité :</h2>
		<p>L'utilisateur devra se rendre sur la page ./update pour se tenir informer des dernières modifications du service de sa politique de confidentialité.
		Il est recommandé de consulter régulièrement ./privacy</p>
		<h2>Contact :</h2>
		<p>Discord : <a href="https://discord.gg/ZqrFMk29ah">Serveur de Golpex</a></p>
		<h2>Date d'Entrée en Vigueur :</h2>
		<p>26 Décembre 2023</p>
	</div>
</body>
</html>

`

const UPDATE_DOC = `<!DOCTYPE html>
<html lang="fr">
<head>
	<meta charset="UTF-8">
	<title>Dernière mise à jour de Golpex API</title>
	<style>
		body {
			font-family: Arial, sans-serif;
			line-height: 1.6;
			margin: 0;
			padding: 0;
			background: #f4f4f4;
			color: #333;
		}
		.container {
			width: 80%;
			margin: auto;
			overflow: hidden;
			padding: 20px;
		}
		h1, h2 {
			color: #333;
		}
		p, ul {
			margin-bottom: 10px;
		}
	</style>
</head>
<body>
	<div class="container">
		<h1>Dernière mise à jour de Golpex API</h1>
		<h2>Version :</h2>
		<p>1.0.0</p>
		<h2>Changements :</h2>
		<p>Création de l'API</p>
		<ul>
			<li>Ajout de la méthode GET ./time qui retourne le temps actuel.</li>
			<li>Ajout de la méthode GET ./initiate qui prend en argument CONTEXT et PROMPT et qui retourne une réponse RESPONSE.</li>
		</ul>
	</div>
</body>
</html>


`

// ----------------------------------------------------------
//						PRIVACY
// Endpoint pour la politique de confidentialité
app.get('/privacy', (req, res) => {
	res.send(PRIVACY_DOC);
});
// ----------------------------------------------------------
//						UPDATE
// Endpoint pour les mises à jour
app.get('/update', (req, res) => {
	res.send(UPDATE_DOC);
});

// ----------------------------------------------------------
//						TIME
app.get('/time', (req, res) => {
	const currentTime = new Date().toTimeString();
	res.send(currentTime);
});

// ----------------------------------------------------------
//						INITIATE
app.get('/initiate', async (req, res) => {
	let context = req.query.context;
	const prompt = req.query.prompt;

	// Vérifie si les paramètres context et prompt sont fournis
	if (!context || !prompt) {
		return res.status(400).send("Les paramètres 'context' et 'prompt' sont requis.");
	}

	context = PRIVACY_DOC + "\n" + UPDATE_DOC + "\n" + context;


	const response = await TOOLS["initiate"](context, prompt);

	res.send(response);
});

//http://localhost:3000/initiate?context=monContexte&prompt=monPrompt

// ----------------------------------------------------------
//						INITIATE
app.get('/improve', async (req, res) => {
	let context = req.query.context;
	const prompt = req.query.prompt;
	const response = req.query.response;

	// Vérifie si les paramètres context et prompt sont fournis
	if (!context || !prompt || !response) {
		return res.status(400).send("Les paramètres 'context', 'prompt' et 'response' sont requis.");
	}

	context = PRIVACY_DOC + "\n" + UPDATE_DOC + "\n" + context;


	const improved_response = await TOOLS["improve"](context, prompt, response);

	res.send(improved_response);
});

//http://localhost:3000/improve?context=monContexte&prompt=monPrompt&response=maResponse
// ----------------------------------------------------------
//						Prompt factory
app.get('/build', async (req, res) => {

	let context = req.query.context;
	const prompt = req.query.prompt;

	// Vérifie si les paramètres context et prompt sont fournis
	if (!context || !prompt) {
		return res.status(400).send("Les paramètres 'context' et 'prompt' sont requis.");
	}

	context = PRIVACY_DOC + "\n" + UPDATE_DOC + "\n" + context;

	const response = await TOOLS["build"](context, prompt);
	res.send(response);
});

/* =============================================================
						LISTEN
============================================================= */

app.listen(port, () => {
	console.log(`L'API est en écoute sur le port ${port}`);
});

/* #########################################################################
############################################################################
						Query Library
############################################################################
######################################################################### */

/* =============================================================
						PROMPT REQUEST
============================================================= */

const MODELS = {
	// TEXT GENERATION
	"GPT2": {
		"name": "gpt2",
		"max": 1024
	},
	"GUANACO_33B": {
		"name": "timdettmers/guanaco-33b-merged",
		"max": 2048 // 1024 tokens
	},
	"MISTRAL_7B_INSTRUCT": {
		"name": "mistralai/Mistral-7B-Instruct-v0.1",
		"max": 24576 // 8000 tokens ~= 3.3 * 8000 = 26000 caractères = 4096 x 6
	},
	"MISTRAL_7B": {
		"name": "mistralai/Mistral-7B-v0.1",
		"max": 24576 // 8000 tokens ~= 3.3 * 8000 = 26000 caractères = 4096 x 6
	},
	"ZEPHYR": {
		"name": "HuggingFaceH4/zephyr-7b-alpha",
		"max": 24576
	},
};


const API_KEYS = {
	"TXT2TXT": "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",
	"TXT2IMG": "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"
};

let API_COUNTER = {
	"LLM": 0,
	"TS": 0,
	"T2I": 0,
	"ASR": 0
};

let CURRENT_MODELS = {
	"LLM": MODELS["MISTRAL_7B"],
	"TS" : MODELS["SIMILARITY"],
};

let CURRENT_GENERATION = {
	"action" : "None",
	"pourcent" : "None",
	"generation" : "None",
	"isCompleted" : false,
};

async function query(payload, model, keyAPI) {
	const API_URL = `https://api-inference.huggingface.co/models/${model}`;

	const response = await axios.post(API_URL, payload, {
		headers: { Authorization: `Bearer ${keyAPI}` }
	});
	return response.data;
}



/* =============================================================
						PROMPT MANIPULATION FUNCTIONS
============================================================= */

async function promptLLM(request, maxTokens = 20, repetitionPenalty = 1.1, temperature = 1.0) {
	request = request.slice(-CURRENT_MODELS['LLM']['max']);

	const response = await query({
		inputs: request,
		parameters: {
			max_new_tokens: maxTokens,
			repetition_penalty: repetitionPenalty,
			temperature: temperature
		}
	}, CURRENT_MODELS['LLM']['name'], API_KEYS['TXT2TXT']);

	API_COUNTER['LLM']++;

	if (response.error) {
		throw new Error(`Error: ${response.error}\nEstimated Time: ${response.estimated_time}`);
	}

	return response[0]['generated_text'];
}

async function promptLoopLLM(request, options = {}, stopList = ['END OF RESPONSE']) {
	let maxTokens = 20;
	let repetitionPenalty = 1.1;
	let temperature = 1.0;
	let maxLoop = 1;

	if (options.maxTokens) {
		maxTokens = options.maxTokens;
	}
	if (options.repetitionPenalty) {
		repetitionPenalty = options.repetitionPenalty;
	}
	if (options.temperature) {
		temperature = options.temperature;
	}
	if (options.maxLoop) {
		maxLoop = options.maxLoop;
	}

	CURRENT_GENERATION.action = request;

	let output = request;

	for (let i = 0; i < maxLoop; i++) {
		output = await promptLLM(output, maxTokens, repetitionPenalty, temperature);
		let newTokens = getResponseAfterText(output, request);

		CURRENT_GENERATION.pourcent = `${Math.floor((i / maxLoop) * 10000) / 100}%`;
		CURRENT_GENERATION.generation = output;

		for (let stop of stopList) {
			if (newTokens.includes(stop)) {
				CURRENT_GENERATION.pourcent = "100%";
				CURRENT_GENERATION.isCompleted = true;
				return output;
			}
		}
	}

	CURRENT_GENERATION.pourcent = "100%";
	CURRENT_GENERATION.isCompleted = false;

	return output;
}

function setPromptMarker(prompt, marker, text) {
	return prompt.replace(`<MARKER(${marker})>`, text);
}

function splitPrompt(prompt, marker) {
	const parts = prompt.split(`<MARKER(${marker})>`);
	return [parts[0], parts[1]];
}

function stopGen(text, stopList = ['END OF RESPONSE']) {
	for (let stop of stopList) {
		text = text.split(stop)[0];
	}
	return text;
}

function getResponseAfterText(prompt, text) {
	return prompt.replace(text, "");
}

async function genPromptMarker(prompt, marker, stopList = ["END OF RESPONSE"], options = {}) {
	const [beforePrompt, afterPrompt] = splitPrompt(prompt, marker);
	let output = await promptLoopLLM(beforePrompt, options, stopList);
	output = getResponseAfterText(output, beforePrompt);
	output = stopGen(output, stopList);

	return output;
}

async function setPromptMarkerLLM(prompt, marker, stopList = ["END OF RESPONSE"], options = {}) {
	const output = await genPromptMarker(prompt, marker, stopList, options);
	return setPromptMarker(prompt, marker, output);
}

/* #########################################################################
############################################################################
						Agents : Tools
############################################################################
######################################################################### */

/* =============================================================
						PROMPTS
============================================================= */

const prompts = {}

/*
prompts['initiater'] = `
<Golpex>
	<Title>AI Autonomous Agent</title>
	<System>
		When writing a code, use this format :
		<Program>
			<Language>...</Language>
			<Code>...</Code>
		</Program>
		Replace '...' with the corresponding language and code.
	</System>
	<Context><MARKER(context)></Context>
	<Agent>
		<Role>Response initiater</Role>
		<Goal>Write a response given a certain request with details while being organized.</Goal>
		<Format>
			REQUEST(string)
			RESPONSE(string)
		</Format>
	</Agent>
	<Example>
		<Request>On veut créer une API. On peut envoyer des requête GET à cette API et elle nous renvoie l'heure qu'il est. Créer en javascript un code pour construire une telle API</Request>
		<Response>
			Ah, créer une API en JavaScript qui renvoie l'heure, ça sonne comme un projet sympa et assez simple! On va utiliser Node.js avec le framework Express, car c'est une combinaison classique et efficace pour ce genre de tâche. Si t'as pas déjà Express installé, tu peux le faire via npm. Voici un petit exemple de code pour démarrer :
			<Program>
				<Language>Javascript</Language>
				<Code>
					const express = require('express');
					const app = express();
					const port = 3000;

					app.get('/time', (req, res) => {
					  const currentTime = new Date().toTimeString();
					  res.send(currentTime);
					});

					app.listen(port, () => {
					  console.log(\`L'API est en écoute sur le port \${port}\`);
					});
				</Code>
			</Program>
			Ce code fait quelques trucs simples :

			- Importe Express.
			- Crée une application Express.
			- Définit une route /time qui, lorsqu'elle est appelée via une requête GET, envoie l'heure actuelle.
			- Lance le serveur pour écouter sur le port 3000.
			Pour tester, lance le serveur (node nom_du_fichier.js), puis envoie une requête GET à http://localhost:3000/time depuis ton navigateur ou un outil comme Postman. Tu devrais voir l'heure actuelle s'afficher.

			Et voilà, t'as une API toute simple qui te donne l'heure ! 🕒
		</Response>
	</Example>
	<Request><MARKER(request)></Request>
	<Response><MARKER(response)></Response>
</Golpex>
`;

async function initiate(context, request) {
	let prompt = prompts['initiater'];

	prompt = setPromptMarker(prompt, 'context', context);
	prompt = setPromptMarker(prompt, 'request', request);

	const options = {
		maxTokens: 100,
		maxLoop: 8
	};
	const stopList = ["</Response>", "END OF", "\n\n\n\n"];

	const output = await genPromptMarker(prompt, 'response', stopList, options);

	return output;
}
*/


/* #########################################################################
############################################################################
						Agent Factory
############################################################################
######################################################################### */

const { JSDOM } = require('jsdom');

class Prompt {
	constructor(template) {
		const dom = new JSDOM(template);
		this.document = dom.window.document;
	}

	clone() {
		return new Prompt(this.getHTML())
	}

	addNode(nodeName, parentSelector, content = '') {
		const parent = this.document.querySelector(parentSelector);
		const newNode = this.document.createElement(nodeName);
		newNode.textContent = content;
		parent.appendChild(newNode);
		return this
	}

	setNodeContent(selector, content = '') {
		const node = this.document.querySelector(selector);
		if (node) {
			node.textContent = content;
		} else {
			console.warn(`No node found for selector: ${selector}`);
		}
		return this;
	}

	addNodeContent(selector, content = '') {
		const node = this.document.querySelector(selector);
		if (node) {
			node.textContent += content;
		} else {
			console.warn(`No node found for selector: ${selector}`);
		}
		return this;
	}

	getNodeContent(selector) {
        const node = this.document.querySelector(selector);
        if (node) {
            return node.textContent;
        } else {
            console.warn(`No node found for selector: ${selector}`);
            return null;
        }
    }

	removeNode(selector) {
		const node = this.document.querySelector(selector);
		if (node) {
			node.parentNode.removeChild(node);
		}
		return this
	}

	addMarker(variableName, parentSelector) {
		const parent = this.document.querySelector(parentSelector);
		const newNode = this.document.createElement("Marker");
		newNode.setAttribute("variableName", variableName);
		parent.appendChild(newNode);
		return this
	}

	setMarker(variableName, value) {
		const markers = this.document.querySelectorAll(`MARKER[variableName="${variableName}"]`);
		markers.forEach(marker => {
			const newNode = this.document.createTextNode(value);
			marker.parentNode.replaceChild(newNode, marker);
		});
		return this
	}

	async genMarker(variableName, options, stopList) {
        const markers = this.document.querySelectorAll(`marker[variablename="${variableName}"]`);
        for (const marker of markers) {
            // Génère une réponse pour la partie avant le marker
            const promptContent = this.getMarkerPrecedingContent(marker);
            let generatedText = await promptLoopLLM(promptContent, options, stopList); // Cette fonction doit être définie pour interagir avec LLM
            generatedText = getResponseAfterText(generatedText, promptContent);
            generatedText = stopGen(generatedText, stopList);

            // Remplace le marker par le texte généré
            const newNode = this.document.createTextNode(generatedText);
            marker.parentNode.replaceChild(newNode, marker);
        }

        console.log(`\n${this.getHTML()}\n$DONE : ${variableName}\n\n\n`)

        return this
    }

    getMarkerPrecedingContent(marker) {
    	// Implémente la logique pour obtenir le contenu précédant le marker

        // Obtenir le HTML complet
        const htmlContent = this.getHTML();
        
        // Construire le sélecteur unique pour ce marker
        const variableName = marker.getAttribute('variableName');
        const markerSelector = `<marker variablename="${variableName}">`;

        // Splitter le HTML autour du marker
        const parts = htmlContent.split(markerSelector);

        // Retourner le contenu avant le marker
        return parts[0];
    }

	getHTML() {
		return this.document.documentElement.outerHTML;
	}
}

// Exemple de template
const promptTemplate = `
<golpex>
	<title>Titre Initial</title>
	<system>Description du système</system>
	<context><MARKER variableName="context"></MARKER></context>
	<agent>
		<role>Rôle de l'agent</role>
		<goal>Objectif de l'agent</goal>
		<format>
			REQUEST(string)
			RESPONSE(string)
		</format>
	</agent>
	<example>
		<request>Requête exemple</request>
		<response>
			<MARKER variableName="response"></MARKER>
		</response>
	</example>
</golpex>
`;




prompts['initiater'] = new Prompt(promptTemplate).
	setNodeContent('title', 'AI Autonomous Agent').
	setNodeContent('system', `When writing a code, use this format :
		<program>
			<language>...</language>
			<code>...</code>
		</program>
		Replace '...' with the corresponding language and code.`).
	setNodeContent('role', 'Response initiater').
	setNodeContent('goal', 'Write a response given a certain request with details while being organized.').
	setNodeContent('request', "On veut créer une API. On peut envoyer des requête GET à cette API et elle nous renvoie l'heure qu'il est. Créer en javascript un code pour construire une telle API").
	setNodeContent('response', `Ah, créer une API en JavaScript qui renvoie l'heure, ça sonne comme un projet sympa et assez simple! On va utiliser Node.js avec le framework Express, car c'est une combinaison classique et efficace pour ce genre de tâche. Si t'as pas déjà Express installé, tu peux le faire via npm. Voici un petit exemple de code pour démarrer :
			<program>
				<language>Javascript</language>
				<code>
					const express = require('express');
					const app = express();
					const port = 3000;

					app.get('/time', (req, res) => {
					  const currentTime = new Date().toTimeString();
					  res.send(currentTime);
					});

					app.listen(port, () => {
					  console.log(\`L'API est en écoute sur le port \${port}\`);
					});
				</code>
			</program>
			Ce code fait quelques trucs simples :

			- Importe Express.
			- Crée une application Express.
			- Définit une route /time qui, lorsqu'elle est appelée via une requête GET, envoie l'heure actuelle.
			- Lance le serveur pour écouter sur le port 3000.
			Pour tester, lance le serveur (node nom_du_fichier.js), puis envoie une requête GET à http://localhost:3000/time depuis ton navigateur ou un outil comme Postman. Tu devrais voir l'heure actuelle s'afficher.

			Et voilà, t'as une API toute simple qui te donne l'heure ! 🕒`).
	addNode('request', 'golpex', '').
	addMarker('request', 'golpex > request').
	addNode('response', 'golpex', '').
	addMarker('response', 'golpex > response')



prompts['improver'] = new Prompt(promptTemplate).
	setNodeContent('title', 'AI Autonomous Agent').
	setNodeContent('system', `When writing a code, use this format :
		<program>
			<language>...</language>
			<code>...</code>
		</program>
		Replace '...' with the corresponding language and code.`).
	setNodeContent('role', 'Response improver').
	setNodeContent('goal', 'Write an improved response given a certain request and an older response. The new response should be more detailed, incorporate new ideas and should be overall improved.').
	setNodeContent('format', 'REQUEST(string)/RESPONSE(string)/IDEAS_FOR_UPGRADES(array of string)/IMPROVED_RESPONSE(string)').
	removeNode('example').
	addNode('request', 'golpex', '').
	addMarker('request', 'golpex > request').
	addNode('response', 'golpex', '').
	addMarker('response', 'golpex > response').
	addNode('ideas_for_upgrades', 'golpex', '').
	addMarker('ideas_for_upgrades', 'golpex > ideas_for_upgrades').
	addNode('improved_response', 'golpex', '').
	addMarker('improved_response', 'golpex > improved_response')


builderTemplate = `<golpex>
	<title>AI Autonomous Agent</title>
	<system>
		When writing a code, use this format :
		<program>
			<language>...</language>
			<code>...</code>
		</program>
		Replace '...' with the corresponding language and code.
	</system>
	<context><MARKER variableName="context"></MARKER></context>
	<agent>
		<role>Prompt Creator</role>
		<goal>Write an AI Autonomous Agent such as you given a type of task the agent is awaited to do. Provide multiple tags such as title, role, goal, system, context, markers, examples, request, response etc... You may need to add other tags relevant to the specific situation.</goal>
		<format>
			task(string)
			new_agent({
		        role: string,
		        goal: string,
		        markers: [
		            {
		                variableName: string,
		                position: string (e.g., "before request", "after response")
		            },
		            ... (more markers as needed)
		        ],
		        examples: [
		            {
		                request: string,
		                response: string
		            },
		            ... (more examples as needed)
		        ],
		        request: string,
		        response: string
		    })
		</format>
		<example>
			<task>Create a prompt that build websites</task>
            <new_agent>
            	<reasonning>What sould be the role/name of this agent ?</reasonning>
            	<reasonning>Since this is an agent specialized in building websites, the role should be Web Developper.</reasonning>
                <role>Web Developper</role>
                <reasonning>What sould the agent try to achieve ? What is its goal ?</reasonning>
                <reasonning>As a Web Developper, the agent should build websites. It needs to build an HTML file, a CSS file and a Javascript file.</reasonning>
                <goal>Given a request create a website with a HTML, a CSS and Javascript file.</goal>
                <reasonning>Multiple variables are needed such as a request from the user to specify the website wanted and html, css, javascript that are "program type".</reasonning>
                <format>
                	request(string)
                	html({
                		program: {
                			language: string,
                			code: string,
                		}
                	})
                	css({
                		program: {
                			language: string,
                			code: string,
                		}
                	})
                	javascript({
                		program: {
                			language: string,
                			code: string,
                		}
                	})
                </format>
                <request>createMarker("request")</request>
                <html>createMarker("html")</html>
                <css>createMarker("css")</css>
                <javascript>createMarker("javascript")</javascript>

                <!-- Additional specific tags for this agent -->
            </new_agent>
		</example>
	</agent>
	
	<task><MARKER variableName="task"></task>
	
	<new_agent>
		<reasonning>What sould be the role/name of this agent ?</reasonning>
		<reasonning><MARKER variableName="reasonning_role"></reasonning>
		<role><MARKER variableName="role"></role>
		<reasonning>What sould the agent try to achieve ? What is its goal ?</reasonning>
		<reasonning><MARKER variableName="reasonning_goal"></reasonning>
		<goal><MARKER variableName="goal"></goal>
		<reasonning>Which are the variables needed and what types to they need to have ?</reasonning>
		<reasonning><MARKER variableName="reasonning_format"></reasonning>
		<format>
			<MARKER variableName="format">
		</format>
		<example>
			<MARKER variableName="example">
		</example>
	</new_agent>

</golpex>
`
prompts['builder'] = new Prompt(builderTemplate);
/*
prompts['builder'] = new Prompt(promptTemplate).
	setNodeContent('title', 'AI Autonomous Agent').
	setNodeContent('system', `When writing a code, use this format :
		<program>
			<language>...</language>
			<code>...</code>
		</program>
		Replace '...' with the corresponding language and code.`).
	setNodeContent('role', 'Prompt Creator').
	setNodeContent('goal', 'Write an AI Autonomous Agent such as you given a type of task the agent is awaited to do. Provide multiple tags such as title, role, goal, system, context, markers, examples, request, response etc... You may need to add other tags relevant to the specific situation.').
	removeNode('example').
	addNode('task', 'golpex', '').
	addMarker('task', 'golpex > task').
	addNode('????')
	addNode('response', 'golpex', '').
	addMarker('response', 'golpex > response')
*/

//console.log(prompts['improver'].getHTML())

const TOOLS = {

	initiate : async (context, request) => {
		let prompt = prompts['initiater'].clone();

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
		let prompt = prompts['improver'].clone();

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

	build : async (context, task) => {
		let prompt = prompts['builder'].clone();

		prompt.setMarker('context', context)
		prompt.setMarker('task', task)

		const options_long = {
			maxTokens: 100,
			maxLoop: 8
		};
		const options_short = {
			maxTokens: 50,
			maxLoop: 5
		};
		const stopList = ["</reasonning>", "</role>", "</goal>", "</format>", "</example>", "\n\n\n\n"];

		await prompt.genMarker('reasonning_role', options_long, stopList)
		await prompt.genMarker('role', options_short, stopList)
		await prompt.genMarker('reasonning_goal', options_long, stopList)
		await prompt.genMarker('goal', options_short, stopList)
		await prompt.genMarker('reasonning_format', options_long, stopList)
		await prompt.genMarker('format', options_long, stopList)
		await prompt.genMarker('example', options_long, stopList)

		role = prompt.getNodeContent('golpex > new_agent > role');
		goal = prompt.getNodeContent('golpex > new_agent > goal');
		format = prompt.getNodeContent('golpex > new_agent > format');
		example = prompt.getNodeContent('golpex > new_agent > example');


		newPromptTemplate = `<Golpex>
	<Title>AI Autonomous Agent</title>
	<System>
		When writing a code, use this format :
		<Program>
			<Language>...</Language>
			<Code>...</Code>
		</Program>
		Replace '...' with the corresponding language and code.
	</System>
	<Context><MARKER variableName="context"></Context>
	<Agent>
		<Role>${role}</Role>
		<Goal>${goal}</Goal>
		<Format>
			${format}
		</Format>
	</Agent>
	<Example>
		${example}
	</Example>
	<Request><MARKER variableName="request"></Request>
	<Response><MARKER variableName="response"></Response>
</Golpex>`

		return newPromptTemplate;
	},

}