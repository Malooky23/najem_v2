import { db } from '../src/lib/db';
import { company, address } from '../src/lib/db/schema';
import companyList from './companyList.json';
// Define the type for company data
type CompanyData = {
    compName: string;
    trn: string;
    address1: string;
    address2: string;
    city: string;
    country: string;
    postalcode: string;
    mobile: string;
    landline: string;
}

async function seedCompanies() {
    console.log('Starting company seeding...');
    
    // const companyList: CompanyData[] = [{
    //     "compName": "AL GUTHMI TRADING",
    //     "trn": "100379074600003",
    //     "address1": "Deira",
    //     "address2": "",
    //     "city": "Dubai",
    //     "country": "United Arab Emirates",
    //     "postalcode": "237876",
    //     "mobile": "",
    //     "landline": ""
    // }];
    
    for (const comp of companyList) {
        try {
            // Create company first
            
            // Create address if it exists and link it to the company
            if (comp.address1 && comp.city && comp.country) {
                const [newAddress] =await db.insert(address).values({
                    address1: comp.address1,
                    address2: comp.address2 || null,
                    city: comp.city,
                    country: comp.country,
                    postalCode: comp.postalcode || null,
                }).returning({ addressId: address.addressId });
            
                 await db.insert(company).values({
                    compName: comp.compName,
                    trn: comp.trn || null,
                    mobile: comp.mobile || null,
                    landline: comp.landline || null,
                    addressId: newAddress.addressId
                });
            }else{
                await db.insert(company).values({
                    compName: comp.compName,
                    trn: comp.trn || null,
                    mobile: comp.mobile || null,
                    landline: comp.landline || null,
                });

            }

            // console.log(`Created company: ${comp.compName}`);
        } catch (error) {
            console.error(`Error creating company ${comp.compName}:`, error);
        }
    }
    
    console.log('Company seeding completed!');
}

// Run the seeding
seedCompanies().catch(console.error);
