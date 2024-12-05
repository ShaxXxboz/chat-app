export async function createChatOnServer(currentUserId, otherUserId) {
    try {
        const response = await fetch('/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ currentUserId, otherUserId })
        });

        if (!response.ok) {
            throw new Error('Failed to create chat');
        }

        const data = await response.json();
        return data.chatId;
    } catch (error) {
        console.error('Error creating chat:', error);
        throw error;
    }
}

export async function sendMessage(chatId, message, files) {
    const formData = new FormData();
    formData.append('chatId', chatId);
    formData.append('text', message.text);
    formData.append('ownerId', message.owner.id);
    formData.append('quotedMessageId', message.quotedMessageId);

    for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
    }

    try {
        const response = await fetch('/send', {
            method: 'POST',
            body: formData
        });

        return response.ok;
    } catch (error) {
        console.error('Error sending message:', error);
        return false;
    }
}

export async function fetchMessages(chatId) {
    try {
        const response = await fetch(`/chat/${chatId}/messages`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching messages:', error);
        return [];
    }
}