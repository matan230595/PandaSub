
"use server";
/**
 * @fileOverview AI-powered recommendations for duplicate subscriptions and cheaper alternatives, to optimize spending.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SubscriptionRecommendationInputSchema = z.object({
  subscriptionList: z.string().describe('A list of the user\'s subscriptions with details such as name, category, price, and renewal date.'),
});

export type SubscriptionRecommendationInput = z.infer<typeof SubscriptionRecommendationInputSchema>;

const SubscriptionRecommendationOutputSchema = z.object({
  recommendations: z.string().describe('AI-generated recommendations for duplicate subscriptions, cheaper alternatives, and usage pattern analysis.'),
  error: z.string().optional().describe('Error message if the recommendation fails.'),
});

export type SubscriptionRecommendationOutput = z.infer<typeof SubscriptionRecommendationOutputSchema>;

export async function subscriptionRecommendation(input: SubscriptionRecommendationInput): Promise<SubscriptionRecommendationOutput> {
  try {
    return await subscriptionRecommendationFlow(input);
  } catch (error: any) {
    console.error("AI Flow Error:", error);
    return { 
      recommendations: "", 
      error: "מצטערים, חלה שגיאה בחיבור למודול ה-AI. ייתכן שיש עומס על השרת." 
    };
  }
}

const subscriptionRecommendationPrompt = ai.definePrompt({
  name: 'subscriptionRecommendationPrompt',
  input: {schema: SubscriptionRecommendationInputSchema},
  output: {schema: SubscriptionRecommendationOutputSchema},
  prompt: `אתה מומחה פיננסי חכם בשם Panda AI. תפקידך לנתח את רשימת המינויים של המשתמש ולתת המלצות לחיסכון.

הוראות חשובות:
1. התשובה חייבת להיות בעברית רהוטה ומקצועית בלבד.
2. השתמש בעיצוב Markdown נקי: בולטים (•), כותרות מודגשות (**), ורווחים בין פסקאות.
3. אל תשתמש באנגלית אלא אם מדובר בשמות מותגים (כמו Netflix).
4. היה ספציפי לגבי חלופות בשוק הישראלי (למשל סלקום TV מול נטפליקס, או חבילות קוואטרו).
5. וודא שהטקסט מיושר לימין (RTL) במבנה שלו.

נתח את הרשימה הבאה:
{{subscriptionList}}

ספק את ההמלצות בפורמט הבא:
• **זיהוי כפילויות**: האם יש שירותים דומים?
• **חלופות לחיסכון**: חבילות זולות יותר או שירותים מתחרים.
• **ניתוח דחיפות**: המלצות לביטול על בסיס תאריכי חידוש או חוסר שימוש.`,
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
