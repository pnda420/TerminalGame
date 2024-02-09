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

  lastValueToSave: string = ""

  saveSlot1 = "";
  saveSlot2 = "";
  saveSlot3 = "";

  ipAddress = "192.168.123.23";

  constructor() {
    this.audioContext = new AudioContext();
    this.loadSound('assets/sounds/click.mp3', true); // Laden des KeyDown-Sounds
    this.loadSound('assets/sounds/release.mp3', false);  // Laden des KeyUp-Sounds
  }

  processCommand(command: string): void {
    const lowerCommand = command.toLowerCase();

    if (lowerCommand === 'help') {
      this.commandHistory.push('Available commands:');
      this.commandHistory.push('[showip] - Shows current IP address');
      this.commandHistory.push('[setslot {slotid 1-3}] - sets last value in [] in selected slot');
      this.commandHistory.push('[getslot {slotid 1-3}] - Shows what is in selected slot');
      this.commandHistory.push('[showallslots] - Shows all slots');
      this.commandHistory.push('[showip] - Shows current IP address');
    } 

    else if (lowerCommand === 'clear') {
      this.commandHistory = [];
    } 

    else if (lowerCommand.startsWith('setslot ')) {
      let slot = parseInt(command.substring(8))
      if (slot == 1) { this.saveSlot1 = this.lastValueToSave}
      if (slot == 2) { this.saveSlot2 = this.lastValueToSave}
      if (slot == 3) { this.saveSlot3 = this.lastValueToSave}
      this.commandHistory.push("Saved in slot: " + slot)
    } 

    else if (lowerCommand.startsWith('getslot ')) {
      let slot = parseInt(command.substring(8));
      if (slot === 1) {
        if (this.saveSlot1) {
          this.commandHistory.push(this.saveSlot1);
        } else {
          this.commandHistory.push("Nothing in Slot 1");
        }
      }
      if (slot === 2) {
        if (this.saveSlot2) {
          this.commandHistory.push(this.saveSlot2);
        } else {
          this.commandHistory.push("Nothing in Slot 2");
        }
      }
      if (slot === 3) {
        if (this.saveSlot3) {
          this.commandHistory.push(this.saveSlot3);
        } else {
          this.commandHistory.push("Nothing in Slot 3");
        }
      }
    }

    else if (lowerCommand.startsWith('showallslots')) {
      this.commandHistory.push("Slot 1: " + this.saveSlot1);
      this.commandHistory.push("Slot 2: " + this.saveSlot2);
      this.commandHistory.push("Slot 3: " + this.saveSlot3);
    }


    else if (lowerCommand.startsWith('showip')) {
      this.commandHistory.push("Ip Address: [" + this.ipAddress + "]");
      this.lastValueToSave = this.ipAddress;
    } 



    else if (lowerCommand.startsWith('start')) {
      this.commandHistory.push('Ur Started the game. Have fun Hacking the Server');
      //let value = parseInt(command.substring(6))
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
