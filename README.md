# Tiny Ears — Học tiếng Anh vui

Trang web HTML/CSS/JS tương tác giúp trẻ học từ vựng tiếng Anh bằng cách **chạm vào hình ảnh để nghe phát âm**.

**Chơi ngay:** [https://giangdao-vizion.github.io/Kid-Language-Game/](https://giangdao-vizion.github.io/Kid-Language-Game/)

## Cách chạy

Mở `index.html` bằng trình duyệt, hoặc chạy máy chủ tĩnh:

```bash
python3 -m http.server 8080
```

Sau đó vào `http://localhost:8080`.

## Chủ đề

| Chủ đề | Nội dung |
|--------|----------|
| Animals | cat, dog, bird, fish, rabbit, elephant, lion, duck |
| Fruits | apple, banana, orange, grape, strawberry, watermelon, mango, cherry |
| Home | chair, table, bed, lamp, clock, door, cup, book |
| Vehicles | car, bus, train, plane, bike, boat, truck, scooter |
| Colors | red, blue, yellow, green, orange, purple, pink, brown |

## Assets

- Hình minh họa PNG từ [Flaticon](https://www.flaticon.com/) (Freepik và các tác giả khác): `assets/images/`
- Màu sắc dùng swatch dễ thương để trẻ nhận diện rõ
- Âm thanh phát âm tiếng Anh (Woman / Man): `assets/audio/`
- Dữ liệu bài học: `js/lessons.json`
- Map nguồn icon: `scripts/flaticon_map.json`

Tạo lại audio/SVG cũ (nếu cần):

```bash
python3 scripts/generate_assets.py
```

Tải lại icon Flaticon theo map:

```bash
python3 scripts/download_flaticon_icons.py
```

## Cách chơi

1. Chọn giọng **Woman** hoặc **Man**, và thứ tự **Theo thứ tự** / **Ngẫu nhiên**.
2. Chọn một chủ đề trên màn hình chính để học từ vựng.
3. Chạm vào hình (hoặc nút **Nghe lại**) để nghe từ tiếng Anh.
4. Dùng **Trước / Sau** để chuyển từ, **↻** để xáo trộn lại.

### Game hỏi đáp — Level 1

1. Bấm **Level 1** → chọn số từ **5 / 10 / 15**.
2. **Học từ:** xem lần lượt từng hình, nghe phát âm, chạm hình để nghe lại.
3. **Hỏi đáp:** app hỏi “What is this?”, phụ huynh chấm **Đúng** (✓ → “Correct!” rồi qua từ tiếp) hoặc **Sai** (✕ → “Please try again”, có nút **Tiếp theo** để bỏ qua).
4. Kết thúc hiện số đúng (ví dụ `5/10`) và điểm = số đúng × 10.

## Giọng đọc

| Lựa chọn | Giọng |
|----------|-------|
| Woman | en-US-JennyNeural |
| Man | en-US-AndrewNeural |

Âm thanh nằm trong `assets/audio/woman/` và `assets/audio/man/`.
