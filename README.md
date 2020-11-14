# Application for keystrokes acquisition

## Basics
Description of this application is in file `Praca Magisterska.pdf` in repo: `https://github.com/brooda/keystroke-dynamics-master-thesis-experiments`(in Polish)

To run this application you need Node Package Manager (npm), https://www.npmjs.com/

You need to install needed packages using commnd:
`npm install`

To run the program locally, run:
`npm start`

Enter: http://localhost:3000/keystrokes/?id=test

## Hosting
To make it possible for users to access the application, you need to publish it in the Internet. Example for Github Pages:
1. Put the project on Github,
2. In `package.json` file change the following line:


`"homepage": "https://użytkownikgithuba.github.io/projektużytkownikagithuba"`

`użytkownikgithuba` change to our username, `projektużytkownikagithuba` change to the name of out project
3. Run
`npm run deploy`


## Additional options:
To change the phrase and number of repetitions, we can do that independently in each component (for example in InputComputer.js), this is example of line to change:

`this.generator = new PhrasesGenerator({"phrases": [".tie5Roanl"], "repetitions": 20})`

## Sending to backend
Data is sent to backend via REST Api. It is up to you, how will you store the data. You need to change the line 30. in `Typing.js`:
`let endpoint = "ENDPOINT"`
