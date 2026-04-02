#!/usr/bin/env bash
# generate-gallery.sh — Scans gallery/*.html and generates gallery/index.html
# Usage: ./generate-gallery.sh
# Drop any self-contained HTML artifact into gallery/ and re-run.

set -euo pipefail

GALLERY_DIR="$(cd "$(dirname "$0")/gallery" && pwd)"
OUTPUT="$GALLERY_DIR/index.html"

# Collect all .html files except index.html, sorted alphabetically
mapfile -t files < <(
  find "$GALLERY_DIR" -maxdepth 1 -name '*.html' ! -name 'index.html' -printf '%f\n' | sort
)

if [ ${#files[@]} -eq 0 ]; then
  echo "No HTML files found in gallery/. Nothing to generate."
  exit 0
fi

# Extract <title> from an HTML file, fallback to filename
get_title() {
  local file="$1"
  local title
  title=$(grep -oP '(?<=<title>).*?(?=</title>)' "$GALLERY_DIR/$file" | head -1)
  if [ -z "$title" ]; then
    title="${file%.html}"
  fi
  echo "$title"
}

# Build the artifact list entries
artifact_entries=""
for file in "${files[@]}"; do
  title=$(get_title "$file")
  artifact_entries+="
    <details data-skin=\"elevated\">
      <summary>
        <h3 data-colspan=\"10\"><a href=\"$file\">$title</a></h3>
        <a data-colspan=\"2\" href=\"$file\" aria-label=\"View $title\">View</a>
      </summary>
    </details>"
done

count=${#files[@]}

cat > "$OUTPUT" << HEREDOC
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Artifact Gallery — PAUMEN-UI</title>
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,200..1000;1,200..1000&display=swap"
    />
    <link rel="stylesheet" href="../pre-prototype/blueprint.css" />
  </head>
  <body>
    <article>
      <header>
        <h1 data-colspan="12">Artifact Gallery</h1>
      </header>
      <p data-skin="mute">
        <small>$count artifacts. Drop any self-contained HTML file into <code>gallery/</code> and re-run <code>generate-gallery.sh</code>.</small>
      </p>
    </article>
$artifact_entries
  </body>
</html>
HEREDOC

echo "Generated $OUTPUT with $count artifacts."
