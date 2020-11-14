import React, { Component } from 'react';
import Keyboard from "react-simple-keyboard";
import 'react-simple-keyboard/build/css/index.css';
import './index.css'
import { PhrasesGenerator } from './PhrasesGenerator'
import {default as UUID} from "node-uuid";

class InputMobileStandard extends Component {
    constructor(props) {
        super(props);

        this.state = {
            layoutName: "default",
            input: ""
        };

        this.keystrokes = []
        this.movement_signals = []

        this.currentSentenceAcquisitions = []

        if(window.DeviceMotionEvent)
        {
            window.addEventListener("devicemotion", this.motion, false);
        }
        else
        {
            console.log("DeviceMotionEvent is not supported");
        }
        this.lastMotion = -100;

        this.userId = (new URLSearchParams(window.location.search)).get("id")
        if (this.userId === null)
        {
            this.userId = UUID.v4()
        }

        this.generator = new PhrasesGenerator({"phrases": [".tie5Roanl"], "repetitions": 20})
    }

    getButtonPositions = () => {
        let buttons = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "a", "s", "d", "f", "g", "h", "j", "k", "l", "{shift}", "z", "x", "c", "v", "b", "n", "m", "{backspace}", ",", "{space}", "."]

        let letterToRect = {}
        buttons.forEach(letter => letterToRect[letter] = this.keyboard.getButtonElement(letter).getBoundingClientRect());

        return letterToRect
    }


    onKeyPress = button => {
        if (button === "{shift}" || button === "{lock}") 
        {
            this.handleShift();
        }
    };


    handleShift = () => {
        const layoutName = this.state.layoutName;

        this.setState({
            layoutName: layoutName === "default" ? "shift" : "default"
        });
    };


    onChange = input => {
        var expectedPhrase = this.generator.getCurrentPhrase();

        while (!expectedPhrase.startsWith(input))
        {
            input = input.slice(0, -1);
        }
        this.setState({ input });
        this.keyboard.setInput(input);
    };

    registerKeystroke = (event, direction) => {
        if (event.target.className.includes("button"))
        {
            var touch = event.changedTouches[0] === undefined ? event.touches[0] : event.changedTouches[0]

            let keystrokeInfo = {
                "letter": event.target.children[0].innerHTML,
                "timeStamp": Math.round(event.timeStamp),
                "x": Math.round(touch.clientX), 
                "y": Math.round(touch.clientY),
                "keyEvent": direction
            }
            this.keystrokes.push(keystrokeInfo)
        }
    }
      
    handleTouchStart = event => {
        this.registerKeystroke(event, "DOWN")
    };


    handleTouchEnd = event => {
        this.registerKeystroke(event, "UP")

        if (this.state.layoutName === "shift")
        {
            this.setState({layoutName:  "default"});
        }

        var expectedPhrase = this.generator.getCurrentPhrase();
        var currentPhrase = this.state.input;

        if (currentPhrase === expectedPhrase)
        {
            this.setState({input: ""})
            this.keyboard.setInput("");


            let dataToRegister = {
                "hash": this.userId,
                "type": "mobile-standard",
                "sentence": expectedPhrase,
                "repetition": this.generator.getCurrentRepetition(),
                "keystrokes": this.keystrokes,
                "button_positions": this.getButtonPositions(),
                "signals": this.movement_signals
            }

            this.keystrokes = [];
            this.movement_signals = [];
            
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
        }
    };


    motion = (event) => {
        let timestamp = Math.round(event.timeStamp);

        if (timestamp > 800000)
        {
            this.props.onTaskCompleted()
        }
        else if (timestamp - this.lastMotion > 20)
        {
            let motion_data = [timestamp, Math.round(100 * event.rotationRate.alpha), Math.round(100 * event.rotationRate.beta), Math.round(100 * event.rotationRate.gamma), 
                Math.round(100 * event.accelerationIncludingGravity.x), Math.round(100 * event.accelerationIncludingGravity.y), Math.round(100 * event.accelerationIncludingGravity.z)]

            this.movement_signals.push(motion_data)
            this.lastMotion = timestamp
        }
    }


    render() {
        return (
            <React.Fragment>
                <div>
                    <h1>{this.displayName}</h1>
                    <h3>Please type given phrase in textbox. It will be repeated {this.generator.getNumberOfRepetions()} times.</h3>
                </div>

                <div style={{ backgroundColor: 'lightgreen' }}>
                    <h2>
                        Phrase: <b>{this.generator.getCurrentPhrase()}</b>
                    </h2>
                    <h4>repetition: {this.generator.getCurrentRepetition() + 1}</h4>
                </div>

                <input
                    className="form-control input-lg"    
                    value={this.state.input}
                    style={{ backgroundColor: 'lightgreen' }} 
                    type="text" name="userInput" autoComplete="off" disabled
                />

                <div className="footer" onTouchStart={this.handleTouchStart} onTouchEnd={this.handleTouchEnd}>
                    <Keyboard
                        keyboardRef={r => (this.keyboard = r)}
                        onChange={this.onChange}
                        onKeyPress={this.onKeyPress}
                        mergeDisplay="true"
                        layoutName={this.state.layoutName}
                        layout={{
                            default: [
                                "1 2 3 4 5 6 7 8 9 0",
                                "q w e r t y u i o p",
                                "a s d f g h j k l",
                                "{shift} z x c v b n m {backspace}",
                                ", {space} ."
                            ],
                            shift: [
                                "1 2 3 4 5 6 7 8 9 0",
                                "Q W E R T Y U I O P",
                                "A S D F G H J K L",
                                "{shift} Z X C V B N M {backspace}",
                                ", {space} ."
                            ],
                        }}
                        display={{
                            "{escape}": "esc ⎋",
                            "{tab}": "tab ⇥",
                            "{backspace}": "⌫",
                            "{capslock}": "caps lock ⇪",
                            "{shift}": "⇧",
                            "{controlleft}": "ctrl ⌃",
                            "{controlright}": "ctrl ⌃",
                            "{altleft}": "alt ⌥",
                            "{altright}": "alt ⌥",
                            "{metaleft}": "cmd ⌘",
                            "{metaright}": "cmd ⌘",
                            "{abc}": "ABC",
                            "{space}": "space"
                        }}
                        disableButtonHold={true}
                        buttonTheme = {[
                            {
                              class: "margin-left",
                              buttons: "A a ,"
                            },
                            {
                              class: "margin-right",
                              buttons: "L l ."
                            },
                            {
                                class: "space",
                                buttons: "{space}"
                            }
                          ]}
                        >
                    </Keyboard>
                </div>
            </React.Fragment>
        );
    }
}

export default InputMobileStandard;