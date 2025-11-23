const { GoogleGenerativeAI } = require('@google/generative-ai');
const OpenAI = require('openai');

class AIService {
    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
        this.geminiModel = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
    }

    async generateLivret1(userProfile, documents) {
        const prompt = `
      En tant qu'expert VAE, aidez ce candidat à rédiger son Livret 1 (Recevabilité).
      
      Profil du candidat:
      ${JSON.stringify(userProfile)}
      
      Documents fournis:
      ${documents.map(d => d.name).join(', ')}
      
      Tâche: Rédiger une lettre de motivation convaincante et remplir les sections clés du CERFA.
      Format: JSON structuré avec les champs 'lettre_motivation' et 'sections_cerfa'.
    `;

        return this.generateContent(prompt, 'gpt-4-turbo-preview');
    }

    async generateLivret2(section, userResponses, documents) {
        const prompt = `
      En tant qu'expert VAE, rédigez la section "${section}" du Livret 2.
      
      Réponses du candidat:
      ${JSON.stringify(userResponses)}
      
      Contexte des preuves:
      ${documents.map(d => d.summary).join('\n')}
      
      Consignes:
      1. Utilisez un ton professionnel et "je".
      2. Mettez en valeur les compétences acquises.
      3. Soyez précis et factuel.
    `;

        return this.generateContent(prompt, 'gpt-4-turbo-preview');
    }

    async correctDossier(content) {
        const prompt = `
      Analysez et corrigez ce texte de dossier VAE.
      
      Texte:
      ${content}
      
      Tâche:
      1. Corriger l'orthographe et la grammaire.
      2. Améliorer le style (plus professionnel).
      3. Suggérer des améliorations sur le fond (plus d'impact).
      
      Format: JSON avec 'texte_corrige' et 'suggestions'.
    `;

        return this.generateContent(prompt, 'gpt-4-turbo-preview');
    }

    async generateContent(prompt, model = 'gpt-3.5-turbo') {
        try {
            if (model.includes('gpt')) {
                const completion = await this.openai.chat.completions.create({
                    messages: [{ role: 'user', content: prompt }],
                    model: model,
                    response_format: { type: "json_object" }
                });
                return JSON.parse(completion.choices[0].message.content);
            } else if (model.includes('gemini')) {
                const result = await this.geminiModel.generateContent(prompt);
                const response = await result.response;
                return JSON.parse(response.text());
            }
        } catch (error) {
            console.error('AI Generation Error:', error);
            throw new Error('Erreur lors de la génération IA');
        }
    }
}

module.exports = new AIService();
