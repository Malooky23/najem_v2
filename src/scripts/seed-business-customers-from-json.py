#!/usr/bin/env python3
import json
import requests
import sys

def transform_customer(raw):
    """
    Transform a raw business customer (from JSON) to the API's expected shape.
    """
    return {
        "country": raw["country"],
        "businessName": raw["business_name"],
        "isTaxRegistered": raw["is_tax_registered"],
        "taxNumber": str(raw["tax_number"]),  # convert to string if needed
        "address": {
            "address1": raw["address"]["address_1"],
            "address2": raw["address"]["address_2"],
            "city": raw["address"]["city"],
            "postalCode": raw["address"]["postal_code"],
        },
        "contacts": [
            {"contact_type": contact["type"], "contact_value": str(contact["value"])}
            for contact in raw.get("contacts", [])
     
        ],
    }

def seed_business_customers():
    # Read and parse the JSON file.
    try:
        with open("output.json", "r", encoding="utf-8") as f:
            raw_customers = json.load(f)
    except Exception as e:
        print(f"Error reading the JSON file: {e}")
        sys.exit(1)

    url = "http://localhost:3000/api/customers/business"
    headers = {
        "Content-Type": "application/json",
        # If your API requires authentication, add headers or cookies accordingly.
        # "Authorization": "Bearer YOUR_TOKEN"
    }

    # Iterate through each customer and make a POST request.
    for raw_customer in raw_customers:
        customer = transform_customer(raw_customer)
        try:
            response = requests.post(url, json=customer, headers=headers)
            if response.status_code == 200:
                resp_data = response.json()
                if resp_data.get("success"):
                    print(f"Successfully created customer: {customer['businessName']}")
                else:
                    print(f"Error creating customer {customer['businessName']}: {resp_data.get('error')}")
            else:
                print(f"Request failed for {customer['businessName']}: {response.status_code} {response.text}")
        except Exception as e:
            print(f"Error sending request for {customer['businessName']}: {e}")

if __name__ == "__main__":
    seed_business_customers() 