import PianoRoll from './pianoroll.js';

class PianoRollDisplay {
    constructor(csvURL) {
        this.csvURL = csvURL;
        this.data = null;
    }

    async loadPianoRollData() {
        try {
            const response = await fetch('https://pianoroll.ai/random_notes');
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            this.data = await response.json();
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    preparePianoRollCard(rollId) {
        const cardDiv = document.createElement('div');
        cardDiv.classList.add('piano-roll-card');



        // Create and append other elements to the card container as needed
        const descriptionDiv = document.createElement('div');
        descriptionDiv.classList.add('description');
        descriptionDiv.textContent = `This is a piano roll number ${rollId}`;
        cardDiv.appendChild(descriptionDiv);

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.classList.add('piano-roll-svg');
        svg.setAttribute('width', '80%');
        svg.setAttribute('height', '180');

        // Append the SVG to the card container
        cardDiv.appendChild(svg);

        return { cardDiv, svg }
    }

    implementSelectionTool(svg) {
        let isSelecting = false;
        let selectionStartX = 0;
        let selectionEndX = 0;
        let pianoRollSvg;

        svg.addEventListener('mousedown', (event) => {
            isSelecting = true;
            selectionStartX = event.offsetX;
            selectionEndX = event.offsetX;
            this.updateSelectionRect(selectionStartX, selectionEndX, true, 'rgba(173, 216, 230, 0.5)'); // Set the initial color for the selection
        });

        svg.addEventListener('mousemove', (event) => {
            if (isSelecting) {
                selectionEndX = event.offsetX;
                this.updateSelectionRect(selectionStartX, selectionEndX, true, 'rgba(173, 216, 230, 0.5)'); // Set the color dynamically during the selection
            }
        });

        svg.addEventListener('mouseup', () => {
            isSelecting = false;
            this.captureSelectionData(selectionStartX, selectionEndX);
            this.updateSelectionRect(selectionStartX, selectionEndX, false, ''); // Reset the color after the selection is complete
        });

        this.updateSelectionRect = (start, end, selecting, color) => {
            const minX = Math.min(start, end);
            const width = Math.abs(end - start);
            pianoRollSvg = document.querySelector('.piano-roll-svg');
            if (selecting) {
                pianoRollSvg.style.backgroundColor = color; // Set the background color dynamically during selection
            } else {
                pianoRollSvg.style.backgroundColor = ''; // Reset the background color after selection
            }
        };
    }

    captureSelectionData(start, end) {
        console.log('Selection Start:', start, 'Selection End:', end);
        const numberOfNotes = Math.abs(end - start); // Assuming the unit here is representing the number of notes.
        console.log('Number of Notes:', numberOfNotes);
    }


    async generateSVGs() {
        if (!this.data) await this.loadPianoRollData();
        if (!this.data) return;

        const pianoRollContainer = document.getElementById('pianoRollContainer');
        pianoRollContainer.innerHTML = '';
        for (let it = 0; it < 20; it++) {
            const start = it * 60;
            const end = start + 60;
            const partData = this.data.slice(start, end);

            const { cardDiv, svg } = this.preparePianoRollCard(it)
            this.implementSelectionTool(svg)
            pianoRollContainer.appendChild(cardDiv);
            const roll = new PianoRoll(svg, partData);
        }
    }

    mainCardShow(rolls) {
            rolls.forEach((roll) => {
                roll.addEventListener('click', () => {
                    // remove the 'main' class from all the piano rolls
                    rolls.forEach((roll) => roll.classList.remove('main'));
                    // add the 'main' class to the clicked piano roll
                    roll.classList.add('main');
                });
            });
        }
        // Additional operations and results integrated
    getNumberOfNotes(start, end) {
        // Your logic to calculate the number of notes within the selection
        // For demonstration purposes, we return a random number here
        return Math.abs(end - start);
    }
}

/* Load Btn Click */
document.getElementById('loadCSV').addEventListener('click', async() => {
    const csvToSVG = new PianoRollDisplay();
    await csvToSVG.generateSVGs();

    // Main Card Show
    const pianoRollCards = document.querySelectorAll('.piano-roll-card');
    const cards = new PianoRollDisplay();
    cards.mainCardShow(pianoRollCards);
});




/* 
const pianoRoll = document.getElementById('piano-roll');
let isSelecting = false;
let startX, endX;
let selectionData = [];
let colors = ['#FF5733', '#33FF57', '#5733FF', '#33A3FF', '#FF33A3'];
let lastUsedColorIndex = -1;

pianoRoll.addEventListener('mousedown', (e) => {
    startX = e.offsetX;
    isSelecting = true;
});

pianoRoll.addEventListener('mousemove', (e) => {
    if (isSelecting) {
        endX = e.offsetX;
        renderSelections();
        renderSelection(startX, endX);
    }
});

pianoRoll.addEventListener('mouseup', () => {
    if (isSelecting) {
        isSelecting = false;
        selectionData.push({
            start: startX,
            end: endX
        });
        console.log("Selection start point: " + startX);
        console.log("Selection end point: " + endX);
        console.log("Number of notes within the selection: " + getNumberOfNotes(startX, endX));
    }
});

function renderSelection(start, end) {
    let selectionBox = document.createElement('div');
    let deleteIcon = document.createElement('span');
    deleteIcon.innerHTML = '<i class="bi bi-x-circle"></i>';
    deleteIcon.classList.add('delete-icon');
    deleteIcon.addEventListener('click', () => {
        const index = Array.from(pianoRoll.children).indexOf(selectionBox);
        if (index > -1) {
            selectionData.splice(index, 1);
            pianoRoll.removeChild(selectionBox);
        }
    });

    lastUsedColorIndex = (lastUsedColorIndex + 1) % colors.length;
    const color = colors[lastUsedColorIndex];
    selectionBox.style.backgroundColor = color + '80'; // 50% opacity (80 in hexadecimal)

    selectionBox.style.left = Math.min(start, end) + 'px';
    selectionBox.style.top = '0px';
    selectionBox.style.width = Math.abs(end - start) + 'px';
    selectionBox.style.height = '100%';
    selectionBox.classList.add('selection-box');
    selectionBox.appendChild(deleteIcon);
    pianoRoll.appendChild(selectionBox);
}

function renderSelections() {
    clearSelections();
    selectionData.forEach((data) => {
        renderSelection(data.start, data.end);
    });
}

function clearSelections() {
    const selectionBoxes = document.getElementsByClassName('selection-box');
    while (selectionBoxes.length > 0) {
        pianoRoll.removeChild(selectionBoxes[0]);
    }
}

function getNumberOfNotes(start, end) {
    // Your logic to calculate the number of notes within the selection
    // For demonstration purposes, we return a random number here
    return Math.floor(Math.random() * 10);
} */