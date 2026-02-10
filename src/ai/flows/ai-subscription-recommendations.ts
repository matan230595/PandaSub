// This is an AI-powered recommendation system for identifying duplicate/redundant subscriptions, cheaper alternatives, and analyzing usage patterns.
'use server';
/**
 * @fileOverview AI-powered recommendations for duplicate subscriptions and cheaper alternatives, to optimize spending.
 *
 * - SubscriptionRecommendationInput - The input type for the subscriptionRecommendation function.
 * - SubscriptionRecommendationOutput - The return type for the subscriptionRecommendation function.
 * - subscriptionRecommendation - A function that handles the generation of subscription recommendations.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SubscriptionRecommendationInputSchema = z.object({
  subscriptionList: z.string().describe('A list of the user\'s subscriptions with details such as name, category, price, and renewal date.'),
});

export type SubscriptionRecommendationInput = z.infer<typeof SubscriptionRecommendationInputSchema>;

const SubscriptionRecommendationOutputSchema = z.object({
  recommendations: z.string().describe('AI-generated recommendations for duplicate subscriptions, cheaper alternatives, and usage pattern analysis.'),
});

export type SubscriptionRecommendationOutput = z.infer<typeof SubscriptionRecommendationOutputSchema>;

export async function subscriptionRecommendation(input: SubscriptionRecommendationInput): Promise<SubscriptionRecommendationOutput> {
  return subscriptionRecommendationFlow(input);
}

const subscriptionRecommendationPrompt = ai.definePrompt({
  name: 'subscriptionRecommendationPrompt',
  input: {schema: SubscriptionRecommendationInputSchema},
  output: {schema: SubscriptionRecommendationOutputSchema},
  prompt: `Analyze the following list of subscriptions and provide recommendations for identifying duplicate/redundant subscriptions, cheaper alternatives, and usage pattern analysis.

Subscription List:
{{subscriptionList}}`,
});

const subscriptionRecommendationFlow = ai.defineFlow(
  {
    name: 'subscriptionRecommendationFlow',
    inputSchema: SubscriptionRecommendationInputSchema,
    outputSchema: SubscriptionRecommendationOutputSchema,
  },
  async input => {
    const {output} = await subscriptionRecommendationPrompt(input);
    return output!;
  }
);
