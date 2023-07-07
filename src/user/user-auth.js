const z = require('zod');

const registerUserZod = z.object({
	firstName: z
		.string({
			required_error: 'User first name is required'
		})
		.min(3, {
			message: 'User first name must be 3 or more characters long'
		}),
    lastName: z
    .string({
        required_error: 'User last name is required'
    })
    .min(3, {
        message: 'User last name must be 3 or more characters long'
    }),
	email: z.string({ required_error: 'Email is required' }).email(),
	password: z
		.string({
			required_error: 'Password is required'
		})
		.min(8, { message: 'Password must be 8 or more characters long' }),
	confirmPassword: z
		.string({
			required_error: 'Confirm Password is required'
		}),
    isVerified: z.boolean().default(false)
});

const loginUserZod = z.object({
	email: z.string({ required_error: 'Email is required' }).email(),
	password: z
		.string({
			required_error: 'Password is required'
		})
});
const verifyToken = z.object({
	token: z.string({ required_error: 'Token is required' }),
});

const verifyEmailOrId = z.object({
	email: z.string().email().optional(),
    id: z.string().optional(),
});

module.exports = {
    registerUserZod,
    loginUserZod,
    verifyToken,
    verifyEmailOrId
}