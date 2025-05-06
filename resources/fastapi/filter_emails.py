import json
with open("/home/suraj-jha/projects/presentation_generator/emails-Apr_19 (1).json", "r") as f:
    companies  = json.load(f)

pushed_emails = []

emails = []

prohibited_domains = ["huggingface.co", "github.com", "producthunt.com", "pypi.org", "example.com", "sentry-next.wixpress.com"]

for company in companies:
    product = company.get("product", {})
    name = product.get("name", "")
    if ". " in name:
        name = name.split(". ")[-1].strip()
    short_description = product.get("short_description", "")
    description = product.get("description", "")
    for email in company.get("emails", []):
        if email == "*" or email.split("@")[-1] in prohibited_domains:
            continue
        if email not in pushed_emails:
            if ".jpg" in email or ".png" in email or ".jpeg" in email:
                continue
            emails.append({"company_name": name, "description": description, "short_description": description, "email": email})
            pushed_emails.append(email)

import csv

# Define the CSV headers
headers = ['Email (*)', 'Contact Name', 'Company']

# Write to CSV file
with open('emails.csv', 'w', newline='') as csvfile:
    writer = csv.writer(csvfile)
    writer.writerow(headers)
    
    # Write each email entry
    for entry in emails:
        writer.writerow([
            entry['email'],
            '',  # Empty contact name column
            entry['company_name']
        ])
