#!/usr/bin/env python3
"""Generate cute SVG lesson images and English pronunciation audio."""

from __future__ import annotations

import asyncio
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
IMG = ROOT / "assets" / "images"
AUD = ROOT / "assets" / "audio"

# category -> list of (id, english_word, vietnamese_hint)
LESSONS = {
    "animals": [
        ("cat", "cat", "con mèo"),
        ("dog", "dog", "con chó"),
        ("bird", "bird", "con chim"),
        ("fish", "fish", "con cá"),
        ("rabbit", "rabbit", "con thỏ"),
        ("elephant", "elephant", "con voi"),
        ("lion", "lion", "con sư tử"),
        ("duck", "duck", "con vịt"),
    ],
    "fruits": [
        ("apple", "apple", "quả táo"),
        ("banana", "banana", "quả chuối"),
        ("orange", "orange", "quả cam"),
        ("grape", "grape", "nho"),
        ("strawberry", "strawberry", "dâu tây"),
        ("watermelon", "watermelon", "dưa hấu"),
        ("mango", "mango", "quả xoài"),
        ("cherry", "cherry", "quả anh đào"),
    ],
    "home": [
        ("chair", "chair", "cái ghế"),
        ("table", "table", "cái bàn"),
        ("bed", "bed", "cái giường"),
        ("lamp", "lamp", "đèn"),
        ("clock", "clock", "đồng hồ"),
        ("door", "door", "cánh cửa"),
        ("cup", "cup", "cái cốc"),
        ("book", "book", "quyển sách"),
    ],
    "vehicles": [
        ("car", "car", "xe hơi"),
        ("bus", "bus", "xe buýt"),
        ("train", "train", "tàu hỏa"),
        ("plane", "plane", "máy bay"),
        ("bike", "bike", "xe đạp"),
        ("boat", "boat", "thuyền"),
        ("truck", "truck", "xe tải"),
        ("scooter", "scooter", "xe scooter"),
    ],
    "colors": [
        ("red", "red", "màu đỏ"),
        ("blue", "blue", "màu xanh dương"),
        ("yellow", "yellow", "màu vàng"),
        ("green", "green", "màu xanh lá"),
        ("orange", "orange", "màu cam"),
        ("purple", "purple", "màu tím"),
        ("pink", "pink", "màu hồng"),
        ("brown", "brown", "màu nâu"),
    ],
}

COLOR_HEX = {
    "red": "#E74C3C",
    "blue": "#3498DB",
    "yellow": "#F1C40F",
    "green": "#27AE60",
    "orange": "#E67E22",
    "purple": "#9B59B6",
    "pink": "#FF6B9D",
    "brown": "#A0522D",
}


def svg_wrap(body: str, bg: str = "#FFF8F0") -> str:
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <defs>
    <radialGradient id="bg" cx="50%" cy="40%" r="70%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="{bg}"/>
    </radialGradient>
  </defs>
  <rect width="400" height="400" rx="40" fill="url(#bg)"/>
  {body}
</svg>
'''


def face(cx: float, cy: float, scale: float = 1.0) -> str:
    e = 6 * scale
    return f'''
  <circle cx="{cx - 18 * scale}" cy="{cy}" r="{e}" fill="#2C3E50"/>
  <circle cx="{cx + 18 * scale}" cy="{cy}" r="{e}" fill="#2C3E50"/>
  <circle cx="{cx - 16 * scale}" cy="{cy - 2 * scale}" r="{2.2 * scale}" fill="#fff"/>
  <circle cx="{cx + 20 * scale}" cy="{cy - 2 * scale}" r="{2.2 * scale}" fill="#fff"/>
  <path d="M {cx - 12 * scale} {cy + 16 * scale} Q {cx} {cy + 28 * scale} {cx + 12 * scale} {cy + 16 * scale}"
        fill="none" stroke="#2C3E50" stroke-width="{3.5 * scale}" stroke-linecap="round"/>
'''


def blush(cx: float, cy: float, scale: float = 1.0) -> str:
    return f'''
  <ellipse cx="{cx - 28 * scale}" cy="{cy + 8 * scale}" rx="{10 * scale}" ry="{6 * scale}" fill="#FFB6C1" opacity="0.7"/>
  <ellipse cx="{cx + 28 * scale}" cy="{cy + 8 * scale}" rx="{10 * scale}" ry="{6 * scale}" fill="#FFB6C1" opacity="0.7"/>
'''


SVGS = {
    # --- animals ---
    "animals/cat": svg_wrap(f'''
  <ellipse cx="200" cy="250" rx="95" ry="80" fill="#F4A460"/>
  <circle cx="200" cy="165" r="72" fill="#F4A460"/>
  <polygon points="145,120 155,55 190,115" fill="#F4A460"/>
  <polygon points="255,120 245,55 210,115" fill="#F4A460"/>
  <polygon points="155,115 160,75 180,112" fill="#FFB6C1"/>
  <polygon points="245,115 240,75 220,112" fill="#FFB6C1"/>
  <ellipse cx="200" cy="185" rx="14" ry="10" fill="#FF9AA2"/>
  {blush(200, 175)}
  {face(200, 160)}
  <path d="M186 185 Q170 195 160 180" fill="none" stroke="#8B5A2B" stroke-width="2"/>
  <path d="M214 185 Q230 195 240 180" fill="none" stroke="#8B5A2B" stroke-width="2"/>
  <ellipse cx="120" cy="250" rx="18" ry="40" fill="#E8956A" transform="rotate(-25 120 250)"/>
  <ellipse cx="280" cy="250" rx="18" ry="40" fill="#E8956A" transform="rotate(25 280 250)"/>
''', "#FFE8D6"),
    "animals/dog": svg_wrap(f'''
  <ellipse cx="200" cy="255" rx="100" ry="85" fill="#D4A574"/>
  <circle cx="200" cy="165" r="75" fill="#D4A574"/>
  <ellipse cx="120" cy="155" rx="28" ry="48" fill="#A67C52" transform="rotate(-15 120 155)"/>
  <ellipse cx="280" cy="155" rx="28" ry="48" fill="#A67C52" transform="rotate(15 280 155)"/>
  <ellipse cx="200" cy="195" rx="22" ry="16" fill="#5D4037"/>
  {blush(200, 175)}
  {face(200, 155)}
  <ellipse cx="155" cy="310" rx="22" ry="16" fill="#C4956A"/>
  <ellipse cx="245" cy="310" rx="22" ry="16" fill="#C4956A"/>
''', "#FFF0E0"),
    "animals/bird": svg_wrap(f'''
  <ellipse cx="200" cy="220" rx="70" ry="85" fill="#7EC8E3"/>
  <circle cx="200" cy="130" r="55" fill="#7EC8E3"/>
  <ellipse cx="130" cy="210" rx="35" ry="55" fill="#5BA3C9" transform="rotate(-30 130 210)"/>
  <ellipse cx="270" cy="210" rx="35" ry="55" fill="#5BA3C9" transform="rotate(30 270 210)"/>
  <polygon points="200,145 235,155 200,165" fill="#FF9F43"/>
  {blush(200, 140, 0.8)}
  {face(200, 125, 0.85)}
  <ellipse cx="175" cy="300" rx="14" ry="22" fill="#FF9F43"/>
  <ellipse cx="225" cy="300" rx="14" ry="22" fill="#FF9F43"/>
  <circle cx="155" cy="95" r="8" fill="#FF6B9D"/>
''', "#E8F6FF"),
    "animals/fish": svg_wrap(f'''
  <ellipse cx="190" cy="200" rx="110" ry="65" fill="#FF8C69"/>
  <polygon points="300,200 360,150 360,250" fill="#FF7A54"/>
  <polygon points="190,135 210,100 170,100" fill="#FF7A54"/>
  <circle cx="140" cy="185" r="12" fill="#2C3E50"/>
  <circle cx="144" cy="181" r="4" fill="#fff"/>
  <path d="M160 215 Q190 235 220 215" fill="none" stroke="#2C3E50" stroke-width="3" stroke-linecap="round"/>
  <ellipse cx="210" cy="200" rx="18" ry="28" fill="#FFB347" opacity="0.7"/>
  <ellipse cx="250" cy="200" rx="14" ry="22" fill="#FFB347" opacity="0.7"/>
''', "#FFEDE5"),
    "animals/rabbit": svg_wrap(f'''
  <ellipse cx="200" cy="260" rx="85" ry="75" fill="#F5F0EB"/>
  <circle cx="200" cy="185" r="65" fill="#F5F0EB"/>
  <ellipse cx="160" cy="90" rx="22" ry="70" fill="#F5F0EB"/>
  <ellipse cx="240" cy="90" rx="22" ry="70" fill="#F5F0EB"/>
  <ellipse cx="160" cy="95" rx="12" ry="50" fill="#FFB6C1"/>
  <ellipse cx="240" cy="95" rx="12" ry="50" fill="#FFB6C1"/>
  <ellipse cx="200" cy="200" rx="12" ry="9" fill="#FF9AA2"/>
  {blush(200, 190)}
  {face(200, 175)}
''', "#FFF5F8"),
    "animals/elephant": svg_wrap(f'''
  <ellipse cx="200" cy="240" rx="110" ry="90" fill="#B0BEC5"/>
  <circle cx="200" cy="155" r="70" fill="#B0BEC5"/>
  <ellipse cx="115" cy="140" rx="25" ry="40" fill="#90A4AE"/>
  <ellipse cx="285" cy="140" rx="25" ry="40" fill="#90A4AE"/>
  <path d="M185 195 Q175 280 195 320 Q210 300 200 240" fill="#90A4AE"/>
  {blush(200, 170)}
  {face(200, 150)}
  <ellipse cx="150" cy="320" rx="24" ry="18" fill="#90A4AE"/>
  <ellipse cx="250" cy="320" rx="24" ry="18" fill="#90A4AE"/>
''', "#ECEFF1"),
    "animals/lion": svg_wrap(f'''
  <circle cx="200" cy="200" r="120" fill="#E67E22"/>
  <circle cx="200" cy="200" r="75" fill="#F5C542"/>
  {blush(200, 210)}
  {face(200, 190)}
  <ellipse cx="200" cy="225" rx="16" ry="12" fill="#D35400"/>
  <path d="M185 230 Q200 245 215 230" fill="none" stroke="#2C3E50" stroke-width="3" stroke-linecap="round"/>
  <circle cx="110" cy="120" r="22" fill="#E67E22"/>
  <circle cx="290" cy="120" r="22" fill="#E67E22"/>
  <circle cx="100" cy="200" r="20" fill="#E67E22"/>
  <circle cx="300" cy="200" r="20" fill="#E67E22"/>
  <circle cx="130" cy="290" r="22" fill="#E67E22"/>
  <circle cx="270" cy="290" r="22" fill="#E67E22"/>
''', "#FFF3E0"),
    "animals/duck": svg_wrap(f'''
  <ellipse cx="200" cy="240" rx="90" ry="70" fill="#FFEB3B"/>
  <circle cx="200" cy="155" r="60" fill="#FFEB3B"/>
  <ellipse cx="250" cy="165" rx="35" ry="18" fill="#FF9800"/>
  <ellipse cx="255" cy="165" rx="18" ry="10" fill="#FFB74D"/>
  {blush(190, 165, 0.85)}
  <circle cx="175" cy="145" r="8" fill="#2C3E50"/>
  <circle cx="177" cy="142" r="2.5" fill="#fff"/>
  <path d="M165 175 Q185 190 205 175" fill="none" stroke="#2C3E50" stroke-width="3" stroke-linecap="round"/>
  <ellipse cx="170" cy="300" rx="20" ry="14" fill="#FF9800"/>
  <ellipse cx="230" cy="300" rx="20" ry="14" fill="#FF9800"/>
''', "#FFFDE7"),

    # --- fruits ---
    "fruits/apple": svg_wrap(f'''
  <circle cx="200" cy="220" r="100" fill="#E74C3C"/>
  <ellipse cx="165" cy="180" rx="30" ry="20" fill="#FF6B6B" opacity="0.45"/>
  <path d="M200 120 Q210 80 230 70" fill="none" stroke="#6D4C41" stroke-width="10" stroke-linecap="round"/>
  <ellipse cx="245" cy="85" rx="28" ry="16" fill="#27AE60" transform="rotate(20 245 85)"/>
  {blush(200, 230)}
  {face(200, 210)}
''', "#FFE8E8"),
    "fruits/banana": svg_wrap(f'''
  <path d="M118 78
           C 95 130, 88 190, 102 250
           C 112 290, 135 325, 175 345
           C 205 358, 235 350, 248 320
           C 262 280, 250 230, 235 175
           C 220 120, 205 85, 175 70
           C 155 62, 132 64, 118 78 Z"
        fill="#F4C430" stroke="#D4A017" stroke-width="4"/>
  <path d="M150 95 C 130 150, 125 210, 138 275 C 145 305, 165 325, 190 330"
        fill="none" stroke="#FFF3A0" stroke-width="14" stroke-linecap="round" opacity="0.55"/>
  <path d="M168 88 C 150 155, 148 220, 165 295 C 172 318, 188 330, 205 332"
        fill="none" stroke="#C9920A" stroke-width="5" stroke-linecap="round" opacity="0.55"/>
  <path d="M160 72 C 155 55, 165 42, 182 40 C 195 39, 205 48, 200 62 C 190 68, 175 72, 160 72 Z"
        fill="#8B5A2B"/>
  <ellipse cx="230" cy="338" rx="14" ry="10" fill="#E8B923" transform="rotate(-25 230 338)"/>
  <ellipse cx="155" cy="210" rx="11" ry="7" fill="#FFB6C1" opacity="0.75"/>
  <ellipse cx="215" cy="218" rx="11" ry="7" fill="#FFB6C1" opacity="0.75"/>
  <circle cx="168" cy="198" r="8" fill="#2C3E50"/>
  <circle cx="205" cy="205" r="8" fill="#2C3E50"/>
  <circle cx="170" cy="195" r="2.5" fill="#fff"/>
  <circle cx="207" cy="202" r="2.5" fill="#fff"/>
  <path d="M170 230 Q188 248 210 232" fill="none" stroke="#2C3E50" stroke-width="4" stroke-linecap="round"/>
''', "#FFF8DC"),
    "fruits/orange": svg_wrap(f'''
  <circle cx="200" cy="210" r="105" fill="#FF9F43"/>
  <circle cx="200" cy="210" r="105" fill="none" stroke="#E67E22" stroke-width="3" opacity="0.3"/>
  <path d="M200 105 Q215 85 235 90" fill="none" stroke="#27AE60" stroke-width="8" stroke-linecap="round"/>
  <ellipse cx="250" cy="95" rx="22" ry="12" fill="#2ECC71"/>
  {blush(200, 220)}
  {face(200, 200)}
''', "#FFF3E0"),
    "fruits/grape": svg_wrap(f'''
  <circle cx="170" cy="160" r="38" fill="#9B59B6"/>
  <circle cx="230" cy="160" r="38" fill="#8E44AD"/>
  <circle cx="140" cy="220" r="38" fill="#8E44AD"/>
  <circle cx="200" cy="220" r="40" fill="#9B59B6"/>
  <circle cx="260" cy="220" r="38" fill="#8E44AD"/>
  <circle cx="170" cy="280" r="38" fill="#9B59B6"/>
  <circle cx="230" cy="280" r="38" fill="#8E44AD"/>
  <path d="M200 120 Q210 80 230 70" fill="none" stroke="#27AE60" stroke-width="8" stroke-linecap="round"/>
  <ellipse cx="245" cy="75" rx="20" ry="12" fill="#2ECC71"/>
  <circle cx="185" cy="210" r="5" fill="#2C3E50"/>
  <circle cx="215" cy="210" r="5" fill="#2C3E50"/>
  <path d="M185 235 Q200 248 215 235" fill="none" stroke="#2C3E50" stroke-width="3" stroke-linecap="round"/>
''', "#F5EEF8"),
    "fruits/strawberry": svg_wrap(f'''
  <path d="M200 120 Q280 150 270 250 Q200 340 130 250 Q120 150 200 120" fill="#E74C3C"/>
  <ellipse cx="160" cy="200" rx="5" ry="8" fill="#FFEB3B" transform="rotate(-20 160 200)"/>
  <ellipse cx="220" cy="190" rx="5" ry="8" fill="#FFEB3B" transform="rotate(15 220 190)"/>
  <ellipse cx="180" cy="250" rx="5" ry="8" fill="#FFEB3B" transform="rotate(10 180 250)"/>
  <ellipse cx="230" cy="245" rx="5" ry="8" fill="#FFEB3B" transform="rotate(-25 230 245)"/>
  <ellipse cx="200" cy="210" rx="5" ry="8" fill="#FFEB3B"/>
  <path d="M150 130 Q200 100 250 130" fill="#27AE60"/>
  <ellipse cx="170" cy="125" rx="18" ry="10" fill="#2ECC71" transform="rotate(-30 170 125)"/>
  <ellipse cx="230" cy="125" rx="18" ry="10" fill="#2ECC71" transform="rotate(30 230 125)"/>
  <ellipse cx="200" cy="115" rx="16" ry="10" fill="#27AE60"/>
  {blush(200, 220, 0.9)}
  {face(200, 200, 0.9)}
''', "#FFE8EC"),
    "fruits/watermelon": svg_wrap(f'''
  <path d="M80 280 A140 140 0 0 1 320 280 Z" fill="#27AE60"/>
  <path d="M100 275 A115 115 0 0 1 300 275 Z" fill="#FFFFFF"/>
  <path d="M115 270 A100 100 0 0 1 285 270 Z" fill="#FF6B6B"/>
  <ellipse cx="160" cy="220" rx="6" ry="10" fill="#2C3E50" transform="rotate(-20 160 220)"/>
  <ellipse cx="200" cy="200" rx="6" ry="10" fill="#2C3E50"/>
  <ellipse cx="240" cy="220" rx="6" ry="10" fill="#2C3E50" transform="rotate(20 240 220)"/>
  <ellipse cx="180" cy="245" rx="5" ry="8" fill="#2C3E50" transform="rotate(10 180 245)"/>
  <ellipse cx="220" cy="245" rx="5" ry="8" fill="#2C3E50" transform="rotate(-10 220 245)"/>
  {face(200, 175, 0.85)}
''', "#E8F8F0"),
    "fruits/mango": svg_wrap(f'''
  <ellipse cx="200" cy="220" rx="90" ry="110" fill="#F39C12"/>
  <ellipse cx="170" cy="180" rx="35" ry="45" fill="#F1C40F" opacity="0.5"/>
  <path d="M200 110 Q215 70 245 65" fill="none" stroke="#6D4C41" stroke-width="8" stroke-linecap="round"/>
  <ellipse cx="255" cy="80" rx="24" ry="14" fill="#27AE60" transform="rotate(25 255 80)"/>
  {blush(200, 230)}
  {face(200, 210)}
''', "#FFF6E5"),
    "fruits/cherry": svg_wrap(f'''
  <circle cx="155" cy="240" r="55" fill="#E74C3C"/>
  <circle cx="245" cy="240" r="55" fill="#C0392B"/>
  <ellipse cx="140" cy="220" rx="15" ry="10" fill="#FF6B6B" opacity="0.5"/>
  <ellipse cx="230" cy="220" rx="15" ry="10" fill="#E74C3C" opacity="0.5"/>
  <path d="M155 190 Q200 100 245 190" fill="none" stroke="#27AE60" stroke-width="8" stroke-linecap="round"/>
  <ellipse cx="200" cy="100" rx="22" ry="14" fill="#2ECC71"/>
  <circle cx="140" cy="230" r="6" fill="#2C3E50"/>
  <circle cx="170" cy="230" r="6" fill="#2C3E50"/>
  <path d="M140 255 Q155 268 170 255" fill="none" stroke="#2C3E50" stroke-width="3" stroke-linecap="round"/>
  <circle cx="230" cy="230" r="6" fill="#2C3E50"/>
  <circle cx="260" cy="230" r="6" fill="#2C3E50"/>
  <path d="M230 255 Q245 268 260 255" fill="none" stroke="#2C3E50" stroke-width="3" stroke-linecap="round"/>
''', "#FFE8E8"),

    # --- home ---
    "home/chair": svg_wrap(f'''
  <rect x="120" y="140" width="160" height="20" rx="8" fill="#8B5A2B"/>
  <rect x="130" y="160" width="20" height="120" rx="6" fill="#A0673B"/>
  <rect x="250" y="160" width="20" height="120" rx="6" fill="#A0673B"/>
  <rect x="130" y="220" width="140" height="18" rx="6" fill="#C4956A"/>
  <rect x="145" y="238" width="16" height="70" rx="5" fill="#8B5A2B"/>
  <rect x="239" y="238" width="16" height="70" rx="5" fill="#8B5A2B"/>
  <circle cx="200" cy="185" r="8" fill="#FFB6C1"/>
  {face(200, 175, 0.7)}
''', "#F5EDE4"),
    "home/table": svg_wrap(f'''
  <ellipse cx="200" cy="180" rx="140" ry="30" fill="#D4A574"/>
  <rect x="80" y="175" width="240" height="18" rx="6" fill="#C4956A"/>
  <rect x="110" y="193" width="18" height="100" rx="5" fill="#8B5A2B"/>
  <rect x="272" y="193" width="18" height="100" rx="5" fill="#8B5A2B"/>
  <rect x="150" y="193" width="14" height="90" rx="4" fill="#A0673B"/>
  <rect x="236" y="193" width="14" height="90" rx="4" fill="#A0673B"/>
  {blush(200, 165, 0.7)}
  {face(200, 155, 0.75)}
''', "#F5EDE4"),
    "home/bed": svg_wrap(f'''
  <rect x="70" y="200" width="260" height="90" rx="16" fill="#5DADE2"/>
  <rect x="70" y="160" width="50" height="130" rx="12" fill="#3498DB"/>
  <rect x="90" y="175" width="70" height="40" rx="12" fill="#F5B7B1"/>
  <rect x="80" y="210" width="240" height="50" rx="10" fill="#AED6F1"/>
  <rect x="90" y="280" width="20" height="30" rx="4" fill="#5D6D7E"/>
  <rect x="290" y="280" width="20" height="30" rx="4" fill="#5D6D7E"/>
  {face(220, 230, 0.7)}
''', "#EBF5FB"),
    "home/lamp": svg_wrap(f'''
  <ellipse cx="200" cy="320" rx="55" ry="14" fill="#95A5A6"/>
  <rect x="190" y="180" width="20" height="140" rx="6" fill="#BDC3C7"/>
  <path d="M130 180 L270 180 L240 90 L160 90 Z" fill="#F7DC6F"/>
  <ellipse cx="200" cy="90" rx="40" ry="10" fill="#F4D03F"/>
  <circle cx="200" cy="140" r="8" fill="#F39C12" opacity="0.6"/>
  {face(200, 130, 0.7)}
''', "#FEF9E7"),
    "home/clock": svg_wrap(f'''
  <circle cx="200" cy="210" r="110" fill="#ECF0F1" stroke="#E74C3C" stroke-width="18"/>
  <circle cx="200" cy="210" r="8" fill="#2C3E50"/>
  <line x1="200" y1="210" x2="200" y2="140" stroke="#2C3E50" stroke-width="6" stroke-linecap="round"/>
  <line x1="200" y1="210" x2="250" y2="210" stroke="#E74C3C" stroke-width="5" stroke-linecap="round"/>
  <circle cx="200" cy="100" r="12" fill="#E74C3C"/>
  <text x="200" y="145" text-anchor="middle" font-size="22" font-family="Arial" fill="#7F8C8D" font-weight="bold">12</text>
  <text x="280" y="218" text-anchor="middle" font-size="22" font-family="Arial" fill="#7F8C8D" font-weight="bold">3</text>
  <text x="200" y="295" text-anchor="middle" font-size="22" font-family="Arial" fill="#7F8C8D" font-weight="bold">6</text>
  <text x="120" y="218" text-anchor="middle" font-size="22" font-family="Arial" fill="#7F8C8D" font-weight="bold">9</text>
  {blush(200, 240, 0.8)}
  <circle cx="170" cy="195" r="6" fill="#2C3E50"/>
  <circle cx="230" cy="195" r="6" fill="#2C3E50"/>
  <path d="M175 250 Q200 265 225 250" fill="none" stroke="#2C3E50" stroke-width="3" stroke-linecap="round"/>
''', "#FDEDEC"),
    "home/door": svg_wrap(f'''
  <rect x="110" y="60" width="180" height="280" rx="8" fill="#D4A574"/>
  <rect x="125" y="75" width="150" height="250" rx="4" fill="#C4956A"/>
  <rect x="140" y="100" width="55" height="70" rx="4" fill="#AED6F1" opacity="0.7"/>
  <rect x="205" y="100" width="55" height="70" rx="4" fill="#AED6F1" opacity="0.7"/>
  <circle cx="250" cy="210" r="12" fill="#F1C40F"/>
  <circle cx="250" cy="210" r="5" fill="#F39C12"/>
  {face(185, 200, 0.75)}
''', "#F5EDE4"),
    "home/cup": svg_wrap(f'''
  <path d="M130 140 L140 300 Q200 330 260 300 L270 140 Z" fill="#5DADE2"/>
  <ellipse cx="200" cy="140" rx="70" ry="20" fill="#85C1E9"/>
  <ellipse cx="200" cy="140" rx="55" ry="12" fill="#3498DB"/>
  <path d="M270 170 Q320 200 270 250" fill="none" stroke="#5DADE2" stroke-width="16" stroke-linecap="round"/>
  {blush(200, 210)}
  {face(200, 200)}
''', "#EBF5FB"),
    "home/book": svg_wrap(f'''
  <rect x="100" y="90" width="200" height="220" rx="8" fill="#E74C3C"/>
  <rect x="115" y="105" width="170" height="190" rx="4" fill="#FCF3CF"/>
  <rect x="100" y="90" width="18" height="220" rx="4" fill="#C0392B"/>
  <line x1="140" y1="150" x2="260" y2="150" stroke="#F5B7B1" stroke-width="6" stroke-linecap="round"/>
  <line x1="140" y1="180" x2="250" y2="180" stroke="#F5B7B1" stroke-width="6" stroke-linecap="round"/>
  <line x1="140" y1="210" x2="240" y2="210" stroke="#F5B7B1" stroke-width="6" stroke-linecap="round"/>
  {face(200, 250, 0.7)}
''', "#FDEDEC"),

    # --- vehicles ---
    "vehicles/car": svg_wrap(f'''
  <rect x="70" y="180" width="260" height="80" rx="30" fill="#E74C3C"/>
  <path d="M120 180 L150 120 L250 120 L280 180 Z" fill="#C0392B"/>
  <rect x="155" y="130" width="50" height="40" rx="6" fill="#AED6F1"/>
  <rect x="215" y="130" width="50" height="40" rx="6" fill="#AED6F1"/>
  <circle cx="130" cy="260" r="28" fill="#2C3E50"/>
  <circle cx="130" cy="260" r="14" fill="#95A5A6"/>
  <circle cx="270" cy="260" r="28" fill="#2C3E50"/>
  <circle cx="270" cy="260" r="14" fill="#95A5A6"/>
  <circle cx="95" cy="210" r="8" fill="#F1C40F"/>
  {face(200, 200, 0.75)}
''', "#FDEDEC"),
    "vehicles/bus": svg_wrap(f'''
  <rect x="60" y="130" width="280" height="130" rx="20" fill="#F1C40F"/>
  <rect x="80" y="150" width="45" height="45" rx="6" fill="#AED6F1"/>
  <rect x="140" y="150" width="45" height="45" rx="6" fill="#AED6F1"/>
  <rect x="200" y="150" width="45" height="45" rx="6" fill="#AED6F1"/>
  <rect x="260" y="150" width="55" height="55" rx="8" fill="#85C1E9"/>
  <circle cx="120" cy="270" r="28" fill="#2C3E50"/>
  <circle cx="120" cy="270" r="14" fill="#95A5A6"/>
  <circle cx="280" cy="270" r="28" fill="#2C3E50"/>
  <circle cx="280" cy="270" r="14" fill="#95A5A6"/>
  <rect x="60" y="210" width="20" height="30" rx="4" fill="#E67E22"/>
  {face(230, 220, 0.65)}
''', "#FEF9E7"),
    "vehicles/train": svg_wrap(f'''
  <rect x="80" y="140" width="180" height="120" rx="16" fill="#3498DB"/>
  <rect x="260" y="160" width="80" height="100" rx="12" fill="#2980B9"/>
  <rect x="100" y="160" width="50" height="50" rx="6" fill="#AED6F1"/>
  <rect x="170" y="160" width="50" height="50" rx="6" fill="#AED6F1"/>
  <rect x="275" y="175" width="50" height="45" rx="6" fill="#85C1E9"/>
  <circle cx="130" cy="275" r="22" fill="#2C3E50"/>
  <circle cx="210" cy="275" r="22" fill="#2C3E50"/>
  <circle cx="300" cy="275" r="22" fill="#2C3E50"/>
  <rect x="70" y="200" width="20" height="40" rx="4" fill="#E74C3C"/>
  {face(195, 230, 0.65)}
''', "#EBF5FB"),
    "vehicles/plane": svg_wrap(f'''
  <ellipse cx="200" cy="200" rx="140" ry="40" fill="#ECF0F1"/>
  <ellipse cx="320" cy="195" rx="35" ry="22" fill="#BDC3C7"/>
  <polygon points="200,200 80,120 100,200 80,280" fill="#5DADE2"/>
  <polygon points="200,200 300,140 280,200 300,260" fill="#5DADE2"/>
  <polygon points="90,200 50,170 55,200 50,230" fill="#E74C3C"/>
  <circle cx="260" cy="190" r="10" fill="#3498DB"/>
  {face(180, 195, 0.7)}
''', "#EBF5FB"),
    "vehicles/bike": svg_wrap(f'''
  <circle cx="120" cy="250" r="55" fill="none" stroke="#2C3E50" stroke-width="12"/>
  <circle cx="280" cy="250" r="55" fill="none" stroke="#2C3E50" stroke-width="12"/>
  <circle cx="120" cy="250" r="12" fill="#95A5A6"/>
  <circle cx="280" cy="250" r="12" fill="#95A5A6"/>
  <path d="M120 250 L200 150 L280 250" fill="none" stroke="#E74C3C" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M200 150 L200 120" stroke="#E74C3C" stroke-width="10" stroke-linecap="round"/>
  <path d="M175 120 L230 115" stroke="#2C3E50" stroke-width="8" stroke-linecap="round"/>
  <circle cx="200" cy="200" r="14" fill="#F1C40F"/>
  {face(200, 175, 0.55)}
''', "#FDEDEC"),
    "vehicles/boat": svg_wrap(f'''
  <path d="M80 220 L320 220 L280 290 L120 290 Z" fill="#E67E22"/>
  <rect x="180" y="120" width="16" height="100" fill="#8B5A2B"/>
  <polygon points="196,130 196,200 280,200" fill="#ECF0F1"/>
  <ellipse cx="100" cy="310" rx="40" ry="12" fill="#5DADE2" opacity="0.5"/>
  <ellipse cx="200" cy="320" rx="50" ry="14" fill="#5DADE2" opacity="0.5"/>
  <ellipse cx="300" cy="310" rx="40" ry="12" fill="#5DADE2" opacity="0.5"/>
  {face(200, 245, 0.7)}
''', "#EBF5FB"),
    "vehicles/truck": svg_wrap(f'''
  <rect x="60" y="150" width="160" height="110" rx="10" fill="#27AE60"/>
  <rect x="220" y="170" width="110" height="90" rx="12" fill="#2ECC71"/>
  <rect x="240" y="185" width="55" height="45" rx="6" fill="#AED6F1"/>
  <circle cx="110" cy="275" r="28" fill="#2C3E50"/>
  <circle cx="110" cy="275" r="14" fill="#95A5A6"/>
  <circle cx="280" cy="275" r="28" fill="#2C3E50"/>
  <circle cx="280" cy="275" r="14" fill="#95A5A6"/>
  <circle cx="310" cy="210" r="8" fill="#F1C40F"/>
  {face(140, 200, 0.7)}
''', "#E8F8F0"),
    "vehicles/scooter": svg_wrap(f'''
  <circle cx="130" cy="280" r="35" fill="none" stroke="#2C3E50" stroke-width="10"/>
  <circle cx="280" cy="280" r="35" fill="none" stroke="#2C3E50" stroke-width="10"/>
  <path d="M130 280 L200 280 L250 160" fill="none" stroke="#9B59B6" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M230 160 L280 155" stroke="#2C3E50" stroke-width="10" stroke-linecap="round"/>
  <rect x="170" y="250" width="70" height="18" rx="8" fill="#8E44AD"/>
  <circle cx="210" cy="220" r="12" fill="#F1C40F"/>
  {face(210, 200, 0.55)}
''', "#F5EEF8"),
}

# Color swatches with cute faces
for name, hex_color in COLOR_HEX.items():
    SVGS[f"colors/{name}"] = svg_wrap(f'''
  <circle cx="200" cy="200" r="120" fill="{hex_color}"/>
  <ellipse cx="155" cy="170" rx="22" ry="14" fill="#fff" opacity="0.25"/>
  {blush(200, 210)}
  {face(200, 190)}
''', "#FFF8F0")


def write_images() -> int:
    count = 0
    for key, content in SVGS.items():
        category, name = key.split("/", 1)
        path = IMG / category / f"{name}.svg"
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content, encoding="utf-8")
        count += 1
    return count


VOICES = {
    "woman": "en-US-JennyNeural",
    "man": "en-US-AndrewNeural",
}


async def synthesize_one(word: str, out_path: Path, voice: str) -> None:
    import edge_tts

    out_path.parent.mkdir(parents=True, exist_ok=True)
    communicate = edge_tts.Communicate(word, voice, rate="-10%")
    await communicate.save(str(out_path))


async def write_audio() -> int:
    tasks = []
    for voice_key, voice_id in VOICES.items():
        for category, items in LESSONS.items():
            for item_id, word, _hint in items:
                out = AUD / voice_key / category / f"{item_id}.mp3"
                tasks.append(synthesize_one(word, out, voice_id))
    # Run in moderate batches.
    for i in range(0, len(tasks), 10):
        await asyncio.gather(*tasks[i : i + 10])
    return len(tasks)


def write_lessons_json() -> None:
    import json

    data = {}
    for category, items in LESSONS.items():
        data[category] = [
            {
                "id": item_id,
                "word": word,
                "hint": hint,
                "image": f"assets/images/{category}/{item_id}.png",
                "audio": {
                    voice_key: f"assets/audio/{voice_key}/{category}/{item_id}.mp3"
                    for voice_key in VOICES
                },
            }
            for item_id, word, hint in items
        ]
    path = ROOT / "js" / "lessons.json"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


async def main() -> None:
    n_img = write_images()
    print(f"Wrote {n_img} SVG images")
    write_lessons_json()
    print("Wrote lessons.json")
    try:
        n_aud = await write_audio()
        print(f"Wrote {n_aud} audio files via edge-tts")
    except Exception as exc:
        print(f"edge-tts failed ({exc}); falling back to espeak-ng")
        n_aud = 0
        for voice_key in VOICES:
            for category, items in LESSONS.items():
                for item_id, word, _hint in items:
                    wav = AUD / voice_key / category / f"{item_id}.wav"
                    mp3 = AUD / voice_key / category / f"{item_id}.mp3"
                    wav.parent.mkdir(parents=True, exist_ok=True)
                    variant = "en-us+f2" if voice_key == "woman" else "en-us+m3"
                    os.system(
                        f'espeak-ng -v {variant} -s 130 -w "{wav}" "{word}" && '
                        f'ffmpeg -y -i "{wav}" -codec:a libmp3lame -qscale:a 4 "{mp3}" >/dev/null 2>&1 && '
                        f'rm -f "{wav}"'
                    )
                    n_aud += 1
        print(f"Wrote {n_aud} audio files via espeak-ng")


if __name__ == "__main__":
    asyncio.run(main())
