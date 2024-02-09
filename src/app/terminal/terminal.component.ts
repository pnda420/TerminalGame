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
  private keyDownSoundBuffer: AudioBuffer | null = null;
  private keyUpSoundBuffer: AudioBuffer | null = null;
  keysPressed: { [key: string]: boolean } = {};

  constructor() {
    this.audioContext = new AudioContext();
    this.loadSound('assets/sounds/click.mp3', true); // Laden des KeyDown-Sounds
    this.loadSound('assets/sounds/release.mp3', false);  // Laden des KeyUp-Sounds
  }






  processCommand(command: string): void {
    const lowerCommand = command.toLowerCase();
    if (lowerCommand === 'help') {
      this.commandHistory.push('Available commands: help, clear, hack, guess [password], dectohex [decimal]');
    } 

    else if (lowerCommand === 'clear') {
      this.commandHistory = [];
    } 

    else if (lowerCommand.startsWith('dectohex ')) {
      let value = parseInt(command.substring(9))
      this.commandHistory.push(value + ': ' + value.toString(16));
    }

    else if (lowerCommand.startsWith('dectobin ')) {
      let value = parseInt(command.substring(9))
      this.commandHistory.push(value + ': ' + value.toString(2));
    }

    else {
      this.commandHistory.push(`Unknown command: ${command}`);
    }

  }


  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    this.terminalInput.nativeElement.focus();
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {

    if (!this.keysPressed[event.key]) {
      this.keysPressed[event.key] = true; // Setze das Flag für die Taste
      this.playSound(this.keyDownSoundBuffer); // Spielt den Sound nur beim ersten Tastendruck ab
    }
  }

  @HostListener('window:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent): void {
    if (this.keysPressed[event.key]) {
      this.keysPressed[event.key] = false; // Setze das Flag zurück, wenn die Taste losgelassen wird
      this.playSound(this.keyUpSoundBuffer); // Spielt den Sound beim Loslassen der Taste ab
    }
  }

  onEnterPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.captureCommand();
    }
  }
  captureCommand(): void {
    if (this.currentInput.trim() !== '') {
      this.commandHistory.push(this.currentInput);
      this.processCommand(this.currentInput);
      this.currentInput = '';
    }
  }

  playSound(buffer: AudioBuffer | null): void {
    if (this.audioContext && buffer) {
      const source = this.audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(this.audioContext.destination);
      source.start(0);
    }
  }

  loadSound(url: string, isKeyDown: boolean): void {
    fetch(url)
      .then(response => response.arrayBuffer())
      .then(buffer => this.audioContext.decodeAudioData(buffer))
      .then(decodedBuffer => {
        if (isKeyDown) {
          this.keyDownSoundBuffer = decodedBuffer;
        } else {
          this.keyUpSoundBuffer = decodedBuffer;
        }
      })
      .catch(error => console.error('Error loading sound:', error));
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      this.terminalContainer.nativeElement.scrollTop = this.terminalContainer.nativeElement.scrollHeight;
    } catch (error) { }
  }
}
