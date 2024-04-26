class ButtonControl {
    constructor(vsAi, vsLocal, vsOnline, tournament) {
        // Create a button element with Font Awesome icons
        this.vsAiButton = this.createButton('Local AI      ', 'fas fa-gamepad', vsAi);
        this.vsLocalButton = this.createButton('Local 1v1  ', 'fas fa-users', vsLocal);
        this.vsOnlineButton = this.createButton('Online        ', 'fas fa-globe', vsOnline);
        this.tournament = this.createButton('Tournament        ', 'fas fa-globe', tournament);


        // Get the gameControls div and append the buttons to it
        this.gameControlsDiv = document.getElementById('gameControls');
        this.gameControlsDiv.appendChild(this.vsAiButton);
        this.gameControlsDiv.appendChild(this.vsLocalButton);
        this.gameControlsDiv.appendChild(this.vsOnlineButton);
        this.gameControlsDiv.appendChild(this.tournament);

    }

    createButton(text, iconClass, clickHandler) {
        var button = document.createElement('button');
        button.textContent = text;

        // Create a span element for the icon
        var iconSpan = document.createElement('span');
        iconSpan.className = iconClass;

        // Append the icon to the button
        button.appendChild(iconSpan);

        // Add click event listener
        button.addEventListener('click', clickHandler);

        // Add the common button class
        button.className = 'game-button';

        return button;
    }

    hideVsOnlineButton() {
        if (this.vsOnlineButton) {
            this.vsOnlineButton.style.display = 'none';
            this.vsAiButton.style.display = 'none';
            this.vsLocalButton.style.display = 'none';
            this.tournament.style.display = 'none';

        }
    }

    showVsOnlineButton() {
        if (this.vsOnlineButton) {
            this.vsOnlineButton.style.display = 'block';
            this.vsAiButton.style.display = 'block';
            this.vsLocalButton.style.display = 'block';   
            this.tournament.style.display = 'block';   

        }
    }
}

export default ButtonControl;
