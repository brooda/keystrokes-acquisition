import { Component } from 'react';

export class PhrasesGenerator extends Component {
    constructor(props) {
        super(props);

        this.sequences = props["phrases"];
        this.repetitionTimes = props["repetitions"];

        this.phrases = this.sequences
            .map(phrase => new Array(this.repetitionTimes).fill(phrase))
            .flat();

        this.currentIndex = 0;
    }

    getSequencesLength = () => {
        return this.sequences.length;
    }

    getNumberOfRepetions = () => {
        return this.repetitionTimes;
    }

    getCurrentPhrase = () => {
        return this.phrases[this.currentIndex];
    }

    getCurrentRepetition = () => {
        return this.currentIndex % this.repetitionTimes;
    }

    next = () => {
        return this.phrases[this.currentIndex++];
    }

    hasNext = () => {
        return this.currentIndex < this.phrases.length - 1;
    }

    wasLastRepetitonOfWord = () => {
        return this.currentIndex % this.repetitionTimes === this.repetitionTimes - 1;
    }
}