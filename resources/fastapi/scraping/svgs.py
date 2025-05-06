from bs4 import BeautifulSoup
import os

# Create svgs directory if it doesn't exist
os.makedirs('svgs', exist_ok=True)

# Read the HTML file
with open('svgs.html', 'r', encoding='utf-8') as file:
    html_content = file.read()

# Parse HTML
soup = BeautifulSoup(html_content, 'html.parser')

# Find all buttons
buttons = soup.find_all('button')

# List to store aria-labels
aria_labels = []

# Process each button
for button in buttons:
    # Get aria-label
    aria_label = button.get('aria-label')
    if not aria_label:
        continue
    
    # Clean aria-label for filename
    clean_label = aria_label.lower().replace(' ', '_')
    
    # Find SVG in button
    svg = button.find('svg')
    if not svg:
        continue
    
    # Add to aria-labels list
    aria_labels.append(aria_label)
    
    # Save SVG file
    svg_filename = f'svgs/{clean_label}.svg'
    with open(svg_filename, 'w', encoding='utf-8') as f:
        f.write(str(svg))

# Save aria-labels to txt file
with open('aria_labels.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(aria_labels))

print(f"Saved {len(aria_labels)} SVGs and created aria_labels.txt")
