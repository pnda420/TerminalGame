import { Component, ViewChild, ElementRef, AfterViewChecked, HostListener } from '@angular/core';

@Component({
  selector: 'app-terminal',
  templateUrl: './terminal.component.html',
  styleUrls: ['./terminal.component.scss']
})

export class TerminalComponent implements AfterViewChecked {
  @ViewChild('terminalContainer', { static: true }) private terminalContainer!: ElementRef;
  @ViewChild('terminalInput', { static: false }) private terminalInput!: ElementRef;

  public commandHistory: string[] = [];
  public currentInput: string = '';

  private audioContext: AudioContext;
  private typingSoundBuffers: AudioBuffer[] = [];



  isHacked = false;
  password = 'RAIDERS';

  checkPassword(input: string): boolean {
    return input.toUpperCase() === this.password;
  }

  constructor() {
    this.audioContext = new AudioContext();
    this.loadSounds([
      'assets/sounds/1.mp3',
      'assets/sounds/2.mp3',
      'assets/sounds/3.mp3',
      'assets/sounds/4.mp3',
      'assets/sounds/5.mp3',
      'assets/sounds/6.mp3'
    ]);
  }


  private loadSounds(urls: string[]): void {
    urls.forEach(url => {
      fetch(url)
        .then(response => response.arrayBuffer())
        .then(buffer => this.audioContext.decodeAudioData(buffer))
        .then(decodedBuffer => this.typingSoundBuffers.push(decodedBuffer))
        .catch(error => console.error('Error loading sound:', error));
    });
  }

  private playTypingSound(): void {
    const soundIndex = Math.floor(Math.random() * this.typingSoundBuffers.length);
    const selectedBuffer = this.typingSoundBuffers[soundIndex];
    if (this.audioContext && selectedBuffer) {
      const source = this.audioContext.createBufferSource();
      source.buffer = selectedBuffer;
      source.connect(this.audioContext.destination);
      source.start(0);
    }
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      this.terminalContainer.nativeElement.scrollTop = this.terminalContainer.nativeElement.scrollHeight;
    } catch (error) { }
  }

  focusInput(): void {
    this.terminalInput.nativeElement.focus();
  }

  captureCommand(): void {
    if (this.currentInput.trim() !== '') {
      this.commandHistory.push(this.currentInput);
      this.processCommand(this.currentInput);
      this.currentInput = '';
    }
  }

  processCommand(command: string): void {
    const lowerCommand = command.toLowerCase();

    if (lowerCommand === 'help') {
      this.commandHistory.push('Available commands: help, clear, hack, guess [password]');
    } else if (lowerCommand === 'clear') {
      this.commandHistory = [];
    } else if (lowerCommand.startsWith('guess ')) {
      const guess = command.substring(6).toUpperCase(); // Entferne "guess " und konvertiere zu Großbuchstaben
      if (guess.length !== this.password.length) {
        this.commandHistory.push(`Password must be ${this.password.length} characters long.`);
      } else if (this.checkPassword(guess)) {
        this.isHacked = true;
        this.commandHistory.push('Correct password! The server is hacked.');
      } else {
        this.commandHistory.push(`Incorrect password: ${guess}`);
        // Geben Sie dem Benutzer Hinweise basierend auf dem geratenen Passwort
        this.giveHints(guess);
      }
    } else if (lowerCommand === 'hack') {
      if (this.isHacked) {
        this.commandHistory.push('Server is already hacked.');
      } else {
        this.commandHistory.push('Server is secure. Try guessing the password with "guess [password]".');
      }
    } else {
      this.commandHistory.push(`Unknown command: ${command}`);
    }
  }

  giveHints(guess: string): void {
    let correctPosition = 0; // Anzahl der Buchstaben an der richtigen Stelle
    let correctLetters = 0; // Anzahl der richtigen Buchstaben an der falschen Stelle
    const password = this.password.toUpperCase();

    // Prüfe jeden Buchstaben
    for (let i = 0; i < guess.length; i++) {
      if (guess[i] === password[i]) {
        correctPosition++;
      } else if (password.includes(guess[i])) {
        correctLetters++;
      }
    }

    this.commandHistory.push(`Correct letters in the right place: ${correctPosition}`);
    this.commandHistory.push(`Correct letters but in the wrong place: ${correctLetters}`);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    this.terminalInput.nativeElement.focus();
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    this.playTypingSound();
  }

  onEnterPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.captureCommand();
    }
  }
}
