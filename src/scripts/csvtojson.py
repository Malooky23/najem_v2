import pandas as pd
import json

# Load the CSV file into a DataFrame
df = pd.read_csv('/Users/malek/local_projects/local_najem_v2/najem_v2/src/scripts/data.csv')

# Function to transform each row into the desired JSON format
def transform_row(row):
    return {
        "country": row["country"],
        "business_name": row["business_name"],
        "is_tax_registered": row["is_tax_registered"],
        "tax_number": row["tax_number"],
        "address": {
            "address_1": row["address_1"],
            "address_2": row["address_2"],
            "city": row["city"],
            "postal_code": row["postal_code"]
        },
        "contacts": [
            {"type": "email", "value": row["email"]},
            {"type": "mobile", "value": row["mobile"]}
        ]
    }

# Apply the transformation to each row and convert the DataFrame to a list of dictionaries
json_data = df.apply(transform_row, axis=1).tolist()

# Convert the list of dictionaries to a JSON string
json_output = json.dumps(json_data, indent=4)

# Save the JSON output to a file or print it
with open('output.json', 'w') as json_file:
    json_file.write(json_output)

# Print the JSON output (optional)
print(json_output)