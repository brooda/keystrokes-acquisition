import React, { Component } from 'react';
import { PhrasesGenerator } from './PhrasesGenerator'
import {default as UUID} from "node-uuid";
const axios = require('axios');

class InputComputer extends Component {
    constructor(props) {
        super(props);
        
        this.keystrokes = []
        this.currentSentenceAcquisitions = []

        this.state = {
            current_rep: 0,
        }

        this.userId = (new URLSearchParams(window.location.search)).get("id")
        this.generator = new PhrasesGenerator({"phrases": [".tie5Roanl"], "repetitions": 20})
    }


    registerKeystroke = (event, direction) => {
        let keystrokeInfo = {
            "letter": event.keyCode, 
            "timeStamp": Math.round(event.timeStamp),
            "keyEvent": direction
        }

        this.keystrokes.push(keystrokeInfo)
    }
    

    keystrokeDown = (event) => {
        this.registerKeystroke(event, "DOWN")
    }

    handlePaste = (e) => {
        e.preventDefault();
    }

    handleCopy = (e) => {
        e.preventDefault();
    }


    keystrokeUp = async (event) => {
        this.registerKeystroke(event, "UP")

        var expectedPhrase = this.generator.getCurrentPhrase();
        while (!expectedPhrase.startsWith(event.target.value))
        {
            event.target.value = event.target.value.slice(0, -1);
        }

        var currentPhrase = event.target.value;

        if (currentPhrase === expectedPhrase)
        {
            event.target.value = "";

            let dataToRegister = {
                "hash": this.userId,
                "type": "computer",
                "sentence": expectedPhrase,
                "repetition": this.state.current_rep,
                "keystrokes": this.keystrokes
            }


            this.keystrokes = [];
            this.currentSentenceAcquisitions.push(dataToRegister);

            if (this.generator.wasLastRepetitonOfWord())
            {
                this.props.sendDataToAPI(this.currentSentenceAcquisitions)
                this.currentSentenceAcquisitions = [];
            }

            if (!this.generator.hasNext()) {
                this.props.onTaskCompleted()
            }

            this.expectedPhrase = this.generator.next();
            this.setState({current_rep: this.generator.getCurrentRepetition()})
        }
    }


    render()
    {
        return (
            <React.Fragment>
                <h1>Please run the application in the browser of mobile phone</h1>
            </React.Fragment>
        );
    }

    /*
    render()
    {
        return (
            <React.Fragment>
                <div>
                    <h1>{this.displayName}</h1>
                    <h3>Please type given phrase in textbox. It will be repeated {this.generator.getNumberOfRepetions()} times.</h3>
                </div>


                <div style={{ backgroundColor: 'lightgreen' }}>
                    <h1>
                        Phrase: <b>{this.generator.getCurrentPhrase()}</b> repetition: {this.state.current_rep + 1}
                    </h1>
                </div>

                <input className="form-control input-lg"
                    style={{ backgroundColor: 'lightgreen' }} 
                    type="text" name="userInput" autoComplete="off"  onKeyDown={this.keystrokeDown} onKeyUp={this.keystrokeUp} 
                    onPasteCapture={this.handlePaste} onCopy={this.handleCopy}/>
            </React.Fragment>
        );
    }
    */
}

export default InputComputer;