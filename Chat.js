import { fetchMessages, sendMessage } from "./api";
import { Message } from "./Message";

export class Chat {
    constructor(currentUser, otherUser, messagesContainer, messageInput, sendButton, fileInput, searchInput, searchButton) {
        this.chatId = null;
        this.currentUser = currentUser;
        this.otherUser = otherUser;
        this.messagesContainer = messagesContainer;
        this.messageInput = messageInput;
        this.sendButton = sendButton;
        this.fileInput = fileInput;
        this.quotedToMessageId = null;
        this.messages = [];
        this.searchInput = searchInput;
        this.searchButton = searchButton;
        this.init();
    }

    async init() {
        await this.createChat();
        if (this.chatId) {
            this.sendButton.addEventListener('click', () => this.sendMessage());
            this.pollMessages();
        }
    }

    async createChat() {
        try {
            const chatId = await createChatOnServer(this.currentUser.id, this.otherUser.id);
            this.chatId = chatId;
        } catch (error) {
            console.error('Error creating chat:', error);
        }
    }

    async sendMessage() {
        const messageText = this.messageInput.value.trim();
        const files = Array.from(this.fileInput.files);

        if (messageText || files.length) {
            const message = new Message(messageText, this.currentUser, [], this.quotedToMessageId);
            this.messages.push(message);
            this.addMessage(message);

            const success = await sendMessage(this.chatId, message, files);

            if (success) {
                message.updateStatus(MESSAGE_STATUSES.SENT);
            } else {
                message.updateStatus(MESSAGE_STATUSES.ERROR);
            }

            this.updateDisplayedMessage(message);
            this.messageInput.value = '';
            this.fileInput.value = '';
            this.quotedToMessageId = null;
        }
    }

    async pollMessages() {
        setInterval(async () => {
            const data = await fetchMessages(this.chatId);

            data.forEach(item => {
                let existingMessage = this.messages.find(msg => msg.id === item.id);

                if (!existingMessage) {
                    const owner = item.ownerId === this.currentUser.id ? this.currentUser : this.otherUser;
                    const message = new Message(item.text, owner, item.files, item.quotedMessageId, MESSAGE_STATUSES.DELIVERED);
                    this.messages.push(message);
                    this.addMessage(message);

                    if (owner.id !== this.currentUser.id) {
                        this.notifyUserOfNewMessage();
                    }
                } else if (existingMessage.status !== MESSAGE_STATUSES.DELIVERED) {
                    existingMessage.updateStatus(MESSAGE_STATUSES.DELIVERED);
                    this.updateDisplayedMessage(existingMessage);
                }
            });
        }, 3000);
    }

    notifyUserOfNewMessage() {
        alert('You have received a new message.');
    }

    displayMessages(messages) {
        this.messagesContainer.innerHTML = '';
        messages.forEach(msg => {
            this.addMessage(msg.toString());
        });
    }

    addMessage(message) {
        const div = document.createElement('div');
        div.textContent = message.toString();
        div.id = `msg-${message.id}`;
        div.addEventListener('click', () => this.setReplyTo(message.id));
        this.messagesContainer.appendChild(div);
    }

    setReplyTo(messageId) {
        this.quotedToMessageId = messageId;
        this.messageInput.focus();
    }

    updateDisplayedMessage(message) {
        const messageDiv = document.getElementById(`msg-${message.id}`);
        if (messageDiv) {
            messageDiv.textContent = message.toString();
        }
    }

    searchMessages() {
        const keyword = this.searchInput.value.trim().toLowerCase();
        if (keyword) {
            const searchResults = this.messages.filter(message =>
                message.text.toLowerCase().includes(keyword)
            );
            this.displayMessages(searchResults);
        }
    }
}