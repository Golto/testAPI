/* #########################################################################
############################################################################
						Query Library
############################################################################
######################################################################### */

const { JSDOM } = require('jsdom');

const fs = require('fs').promises;

async function readFileContent(path) {
	try {
		const content = await fs.readFile(path, 'utf8');
		return content;
	} catch (error) {
		console.error(`Erreur lors de la lecture du fichier : ${error.message}`);
		throw error; // Ou gérer l'erreur comme tu le souhaites
	}
}

const query = require('./query');

/* =============================================================
						PROMPT MANEGER
============================================================= */

class Prompt {
	constructor(template) {
		const dom = new JSDOM(template);
		this.document = dom.window.document;
	}

	clone() {
		const cloneTemplate = this.toString();
		return new Prompt(cloneTemplate);
	}

	copy(other) {
		this.document = other.document.cloneNode(true);
	}

	// --------------
	// Node

	addNode(nodeName, parentSelector, content = '') {
		const parent = this.document.querySelector(parentSelector);
		const newNode = this.document.createElement(nodeName);
		newNode.textContent = content;
		parent.appendChild(newNode);
		return this
	}

	removeNode(selector) {
		const node = this.document.querySelector(selector);
		if (node) {
			node.parentNode.removeChild(node);
		}
		return this
	}

	// --------------
	// inner Node

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

	getNodeHTML(parentSelector, isInner = false) {
		const body = this.document.querySelector(parentSelector);
		if (isInner) {
			return body.innerHTML;
		}
		return body.outerHTML;
	}

	// --------------
	// Marker

	addMarker(variableName, parentSelector) {
		const parent = this.document.querySelector(parentSelector);
		const newNode = this.document.createElement("marker");
		newNode.setAttribute("variableName", variableName);
		parent.appendChild(newNode);
		return this
	}

	setMarker(variableName, value, isTemplate = false) {
		const marker = this.document.querySelector(`MARKER[variableName="${variableName}"]`);
		let newNode;

		// TODO :rajouter une sécurité ici replace <script>...</script> --> '' ET on[click, loaded, ...] --> ''

		if (!marker) {
			console.warn(`Marker not found : ${variableName}`);
			return this;
		}

		if (isTemplate) {
			const prompt = new Prompt(value);
			// Créer un fragment de document pour contenir les nouveaux nœuds
			const fragment = this.document.createDocumentFragment();
			// Ajouter chaque enfant du body du nouveau prompt au fragment
			while (prompt.document.body.firstChild) {
				fragment.appendChild(prompt.document.body.firstChild);
			}
			marker.parentNode.replaceChild(fragment, marker);
		} else {
			const newNode = this.document.createTextNode(value);
			marker.parentNode.replaceChild(newNode, marker);
		}

		return this;
	}


	// generation

	async genMarker(variableName, options, stopList, isTemplate = false, debug=false) {
		const marker = this.document.querySelector(`marker[variablename="${variableName}"]`);

		// Génère une réponse pour la partie avant le marker
		const promptContent = this.getMarkerPrecedingContent(marker);
		console.log(promptContent)
		let generatedText = await query.promptLoopLLM(promptContent, options, stopList); // Cette fonction doit être définie pour interagir avec LLM
		
		// TODO :rajouter une sécurité ici replace <script>...</script> --> '' ET on[click, loaded, ...] --> ''

		if (debug) {
			console.log(generatedText);
		}
		
		generatedText = query.getResponseAfterText(generatedText, promptContent);
		generatedText = query.stopGen(generatedText, stopList);

		// Remplace le marker par le texte généré
		this.setMarker(variableName, generatedText, isTemplate);


		//console.log(`\n${this.getHTML()}\n$DONE : ${variableName}\n\n\n`)

		return this
	}

	getMarkerPrecedingContent(marker) {
		// Implémente la logique pour obtenir le contenu précédant le marker

		// Obtenir le HTML complet
		const htmlContent = this.toString();
		
		// Construire le sélecteur unique pour ce marker
		const variableName = marker.getAttribute('variableName');
		const markerSelector = `<marker variablename="${variableName}">`; // todo: améliorer ce split car si il y a des attributs supplémentaires, ça peut ne pas split

		// Splitter le HTML autour du marker
		const parts = htmlContent.split(markerSelector);

		// Retourner le contenu avant le marker
		return parts[0];
	}

	// --------------
	// to string

	toString() {
		return this.document.body.innerHTML;
	}
}




// ==============================================
//					TINIA CHATBOT
/*
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



// MESSAGE

conversation = 
{
	"sender" : "user",
	"content" : [
		{
			"modality" : "text",
			"content" : "this is a text"
		}
	]
}

{
	"sender" : "user",
	"content" : [
		{
			"modality" : "image",
			"content" : {
				"description" : "this is a description"
			}
		}
	]
}

{
	"sender" : "user",
	"content" : [
		{
			"modality" : "audio",
			"content" : {
				"type" : "speech",
				"voice" : "voice owner",
				"transcription" : "this is a transcription",
			}
		}
	]
}
*/
async function createConversation(prompt, conversation) {

	//const template = await readFileContent("./prompts/chat/tinia.html");
	//const prompt = new Prompt(template);

	const messages = conversation.messages;

	let messagesTemplate = "";

	for (let message of messages) {
		messagesTemplate += `${await createMessage(message.sender, message.content)}\n`;
	}

	return messagesTemplate

	//prompt.setMarker('conversation', messagesTemplate, true);

	//return prompt.toString()
}

async function createMessage(sender, content) {

	const template = await readFileContent("./prompts/chat/message.html");
	const prompt = new Prompt(template);

	let modalitiesTemplate = "";

	for (let part of content) {
		modalitiesTemplate += `${await createModality(part.modality, part.content)}\n`;
	}

	prompt.setMarker('sender', sender);
	prompt.setMarker('content', modalitiesTemplate, true);

	return prompt.toString()
}

async function createModality(modality, content) {
	let template;
	let prompt;

	if (modality === 'text') {
		template = await readFileContent("./prompts/chat/modalities/text.html");
		prompt = new Prompt(template);
		prompt.setMarker('text', content);

	}

	if (modality === 'image') {
		template = await readFileContent("./prompts/chat/modalities/image.html");
		prompt = new Prompt(template);
		prompt.setMarker('description', content.description);

	}

	if (modality === 'audio') {
		template = await readFileContent("./prompts/chat/modalities/audio.html");
		prompt = new Prompt(template);
		prompt.setMarker('type', content.type);

		if (content.type = 'speech') {
			prompt.setMarker('voice', content.voice);
			prompt.setMarker('transcription', content.transcription);
		}
	}
	return prompt.toString()
}

module.exports = {
	Prompt,
	createModality,
	createMessage,
	createConversation,
};



class PromptOLD {

	// utilisé par : selecter
	formatTextAsLines(text, parentSelector) {

		const parentElement = this.document.querySelector(parentSelector);
		if (!parentElement) {
			console.error('Parent element not found');
			return;
		}

		// Sépare le texte en lignes en utilisant le saut de ligne comme séparateur
		const lines = text.split('\n');

		// Itère sur chaque ligne pour créer la structure demandée
		for (let index in lines){
			let line = lines[index];
			
			const lineElement = this.document.createElement('line');
			lineElement.textContent = line;
			lineElement.setAttribute('number', index.toString());
			parentElement.appendChild(lineElement);
		}

		return this
	}

	//utilisé par : tinia/ask
	
}


/*

// INDENTATION

class Prompt {
    // ... autres méthodes ...

    formatHTML(node = this.document.documentElement, depth = 0) {
        const indent = '  '.repeat(depth); // Définir l'indentation (2 espaces ici)
        let html = '';

        // Si le nœud est un texte et non vide, ajoutez-le avec l'indentation
        if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
            html += `${indent}${node.textContent.trim()}\n`;
        }

        // Si le nœud est un élément, formatez la balise ouvrante
        if (node.nodeType === Node.ELEMENT_NODE) {
            html += `${indent}<${node.tagName.toLowerCase()}${this.formatAttributes(node)}>\n`;
        }

        // Récursivement formater chaque enfant
        node.childNodes.forEach(childNode => {
            html += this.formatHTML(childNode, depth + 1);
        });

        // Si c'est un élément, ajoutez la balise fermante
        if (node.nodeType === Node.ELEMENT_NODE) {
            html += `${indent}</${node.tagName.toLowerCase()}>\n`;
        }

        return html;
    }

    formatAttributes(node) {
        let attributes = '';
        for (const attr of node.attributes) {
            attributes += ` ${attr.name}="${attr.value}"`;
        }
        return attributes;
    }

    toString() {
        return this.formatHTML();
    }
}
*/