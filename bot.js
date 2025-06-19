const fetch = require('node-fetch');

class Bot {
    constructor() {
        if (!process.env.MEZON_API_KEY) {
            throw new Error('MEZON_API_KEY is not set in environment variables');
        }
        this.apiKey = process.env.MEZON_API_KEY;
        // Initialize user decks storage
        this.userDecks = new Map();
    }

    async handleWebhook(data) {
        try {
            await this.handleIncomingMessage(data);
        } catch (error) {
            console.error('Error handling webhook:', error);
            throw error;
        }
    }

    async handleIncomingMessage(body) {
        const message = body.message;
        const userId = message.from.id;
        const text = message.text;

        if (!text.startsWith('/')) {
            return; // Ignore non-command messages
        }

        const command = text.split(' ')[0].toLowerCase();
        
        switch (command) {
            case '/addcard':
                await this.addCardHandler(userId, text);
                break;
            case '/review':
                await this.reviewHandler(userId);
                break;
            case '/list':
                await this.listCardsHandler(userId);
                break;
            case '/quizme':
                await this.quizMeHandler(userId);
                break;
            case '/reviewcards':
                await this.reviewCardsHandler(userId);
                break;
            case '/deletecard':
                await this.deleteCardHandler(userId, text);
                break;
            case '/resetcards':
                await this.resetCardsHandler(userId);
                break;
            default:
                await this.sendMessage(userId, 'Lệnh không hợp lệ. Các lệnh có sẵn:\n/addcard [câu hỏi],,[câu trả lời]\n/review\n/list\n/quizme\n/reviewcards\n/deletecard [số thứ tự]\n/resetcards');
        }
    }

    async addCardHandler(userId, text) {
        const parts = text.substring('/addcard'.length).trim().split(',,');
        if (parts.length !== 2) {
            await this.sendMessage(userId, 'Cú pháp không đúng. Sử dụng: /addcard [câu hỏi],,[câu trả lời]');
            return;
        }

        const question = parts[0].trim();
        const answer = parts[1].trim();

        if (!this.userDecks.has(userId)) {
            this.userDecks.set(userId, []);
        }

        const deck = this.userDecks.get(userId);
        deck.push({ question, answer });
        
        await this.sendMessage(userId, 'Đã thêm flashcard mới!');
    }

    async reviewHandler(userId) {
        const deck = this.userDecks.get(userId) || [];
        if (deck.length === 0) {
            await this.sendMessage(userId, 'Bạn chưa có flashcard nào. Sử dụng /addcard để thêm!');
            return;
        }

        const card = deck[Math.floor(Math.random() * deck.length)];
        await this.sendMessage(userId, `Câu hỏi: ${card.question}\n\nGõ bất kỳ để xem đáp án.`);
    }

    async listCardsHandler(userId) {
        const deck = this.userDecks.get(userId) || [];
        if (deck.length === 0) {
            await this.sendMessage(userId, 'Bạn chưa có flashcard nào.');
            return;
        }

        const cardList = deck.map((card, index) => 
            `${index + 1}. Q: ${card.question}\nA: ${card.answer}`
        ).join('\n\n');

        await this.sendMessage(userId, `Danh sách flashcard của bạn:\n\n${cardList}`);
    }

    async quizMeHandler(userId) {
        const deck = this.userDecks.get(userId) || [];
        if (deck.length === 0) {
            await this.sendMessage(userId, 'Bạn chưa có flashcard nào để ôn tập. Hãy dùng /addcard để thêm!');
            return;
        }

        // Chọn ngẫu nhiên một flashcard
        const card = deck[Math.floor(Math.random() * deck.length)];
        
        // Gửi câu hỏi
        await this.sendMessage(userId, `Quiz: ${card.question}`);
        
        // Chờ 10 giây và tự động gửi đáp án
        setTimeout(async () => {
            await this.sendMessage(userId, `Đáp án: ${card.answer}`);
        }, 10000); // 10 giây = 10000 milliseconds
    }

    async reviewCardsHandler(userId) {
        const deck = this.userDecks.get(userId) || [];
        if (deck.length === 0) {
            await this.sendMessage(userId, 'Bạn chưa có flashcard nào.');
            return;
        }

        const cardList = deck.map((card, index) => 
            `${index + 1}. Q: ${card.question} - A: ${card.answer}`
        ).join('\n');

        await this.sendMessage(userId, `Danh sách flashcard của bạn:\n\n${cardList}`);
    }

    async deleteCardHandler(userId, text) {
        const deck = this.userDecks.get(userId) || [];
        if (deck.length === 0) {
            await this.sendMessage(userId, 'Bạn chưa có flashcard nào để xóa.');
            return;
        }

        // Phân tích số thứ tự từ lệnh
        const parts = text.split(' ');
        if (parts.length !== 2) {
            await this.sendMessage(userId, 'Cú pháp không đúng. Sử dụng: /deletecard [số thứ tự]');
            return;
        }

        const cardIndex = parseInt(parts[1]) - 1; // Chuyển từ số thứ tự (1-based) sang chỉ số mảng (0-based)
        
        if (isNaN(cardIndex) || cardIndex < 0 || cardIndex >= deck.length) {
            await this.sendMessage(userId, `Số thứ tự không hợp lệ. Vui lòng chọn số từ 1 đến ${deck.length}.`);
            return;
        }

        // Xóa flashcard
        const removedCard = deck.splice(cardIndex, 1)[0];
        await this.sendMessage(userId, `Đã xóa flashcard: Q: ${removedCard.question} - A: ${removedCard.answer}`);
    }

    async resetCardsHandler(userId) {
        if (!this.userDecks.has(userId) || this.userDecks.get(userId).length === 0) {
            await this.sendMessage(userId, 'Bạn chưa có flashcard nào.');
            return;
        }

        // Xóa toàn bộ bộ bài
        this.userDecks.set(userId, []);
        await this.sendMessage(userId, 'Toàn bộ flashcard của bạn đã được xóa.');
    }

    async sendMessage(userId, text) {
        try {
            const response = await fetch('https://api.mezon.vn/api/send-message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    chat_id: userId,
                    text: text
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Mezon API error: ${errorData.message || response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    }
}

module.exports = new Bot();