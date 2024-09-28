import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Message } from '../models/message.model';
import { ChatService } from '../services/chat.service';
import { SpeechRecognition } from '@capacitor-community/speech-recognition'; // Importa SpeechRecognition
import { TextToSpeech } from '@capacitor-community/text-to-speech'; // Importa TextToSpeech
import { IonContent } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  // @ViewChild('chatContainer') chatContainer!: ElementRef;
  @ViewChild(IonContent) content!: IonContent; // Añade una referencia al contenedor de los mensajes
  messages: Message[] = [];
  form: FormGroup;
  loading = false;
  errorMessage: string | null = null;

  constructor(private chatService: ChatService) {
    this.form = new FormGroup({
      prompt: new FormControl('', [Validators.required, Validators.minLength(1)]),
    });
  }

  // Función para enviar el mensaje desde el formulario al backend y recibir respuestas en texto
  async submit() {
    const message = this.form.value.prompt?.trim();
    if (!message) return;

    this.addMessage('me', message); // Muestra el mensaje del usuario
    this.form.reset(); // Resetea el formulario
    this.processMessage(message, false); // Procesa el mensaje para respuestas en texto
  }

  // Nueva función para iniciar la recepción de voz y dar respuestas en voz
  async startListening() {
    // Solicita permisos para usar el micrófono
    await SpeechRecognition.requestPermissions();

    // Inicia el reconocimiento de voz después de verificar los permisos
    SpeechRecognition.start({
      language: 'es-ES',
      prompt: 'Habla ahora...', // Configuración válida para SpeechRecognition.start()
    })
      .then((result) => {
        const text = result.matches && result.matches.length > 0 ? result.matches[0] : '';
        if (text) {
          this.addMessage('me', text);
          this.processMessage(text, true);
        } else {
          console.log('No se reconoció ningún texto.');
        }
      })
      .catch((error) => console.log('Error:', error));
  }

  // Función común para procesar el mensaje enviándolo al backend y manejando la respuesta
  private processMessage(text: string, isVoiceResponse: boolean) {
    this.addMessage('bot', ''); // Añade un mensaje vacío para la respuesta del bot
    this.form.disable();
    this.loading = true;
    this.errorMessage = null;

    this.chatService.sendMessage(text).subscribe({
      next: (res) => {
        const botMessage = res?.response || 'Lo siento, no pude procesar tu solicitud.';
        this.updateBotMessage(botMessage);

        // Condición para decidir si la respuesta debe ser en voz o solo texto
        if (isVoiceResponse) {
          this.speakResponse(botMessage); // Reproduce la respuesta en voz
        }
      },
      error: (error) => {
        this.updateBotMessage('Lo siento, no pude procesar tu solicitud.');
        this.errorMessage = 'Hubo un problema al obtener la respuesta. Inténtalo nuevamente.';
        console.error('Error al obtener respuesta:', error);
      },
      complete: () => {
        this.loading = false;
        this.form.enable();
      },
    });
  }

  // Función para agregar mensajes a la conversación y desplazar el scroll hacia abajo
  private addMessage(sender: 'me' | 'bot', content: string) {
    this.messages.push({ sender, content });
    this.scrollToBottom(); // Llama a la función de scroll automático después de añadir un mensaje
  }

  // Función para desplazar automáticamente el scroll hacia el final del contenedor de mensajes
  private scrollToBottom() {
    setTimeout(() => {
      this.content.scrollToBottom(600); // Desplazamiento suave en 300ms
    }, 100); // Tiempo para permitir que el nuevo mensaje sea renderizado
  }

  // Función para actualizar el último mensaje del bot
  private updateBotMessage(content: string) {
    const lastMessageIndex = this.messages.length - 1;
    if (lastMessageIndex >= 0) {
      this.messages[lastMessageIndex].content = content;
      this.scrollToBottom(); // Asegura que el scroll se ajuste cuando el contenido del mensaje cambia
    }
  }

  // Función para reproducir la respuesta del bot en voz alta
  private async speakResponse(text: string) {
    await TextToSpeech.speak({
      text: text,
      lang: 'es-ES',
      rate: 1.0,
    });
  }

  ionViewDidEnter() {
    this.scrollToBottom(); // Asegúrate de que el scroll se realice cuando la vista esté completamente cargada
  }

}
