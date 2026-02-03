# JSONL Editor - Ứng dụng chỉnh sửa file JSONL

Một ứng dụng web hiện đại được xây dựng với **Nuxt 3** và **Vue 3** để chỉnh sửa các file JSONL (JSON Lines) một cách dễ dàng.

## 🎯 Tính năng

- 📤 **Tải lên file JSONL** - Hỗ trợ drag-drop và chọn file
- 📝 **Chỉnh sửa từng dòng** - Hiển thị 1 bản ghi mỗi lần với giao diện rõ ràng
- 💬 **Quản lý Messages** - Thêm, sửa, xóa các messages với các role khác nhau (system, user, assistant, model)
- 🗂️ **Điều hướng nhanh** - Nút Previous/Next hoặc nhập số dòng để nhảy tới
- 📊 **Xem trước JSON** - Xem JSON live preview của record hiện tại
- ✅ **Kiểm tra hợp lệ** - Hiển thị trạng thái validation của mỗi dòng
- 💾 **Lưu và tải về** - Lưu thay đổi và tải file JSONL đã chỉnh sửa
- 🎨 **Giao diện đẹp** - Tailwind CSS với thiết kế hiện đại

## 📋 Định dạng JSONL hỗ trợ

```json
{"timestamp": "2026-02-02T03:47:36.096608", "messages": [{"role": "system", "content": "You are helpful"}, {"role": "user", "content": "Hello"}, {"role": "assistant", "content": "Hi there!"}]}
```

## 🚀 Cài đặt

### Yêu cầu hệ thống

- **Node.js** >= 18.0.0
- **npm** hoặc **pnpm** hoặc **yarn**

### Bước 1: Clone hoặc tải project

```bash
cd convert-json-app
```

### Bước 2: Cài đặt dependencies

```bash
# npm
npm install

# hoặc pnpm
pnpm install

# hoặc yarn
yarn install

# hoặc bun
bun install
```

## 💻 Phát triển

### Chạy development server

Khởi động server trên `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

Server sẽ tự động reload khi bạn thay đổi file (Hot Module Replacement).

## 🏗️ Build cho production

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Sau đó xem trước production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

## 📦 Công nghệ sử dụng

- **Nuxt 3** - Framework Vue meta
- **Vue 3.5+** - Composition API
- **Tailwind CSS 4.1** - Styling utilities
- **TypeScript** - Type safety
- **Vite** - Build tool

## 📖 Hướng dẫn sử dụng

### 1. Tải lên file JSONL

- Kéo thả file JSONL vào vùng upload hoặc click để chọn file
- Ứng dụng sẽ tự động phân tích và hiển thị số lượng dòng

### 2. Chỉnh sửa Messages

- Mỗi dòng JSONL được hiển thị với các message bên trong
- Chọn role từ dropdown: `system`, `user`, `assistant`, `model`
- Sửa nội dung message trong textarea
- Click "Thêm Message" để thêm message mới

### 3. Điều hướng

- **Quay lại** - Quay về màn hình tải file
- **Trước/Sau** - Điều hướng giữa các bản ghi
- **Nhập số** - Nhập số thứ tự để nhảy tới dòng cụ thể

### 4. Lưu và Tải về

- **Lưu thay đổi** - Lưu các sửa đổi vào bộ nhớ
- **Lưu File** - Tải xuống file JSONL đã chỉnh sửa

### 5. Xóa

- **Xóa Message** - Xóa một message khỏi dòng hiện tại
- **Xóa Record** - Xóa toàn bộ dòng JSONL

## 📁 Cấu trúc Project

```
convert-json-app/
├── app/
│   ├── app.vue                    # Component root
│   ├── assets/
│   │   └── css/
│   │       └── main.css           # Tailwind CSS
│   ├── components/
│   │   ├── FileUploader.vue       # Component tải file
│   │   └── JsonlEditor.vue        # Component chỉnh sửa
│   └── composables/
│       └── useJsonlEditor.ts      # Logic xử lý JSONL
├── public/
│   └── robots.txt
├── package.json
├── nuxt.config.ts
├── tsconfig.json
└── README.md
```

## 🎨 Component Architecture

### FileUploader.vue
Xử lý upload file và phân tích JSONL ban đầu

### JsonlEditor.vue
Giao diện chính với:
- **Top Navigation** - Back button, filename, page indicator, Previous/Next, Save
- **Left Section** - Messages editor với role selector
- **Right Section** - JSON preview, validation status, stats

### useJsonlEditor.ts
Composable chứa logic:
- Phân tích JSONL file
- Quản lý state records
- Cập nhật/xóa messages
- Export/Download functionality

## 🐛 Troubleshooting

### Port 3000 đã được sử dụng

Chạy với port khác:
```bash
npm run dev -- --port 3001
```

### File không tải lên được

- Kiểm tra định dạng file có phải JSONL không (mỗi dòng là JSON hợp lệ)
- Mỗi dòng phải chứa `messages` array
- Không có dòng trống giữa các record

### Lỗi TypeScript

Xoá cache và cài đặt lại:
```bash
rm -rf node_modules .nuxt
npm install
```

## 📝 License

MIT

## 🤝 Đóng góp

Mọi đóng góp đều được chào đón! Vui lòng tạo issue hoặc pull request.

## 📞 Liên hệ & Hỗ trợ

Nếu bạn gặp vấn đề hoặc có đề xuất, vui lòng tạo một issue trong repository.
