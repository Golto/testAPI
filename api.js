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

// ----------------------------------------------------------
//						TIME
app.get('/time', (req, res) => {
	const currentTime = new Date().toTimeString();
	res.send(currentTime);
});

// ----------------------------------------------------------
//						INITIATE
app.get('/initiate', async (req, res) => {
    const context = req.query.context;
    const prompt = req.query.prompt;

    // Vérifie si les paramètres context et prompt sont fournis
    if (!context || !prompt) {
        return res.status(400).send("Les paramètres 'context' et 'prompt' sont requis.");
    }

    const response = await initiate(context, prompt);

    res.send(response);
});

//http://localhost:3000/initiate?context=monContexte&prompt=monPrompt
// ----------------------------------------------------------
//						INITIATE

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
	try {
		const response = await axios.post(API_URL, payload, {
			headers: { Authorization: `Bearer ${keyAPI}` }
		});
		return response.data;
	} catch (error) {
		console.error(error);
	}
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
		throw new Error(`Error: ${response.error}`);
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
