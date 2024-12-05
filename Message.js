const MESSAGE_STATUSES = {
    SENDING: 'sending',
    SENT: 'sent',
    DELIVERED: 'delivered',
    ERROR: 'error'
};

export class Message {
    constructor(text, owner, files = [], quotedMessageId = null) {
        this.text = text;
        this.owner = owner;
        this.files = files;
        this.quotedMessageId = quotedMessageId;
        this.timestamp = new Date();
        this.status = MESSAGE_STATUSES.SENDING;
    }

    updateStatus(newStatus) {
        this.status = newStatus;
    }

    toString() {
        return `${this.owner.name}: ${this.text} (${this.timestamp.toLocaleTimeString()}) [${this.status}]`;
    }
}