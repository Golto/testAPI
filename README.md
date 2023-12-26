
# Golpex API

## Description
This project is an API for "Golpex". It aims to facilitate the production of autonomous agents by providing multiple prompt-engineering tools.

## Author
Golto

## Version
1.0.0

## Usage
To start the project, run:
```
node api.js
```

## To call the API
http://localhost:3000/time
Return the time as `String`.

Replace `CONTEXT` and `PROMPT` with some contextual infos and a request :
http://localhost:3000/initiate?context=CONTEXT&prompt=PROMPT
Return a response answering your request as `String`.

## Contributing
Contributions are welcome. Please open an issue or submit a pull request with your suggestions.

## License
This project is licensed under the [MIT License](LICENSE).
