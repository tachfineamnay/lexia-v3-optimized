import { z } from "zod"

export const paymentSchema = z.object({
    cardName: z.string().min(2, "Le nom est requis"),
    cardNumber: z.string().min(16, "Numéro de carte invalide"),
    expiry: z.string().regex(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, "Format MM/AA requis"),
    cvc: z.string().length(3, "CVC invalide"),
})

export const loginSchema = z.object({
    email: z.string().email("Email invalide"),
    password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
})
