'use server';
/**
 * @fileOverview AI flow for extracting subscription details from invoices.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractSubscriptionFromInvoiceInputSchema = z.object({
  invoiceText: z.string().describe('The raw text from a subscription invoice or email.'),
});

export type ExtractSubscriptionFromInvoiceInput = z.infer<typeof ExtractSubscriptionFromInvoiceInputSchema>;

const ExtractSubscriptionFromInvoiceOutputSchema = z.object({
  subscriptionName: z.string().describe('The name of the service.'),
  amount: z.number().describe('The amount billed.'),
  currency: z.string().describe('The currency symbol or code.'),
  renewalDate: z.string().describe('The estimated renewal or next billing date (YYYY-MM-DD).'),
  category: z.string().describe('The most appropriate category for the service.'),
});

export type ExtractSubscriptionFromInvoiceOutput = z.infer<typeof ExtractSubscriptionFromInvoiceOutputSchema>;

export async function extractSubscriptionFromInvoice(input: ExtractSubscriptionFromInvoiceInput): Promise<ExtractSubscriptionFromInvoiceOutput> {
  return extractSubscriptionFromInvoiceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractSubscriptionFromInvoicePrompt',
  input: {schema: ExtractSubscriptionFromInvoiceInputSchema},
  output: {schema: ExtractSubscriptionFromInvoiceOutputSchema},
  prompt: `You are an AI assistant that extracts subscription details from invoice text.
  
  Analyze the following text and identify:
  - Service/Subscription Name
  - Amount
  - Currency
  - Date of billing or next renewal (Format: YYYY-MM-DD)
  - Suggested category (one of: streaming, fitness, insurance, saas, cloud, mobile, news, other)

  Invoice Text:
  {{invoiceText}}
  `,
});

const extractSubscriptionFromInvoiceFlow = ai.defineFlow(
  {
    name: 'extractSubscriptionFromInvoiceFlow',
    inputSchema: ExtractSubscriptionFromInvoiceInputSchema,
    outputSchema: ExtractSubscriptionFromInvoiceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
