import React, { Component } from 'react';
import { isMobile } from 'react-device-detect';
import InputComputer from './InputComputer'
import InputMobileStandard from './InputMobileStandard'
import InputMobileSwipe from './InputMobileSwipe'

const axios = require('axios');

export class Typing extends Component {
  static displayName = Typing.name;
    constructor(props) {
        super(props);

        this.inputMode = isMobile ? "mobile-classic" : "computer"
        this.userId = (new URLSearchParams(window.location.search)).get("id")

        if (this.userId.endsWith("_swipe") && this.inputMode === "mobile-classic")
        {
            this.inputMode = "mobile-swipe"
        }

        this.state = {
            taskCompleted: false,
            uploaded: false,
            isTextCorrect: true,
        }
    }

    sendDataToAPI = (postMessage) => {
        let endpoint = "ENDPOINT"
        
        axios.post(endpoint, postMessage)
        .then( (response) =>
        {
            this.setState({uploaded: true})
        })
        .catch( (error) =>
        {
            this.setState({uploaded: true})
            console.log("Error occured while transfering data")
        });
    }


    renderCompletedTask() {
        return (
            <div className="container">
                <h1>Thank you for help! You can switch off the browser.</h1>
            </div>
        )
    }


    renderSending() {
        return (
            <div className="container">
                <h1>Sending data, don't switch off the browser!</h1>
            </div>
        )
    }

    
    handleTaskCompleted = () => {
        this.setState({taskCompleted: true})
    }


    renderInput = () => {
        if (this.inputMode === "computer")
            return (<InputComputer onTaskCompleted={this.handleTaskCompleted} sendDataToAPI={this.sendDataToAPI} ></InputComputer>)
        else if (this.inputMode === "mobile-classic")
            return (<InputMobileStandard onTaskCompleted={this.handleTaskCompleted} sendDataToAPI={this.sendDataToAPI}></InputMobileStandard>)
        else 
            return <InputMobileSwipe onTaskCompleted={this.handleTaskCompleted} sendDataToAPI={this.sendDataToAPI}></InputMobileSwipe>
    }

    render() {
        if (this.state.taskCompleted && !this.state.uploaded)
            {return this.renderSending()}
        else if (this.state.taskCompleted && this.state.uploaded)
            {return this.renderCompletedTask()}
        else
        {
        return (
            <div className={!isMobile ? "container" : ""}>
                {this.renderInput()}
            </div>
        );
        }
    }
} 