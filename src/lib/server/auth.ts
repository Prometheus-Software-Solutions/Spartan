/* ================================================================
Description: Authentication server actions
Author: Noah Huesman

Creation Date: 01/02/2025
Modification History:
#1 (01/02/2025) - Initial creation - Noah Huesman
#2 (01/04/2025) - Added email sending - Noah Huesman
================================================================ */

// ========================================
// DIRECTIVES
// ========================================

"use server"

// ========================================
// IMPORTS
// ========================================

// Auth
import { signIn, signOut, auth } from "@/auth"

// React email
import { render } from "@react-email/render"

// Components
import MagicLink from "@/components/emails/magic-link"

// Logger
import logger from "@/lib/utils/logger"

// ========================================
// LOGIN
// ========================================

export const login = async (
	provider: string,
	redirectPath: string,
	options: {
		email?: string
	} = {}
) => {
	// Destructure options with defaults
	const { email = "" } = options

	// Perform login
	await signIn(
		provider,
		// Option params
		{
			redirectTo: redirectPath, // Redirect path after login
			email, // Optional email to send verification email to
		}
	)
}

// ========================================
// LOGOUT
// ========================================

export const logout = async (redirectPath: string) => {
	// Perform logout
	await signOut({ redirectTo: redirectPath })
}

// ========================================
// GET SESSION
// ========================================

export const getSession = async () => {
	// Get session
	const session = await auth()
	return session
}

// ========================================
// SEND VERIFICATION EMAIL
// ========================================

export const sendVerificationEmail = async (
	from: string,
	to: string,
	url: string
) => {
	// Send verification email
	const res = await fetch("https://api.resend.com/emails", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${process.env.AUTH_RESEND_KEY}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			from: from,
			to: to,
			subject: "Verify your email",
			html: await render(MagicLink({ url })),
		}),
	})

	// Handle errors
	if (!res.ok) {
		// Log and throw error
		logger.error("Failed to send verification email", {
			error: JSON.stringify(await res.json()),
			to,
		})
		throw new Error("Resend error: " + res.status)
	}
}