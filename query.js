/* #########################################################################
############################################################################
						Query Library
############################################################################
######################################################################### */

const axios = require('axios');

/* =============================================================
						PROMPT REQUEST
============================================================= */

const MODELS = {
	// ==================================
	//				TEXT
	// ==================================

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

	// TEXT SIMILARITY

	"MINI-LM" : {
		"name" : "sentence-transformers/all-MiniLM-L6-v2",
	},

	// EMBEDDINGS

	"BGE-LARGE" : {
		"name" : "BAAI/bge-large-en-v1.5",
	},

	// ==================================
	//				IMAGE
	// ==================================

	//VISION

	"IMG-CAPTION-LARGE" : {
		"name" : "Salesforce/blip-image-captioning-large",
	},

	// IMAGE CLASSIFICATION

	"CLIP-VITE-LARGE" : {
		"name" : "openai/clip-vit-large-patch14",
	},

	// TEXT TO IMAGE

	"ANIMAGINE" : {
		"name" : "cagliostrolab/animagine-xl-3.0",
		"info" : "finetuned for anime style", 
	},

	"OPEN_DALLE" : {
		"name" : "dataautogpt3/OpenDalleV1.1",
		"info" : "non-commercial use + can generate text : '((Golpex!)text logo:1), orange background'"
	},

	// ==================================
	//				AUDIO
	// ==================================

	// MUSIC GENERATION
	
	"MUSIC_GEN_SMALL": {
		"name" : "facebook/musicgen-small",
	},
	"MUSIC_GEN_MEDIUM": {
		"name" : "facebook/musicgen-medium",
	},

	//AUTOMATIC SPEECH RECOGNITION

	"PARAKEET" : {
		"name" : "nvidia/parakeet-rnnt-1.1b",
	},

	// TEXT TO SPEECH

	"BARK" : {
		"name" : "suno/bark",
	},

	"BARK-SMALL" : {
		"name" : "suno/bark-small",
	},

	// ==================================

};

// clés gratuites et renouvelables
const API_KEYS = {
	"TXT2TXT": "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",
	"TXT2IMG": "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",
	"TXT2AUDIO": "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",
};

let API_COUNTER = {
	"LLM": 0,		//Large Language Model
	"TS" : 0,		//Sentence Similarity
	"T2S": 0,		//Text to Speech
	"T2M": 0, 		//Text to Music
	"T2I": 0,		//Text to Image
	"ASR": 0, 		//Automatic Speech Recognition
	"VISION": 0,	//Vision
};

let CURRENT_MODELS = {
	"LLM": MODELS["MISTRAL_7B"],
	"TS" : MODELS["MINI-LM"],
	"T2M" : MODELS["MUSIC_GEN_SMALL"],
	"ASR" : MODELS["PARAKEET"],
	"VISION" : MODELS["IMG-CAPTION-LARGE"],
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

async function queryAudio(payload, model, keyAPI) {

	const API_URL = `https://api-inference.huggingface.co/models/${model}`;

	const response = await fetch(
		API_URL,
		{
			headers: { Authorization: `Bearer ${keyAPI}` },
			method: "POST",
			body: JSON.stringify(payload),
		}
	);

	if (!response.ok) {
		throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
	}

	const arrayBuffer = await response.arrayBuffer();
	const buffer = Buffer.from(arrayBuffer);
	return buffer;
}


// ASR
/*
async function query(filename) {
	const data = fs.readFileSync(filename);
	const response = await fetch(
		"https://api-inference.huggingface.co/models/nvidia/parakeet-rnnt-1.1b",
		{
			headers: { Authorization: "Bearer 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" },
			method: "POST",
			body: data,
		}
	);
	const result = await response.json();
	return result;
}

query("sample1.flac").then((response) => {
	console.log(JSON.stringify(response));
});
*/

//VISION
/*
async function query(filename) {
	const data = fs.readFileSync(filename);
	const response = await fetch(
		"https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-large",
		{
			headers: { Authorization: "Bearer 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" },
			method: "POST",
			body: data,
		}
	);
	const result = await response.json();
	return result;
}

query("cats.jpg").then((response) => {
	console.log(JSON.stringify(response));
});
*/


// TEXT SIMILARITY
/*
async function query(data) {
	const response = await fetch(
		"https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2",
		{
			headers: { Authorization: "Bearer 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" },
			method: "POST",
			body: JSON.stringify(data),
		}
	);
	const result = await response.json();
	return result;
}

query({"inputs": {
		"source_sentence": "That is a happy person",
		"sentences": [
			"That is a happy dog",
			"That is a very happy person",
			"Today is a sunny day"
		]
	}}).then((response) => {
	console.log(JSON.stringify(response));
});
*/

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


async function promptT2M(request) {
	
	const audioBuffer = await queryAudio({
		"inputs": request
	}, CURRENT_MODELS['T2M']['name'], API_KEYS['TXT2AUDIO']);

	API_COUNTER['T2M']++;

	return audioBuffer;
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

module.exports = {
    MODELS,
    API_KEYS,
    API_COUNTER,
    CURRENT_MODELS,
    CURRENT_GENERATION,
    //query,
    //queryAudio,
    promptLLM,
    promptT2M,
    promptLoopLLM,
    setPromptMarker,
    //splitPrompt,
    stopGen,
    getResponseAfterText,
    genPromptMarker,
    setPromptMarkerLLM
};