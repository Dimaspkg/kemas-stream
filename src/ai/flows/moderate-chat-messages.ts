'use server';

/**
 * @fileOverview AI-powered chat message moderation flow.
 *
 * - moderateChatMessage - A function that moderates a single chat message.
 * - ModerateChatMessageInput - The input type for the moderateChatMessage function.
 * - ModerateChatMessageOutput - The return type for the moderateChatMessage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ModerateChatMessageInputSchema = z.object({
  message: z.string().describe('The chat message to moderate.'),
  userId: z.string().describe('The ID of the user sending the message.'),
});
export type ModerateChatMessageInput = z.infer<typeof ModerateChatMessageInputSchema>;

const ModerateChatMessageOutputSchema = z.object({
  isSafe: z.boolean().describe('Whether the message is safe or not.'),
  reason: z.string().describe('The reason why the message was flagged, if applicable.'),
});
export type ModerateChatMessageOutput = z.infer<typeof ModerateChatMessageOutputSchema>;

export async function moderateChatMessage(input: ModerateChatMessageInput): Promise<ModerateChatMessageOutput> {
  return moderateChatMessageFlow(input);
}

const moderateChatMessagePrompt = ai.definePrompt({
  name: 'moderateChatMessagePrompt',
  input: {schema: ModerateChatMessageInputSchema},
  output: {schema: ModerateChatMessageOutputSchema},
  prompt: `You are an AI chat moderator responsible for identifying inappropriate messages.

  Analyze the following chat message and determine if it violates community guidelines.
  Return isSafe as true if the message is appropriate, otherwise return isSafe as false.
  If isSafe is false, provide a reason why the message was flagged.

  Message: "{{message}}"
  User ID: {{userId}}`,
});

const moderateChatMessageFlow = ai.defineFlow(
  {
    name: 'moderateChatMessageFlow',
    inputSchema: ModerateChatMessageInputSchema,
    outputSchema: ModerateChatMessageOutputSchema,
  },
  async input => {
    const {output} = await moderateChatMessagePrompt(input);
    return output!;
  }
);
