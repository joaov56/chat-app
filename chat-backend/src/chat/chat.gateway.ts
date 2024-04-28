import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  MessageBody,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

import { AddMessageDto } from './dto/add-message.dto';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  private chatHistory = [];

  private logger = new Logger('ChatGateway');

  @SubscribeMessage('chat') // subscribe to chat event messages
  handleMessage(@MessageBody() payload: AddMessageDto): AddMessageDto {
    this.logger.log(`Message received: ${payload.author} - ${payload.body}`);
    this.chatHistory.push(payload); // add the message to the chat history
    this.server.emit('chat', this.chatHistory); // broadbast a message to all clients
    return payload; // return the same payload data
  }

  // it will be handled when a client connects to the server
  handleConnection(socket: Socket) {
    this.logger.log(`Socket connected: ${socket.id}`);
    this.server.emit('chat', this.chatHistory); // broadcast the chat history to the new client
  }

  // it will be handled when a client disconnects from the server
  handleDisconnect(socket: Socket) {
    this.logger.log(`Socket disconnected: ${socket.id}`);
  }
}
