'use server';
/**
 * @fileOverview Implements the voice-based subscription creation flow.
 *
 * - createSubscriptionFromVoice - A function that handles the subscription creation process from voice input.
 * - CreateSubscriptionFromVoiceInput - The input type for the createSubscriptionFromVoice function.
 * - CreateSubscriptionFromVoiceOutput - The return type for the createSubscriptionFromVoice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CreateSubscriptionFromVoiceInputSchema = z.object({
  voiceDataUri: z
    .string()
    .describe(
      "A voice recording of the subscription details, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type CreateSubscriptionFromVoiceInput = z.infer<typeof CreateSubscriptionFromVoiceInputSchema>;

const CreateSubscriptionFromVoiceOutputSchema = z.object({
  subscriptionName: z.string().describe('The name of the subscription.'),
  category: z.string().describe('The category of the subscription.'),
  renewalDate: z.string().describe('The renewal date of the subscription (YYYY-MM-DD).'),
  amount: z.number().describe('The amount charged for the subscription.'),
  currency: z.string().describe('The currency of the subscription.'),
});
export type CreateSubscriptionFromVoiceOutput = z.infer<typeof CreateSubscriptionFromVoiceOutputSchema>;

export async function createSubscriptionFromVoice(input: CreateSubscriptionFromVoiceInput): Promise<CreateSubscriptionFromVoiceOutput> {
  return createSubscriptionFromVoiceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'createSubscriptionFromVoicePrompt',
  input: {schema: CreateSubscriptionFromVoiceInputSchema},
  output: {schema: CreateSubscriptionFromVoiceOutputSchema},
  prompt: `You are an AI assistant that extracts subscription details from voice recordings.

  Analyze the following voice recording and extract the subscription name, category, renewal date (YYYY-MM-DD), amount, and currency.

  Voice Recording: {{media url=voiceDataUri}}

  Return the extracted information in JSON format.
  `,
});

const createSubscriptionFromVoiceFlow = ai.defineFlow(
  {
    name: 'createSubscriptionFromVoiceFlow',
    inputSchema: CreateSubscriptionFromVoiceInputSchema,
    outputSchema: CreateSubscriptionFromVoiceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
