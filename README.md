# Tiny Ears — Học tiếng Anh vui

Trang web HTML/CSS/JS tương tác giúp trẻ học từ vựng tiếng Anh bằng cách **chạm vào hình ảnh để nghe phát âm**.

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

- Hình minh họa SVG dễ thương: `assets/images/`
- Âm thanh phát âm tiếng Anh (edge-tts, giọng AnaNeural): `assets/audio/`
- Dữ liệu bài học: `js/lessons.json`

Tạo lại assets:

```bash
python3 scripts/generate_assets.py
```

## Cách chơi

1. Chọn một chủ đề trên màn hình chính.
2. Chạm vào hình (hoặc nút **Nghe lại**) để nghe từ tiếng Anh.
3. Dùng **Trước / Sau** để chuyển từ, **↻** để trộn thứ tự.
