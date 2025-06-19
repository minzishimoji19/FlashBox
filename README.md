# FlashBox - Bot Học Tập Thông Minh

## Ý tưởng

FlashBox là một bot học tập thông minh được thiết kế để giúp sinh viên và học sinh ôn tập hiệu quả thông qua phương pháp flashcard. Bot cho phép người dùng tạo, quản lý và ôn tập các flashcard của riêng họ, giúp tăng cường khả năng ghi nhớ và hiểu sâu kiến thức. Mỗi người dùng sẽ có bộ flashcard riêng, phù hợp với nhu cầu học tập cá nhân.

## Logic hoạt động

### Cấu trúc dữ liệu

Bot sử dụng cấu trúc dữ liệu đơn giản để lưu trữ flashcard cho từng người dùng:

- **userDecks**: Một Map lưu trữ bộ bài (deck) của mỗi người dùng, với khóa là ID của người dùng và giá trị là một mảng các flashcard.
- **Flashcard**: Mỗi flashcard là một đối tượng có hai thuộc tính: `question` (câu hỏi) và `answer` (đáp án).

### Xử lý lệnh

1. Bot nhận webhook từ Mezon API thông qua endpoint `/webhook`.
2. Khi có tin nhắn mới, hàm `handleWebhook` được gọi để xử lý.
3. Tin nhắn được phân tích để xác định lệnh (bắt đầu bằng `/`).
4. Lệnh được định tuyến đến các hàm xử lý tương ứng thông qua cấu trúc `switch...case`.
5. Mỗi hàm xử lý sẽ thực hiện logic riêng và gửi phản hồi cho người dùng.

## Cách sử dụng

Bot FlashBox hỗ trợ các lệnh sau:

### 1. `/addcard [câu hỏi],,[câu trả lời]`

- **Chức năng**: Thêm một flashcard mới vào bộ bài của người dùng.
- **Cú pháp**: `/addcard What is AI?,,Artificial Intelligence`
- **Kết quả**: Bot sẽ lưu câu hỏi "What is AI?" và đáp án "Artificial Intelligence" vào bộ bài của người dùng.

### 2. `/quizme`

- **Chức năng**: Chọn ngẫu nhiên một flashcard từ bộ bài để ôn tập.
- **Cú pháp**: `/quizme`
- **Kết quả**: Bot sẽ gửi câu hỏi và tự động hiển thị đáp án sau 10 giây.

### 3. `/reviewcards`

- **Chức năng**: Hiển thị danh sách tất cả flashcard của người dùng.
- **Cú pháp**: `/reviewcards`
- **Kết quả**: Bot sẽ gửi danh sách đánh số thứ tự với cả câu hỏi và đáp án.

### 4. `/deletecard [số thứ tự]`

- **Chức năng**: Xóa một flashcard cụ thể từ bộ bài.
- **Cú pháp**: `/deletecard 3`
- **Kết quả**: Bot sẽ xóa flashcard thứ 3 trong bộ bài của người dùng.

### 5. `/resetcards`

- **Chức năng**: Xóa toàn bộ flashcard trong bộ bài của người dùng.
- **Cú pháp**: `/resetcards`
- **Kết quả**: Bot sẽ xóa tất cả flashcard và gửi thông báo xác nhận.

### 6. `/review`

- **Chức năng**: Xem ngẫu nhiên một flashcard (chỉ hiển thị câu hỏi).
- **Cú pháp**: `/review`
- **Kết quả**: Bot sẽ gửi câu hỏi và chờ người dùng phản hồi để hiển thị đáp án.

### 7. `/list`

- **Chức năng**: Hiển thị danh sách tất cả flashcard của người dùng (tương tự `/reviewcards`).
- **Cú pháp**: `/list`
- **Kết quả**: Bot sẽ gửi danh sách đánh số thứ tự với cả câu hỏi và đáp án.

## Hướng dẫn cài đặt (Setup/Deploy)

### Yêu cầu

- Node.js (phiên bản 14 trở lên)
- npm (Node Package Manager)

### Các bước cài đặt

1. Clone repository:
   ```bash
   git clone https://github.com/yourusername/flashbox.git
   cd flashbox
   ```

2. Cài đặt các dependencies:
   ```bash
   npm install
   ```

3. Tạo file `.env` và thêm Mezon API Key:
   ```
   MEZON_API_KEY=your_api_key_here
   PORT=3000
   ```

4. Khởi động bot:
   ```bash
   npm run start
   ```

5. Cấu hình webhook trong Mezon API để trỏ đến URL của server của bạn:
   ```
   https://your-server.com/webhook
   ```

### Lưu ý

- Bot hiện đang sử dụng lưu trữ trong bộ nhớ (in-memory storage), dữ liệu sẽ bị mất khi khởi động lại bot.
- Để triển khai trong môi trường production, bạn nên cân nhắc sử dụng cơ sở dữ liệu thực (như MongoDB, PostgreSQL) để lưu trữ dữ liệu lâu dài.