import fs from "fs/promises";
import dotenv from "dotenv";

dotenv.config();

// Define the shape of your raw JSON customer object.
interface RawBusinessCustomer {
  country: string;
  business_name: string;
  is_tax_registered: boolean;
  tax_number: number | string;
  address: {
    address_1: string;
    address_2: string;
    city: string;
    postal_code: string;
  };
  contacts: Array<{ type: string; value: string | number }>;
}

/**
 * Generate a random business name by combining a random adjective and noun.
 */
function generateRandomBusinessName(): string {
  const adjectives = [
    "Blue", "Happy", "Sunny", "Cold", "Bright", "Golden", "Dynamic", "Rapid",
    "Green", "Creative", "Innovative", "Smart", "Agile", "Efficient", "Modern",
    "Reliable", "Secure", "Global", "Local", "Advanced", "Future", "Digital",
    "Virtual", "Cloud", "Sustainable", "Eco", "Fast", "Quick", "Simple", "Clear",
    "Sharp", "Strong", "Bold", "Vivid", "Pure", "Fresh", "New", "Next", "Prime",
    "Elite", "Ultimate", "Super", "Mega", "Hyper", "Ultra", "Alpha", "Omega",
    "Epic", "Grand", "Royal", "Supreme", "Infinite", "Limitless", "Timeless"
  ];  
  const nouns = [
    "Tech", "Solutions", "Systems", "Industries", "Enterprises", "Group", "Networks", "Dynamics",
    "Works", "Lab", "Labs", "Studio", "Studios", "Agency", "Corp", "Inc", "Co", "Company",
    "Ventures", "Partners", "Holdings", "World", "Global", "Local", "Nation", "Nations",
    "Innovation", "Creation", "Design", "Development", "Engineering", "Consulting", "Services",
    "Management", "Resources", "Capital", "Finance", "Bank", "Trust", "Media", "Marketing",
    "Communications", "Data", "Analytics", "AI", "Cloud", "Software", "Hardware", "Devices",
    "Robotics", "Automation", "Energy", "Power", "Health", "Care", "Life", "Bio", "Pharma",
    "Education", "Academy", "Institute", "School", "University", "Research", "Science", "Art",
    "Culture", "Travel", "Tourism", "Food", "Fitness", "Sports", "Gaming", "Entertainment"
  ];
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${randomAdjective} ${randomNoun}`;
}

// Transform the raw customer to match API expectations.
function transformCustomer(raw: RawBusinessCustomer) {
  // If tax is registered, generate a random 15-digit number; otherwise, set to null.
  const taxNumber = raw.is_tax_registered
    ? String(Math.floor(Math.random() * 9e14 + 1e14))
    : null;

  return {
    country: raw.country,
    // Generate a random business name instead of using the one from JSON.
    businessName: generateRandomBusinessName(),
    isTaxRegistered: raw.is_tax_registered,
    taxNumber: taxNumber,
    address: {
      address1: raw.address.address_1,
      address2: raw.address.address_2,
      city: raw.address.city,
      postalCode: raw.address.postal_code,
    },
    contacts: raw.contacts.map((contact) => ({
      contact_type: contact.type,
      // Note: using 'contact_data' to match the API's expected key.
      contact_data: String(contact.value),
    })),
  };
}

export async function seedBusinessCustomers() {
  let successCount = 0;
  let failedCount = 0;
  let successes: string[] = [];
  let failures: string[] = [];

  try {
    // Read your JSON file (adjust the path if needed)
    const fileContents = await fs.readFile("output.json", "utf-8");
    const rawCustomers: RawBusinessCustomer[] = JSON.parse(fileContents);

    for (const rawCustomer of rawCustomers) {
      const customer = transformCustomer(rawCustomer);

      const res = await fetch("http://localhost:3000/api/customers/business", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Include auth headers or cookies if required by your API.
        },
        body: JSON.stringify(customer),
      });

      const data = await res.json();

      if (data.success) {
        successCount++;
        successes.push(customer.businessName);
        console.log(`Successfully created customer: ${customer.businessName}`);
      } else {
        failedCount++;
        failures.push(customer.businessName);
        console.error(`Error creating ${customer.businessName}:`, data.error);
      }
    }

    return { success: true, successCount, failedCount, successes, failures };
  } catch (error) {
    console.error("Error seeding business customers:", error);
    return { success: false, error: String(error) };
  }
}