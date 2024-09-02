class SpeechRecognition {
    constructor() {
        try {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.lang = 'en-US';
            this.noteContent = '';
            this.instructions = '';
        } catch (e) {
            console.error(e);
            return;
        }

        this.listeners = {};

        this.recognition.onresult = (event) => {
            const current = event.resultIndex;

            // Get a transcript of what was said.
            const transcript = event.results[ current ][ 0 ].transcript;

            const mobileRepeatBug = (current == 1 && transcript == event.results[0][0].transcript);

            if (!mobileRepeatBug) {
                this.noteContent = transcript;
                this.fire('onResult', transcript);
                console.log('mobileRepeatBug', this.noteContent);
            }
        };

        this.recognition.onstart = () => {
            this.setInstructions('Voice recognition activated. Try speaking into the microphone');
        };

        this.recognition.onspeechend = () => {
            this.setInstructions('You were quiet for a while so voice recognition turned itself off');
        };

        this.recognition.onerror = (event) => {
            if (event.error === 'no-speech')
                this.setInstructions('No speech was detected. Try again');
			else
				console.log(event.error);				
        };

        document.addEventListener('keydown', e => this.initKeyDownHandlers(e));

        console.log('SpeechRecognition init...');
    }

    fire(event, data) {
        if (this.listeners[ event ])
            this.listeners[ event ].forEach(cb => cb(data));
    }

    on(event, callback) {
        if (!this.listeners[ event ])
            this.listeners[ event ] = [];
        this.listeners[ event ].push(callback);
    }

    setInstructions(text) {
        this.instructions = text;
        console.log('Instructions', text);
    }

    setGrammarList(list = []) {
        const grammar = `#JSGF V1.0; grammar colors; public <color> = ${list.join(' | ')} ;`;
        console.log('List set', grammar);
        // const speechRecognitionList = new SpeechGrammarList();
        // speechRecognitionList.addFromString(grammar, 1);
        // this.recognition.grammars = speechRecognitionList;
    }

    initKeyDownHandlers(e) {
        if (!e.shiftKey) return false;

        console.log('key down', e.keyCode);
        switch (e.keyCode) {
            case 75: return this.startRecord();
        }
    }

    startRecord() {
        console.log('start record');
        this.recognition.start();
    }

    stopRecord() {
        this.recognition.stop();

        if(!this.noteContent.length) {
            this.setInstructions('Could not save empty note. Please add a message to your note.');
        } else {
            console.log('Save', this.noteContent);
            this.noteContent = '';
            this.setInstructions('Note saved successfully.');
        }
    }

    destruct() {
        $(document).off('keydown', this.initKeyDownHandlers);
    }
}

export default SpeechRecognition;