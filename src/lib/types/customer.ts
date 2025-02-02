import { type Customer } from '@/server/db/schema'

export interface EnrichedCustomer extends Customer {
  customerNumber: number
  country: string
  individual?: {
    firstName: string
    middleName?: string | null
    lastName: string
    personalId?: string | null
  } | null
  business?: {
    businessName: string
    taxRegistrationNumber?: string | null
    isTaxRegistered: boolean
  } | null
  contactDetails: Array<{
    contactType: 'email' | 'mobile' | 'landline' | 'other'
    contactData: string
    isPrimary: boolean
  }>
  addresses: Array<{
    address1: string | null
    address2: string | null
    city: string
    country: string
    postalCode: string | null
  }>
} 

export interface CustomerModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
} 