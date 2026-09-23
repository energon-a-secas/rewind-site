// ── Data Extraction ─────────────────────────────────────────────

export const data = [
  {
    id: 'csv-headers',
    title: 'Extract and list CSV headers',
    description: 'Reads the first line of a CSV file and prints each field on its own line, numbered',
    command: `head -1 data.csv | tr ',' '\\n' | nl`,
    platform: 'bash',
    tags: ['csv', 'headers', 'data', 'extract'],
    category: 'data',
  },
  {
    id: 'csv-unique-values',
    title: 'Unique values from a CSV column',
    description: 'Extracts distinct values from column N (1-indexed), skipping the header',
    command: `awk -F',' 'NR>1 {print $2}' data.csv | sort -u`,
    platform: 'bash',
    tags: ['csv', 'unique', 'data', 'awk'],
    category: 'data',
  },
  {
    id: 'json-keys',
    title: 'List top-level JSON keys',
    description: 'Extracts all top-level keys from a JSON file or object',
    command: `cat data.json | python3 -c "import sys,json; print('\\n'.join(json.load(sys.stdin).keys()))"`,
    platform: 'bash',
    tags: ['json', 'keys', 'data', 'python'],
    category: 'data',
  },
  {
    id: 'extract-emails',
    title: 'Extract email addresses from text',
    description: 'Pulls all email addresses from a file using grep regex',
    command: `grep -oE '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}' file.txt | sort -u`,
    platform: 'bash',
    tags: ['regex', 'email', 'extract', 'grep'],
    category: 'data',
  },
  {
    id: 'csv-count-per-value',
    title: 'Count occurrences per field value',
    description: 'Groups and counts how often each value appears in a CSV column',
    command: `awk -F',' 'NR>1 {count[$3]++} END {for (k in count) print count[k], k}' data.csv | sort -rn`,
    platform: 'bash',
    tags: ['csv', 'count', 'data', 'awk', 'aggregate'],
    category: 'data',
  },
  {
    id: 'csv-to-json',
    title: 'Convert CSV to JSON',
    description: 'Turns a CSV file into a JSON array of objects using only Python stdlib — no pandas needed',
    command: `python3 -c "
import csv, json, sys
with open('data.csv') as f:
    print(json.dumps(list(csv.DictReader(f)), indent=2))
"`,
    platform: 'bash',
    tags: ['csv', 'json', 'convert', 'python', 'data'],
    category: 'data',
  },
  {
    id: 'extract-urls',
    title: 'Extract all URLs from a file',
    description: 'Pulls every http/https URL from a text file using grep regex',
    command: `grep -oE 'https?://[^ ]+' file.txt | sort -u`,
    platform: 'bash',
    tags: ['regex', 'url', 'extract', 'grep', 'data'],
    category: 'data',
  },
  {
    id: 'merge-csvs',
    title: 'Merge multiple CSVs with same headers',
    description: 'Concatenates CSV files keeping only one header row — works with any number of files',
    command: `head -1 file1.csv > merged.csv && tail -n +2 -q *.csv >> merged.csv`,
    platform: 'bash',
    tags: ['csv', 'merge', 'concatenate', 'data'],
    category: 'data',
  },
  {
    id: 'jq-nested-extract',
    title: 'Extract nested JSON values with jq',
    description: 'Drills into nested JSON arrays and objects — outputs flat TSV for easy piping',
    command: `cat data.json | jq -r '.items[] | [.id, .metadata.name, .status.phase] | @tsv'`,
    platform: 'bash',
    tags: ['json', 'jq', 'nested', 'extract', 'data'],
    category: 'data',
  },
  {
    id: 'xml-to-json',
    title: 'Convert XML to JSON',
    description: 'Quick XML-to-JSON conversion using Python xmltodict — install with pip if missing',
    command: `python3 -c "
import xmltodict, json, sys
with open('data.xml') as f:
    print(json.dumps(xmltodict.parse(f.read()), indent=2))
"`,
    platform: 'bash',
    tags: ['xml', 'json', 'convert', 'python', 'data'],
    category: 'data',
  },
  {
    id: 'jq-filter-by-field',
    title: 'jq: filter array items by field value',
    description: 'Selects objects from a JSON array where a field matches a condition',
    command: `# Exact match
cat data.json | jq '.items[] | select(.status == "active")'

# Contains string
cat data.json | jq '.items[] | select(.name | contains("prod"))'

# Numeric comparison
cat data.json | jq '.items[] | select(.count > 100)'`,
    platform: 'bash',
    tags: ['jq', 'json', 'filter', 'query', 'data'],
    category: 'data',
  },
  {
    id: 'jq-reshape-objects',
    title: 'jq: reshape objects (pick/rename fields)',
    description: 'Transform JSON objects by selecting, renaming, or computing new fields',
    command: `# Pick specific fields
cat data.json | jq '.[] | {name, email}'

# Rename fields
cat data.json | jq '.[] | {user_name: .name, mail: .email}'

# Computed fields
cat data.json | jq '.[] | {name, full: (.first + " " + .last)}'`,
    platform: 'bash',
    tags: ['jq', 'json', 'transform', 'reshape', 'data'],
    category: 'data',
  },
  {
    id: 'jq-group-count',
    title: 'jq: group by and count',
    description: 'Groups JSON array items by a field and counts occurrences — the SQL GROUP BY of jq',
    command: `cat data.json | jq 'group_by(.status) | map({status: .[0].status, count: length})'`,
    platform: 'bash',
    tags: ['jq', 'json', 'group', 'count', 'aggregate', 'data'],
    category: 'data',
  },
  {
    id: 'jq-flatten-merge',
    title: 'jq: flatten nested arrays and merge objects',
    description: 'Common jq transforms for deeply nested JSON structures',
    command: `# Flatten nested arrays
cat data.json | jq '[.teams[].members[]]'

# Merge two objects
echo '{"a":1}' | jq '. + {"b":2, "c":3}'

# Flatten one level
cat data.json | jq '.nested | flatten(1)'

# Collect all values of a key at any depth
cat data.json | jq '.. | .id? // empty'`,
    platform: 'bash',
    tags: ['jq', 'json', 'flatten', 'merge', 'nested', 'data'],
    category: 'data',
  },
  {
    id: 'jq-csv-output',
    title: 'jq: convert JSON array to CSV',
    description: 'Outputs a JSON array as comma-separated values with a header row',
    command: `cat data.json | jq -r '
  (.[0] | keys_unsorted) as $keys |
  ($keys | @csv),
  (.[] | [.[$keys[]]] | @csv)
'`,
    platform: 'bash',
    tags: ['jq', 'json', 'csv', 'convert', 'export', 'data'],
    category: 'data',
  },
  {
    id: 'jq-update-in-place',
    title: 'jq: modify values in a JSON file',
    description: 'Update specific fields and write back — jq has no in-place flag so pipe through sponge or a temp file',
    command: `# Update a field
jq '.version = "2.0.0"' package.json > tmp.json && mv tmp.json package.json

# Delete a field
jq 'del(.devDependencies)' package.json > tmp.json && mv tmp.json package.json

# Add to an array
jq '.tags += ["new-tag"]' data.json > tmp.json && mv tmp.json data.json`,
    platform: 'bash',
    tags: ['jq', 'json', 'edit', 'update', 'modify'],
    category: 'data',
  },
  {
    id: 'yq-read-value',
    title: 'yq: read values from YAML',
    description: 'Extract specific values from YAML files — same dot-path syntax as jq',
    command: `# Read a value
yq '.metadata.name' deployment.yaml

# Read nested array item
yq '.spec.containers[0].image' pod.yaml

# Read all image fields
yq '.spec.containers[].image' pod.yaml`,
    platform: 'bash',
    tags: ['yq', 'yaml', 'read', 'query', 'k8s'],
    category: 'data',
  },
  {
    id: 'yq-edit-yaml',
    title: 'yq: edit YAML files in place',
    description: 'Modify YAML values without breaking formatting or comments — essential for CI/CD pipelines',
    command: `# Update a value in place
yq -i '.spec.replicas = 3' deployment.yaml

# Update image tag
yq -i '.spec.containers[0].image = "app:v2.1.0"' deployment.yaml

# Add a new field
yq -i '.metadata.labels.env = "production"' deployment.yaml

# Delete a field
yq -i 'del(.metadata.annotations)' deployment.yaml`,
    platform: 'bash',
    tags: ['yq', 'yaml', 'edit', 'update', 'k8s', 'cicd'],
    category: 'data',
  },
  {
    id: 'yq-convert-formats',
    title: 'yq: convert between YAML, JSON, and XML',
    description: 'Translate between formats using yq — handy for piping YAML into jq or generating configs',
    command: `# YAML to JSON
yq -o=json deployment.yaml

# JSON to YAML
yq -P data.json

# YAML to CSV (for tabular data)
yq -o=csv '.items[]' data.yaml

# Multiple YAML docs to JSON array
yq -o=json -s '.' multi-doc.yaml`,
    platform: 'bash',
    tags: ['yq', 'yaml', 'json', 'convert', 'format'],
    category: 'data',
  },
  {
    id: 'yq-merge-yamls',
    title: 'yq: merge multiple YAML files',
    description: 'Combine base and overlay YAML files — like Kustomize but simpler',
    command: `# Merge overlay into base (overlay wins)
yq '. *= load("overlay.yaml")' base.yaml

# Merge and write to new file
yq eval-all 'select(fileIndex == 0) * select(fileIndex == 1)' base.yaml overlay.yaml > merged.yaml

# Append arrays instead of replacing
yq '. *+ load("extra.yaml")' base.yaml`,
    platform: 'bash',
    tags: ['yq', 'yaml', 'merge', 'overlay', 'k8s'],
    category: 'data',
  },
];
