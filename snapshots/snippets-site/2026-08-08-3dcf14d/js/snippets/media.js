// ── Media & Files ────────────────────────────────────────────

export const media = [
  {
    id: 'ffmpeg-trim',
    title: 'Trim a video without re-encoding',
    description: 'Cut a section out in seconds — copying streams instead of re-encoding is near-instant',
    command: `# 30 seconds starting at 1m15s, no quality loss, no waiting
ffmpeg -ss 00:01:15 -i input.mp4 -t 30 -c copy out.mp4

# Between two timestamps
ffmpeg -ss 00:01:15 -to 00:01:45 -i input.mp4 -c copy out.mp4

# Frame-accurate cut (re-encodes, slower, no keyframe drift at the start)
ffmpeg -i input.mp4 -ss 00:01:15 -to 00:01:45 -c:v libx264 -crf 18 out.mp4`,
    platform: 'bash',
    tags: ['ffmpeg', 'video', 'trim', 'convert', 'media'],
    category: 'media',
  },
  {
    id: 'ffmpeg-compress',
    title: 'Shrink a video for sharing',
    description: 'CRF is the quality dial: 18 near-lossless, 23 default, 28 small. Higher = smaller',
    command: `ffmpeg -i input.mp4 -c:v libx264 -crf 28 -preset slow -c:a aac -b:a 128k out.mp4

# Also cap the resolution — usually the biggest win
ffmpeg -i input.mp4 -vf "scale=-2:720" -c:v libx264 -crf 26 -c:a aac out.mp4

# Modern codec, roughly 30% smaller at the same quality
ffmpeg -i input.mp4 -c:v libx265 -crf 28 -tag:v hvc1 -c:a aac out.mp4

# How big did it get?
ls -lh input.mp4 out.mp4`,
    platform: 'bash',
    tags: ['ffmpeg', 'video', 'compress', 'size', 'media'],
    category: 'media',
  },
  {
    id: 'ffmpeg-extract-audio',
    title: 'Extract audio from a video',
    description: 'Keep the original audio stream, or transcode it to mp3',
    command: `# Copy the existing audio stream — instant, no quality loss
ffmpeg -i video.mp4 -vn -c:a copy audio.m4a

# Transcode to mp3 (-q:a 2 is roughly 190kbps VBR)
ffmpeg -i video.mp4 -vn -c:a libmp3lame -q:a 2 audio.mp3

# Downsize a big wav for a podcast
ffmpeg -i podcast.wav -c:a aac -b:a 96k podcast.m4a

# What audio streams are in there?
ffprobe -v error -select_streams a -show_entries stream=index,codec_name -of csv video.mp4`,
    platform: 'bash',
    tags: ['ffmpeg', 'audio', 'extract', 'convert', 'media'],
    category: 'media',
  },
  {
    id: 'ffmpeg-to-gif',
    title: 'Video to a GIF that does not look terrible',
    description: 'The two-pass palette trick — one-pass GIFs come out banded and huge',
    command: `# Pass 1: build an optimal 256-colour palette
ffmpeg -i clip.mp4 -vf "fps=15,scale=720:-1:flags=lanczos,palettegen" -y palette.png

# Pass 2: use it
ffmpeg -i clip.mp4 -i palette.png \\
  -lavfi "fps=15,scale=720:-1:flags=lanczos [x]; [x][1:v] paletteuse" -y out.gif

# Smaller: drop fps and width
ffmpeg -i clip.mp4 -vf "fps=10,scale=480:-1" -y small.gif`,
    platform: 'bash',
    tags: ['ffmpeg', 'gif', 'video', 'convert', 'media'],
    category: 'media',
  },
  {
    id: 'ffmpeg-convert',
    title: 'Convert between video formats',
    description: 'mov to mp4, webm to mp4, and the remux that costs nothing',
    command: `ffmpeg -i input.mov -c:v libx264 -crf 20 -c:a aac out.mp4
ffmpeg -i input.webm -c:v libx264 -c:a aac out.mp4
ffmpeg -i input.mp4 -c:v libvpx-vp9 -crf 32 -b:v 0 out.webm

# Same codecs, different container — instant, lossless
ffmpeg -i input.mkv -c copy out.mp4

# Batch a whole folder
for f in *.mov; do ffmpeg -i "$f" -c:v libx264 -crf 22 "\${f%.mov}.mp4"; done`,
    platform: 'bash',
    tags: ['ffmpeg', 'video', 'convert', 'format', 'media'],
    category: 'media',
  },
  {
    id: 'ffmpeg-resize-crop',
    title: 'Resize, crop and rotate video',
    description: 'scale=-2 keeps the aspect ratio and guarantees an even number of pixels',
    command: `ffmpeg -i in.mp4 -vf "scale=1920:-2" out.mp4       # to 1080p wide
ffmpeg -i in.mp4 -vf "scale=-2:720" out.mp4        # to 720p tall

# Square crop: width:height:x:y
ffmpeg -i in.mp4 -vf "crop=1080:1080:420:0" square.mp4

# Rotate: 1 = 90 clockwise, 2 = 90 counter-clockwise
ffmpeg -i in.mp4 -vf "transpose=1" rotated.mp4

# Pad to 16:9 instead of cropping
ffmpeg -i in.mp4 -vf "scale=1280:-2,pad=1280:720:0:(oh-ih)/2" padded.mp4`,
    platform: 'bash',
    tags: ['ffmpeg', 'video', 'resize', 'crop', 'media'],
    category: 'media',
  },
  {
    id: 'ffmpeg-concat',
    title: 'Join multiple videos into one',
    description: 'Works without re-encoding when the clips share codec and resolution',
    command: String.raw`# Build the list file, then concatenate
printf "file '%s'\n" *.mp4 > list.txt
ffmpeg -f concat -safe 0 -i list.txt -c copy joined.mp4

# Clips with different codecs or sizes need a re-encode
ffmpeg -i a.mp4 -i b.mp4 -filter_complex "[0:v][0:a][1:v][1:a]concat=n=2:v=1:a=1[v][a]" -map "[v]" -map "[a]" joined.mp4`,
    platform: 'bash',
    tags: ['ffmpeg', 'video', 'concatenate', 'merge', 'media'],
    category: 'media',
  },
  {
    id: 'ffmpeg-frames',
    title: 'Grab still frames from a video',
    description: 'A thumbnail at a timestamp, or a frame every N seconds',
    command: String.raw`# One frame at 5 seconds, high quality
ffmpeg -ss 00:00:05 -i video.mp4 -frames:v 1 -q:v 2 thumb.jpg

# A frame every 10 seconds
ffmpeg -i video.mp4 -vf fps=1/10 frame_%04d.png

# Every scene change — good for finding chapters
ffmpeg -i video.mp4 -vf "select=gt(scene\,0.4)" -vsync vfr scene_%03d.png`,
    platform: 'bash',
    tags: ['ffmpeg', 'video', 'screenshot', 'images', 'media'],
    category: 'media',
  },
  {
    id: 'ffmpeg-audio-ops',
    title: 'Strip, boost, normalise or replace audio',
    description: 'The audio operations you need right before publishing a clip',
    command: `ffmpeg -i in.mp4 -an out.mp4                       # remove audio entirely
ffmpeg -i in.mp4 -af "volume=1.8" louder.mp4
ffmpeg -i in.mp4 -af "loudnorm" normalized.mp4     # broadcast loudness

# Swap in a different audio track
ffmpeg -i video.mp4 -i music.mp3 -map 0:v -map 1:a -c:v copy -shortest out.mp4

# Fade in over 2s, fade out for the last 3s of a 60s clip
ffmpeg -i in.mp3 -af "afade=t=in:d=2,afade=t=out:st=57:d=3" out.mp3`,
    platform: 'bash',
    tags: ['ffmpeg', 'audio', 'volume', 'media'],
    category: 'media',
  },
  {
    id: 'ffmpeg-speed',
    title: 'Speed up or slow down a video',
    description: 'setpts handles video, atempo handles audio — change both or they desync',
    command: `# 2x faster
ffmpeg -i in.mp4 -vf "setpts=0.5*PTS" -af "atempo=2.0" fast.mp4

# Half speed
ffmpeg -i in.mp4 -vf "setpts=2.0*PTS" -af "atempo=0.5" slow.mp4

# Silent timelapse at 4x
ffmpeg -i in.mp4 -an -vf "setpts=0.25*PTS" timelapse.mp4

# atempo only accepts 0.5-2.0 — chain it for more
ffmpeg -i in.mp4 -vf "setpts=0.25*PTS" -af "atempo=2.0,atempo=2.0" faster.mp4`,
    platform: 'bash',
    tags: ['ffmpeg', 'video', 'speed', 'media'],
    category: 'media',
  },
  {
    id: 'ffprobe-inspect',
    title: 'Inspect a media file',
    description: 'Codec, resolution, frame rate and duration as plain values you can script against',
    command: `ffprobe -v error -show_format -show_streams input.mp4

# Just the numbers, CSV, ready to pipe
ffprobe -v error -select_streams v:0 \\
  -show_entries stream=width,height,r_frame_rate,codec_name \\
  -of csv=p=0 input.mp4

# Duration in seconds
ffprobe -v error -show_entries format=duration -of csv=p=0 input.mp4

# Every stream in the file, one line each
ffprobe -v error -show_entries stream=index,codec_type,codec_name -of csv input.mkv`,
    platform: 'bash',
    tags: ['ffmpeg', 'ffprobe', 'video', 'inspect', 'media'],
    category: 'media',
  },
  {
    id: 'imagemagick-resize',
    title: 'Batch resize and convert images',
    description: 'One image or a whole folder, with mogrify doing the batch work in place',
    command: `magick input.png -resize 800x800 output.png
magick input.jpg -resize 50% half.jpg

# Whole folder: resize to 1200px wide and convert to jpg
magick mogrify -resize 1200x -format jpg *.png

# Exact size, cropped from the centre — how OG images get made
magick input.png -resize 1200x630^ -gravity center -extent 1200x630 og.jpg

# ImageMagick 6 uses "convert" instead of "magick"
convert input.png -resize 800x800 output.png`,
    platform: 'bash',
    tags: ['imagemagick', 'images', 'resize', 'convert', 'media', 'bulk'],
    category: 'media',
  },
  {
    id: 'imagemagick-optimize',
    title: 'Compress images for the web',
    description: 'Strip metadata and tune quality — usually 60-80% smaller with no visible difference',
    command: `magick input.jpg -strip -quality 82 -sampling-factor 4:2:0 -interlace JPEG out.jpg
magick input.png -strip -define png:compression-level=9 out.png

# Dedicated tools do better than ImageMagick alone
pngquant --quality=65-85 --ext .min.png input.png
jpegoptim --max=82 --strip-all *.jpg

# Modern formats
magick input.png -quality 80 out.webp
magick input.png -quality 60 out.avif`,
    platform: 'bash',
    tags: ['imagemagick', 'images', 'compress', 'optimize', 'performance', 'media'],
    category: 'media',
  },
  {
    id: 'imagemagick-montage',
    title: 'Combine images side by side or in a grid',
    description: 'Before/after comparisons and contact sheets without opening an editor',
    command: `magick a.png b.png +append side-by-side.png     # horizontally
magick a.png b.png -append stacked.png          # vertically

# Grid with 4 per row and 8px gutters
magick montage *.png -tile 4x -geometry +8+8 -background none grid.png

# Add a label under each one
magick montage *.png -label '%f' -tile 3x -geometry +6+6 labelled.png`,
    platform: 'bash',
    tags: ['imagemagick', 'images', 'merge', 'media'],
    category: 'media',
  },
  {
    id: 'pdf-merge',
    title: 'Merge PDFs from the terminal',
    description: 'qpdf is the cleanest option and preserves bookmarks',
    command: `qpdf --empty --pages a.pdf b.pdf c.pdf -- merged.pdf

# Everything in a folder, in name order
qpdf --empty --pages *.pdf -- merged.pdf

# Ghostscript alternative (also recompresses)
gs -dBATCH -dNOPAUSE -q -sDEVICE=pdfwrite -sOutputFile=merged.pdf a.pdf b.pdf

# pdftk if you already have it
pdftk a.pdf b.pdf cat output merged.pdf`,
    platform: 'bash',
    tags: ['pdf', 'merge', 'qpdf', 'files', 'media'],
    category: 'media',
  },
  {
    id: 'pdf-split',
    title: 'Split a PDF or extract page ranges',
    description: 'Pull out the pages you need without a web uploader touching your document',
    command: `qpdf --show-npages input.pdf              # how many pages?

qpdf input.pdf --pages . 3-7 -- pages-3-7.pdf
qpdf input.pdf --pages . 1-5 . 10-12 -- selected.pdf
qpdf input.pdf --pages . 1-z:even -- even-pages.pdf

# One file per page: out-01.pdf, out-02.pdf, ...
qpdf --split-pages input.pdf out.pdf

# Rotate pages 2 to 5
qpdf input.pdf --rotate=+90:2-5 -- rotated.pdf`,
    platform: 'bash',
    tags: ['pdf', 'split', 'qpdf', 'files', 'media'],
    category: 'media',
  },
  {
    id: 'pdf-compress',
    title: 'Shrink a PDF that is too big to email',
    description: 'PDFSETTINGS picks the quality preset — /ebook is the usual sweet spot',
    command: `gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/ebook \\
   -dNOPAUSE -dQUIET -dBATCH -sOutputFile=small.pdf input.pdf

#  /screen   72 dpi   smallest, screen only
#  /ebook    150 dpi  the usual choice
#  /printer  300 dpi  good print quality
#  /prepress 300 dpi  colour preserved, largest

# Check the result
ls -lh input.pdf small.pdf`,
    platform: 'bash',
    tags: ['pdf', 'compress', 'ghostscript', 'size', 'media'],
    category: 'media',
  },
  {
    id: 'pdf-to-images',
    title: 'PDF to images, and PDF to text',
    description: 'Render pages as PNGs, or pull the text layer out for grepping',
    command: String.raw`pdftoppm -r 150 -png input.pdf page       # page-1.png, page-2.png, ...
pdftoppm -r 300 -jpeg -f 1 -l 1 input.pdf cover

# Just the first page, via ImageMagick
magick -density 150 "input.pdf[0]" cover.png

# Text layer to stdout, then search it
pdftotext input.pdf - | grep -i "invoice"
pdftotext -layout input.pdf out.txt       # preserve column layout`,
    platform: 'bash',
    tags: ['pdf', 'images', 'convert', 'text', 'extract', 'media'],
    category: 'media',
  },
  {
    id: 'archive-recipes',
    title: 'tar and zip recipes',
    description: 'Create, list, extract, and pull one file out without unpacking everything',
    command: `tar -czf site.tar.gz site/                 # create
tar -tzf site.tar.gz                       # list without extracting
tar -xzf site.tar.gz -C /tmp/out           # extract into a folder
tar -xzf site.tar.gz site/one-file.txt     # extract a single file

# Exclude noise while creating
tar --exclude='node_modules' --exclude='.git' -czf src.tar.gz .

zip -r site.zip site -x "*.git*" "node_modules/*"
unzip -l site.zip                          # list
unzip site.zip -d out/
unzip -o site.zip 'docs/*'                 # only matching entries`,
    platform: 'bash',
    tags: ['tar', 'zip', 'archive', 'compress', 'files', 'media'],
    category: 'media',
  },
  {
    id: 'base64-encode',
    title: 'Base64 encode and decode',
    description: 'Data URIs, basic auth headers, and inlining a file into a config',
    command: `base64 -i logo.png -o logo.b64            # macOS
base64 -w0 logo.png > logo.b64            # GNU/Linux, no line wrapping

echo -n "user:pass" | base64              # basic auth value
echo "dXNlcjpwYXNz" | base64 --decode

# A data URI straight to the clipboard
printf 'data:image/png;base64,%s' "$(base64 -i logo.png)" | pbcopy

# Decode a JWT payload without a website
echo "$JWT" | cut -d. -f2 | base64 -d 2>/dev/null | jq .`,
    platform: 'bash',
    tags: ['base64', 'encode', 'decode', 'files', 'media'],
    category: 'media',
  },
  {
    id: 'checksum-verify',
    title: 'Generate and verify checksums',
    description: 'Prove a download is intact, or that two files are byte-identical',
    command: String.raw`shasum -a 256 ubuntu.iso                  # macOS
sha256sum ubuntu.iso                      # Linux

# Check against a published checksum file
shasum -a 256 -c SHASUMS256.txt --ignore-missing

# Are these two files identical?
[ "$(shasum -a 256 a.zip | cut -d' ' -f1)" = "$(shasum -a 256 b.zip | cut -d' ' -f1)" ] && echo same

# Checksum an entire folder
find . -type f -exec shasum -a 256 {} + | sort -k2 | shasum -a 256

# Windows
Get-FileHash .\ubuntu.iso -Algorithm SHA256`,
    platform: 'bash',
    tags: ['checksum', 'hash', 'security', 'verify', 'files', 'media'],
    category: 'media',
  },
  {
    id: 'exif-strip',
    title: 'Strip metadata from photos before sharing',
    description: 'Photos carry GPS coordinates, device serials and timestamps — remove them',
    command: `# What is actually in there?
exiftool photo.jpg
exiftool -gps:all photo.jpg

# Remove everything
exiftool -all= photo.jpg

# Remove only location and XMP, keep the camera settings
exiftool -gps:all= -xmp:all= photo.jpg

# Whole folder, no .original backups
exiftool -r -all= -overwrite_original ./photos

# No exiftool? ImageMagick strips most of it
magick input.jpg -strip output.jpg`,
    platform: 'bash',
    tags: ['exif', 'metadata', 'privacy', 'images', 'security', 'media'],
    category: 'media',
  },
];
