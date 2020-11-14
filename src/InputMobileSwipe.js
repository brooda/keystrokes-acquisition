import React, { Component } from 'react';
import Keyboard from "react-simple-keyboard";
import 'react-simple-keyboard/build/css/index.css';
import './index.css'
import { PhrasesGenerator } from './PhrasesGenerator'
import {default as UUID} from "node-uuid";
import Swipe from "./swipe/swipe.js";
import MetaTags from 'react-meta-tags';


class InputMobileSwipe extends Component {
    constructor(props) {
        super(props);

        this.currentSentenceAcquisitions = []

        this.userId = (new URLSearchParams(window.location.search)).get("id")
        if (this.userId === null)
        {
            this.userId = UUID.v4()
        }

        this.generator = new PhrasesGenerator({"phrases": ["arctic"], "repetitions": 20})

        if(window.DeviceMotionEvent)
        {
            window.addEventListener("devicemotion", this.motion, false);
        }
        else
        {
            console.log("DeviceMotionEvent is not supported");
        }
        this.lastMotion = -100;
        this.movement_signals = []

        this.state = {
            currentPhraseRemainder: this.generator.getCurrentPhrase(),
            layoutName: "default",
            isTextCorrect: true,
            input: "",
            fingerBadRelease: false,
        };
    }

    getButtonPositions = () => {
        let buttons = ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "a", "s", "d", "f", "g", "h", "j", "k", "l", "{shift}", "z", "x", "c", "v", "b", "n", "m", "{backspace}", ",", "{space}", "."]

        let letterToRect = {}
        buttons.forEach(letter => letterToRect[letter] = this.keyboard.getButtonElement(letter).getBoundingClientRect());

        return letterToRect
    }


    onKeyPress = button => {
        if(this.state.currentPhraseRemainder.length !== 0 && button === this.state.currentPhraseRemainder[0])
        {
            this.setState({fingerBadRelease: false,
                currentPhraseRemainder: this.state.currentPhraseRemainder.substr(1),
                input: this.state.input + button 
            });

            this.keyboard.setInput(this.state.input + button);
        }
        else if(this.state.currentPhraseRemainder.length === 0)
        {
            this.setState({input: ""})
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

    handleTouchEnd = (event) => {
        if (this.state.input === "" && this.state.currentPhraseRemainder.length === 0)
        { 
            let dataToRegister = {
                "repetition": this.generator.getCurrentRepetition(),
                "swiping_positions": this.getSwipingPositions(),
                "signals": this.movement_signals
            }

            this.currentSentenceAcquisitions.push(dataToRegister);
            this.movement_signals = []

            if (this.generator.wasLastRepetitonOfWord())
            {
                this.props.sendDataToAPI(
                    {
                        "hash": this.userId,
                        "type": "mobile-swipe",
                        "sentence": this.generator.getCurrentPhrase(),
                        "acquisitions": this.currentSentenceAcquisitions,
                        "button_positions": this.getButtonPositions(),
                    }
                )
                this.currentSentenceAcquisitions = [];
            }


            if (!this.generator.hasNext()) {
                this.props.onTaskCompleted()
                return
            }
            else
            {
                this.setState({
                    currentPhraseRemainder: this.generator.next(), 
                })    
            }
        }
        else
        {
            console.log("Finger released before phrase was finished")
            this.clearSwipingPositions()
            this.keyboard.setInput("");
            
            this.setState({
                input: "",
                currentPhraseRemainder: this.generator.getCurrentPhrase(),
                fingerBadRelease: true
            })
        }
    }


    getSwipingPositions = () => {
        let ret = [...this.keyboard.modules["swipe"].swipingPositions]
        this.keyboard.modules["swipe"].clearSwipingPositions()
        return ret
    }

    clearSwipingPositions = () => {
        this.keyboard.modules["swipe"].clearSwipingPositions()
    }

    render() {
        return (
            <React.Fragment>
                <MetaTags>
                <meta name="viewport" content="width=device-width; initial-scale=0.5, maximum-scale=0.5, minimum-scale=1.0; " />
                    <meta name="viewport" content="width=device-width, user-scalable=no"></meta>
                    <meta http-equiv='cache-control' content='no-cache'></meta>
                    <meta http-equiv='expires' content='0'></meta>
                    <meta http-equiv='pragma' content='no-cache'></meta>
                </MetaTags>
            
                <div>
                    <h1>{this.displayName}</h1>
                    <h4>Please swipe given phrase. It will be repeated {this.generator.getNumberOfRepetions()} times. Don't release finger until phrase is finished.
                    </h4>
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
                    style={{ backgroundColor: this.state.isTextCorrect ? 'lightgreen' : "red" }} 
                    type="text" name="userInput" autoComplete="off" disabled
                />

                
                {
                this.state.fingerBadRelease && 
                <div style={{ backgroundColor: 'lightcoral' }}>
                    Don't release finger until phrase is finished. Please repeat swipe.
                </div>
                }
                
                <div className="footer" onTouchEnd={this.handleTouchEnd}>
                    <Keyboard
                        keyboardRef={r => (this.keyboard = r)}
                        onKeyPress={this.onKeyPress}
                        mergeDisplay="true"
                        layoutName={this.state.layoutName}
                        layout={{
                            default: [
                                "q w e r t y u i o p",
                                "a s d f g h j k l",
                                "{shift} z x c v b n m {backspace}",
                                ", {space} ."
                            ],
                            shift: [
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
                        useMouseEvents={true}   
                        modules={[Swipe]} 
                        >
                    </Keyboard>
                </div>
            </React.Fragment>
        );
    }
}

export default InputMobileSwipe;