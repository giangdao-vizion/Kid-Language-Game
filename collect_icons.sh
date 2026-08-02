#!/bin/bash

# List of words to search
words=(
  "cat" "dog" "bird" "fish" "rabbit" "elephant" "lion" "duck"
  "apple" "banana" "orange" "grape" "strawberry" "watermelon" "mango" "cherry"
  "chair" "table" "bed" "lamp" "clock" "door" "cup" "book"
  "car" "bus" "train" "plane" "bike" "boat" "truck" "scooter"
  "red" "blue" "yellow" "green" "orange" "purple" "pink" "brown"
  "rainbow"
)

echo "Words to search: ${#words[@]}"
for word in "${words[@]}"; do
  echo "- $word"
done
