const z = require('zod');

const messageZod = z.object({
	senderId: z
		.string({
			required_error: 'Sender Id is required'
	}),
    recipientId: z
    .string({
        required_error: 'Recipient Id is required'
    }),
	content: z.string({ required_error: 'Content is required' }),
    delivered: z.boolean()
});

module.exports = {
    messageZod
};